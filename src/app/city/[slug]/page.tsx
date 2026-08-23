import Link from "next/link";
import { notFound } from "next/navigation";
import CityTracker from "@/components/city-tracker";
import Header from "@/components/header";
import OfflineButton from "@/components/offline-button";
import PoiCard from "@/components/poi-card";
import { getCity, listPois, listTours } from "@/lib/db";
import { categoryLabel, t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import { CATEGORIES, CATEGORY_ICON, type Category } from "@/lib/types";

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
        {city.description && <p className="mb-4 text-sm soft">{city.description}</p>}

        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link
            href={`/map?city=${city.slug}`}
            className="rounded-xl p-3 text-center transition-colors surface hover:bg-soft"
          >
            <div className="text-xl">🗺</div>
            <div className="mt-1 text-sm">{t(lang, "map")}</div>
          </Link>
          <Link
            href={`/planner?city=${city.slug}`}
            className="rounded-xl p-3 text-center transition-colors surface hover:bg-soft"
          >
            <div className="text-xl">🧭</div>
            <div className="mt-1 text-sm">{t(lang, "build_route")}</div>
          </Link>
          <Link
            href={`/routes?city=${city.slug}`}
            className="rounded-xl p-3 text-center transition-colors surface hover:bg-soft"
          >
            <div className="text-xl">📋</div>
            <div className="mt-1 text-sm">{t(lang, "ready_routes")}</div>
          </Link>
          <OfflineButton citySlug={city.slug} cityName={city.name} lang={lang} />
        </div>

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
              {CATEGORY_ICON[c]} {categoryLabel(lang, c)}
            </FilterChip>
          ))}
        </nav>

        <ul className="grid gap-2">
          {shown.map((poi) => (
            <li key={poi.id}>
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
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </Link>
  );
}
