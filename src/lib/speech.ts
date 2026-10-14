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

const подходит = (тег: string, язык: string) =>
  тег.replace("_", "-").toLowerCase().startsWith(язык.toLowerCase());

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

/**
 * Номер разговора. Каждая новая фраза и каждое «замолчать» его меняют —
 * так длинный рассказ, читаемый по кусочкам, понимает, что его прервали,
 * и не продолжает следующим куском поверх новой фразы.
 */
let разговор = 0;

type Опции = {
  скорость?: number;
  /**
   * Чей голос: у каждой карточки места свой (номер из её id). Из голосов
   * нужного языка берётся голос с этим номером по кругу, и тон чуть
   * разный — даже если голос в телефоне один, карточки звучат по-разному.
   */
  голос?: number;
  конец?: () => void;
};

/** Тон по номеру голоса: 0.9–1.1, без номера — обычный. */
const тон = (голос?: number) => (голос == null ? 1 : 0.9 + (голос % 5) * 0.05);

/** Номер голоса нативного движка: из голосов языка — по кругу. */
async function нативныйГолос(код: string, голос?: number): Promise<number | undefined> {
  if (голос == null) return undefined;
  try {
    const { voices } = await (await плагин()).getSupportedVoices();
    const свои = voices.map((г, i) => ({ г, i })).filter(({ г }) => подходит(г.lang, код.slice(0, 2)));
    return свои.length ? свои[голос % свои.length].i : undefined;
  } catch {
    return undefined;
  }
}

/** Одна фраза: промис закрывается, когда фраза прозвучала (или сорвалась). */
async function произнести(текст: string, код: string, { скорость = 1, голос }: Опции): Promise<void> {
  if (нативно()) {
    try {
      const tts = await плагин();
      const фраза = {
        text: текст,
        lang: код,
        rate: скорость,
        pitch: тон(голос),
        voice: await нативныйГолос(код, голос),
        category: "playback",
      };
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
    return;
  }
  if (!("speechSynthesis" in window)) return;
  const синтез = window.speechSynthesis;
  const фраза = new SpeechSynthesisUtterance(текст);
  фраза.lang = код;
  const свои = синтез.getVoices().filter((г) => г.lang.replace("_", "-") === код.replace("_", "-"));
  const выбран = свои.length ? свои[(голос ?? 0) % свои.length] : undefined;
  if (выбран) фраза.voice = выбран;
  фраза.rate = скорость;
  фраза.pitch = тон(голос);
  await new Promise<void>((готово) => {
    фраза.onend = () => готово();
    фраза.onerror = () => готово();
    синтез.speak(фраза);
  });
}

/** Сказать фразу; новая фраза обрывает предыдущую. */
export async function сказать(текст: string, код: string, опции: Опции = {}): Promise<void> {
  if (typeof window === "undefined") return;
  разговор++;
  if (нативно()) {
    await (await плагин().catch(() => null))?.stop().catch(() => undefined);
  } else if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  } else {
    return опции.конец?.();
  }
  await произнести(текст, код, опции);
  опции.конец?.();
}

/**
 * Длинный рассказ — аудиогид. Браузеры обрывают длинную фразу на
 * середине (Chrome молчит после ~15 секунд одной фразы), поэтому читаем
 * по предложениям, кусками до ~220 знаков, один за другим. часть(i, n) —
 * какой кусок звучит, чтобы показать ход рассказа.
 */
export async function рассказать(
  текст: string,
  код: string,
  опции: Опции & { часть?: (номер: number, всего: number) => void } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  const куски = нарезать(текст);
  const мой = ++разговор;
  if (нативно()) {
    await (await плагин().catch(() => null))?.stop().catch(() => undefined);
  } else if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  } else {
    return опции.конец?.();
  }
  for (let i = 0; i < куски.length; i++) {
    if (мой !== разговор) return; // прервали — тот, кто прервал, сам скажет своё
    опции.часть?.(i, куски.length);
    await произнести(куски[i], код, опции);
  }
  if (мой === разговор) опции.конец?.();
}

/** Текст → куски по предложениям, не длиннее ~220 знаков. */
export function нарезать(текст: string, предел = 220): string[] {
  const предложения = текст
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?…。！？])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  const куски: string[] = [];
  for (const п of предложения) {
    const последний = куски[куски.length - 1];
    if (последний && последний.length + п.length + 1 <= предел) куски[куски.length - 1] = `${последний} ${п}`;
    else if (п.length <= предел) куски.push(п);
    // Слишком длинное предложение — режем по запятым.
    else
      for (const к of п.split(/(?<=[,;:—])\s+/)) {
        const хвост = куски[куски.length - 1];
        if (хвост && хвост.length + к.length + 1 <= предел) куски[куски.length - 1] = `${хвост} ${к}`;
        else куски.push(к);
      }
  }
  return куски;
}

/** Замолчать сразу. */
export function замолчать(): void {
  if (typeof window === "undefined") return;
  разговор++;
  if (нативно()) {
    void плагин()
      .then((tts) => tts.stop())
      .catch(() => undefined);
    return;
  }
  window.speechSynthesis?.cancel();
}
