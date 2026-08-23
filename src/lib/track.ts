"use client";

import type { EventType } from "./types";

/**
 * Отправка обезличенных событий аналитики (п. 17 ТЗ).
 *
 * Идентификатор сессии — случайная строка, живущая только в sessionStorage.
 * Он не связан с личностью, не переживает закрытие вкладки и никуда,
 * кроме собственного сервера, не уходит.
 */

const SESSION_KEY = "uz_session";

function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function track(
  type: EventType,
  payload: { city_id?: number; poi_id?: number; lang?: string; meta?: unknown } = {},
): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ type, session: sessionId(), ...payload });

  // sendBeacon переживает уход со страницы; fetch — запасной путь.
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
