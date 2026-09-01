import { NextResponse } from "next/server";
import { createSupportTicket } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Обращение в поддержку. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";

  if (!topic) return NextResponse.json({ error: "topic_required" }, { status: 400 });
  if (message.length < 5 || message.length > 2000) {
    return NextResponse.json({ error: "message_invalid" }, { status: 400 });
  }

  createSupportTicket({
    topic,
    message,
    contact: contact || null,
    lang: langFromParam(typeof body.lang === "string" ? body.lang : null),
  });

  return NextResponse.json({ ok: true });
}
