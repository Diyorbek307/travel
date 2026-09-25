import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { readContent } from "@/lib/store";
import { ipЗапроса, подЛимитом } from "@/lib/rate-limit";
import type { Content } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * AI-гид на Claude.
 *
 * Включается переменной ANTHROPIC_API_KEY. Без неё маршрут отвечает 503,
 * и приложение молча остаётся на заготовленных ответах — ничего не
 * ломается, просто гид скромнее.
 *
 * Гид знает ровно то, что лежит в панели: места, отели, рестораны и
 * события уходят ему в системную подсказку. Поэтому он советует то, что
 * турист тут же найдёт в приложении, а не выдуманные заведения.
 */

const МОДЕЛЬ = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
/** Потолок запросов в сутки на весь сервис — чтобы счёт не улетел. */
const В_СУТКИ = Number(process.env.AI_DAILY_LIMIT ?? 500);
const СУТКИ = 24 * 60 * 60 * 1000;

const МАКС_СООБЩЕНИЙ = 12;
const МАКС_ДЛИНА = 1000;

type Реплика = { role: "user" | "ai"; text: string };

let клиент: Anthropic | null = null;
function anthropic(): Anthropic | null {
  const ключ = process.env.ANTHROPIC_API_KEY;
  if (!ключ) return null;
  клиент ??= new Anthropic({ apiKey: ключ });
  return клиент;
}

/** Показываем гиду только то, что видно туристу. */
function справочник(c: Content): string {
  const строки: string[] = [];
  const видно = (s: string) => s === "active" || s === "seasonal" || s === "upcoming";

  строки.push("ГОРОДА:");
  for (const г of c.cities.filter((x) => видно(x.status)))
    строки.push(`- ${г.name} (${г.region}): ${г.description}`);

  строки.push("\nМЕСТА:");
  for (const м of c.places.filter((x) => видно(x.status)))
    строки.push(`- ${м.name} — ${м.city}, ${м.type}; вход ${м.entry}; часы ${м.hours}. ${м.desc}`);

  строки.push("\nОТЕЛИ:");
  for (const о of c.hotels.filter((x) => видно(x.status)))
    строки.push(`- ${о.name} — ${о.city}, от ${о.price} за ночь, ${о.stars}★. ${о.desc}`);

  строки.push("\nРЕСТОРАНЫ:");
  for (const р of c.restaurants.filter((x) => видно(x.status)))
    строки.push(`- ${р.name} — ${р.city}, ${р.cuisine}, ${р.price}, ${р.open}. ${р.desc}`);

  строки.push("\nСОБЫТИЯ:");
  for (const с of c.events.filter((x) => видно(x.status)))
    строки.push(`- ${с.name} — ${с.city}, ${с.date}${с.endDate ? `–${с.endDate}` : ""}, ${с.venue}. ${с.desc}`);

  return строки.join("\n");
}

function подсказка(c: Content): string {
  return `Ты — гид приложения HelloUZ по Узбекистану. Отвечай коротко и по делу: 2–6 предложений или короткий список, можно пару эмодзи.

Отвечай на языке последнего сообщения туриста.

Когда советуешь места, отели, рестораны или события — бери их из справочника ниже: турист найдёт их в приложении. Если в справочнике нужного нет, можешь рассказать общеизвестное об Узбекистане, но не придумывай названия заведений, цены, телефоны и часы работы. Не знаешь — так и скажи.

Курс валют не называй: он меняется, пусть турист смотрит конвертер в профиле. Бронировать гид не умеет — подскажи, что отель или стол бронируются на их странице в приложении. При угрозе жизни — сразу номер 112 и кнопка SOS в приложении.

СПРАВОЧНИК ПРИЛОЖЕНИЯ
${справочник(c)}`;
}

/** Разбираем историю из запроса и не пропускаем лишнего. */
function разобрать(body: unknown): Реплика[] | null {
  if (typeof body !== "object" || body === null) return null;
  const сырые = (body as { messages?: unknown }).messages;
  if (!Array.isArray(сырые)) return null;

  const реплики: Реплика[] = [];
  for (const m of сырые.slice(-МАКС_СООБЩЕНИЙ)) {
    if (typeof m !== "object" || m === null) return null;
    const { role, text } = m as { role?: unknown; text?: unknown };
    if ((role !== "user" && role !== "ai") || typeof text !== "string") return null;
    const t = text.trim().slice(0, МАКС_ДЛИНА);
    if (t) реплики.push({ role, text: t });
  }

  // Разговор с моделью начинается с туриста: приветствие гида отбрасываем.
  while (реплики.length && реплики[0].role === "ai") реплики.shift();
  if (!реплики.length || реплики[реплики.length - 1].role !== "user") return null;
  return реплики;
}

export async function POST(request: Request) {
  const ai = anthropic();
  if (!ai) return NextResponse.json({ error: "off" }, { status: 503 });

  if (!подЛимитом(`guide:${ipЗапроса(request)}`, 20, 10 * 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const реплики = разобрать(body);
  if (!реплики) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  // Общий потолок считаем после проверки запроса: мусор не должен
  // съедать суточный запас.
  if (!подЛимитом("guide:all", В_СУТКИ, СУТКИ))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  try {
    const ответ = await ai.messages.create({
      model: МОДЕЛЬ,
      max_tokens: 700,
      // Справочник одинаков для всех, поэтому кешируем его: повторные
      // вопросы стоят в разы дешевле.
      system: [{ type: "text", text: подсказка(await readContent()), cache_control: { type: "ephemeral" } }],
      messages: реплики.map((r) => ({ role: r.role === "ai" ? "assistant" : "user", content: r.text })),
    });
    const текст = ответ.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("\n")
      .trim();
    if (!текст) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json({ text: текст });
  } catch (e) {
    console.error("[guide]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
