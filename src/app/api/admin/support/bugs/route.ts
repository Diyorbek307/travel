import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { listUsers } from "@/lib/users";
import { listBugs, setBugStatus, type СтатусОшибки } from "@/lib/support-desk";

export const dynamic = "force-dynamic";

const СТАТУСЫ: СтатусОшибки[] = ["new", "in_progress", "fixed", "rejected"];

/** Заявки об ошибках, которые ИИ-помощники собрали из переписок. */
export async function GET() {
  const нет = await отказЕсли("operations");
  if (нет) return нет;
  const [заявки, users] = await Promise.all([listBugs(), listUsers()]);
  const поИд = new Map(users.map((u) => [u.id, u]));
  return NextResponse.json(
    {
      items: заявки.map((з) => {
        const u = поИд.get(з.userId);
        return { ...з, name: u ? `${u.firstName} ${u.lastName}`.trim() : "Аккаунт удалён" };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  const нет = await отказЕсли("operations");
  if (нет) return нет;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const bugId = typeof body.id === "string" ? body.id : "";
  const status = СТАТУСЫ.find((с) => с === body.status);
  if (!bugId || !status) return NextResponse.json({ error: "bad_body" }, { status: 400 });
  const ok = await setBugStatus(bugId, status);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
