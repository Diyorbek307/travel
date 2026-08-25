"use client";

import { useEffect, useState } from "react";
import { useAppState } from "./app-state";
import { track } from "@/lib/track";
import { t } from "@/lib/i18n";
import Icon from "./icon";
import type { Lang } from "@/lib/types";

/**
 * Загрузка города для офлайн-режима (п. 11 ТЗ).
 *
 * Страница только запрашивает список URL у API и передаёт его Service Worker.
 * Само кэширование — забота воркера: так предметная логика и логика хранения
 * не смешиваются, и второй клиент (мобильное приложение) переиспользует API.
 */
export default function OfflineButton({
  citySlug,
  cityName,
  lang,
}: {
  citySlug: string;
  cityName: string;
  lang: Lang;
}) {
  const { ready, offlineCities, setOffline } = useAppState();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [swReady, setSwReady] = useState(false);

  const downloaded = offlineCities.includes(citySlug);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then(() => setSwReady(true)).catch(() => undefined);

    function onMessage(event: MessageEvent) {
      const data = event.data ?? {};
      if (data.city !== citySlug) return;
      if (data.type === "DOWNLOAD_PROGRESS") setProgress(data.done / data.total);
      if (data.type === "DOWNLOAD_DONE") {
        setProgress(null);
        setOffline(citySlug, true);
      }
    }
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [citySlug, setOffline]);

  async function download() {
    setError(null);
    const worker = navigator.serviceWorker?.controller;
    if (!worker) {
      // В режиме разработки воркер не регистрируется — сообщаем честно,
      // а не делаем вид, что город скачался.
      setError("Офлайн-режим работает в собранной версии приложения (npm run build).");
      return;
    }
    setProgress(0);
    try {
      const response = await fetch(`/api/offline/${citySlug}?lang=${lang}`);
      const data = await response.json();
      worker.postMessage({ type: "DOWNLOAD_CITY", city: citySlug, urls: data.urls });
      track("offline_download", { lang, meta: { city: citySlug, files: data.urls.length } });
    } catch {
      setProgress(null);
      setError("Не удалось получить список файлов. Проверьте соединение.");
    }
  }

  function remove() {
    navigator.serviceWorker?.controller?.postMessage({ type: "REMOVE_CITY", city: citySlug });
    setOffline(citySlug, false);
  }

  return (
    <div className="rounded-xl p-3 text-center surface">
      <span style={{ color: "var(--primary-text)" }}><Icon name={downloaded ? "shield" : "download"} size={24} /></span>
      {!ready ? (
        <div className="mt-1 text-sm soft">…</div>
      ) : progress != null ? (
        <div className="mt-1 text-sm soft">{Math.round(progress * 100)}%</div>
      ) : (
        <button
          onClick={downloaded ? remove : download}
          className="mt-1 text-sm"
          style={{ color: downloaded ? "var(--accent)" : "var(--text)" }}
          title={downloaded ? `${cityName} доступен офлайн` : undefined}
        >
          {downloaded ? t(lang, "downloaded") : t(lang, "download_city")}
        </button>
      )}
      {error && <p className="mt-1 text-[0.65rem] leading-tight soft">{error}</p>}
      {!swReady && !error && ready && (
        <p className="mt-1 text-[0.65rem] leading-tight soft">офлайн — в сборке</p>
      )}
    </div>
  );
}
