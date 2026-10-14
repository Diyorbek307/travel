import { NextResponse } from "next/server";
import { способыВхода } from "@/lib/oauth";

export const dynamic = "force-dynamic";

/** Какие кнопки показывать: только способы, для которых заданы ключи. */
export async function GET() {
  return NextResponse.json(способыВхода(), { headers: { "Cache-Control": "no-store" } });
}
