"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Регистрация офлайн-кэша.
 *
 * Версия сборки уходит в адрес: без неё браузер считает sw.js
 * неизменившимся и продолжает отдавать старую оболочку после выката.
 */
export default function ServiceWorker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Админ-панель офлайн не нужна: это закрытый инструмент, и держать
    // её страницы в кэше устройства ни к чему.
    if (pathname.startsWith("/admin")) return;
    const version = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    navigator.serviceWorker.register(`/sw.js?v=${version}`).catch(() => {
      // Офлайн — приятное дополнение, а не условие работы: если
      // регистрация не прошла, приложение всё равно должно открыться.
    });
  }, [pathname]);

  return null;
}
