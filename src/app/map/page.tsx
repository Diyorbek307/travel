import Link from "next/link";
import AdBannerSlot from "@/components/ad-slot";
import Header from "@/components/header";
import Icon from "@/components/icon";
import MapScreen from "@/components/map-screen";
import PoiCard from "@/components/poi-card";
import { getCity, listCities, listPois } from "@/lib/db";
import { categoryLabel, objectsCount, t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import { CATEGORIES, type Category } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Интерактивная карта Узбекистана (п. 9 ТЗ) с фильтрами и GPS-подсказками. */
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string }>;
}) {
  const { city: citySlug, category } = await searchParams;
  const lang = await currentLang();
  const cities = listCities(lang);

  const city = citySlug ? getCity(citySlug, lang) : null;

  /*
   * Без выбранного города карта бессмысленна — объекты всей страны
   * сливаются в кучу. Раньше здесь стоял голый список городов; теперь это
   * каталог всех объектов с фильтрами, как экран «Исследовать» в макете:
   * турист, ещё не выбравший город, всё равно видит, что есть в стране.
   */
  if (!city) {
    const all = listPois({ lang });
    const active = (CATEGORIES as readonly string[]).includes(category ?? "")
      ? (category as Category)
      : null;
    const shown = active ? all.filter((p) => p.category === active) : all;
    const present = CATEGORIES.filter((c) => all.some((p) => p.category === c));

    return (
      <>
        <Header
          lang={lang}
          title={t(lang, "explore_title")}
          subtitle={objectsCount(lang, shown.length)}
          back="/"
        />
        <main className="mx-auto max-w-3xl px-4 py-4">
          <nav className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
            <Chip href="/map" active={!active}>
              {t(lang, "all_categories")} · {all.length}
            </Chip>
            {present.map((c) => (
              <Chip key={c} href={`/map?category=${c}`} active={active === c}>
                <Icon name={c} size={15} className="inline align-[-2px]" />{" "}
                {categoryLabel(lang, c)}
              </Chip>
            ))}
          </nav>

          <AdBannerSlot slot="explore" lang={lang} className="mb-3" />

          <p className="mb-3 text-sm soft">{t(lang, "explore_pick_city")}</p>
          <ul className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
            {cities.map((c) => (
              <li key={c.slug} className="shrink-0">
                <Link
                  href={`/map?city=${c.slug}`}
                  className="pressable block whitespace-nowrap rounded-[var(--radius-full)] px-4 py-2 text-sm card hover:shadow-[var(--shadow-2)]"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="grid gap-2">
            {shown.map((poi) => (
              <li key={poi.id}>
                <PoiCard poi={poi} lang={lang} />
              </li>
            ))}
          </ul>
        </main>
      </>
    );
  }

  const pois = listPois({ city: city.slug, lang });

  return (
    <>
      <Header
        lang={lang}
        title={city.name}
        subtitle={`${pois.length} ${t(lang, "objects")}`}
        back={`/city/${city.slug}`}
      />
      <MapScreen city={city} pois={pois} lang={lang} />
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
      className="pressable shrink-0 whitespace-nowrap rounded-[var(--radius-full)] px-3.5 py-2 text-sm"
      style={{
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "var(--on-primary)" : "var(--text)",
        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
      }}
    >
      {children}
    </Link>
  );
}
