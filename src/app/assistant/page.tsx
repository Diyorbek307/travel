import AssistantScreen from "@/components/assistant-screen";
import Header from "@/components/header";
import { listCities } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Помощник туриста (п. 4 ТЗ) — отдельный экран, а не вкладка планировщика. */
export default async function AssistantPage() {
  const lang = await currentLang();
  const cities = listCities(lang);

  return (
    <>
      <Header
        lang={lang}
        title={t(lang, "assistant_title")}
        subtitle={t(lang, "assistant_subtitle")}
        back="/"
      />
      <AssistantScreen cities={cities} lang={lang} />
    </>
  );
}
