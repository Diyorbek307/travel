import { NextResponse } from "next/server";
import { createProLead } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Контакт для уведомления о запуске подписки. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  if (contact.length < 5 || contact.length > 120) {
    return NextResponse.json({ error: "contact_invalid" }, { status: 400 });
  }

  createProLead(contact, langFromParam(typeof body.lang === "string" ? body.lang : null));
  return NextResponse.json({ ok: true });
}
