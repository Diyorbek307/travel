/* eslint-disable no-restricted-globals */
/**
 * Service Worker: офлайн-режим (п. 11 ТЗ).
 *
 * Три стратегии:
 *   1. Оболочка приложения и статика  — cache-first;
 *   2. Ответы API                     — stale-while-revalidate;
 *   3. Тайлы карты и медиа            — cache-first с ограничением объёма.
 *
 * Пакет города («Скачать Самарканд») предзагружается по сообщению DOWNLOAD_CITY:
 * страница присылает список URL, воркер кладёт их в кэш.
 */

const VERSION = "v1";
const SHELL = `shell-${VERSION}`;
const API = `api-${VERSION}`;
const TILES = `tiles-${VERSION}`;
const MEDIA = `media-${VERSION}`;

/** Максимум тайлов карты в кэше — примерно 60–80 МБ. */
const TILE_LIMIT = 3000;

const SHELL_URLS = ["/", "/map", "/scan", "/routes", "/profile", "/sos", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS.map((u) => new Request(u, { cache: "reload" }))))
      .catch(() => undefined)
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
            .filter((k) => !k.endsWith(VERSION))
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

  // Тайлы карты приходят со стороннего домена OpenStreetMap.
  if (/tile\.openstreetmap|basemaps|tiles?\./i.test(url.hostname)) {
    event.respondWith(cacheFirstLimited(request, TILES, TILE_LIMIT));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Админ-панель офлайн не нужна и не должна кэшироваться.
  if (url.pathname.startsWith("/admin")) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(staleWhileRevalidate(request, API));
    return;
  }

  if (url.pathname.startsWith("/media/") || /\.(mp3|m4a|jpg|jpeg|png|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstLimited(request, MEDIA, 2000));
    return;
  }

  // Навигация: сеть с фолбэком на кэш — так офлайн открывается сохранённая версия.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL));
    return;
  }

  event.respondWith(cacheFirstLimited(request, SHELL, 500));
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "DOWNLOAD_CITY" && Array.isArray(data.urls)) {
    event.waitUntil(downloadCity(data.city, data.urls, event.source));
  }
  if (data.type === "REMOVE_CITY" && typeof data.city === "string") {
    event.waitUntil(removeCity(data.city));
  }
});

async function downloadCity(city, urls, client) {
  const cache = await caches.open(API);
  let done = 0;
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) await cache.put(url, response.clone());
    } catch {
      // Один недоступный ресурс не должен обрывать загрузку пакета целиком.
    }
    done++;
    client?.postMessage({ type: "DOWNLOAD_PROGRESS", city, done, total: urls.length });
  }
  client?.postMessage({ type: "DOWNLOAD_DONE", city, total: urls.length });
}

async function removeCity(city) {
  const cache = await caches.open(API);
  const keys = await cache.keys();
  await Promise.all(
    keys.filter((r) => r.url.includes(`city=${city}`)).map((r) => cache.delete(r)),
  );
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const shell = await caches.match("/");
    if (shell) return shell;
    return new Response("Офлайн: страница не сохранена", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

async function cacheFirstLimited(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      void trim(cache, limit);
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

/** Грубая очистка кэша по FIFO, чтобы он не рос бесконечно. */
async function trim(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  for (const key of keys.slice(0, keys.length - limit)) {
    await cache.delete(key);
  }
}
