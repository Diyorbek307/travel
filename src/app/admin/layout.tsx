import type { Metadata } from "next";
import "./fonts.css";
import { isAuthenticated, isDefaultPassword } from "@/lib/admin-auth";
import LoginForm from "./login-form";
import "./admin.css";

/*
 * Шрифты макета панели. Своя тройка, не пересекающаяся с приложением:
 * панель — рабочий инструмент, а не витрина. Файлы — в репозитории
 * (fonts.css), без скачивания с Google во время сборки.
 */

export const metadata: Metadata = {
  title: "Админ-панель — HelloUZ",
  robots: { index: false, follow: false },
};

// Проверка куки читает заголовки запроса, поэтому страница не может быть
// заранее отрендерена в статику.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authorized = await isAuthenticated();

  return (
    <div
      style={{
        // Провайдер темы переписывает --font-display и --font-body во
        // время работы, поэтому подкладываем реальные семейства через
        // отдельные переменные, а не подменяем те же имена.
        ["--font-body" as string]: `"DM Sans", system-ui, sans-serif`,
        ["--font-display" as string]: `"Fraunces", Georgia, serif`,
        ["--font-mono" as string]: `"JetBrains Mono", monospace`,
      }}
    >
      {authorized ? children : <LoginForm defaultPassword={isDefaultPassword()} />}
    </div>
  );
}
