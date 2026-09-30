import type { NextConfig } from "next";

/**
 * Заголовки безопасности лендинга.
 *
 * Своего API и входа у лендинга нет, поэтому и защищать нужно немного:
 * только HTTPS, не угадывать типы файлов, не встраиваться в чужие рамки
 * (кликджекинг) и не давать страницам камеру, микрофон и геолокацию —
 * лендингу они ни к чему. Список источников скриптов не задаём: 3D и
 * шрифты тянутся с разных адресов, строгая политика их сломает.
 */
const ЗАГОЛОВКИ = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
];

const nextConfig: NextConfig = {
  // three собирается из исходников — Next должен его транспилировать.
  transpilePackages: ["three"],
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: ЗАГОЛОВКИ }];
  },
};

export default nextConfig;
