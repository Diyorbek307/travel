import path from "node:path";
import { создатьХранилище } from "./storage";
import { anthropic, jsonИзОтвета, МОДЕЛЬ, текстОтвета, ИМЯ_ЯЗЫКА } from "./ai";
import { вСловаре, type ЖивыеПереводы } from "./content-i18n";
import { LOCALES, type Locale } from "./i18n";
import { readContent } from "./store";
import { каталог } from "./providers";
import type { Content } from "./types";

/**
 * Переводы содержимого, которое завёл редактор.
 *
 * Словарь content-i18n знает только стартовые записи. Всё, что добавили в
 * панели, туристы видели по-русски на любом языке. Теперь недостающие
 * строки переводит Claude (если подключён), а редактор может поправить
 * любой перевод руками — ручной перевод автоперевод уже не трогает.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

/** Перевод одной русской строки: языки, какие правил человек, когда. */
export interface ЗаписьПеревода {
  п: Partial<Record<Locale, string>>;
  ручные?: Locale[];
  когда: string;
}

const хранилище = создатьХранилище<Record<string, ЗаписьПеревода>>(
  path.join(DATA_DIR, "translations.json"),
  () => ({}),
);

/** Языки, на которые переводим: всё, кроме русского оригинала. */
export const ЦЕЛИ = LOCALES.filter((l) => l !== "ru");

/** Поля, где лежат не тексты для туриста, а ссылки, ключи и служебное. */
const НЕ_ТЕКСТ = new Set([
  "id",
  "img",
  "imgs",
  "imageUrl",
  "videoUrl",
  "url",
  "link",
  "phone",
  "email",
  "website",
  "site",
  "status",
  "color",
  "credits",
  "coords",
  "lat",
  "lng",
  "address",
  "audioUrl",
  "src",
]);
const РАЗДЕЛЫ: (keyof Content)[] = [
  "cities",
  "places",
  "hotels",
  "restaurants",
  "routes",
  "events",
  "audio",
  "ads",
];
const КИРИЛЛИЦА = /[А-Яа-яЁё]/;
const МАКС_ДЛИНА = 3000;

/** Все тексты содержимого по-русски, без повторов. */
export function строкиКонтента(c: Content): string[] {
  const все = new Set<string>();
  const обойти = (x: unknown, ключ?: string) => {
    if (ключ && НЕ_ТЕКСТ.has(ключ)) return;
    if (typeof x === "string") {
      const s = x.trim();
      if (s && s.length <= МАКС_ДЛИНА && КИРИЛЛИЦА.test(s)) все.add(s);
    } else if (Array.isArray(x)) x.forEach((y) => обойти(y));
    else if (x && typeof x === "object") for (const [к, v] of Object.entries(x)) обойти(v, к);
  };
  for (const р of РАЗДЕЛЫ) обойти(c[р]);
  return [...все];
}

/**
 * Тексты анкет и туров водителей и гидов: их пишут сами партнёры, чаще
 * по-русски, а читают туристы на своём языке. Имена не переводим —
 * приложение пишет их латиницей само.
 */
export function строкиПартнёров(к: Awaited<ReturnType<typeof каталог>>): string[] {
  const все = new Set<string>();
  const взять = (...x: (string | undefined)[]) => {
    for (const s of x) {
      const т = s?.trim();
      if (т && т.length <= МАКС_ДЛИНА && КИРИЛЛИЦА.test(т)) все.add(т);
    }
  };
  for (const п of [...к.drivers, ...к.guides]) {
    взять(п.city, п.bio, п.car?.color, ...п.cities, ...п.includes, ...(п.specialties ?? []));
  }
  for (const т of к.tours) {
    взять(т.title, т.city, т.summary, т.meetingPoint, ...т.includes, ...т.excludes);
    for (const д of т.program) взять(д.title, д.text);
  }
  return [...все];
}

/** Всё, что турист читает и что может понадобиться перевести. */
export async function строкиДляПеревода(): Promise<string[]> {
  const [c, к] = await Promise.all([readContent(), каталог()]);
  return [...new Set([...строкиКонтента(c), ...строкиПартнёров(к)])];
}

/** Для туристов: только сами переводы. */
export async function живыеПереводы(): Promise<ЖивыеПереводы> {
  const все = await хранилище.read();
  return Object.fromEntries(Object.entries(все).map(([ru, з]) => [ru, з.п]));
}

export async function всеЗаписи(): Promise<Record<string, ЗаписьПеревода>> {
  return хранилище.read();
}

/** Каких языков не хватает строке: нет ни в словаре, ни в живых. */
function недостаёт(ru: string, з: ЗаписьПеревода | undefined): Locale[] {
  return ЦЕЛИ.filter((l) => !з?.п[l] && !вСловаре(ru, l));
}

/** Ручная правка из панели. Пустой текст — убрать перевод этого языка. */
export async function сохранитьРучной(ru: string, язык: Locale, текст: string): Promise<void> {
  const чистый = текст.trim().slice(0, МАКС_ДЛИНА);
  await хранилище.update((все) => {
    const было = все[ru] ?? { п: {}, когда: "" };
    const п = { ...было.п };
    const ручные = new Set(было.ручные ?? []);
    if (чистый) {
      п[язык] = чистый;
      ручные.add(язык);
    } else {
      delete п[язык];
      ручные.delete(язык);
    }
    return [{ ...все, [ru]: { п, ручные: [...ручные], когда: new Date().toISOString() } }, undefined];
  });
}

/* ── Автоперевод ─────────────────────────────────────────────────────── */

export interface СостояниеАвто {
  идёт: boolean;
  переведено: number;
  осталось: number;
  ошибка?: string;
  закончен?: string;
}

let состояние: СостояниеАвто = { идёт: false, переведено: 0, осталось: 0 };
export const состояниеАвто = () => состояние;

/** Сколько строк за раз: длинные описания на девяти языках — много текста. */
const ПАЧКА = 12;
/** Потолок за один запуск — чтобы случайный импорт не съел бюджет разом. */
const ЗА_ЗАПУСК = 300;

async function перевестиПачку(строки: string[]): Promise<Record<string, Partial<Record<Locale, string>>>> {
  const ai = anthropic();
  if (!ai) throw new Error("off");
  const языки = ЦЕЛИ.map((l) => `"${l}" — ${ИМЯ_ЯЗЫКА[l]}`).join(", ");
  const вход = Object.fromEntries(строки.map((s, i) => [String(i + 1), s]));
  const ответ = await ai.messages.create({
    model: МОДЕЛЬ,
    max_tokens: 16000,
    system: `You translate content of HelloUZ, a travel app about Uzbekistan, from Russian for tourists.
Languages: ${языки}.
Rules: natural, concise tourist-friendly wording; keep the meaning exact. Proper names of places, hotels and restaurants — use the established name in that language or transliterate; never invent a different name. Keep numbers, prices, currencies, times, dates, emoji and punctuation style unchanged. Uzbek must be in Latin script.
Reply with JSON only: {"1": {"en": "...", "uz": "...", ...}, "2": {...}} — the same keys as the input, every language for every key.`,
    messages: [{ role: "user", content: JSON.stringify(вход) }],
  });
  const json = jsonИзОтвета<Record<string, Record<string, unknown>>>(текстОтвета(ответ));
  if (!json) throw new Error("bad_json");
  const итог: Record<string, Partial<Record<Locale, string>>> = {};
  строки.forEach((s, i) => {
    const п = json[String(i + 1)];
    if (!п || typeof п !== "object") return;
    const языкиСтроки: Partial<Record<Locale, string>> = {};
    for (const l of ЦЕЛИ) {
      const v = п[l];
      if (typeof v === "string" && v.trim()) языкиСтроки[l] = v.trim().slice(0, МАКС_ДЛИНА);
    }
    итог[s] = языкиСтроки;
  });
  return итог;
}

/**
 * Перевести всё, чего не хватает. Запускается один за раз: второй вызов,
 * пока идёт первый, просто возвращает текущее состояние.
 */
export async function перевестиНедостающее(): Promise<СостояниеАвто> {
  if (состояние.идёт) return состояние;
  if (!anthropic()) return (состояние = { идёт: false, переведено: 0, осталось: 0, ошибка: "off" });

  const [строки, все] = await Promise.all([строкиДляПеревода(), хранилище.read()]);
  const очередь = строки.filter((s) => недостаёт(s, все[s]).length > 0);
  состояние = { идёт: true, переведено: 0, осталось: очередь.length };

  try {
    const сейчас = очередь.slice(0, ЗА_ЗАПУСК);
    for (let i = 0; i < сейчас.length; i += ПАЧКА) {
      const пачка = сейчас.slice(i, i + ПАЧКА);
      const переводы = await перевестиПачку(пачка);
      await хранилище.update((текущие) => {
        const новые = { ...текущие };
        for (const [ru, п] of Object.entries(переводы)) {
          const было = новые[ru] ?? { п: {}, когда: "" };
          const ручные = new Set(было.ручные ?? []);
          // Ручной перевод редактора не перетираем никогда.
          const слито = { ...было.п };
          for (const [l, v] of Object.entries(п) as [Locale, string][]) if (!ручные.has(l)) слито[l] = v;
          новые[ru] = { ...было, п: слито, когда: new Date().toISOString() };
        }
        return [новые, undefined];
      });
      состояние = {
        ...состояние,
        переведено: состояние.переведено + Object.keys(переводы).length,
        осталось: Math.max(0, очередь.length - (i + пачка.length)),
      };
    }
    состояние = { ...состояние, идёт: false, закончен: new Date().toISOString() };
  } catch (e) {
    const текст = e instanceof Error ? e.message : String(e);
    console.error("[translate]", текст);
    состояние = { ...состояние, идёт: false, ошибка: текст === "off" ? "off" : "upstream" };
  }
  return состояние;
}

/**
 * После сохранения в панели: подождать, пока редактор допишет, и
 * перевести новое. Без ключа ничего не делает.
 */
let таймер: ReturnType<typeof setTimeout> | null = null;
export function запланироватьАвтоперевод(): void {
  if (!anthropic()) return;
  if (таймер) clearTimeout(таймер);
  таймер = setTimeout(() => {
    таймер = null;
    void перевестиНедостающее();
  }, 30_000);
}

export { недостаёт as языкиБезПеревода };
