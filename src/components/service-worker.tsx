"use client";

import { useEffect } from "react";

/**
 * Регистрация Service Worker — основа офлайн-режима (п. 11 ТЗ).
 * В режиме разработки не регистрируем: кэш мешает видеть правки.
 *
 * Отпечаток сборки в адресе обязателен. Браузер сверяет воркер побайтово
 * по его URL: пока адрес тот же, а сам файл не менялся, установленный
 * воркер считается актуальным — и продолжает отдавать оболочку прошлой
 * выкатки. С ?v=<сборка> адрес меняется на каждом деплое, воркер
 * переустанавливается и вычищает кэши предыдущих версий.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const build = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    navigator.serviceWorker.register(`/sw.js?v=${build}`).catch(() => {
      // Регистрация может не пройти по http без localhost — офлайн просто не включится.
    });
  }, []);

  return null;
}
