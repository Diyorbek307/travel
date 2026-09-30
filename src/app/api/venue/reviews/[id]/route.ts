import { NextResponse } from "next/server";
import { моёЗаведение } from "@/lib/venue-access";
import { setReviewReply } from "@/lib/community";
import { подЛимитом } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Ответ заведения на отзыв о нём. Пустой текст — убрать ответ. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const з = await моёЗаведение();
  if (з instanceof NextResponse) return з;
  if (!подЛимитом(`venue-reply:${з.id}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const { id } = await params;
  const тело = (await request.json().catch(() => null)) as { text?: unknown } | null;
  if (typeof тело?.text !== "string") return NextResponse.json({ error: "bad_body" }, { status: 400 });
  const ok = await setReviewReply(id, з.id, тело.text);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
