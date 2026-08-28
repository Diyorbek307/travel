import Link from "next/link";
import AdminLogin from "@/components/admin/login-form";
import { isAuthenticated, isDefaultPassword } from "@/lib/admin-auth";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Сводка" },
  { href: "/admin/cities", label: "Города" },
  { href: "/admin/pois", label: "Объекты" },
  { href: "/admin/audio", label: "Аудиогиды" },
  { href: "/admin/qr", label: "QR-коды" },
  { href: "/admin/tours", label: "Маршруты" },
  { href: "/admin/museums", label: "Музеи" },
  { href: "/admin/reservations", label: "Столики" },
  { href: "/admin/analytics", label: "Аналитика" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) return <AdminLogin />;

  return (
    <div className="min-h-screen">
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/admin" className="font-semibold">
            Админ-панель
          </Link>
          <nav className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="text-sm" style={{ color: "var(--accent)" }}>
            К приложению →
          </Link>
          <form action={logout}>
            <button className="rounded-lg px-3 py-1.5 text-sm surface">Выйти</button>
          </form>
        </div>
      </header>

      {isDefaultPassword() && (
        <p
          className="px-4 py-2 text-center text-sm"
          style={{ background: "var(--clay-100, #f5ecdd)", color: "#7a442e" }}
        >
          Используется пароль по умолчанию. Задайте <code>ADMIN_PASSWORD</code> в{" "}
          <code>.env.local</code> перед тем, как открывать панель кому-то ещё.
        </p>
      )}

      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>
    </div>
  );
}
