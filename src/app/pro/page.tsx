import Header from "@/components/header";
import ProScreen from "@/components/pro-screen";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Подписка без рекламы. */
export default async function ProPage() {
  const lang = await currentLang();
  return (
    <>
      <Header lang={lang} title={t(lang, "pro_title")} subtitle={t(lang, "app_name")} back="/profile" />
      <ProScreen lang={lang} />
    </>
  );
}
