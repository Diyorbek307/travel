import { NextResponse } from "next/server";
import { разобратьОтветПартнёра } from "@/lib/availability";
import { системаЗаведения } from "@/lib/partner-auth";
import { сохранитьПрисланное } from "@/lib/partner-push";

export const dynamic = "force-dynamic";

/**
 * Система заведения присылает свободные места (режим «присылает сама»).
 *
 *   POST /api/partner/v1/availability
 *   Authorization: Bearer hz_…
 *   { "rooms": [{ "category": "standard", "free": 3, "price": 85 }] }   — гостиница
 *   { "free_tables": 4, "next_free_time": "19:30" }                     — ресторан
 *
 * Формат тот же, что в ответе на наш запрос наличия (docs/partner-api.md):
 * системе не нужно учить второй.
 */
export async function POST(request: Request) {
  const кто = await системаЗаведения(request);
  if (кто instanceof NextResponse) return кто;

  let данные: unknown;
  try {
    данные = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const н = разобратьОтветПартнёра(данные);
  if (!н) {
    return NextResponse.json(
      { error: "nothing_valid", hint: "Ожидаются rooms[] (category, free) или free_tables" },
      { status: 400 },
    );
  }
  await сохранитьПрисланное(кто.вид, кто.id, н);
  return NextResponse.json({ ok: true, received: н });
}
