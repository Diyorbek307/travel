import { NextResponse } from "next/server";
import { каталог } from "@/lib/providers";

export const dynamic = "force-dynamic";

/**
 * Каталог для туристов: водители с машинами, гиды и их туры. Только
 * проверенные анкеты с оплаченным размещением, «Рекомендуем» сверху.
 */
export async function GET() {
  return NextResponse.json(await каталог(), {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
