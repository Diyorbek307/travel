import Link from "next/link";
import { formatDistance, formatPrice } from "@/lib/geo";
import { categoryLabel, t } from "@/lib/i18n";
import { CATEGORY_ICON, type Lang, type Poi } from "@/lib/types";

/** Карточка объекта в списках и результатах поиска. */
export default function PoiCard({
  poi,
  lang,
  distanceMeters,
  index,
}: {
  poi: Poi;
  lang: Lang;
  distanceMeters?: number;
  index?: number;
}) {
  return (
    <Link
      href={`/poi/${poi.slug}`}
      className="flex gap-3 rounded-xl p-3 transition-colors surface hover:bg-soft"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-xl bg-soft">
        {index != null ? (
          <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            {index}
          </span>
        ) : (
          CATEGORY_ICON[poi.category]
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-medium">{poi.name}</h3>
          <span className="shrink-0 text-xs soft">★ {poi.rating.toFixed(1)}</span>
        </div>

        {poi.short_desc && (
          <p className="mt-0.5 line-clamp-2 text-sm soft">{poi.short_desc}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs soft">
          <span>{categoryLabel(lang, poi.category)}</span>
          <span>
            {formatPrice(poi.price_uzs, lang)}
          </span>
          <span>{poi.avg_visit_min} {t(lang, "minutes")}</span>
          {distanceMeters != null && (
            <span style={{ color: "var(--accent)" }}>{formatDistance(distanceMeters, lang)}</span>
          )}
          {poi.qr_code && <span title="Есть QR-табличка">📷 {poi.qr_code}</span>}
        </div>
      </div>
    </Link>
  );
}
