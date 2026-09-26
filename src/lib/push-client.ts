"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Push-уведомления на стороне приложения.
 *
 * Разрешение спрашиваем только по нажатию «Включить уведомления» в
 * профиле. Запрос сразу при входе люди почти всегда отклоняют, а
 * отклонённое браузер больше не даёт спросить — кнопка стала бы мёртвой
 * навсегда.
 *
 * Работает только в боевой сборке: при разработке сервис-воркер нарочно
 * не регистрируется (см. components/service-worker.tsx), а без него push
 * некуда доставить.
 */

export type СостояниеPush =
  /** Ещё выясняем. */
  | "проверка"
  /** Сервер без ключей или браузер не умеет push — кнопку не показываем. */
  | "недоступно"
  | "выключено"
  | "включено"
  /** Человек запретил уведомления в браузере: включить можно только там. */
  | "запрещено";

let ключСервера: Promise<string | null> | null = null;

function открытыйКлюч(): Promise<string | null> {
  ключСервера ??= fetch("/api/push")
    .then((r) => (r.ok ? r.json() : { publicKey: null }))
    .then((d: { publicKey?: string | null }) => d.publicKey ?? null)
    .catch(() => null);
  return ключСервера;
}

function браузерУмеет(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Ключ VAPID приходит строкой base64url, а браузеру нужны байты. */
function вБайты(base64: string): Uint8Array<ArrayBuffer> {
  const дополнено = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const сырые = atob(дополнено);
  const байты = new Uint8Array(new ArrayBuffer(сырые.length));
  for (let i = 0; i < сырые.length; i++) байты[i] = сырые.charCodeAt(i);
  return байты;
}

async function регистрация(): Promise<ServiceWorkerRegistration | null> {
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

async function отправитьПодписку(sub: PushSubscription, city: string | null): Promise<boolean> {
  const r = await fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON(), city }),
  }).catch(() => null);
  return Boolean(r?.ok);
}

/** Кнопка в профиле: состояние и действия. */
export function usePush(city: string | null) {
  const [состояние, setСостояние] = useState<СостояниеPush>("проверка");
  const [занято, setЗанято] = useState(false);

  useEffect(() => {
    let живо = true;
    (async () => {
      const ключ = await открытыйКлюч();
      if (!ключ || !браузерУмеет()) return живо && setСостояние("недоступно");
      if (Notification.permission === "denied") return живо && setСостояние("запрещено");
      const рег = await регистрация();
      const sub = await рег?.pushManager.getSubscription();
      if (живо) setСостояние(sub ? "включено" : "выключено");
    })();
    return () => {
      живо = false;
    };
  }, []);

  const включить = useCallback(async (): Promise<boolean> => {
    setЗанято(true);
    try {
      const ключ = await открытыйКлюч();
      const рег = await регистрация();
      if (!ключ || !рег) return false;
      const разрешение = await Notification.requestPermission();
      if (разрешение !== "granted") {
        setСостояние(разрешение === "denied" ? "запрещено" : "выключено");
        return false;
      }
      const sub =
        (await рег.pushManager.getSubscription()) ??
        (await рег.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: вБайты(ключ) }));
      const ок = await отправитьПодписку(sub, city);
      setСостояние(ок ? "включено" : "выключено");
      return ок;
    } catch {
      return false;
    } finally {
      setЗанято(false);
    }
  }, [city]);

  const выключить = useCallback(async () => {
    setЗанято(true);
    try {
      const sub = await (await регистрация())?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => undefined);
        await sub.unsubscribe();
      }
      setСостояние("выключено");
    } finally {
      setЗанято(false);
    }
  }, []);

  return { состояние, занято, включить, выключить };
}

/**
 * Освежить город у подписки при открытии приложения.
 *
 * Кампании «по городу» рассылаются тем, кто в этом городе. Город у
 * подписки записан в момент включения, а человек с тех пор мог уехать из
 * Ташкента в Бухару. Ничего не спрашивает: работает, только если
 * подписка уже есть.
 */
export function useГородПодписки(city: string | null) {
  useEffect(() => {
    if (!city || !браузерУмеет() || Notification.permission !== "granted") return;
    (async () => {
      const sub = await (await регистрация())?.pushManager.getSubscription();
      if (sub) await отправитьПодписку(sub, city);
    })().catch(() => undefined);
  }, [city]);
}
