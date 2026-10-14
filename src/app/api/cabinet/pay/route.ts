import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { подЛимитом } from "@/lib/rate-limit";
import { какиеСистемы, ссылкаОплаты, возврат, type Система } from "@/lib/payments";
import { партнёрыПользователя, тарифы } from "@/lib/providers";
import { создатьЗаказПодписки } from "@/lib/provider-orders";
import { ПОКУПКИ, ценаПокупки, type Покупка } from "@/lib/provider-rules";

export const dynamic = "force-dynamic";

/**
 * Оплатить размещение или продвижение: создаём заказ и отдаём ссылку на
 * страницу Payme или Click. Срок продлится, когда платёжная система сама
 * подтвердит оплату.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!подЛимитом(`cab-pay:${user.id}`, 10, 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const покупка = тело.item as Покупка;
  const система = тело.system as Система;
  if (!ПОКУПКИ.includes(покупка)) return NextResponse.json({ error: "item_invalid" }, { status: 400 });
  if (!какиеСистемы().includes(система)) return NextResponse.json({ error: "pay_off" }, { status: 503 });
  const п = (await партнёрыПользователя(user.id)).find((x) => x.id === тело.providerId);
  if (!п) return NextResponse.json({ error: "not_found" }, { status: 404 });
  // Продвигать можно только проверенную анкету: рекламировать
  // непроверенного партнёра нельзя.
  const цена = ценаПокупки(покупка, п.kind, await тарифы());
  if (цена.продвижение && (!п.verified || п.status !== "active"))
    return NextResponse.json({ error: "not_verified" }, { status: 400 });
  const заказ = await создатьЗаказПодписки({
    providerId: п.id,
    providerName: п.name,
    userId: user.id,
    покупка,
    дней: цена.дней,
    продвижение: цена.продвижение,
    сумма: цена.сумма,
  });
  const url = ссылкаОплаты(система, заказ.сумма, заказ.id, `${возврат()}/cabinet?paid=${заказ.id}`);
  if (!url) return NextResponse.json({ error: "pay_off" }, { status: 503 });
  return NextResponse.json({ ok: true, url, order: заказ.id });
}
