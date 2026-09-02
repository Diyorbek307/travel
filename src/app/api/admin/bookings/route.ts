import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { listBookings, setBookingStatus, type BookingStatus } from "@/lib/community";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

const СТАТУСЫ: BookingStatus[] = ["new", "confirmed", "cancelled"];

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [брони, users] = await Promise.all([listBookings(), listUsers()]);
  const поИд = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json(
    {
      bookings: брони.map((b) => {
        const u = поИд.get(b.userId);
        return {
          ...b,
          name: u ? `${u.firstName} ${u.lastName}`.trim() : "Аккаунт удалён",
          email: u?.email ?? "",
          country: u?.country ?? "",
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as BookingStatus;
  if (!id || !СТАТУСЫ.includes(status)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await setBookingStatus(id, status);
  return NextResponse.json({ ok: true });
}
