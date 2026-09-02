import { NextResponse } from "next/server";
import { addSupportMessage, getThread } from "@/lib/community";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Переписка вошедшего с поддержкой. */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ветка = await getThread(user.id);
  return NextResponse.json(
    { messages: ветка?.messages ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "text_too_long" }, { status: 400 });

  const сообщение = await addSupportMessage(user.id, "user", text);
  return NextResponse.json({ ok: true, message: сообщение });
}
