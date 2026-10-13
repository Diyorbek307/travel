import type { Metadata } from "next";
import { LegalPage, языкСтраницы } from "./legal-page";
import { ПОЛИТИКА } from "./texts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Privacy policy — HelloUZ" };

/** Политика конфиденциальности — ссылка на неё указывается в Google Play и App Store. */
export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const язык = await языкСтраницы((await searchParams).lang);
  const п = ПОЛИТИКА[язык];
  // Почта для вопросов о данных — если владелец задал её на сервере.
  const почта = process.env.PRIVACY_EMAIL?.trim() || null;
  return (
    <LegalPage путь="/privacy" язык={язык} название={п.название}>
      <p style={{ color: "#587470", fontSize: 14, marginTop: 0 }}>{п.обновлено}</p>
      <p>{п.вступление}</p>
      {п.разделы.map((р) => (
        <section key={р.заголовок}>
          <h2 style={{ fontSize: 19, marginTop: 28, fontWeight: 700 }}>{р.заголовок}</h2>
          <ul style={{ paddingLeft: 20, listStyle: "disc" }}>
            {р.пункты.map((x) => (
              <li key={x} style={{ marginBottom: 8 }}>
                {x}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p style={{ marginTop: 28 }}>{п.контакт(почта)}</p>
    </LegalPage>
  );
}
