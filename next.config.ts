import type { NextConfig } from "next";

/**
 * Отпечаток сборки для Service Worker.
 *
 * Без него офлайн-кэш никогда не обновлялся: в sw.js версия была зашита
 * строкой "v1", а очистка при активации удаляет кэши, «не заканчивающиеся
 * на текущую версию» — то есть shell-v1 под условие не попадал и жил
 * вечно. Приложение выкатывалось, а турист продолжал видеть старую
 * оболочку, пока вручную не сбросит данные сайта.
 *
 * На Render берём хэш коммита, локально — время сборки: важно лишь то,
 * что значение меняется от сборки к сборке.
 */
const BUILD_ID =
  process.env.RENDER_GIT_COMMIT?.slice(0, 12) ?? String(Date.now());

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite"],
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
};

export default nextConfig;
