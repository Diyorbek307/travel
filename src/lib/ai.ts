import Anthropic from "@anthropic-ai/sdk";

/**
 * Общий доступ к Claude для гида, переводчика по фото и автоперевода.
 *
 * Всё включается одной переменной ANTHROPIC_API_KEY. Без неё anthropic()
 * возвращает null, и каждая функция честно отвечает «выключено» — ничего
 * не падает, просто приложение скромнее.
 */

export const МОДЕЛЬ = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

let клиент: Anthropic | null = null;
export function anthropic(): Anthropic | null {
  const ключ = process.env.ANTHROPIC_API_KEY;
  if (!ключ) return null;
  клиент ??= new Anthropic({ apiKey: ключ });
  return клиент;
}

/** Весь текст ответа модели одной строкой. */
export function текстОтвета(ответ: Anthropic.Message): string {
  return ответ.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n")
    .trim();
}

/**
 * JSON из ответа модели. Просим чистый JSON, но на всякий случай снимаем
 * обёртку ```json … ``` и берём от первой скобки до последней.
 */
export function jsonИзОтвета<T>(текст: string): T | null {
  const без = текст.replace(/```(?:json)?/gi, "");
  const начало = без.search(/[[{]/);
  const конец = Math.max(без.lastIndexOf("}"), без.lastIndexOf("]"));
  if (начало < 0 || конец <= начало) return null;
  try {
    return JSON.parse(без.slice(начало, конец + 1)) as T;
  } catch {
    return null;
  }
}

/** Названия языков для подсказок модели. */
export const ИМЯ_ЯЗЫКА: Record<string, string> = {
  en: "English",
  ru: "Russian",
  uz: "Uzbek (Latin script)",
  zh: "Simplified Chinese",
  ko: "Korean",
  de: "German",
  fr: "French",
  ja: "Japanese",
  tr: "Turkish",
  ar: "Arabic",
};
