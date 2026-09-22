import path from "node:path";
import { создатьХранилище } from "./storage";
import type { AdPolicy } from "./types";

/**
 * Правило показа полноэкранной видео-рекламы.
 *
 * Лежит отдельно от содержимого: это не запись каталога, а настройка
 * поведения, и менять её должен только владелец. Хранится тем же слоем,
 * что и всё остальное (Postgres в бою, файл локально).
 *
 * По умолчанию реклама включена, но бережная: не чаще раза в четыре
 * минуты и на каждый третий переход между экранами. Разом эти два
 * условия не дают ей выскакивать на каждом шагу.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "ad-policy.json");

export const ПОЛИТИКА_ПО_УМОЛЧАНИЮ: AdPolicy = {
  fullscreen: true,
  everyMinutes: 4,
  everyNav: 3,
};

const хранилище = создатьХранилище<Partial<AdPolicy>>(FILE, () => ({}));

export async function readAdPolicy(): Promise<AdPolicy> {
  // Сохранённое кладём поверх умолчаний: не хватает поля — берётся
  // разумное значение, а не пусто.
  return { ...ПОЛИТИКА_ПО_УМОЛЧАНИЮ, ...(await хранилище.read()) };
}

export async function writeAdPolicy(next: AdPolicy): Promise<void> {
  // Чистим значения: минуты и «каждый N-й» — неотрицательные числа,
  // everyNav не меньше единицы (ноль означал бы показ на каждый переход
  // без счётчика — это уже не «иногда»).
  const чисто: AdPolicy = {
    fullscreen: Boolean(next.fullscreen),
    everyMinutes: Math.max(0, Math.round(Number(next.everyMinutes) || 0)),
    everyNav: Math.max(1, Math.round(Number(next.everyNav) || 1)),
  };
  await хранилище.update(() => [чисто, undefined]);
}
