import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { подЛимитом } from "@/lib/rate-limit";
import { listBookings } from "@/lib/community";
import { какиеСистемы } from "@/lib/payments";
import { всеЗаказыПодписки } from "@/lib/provider-orders";
import { всеДанные, создатьПартнёра, изменитьПартнёра, партнёрыПользователя } from "@/lib/providers";
import { разобратьАнкету, type Партнёр, type ВидПартнёра } from "@/lib/provider-rules";

export const dynamic = "force-dynamic";

/**
 * Кабинет водителя и гида — под обычным аккаунтом HelloUZ.
 *
 * GET — всё для кабинета: свои анкеты, туры, заявки, заказы и тарифы.
 * POST — подать анкету (одна анкета каждого вида на аккаунт).
 * PATCH — поправить свою анкету.
 */

/** Партнёр видит свою анкету целиком, кроме заметки менеджера. */
const своя = ({ adminNote: _скрыто, ...п }: Партнёр) => п;

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { партнёры, туры, тарифы } = await всеДанные();
  const мои = партнёры.filter((п) => п.userId === user.id);
  const ids = new Set(мои.map((п) => п.id));
  const брони = (await listBookings()).filter((b) => b.providerId && ids.has(b.providerId));
  const заказы = (await всеЗаказыПодписки()).filter((з) => ids.has(з.providerId));
  return NextResponse.json(
    {
      user: { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
      providers: мои.map(своя),
      tours: туры.filter((т) => ids.has(т.providerId)),
      bookings: брони,
      orders: заказы.map(({ payme: _p, click: _c, ...з }) => з),
      tariffs: тарифы,
      paySystems: какиеСистемы(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!подЛимитом(`cab-apply:${user.id}`, 5, 60 * 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const вид = тело.kind as ВидПартнёра;
  if (вид !== "driver" && вид !== "guide")
    return NextResponse.json({ error: "kind_invalid" }, { status: 400 });
  if ((await партнёрыПользователя(user.id)).some((п) => п.kind === вид))
    return NextResponse.json({ error: "already_exists" }, { status: 409 });
  const разбор = разобратьАнкету(вид, тело);
  if (!разбор.ok) return NextResponse.json({ error: разбор.ошибка }, { status: 400 });
  const п = await создатьПартнёра(вид, разбор.поля, { userId: user.id });
  return NextResponse.json({ ok: true, provider: своя(п) });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!подЛимитом(`cab-edit:${user.id}`, 30, 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const id = typeof тело.id === "string" ? тело.id : "";
  const мой = (await партнёрыПользователя(user.id)).find((п) => п.id === id);
  if (!мой) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const разбор = разобратьАнкету(мой.kind, тело);
  if (!разбор.ok) return NextResponse.json({ error: разбор.ошибка }, { status: 400 });
  const п = await изменитьПартнёра(id, (старый) => ({
    ...старый,
    ...разбор.поля,
    // Отклонённую анкету после правок отправляем на проверку заново.
    status: старый.status === "rejected" ? "pending" : старый.status,
  }));
  return NextResponse.json({ ok: true, provider: п ? своя(п) : null });
}
