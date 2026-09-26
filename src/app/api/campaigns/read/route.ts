import { NextResponse } from "next/server";
import { markRead } from "@/lib/campaigns";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Отметка «прочитано» для счётчика в панели. Считаем по аккаунту: без
 * входа отметка остаётся только на устройстве, в счётчик не идёт.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === "string").slice(0, 50)
    : [];
  if (ids.length === 0) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  await markRead(ids, user.id);
  return NextResponse.json({ ok: true });
}
