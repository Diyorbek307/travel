import { NextResponse } from "next/server";
import { секретClick } from "@/lib/click-shop";
import { airaloНастроен } from "@/lib/airalo";
import { создатьЗаказ, пакетыСЦенами, дляТуриста } from "@/lib/esim-orders";
import { какиеСистемы, ссылкаОплаты, возврат, type Система } from "@/lib/payments";
import { currentUser } from "@/lib/session";
import { ipЗапроса, подЛимитом } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Магазин eSIM для туриста. Работает, когда подключены и Airalo, и хотя
 * бы одна платёжная система с приёмом оповещений (секретный ключ): иначе
 * оплату некому подтвердить, и продавать нельзя.
 */
function платёжныеСОповещениями(): Система[] {
  return какиеСистемы().filter((с) =>
    с === "payme" ? Boolean(process.env.PAYME_KEY) : Boolean(секретClick()),
  );
}

export async function GET() {
  const оплата = платёжныеСОповещениями();
  if (!airaloНастроен() || !оплата.length) {
    return NextResponse.json({ включён: false, пакеты: [], оплата });
  }
  try {
    const пакеты = (await пакетыСЦенами()).map((п) => ({
      id: п.id,
      title: п.title,
      data: п.data,
      day: п.day,
      unlimited: п.unlimited,
      operator: п.operator,
      сумма: п.сумма,
    }));
    return NextResponse.json({ включён: true, пакеты, оплата }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[esim] пакеты:", e instanceof Error ? e.message : e);
    return NextResponse.json({ включён: false, пакеты: [], оплата, ошибка: "upstream" });
  }
}

export async function POST(request: Request) {
  if (!подЛимитом(`esim:${ipЗапроса(request)}`, 10, 10 * 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  const оплата = платёжныеСОповещениями();
  if (!airaloНастроен() || !оплата.length) return NextResponse.json({ error: "off" }, { status: 503 });

  const тело = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const packageId = typeof тело?.packageId === "string" ? тело.packageId : "";
  const почта = typeof тело?.email === "string" ? тело.email.trim().slice(0, 120) : "";
  if (почта && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(почта)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }
  const система = оплата.includes(тело?.system as Система) ? (тело?.system as Система) : оплата[0];

  const user = await currentUser();
  const заказ = await создатьЗаказ(packageId, {
    userId: user?.id,
    email: почта || user?.email || undefined,
  });
  if (!заказ) return NextResponse.json({ error: "package_not_found" }, { status: 404 });

  // После оплаты человек возвращается прямо к своему заказу.
  const url = ссылкаОплаты(система, заказ.сумма, заказ.id, `${возврат()}/?esim=${заказ.id}`);
  if (!url) return NextResponse.json({ error: "off" }, { status: 503 });
  return NextResponse.json({ заказ: дляТуриста(заказ), url });
}
