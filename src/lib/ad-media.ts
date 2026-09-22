import { randomBytes } from "node:crypto";
import { значения } from "./storage";

/**
 * Ролики рекламодателей — прямо в общем хранилище (та же база, что и всё
 * остальное; отдельный сервис не нужен). Рекламодатель прислал mp4 —
 * владелец загружает его в панели, файл ложится сюда, а в объявлении
 * остаётся короткая ссылка /api/ad-media/<id>.
 *
 * Своё хранилище лучше сторонних ссылок: YouTube и Google Drive не
 * отдают файл для проигрывания (на телефоне выходит чёрный экран или
 * кнопка «play»), а свой mp4 играет сразу и со звуком.
 *
 * Держим в разумных рамках: видео весит мегабайты, а лежит в базе
 * строкой — десяток коротких роликов это переживёт, полнометражные
 * фильмы сюда класть не надо.
 */

/** Больше — уже не «короткий ролик»: бережём память бесплатного стенда. */
export const МАКС_БАЙТ = 15 * 1024 * 1024;

function ключ(id: string): string {
  return `advideo:${id.replace(/[^\w-]/g, "")}`;
}

export function новыйИд(): string {
  return `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
}

/** Сохраняет data-URL ролика. Возвращает id для ссылки. */
export async function saveAdVideo(dataUrl: string): Promise<string> {
  const id = новыйИд();
  await значения.записать(ключ(id), dataUrl);
  return id;
}

export async function readAdVideo(id: string): Promise<string | null> {
  return значения.прочитать(ключ(id));
}

export async function deleteAdVideo(id: string): Promise<void> {
  await значения.удалить(ключ(id));
}

/** Разбирает data-URL на тип и бинарные данные. */
export function разобрать(dataUrl: string): { тип: string; данные: Buffer } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
  if (!m) return null;
  return { тип: m[1], данные: Buffer.from(m[2], "base64") };
}
