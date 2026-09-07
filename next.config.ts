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
  // Нельзя открыть сайт внутри чужого iframe — это защита от кликджекинга,
  // особенно важная для админки. Своих встраиваний у приложения нет.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Наружу уходит только origin, а не полный адрес с параметрами.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Камера (QR-сканер) и геолокация (карта) — только самому приложению;
  // микрофон, оплата и определение местоположения по датчикам — никому.
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=(), payment=()" },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
