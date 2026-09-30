import { NextResponse } from "next/server";
import { заказПоId, дляТуриста } from "@/lib/esim-orders";

export const dynamic = "force-dynamic";

/** Свой заказ по номеру: длинный случайный номер — сам себе пропуск. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^es[0-9a-f]{24}$/.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const з = await заказПоId(id);
  if (!з) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(дляТуриста(з), { headers: { "Cache-Control": "no-store" } });
}
