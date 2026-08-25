import Link from "next/link";
import { notFound } from "next/navigation";
import CityTracker from "@/components/city-tracker";
import Header from "@/components/header";
import OfflineButton from "@/components/offline-button";
import PoiCard from "@/components/poi-card";
import PoiPhoto from "@/components/poi-photo";
import WeatherCard from "@/components/weather-card";
import { getCity, getPoiMedia, listPois, listTours } from "@/lib/db";
import { getForecast } from "@/lib/weather";
import { categoryLabel, objectsCount, routesCount, t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import Icon from "@/components/icon";
import { CATEGORIES, type Category } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Экран города: объекты по категориям, готовые маршруты, офлайн-пакет. */
export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const { category } = await searchParams;
  const lang = await currentLang();

  const city = getCity(slug, lang);
  if (!city) notFound();

  const all = listPois({ city: slug, lang });
  const tours = listTours(lang, slug);

  // Обложка города — снимок самого популярного объекта, у которого он есть.
  // Отдельной фотографии города у нас нет, а собирать коллаж не из чего.
  const hero = all.find((p) => p.cover) ?? null;
  const heroCredit = hero ? getPoiMedia(hero.id)[0] : null;
  const featured = all.filter((p) => p.cover).slice(0, 8);

  // Погода грузится параллельно странице и не обязана успеть: без неё
  // город показывается как раньше.
  const forecast = await getForecast(city.lat, city.lon);

  const active = (CATEGORIES as readonly string[]).includes(category ?? "")
    ? (category as Category)
    : null;
  const shown = active ? all.filter((p) => p.category === active) : all;

  // Показываем только те категории, в которых у города действительно есть объекты.
  const present = CATEGORIES.filter((c) => all.some((p) => p.category === c));

  return (
    <>
      <Header lang={lang} title={city.name} subtitle={`${all.length} ${t(lang, "objects")}`} back="/" />
      <CityTracker cityId={city.id} citySlug={city.slug} lang={lang} />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {hero && (
          <section className="relative -mx-4 mb-4 h-60 overflow-hidden sm:mx-0 sm:rounded-[var(--radius-lg)]">
            <PoiPhoto poi={hero} priority sizes="(max-width: 768px) 100vw, 768px" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(18,24,20,0.92) 0%, rgba(18,24,20,0.4) 46%, rgba(18,24,20,0.05) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                {t(lang, "country")}
              </p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight">{city.name}</h1>
              <p className="mt-1 text-sm opacity-90">
                {objectsCount(lang, all.length)} · {routesCount(lang, tours.length)}
              </p>
            </div>

            {/* Атрибуция обязательна для CC BY и CC BY-SA: снимок чужой,
                и указать автора — условие, на котором его можно показывать. */}
            {heroCredit?.author && (
              <p
                className="absolute right-2 top-2 max-w-[60%] truncate rounded-full px-2 py-0.5 text-[10px] text-white"
                style={{ background: "rgba(18,24,20,0.45)", backdropFilter: "blur(4px)" }}
              >
                {t(lang, "photo_by")}: {heroCredit.author} · {heroCredit.license}
              </p>
            )}
          </section>
        )}

        {forecast.days.length > 0 && (
          <div className="mb-4">
            <WeatherCard forecast={forecast} lang={lang} />
          </div>
        )}

        {city.description && <p className="mb-4 text-sm soft">{city.description}</p>}

        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link
            href={`/map?city=${city.slug}`}
            className="pressable grid place-items-center gap-1 p-3 text-center card"
          >
            <span style={{ color: "var(--primary-text)" }}><Icon name="map" size={24} /></span>
            <div className="mt-1 text-sm">{t(lang, "map")}</div>
          </Link>
          <Link
            href={`/planner?city=${city.slug}`}
            className="pressable grid place-items-center gap-1 p-3 text-center card"
          >
            <span style={{ color: "var(--primary-text)" }}><Icon name="sparkle" size={24} /></span>
            <div className="mt-1 text-sm">{t(lang, "build_route")}</div>
          </Link>
          <Link
            href={`/routes?city=${city.slug}`}
            className="pressable grid place-items-center gap-1 p-3 text-center card"
          >
            <span style={{ color: "var(--primary-text)" }}><Icon name="explore" size={24} /></span>
            <div className="mt-1 text-sm">{t(lang, "ready_routes")}</div>
          </Link>
          <OfflineButton citySlug={city.slug} cityName={city.name} lang={lang} />
        </div>

        {featured.length > 2 && (
          <section className="mb-5">
            <h2 className="mb-2 font-semibold">{t(lang, "top_places")}</h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {featured.map((poi, i) => (
                <div key={poi.id} className="w-44 shrink-0">
                  <PoiCard poi={poi} lang={lang} variant="feature" priority={i === 0} />
                </div>
              ))}
            </div>
          </section>
        )}

        {tours.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 font-semibold">{t(lang, "ready_routes")}</h2>
            <ul className="grid gap-2">
              {tours.slice(0, 3).map((tour) => (
                <li key={tour.slug}>
                  <Link
                    href={`/routes/${tour.slug}`}
                    className="block rounded-xl p-3 transition-colors surface hover:bg-soft"
                  >
                    <span className="block font-medium">{tour.title}</span>
                    <span className="block text-xs soft">
                      {tour.stop_count} {t(lang, "stops")} ·{" "}
                      {Math.round(tour.total_min / 60)} {t(lang, "hours_short")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          <FilterChip href={`/city/${city.slug}`} active={!active}>
            {t(lang, "all_categories")} · {all.length}
          </FilterChip>
          {present.map((c) => (
            <FilterChip
              key={c}
              href={`/city/${city.slug}?category=${c}`}
              active={active === c}
            >
              <Icon name={c} size={16} className="inline align-[-3px]" /> {categoryLabel(lang, c)}
            </FilterChip>
          ))}
        </nav>

        <ul className="grid gap-2">
          {shown.map((poi) => (
            <li key={poi.id} className="min-w-0">
              <PoiCard poi={poi} lang={lang} />
            </li>
          ))}
        </ul>

        {shown.length === 0 && <p className="py-8 text-center soft">{t(lang, "not_found")}</p>}
      </main>
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors"
      style={{
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "#fff" : "var(--text)",
        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
      }}
    >
      {children}
    </Link>
  );
}
