import Header from "@/components/header";
import PlannerScreen from "@/components/planner-screen";
import { listCities } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Планировщик маршрута (п. 3) и AI-помощник (п. 4). */
export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const lang = await currentLang();
  const cities = listCities(lang);

  return (
    <>
      <Header
        lang={lang}
        title={t(lang, "build_route")}
        subtitle={t(lang, "assistant")}
        back={city ? `/city/${city}` : "/"}
      />
      <PlannerScreen cities={cities} initialCity={city ?? null} lang={lang} />
    </>
  );
}
