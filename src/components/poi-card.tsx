import Link from "next/link";
import { formatDistance, formatPrice } from "@/lib/geo";
import { categoryLabel, t } from "@/lib/i18n";
import type { Lang, Poi } from "@/lib/types";
import Icon from "./icon";
import PoiPhoto from "./poi-photo";

/**
 * Карточка объекта.
 *
 * Два вида. «Полоса» — рабочая лошадка списков: снимок слева, факты справа,
 * много объектов на экран. «Витрина» — снимок во весь кадр с текстом поверх,
 * для подборок, где важно желание поехать, а не сравнение характеристик.
 *
 * Текст на снимке лежит на затемнении, а не прямо на фотографии: без него
 * белые буквы пропадают на светлом небе, а небо есть почти на каждом кадре.
 */
export default function PoiCard({
  poi,
  lang,
  distanceMeters,
  index,
  variant = "row",
  priority = false,
}: {
  poi: Poi;
  lang: Lang;
  distanceMeters?: number;
  index?: number;
  variant?: "row" | "feature";
  priority?: boolean;
}) {
  const rating = (
    <span className="inline-flex items-center gap-1 font-medium">
      <Icon name="star" size={13} filled />
      {poi.rating.toFixed(1)}
    </span>
  );

  if (variant === "feature") {
    return (
      <Link
        href={`/poi/${poi.slug}`}
        className="pressable group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)]"
        style={{ boxShadow: "var(--shadow-2)" }}
      >
        <PoiPhoto
          poi={poi}
          priority={priority}
          sizes="(max-width: 640px) 70vw, 300px"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Затемнение снизу: без него подпись тонет в небе. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(18,24,20,0.88) 0%, rgba(18,24,20,0.45) 34%, rgba(18,24,20,0) 62%)",
          }}
        />

        <span
          className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "var(--accent-strong)",
            backdropFilter: "blur(6px)",
          }}
        >
          {rating}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="truncate text-[11px] uppercase tracking-[0.14em] opacity-80">
            {categoryLabel(lang, poi.category)}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">
            {poi.name}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs opacity-90">
            <span className="inline-flex items-center gap-1">
              <Icon name="clock" size={12} />
              {poi.avg_visit_min} {t(lang, "minutes")}
            </span>
            <span>{formatPrice(poi.price_uzs, lang)}</span>
            {distanceMeters != null && <span>{formatDistance(distanceMeters, lang)}</span>}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/poi/${poi.slug}`}
      // w-full и min-w-0: без них карточка в сетке не может сжаться до
      // ширины колонки — её минимальный размер задаёт самая длинная строка,
      // и на узком экране список уезжает за правый край.
      className="pressable card flex w-full min-w-0 gap-3 overflow-hidden p-0 hover:shadow-[var(--shadow-2)]"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden">
        <PoiPhoto poi={poi} sizes="96px" />
        {index != null && (
          <span
            className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold"
            style={{ background: "var(--surface)", color: "var(--primary-text)" }}
          >
            {index}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 py-2.5 pr-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold leading-snug">{poi.name}</h3>
          <span className="shrink-0 text-sm" style={{ color: "var(--accent-strong)" }}>
            {rating}
          </span>
        </div>

        {poi.short_desc && (
          <p className="mt-0.5 line-clamp-2 text-sm soft">{poi.short_desc}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs faint">
          <span>{categoryLabel(lang, poi.category)}</span>
          <span
            style={{
              color: poi.is_free ? "var(--primary-text)" : undefined,
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
            <span
              className="inline-flex items-center gap-1"
              title="У объекта есть QR-табличка"
            >
              <Icon name="qr" size={12} />
              {poi.qr_code}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
