/*
 * Service Worker.
 *
 * Приложение — одна страница, поэтому оболочка это единственный
 * маршрут «/». Снимки лежат на Unsplash: их кладём в отдельный кэш и
 * отдаём из него, чтобы при следующем запуске экран не собирался
 * заново по сети.
 *
 * Версия приходит из адреса регистрации (?v=<хэш сборки>): без неё
 * очистка при активации не срабатывает, и браузер бесконечно отдаёт
 * старую оболочку.
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const SHELL = `shell-${VERSION}`;
const MEDIA = "media-v1";

/** Сколько снимков держим: дальше вытесняем самые старые. */
const MEDIA_LIMIT = 200;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.add(new Request("/", { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("shell-") && k !== SHELL)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Фотографии со стороннего хоста: сначала кэш — они не меняются.
  if (url.hostname.endsWith("unsplash.com")) {
    event.respondWith(cacheFirst(request, MEDIA, MEDIA_LIMIT));
    return;
  }

  // Свои запросы: сначала сеть, кэш как запасной вариант в офлайне.
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trim(cache, limit);
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL);
  try {
    const response = await fetch(request);
    if (response.ok && request.mode === "navigate") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Любая внутренняя навигация ведёт на ту же страницу — отдаём её.
    return (await cache.match(request)) ?? (await cache.match("/"));
  }
}

/** Вытесняет самые старые записи, когда кэш перерос лимит. */
async function trim(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((k) => cache.delete(k)));
}
