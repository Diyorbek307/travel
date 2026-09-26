import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import {
  ошибкаКампании,
  картинкаКампании,
  type Аудитория,
  идётСегодня,
  сегодняВТашкенте,
} from "@/lib/campaign-rules";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  markPushed,
  updateCampaign,
  type ПоляКампании,
} from "@/lib/campaigns";
import { countSubscriptions, pushГотов, sendCampaign } from "@/lib/push";
import { readContent } from "@/lib/store";

export const dynamic = "force-dynamic";

/*
 * Кампании уведомлений в панели. Права — как у содержимого: пишет
 * редактор или владелец, поддержке сюда не нужно.
 */
const ДОМЕН = "content" as const;

export async function GET() {
  const нет = await отказЕсли(ДОМЕН);
  if (нет) return нет;
  const [campaigns, subscribers] = await Promise.all([listCampaigns(), countSubscriptions()]);
  return NextResponse.json(
    { campaigns, pushReady: pushГотов(), subscribers },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Поля кампании из тела запроса — только известные и нужного вида. */
function поля(body: Record<string, unknown>): Partial<ПоляКампании> {
  const строка = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : undefined);
  const а = body.audience as Partial<Аудитория> | undefined;
  const audience: Аудитория | undefined =
    а?.kind === "all" || а?.kind === "premium"
      ? { kind: а.kind }
      : а?.kind === "city" && typeof (а as { city?: unknown }).city === "string"
      ? { kind: "city", city: (а as { city: string }).city }
      : undefined;
  const итог: Partial<ПоляКампании> = {
    title: строка("title"),
    body: строка("body"),
    emoji: строка("emoji"),
    link: строка("link"),
    // Пустая строка — «картинки нет»: её тоже сохраняем, чтобы можно было стереть.
    image: typeof body.image === "string" ? body.image.trim() : undefined,
    from: строка("from"),
    to: строка("to"),
    audience,
    active: typeof body.active === "boolean" ? body.active : undefined,
  };
  // Неприсланные поля не трогаем: иначе выключение затирало бы текст.
  return Object.fromEntries(Object.entries(итог).filter(([, v]) => v !== undefined));
}

async function разослатьЕсли(id: string, надо: boolean): Promise<number | null> {
  if (!надо || !pushГотов()) return null;
  const к = await getCampaign(id);
  // Выключенную или не начавшуюся кампанию рассылать нельзя: push пришёл
  // бы, а в колокольчике её нет.
  if (!к || !идётСегодня(к, сегодняВТашкенте())) return null;
  const ушло = await sendCampaign(к, картинкаКампании(к, await readContent()));
  await markPushed(id, ушло);
  return ушло;
}

async function тело(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await request.json();
    return typeof b === "object" && b !== null ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Новая кампания. sendPush — разослать сразу после сохранения. */
export async function POST(request: Request) {
  const нет = await отказЕсли(ДОМЕН);
  if (нет) return нет;
  const body = await тело(request);
  if (!body) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const п = { emoji: "🔔", link: "", active: true, ...поля(body) };
  const ошибка = ошибкаКампании(п);
  if (ошибка) return NextResponse.json({ error: ошибка }, { status: 400 });

  const к = await createCampaign(п as ПоляКампании);
  const pushed = await разослатьЕсли(к.id, body.sendPush === true);
  return NextResponse.json({ ok: true, campaign: к, pushed });
}

/** Изменить кампанию, включить или выключить её. */
export async function PUT(request: Request) {
  const нет = await отказЕсли(ДОМЕН);
  if (нет) return нет;
  const body = await тело(request);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!body || !id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const было = await getCampaign(id);
  if (!было) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const изменения = поля(body);
  const ошибка = ошибкаКампании({ ...было, ...изменения });
  if (ошибка) return NextResponse.json({ error: ошибка }, { status: 400 });

  const к = await updateCampaign(id, изменения);
  const pushed = await разослатьЕсли(id, body.sendPush === true);
  return NextResponse.json({ ok: true, campaign: к, pushed });
}

export async function DELETE(request: Request) {
  const нет = await отказЕсли(ДОМЕН);
  if (нет) return нет;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const было = await deleteCampaign(id);
  return было ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
