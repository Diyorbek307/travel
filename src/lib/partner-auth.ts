import { NextResponse } from "next/server";
import { заведениеПоКлючу } from "./partner-push";
import { ipЗапроса, подЛимитом } from "./rate-limit";
import type { ВидЗаведения } from "./partners";

/**
 * Кто стучится в /api/partner/v1: система заведения со своим ключом
 * приёма (Authorization: Bearer hz_…). Возвращает заведение либо готовый
 * ответ-отказ — его маршрут просто отдаёт.
 */
export async function системаЗаведения(
  request: Request,
): Promise<{ вид: ВидЗаведения; id: string } | NextResponse> {
  // Сначала лимит по адресу — перебирать ключи бессмысленно.
  if (!подЛимитом(`partner-ip:${ipЗапроса(request)}`, 240, 60_000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const ключ = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const з = await заведениеПоКлючу(ключ);
  if (!з) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Одна касса шлёт обновление раз в несколько секунд, не чаще.
  if (!подЛимитом(`partner:${з.вид}:${з.id}`, 120, 60_000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  return { вид: з.вид, id: з.id };
}
