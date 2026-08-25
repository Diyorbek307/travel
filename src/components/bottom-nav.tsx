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
 * Нижняя навигация: плавающая тёмная пилюля.
 *
 * Не панель во всю ширину: пилюля не режет экран горизонтальной линией,
 * и фотография под ней продолжается до самого низа — ради этого приём и
 * выбран, вся раскладка приложения построена на снимках.
 *
 * Подпись показывается только у активного пункта. Иконка без подписи
 * угадывается неверно, особенно иностранцем, который видит приложение
 * впервые; пять подписей сразу в пилюлю не помещаются. Компромисс:
 * там, где пользователь находится, написано словом.
 */
export default function BottomNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      aria-label="Основная навигация"
    >
      <ul
        className="flex max-w-full items-center gap-1 rounded-full p-1.5"
        style={{
          background: "var(--ink-deep)",
          boxShadow: "0 12px 32px rgb(22 40 30 / 0.32)",
        }}
      >
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                // Высота 44px — минимум для уверенного попадания пальцем.
                className="pressable flex h-11 items-center gap-2 rounded-full px-3.5"
                style={{
                  background: active ? "var(--primary-soft)" : "transparent",
                  color: active ? "var(--ink-deep)" : "rgb(255 255 255 / 0.72)",
                }}
              >
                <Icon name={item.icon} size={21} filled={active} />
                {active && (
                  <span className="max-w-[6.5rem] truncate text-[0.78rem] font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
