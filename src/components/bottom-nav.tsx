"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Item {
  href: string;
  icon: string;
  label: string;
}

/** Нижняя навигация приложения. Скрывается в админ-панели и на печати. */
export default function BottomNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-2.5 text-[0.65rem] transition-colors"
                style={{ color: active ? "var(--accent)" : "var(--text-soft)" }}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
