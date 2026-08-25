import { ask } from "@/lib/assistant";
import { aiAvailable, askAiStream, type AiTurn } from "@/lib/ai";
import { cacheKey, checkRate, clientIp, readCache, writeCache } from "@/lib/ai-guard";
import { findCity } from "@/lib/city-names";
import { getPoi, listCities } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";
import type { Poi } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Помощник с потоковой выдачей ответа.
 *
 * Формат — построчный JSON (одна строка на событие), а не Server-Sent Events:
 * ответ читается обычным fetch и не требует EventSource, который не умеет
 * POST. Событий три: `delta` с куском текста, `done` с карточками мест
 * и `error` с причиной отказа.
 *
 * Порядок защит важен: сначала потолок частоты, потом кеш, и только затем
 * обращение к модели. Иначе кешируемый вопрос всё равно съедал бы квоту,
 * а исчерпанная квота — деньги.
 */

const HISTORY_LIMIT = 8;
const MAX_TEXT = 500;

const encoder = new TextEncoder();
const line = (event: string, data: unknown) =>
  encoder.encode(JSON.stringify({ event, data }) + "\n");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "text_required" }, { status: 400 });
  if (text.length > MAX_TEXT) {
    return Response.json({ error: "text_too_long" }, { status: 400 });
  }

  const lang = langFromParam(typeof body.lang === "string" ? body.lang : null);
  const city = typeof body.city === "string" ? body.city : undefined;
  const lat = typeof body.lat === "number" ? body.lat : undefined;
  const lon = typeof body.lon === "number" ? body.lon : undefined;

  const history: AiTurn[] = Array.isArray(body.history)
    ? (body.history as AiTurn[])
        .filter(
          (turn) =>
            turn &&
            typeof turn.content === "string" &&
            (turn.role === "user" || turn.role === "assistant"),
        )
        .slice(-HISTORY_LIMIT)
    : [];

  const rate = checkRate(clientIp(request));
  if (!rate.allowed) {
    return Response.json(
      { error: "rate_limited", retry_after: rate.retryAfter },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  // Личные вопросы не кешируются: «что рядом» у каждого своё, а продолжение
  // разговора зависит от того, что было сказано раньше.
  const personal = lat != null || history.length > 0;
  const spoken = findCity(text, listCities(lang));
  const key = cacheKey(text, lang, spoken ?? city, personal);

  const cached = readCache(key);
  if (cached) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(line("delta", cached.message));
        controller.enqueue(line("done", { pois: cached.pois, engine: "cache" }));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "content-type": "application/x-ndjson; charset=utf-8" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(line(event, data));
        } catch {
          // Читатель отсоединился — досылать нечего.
        }
      };

      let message = "";
      let pois: Poi[] = [];
      let engine = "rules";

      if (aiAvailable()) {
        try {
          const result = await askAiStream(
            text,
            lang,
            history,
            { city, lat, lon },
            (chunk) => {
              message += chunk;
              send("delta", chunk);
            },
          );
          pois = result.slugs
            .map((slug) => getPoi(slug, lang))
            .filter((poi): poi is Poi => poi !== null);
          engine = "ai";
        } catch (error) {
          console.error("[assistant] поток модели прервался, откат:", error);
          message = "";
        }
      }

      if (!message) {
        // Откат отдаётся одним куском: разбор по правилам считается мгновенно,
        // и разбивать его на части ради вида было бы притворством.
        const reply = ask({ text, lang, city, lat, lon });
        message = reply.message;
        pois = reply.pois;
        engine = "rules";
        send("delta", message);
      }

      if (engine !== "rules") writeCache(key, { message, pois });

      send("done", { pois, engine });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      // Отключаем буферизацию у обратного прокси: иначе поток приедет
      // одним куском в самом конце, и вся затея теряет смысл.
      "x-accel-buffering": "no",
    },
  });
}
