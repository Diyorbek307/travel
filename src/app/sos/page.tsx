import Header from "@/components/header";
import SosScreen from "@/components/sos-screen";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Раздел безопасности туриста (п. 15 ТЗ). */
export default async function SosPage() {
  const lang = await currentLang();
  return (
    <>
      <Header lang={lang} title={t(lang, "sos")} subtitle="Экстренные службы Узбекистана" back="/" />
      <SosScreen lang={lang} />
    </>
  );
}
