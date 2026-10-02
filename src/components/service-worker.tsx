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
    // При разработке имена скриптов не меняются от правки к правке, и
    // кэш отдавал бы вчерашний код. Кэшируем только боевую сборку, а
    // оставшуюся с прошлых запусков регистрацию снимаем.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((все) => все.forEach((р) => р.unregister()));
      return;
    }
    // Админ-панель офлайн не нужна: это закрытый инструмент, и держать
    // её страницы в кэше устройства ни к чему.
    if (pathname.startsWith("/admin")) return;
    const version = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    navigator.serviceWorker
      .register(`/sw.js?v=${version}`)
      .then(() => navigator.serviceWorker.ready)
      .then((р) => {
        // Скрипты, стили и картинки первой загрузки прошли мимо офлайн-кэша:
        // воркер ещё не управлял страницей. Передаём ему их список, иначе
        // без сети приложение не запустится (или откроется с дырами), как
        // только браузер почистит свой кэш.
        const свои = performance
          .getEntriesByType("resource")
          .map((e) => e.name)
          .filter((u) => {
            const адрес = new URL(u);
            if (адрес.hostname.endsWith("unsplash.com")) return true;
            if (адрес.origin !== location.origin) return false;
            return /^\/(_next\/static|tiles|scenic|icons|api\/media)\//.test(адрес.pathname);
          });
        р.active?.postMessage({ type: "precache", urls: свои });
      })
      .catch(() => {
        // Офлайн — приятное дополнение, а не условие работы: если
        // регистрация не прошла, приложение всё равно должно открыться.
      });
  }, [pathname]);

  return null;
}
