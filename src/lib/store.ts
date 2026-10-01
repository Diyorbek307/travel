import path from "node:path";
import { SEED, ПОЗДНИЕ_СЕМЕНА } from "@/data/seed";
import { ФОТО_ГОРОДОВ } from "@/data/content";
import { создатьХранилище } from "./storage";
import type { Content, ContentKey } from "@/lib/types";

/**
 * Хранилище содержимого платформы.
 *
 * Один файл JSON: объём — сотни записей, и городить ради этого базу
 * незачем. Пока файла нет, отдаются семена, поэтому пустой развёрнутый
 * экземпляр сразу выглядит наполненным.
 *
 * Запись идёт через общую очередь: два редактора, нажавшие «Сохранить»
 * одновременно, иначе затёрли бы правки друг друга.
 *
 * О сохранности заботится storage.ts: при заданном DATABASE_URL всё
 * ложится во внешнюю базу и переживает перезапуски, иначе — в файлы, что
 * годится только для своей машины.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "content.json");

/**
 * Что лежит в хранилище: сохранённые разделы и список поздних семян,
 * которые редактор уже видел в панели (см. ПОЗДНИЕ_СЕМЕНА в семенах).
 */
type Сохранённое = Partial<Content> & { учтённыеСемена?: string[] };

const хранилище = создатьХранилище<Сохранённое>(FILE, () => ({}));

type Записи = { id: string }[];

export async function readContent(): Promise<Content> {
  const { учтённыеСемена = [], ...сохранено } = await хранилище.read();
  // Семена подкладываются снизу: если в сохранённом файле не хватает
  // раздела, добавленного позже, он не окажется пустым.
  const итог: Content = { ...SEED, ...сохранено };

  /*
   * Поздние семена досыпаем к сохранённому разделу, пока редактор их не
   * видел. Увидел и сохранил раздел — они уже лежат в нём сами, а
   * удалённые им больше не возвращаются: их id записан в учтённых.
   */
  const учтены = new Set(учтённыеСемена);
  for (const [ключ, ids] of Object.entries(ПОЗДНИЕ_СЕМЕНА) as [ContentKey, string[]][]) {
    const список = сохранено[ключ] as Записи | undefined;
    if (!список) continue;
    const есть = new Set(список.map((x) => x.id));
    const добавить = (SEED[ключ] as Записи).filter(
      (x) => ids.includes(x.id) && !есть.has(x.id) && !учтены.has(x.id),
    );
    if (добавить.length) (итог as Record<ContentKey, Записи>)[ключ] = [...список, ...добавить];
  }
  return исправитьФото(дополнитьПодробности(итог));
}

/*
 * Подробности карточек (меню, залы, столы, билеты, «Полезно знать»,
 * галереи) появились в семенах позже, чем разделы сохранили в панели.
 * Сохранённая запись о них не знает, и без досыпки карточка на сайте
 * так и осталась бы пустой.
 *
 * Досыпаем только в записи из семян и только в поля, которых у записи
 * нет. Всё, что редактор хоть раз сохранил, — даже пустой список —
 * остаётся как есть: «убрал меню» значит убрал.
 */
const ПОДРОБНОСТИ = {
  hotels: ["facts"],
  restaurants: ["menu", "zones", "tables", "avgCheck", "imgs", "facts"],
  places: ["tickets", "facts", "imgs"],
} as const;

function дополнитьПодробности(содержимое: Content): Content {
  const итог = { ...содержимое };
  for (const [ключ, поля] of Object.entries(ПОДРОБНОСТИ) as [keyof typeof ПОДРОБНОСТИ, readonly string[]][]) {
    const семена = new Map((SEED[ключ] as Записи).map((x) => [x.id, x as Record<string, unknown>]));
    (итог as Record<string, unknown>)[ключ] = (содержимое[ключ] as Записи).map((запись) => {
      const семя = семена.get(запись.id);
      if (!семя) return запись;
      const r = запись as Record<string, unknown>;
      const добавка: Record<string, unknown> = {};
      for (const поле of поля)
        if (r[поле] === undefined && семя[поле] !== undefined) добавка[поле] = семя[поле];
      // Галерея и номера гостиницы были в данных и раньше — меняем их,
      // только если это нетронутая старая заготовка.
      // Обложка-пицца из первых данных: редактор её не менял — меняем мы.
      if (ключ === "restaurants" && typeof r.img === "string" && r.img.includes("photo-1565299624946"))
        добавка.img = семя.img;
      if (ключ === "hotels") {
        if (старыеНомера(r)) добавка.roomTypes = семя.roomTypes;
        // Старая галерея — начало новой: её никто не правил.
        const было = r.imgs as string[] | undefined;
        const стало = семя.imgs as string[];
        if (!было || (было.length < стало.length && было.every((x, i) => x === стало[i])))
          добавка.imgs = стало;
      }
      return Object.keys(добавка).length ? { ...запись, ...добавка } : запись;
    });
  }
  return итог;
}

/*
 * Снимок Кальта-Минора из Хивы (Unsplash 1728281711729) в первых данных
 * стоял заглушкой у мест и городов, где этого минарета нет: Чарвак,
 * Наманган, Гулистан, Миздахкан, Ахсикент, Фаяз-тепа, гастрофест плова.
 * Меняем только его — фото, выбранное в панели, не трогаем; у самой
 * Хивы он верный, её в списке нет. Новые снимки лежат в public/scenic,
 * все с Wikimedia Commons; CC0 и общественное достояние, кроме Ахсикента
 * (CC BY-SA — с подписью автора).
 */
const ЧУЖОЙ_МИНАРЕТ = "photo-1728281711729";
const ВЕРНЫЕ_ФОТО: { раздел: "places" | "cities" | "events"; кто: RegExp; img: string; credits?: string }[] = [
  { раздел: "places", кто: /(^|-)chrvk$/, img: "/scenic/charvak-1.webp" },
  { раздел: "places", кто: /(^|-)xmizd$/, img: "/scenic/mizdakhan-1.webp" },
  {
    раздел: "places",
    кто: /(^|-)xakhs$/,
    img: "/scenic/akhsikent-1.webp",
    credits: "Фото: Ziqo — Wikimedia Commons, CC BY-SA 4.0",
  },
  { раздел: "places", кто: /(^|-)xfaya$/, img: "/scenic/fayaz-1.webp" },
  { раздел: "events", кто: /Плов/, img: "/scenic/plov-1.webp" },
];

export function исправитьФото(содержимое: Content): Content {
  const итог = { ...содержимое } as Record<string, unknown>;
  for (const правка of ВЕРНЫЕ_ФОТО) {
    const список = итог[правка.раздел] as Record<string, unknown>[] | undefined;
    if (!Array.isArray(список)) continue;
    итог[правка.раздел] = список.map((запись) => {
      // Места узнаём по id, города и события — по названию.
      const ключ = String(правка.раздел === "places" ? запись.id : запись.name);
      if (!правка.кто.test(ключ)) return запись;
      const чужое = (x: unknown) => typeof x === "string" && x.includes(ЧУЖОЙ_МИНАРЕТ);
      if (!чужое(запись.img) && !(Array.isArray(запись.imgs) && запись.imgs.some(чужое))) return запись;
      const копия = { ...запись };
      if (чужое(копия.img)) копия.img = правка.img;
      if (Array.isArray(копия.imgs)) копия.imgs = копия.imgs.map((x) => (чужое(x) ? правка.img : x));
      if (правка.credits && !копия.credits) копия.credits = правка.credits;
      return копия;
    });
  }
  // Города: своё фото вместо доставшегося по кругу снимка другого города.
  const чужиеГорода = ["1664602078796", "1653023102302", "1654861857666", ЧУЖОЙ_МИНАРЕТ];
  const города = итог.cities as Record<string, unknown>[] | undefined;
  if (Array.isArray(города)) {
    итог.cities = города.map((г) => {
      const своё = ФОТО_ГОРОДОВ[String(г.name)];
      const img = String(г.img ?? "");
      return своё && чужиеГорода.some((id) => img.includes(id)) ? { ...г, img: своё } : г;
    });
  }
  return итог as unknown as Content;
}

/** Номера из первой заготовки: без фото и названий, id вида «гостиница-категория». */
function старыеНомера(r: Record<string, unknown>): boolean {
  const номера = r.roomTypes as { id: string; name?: string; imgs?: string[]; img?: string }[] | undefined;
  if (номера === undefined) return true;
  return (
    номера.length > 0 &&
    номера.every((н) => н.id.startsWith(`${r.id}-`) && !н.name && !н.imgs?.length && !н.img)
  );
}

/**
 * Сохранить присланные разделы.
 *
 * Слияние идёт внутри очереди хранилища. Прочитай мы документ снаружи,
 * как раньше, два редактора, сохранившие разные разделы одновременно,
 * затёрли бы правку друг друга: каждый писал бы свою старую копию
 * остального. Заодно в хранилище ложится только то, что правили, а
 * нетронутые разделы продолжают браться из семян.
 */
export async function patchContent(разделы: Partial<Content>): Promise<void> {
  // Сохраняемый раздел панель брала из readContent — с досыпанными
  // поздними семенами. Отмечаем их учтёнными: дальше раздел в базе полон,
  // и удалённое редактором не вернётся.
  const новые = (Object.keys(разделы) as ContentKey[]).flatMap((k) => ПОЗДНИЕ_СЕМЕНА[k] ?? []);
  await хранилище.update((сохранено) => [
    {
      ...сохранено,
      ...разделы,
      учтённыеСемена: [...new Set([...(сохранено.учтённыеСемена ?? []), ...новые])],
    },
    undefined,
  ]);
}

/**
 * Запись по id в указанных разделах — для проверки того, что прислал
 * клиент. Отзыв или бронь на выдуманный id раньше принимались и
 * засоряли модерацию; название тоже брали из запроса, а не из данных.
 */
export async function записьПоId(
  id: string,
  разделы: ContentKey[],
): Promise<{ id: string; name?: string; title?: string } | null> {
  if (!id) return null;
  const содержимое = await readContent();
  for (const р of разделы) {
    const найдено = (содержимое[р] as { id: string; name?: string; title?: string }[]).find(
      (x) => x.id === id,
    );
    if (найдено) return найдено;
  }
  return null;
}
