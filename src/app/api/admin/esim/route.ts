import { NextResponse } from "next/server";
import { секретClick } from "@/lib/click-shop";
import { отказЕсли } from "@/lib/admin-auth";
import { airaloНастроен } from "@/lib/airalo";
import { всеЗаказы, выдать, отметитьОплату } from "@/lib/esim-orders";

export const dynamic = "force-dynamic";

/** Заказы eSIM — владельцу (деньги). */
export async function GET() {
  const нет = await отказЕсли("money");
  if (нет) return нет;
  return NextResponse.json(
    {
      настроено: {
        airalo: airaloНастроен(),
        payme: Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY),
        click: Boolean(process.env.CLICK_MERCHANT_ID && process.env.CLICK_SERVICE_ID && секретClick()),
      },
      заказы: await всеЗаказы(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * «paid» — отметить оплату вручную (платёж виден в кабинете Payme/Click,
 * а оповещение не пришло) и выдать eSIM; «retry» — повторить выдачу после
 * сбоя Airalo.
 */
export async function POST(request: Request) {
  const нет = await отказЕсли("money");
  if (нет) return нет;
  const тело = (await request.json().catch(() => null)) as { id?: unknown; action?: unknown } | null;
  const id = typeof тело?.id === "string" ? тело.id : "";
  if (тело?.action === "paid") {
    const ok = await отметитьОплату(id, "вручную");
    return NextResponse.json({ ok }, { status: ok ? 200 : 409 });
  }
  if (тело?.action === "retry") {
    const з = await выдать(id);
    return NextResponse.json({ ok: з?.статус === "выдан", статус: з?.статус ?? null });
  }
  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
