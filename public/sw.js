/*
 * Service Worker.
 *
 * Приложение — одна страница, поэтому оболочка это единственный
 * маршрут «/». Чтобы она открылась без сети, мало сохранить саму
 * страницу: нужны и её скрипты со стилями (/_next/static) и последние
 * данные (/api/content). Раньше кэшировалась только страница — без сети
 * она открывалась пустой, хотя в описании обещан офлайн.
 *
 * Снимки лежат на Unsplash: их кладём в отдельный кэш и отдаём из него.
 * Города, скачанные в разделе «Аудио», лежат в своих кэшах offline-<город>
 * — поэтому любой ответ сначала ищется во всех кэшах сразу.
 *
 * Версия приходит из адреса регистрации (?v=<хэш сборки>): без неё
 * очистка при активации не срабатывает, и браузер бесконечно отдаёт
 * старую оболочку.
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const SHELL = `shell-${VERSION}`;
const STATIC = "static-v1";
const MEDIA = "media-v1";

/** Сколько снимков держим: дальше вытесняем самые старые. */
const MEDIA_LIMIT = 200;
/** Скрипты старых сборок копятся — держим с запасом на пару выкатов. */
const STATIC_LIMIT = 400;

/** Данные, без которых приложение без сети пустое. */
const ДАННЫЕ = ["/api/content", "/api/site-config", "/api/ad-policy"];

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

  // Чужие звук и картинки (аудиогид на внешнем хостинге): сеть, а без
  // неё — то, что скачали вместе с городом.
  if (url.origin !== self.location.origin) {
    if (request.destination === "audio" || request.destination === "image") {
      event.respondWith(fetch(request).catch(() => fromAnyCache(request)));
    }
    return;
  }

  // Админ-панель не кэшируем вовсе: за паролем, и офлайн ей не нужен.
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/admin")) return;

  // Скрипты и стили сборки неизменны: имя файла содержит его хэш.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC, STATIC_LIMIT));
    return;
  }

  // Свои запросы: сначала сеть, кэш как запасной вариант в офлайне.
  event.respondWith(networkFirst(request, url));
});

/** Ответ из любого кэша: оболочки, снимков или скачанного города. */
async function fromAnyCache(request) {
  return (await caches.match(request)) ?? Response.error();
}

async function cacheFirst(request, cacheName, limit) {
  const hit = await caches.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    await trim(cache, limit);
  }
  return response;
}

async function networkFirst(request, url) {
  try {
    const response = await fetch(request);
    // Сохраняем страницу и данные — то, что нужно, чтобы открыться без сети.
    if (response.ok && (request.mode === "navigate" || ДАННЫЕ.includes(url.pathname))) {
      const cache = await caches.open(SHELL);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const hit = await caches.match(request);
    if (hit) return hit;
    // Любая внутренняя навигация ведёт на ту же страницу — отдаём её.
    if (request.mode === "navigate") return (await caches.match("/")) ?? Response.error();
    return Response.error();
  }
}

/** Вытесняет самые старые записи, когда кэш перерос лимит. */
async function trim(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((k) => cache.delete(k)));
}

/*
 * Push: уведомление от кампании из панели (см. src/lib/push.ts).
 *
 * Показываем всегда, даже если данных не разобрать: браузеры наказывают
 * воркер, который получил push и ничего не показал, — следующие могут не
 * дойти вовсе.
 */
self.addEventListener("push", (event) => {
  let данные = {};
  try {
    данные = event.data ? event.data.json() : {};
  } catch {
    данные = { body: event.data ? event.data.text() : "" };
  }
  const title = данные.title || "HelloUZ";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: данные.body || "",
      icon: "/icons/icon-192.png",
      // Значок в строке состояния Android: белый силуэт, цветную плитку
      // Android превратил бы в белый квадрат.
      badge: "/icons/badge-96.png",
      // Большое фото под текстом — Android; iPhone и компьютеры его пропустят.
      image: данные.image || undefined,
      // Кнопка под уведомлением — Android. На остальных нажатие на само
      // уведомление делает то же самое.
      actions: данные.url && данные.url !== "/" ? [{ action: "open", title: "Открыть" }] : [],
      // Одна кампания — одно уведомление: повторная рассылка заменяет прежнее.
      tag: данные.tag || undefined,
      data: { url: данные.url || "/" },
    }),
  );
});

/*
 * Нажатие на уведомление: открыть приложение на нужном разделе.
 *
 * Если приложение уже открыто, не плодим вторую вкладку — разворачиваем
 * открытую и передаём ей, куда перейти. Иначе открываем новую по адресу
 * «/?open=…», его разбирает сама страница.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin);
  const открыть = url.searchParams.get("open");
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((окна) => {
      const своё = окна.find((о) => new URL(о.url).origin === self.location.origin);
      if (своё) {
        if (открыть) своё.postMessage({ type: "open", link: открыть });
        return своё.focus();
      }
      return self.clients.openWindow(url.href);
    }),
  );
});
