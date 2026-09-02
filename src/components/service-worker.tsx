"use client";

import { useEffect } from "react";

/**
 * Регистрация офлайн-кэша.
 *
 * Версия сборки уходит в адрес: без неё браузер считает sw.js
 * неизменившимся и продолжает отдавать старую оболочку после выката.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const version = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    navigator.serviceWorker.register(`/sw.js?v=${version}`).catch(() => {
      // Офлайн — приятное дополнение, а не условие работы: если
      // регистрация не прошла, приложение всё равно должно открыться.
    });
  }, []);

  return null;
}
