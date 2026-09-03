"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SEED } from "@/data/seed";
import type { Content } from "@/lib/types";

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

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content>(SEED);

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
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/**
 * Данные под теми же именами, что стояли в макете.
 *
 * Экраны писались под константы из `data/content`, и такой вид позволил
 * перевести их на живой источник одной строкой в каждом файле.
 */
export function useAppContent() {
  const content = useContext(ContentContext);
  return {
    PLACES: content.places,
    HOTELS: content.hotels,
    RESTAURANTS: content.restaurants,
    ROUTES: content.routes,
    EVENTS: content.events,
    // На главной показываются только отмеченные города; порядок задаёт
    // редактор в панели.
    POPULAR_CITIES: content.cities.filter((c) => c.featured),
    CITIES: content.cities,
    // Скрытый в панели аудиогид сразу пропадает у туристов.
    AUDIO: (content.audio ?? []).filter((a) => a.active),
    // Приостановленная в панели кампания сразу исчезает из приложения.
    ADS: content.ads.filter((a) => a.status === "active"),
  };
}
