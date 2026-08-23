import Header from "@/components/header";
import ProfileScreen from "@/components/profile-screen";
import { listCities, listPois } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Личный кабинет туриста (п. 12) и туристический паспорт (п. 13). */
export default async function ProfilePage() {
  const lang = await currentLang();
  // Отдаём весь каталог: избранное и штампы хранятся слугами, а разрешать
  // их в названия нужно на клиенте — в том числе офлайн.
  const pois = listPois({ lang });
  const cities = listCities(lang);

  return (
    <>
      <Header lang={lang} title={t(lang, "profile")} subtitle={t(lang, "passport")} back="/" />
      <ProfileScreen pois={pois} cities={cities} lang={lang} />
    </>
  );
}
