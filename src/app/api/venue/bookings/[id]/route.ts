import { NextResponse } from "next/server";
import { моёЗаведение } from "@/lib/venue-access";
import { listBookings, setBookingStatus } from "@/lib/community";

export const dynamic = "force-dynamic";

/** Заведение подтверждает или отклоняет бронь — только свою. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const з = await моёЗаведение();
  if (з instanceof NextResponse) return з;
  const { id } = await params;
  const тело = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = тело?.status;
  if (status !== "confirmed" && status !== "cancelled") {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }
  const бронь = (await listBookings()).find((b) => b.id === id);
  // Чужая бронь и несуществующая выглядят одинаково: не подсказываем.
  if (!бронь || бронь.kind !== з.вид || бронь.itemId !== з.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await setBookingStatus(id, status);
  return NextResponse.json({ ok: true });
}
