import { NextResponse } from "next/server";
import { ipЗапроса, подЛимитом } from "@/lib/rate-limit";
import { отметить, партнёрПоId } from "@/lib/providers";

export const dynamic = "force-dynamic";

/** Турист открыл карточку — +1 к просмотрам (для статистики в кабинете). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  // Один просмотр одной карточки с одного адреса раз в 10 минут — без накруток.
  if (!id || !подЛимитом(`pview:${ipЗапроса(request)}:${id}`, 1, 10 * 60_000))
    return NextResponse.json({ ok: true });
  if (await партнёрПоId(id)) await отметить(id, "views");
  return NextResponse.json({ ok: true });
}
