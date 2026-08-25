import Link from "next/link";
import { formatDistance, formatPrice } from "@/lib/geo";
import { categoryLabel, t } from "@/lib/i18n";
import type { Lang, Poi } from "@/lib/types";
import Icon from "./icon";

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
      className="pressable flex gap-3 p-3 card hover:shadow-[var(--shadow-2)]"
    >
      {/* Плашка вместо фотографии: своих снимков объектов нет, а чужие без
          лицензии брать нельзя. Орнамент читается как оформление, а не как
          не загрузившаяся картинка. Появятся фото — сюда встанет poi.cover. */}
      <div
        className="photo-placeholder grid h-20 w-20 shrink-0 place-items-center rounded-[var(--radius-sm)]"
        style={{ color: "var(--primary-text)" }}
      >
        {index != null ? (
          <span className="text-lg font-semibold">{index}</span>
        ) : (
          <Icon name={poi.category} size={26} />
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold leading-snug">{poi.name}</h3>
          <span
            className="flex shrink-0 items-center gap-1 text-sm font-medium"
            style={{ color: "var(--accent-strong)" }}
          >
            <Icon name="star" size={14} filled />
            {poi.rating.toFixed(1)}
          </span>
        </div>

        {poi.short_desc && (
          <p className="mt-0.5 line-clamp-2 text-sm soft">{poi.short_desc}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs faint">
          <span>{categoryLabel(lang, poi.category)}</span>
          <span
            style={{
              color: poi.is_free ? "var(--primary)" : undefined,
              fontWeight: poi.is_free ? 500 : undefined,
            }}
          >
            {formatPrice(poi.price_uzs, lang)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={12} />
            {poi.avg_visit_min} {t(lang, "minutes")}
          </span>
          {distanceMeters != null && (
            <span style={{ color: "var(--primary-text)" }}>
              {formatDistance(distanceMeters, lang)}
            </span>
          )}
          {poi.qr_code && (
            <span className="inline-flex items-center gap-1" title="У объекта есть QR-табличка">
              <Icon name="qr" size={12} />
              {poi.qr_code}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
