import { NextResponse } from "next/server";
import { createBooking, listUserBookings, type BookingKind } from "@/lib/community";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const ВИДЫ: BookingKind[] = ["hotel", "restaurant", "tour"];

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(
    { bookings: await listUserBookings(user.id) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const kind = body.kind as BookingKind;
  if (!ВИДЫ.includes(kind)) return NextResponse.json({ error: "kind_invalid" }, { status: 400 });

  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  const itemName = typeof body.itemName === "string" ? body.itemName.trim() : "";
  if (!itemId || !itemName) return NextResponse.json({ error: "item_required" }, { status: 400 });

  const guests = Number(body.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) {
    return NextResponse.json({ error: "guests_invalid" }, { status: 400 });
  }

  const date = typeof body.date === "string" ? body.date : "";
  // Бронь задним числом — почти всегда опечатка в календаре.
  if (!date || new Date(date).getTime() < Date.now() - 86_400_000) {
    return NextResponse.json({ error: "date_invalid" }, { status: 400 });
  }

  const бронь = await createBooking({
    userId: user.id,
    kind,
    itemId,
    itemName,
    date,
    guests,
    note: typeof body.note === "string" ? body.note.trim().slice(0, 500) : "",
  });

  return NextResponse.json({ ok: true, booking: бронь });
}
