"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SEED } from "@/data/seed";
import { ADS as ВШИТЫЕ_РЕКЛАМЫ } from "@/data/content";
import type { Content } from "@/lib/types";
import { useT } from "@/components/lang-provider";

/**
 * Медиа демо-объявлений по их id. На уже работающем стенде записи рекламы
 * могли сохраниться в базу ещё без полей фото и ролика; чтобы у них всё
 * равно появились картинка и видео, подставляем их по id из вшитого
 * набора.
 */
const МЕДИА_РЕКЛАМЫ = new Map(
  (ВШИТЫЕ_РЕКЛАМЫ as { id: string; imageUrl?: string; videoUrl?: string; skipAfter?: number }[]).map(
    (a) => [a.id, { imageUrl: a.imageUrl, videoUrl: a.videoUrl, skipAfter: a.skipAfter }] as const,
  ),
);

/**
 * Содержимое приложения.
 *
 * Первый кадр рисуется по семенам, вшитым в сборку: они уже в бандле,
 * ждать сети ради заведомо известного набора незачем. Следом приходит
 * ответ сервера с тем, что отредактировали в панели, и список
 * обновляется.
 *
 * Поэтому приложение открывается мгновенно даже при мёртвой сети, а
 * правки редактора появляются на первом же обновлении.
 */

const ContentContext = createContext<Content>(SEED);

/**
 * Видно ли запись туристу. Статус ставят в панели: отключённый отель или
 * отменённое событие должны исчезать из приложения, а не только менять
 * значок в таблице. Запись без статуса (старые данные) — видна.
 */
function видно(status: string | undefined, можно: string[]): boolean {
  return !status || можно.includes(status);
}

/**
 * Пришёл ли ответ сервера (или стало ясно, что его не будет). До этого в
 * данных только семена: запись, заведённая в панели, в них ещё не
 * появилась, и ссылку на неё рано считать битой.
 */
const ContentReadyContext = createContext(false);

export function useContentReady(): boolean {
  return useContext(ContentReadyContext);
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content>(SEED);
  const [готово, setГотово] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no content"))))
      .then((data: Content) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {
        // Сети нет — остаёмся на семенах. Это полноценный набор, а не
        // заглушка, поэтому показывать ошибку туристу незачем.
      })
      .finally(() => {
        if (!cancelled) setГотово(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentContext.Provider value={content}>
      <ContentReadyContext.Provider value={готово}>{children}</ContentReadyContext.Provider>
    </ContentContext.Provider>
  );
}

/**
 * Данные под теми же именами, что стояли в макете.
 *
 * Экраны писались под константы из `data/content`, и такой вид позволил
 * перевести их на живой источник одной строкой в каждом файле.
 */
export function useAppContent() {
  const content = useContext(ContentContext);
  const { трК } = useT();

  /*
   * Переводим только те поля, что не служат ключами поиска: категорию,
   * тег, кухню. Имя и город остаются как есть — по городу ищется погода,
   * а имя-топоним мы не коверкаем. Незнакомая словарю строка (новое из
   * панели) возвращается как введена.
   */
  // entry содержит либо цену ($8 — трК вернёт как есть), либо «Бесплатно» —
  // и его переводим: это не ключ поиска, только текст на карточке.
  // name переводим тоже: в неродном интерфейсе кириллическое название рядом
  // с переведённым текстом читалось как ошибка. city НЕ трогаем — это ключ
  // поиска погоды; его перевод делается на месте показа (трК на карточке).
  const мПлейс = (p: (typeof content.places)[number]) => ({
    ...p,
    nameRu: p.name,
    typeRu: p.type,
    name: трК(p.name),
    type: трК(p.type),
    desc: трК(p.desc),
    entry: трК(p.entry),
  });
  // Удобства (facilities) не переводим здесь: иконку в деталях выбирают по
  // русскому ключу, поэтому перевод делается на месте показа (details.tsx),
  // где сырой ключ остаётся для иконки, а рядом рисуется его перевод.
  const мОтель = (h: (typeof content.hotels)[number]) => ({ ...h, tag: трК(h.tag), desc: трК(h.desc) });
  const мРест = (r: (typeof content.restaurants)[number]) => ({
    ...r,
    name: трК(r.name),
    cuisine: трК(r.cuisine),
    desc: трК(r.desc),
  });

  /*
   * База засеяна старой зеленью #2E7D5A/#1A5C3A — до смены палитры на
   * бирюзу. Записи в базе мы не переписываем (их мог менять редактор),
   * но на показе подменяем: иначе шапка маршрута оставалась зелёной
   * посреди бирюзового приложения.
   *
   * Подставляем конкретный цвет, а не переменную темы: по этому цвету
   * считается контраст текста на карточке, а значение переменной в JS
   * неизвестно.
   */
  const СТАРАЯ_ЗЕЛЕНЬ = new Set(["#2E7D5A", "#2e7d5a", "#1A5C3A", "#1a5c3a"]);
  const мЦвет = (цвет: string) => (СТАРАЯ_ЗЕЛЕНЬ.has(цвет) ? "#0E6F66" : цвет);

  return {
    // Сезонное место — тоже место: оно открыто в свой сезон.
    PLACES: content.places.filter((p) => видно(p.status, ["active", "seasonal"])).map(мПлейс),
    HOTELS: content.hotels.filter((h) => видно(h.status, ["active"])).map(мОтель),
    RESTAURANTS: content.restaurants.filter((r) => видно(r.status, ["active"])).map(мРест),
    ROUTES: content.routes
      .filter((r) => видно(r.status, ["active"]))
      .map((r) => ({ ...r, color: мЦвет(r.color) })),
    EVENTS: content.events
      .filter((e) => видно(e.status, ["active", "upcoming"]))
      .map((e) => ({ ...e, color: мЦвет(e.color) })),
    // На главной показываются только отмеченные города; порядок задаёт
    // редактор в панели.
    POPULAR_CITIES: content.cities.filter((c) => c.featured && видно(c.status, ["active"])),
    CITIES: content.cities.filter((c) => видно(c.status, ["active"])),
    // Скрытый в панели аудиогид сразу пропадает у туристов.
    AUDIO: (content.audio ?? []).filter((a) => a.active),
    // Приостановленная в панели кампания сразу исчезает из приложения.
    ADS: content.ads
      .filter((a) => a.status === "active")
      .map((a) => {
        const м = МЕДИА_РЕКЛАМЫ.get(a.id);
        return {
          ...a,
          color: мЦвет(a.color),
          imageUrl: a.imageUrl ?? м?.imageUrl,
          videoUrl: a.videoUrl ?? м?.videoUrl,
          skipAfter: a.skipAfter ?? м?.skipAfter,
        };
      }),
  };
}
