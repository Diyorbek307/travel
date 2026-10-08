import { NextResponse } from "next/server";
import { отказЕсли, разрешено, ROOT_ID } from "@/lib/admin-auth";
import { addSupportMessage, listThreads, markThreadRead, updateThread } from "@/lib/community";
import { listUsers } from "@/lib/users";
import { findAdminById } from "@/lib/admins";
import { имяПомощника, печатает } from "@/lib/support-desk";

export const dynamic = "force-dynamic";

/**
 * Переписки для панели.
 *
 * К каждой ветке подставляется имя и почта: оператор должен видеть, с
 * кем говорит, а в самой переписке хранится только идентификатор — имя
 * человек может сменить.
 */
export async function GET() {
  const нет = await отказЕсли("operations");
  if (нет) return нет;

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
          photoUrl: u?.hasPhoto ? `/api/photo/${u.id}` : null,
          country: u?.country ?? "",
          mode: t.mode ?? "ai",
          needsHuman: Boolean(t.needsHuman),
          agent: имяПомощника(t.agent, "ru"),
          typing: печатает(t),
          // Имя помощника в панели — по-русски; оператор видит и ответы,
          // которые туристу ещё не показаны («печатает…»).
          messages: t.messages.map((m) => (m.author === "ai" ? { ...m, name: имяПомощника(m.name, "ru") } : m)),
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Ответ оператора, отметка «прочитано» или кто ведёт переписку. */
export async function POST(request: Request) {
  const админ = await разрешено("operations");
  if (!админ) return NextResponse.json({ error: "forbidden" }, { status: 403 });

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

  // «Взять на себя» / «Вернуть ИИ-помощнику».
  if (body.mode === "ai" || body.mode === "human") {
    await updateThread(userId, {
      mode: body.mode,
      needsHuman: false,
      ...(body.mode === "human" ? { aiPendingSince: null } : {}),
    });
    return NextResponse.json({ ok: true });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });

  // Турист видит настоящее имя оператора — подпись «Имя · HelloUZ».
  const имя = админ.id === ROOT_ID ? "Администратор" : ((await findAdminById(админ.id))?.name ?? "Оператор");
  const сообщение = await addSupportMessage(userId, "staff", text.slice(0, 2000), { name: имя });
  return NextResponse.json({ ok: true, message: сообщение });
}
