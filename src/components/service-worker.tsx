"use client";

import { useEffect } from "react";

/**
 * Регистрация Service Worker — основа офлайн-режима (п. 11 ТЗ).
 * В режиме разработки не регистрируем: кэш мешает видеть правки.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Регистрация может не пройти по http без localhost — офлайн просто не включится.
    });
  }, []);

  return null;
}
