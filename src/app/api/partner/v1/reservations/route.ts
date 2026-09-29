import { NextResponse } from "next/server";
import { listBookings } from "@/lib/community";
import { системаЗаведения } from "@/lib/partner-auth";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Брони туристов этого заведения — система забирает их сама.
 *
 *   GET /api/partner/v1/reservations?since=2026-10-01T00:00:00Z
 *
 * Только брони своего заведения: ключ приёма привязан к нему. Контакты
 * гостя отдаём — без них заведение не подтвердит бронь, — но только по
 * его собственным броням.
 */
export async function GET(request: Request) {
  const кто = await системаЗаведения(request);
  if (кто instanceof NextResponse) return кто;

  const since = new URL(request.url).searchParams.get("since");
  const с = since ? Date.parse(since) : Date.now() - 7 * 86_400_000;
  if (!Number.isFinite(с)) return NextResponse.json({ error: "since_invalid" }, { status: 400 });

  const [брони, люди] = await Promise.all([listBookings(), listUsers()]);
  const поИд = new Map(люди.map((u) => [u.id, u]));
  const свои = брони.filter((b) => b.kind === кто.вид && b.itemId === кто.id && Date.parse(b.createdAt) > с);

  return NextResponse.json(
    {
      reservations: свои.map((b) => {
        const u = поИд.get(b.userId);
        return {
          hellouz_booking_id: b.id,
          created_at: b.createdAt,
          status: b.external?.status ?? (b.status === "new" ? "pending" : b.status),
          date: b.date,
          time: b.time,
          nights: b.nights,
          guests: b.guests,
          room_category: b.roomCategory,
          note: b.note,
          guest: u
            ? { name: `${u.firstName} ${u.lastName}`.trim(), phone: u.phone || undefined, email: u.email }
            : null,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
