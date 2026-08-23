import Link from "next/link";
import Header from "@/components/header";
import MapScreen from "@/components/map-screen";
import { getCity, listCities, listPois } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Интерактивная карта Узбекистана (п. 9 ТЗ) с фильтрами и GPS-подсказками. */
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: citySlug } = await searchParams;
  const lang = await currentLang();
  const cities = listCities(lang);

  const city = citySlug ? getCity(citySlug, lang) : null;

  // Без выбранного города показывать всю страну на карте бессмысленно:
  // объекты сливаются в кучу. Сначала просим выбрать город.
  if (!city) {
    return (
      <>
        <Header lang={lang} title={t(lang, "map")} subtitle={t(lang, "choose_city")} back="/" />
        <main className="mx-auto max-w-3xl px-4 py-4">
          <ul className="grid gap-2 sm:grid-cols-2">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/map?city=${c.slug}`}
                  className="block rounded-xl p-4 transition-colors surface hover:bg-soft"
                >
                  <span className="font-medium">{c.name}</span>
                </Link>
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
