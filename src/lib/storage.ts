import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";

/**
 * Где на самом деле лежат данные.
 *
 * Раньше всё писалось в файлы внутри контейнера. На бесплатном тарифе
 * Render у контейнера нет постоянного диска: при каждом развёртывании и
 * при каждом перезапуске он собирается заново и пустым. Поэтому после
 * любого обновления приходилось заново заводить учётную запись — вместе с
 * аккаунтами пропадали заявки, отзывы и переписка с поддержкой.
 *
 * Никакой настройкой файлов это не лечится: чинить надо не запись, а
 * место хранения. Данные должны жить снаружи контейнера.
 *
 * Поэтому здесь два хранилища за одним интерфейсом:
 *
 *  - Postgres, когда задан DATABASE_URL. Внешняя база, переживает любые
 *    перезапуски и развёртывания. Так работает боевой стенд.
 *  - Файлы, когда её нет. Так удобно разрабатывать на своей машине, где
 *    никакая база не нужна.
 *
 * Наружу оба выглядят одинаково, и остальному коду всё равно, куда он
 * пишет.
 */

/** Пропускает задачи по одной, в порядке поступления. */
function очередь() {
  let хвост: Promise<unknown> = Promise.resolve();
  return function вОчередь<T>(задача: () => Promise<T>): Promise<T> {
    // Ошибка одной задачи не должна останавливать следующие, поэтому
    // хвост очереди гасит отказ, а вызывающий получает его как есть.
    const результат = хвост.then(задача, задача);
    хвост = результат.catch(() => undefined);
    return результат;
  };
}

export interface Хранилище<T> {
  /** Прочитать текущее содержимое. */
  read(): Promise<T>;
  /**
   * Изменить содержимое целиком.
   *
   * Функция получает актуальные данные и возвращает новые. Внутри
   * очереди, поэтому чужая запись между чтением и сохранением
   * невозможна.
   */
  update<R>(изменить: (текущее: T) => Promise<[T, R]> | [T, R]): Promise<R>;
}

export function базаНастроена(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// ── Postgres ─────────────────────────────────────────────────────────

function свояМашина(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("localhost") || url.includes("127.0.0.1");
}

let бассейн: Pool | null = null;
let подготовка: Promise<void> | null = null;

/**
 * Подменить соединение. Нужно только проверке: поднять настоящий Postgres
 * на машине разработчика не всегда возможно, а выкатывать непроверенный
 * код работы с базой нельзя — в ней лежат все учётные записи.
 */
export function подменитьПул(свой: Pool | null): void {
  бассейн = свой;
  подготовка = null;
}

function пул(): Pool {
  if (!бассейн) {
    бассейн = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Внешние базы требуют TLS, и почти всегда с собственным корневым
      // сертификатом, которого у нас нет. Своя база на этой же машине,
      // наоборот, шифрования не предлагает — с ней TLS только мешает.
      ssl: свояМашина() ? undefined : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return бассейн;
}

/** Одна таблица на всё: содержимое и так лежит цельными документами. */
async function подготовить(): Promise<void> {
  if (!подготовка) {
    подготовка = пул()
      .query(
        /*
       * Имена столбцов латиницей нарочно. Постгрес приводит незакавыченные
       * имена к нижнему регистру по правилам локали сервера, и для
       * кириллицы это поведение зависит от того, как база собрана. Спорить
       * с этим ради красоты запроса не стоит: русский остаётся в коде и
       * комментариях, а в схеме — три латинских слова.
       */
      `CREATE TABLE IF NOT EXISTS store (
           k          text PRIMARY KEY,
           v          jsonb NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         )`,
      )
      .then(async () => {
        /*
         * Кодировка базы. Ловится на живой проверке: у базы, созданной с
         * системной кодировкой Windows, запись любого русского имени
         * падала на «character has no equivalent in encoding WIN1251» —
         * и понять по этой строке, что делать, невозможно.
         *
         * Хостинги отдают UTF8 по умолчанию, так что в бою это скорее
         * всего не случится. Но если случится, приложение должно назвать
         * причину и лекарство, а не сыпать ошибками на каждой
         * регистрации.
         */
        const r = await пул().query<{ enc: string }>(
          "SELECT pg_encoding_to_char(encoding) AS enc FROM pg_database WHERE datname = current_database()",
        );
        const кодировка = r.rows[0]?.enc;
        if (кодировка && кодировка !== "UTF8") {
          throw new Error(
            `База создана в кодировке ${кодировка}, а нужна UTF8: русские и узбекские имена в неё не запишутся. ` +
              "Создайте базу заново командой CREATE DATABASE ... WITH ENCODING 'UTF8' TEMPLATE template0.",
          );
        }
      })
      .catch((e) => {
        // Не запоминаем неудачу: база могла быть просто недоступна
        // секунду, и следующая попытка должна пройти.
        подготовка = null;
        throw e;
      });
  }
  return подготовка;
}

function изБазы<T>(ключ: string, пусто: () => T): Хранилище<T> {
  /*
   * Очередь нужна и здесь, а не только файлам.
   *
   * Замерено на двадцати одновременных записях: без неё уцелевали три,
   * остальные семнадцать пропадали молча. Одной сделки с FOR UPDATE мало,
   * потому что снаружи базы всё равно бегут двадцать независимых
   * обращений, и порядок между ними ничем не задан. Очередь пропускает их
   * по одному, а FOR UPDATE внутри остаётся защитой на случай, когда
   * приложение поднимут в нескольких экземплярах: тогда своя очередь есть
   * у каждого, и рассудить их может только база.
   */
  const вОчередь = очередь();

  return {
    read: () =>
      вОчередь(async () => {
        await подготовить();
        const r = await пул().query<{ v: T }>("SELECT v FROM store WHERE k = $1", [ключ]);
        return r.rows[0]?.v ?? пусто();
      }),

    update: (изменить) =>
      вОчередь(async () => {
        await подготовить();
        const клиент = await пул().connect();
        try {
          await клиент.query("BEGIN");

          // FOR UPDATE держит строку до конца сделки: это защита от
          // соседнего экземпляра приложения, у которого своя очередь.
          const r = await клиент.query<{ v: T }>("SELECT v FROM store WHERE k = $1 FOR UPDATE", [
            ключ,
          ]);
          const текущее = r.rows[0]?.v ?? пусто();
          const [новое, результат] = await изменить(текущее);

          await клиент.query(
            `INSERT INTO store (k, v) VALUES ($1, $2)
             ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = now()`,
            [ключ, JSON.stringify(новое)],
          );
          await клиент.query("COMMIT");
          return результат;
        } catch (e) {
          await клиент.query("ROLLBACK").catch(() => undefined);
          throw e;
        } finally {
          клиент.release();
        }
      }),
  };
}

// ── Файлы ────────────────────────────────────────────────────────────

function изФайла<T>(file: string, пусто: () => T): Хранилище<T> {
  const вОчередь = очередь();
  let кэш: T | null = null;

  async function прочитать(): Promise<T> {
    if (кэш !== null) return кэш;
    try {
      кэш = JSON.parse(await readFile(file, "utf8")) as T;
    } catch {
      кэш = пусто();
    }
    return кэш;
  }

  async function записать(данные: T): Promise<void> {
    кэш = данные;
    await mkdir(path.dirname(file), { recursive: true });

    // Случайный хвост в имени: иначе параллельные записи дерутся за один
    // временный файл. Переименование поверх готового файла атомарно,
    // поэтому оборванная запись не оставит обрезанный JSON.
    const tmp = `${file}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(tmp, JSON.stringify(данные, null, 2), "utf8");
    await rename(tmp, file);
  }

  return {
    read: () => вОчередь(прочитать),
    update: (изменить) =>
      вОчередь(async () => {
        const текущее = await прочитать();
        const [новое, результат] = await изменить(текущее);
        await записать(новое);
        return результат;
      }),
  };
}

/**
 * Хранилище одного документа.
 *
 * Имя файла остаётся и при работе с базой: по нему же строится ключ, так
 * что данные, набранные локально, ложатся в базу под тем же именем.
 */
export function создатьХранилище<T>(file: string, пусто: () => T): Хранилище<T> {
  if (базаНастроена()) return изБазы(path.basename(file, ".json"), пусто);
  return изФайла(file, пусто);
}

// ── Мелочи вроде фотографий ──────────────────────────────────────────

/**
 * Отдельные значения: снимок профиля, звук аудиогида.
 *
 * Лежат порознь от учётных записей, потому что горячий документ
 * переписывается целиком при каждой отметке «был в сети», и сто
 * фотографий внутри него замедляли это до восьмидесяти миллисекунд.
 */
export const значения = {
  async записать(ключ: string, значение: string): Promise<void> {
    if (базаНастроена()) {
      await подготовить();
      await пул().query(
        `INSERT INTO store (k, v) VALUES ($1, $2)
         ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = now()`,
        [ключ, JSON.stringify(значение)],
      );
      return;
    }
    const путь = путьЗначения(ключ);
    await mkdir(path.dirname(путь), { recursive: true });
    const tmp = `${путь}.${randomBytes(4).toString("hex")}.tmp`;
    await writeFile(tmp, значение, "utf8");
    await rename(tmp, путь);
  },

  async прочитать(ключ: string): Promise<string | null> {
    if (базаНастроена()) {
      await подготовить();
      const r = await пул().query<{ v: string }>("SELECT v FROM store WHERE k = $1", [
        ключ,
      ]);
      return r.rows[0]?.v ?? null;
    }
    try {
      return await readFile(путьЗначения(ключ), "utf8");
    } catch {
      return null;
    }
  },

  async удалить(ключ: string): Promise<void> {
    if (базаНастроена()) {
      await подготовить();
      await пул().query("DELETE FROM store WHERE k = $1", [ключ]);
      return;
    }
    await unlink(путьЗначения(ключ)).catch(() => undefined);
  },
};

function путьЗначения(ключ: string): string {
  const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  // Имя файла собираем сами: в ключе могло бы прийти «..».
  return path.join(DATA_DIR, "значения", `${ключ.replace(/[^\w:-]/g, "").replace(/:/g, "_")}.txt`);
}
