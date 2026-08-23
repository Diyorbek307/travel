import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/header";
import RouteMap from "@/components/route-map";
import { getCity, getTourBySlug } from "@/lib/db";
import { formatDistance, formatDuration, formatPrice, haversine, travelMinutes } from "@/lib/geo";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import { CATEGORY_ICON } from "@/lib/types";

export const dynamic = "force-dynamic";

const MODE_LABEL = { walk: "пешком", taxi: "на такси", car: "на машине" } as const;

/** Готовый маршрут с остановками, таймингом и картой. */
export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await currentLang();

  const tour = getTourBySlug(slug, lang);
  if (!tour) notFound();

  const city = getCity(tour.city_slug, lang);
  const pois = tour.stops.map((s) => s.poi);

  // Тайминг считаем на лету: расстояния берутся из координат, а время
  // осмотра — из маршрута. Так цифры всегда согласованы с текущей базой.
  let elapsed = 0;
  let totalMeters = 0;
  const legs = tour.stops.map((stop, i) => {
    const prev = i === 0 ? null : tour.stops[i - 1].poi;
    const meters = prev ? haversine(prev.lat, prev.lon, stop.poi.lat, stop.poi.lon) : 0;
    const legMin = prev ? travelMinutes(meters, tour.mode) : 0;
    totalMeters += meters;
    const arrive = elapsed + legMin;
    elapsed = arrive + stop.stay_min;
    return { ...stop, meters, legMin, arrive };
  });

  const totalCost = pois.reduce((s, p) => s + p.price_uzs, 0);

  return (
    <>
      <Header
        lang={lang}
        title={tour.title}
        subtitle={city?.name}
        back={`/routes?city=${tour.city_slug}`}
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {tour.description && <p className="mb-4 text-sm soft">{tour.description}</p>}

        <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Fact label={t(lang, "duration")}>{formatDuration(elapsed, lang)}</Fact>
          <Fact label={t(lang, "distance")}>{formatDistance(totalMeters, lang)}</Fact>
          <Fact label={t(lang, "transport")}>{MODE_LABEL[tour.mode]}</Fact>
          <Fact label={t(lang, "price")}>
            {formatPrice(totalCost, lang)}
          </Fact>
        </dl>

        <section className="mb-4 overflow-hidden rounded-xl surface">
          <RouteMap
            pois={pois}
            center={[city?.lat ?? pois[0].lat, city?.lon ?? pois[0].lon]}
            lang={lang}
            className="h-64 w-full"
          />
        </section>

        <ol className="grid gap-2">
          {legs.map((leg, i) => (
            <li key={`${leg.poi.id}-${i}`}>
              {leg.legMin > 0 && (
                <p className="py-1 pl-6 text-xs soft">
                  ↓ {formatDistance(leg.meters, lang)}, {leg.legMin} {t(lang, "minutes")}{" "}
                  {MODE_LABEL[tour.mode]}
                </p>
              )}
              <Link
                href={`/poi/${leg.poi.slug}`}
                className="flex gap-3 rounded-xl p-3 transition-colors surface hover:bg-soft"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {CATEGORY_ICON[leg.poi.category]} {leg.poi.name}
                  </span>
                  {leg.poi.short_desc && (
                    <span className="block truncate text-sm soft">{leg.poi.short_desc}</span>
                  )}
                  <span className="mt-0.5 block text-xs soft">
                    Прибытие через {formatDuration(leg.arrive, lang)} · осмотр {leg.stay_min}{" "}
                    {t(lang, "minutes")} ·{" "}
                    {formatPrice(leg.poi.price_uzs, lang)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-xs soft">
          Время в пути рассчитано по прямому расстоянию с поправкой на извилистость
          улиц. Реальная дорога может отличаться — учитывайте запас.
        </p>
      </main>
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-2 surface">
      <dt className="text-[0.65rem] uppercase tracking-wide soft">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
