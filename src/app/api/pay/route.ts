import { NextResponse } from "next/server";
import { ipЗапроса, подЛимитом } from "@/lib/rate-limit";
import { randomBytes } from "node:crypto";
import { какиеСистемы, ссылкаОплаты, type Система } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** Цены Premium в сумах — те же, что в окне Premium приложения. */
const ЦЕНА_PREMIUM = { month: 39_000, year: 349_000 } as const;

/**
 * Ссылка на оплату.
 *
 * Строит адрес страницы оплаты на сервере, чтобы идентификатор продавца
 * не жил в браузере, и заодно присваивает платежу номер заказа. Если ни
 * одна система не подключена, честно отвечаем, что оплата недоступна, —
 * приложение показывает это словами, а не мёртвой кнопкой.
 */
export async function POST(request: Request) {
  // Каждый запрос уходит во внешний сервис по нашему ключу: без лимита
  // любой скрипт выжег бы квоту за минуту.
  if (!подЛимитом(`pay:${ipЗапроса(request)}`, 20, 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const доступные = какиеСистемы();
  const запрошена = body.system as Система | undefined;
  const система = запрошена && доступные.includes(запрошена) ? запрошена : доступные[0];

  if (!система) {
    return NextResponse.json({ available: false, systems: [] });
  }

  // Цену назначает сервер по тарифу. Раньше сумма приходила из браузера
  // с одной лишь верхней границей: поправив запрос, можно было оплатить
  // тысячу сумов и показать администратору «оплату Premium».
  // hasOwn, а не просто индекс: «constructor» или «__proto__» нашлись бы
  // в прототипе объекта.
  const план = typeof body.plan === "string" && Object.hasOwn(ЦЕНА_PREMIUM, body.plan) ? body.plan : null;
  const сумма = план ? ЦЕНА_PREMIUM[план as keyof typeof ЦЕНА_PREMIUM] : 0;
  if (!сумма) return NextResponse.json({ error: "plan_invalid" }, { status: 400 });

  const order = `uzup-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const url = ссылкаОплаты(система, сумма, order);
  if (!url) return NextResponse.json({ available: false, systems: доступные });

  return NextResponse.json({ available: true, url, order, system: система, systems: доступные });
}

export async function GET() {
  return NextResponse.json({ systems: какиеСистемы() });
}
