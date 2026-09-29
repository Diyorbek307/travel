import { NextResponse } from "next/server";
import { listBookings, setBookingExternal } from "@/lib/community";
import { системаЗаведения } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";

/**
 * Ответ заведения на бронь: подтвердить или отказать.
 *
 *   POST /api/partner/v1/reservations/{hellouz_booking_id}
 *   { "status": "confirmed", "external_id": "OSH-777" }
 *
 * Турист сразу видит в профиле «подтверждено» или «отказ».
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const кто = await системаЗаведения(request);
  if (кто instanceof NextResponse) return кто;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const status = body.status;
  if (status !== "confirmed" && status !== "rejected" && status !== "pending") {
    return NextResponse.json({ error: "status_invalid" }, { status: 400 });
  }
  const внешний = typeof body.external_id === "string" ? body.external_id.trim().slice(0, 80) : "";

  // Отвечать можно только на брони своего заведения.
  const бронь = (await listBookings()).find((b) => b.id === id);
  if (!бронь || бронь.kind !== кто.вид || бронь.itemId !== кто.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await setBookingExternal(id, { id: внешний || id, status });
  return NextResponse.json({ ok: true });
}
