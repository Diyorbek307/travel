import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { addSupportMessage, listThreads, markThreadRead } from "@/lib/community";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Переписки для панели.
 *
 * К каждой ветке подставляется имя и почта: оператор должен видеть, с
 * кем говорит, а в самой переписке хранится только идентификатор — имя
 * человек может сменить.
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [ветки, users] = await Promise.all([listThreads(), listUsers()]);
  const поИд = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json(
    {
      threads: ветки.map((t) => {
        const u = поИд.get(t.userId);
        return {
          ...t,
          name: u ? `${u.firstName} ${u.lastName}`.trim() : "Аккаунт удалён",
          email: u?.email ?? "",
          photo: u?.photo ?? null,
          country: u?.country ?? "",
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Ответ оператора либо отметка «прочитано». */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) return NextResponse.json({ error: "user_required" }, { status: 400 });

  if (body.markRead === true) {
    await markThreadRead(userId);
    return NextResponse.json({ ok: true });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });

  const сообщение = await addSupportMessage(userId, "staff", text.slice(0, 2000));
  return NextResponse.json({ ok: true, message: сообщение });
}
