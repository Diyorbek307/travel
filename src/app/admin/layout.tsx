import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { isAuthenticated, isDefaultPassword } from "@/lib/admin-auth";
import LoginForm from "./login-form";
import "./admin.css";

/*
 * Шрифты макета панели. Своя тройка, не пересекающаяся с приложением:
 * панель — рабочий инструмент, а не витрина.
 */
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body-src",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-display-src",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
});

export const metadata: Metadata = {
  title: "Админ-панель — Узбекистан",
  robots: { index: false, follow: false },
};

// Проверка куки читает заголовки запроса, поэтому страница не может быть
// заранее отрендерена в статику.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authorized = await isAuthenticated();

  return (
    <div
      className={`${dmSans.variable} ${fraunces.variable} ${mono.variable}`}
      style={{
        // Провайдер темы переписывает --font-display и --font-body во
        // время работы, поэтому подкладываем реальные семейства через
        // отдельные переменные, а не подменяем те же имена.
        ["--font-body" as string]: `var(--font-body-src), system-ui, sans-serif`,
        ["--font-display" as string]: `var(--font-display-src), Georgia, serif`,
        ["--font-mono" as string]: `var(--font-mono-src), monospace`,
      }}
    >
      {authorized ? children : <LoginForm defaultPassword={isDefaultPassword()} />}
    </div>
  );
}
