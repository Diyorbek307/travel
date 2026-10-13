import { headers } from "next/headers";
import type { ЯзыкПолитики } from "./texts";

/**
 * Каркас юридических страниц (/privacy, /delete-account): ссылки на них
 * требуют магазины, открывают их люди из браузера — поэтому простая
 * серверная страница без приложения вокруг, читается на телефоне.
 * Язык — из ?lang= или из языка браузера; есть переключатель.
 */

const ЯЗЫКИ: ЯзыкПолитики[] = ["en", "ru", "uz"];
const ПОДПИСЬ: Record<ЯзыкПолитики, string> = { en: "English", ru: "Русский", uz: "Oʻzbek" };

export async function языкСтраницы(запрошен?: string): Promise<ЯзыкПолитики> {
  if (запрошен && (ЯЗЫКИ as string[]).includes(запрошен)) return запрошен as ЯзыкПолитики;
  const принимает = ((await headers()).get("accept-language") ?? "").toLowerCase();
  for (const часть of принимает.split(",")) {
    const код = часть.trim().slice(0, 2);
    if ((ЯЗЫКИ as string[]).includes(код)) return код as ЯзыкПолитики;
  }
  return "en";
}

export function LegalPage({
  путь,
  язык,
  название,
  children,
}: {
  путь: string;
  язык: ЯзыкПолитики;
  название: string;
  children: React.ReactNode;
}) {
  return (
    <main
      lang={язык}
      style={{
        height: "100dvh",
        background: "#f4f7f7",
        color: "#0d1715",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        padding: "32px 16px 64px",
        overflowY: "auto",
      }}
    >
      <article style={{ maxWidth: 720, margin: "0 auto", lineHeight: 1.6 }}>
        <nav style={{ display: "flex", gap: 12, marginBottom: 24, fontSize: 14, flexWrap: "wrap" }}>
          <a href="/" style={{ color: "#0a847e", fontWeight: 700, textDecoration: "none" }}>
            HelloUZ
          </a>
          <span style={{ flex: 1 }} />
          {ЯЗЫКИ.map((я) => (
            <a
              key={я}
              href={`${путь}?lang=${я}`}
              style={{ color: я === язык ? "#0d1715" : "#587470", fontWeight: я === язык ? 700 : 400 }}
            >
              {ПОДПИСЬ[я]}
            </a>
          ))}
        </nav>
        <h1 style={{ fontSize: 28, lineHeight: 1.2, margin: "0 0 8px", fontWeight: 800 }}>{название}</h1>
        {children}
      </article>
    </main>
  );
}
