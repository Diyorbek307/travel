import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { subscribe, unsubscribe, публичныйКлюч, этоПодписка } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Открытый ключ VAPID. null — push не настроен, кнопку в профиле не показываем. */
export async function GET() {
  return NextResponse.json({ publicKey: публичныйКлюч() }, { headers: { "Cache-Control": "no-store" } });
}

async function тело(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await request.json();
    return typeof b === "object" && b !== null ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Сохранить подписку этого устройства. Её же присылают повторно при
 * каждом открытии приложения — чтобы обновить город.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!публичныйКлюч()) return NextResponse.json({ error: "push_disabled" }, { status: 503 });

  const body = await тело(request);
  if (!body || !этоПодписка(body.subscription)) {
    return NextResponse.json({ error: "bad_subscription" }, { status: 400 });
  }
  const city = typeof body.city === "string" && body.city.trim() ? body.city.trim().slice(0, 60) : null;
  await subscribe(user.id, body.subscription, city);
  return NextResponse.json({ ok: true });
}

/** Отписка: человек выключил уведомления в профиле. */
export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await тело(request);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await unsubscribe(endpoint, user.id);
  return NextResponse.json({ ok: true });
}
