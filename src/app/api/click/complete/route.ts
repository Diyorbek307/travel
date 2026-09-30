import { NextResponse } from "next/server";
import { complete } from "@/lib/click-shop";
import { поляClick } from "@/lib/click-form";

export const dynamic = "force-dynamic";

/** Click SHOP API — шаг Complete. Подробности — lib/click-shop. */
export async function POST(request: Request) {
  const поля = await поляClick(request);
  if (!поля) return NextResponse.json({ error: -8, error_note: "Error in request from click" });
  return NextResponse.json(await complete(поля));
}
