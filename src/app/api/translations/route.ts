import { NextResponse } from "next/server";
import { живыеПереводы } from "@/lib/content-translations";

export const dynamic = "force-dynamic";

/**
 * Переводы содержимого из панели и от автоперевода — для приложения.
 * Приложение подмешивает их к словарю: новое из панели читается на языке
 * туриста.
 */
export async function GET() {
  return NextResponse.json(await живыеПереводы(), {
    // Минута свежести: правка перевода в панели доходит быстро, а
    // каждое открытие приложения не бьёт по диску.
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
