import type { NextConfig } from "next";

/**
 * Отпечаток сборки для Service Worker.
 *
 * Версия кэша должна меняться от выката к выкату, иначе браузер будет
 * бесконечно отдавать старую оболочку. На Render берём хэш коммита,
 * локально — время сборки.
 */
const BUILD_ID = process.env.RENDER_GIT_COMMIT?.slice(0, 12) ?? String(Date.now());

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
};

export default nextConfig;
