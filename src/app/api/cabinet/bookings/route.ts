import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { listBookings, setBookingStatus, type BookingStatus } from "@/lib/community";
import { партнёрыПользователя } from "@/lib/providers";

export const dynamic = "force-dynamic";

/** Водитель или гид отвечает на свою заявку: подтвердить или отказать. */
export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const тело = ((await request.json().catch(() => null)) ?? {}) as { id?: unknown; status?: unknown };
  const status = тело.status as BookingStatus;
  if (status !== "confirmed" && status !== "cancelled")
    return NextResponse.json({ error: "status_invalid" }, { status: 400 });
  const ids = new Set((await партнёрыПользователя(user.id)).map((п) => п.id));
  const бронь = (await listBookings()).find((b) => b.id === тело.id);
  if (!бронь || !бронь.providerId || !ids.has(бронь.providerId))
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  await setBookingStatus(бронь.id, status);
  return NextResponse.json({ ok: true });
}
