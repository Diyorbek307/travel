import { NextResponse } from "next/server";
import { createSos, listSos } from "@/lib/community";
import { currentUser } from "@/lib/session";
import { отказЕсли } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Список сигналов — операции (поддержка и владелец). */
export async function GET() {
  const нет = await отказЕсли("operations");
  if (нет) return нет;
  return NextResponse.json({ alerts: await listSos() }, { headers: { "Cache-Control": "no-store" } });
}

/** Турист нажал «Отправить геолокацию» — сохраняем сигнал для админа. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const lat = Number(body.lat);
  const lon = Number(body.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "coords_required" }, { status: 400 });
  }

  // Кто отправил: вошедший пользователь, иначе гость.
  const user = await currentUser().catch(() => null);
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() || "—" : "Гость";
  const info = [
    user?.email,
    user?.country,
    user?.phone,
    typeof body.info === "string" ? body.info : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const alert = await createSos({
    userId: user?.id ?? null,
    userName,
    userInfo: info || "нет данных",
    lat,
    lon,
  });

  return NextResponse.json({ ok: true, id: alert.id });
}
