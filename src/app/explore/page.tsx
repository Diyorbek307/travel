import ExploreScreen from "@/components/explore-screen";
import Header from "@/components/header";
import { listCities, listPois } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Трёхмерная карта страны: обзор регионов и переход в город. */
export default async function ExplorePage() {
  const lang = await currentLang();
  const cities = listCities(lang);

  // Высота призм на карте пропорциональна числу объектов, поэтому счёт
  // берётся из базы, а не задаётся руками.
  const counts: Record<string, number> = {};
  for (const city of cities) {
    counts[city.slug] = listPois({ city: city.slug, lang }).length;
  }

  return (
    <>
      <Header lang={lang} title="Исследовать" subtitle={t(lang, "cities")} back="/" />
      <ExploreScreen cities={cities} counts={counts} lang={lang} />
    </>
  );
}
