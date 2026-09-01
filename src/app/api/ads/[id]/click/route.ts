import { NextResponse } from "next/server";
import { getDb, countAdClick, trackEvent } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Переход по рекламе: засчитываем клик и переадресуем на сайт
 * рекламодателя. Прямая ссылка из вёрстки не дала бы отчёта по кликам,
 * а счётчик запросом с клиента срезал бы блокировщик рекламы.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adId = Number(id);
  if (!Number.isInteger(adId) || adId <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  const row = getDb()
    .prepare(`SELECT url FROM ad_banners WHERE id = ? AND is_active = 1`)
    .get(adId) as { url?: string } | undefined;
  if (!row?.url) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Открытый редирект недопустим: уводим только на http(s)-адрес из базы,
  // который завёл администратор, и никогда — на javascript: или data:.
  let target: URL;
  try {
    target = new URL(row.url);
  } catch {
    return NextResponse.json({ error: "bad_target" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "bad_protocol" }, { status: 400 });
  }

  countAdClick(adId);
  trackEvent({ type: "ad_click", meta: { ad_id: adId } });

  return NextResponse.redirect(target.toString(), 302);
}
