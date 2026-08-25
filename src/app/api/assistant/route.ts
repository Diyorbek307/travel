import { NextResponse } from "next/server";
import { ask } from "@/lib/assistant";
import { aiAvailable, askAi, type AiTurn } from "@/lib/ai";
import { getPoi } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/**
 * AI-помощник туриста (п. 4 ТЗ).
 *
 * Два слоя. Языковая модель понимает свободную фразу и формулирует ответ,
 * но факты берёт только из инструментов, читающих нашу базу. Если ключа нет
 * или сервис недоступен, включается детерминированный разбор из assistant.ts:
 * он отвечает суше, зато работает всегда и без денег.
 *
 * Откат — не аварийный режим, а часть замысла: офлайн-режим из ТЗ требует,
 * чтобы помощник продолжал отвечать без интернета.
 */

/** Сколько предыдущих реплик отдаём модели. */
const HISTORY_LIMIT = 8;

/**
 * Потолок длины реплики. Совпадает с ограничением поля ввода: длинные
 * простыни в чате туриста не встречаются, а счёт за них платим мы.
 */
const MAX_TEXT = 500;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });
  if (text.length > MAX_TEXT) {
    return NextResponse.json({ error: "text_too_long" }, { status: 400 });
  }

  const lang = langFromParam(typeof body.lang === "string" ? body.lang : null);
  const city = typeof body.city === "string" ? body.city : undefined;
  const lat = typeof body.lat === "number" ? body.lat : undefined;
  const lon = typeof body.lon === "number" ? body.lon : undefined;

  const history: AiTurn[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .filter(
          (turn): turn is AiTurn =>
            typeof turn === "object" &&
            turn !== null &&
            "role" in turn &&
            "content" in turn &&
            typeof (turn as AiTurn).content === "string" &&
            ((turn as AiTurn).role === "user" || (turn as AiTurn).role === "assistant"),
        )
        .slice(-HISTORY_LIMIT)
    : [];

  if (aiAvailable()) {
    try {
      const result = await askAi(text, lang, history, { city, lat, lon });

      // Карточки собираются из объектов, которые модель доставала из базы:
      // так под ответом не окажется места, о котором в нём ни слова.
      const pois = result.slugs
        .map((slug) => getPoi(slug, lang))
        .filter((poi): poi is NonNullable<typeof poi> => poi !== null);

      return NextResponse.json({
        intent: "ai",
        message: result.message,
        pois,
        engine: "ai",
      });
    } catch (error) {
      // Молчаливого отказа быть не должно: без записи в журнале сломавшийся
      // ключ выглядел бы как «помощник просто поглупел».
      console.error("[assistant] языковая модель недоступна, откат:", error);
    }
  }

  const reply = ask({ text, lang, city, lat, lon });
  return NextResponse.json({ ...reply, engine: "rules" });
}
