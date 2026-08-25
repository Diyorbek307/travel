"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./icon";

interface Item {
  href: string;
  icon: IconName;
  label: string;
}

/**
 * Нижняя навигация: пять пунктов, центральный приподнят.
 *
 * Пять — предел, после которого подписи перестают читаться на узких экранах.
 * Иконки всегда с подписями: иконка без текста угадывается неверно, особенно
 * иностранным туристом, который видит приложение впервые.
 *
 * Центральная кнопка — карта: это главный экран платформы, и приподнятая
 * форма делает её попадаемой большим пальцем без прицеливания.
 */
export default function BottomNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const middle = Math.floor(items.length / 2);

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -2px 16px rgb(43 43 43 / 0.06)",
      }}
      aria-label="Основная навигация"
    >
      <ul className="mx-auto flex max-w-lg items-end">
        {items.map((item, index) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isCenter = index === middle;

          if (isCenter) {
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="pressable flex flex-col items-center gap-1"
                  // Приподнимаем над панелью, но габариты пункта не меняем —
                  // соседние кнопки не съезжают.
                  style={{ marginTop: "-1.25rem" }}
                >
                  <span
                    className="grid h-14 w-14 place-items-center rounded-full"
                    style={{
                      background: "var(--primary)",
                      color: "var(--on-primary)",
                      boxShadow: "var(--shadow-3)",
                      border: "4px solid var(--surface)",
                    }}
                  >
                    <Icon name={item.icon} size={24} filled={active} />
                  </span>
                  <span
                    className="pb-2 text-[0.68rem] font-medium"
                    style={{ color: active ? "var(--primary-text)" : "var(--text-soft)" }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                // Высота 56px: минимум для уверенного попадания пальцем.
                className="pressable flex min-h-14 flex-col items-center justify-center gap-1 py-2"
                style={{ color: active ? "var(--primary-text)" : "var(--text-soft)" }}
              >
                <Icon name={item.icon} size={22} filled={active} />
                <span className="max-w-full truncate px-1 text-[0.68rem] font-medium">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
