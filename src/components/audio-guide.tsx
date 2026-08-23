"use client";

import { useEffect, useRef, useState } from "react";
import { useAppState } from "./app-state";
import { track } from "@/lib/track";
import type { Lang } from "@/lib/types";

/**
 * Аудиогид объекта (п. 6 ТЗ).
 *
 * Если для языка загружена профессиональная запись — играем её.
 * Пока записи нет, озвучиваем текст синтезом речи браузера и честно
 * помечаем это в интерфейсе: демонстрировать «профессиональный аудиогид»
 * там, где его нет, нельзя — заказчик должен видеть реальный статус контента.
 */

/** Голос синтеза читает примерно 150 слов в минуту. */
const WORDS_PER_MINUTE = 150;

/** Языковые коды для speechSynthesis. */
const SPEECH_LOCALE: Partial<Record<Lang, string>> = {
  ru: "ru-RU",
  uz: "uz-UZ",
  en: "en-GB",
  zh: "zh-CN",
  ko: "ko-KR",
  tr: "tr-TR",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ar: "ar-SA",
};

export default function AudioGuide({
  slug,
  name,
  story,
  audioUrl,
  durationSec,
  lang,
  poiId,
  cityId,
}: {
  slug: string;
  name: string;
  story: string | null;
  audioUrl?: string | null;
  durationSec?: number | null;
  lang: Lang;
  poiId: number;
  cityId: number;
}) {
  const { addListen } = useAppState();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const plainStory = story ? stripMarkdown(story) : "";
  const estimatedSec = durationSec ?? Math.round((plainStory.split(/\s+/).length / WORDS_PER_MINUTE) * 60);

  useEffect(() => {
    setSpeechAvailable(typeof window !== "undefined" && "speechSynthesis" in window);
    // Уходя со страницы, обрываем чтение — иначе голос продолжит звучать.
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function finish(completed: boolean) {
    setPlaying(false);
    setProgress(completed ? 1 : progress);
    addListen({ slug, name, completed });
    if (completed) track("audio_complete", { poi_id: poiId, city_id: cityId, lang });
  }

  /* --- Профессиональная запись ------------------------------------- */

  if (audioUrl) {
    return (
      <section className="rounded-xl p-4 surface">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">🎧</span>
          <span className="font-medium">Аудиогид</span>
          {durationSec ? (
            <span className="text-xs soft">{formatClock(durationSec)}</span>
          ) : null}
        </div>
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          preload="none"
          className="w-full"
          onPlay={() => {
            setPlaying(true);
            track("audio_start", { poi_id: poiId, city_id: cityId, lang });
          }}
          onEnded={() => finish(true)}
          onPause={() => setPlaying(false)}
        />
      </section>
    );
  }

  /* --- Синтез речи как временная замена ----------------------------- */

  function speak() {
    if (!plainStory) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(plainStory);
    utterance.lang = SPEECH_LOCALE[lang] ?? "ru-RU";
    utterance.rate = 0.95;

    const totalChars = plainStory.length;
    utterance.onboundary = (e) => {
      if (e.charIndex) setProgress(Math.min(1, e.charIndex / totalChars));
    };
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);

    synth.speak(utterance);
    setPlaying(true);
    setProgress(0);
    track("audio_start", { poi_id: poiId, city_id: cityId, lang });
  }

  function stop() {
    window.speechSynthesis.cancel();
    finish(false);
  }

  return (
    <section className="rounded-xl p-4 surface">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🎧</span>
        <span className="font-medium">Аудиогид</span>
        <span className="text-xs soft">≈ {formatClock(estimatedSec)}</span>
      </div>

      {!plainStory ? (
        <p className="text-sm soft">Текст истории для этого объекта ещё не написан.</p>
      ) : !speechAvailable ? (
        <p className="text-sm soft">
          Браузер не поддерживает озвучивание. Историю можно прочитать ниже.
        </p>
      ) : (
        <>
          <button
            onClick={playing ? stop : speak}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            {playing ? "⏹ Остановить" : "▶ Слушать историю"}
          </button>

          {playing && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-soft">
              <div
                className="h-full transition-[width] duration-300"
                style={{ width: `${progress * 100}%`, background: "var(--accent)" }}
              />
            </div>
          )}
        </>
      )}

      <p className="mt-3 text-xs leading-relaxed soft">
        Демонстрационная озвучка синтезом речи. Профессиональная запись диктора
        загружается через админ-панель и автоматически заменяет синтез.
      </p>
    </section>
  );
}

/** Убирает разметку, чтобы синтезатор не читал звёздочки и решётки. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[*_#`>]/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
