import Link from "next/link";
import Header from "@/components/header";
import { getCity, listCities, listTours } from "@/lib/db";
import { formatDuration } from "@/lib/geo";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

const MODE_ICON = { walk: "🚶", taxi: "🚕", car: "🚗" } as const;

/** Готовые маршруты (п. 10 ТЗ), включая межгородские. */
export default async function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: citySlug } = await searchParams;
  const lang = await currentLang();

  const cities = listCities(lang);
  const activeCity = citySlug ? getCity(citySlug, lang) : null;
  const tours = listTours(lang, activeCity?.slug);

  return (
    <>
      <Header
        lang={lang}
        title={t(lang, "ready_routes")}
        subtitle={activeCity?.name}
        back={activeCity ? `/city/${activeCity.slug}` : "/"}
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <nav className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
          <Chip href="/routes" active={!activeCity}>
            Все города
          </Chip>
          {cities.map((c) => (
            <Chip key={c.slug} href={`/routes?city=${c.slug}`} active={activeCity?.slug === c.slug}>
              {c.name}
            </Chip>
          ))}
        </nav>

        <ul className="grid gap-3">
          {tours.map((tour) => (
            <li key={tour.slug}>
              <Link
                href={`/routes/${tour.slug}`}
                className="block rounded-xl p-4 transition-colors surface hover:bg-soft"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-semibold">{tour.title}</h2>
                  <span className="shrink-0 text-lg">{MODE_ICON[tour.mode]}</span>
                </div>
                {tour.description && (
                  <p className="mt-1 text-sm soft">{tour.description}</p>
                )}
                <p className="mt-2 text-xs soft">
                  {tour.stop_count} {t(lang, "stops")} · {formatDuration(tour.total_min)}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {tours.length === 0 && <p className="py-8 text-center soft">{t(lang, "not_found")}</p>}

        <Link
          href={activeCity ? `/planner?city=${activeCity.slug}` : "/planner"}
          className="mt-5 block rounded-xl p-4 text-center transition-colors surface hover:bg-soft"
        >
          <span className="text-2xl">🧭</span>
          <span className="mt-1 block font-medium">Составить свой маршрут</span>
          <span className="block text-xs soft">
            Под ваше время, интересы и бюджет
          </span>
        </Link>
      </main>
    </>
  );
}

function Chip({
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
