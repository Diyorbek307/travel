import { NextResponse } from "next/server";
import { отказЕсли, разрешено, ROOT_ID } from "@/lib/admin-auth";
import { findAdminById } from "@/lib/admins";
import { addKnowledge, deleteKnowledge, listKnowledge } from "@/lib/support-desk";

export const dynamic = "force-dynamic";

/**
 * База знаний ИИ-помощников. Сюда попадает только то, что одобрил
 * оператор: удачный ответ из переписки или запись, внесённая вручную.
 * Помощник доверяет ей больше всего — поэтому сама она не пополняется.
 */
export async function GET() {
  const нет = await отказЕсли("operations");
  if (нет) return нет;
  return NextResponse.json({ items: await listKnowledge() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const админ = await разрешено("operations");
  if (!админ) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  if (!question || !answer) return NextResponse.json({ error: "required" }, { status: 400 });
  const имя = админ.id === ROOT_ID ? "Администратор" : ((await findAdminById(админ.id))?.name ?? "Оператор");
  return NextResponse.json({ ok: true, item: await addKnowledge(question, answer, имя) });
}

export async function DELETE(request: Request) {
  const нет = await отказЕсли("operations");
  if (нет) return нет;
  const kbId = new URL(request.url).searchParams.get("id");
  if (!kbId) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await deleteKnowledge(kbId);
  return NextResponse.json({ ok: true });
}
