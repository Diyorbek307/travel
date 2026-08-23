import { redirect } from "next/navigation";
import { getExhibitById, getPoiById, resolveQr, trackEvent } from "@/lib/db";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/**
 * Точка входа со сканирования QR (п. 5 ТЗ).
 *
 * Табличка на объекте ведёт сюда, а не прямо на страницу объекта: код можно
 * перепривязать без перепечатки таблички, и каждое сканирование учитывается.
 * Ссылка открывается и в обычном браузере — приложение необязательно.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const lang = await currentLang();

  const target = resolveQr(code);
  if (!target) redirect(`/scan?unknown=${encodeURIComponent(code)}`);

  if (target.target_type === "poi") {
    const poi = getPoiById(target.target_id, lang);
    if (!poi) redirect("/scan?error=1");
    trackEvent({ type: "qr_scan", city_id: poi.city_id, poi_id: poi.id, lang, meta: { code } });
    redirect(`/poi/${poi.slug}?from=qr`);
  }

  const exhibit = getExhibitById(target.target_id, lang);
  if (!exhibit) redirect("/scan?error=1");
  trackEvent({ type: "qr_scan", lang, meta: { code, exhibit: exhibit.id } });
  redirect(`/exhibit/${exhibit.id}?from=qr`);
}
