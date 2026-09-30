import { NextResponse } from "next/server";
import { ключВерен, выполнить, ОшибкаPayme } from "@/lib/payme-merchant";

export const dynamic = "force-dynamic";

/**
 * Payme Merchant API (JSON-RPC). Payme ждёт ответ всегда с кодом 200:
 * ошибка — в теле, по его протоколу. Подробности — lib/payme-merchant.
 */
export async function POST(request: Request) {
  let тело: { id?: unknown; method?: unknown; params?: unknown } | null = null;
  try {
    тело = await request.json();
  } catch {
    return NextResponse.json({ error: { code: -32700, message: "Parse error" }, id: null });
  }
  const id = тело?.id ?? null;
  if (!ключВерен(request.headers.get("authorization"))) {
    return NextResponse.json({
      error: {
        code: -32504,
        message: { ru: "Нет доступа", uz: "Ruxsat yoʻq", en: "Insufficient privilege" },
      },
      id,
    });
  }
  try {
    const result = await выполнить(
      String(тело?.method ?? ""),
      (тело?.params ?? {}) as Record<string, unknown>,
    );
    return NextResponse.json({ result, id });
  } catch (e) {
    if (e instanceof ОшибкаPayme) {
      return NextResponse.json({
        error: { code: e.code, message: e.msg, ...(e.data ? { data: e.data } : {}) },
        id,
      });
    }
    console.error("[payme]", e);
    return NextResponse.json({ error: { code: -32400, message: "System error" }, id });
  }
}
