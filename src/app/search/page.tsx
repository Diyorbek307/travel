import Header from "@/components/header";
import SearchScreen from "@/components/search-screen";
import { listCities, listPois } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Поиск по объектам платформы. */
export default async function SearchPage() {
  const lang = await currentLang();
  const pois = listPois({ lang });
  const cities = listCities(lang);

  return (
    <>
      <Header lang={lang} title={t(lang, "search_action")} subtitle={t(lang, "app_name")} back="/" />
      <SearchScreen pois={pois} cities={cities} lang={lang} />
    </>
  );
}
