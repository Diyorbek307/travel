import { after, NextResponse } from "next/server";
import { addSupportMessage, getThread, updateThread } from "@/lib/community";
import { currentUser } from "@/lib/session";
import { подЛимитом } from "@/lib/rate-limit";
import { anthropic } from "@/lib/ai";
import {
  addBug,
  видимые,
  задержкаОтвета,
  имяПомощника,
  ответПомощника,
  печатает,
  случайныйПомощник,
} from "@/lib/support-desk";
import { LOCALES } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/** Потолок ответов ИИ в сутки на весь сервис — чтобы счёт не улетел. */
const В_СУТКИ = Number(process.env.SUPPORT_AI_DAILY_LIMIT ?? 1000);
const СУТКИ = 24 * 60 * 60 * 1000;
/** Ждём, не допишет ли человек ещё строчку, — отвечаем на всё сразу. */
const ДОПИСЫВАЕТ_МС = 2500;

function язык(v: unknown): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "en";
}

/** Переписка вошедшего с поддержкой. */
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const lang = язык(new URL(request.url).searchParams.get("lang"));
  const ветка = await getThread(user.id);
  return NextResponse.json(
    {
      messages: видимые(ветка?.messages ?? []).map((m) => ({
        ...m,
        // Имя помощника — на языке человека; ключ наружу не нужен.
        name: m.author === "ai" ? имяПомощника(m.name, lang) : m.name,
      })),
      typing: печатает(ветка),
      mode: ветка?.mode ?? "ai",
      needsHuman: Boolean(ветка?.needsHuman),
      // Без ключа ИИ отвечают только люди — экран так и пишет.
      ai: anthropic() !== null,
      agent: имяПомощника(ветка?.agent, lang),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!подЛимитом(`support:${user.id}`, 20, 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const lang = язык(body.lang);

  // «Позвать человека» — кнопкой, без всякого ИИ.
  if (body.handoff === true) {
    // Просьба видна оператору в переписке как обычное сообщение.
    const просьба = typeof body.text === "string" ? body.text.trim().slice(0, 200) : "";
    await addSupportMessage(user.id, "user", просьба || "👤");
    await updateThread(user.id, { mode: "human", needsHuman: true, aiPendingSince: null });
    return NextResponse.json({ ok: true });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "text_too_long" }, { status: 400 });

  const сообщение = await addSupportMessage(user.id, "user", text);
  const ветка = await getThread(user.id);
  if (!ветка) return NextResponse.json({ ok: true, message: сообщение });

  // Отвечает ли ИИ: ключ есть, оператор переписку не забирал, суточный запас не выбран.
  // Оценка приложения из профиля — не вопрос, отвечать на неё нечего.
  const отвечаетИИ =
    body.rating !== true &&
    anthropic() !== null && (ветка.mode ?? "ai") === "ai" && подЛимитом("support-ai:all", В_СУТКИ, СУТКИ);
  if (!отвечаетИИ) return NextResponse.json({ ok: true, message: сообщение });

  await updateThread(user.id, {
    agent: ветка.agent ?? случайныйПомощник(),
    aiPendingSince: new Date().toISOString(),
  });
  const устройство = request.headers.get("user-agent") ?? "";
  const пауза = задержкаОтвета(text.length);
  const начало = Date.now();

  // Отвечаем после ответа на запрос: человек не ждёт, пока думает модель.
  after(async () => {
    await new Promise((r) => setTimeout(r, ДОПИСЫВАЕТ_МС));
    const свежая = await getThread(user.id);
    if (!свежая || (свежая.mode ?? "ai") !== "ai") return;
    // Человек успел написать ещё — ответит обработка последнего сообщения.
    const последнее = [...свежая.messages].reverse().find((m) => m.author === "user");
    if (последнее && последнее.id !== сообщение.id) return;

    const ответ = await ответПомощника(свежая, lang);
    if (!ответ) {
      await updateThread(user.id, { aiPendingSince: null });
      return;
    }
    const показать = new Date(Math.max(Date.now(), начало + пауза)).toISOString();
    await addSupportMessage(user.id, "ai", ответ.reply, { name: свежая.agent, showAt: показать });
    if (ответ.handoff) await updateThread(user.id, { mode: "human", needsHuman: true });
    if (ответ.bug)
      await addBug({
        userId: user.id,
        title: ответ.bug.title,
        details: ответ.bug.details,
        device: устройство,
        lang,
      });
  });

  return NextResponse.json({ ok: true, message: сообщение });
}
