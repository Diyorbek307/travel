import { NextResponse } from "next/server";
import { createReservation, getPoi, trackEvent } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/**
 * Заявка на столик (не подтверждённая бронь — см. HANDOFF.md): интеграции
 * с системами бронирования заведений нет, администратор перезванивает сам.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const lang = langFromParam(typeof body.lang === "string" ? body.lang : null);
  const poi = getPoi(slug, lang);
  if (!poi) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (poi.category !== "restaurant" && poi.category !== "cafe") {
    return NextResponse.json({ error: "not_bookable" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const partySize = Number(body.partySize);
  const requestedAt = typeof body.requestedAt === "string" ? body.requestedAt.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "phone_required" }, { status: 400 });
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 20) {
    return NextResponse.json({ error: "party_size_out_of_range" }, { status: 400 });
  }
  const requestedDate = new Date(requestedAt);
  if (!requestedAt || Number.isNaN(requestedDate.getTime()) || requestedDate.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "requested_at_invalid" }, { status: 400 });
  }

  const id = createReservation({
    poi_id: poi.id,
    name,
    phone,
    party_size: partySize,
    requested_at: requestedAt,
    note: note || null,
  });

  trackEvent({
    type: "reservation_request",
    city_id: poi.city_id,
    poi_id: poi.id,
    lang,
    meta: { party_size: partySize },
  });

  return NextResponse.json({ ok: true, id });
}
