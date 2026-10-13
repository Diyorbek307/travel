import type { Metadata } from "next";
import { LegalPage, языкСтраницы } from "../privacy/legal-page";
import { ПОЛИТИКА, УДАЛЕНИЕ } from "../privacy/texts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Delete account — HelloUZ" };

/**
 * Как удалить аккаунт — Google Play требует такую страницу по ссылке,
 * доступной без установки приложения.
 */
export default async function DeleteAccountPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const язык = await языкСтраницы((await searchParams).lang);
  const у = УДАЛЕНИЕ[язык];
  return (
    <LegalPage путь="/delete-account" язык={язык} название={у.название}>
      <ol style={{ paddingLeft: 22, marginTop: 20, listStyle: "decimal" }}>
        {у.шаги.map((ш) => (
          <li key={ш} style={{ marginBottom: 8 }}>
            {ш}
          </li>
        ))}
      </ol>
      <ul style={{ paddingLeft: 20, marginTop: 20, listStyle: "disc" }}>
        {у.что.map((x) => (
          <li key={x} style={{ marginBottom: 8 }}>
            {x}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 20 }}>{у.без}</p>
      <p style={{ marginTop: 28 }}>
        <a href={`/privacy?lang=${язык}`} style={{ color: "#0a847e" }}>
          {ПОЛИТИКА[язык].название}
        </a>
      </p>
    </LegalPage>
  );
}
