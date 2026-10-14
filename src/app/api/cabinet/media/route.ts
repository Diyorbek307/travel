import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { подЛимитом } from "@/lib/rate-limit";
import { сохранитьФото } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Фото для анкеты, машины или тура. Кабинет сжимает снимок до отправки. */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!подЛимитом(`cab-media:${user.id}`, 40, 60 * 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { dataUrl?: unknown } | null;
  const итог = await сохранитьФото(String(body?.dataUrl ?? ""));
  if (!итог.ok)
    return NextResponse.json({ error: итог.причина }, { status: итог.причина === "too_big" ? 413 : 400 });
  return NextResponse.json({ ok: true, url: `/api/media/${итог.id}` });
}
