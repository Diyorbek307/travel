import type { NextConfig } from "next";

/**
 * Отпечаток сборки для Service Worker.
 *
 * Версия кэша должна меняться от выката к выкату, иначе браузер будет
 * бесконечно отдавать старую оболочку. На Render берём хэш коммита,
 * локально — время сборки.
 */
const BUILD_ID = process.env.RENDER_GIT_COMMIT?.slice(0, 12) ?? String(Date.now());

/**
 * Заголовки безопасности на все ответы.
 *
 * Это защита в глубину: даже при ошибке в коде эти заголовки закрывают
 * целые классы атак на уровне браузера. Ресурсную CSP (откуда грузить
 * скрипты и картинки) сознательно не задаём — приложение тянет карты
 * OpenStreetMap, фото Unsplash и курсы валют со сторонних адресов, и
 * строгий список источников легко всё это сломает. Здесь только то, что
 * усиливает защиту, ничего не ломая.
 */
const SECURITY_HEADERS = [
  // Только по HTTPS и заранее — браузер даже не пробует http. Два года,
  // с поддоменами. Render отдаёт сайт по https, так что это безопасно.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Не угадывать тип файла по содержимому: закрывает подмену, когда
  // загруженные данные браузер решает выполнить как скрипт.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Наружу уходит только origin, а не полный адрес с параметрами.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Камера (QR-сканер) и геолокация (карта) — только самому приложению;
  // микрофон, оплата и определение местоположения по датчикам — никому.
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
];

// Чужой сайт открыть нас в iframe не может — это защита от кликджекинга.
// Своё встраивание одно: превью приложения в панели, поэтому 'self', а
// не полный запрет.
const ТОЛЬКО_СВОИ = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

// Исключение — лендинг: он показывает живое приложение в рамке телефона.
// Его адрес задаётся при сборке (LANDING_ORIGIN, например
// https://hellouz.uz). X-Frame-Options не умеет перечислять сайты, а
// frame-ancestors его перекрывает, поэтому для приложения он не нужен.
// Админку лендингу не открываем никогда.
const ЛЕНДИНГ = process.env.LANDING_ORIGIN?.replace(/\/$/, "");
const ДЛЯ_ПРИЛОЖЕНИЯ = ЛЕНДИНГ
  ? [{ key: "Content-Security-Policy", value: `frame-ancestors 'self' ${ЛЕНДИНГ}` }]
  : ТОЛЬКО_СВОИ;

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  async headers() {
    // Совпавшие правила сливаются, и одноимённый заголовок берётся из
    // последнего — поэтому строгое правило админки идёт в конце.
    return [
      { source: "/:path*", headers: [...SECURITY_HEADERS, ...ДЛЯ_ПРИЛОЖЕНИЯ] },
      { source: "/admin/:path*", headers: ТОЛЬКО_СВОИ },
      { source: "/admin", headers: ТОЛЬКО_СВОИ },
    ];
  },
};

export default nextConfig;
