import { NextResponse } from "next/server";
import { подЛимитом } from "@/lib/rate-limit";
import { записьПоId } from "@/lib/store";
import { createBooking, listUserBookings, setBookingExternal, type BookingKind } from "@/lib/community";
import { currentUser } from "@/lib/session";
import { КАТЕГОРИИ } from "@/lib/availability";
import { отправитьБронь } from "@/lib/partners";
import { readContent } from "@/lib/store";
import type { RoomCategory } from "@/lib/types";
import { отметить, партнёрПоId, турПоId } from "@/lib/providers";
import { виденВКаталоге, телефонГоден } from "@/lib/provider-rules";

export const dynamic = "force-dynamic";

const ВИДЫ: BookingKind[] = ["hotel", "restaurant", "tour", "driver", "guide", "guidetour"];

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
  // Заявки уходят заведениям и в их системы: сотня в минуту — это спам.
  if (!подЛимитом(`booking:${user.id}`, 10, 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const kind = body.kind as BookingKind;
  if (!ВИДЫ.includes(kind)) return NextResponse.json({ error: "kind_invalid" }, { status: 400 });

  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  if (!itemId) return NextResponse.json({ error: "item_required" }, { status: 400 });
  // Водитель, гид или тур гида — из анкет партнёров, и только видимые в
  // каталоге: заявка скрытому или неоплаченному партнёру ушла бы в пустоту.
  let itemName: string;
  let providerId: string | undefined;
  if (kind === "driver" || kind === "guide" || kind === "guidetour") {
    const тур = kind === "guidetour" ? await турПоId(itemId) : null;
    const партнёр = await партнёрПоId(тур ? тур.providerId : itemId);
    if (!партнёр || !виденВКаталоге(партнёр) || (kind === "guidetour" && (!тур || тур.status !== "active")))
      return NextResponse.json({ error: "item_not_found" }, { status: 404 });
    providerId = партнёр.id;
    itemName = (тур ? `${тур.title} — ${партнёр.name}` : партнёр.name).slice(0, 120);
  } else {
    // Заведение должно существовать; название — из данных, а не из запроса.
    const раздел = kind === "hotel" ? "hotels" : kind === "restaurant" ? "restaurants" : "routes";
    const запись = await записьПоId(itemId, [раздел]);
    if (!запись) return NextResponse.json({ error: "item_not_found" }, { status: 404 });
    itemName = (запись.name ?? запись.title ?? itemId).slice(0, 120);
  }

  const guests = Number(body.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) {
    return NextResponse.json({ error: "guests_invalid" }, { status: 400 });
  }

  const date = typeof body.date === "string" ? body.date : "";
  const когда = new Date(date).getTime();
  // Бронь задним числом — почти всегда опечатка в календаре. Нечитаемая
  // дата даёт NaN, а сравнение с NaN всегда ложно — её ловим отдельно.
  // И не дальше двух лет вперёд: «2099» — тоже опечатка.
  if (
    !Number.isFinite(когда) ||
    когда < Date.now() - 86_400_000 ||
    когда > Date.now() + 2 * 365 * 86_400_000
  ) {
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

  // Категория номера — только у отеля и только из общего словаря.
  const roomCategory =
    kind === "hotel" && КАТЕГОРИИ.includes(body.roomCategory as RoomCategory)
      ? (body.roomCategory as RoomCategory)
      : undefined;
  // Время визита — у ресторана, если его выбрали.
  const time =
    kind === "restaurant" && typeof body.time === "string" && /^([01]?\d|2[0-3]):[0-5]\d$/.test(body.time)
      ? body.time
      : undefined;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  // Водителю и гиду: сколько дней, где встретить и как связаться.
  const days = providerId ? Math.round(Number(body.days)) : undefined;
  if (providerId && !(days! >= 1 && days! <= 30))
    return NextResponse.json({ error: "days_invalid" }, { status: 400 });
  const pickup = providerId && typeof body.pickup === "string" ? body.pickup.trim().slice(0, 160) : undefined;
  const телефон = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  const contactPhone = providerId ? (телефонГоден(телефон) ? телефон : user.phone || undefined) : undefined;
  if (providerId && !contactPhone) return NextResponse.json({ error: "phone_invalid" }, { status: 400 });

  const бронь = await createBooking({
    userId: user.id,
    kind,
    itemId,
    itemName,
    date,
    guests,
    nights,
    roomCategory,
    time,
    note,
    providerId,
    days,
    pickup,
    contactPhone,
  });
  if (providerId) void отметить(providerId, "requests");

  /*
   * Заведение подключено к своей системе (OSHBOARD или любой другой по
   * HelloUZ Partner API) — отправляем бронь туда сразу. Ответ «принято» —
   * место за туристом; нет связи или отказ — остаётся заявкой, как
   * раньше, её увидит администратор HelloUZ.
   */
  if (kind === "hotel" || kind === "restaurant") {
    const content = await readContent();
    const запись =
      kind === "hotel"
        ? content.hotels.find((h) => h.id === itemId)
        : content.restaurants.find((r) => r.id === itemId);
    if (запись?.connection?.kind === "partner") {
      const ответ = await отправитьБронь(kind, запись, {
        helloUzId: бронь.id,
        date,
        time,
        nights,
        guests,
        roomCategory,
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: user.phone || undefined,
        email: user.email,
        note,
      });
      if (ответ) {
        await setBookingExternal(бронь.id, ответ);
        return NextResponse.json({
          ok: true,
          booking: { ...бронь, external: ответ },
          confirmed: ответ.status === "confirmed",
        });
      }
    }
  }

  return NextResponse.json({ ok: true, booking: бронь });
}
