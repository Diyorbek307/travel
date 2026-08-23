import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Приём обезличенных событий аналитики (п. 17 ТЗ).
 * Персональных данных не принимаем: session_hash генерирует клиент
 * случайным образом на время сессии и он никак не связан с личностью.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.type !== "string") {
      return NextResponse.json({ error: "type_required" }, { status: 400 });
    }
    trackEvent({
      type: body.type,
      city_id: typeof body.city_id === "number" ? body.city_id : null,
      poi_id: typeof body.poi_id === "number" ? body.poi_id : null,
      lang: typeof body.lang === "string" ? body.lang : null,
      session_hash: typeof body.session === "string" ? body.session.slice(0, 32) : null,
      meta: body.meta ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
