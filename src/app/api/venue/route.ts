import { NextResponse } from "next/server";
import { моёЗаведение } from "@/lib/venue-access";
import { listBookings, listPlaceReviews } from "@/lib/community";
import { patchContent, readContent } from "@/lib/store";
import { чистыеПравки } from "@/lib/venue-edit";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Кабинет заведения: своя карточка, свои брони, свои отзывы.
 * Какое заведение — решает сервер по учётной записи (lib/venue-access).
 */
export async function GET() {
  const з = await моёЗаведение();
  if (з instanceof NextResponse) return з;
  const c = await readContent();
  const запись = (з.вид === "hotel" ? c.hotels : c.restaurants).find((x) => x.id === з.id);
  if (!запись) return NextResponse.json({ error: "venue_gone" }, { status: 404 });
  const [брони, отзывы, users] = await Promise.all([listBookings(), listPlaceReviews(з.id), listUsers()]);
  const поИд = new Map(users.map((u) => [u.id, u]));
  return NextResponse.json(
    {
      вид: з.вид,
      запись,
      // Гость сам оставил заявку этому заведению — имя и контакты нужны,
      // чтобы подтвердить её. Больше ничего о нём не отдаём.
      брони: брони
        .filter((b) => b.kind === з.вид && b.itemId === з.id)
        .map(({ userId, ...b }) => {
          const u = поИд.get(userId);
          return {
            ...b,
            гость: u ? `${u.firstName} ${u.lastName}`.trim() : "",
            email: u?.email ?? "",
            телефон: u?.phone ?? "",
          };
        }),
      // Автору заведение отвечает по имени — остальное о туристе ему ни к чему.
      отзывы: отзывы.map(({ userId: _скрыт, ...о }) => о),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Правка своей карточки — только разрешённые поля (lib/venue-edit). */
export async function PATCH(request: Request) {
  const з = await моёЗаведение();
  if (з instanceof NextResponse) return з;
  const тело = await request.json().catch(() => null);
  if (JSON.stringify(тело ?? "").length > 300_000) {
    return NextResponse.json({ error: "too_big" }, { status: 413 });
  }
  const правки = чистыеПравки(з.вид, тело);
  if (!правки) return NextResponse.json({ error: "nothing_to_save" }, { status: 400 });

  const c = await readContent();
  if (з.вид === "hotel") {
    if (!c.hotels.some((x) => x.id === з.id))
      return NextResponse.json({ error: "venue_gone" }, { status: 404 });
    await patchContent({ hotels: c.hotels.map((x) => (x.id === з.id ? { ...x, ...правки } : x)) });
  } else {
    if (!c.restaurants.some((x) => x.id === з.id))
      return NextResponse.json({ error: "venue_gone" }, { status: 404 });
    await patchContent({ restaurants: c.restaurants.map((x) => (x.id === з.id ? { ...x, ...правки } : x)) });
  }
  return NextResponse.json({ ok: true });
}
