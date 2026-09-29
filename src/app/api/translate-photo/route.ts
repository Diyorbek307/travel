import { NextResponse } from "next/server";
import { anthropic, jsonИзОтвета, МОДЕЛЬ, текстОтвета, ИМЯ_ЯЗЫКА } from "@/lib/ai";
import { ipЗапроса, подЛимитом } from "@/lib/rate-limit";
import type { ПереводФото, СтрокаПеревода } from "@/lib/photo-translate";

export const dynamic = "force-dynamic";

/**
 * Переводчик по фото: меню, вывеска, табличка в музее.
 *
 * Турист снимает текст — Claude читает его и переводит на язык туриста, а
 * у блюд ещё и коротко объясняет, что это. Фото никуда не сохраняем:
 * прочитали, перевели, забыли.
 *
 * Без ANTHROPIC_API_KEY отвечает 503 «off», и приложение показывает, что
 * функция скоро заработает.
 */

const В_СУТКИ = Number(process.env.AI_PHOTO_DAILY_LIMIT ?? 200);
const СУТКИ = 24 * 60 * 60 * 1000;
/** Около 3 МБ картинки: телефон ужимает снимок до 1600 пикселей. */
const МАКС_BASE64 = 4_500_000;
const ТИПЫ = ["image/jpeg", "image/png", "image/webp"] as const;
type ТипФото = (typeof ТИПЫ)[number];

type Режим = "translate" | "guide";

function разобрать(body: unknown): { тип: ТипФото; данные: string; язык: string; режим: Режим } | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const язык = typeof b.lang === "string" && ИМЯ_ЯЗЫКА[b.lang] ? b.lang : "en";
  const м =
    typeof b.image === "string"
      ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(b.image)
      : null;
  if (!м || м[2].length > МАКС_BASE64) return null;
  return { тип: м[1] as ТипФото, данные: м[2], язык, режим: b.mode === "guide" ? "guide" : "translate" };
}

const стр = (x: unknown, n: number) => (typeof x === "string" ? x.trim().slice(0, n) : "");

/** Ответ модели приводим к строгому виду: лишнее отрезаем, мусор отбрасываем. */
function очистить(сырой: unknown): ПереводФото | null {
  if (typeof сырой !== "object" || сырой === null) return null;
  const r = сырой as Record<string, unknown>;
  const kind = r.kind === "menu" || r.kind === "sign" ? r.kind : "other";
  const items = (Array.isArray(r.items) ? r.items : []).slice(0, 80).flatMap((x): СтрокаПеревода[] => {
    if (typeof x !== "object" || x === null) return [];
    const i = x as Record<string, unknown>;
    const translation = стр(i.translation, 400);
    if (!translation) return [];
    return [
      {
        original: стр(i.original, 400),
        translation,
        ...(стр(i.note, 300) ? { note: стр(i.note, 300) } : {}),
        ...(стр(i.price, 40) ? { price: стр(i.price, 40) } : {}),
      },
    ];
  });
  return { kind, title: стр(r.title, 120) || undefined, items, summary: стр(r.summary, 600) || undefined };
}

/** Включён ли переводчик — приложение решает, показывать ли плитки. */
export async function GET() {
  return NextResponse.json({ on: Boolean(anthropic()) });
}

/** Подсказка для режима «Фото-гид»: что это за место и чем оно интересно. */
const гид = (
  язык: string,
) => `You are a friendly tour guide in Uzbekistan. The tourist photographed something: a monument, building, mosaic, dish, object or scene.
Reply in ${язык} with JSON only:
{"kind":"other","title":"what this is — name of the place or object","items":[],"summary":"3–6 sentences: what it is, its story and one interesting detail to look for; practical tip if useful"}
If you are not sure what exactly it is, say so honestly and describe what you can see — never invent a name or facts.`;

const переводчик = (
  язык: string,
) => `You help tourists in Uzbekistan read text on photos: restaurant menus, signs, museum plaques, notices. Text may be in Uzbek (Latin or Cyrillic), Russian, Karakalpak, Tajik or English.
Translate into ${язык}. Reply with JSON only:
{"kind":"menu"|"sign"|"other","title":"short title of what this is","items":[{"original":"text as written","translation":"translation","note":"for dishes: one short sentence what it is made of; otherwise omit","price":"price as written, if any"}],"summary":"one or two sentences: what the photo says overall, useful advice if any"}
For a menu, list every dish in order. If there is no readable text, return {"kind":"other","items":[],"summary":"explain briefly in ${язык}"}. Never invent text that is not on the photo.`;

export async function POST(request: Request) {
  const ai = anthropic();
  if (!ai) return NextResponse.json({ error: "off" }, { status: 503 });

  if (!подЛимитом(`photo:${ipЗапроса(request)}`, 10, 10 * 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const запрос = разобрать(body);
  if (!запрос) return NextResponse.json({ error: "bad_image" }, { status: 400 });

  if (!подЛимитом("photo:all", В_СУТКИ, СУТКИ))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  const язык = ИМЯ_ЯЗЫКА[запрос.язык];
  try {
    const ответ = await ai.messages.create({
      model: МОДЕЛЬ,
      max_tokens: 4000,
      system: запрос.режим === "guide" ? гид(язык) : переводчик(язык),
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: запрос.тип, data: запрос.данные } },
            {
              type: "text",
              text: запрос.режим === "guide" ? `Tell me about this, in ${язык}.` : `Translate into ${язык}.`,
            },
          ],
        },
      ],
    });
    const итог = очистить(jsonИзОтвета(текстОтвета(ответ)));
    if (!итог) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json(итог);
  } catch (e) {
    console.error("[translate-photo]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
