import { NextResponse } from "next/server";
import { stopSupportLocation, updateSupportLocation } from "@/lib/db";

export const dynamic = "force-dynamic";

const ID_RE = /^UZT-\d{4}-\d{6}$/;

/** Максимум, на который можно включить трансляцию за один раз. */
const MAX_MINUTES = 8 * 60;

/**
 * Трансляция геопозиции в поддержку.
 *
 * Включается только по кнопке и только на срок, который выбрал сам
 * турист: постоянного слежения здесь нет и быть не может — браузер всё
 * равно не отдаёт координаты закрытой вкладке, а бессрочная передача
 * местоположения без ведома человека недопустима.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = typeof body.travellerId === "string" ? body.travellerId : "";
  if (!ID_RE.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  // Выключение: стираем координаты сразу, а не ждём истечения срока.
  if (body.stop === true) {
    stopSupportLocation(id);
    return NextResponse.json({ ok: true, sharing: false });
  }

  const lat = Number(body.lat);
  const lon = Number(body.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json({ error: "bad_point" }, { status: 400 });
  }

  const minutes = Math.min(MAX_MINUTES, Math.max(1, Number(body.minutes) || 60));
  const until = new Date(Date.now() + minutes * 60_000).toISOString();

  updateSupportLocation({ travellerId: id, lat, lon, shareUntil: until });
  return NextResponse.json({ ok: true, sharing: true, until });
}
