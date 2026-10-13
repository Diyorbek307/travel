"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Голос: навигатор, разговорник, аудиогид.
 *
 * В браузере говорит встроенный синтез речи (speechSynthesis). Во
 * встроенном окне Android-приложения его часто нет вовсе — поэтому в
 * приложении говорим через нативный модуль @capacitor-community/text-to-speech,
 * то есть тем же голосом, что и сам телефон (Google TTS, Samsung TTS…).
 *
 * Голоса нужного языка в телефоне может не оказаться — тогда молчим:
 * английский голос, читающий узбекские слова, только запутает.
 */

const КОД: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  uz: "uz-UZ",
  zh: "zh-CN",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  ja: "ja-JP",
  tr: "tr-TR",
  ar: "ar-SA",
};

function нативно(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("TextToSpeech");
  } catch {
    return false;
  }
}

async function плагин() {
  const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
  return TextToSpeech;
}

const подходит = (тег: string, язык: string) => тег.replace("_", "-").toLowerCase().startsWith(язык.toLowerCase());

/** Голоса браузера появляются не сразу — ждём список, но не дольше секунды. */
function голосаБраузера(): Promise<SpeechSynthesisVoice[]> {
  const синтез = window.speechSynthesis;
  const сразу = синтез.getVoices();
  if (сразу.length) return Promise.resolve(сразу);
  return new Promise((ok) => {
    const готово = () => ok(синтез.getVoices());
    синтез.addEventListener("voiceschanged", готово, { once: true });
    setTimeout(готово, 1000);
  });
}

/**
 * Каким языком говорить: код вида «ru-RU» или null, если голоса нет.
 * запасной — второй язык, если своего нет (для узбекского — турецкий:
 * так узбекскую фразу поймут лучше, чем английским голосом).
 */
export async function языкГолоса(язык: string, запасной?: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (нативно()) {
    try {
      const { languages } = await (await плагин()).getSupportedLanguages();
      const найти = (я: string) => languages.find((тег) => подходит(тег, я));
      return найти(язык) ?? (запасной ? найти(запасной) : undefined) ?? null;
    } catch {
      return null;
    }
  }
  if (!("speechSynthesis" in window)) return null;
  const голоса = await голосаБраузера();
  // Список пуст — браузер не сказал, что умеет; пробуем говорить по коду.
  if (!голоса.length) return КОД[язык] ?? null;
  const найти = (я: string) => голоса.find((г) => подходит(г.lang, я))?.lang;
  return найти(язык) ?? (запасной ? найти(запасной) : undefined) ?? null;
}

/** Сказать фразу; новая фраза обрывает предыдущую. */
export async function сказать(
  текст: string,
  код: string,
  { скорость = 1, конец }: { скорость?: number; конец?: () => void } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  if (нативно()) {
    try {
      const tts = await плагин();
      await tts.stop();
      const фраза = { text: текст, lang: код, rate: скорость, category: "playback" };
      try {
        await tts.speak(фраза);
      } catch {
        // Первый раз движок может ещё подгружать голос языка («Failed to
        // read text» на эмуляторе с первой русской фразой) — повторяем раз.
        await new Promise((r) => setTimeout(r, 500));
        await tts.speak(фраза);
      }
    } catch {
      // Не сказалось — подсказка всё равно на экране.
    }
    конец?.();
    return;
  }
  if (!("speechSynthesis" in window)) return конец?.();
  const синтез = window.speechSynthesis;
  const фраза = new SpeechSynthesisUtterance(текст);
  фраза.lang = код;
  const голос = синтез.getVoices().find((г) => г.lang.replace("_", "-") === код.replace("_", "-"));
  if (голос) фраза.voice = голос;
  фраза.rate = скорость;
  фраза.onend = () => конец?.();
  фраза.onerror = () => конец?.();
  синтез.cancel();
  синтез.speak(фраза);
}

/** Замолчать сразу. */
export function замолчать(): void {
  if (typeof window === "undefined") return;
  if (нативно()) {
    void плагин()
      .then((tts) => tts.stop())
      .catch(() => undefined);
    return;
  }
  window.speechSynthesis?.cancel();
}
