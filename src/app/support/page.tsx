import Header from "@/components/header";
import SupportScreen from "@/components/support-screen";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Техподдержка: вопрос в поддержку и экстренные службы. */
export default async function SupportPage() {
  const lang = await currentLang();
  return (
    <>
      <Header
        lang={lang}
        eyebrow={t(lang, "app_name")}
        title={t(lang, "support_title")}
        back="/profile"
      />
      <SupportScreen lang={lang} />
    </>
  );
}
