import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { anthropic } from "@/lib/ai";
import { вСловаре, переведиКонтент } from "@/lib/content-i18n";
import {
  всеЗаписи,
  перевестиНедостающее,
  сохранитьРучной,
  состояниеАвто,
  строкиКонтента,
  ЦЕЛИ,
} from "@/lib/content-translations";
import { LOCALES, type Locale } from "@/lib/i18n";
import { readContent } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Переводы содержимого в панели: список строк с переводами на каждый
 * язык, откуда перевод (словарь, ИИ, человек), запуск автоперевода и
 * ручная правка.
 */

type Источник = "словарь" | "ии" | "вручную" | null;

export async function GET() {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  const [c, записи] = await Promise.all([readContent(), всеЗаписи()]);
  const строки = строкиКонтента(c).map((ru) => {
    const з = записи[ru];
    const языки = Object.fromEntries(
      ЦЕЛИ.map((l) => {
        const ручной = з?.ручные?.includes(l);
        const источник: Источник = ручной ? "вручную" : з?.п[l] ? "ии" : вСловаре(ru, l) ? "словарь" : null;
        // Перевод из словаря тоже показываем: редактор видит, что там, и
        // может заменить своим.
        const текст = з?.п[l] ?? (источник === "словарь" ? переведиКонтент(ru, l) : "");
        return [l, { текст, источник }];
      }),
    );
    return { ru, языки };
  });
  return NextResponse.json({ включён: Boolean(anthropic()), строки, авто: состояниеАвто() });
}

/** Запустить автоперевод недостающего. Работает в фоне — панель опрашивает GET. */
export async function POST() {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  if (!anthropic()) return NextResponse.json({ error: "off" }, { status: 503 });
  void перевестиНедостающее();
  return NextResponse.json({ авто: состояниеАвто() }, { status: 202 });
}

/** Ручная правка: { ru, locale, text }. Пустой text — убрать перевод. */
export async function PATCH(request: Request) {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const ru = typeof b.ru === "string" ? b.ru.trim() : "";
  const locale = b.locale as Locale;
  const text = typeof b.text === "string" ? b.text : null;
  if (!ru || text === null || locale === "ru" || !LOCALES.includes(locale))
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  // Переводить можно только то, что правда есть в содержимом: иначе
  // запрос мимо формы набивал бы файл чем угодно.
  if (!строкиКонтента(await readContent()).includes(ru))
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  await сохранитьРучной(ru, locale, text);
  return NextResponse.json({ ok: true });
}
