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
  const itemName = typeof body.itemName === "string" ? body.itemName.trim().slice(0, 120) : "";
  if (!itemId || !itemName) return NextResponse.json({ error: "item_required" }, { status: 400 });

  const guests = Number(body.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) {
    return NextResponse.json({ error: "guests_invalid" }, { status: 400 });
  }

  const date = typeof body.date === "string" ? body.date : "";
  const когда = new Date(date).getTime();
  // Бронь задним числом — почти всегда опечатка в календаре. Нечитаемая
  // дата даёт NaN, а сравнение с NaN всегда ложно — её ловим отдельно.
  if (!Number.isFinite(когда) || когда < Date.now() - 86_400_000) {
    return NextResponse.json({ error: "date_invalid" }, { status: 400 });
  }

  // Ночи — только у отеля. Не пришли (старая версия приложения) — не
  // беда, заявка всё равно дойдёт; пришли кривые — отказ.
  let nights: number | undefined;
  if (kind === "hotel" && body.nights !== undefined) {
    nights = Number(body.nights);
    if (!Number.isInteger(nights) || nights < 1 || nights > 60) {
      return NextResponse.json({ error: "nights_invalid" }, { status: 400 });
    }
  }

  const бронь = await createBooking({
    userId: user.id,
    kind,
    itemId,
    itemName,
    date,
    guests,
    nights,
    note: typeof body.note === "string" ? body.note.trim().slice(0, 500) : "",
  });

  return NextResponse.json({ ok: true, booking: бронь });
}
