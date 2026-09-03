import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { какиеСистемы, ссылкаОплаты, type Система } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Ссылка на оплату.
 *
 * Строит адрес страницы оплаты на сервере, чтобы идентификатор продавца
 * не жил в браузере, и заодно присваивает платежу номер заказа. Если ни
 * одна система не подключена, честно отвечаем, что оплата недоступна, —
 * приложение показывает это словами, а не мёртвой кнопкой.
 */
export async function POST(request: Request) {
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

  // Сумма приходит от приложения, но верхнюю границу держим на сервере:
  // подделанное огромное значение не должно уйти на страницу оплаты.
  const сумма = Number(body.amount);
  if (!Number.isFinite(сумма) || сумма < 1000 || сумма > 100_000_000) {
    return NextResponse.json({ error: "amount_invalid" }, { status: 400 });
  }

  const order = `uzup-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const url = ссылкаОплаты(система, сумма, order);
  if (!url) return NextResponse.json({ available: false, systems: доступные });

  return NextResponse.json({ available: true, url, order, system: система, systems: доступные });
}

export async function GET() {
  return NextResponse.json({ systems: какиеСистемы() });
}
