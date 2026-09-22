import path from "node:path";
import { создатьХранилище } from "./storage";

/**
 * Мелкие настройки витрины, которые хочется менять без правки кода:
 * цифры на стартовом экране («500+ мест», «10 языков», «4.9 рейтинг»).
 *
 * Это подпись, а не каталог, поэтому храним отдельным маленьким
 * документом — тем же слоем, что и всё остальное (Postgres в бою, файл
 * локально). Меняет владелец в панели, читает стартовый экран.
 */

export interface SiteConfig {
  /** Сколько мест — строка, чтобы можно было написать «500+». */
  statPlaces: string;
  statLangs: string;
  statRating: string;
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "site-config.json");

export const САЙТ_ПО_УМОЛЧАНИЮ: SiteConfig = {
  statPlaces: "500+",
  statLangs: "10",
  statRating: "4.9",
};

const хранилище = создатьХранилище<Partial<SiteConfig>>(FILE, () => ({}));

export async function readSiteConfig(): Promise<SiteConfig> {
  return { ...САЙТ_ПО_УМОЛЧАНИЮ, ...(await хранилище.read()) };
}

export async function writeSiteConfig(next: SiteConfig): Promise<void> {
  const чисто: SiteConfig = {
    statPlaces: String(next.statPlaces ?? "").trim().slice(0, 12) || САЙТ_ПО_УМОЛЧАНИЮ.statPlaces,
    statLangs: String(next.statLangs ?? "").trim().slice(0, 12) || САЙТ_ПО_УМОЛЧАНИЮ.statLangs,
    statRating: String(next.statRating ?? "").trim().slice(0, 12) || САЙТ_ПО_УМОЛЧАНИЮ.statRating,
  };
  await хранилище.update(() => [чисто, undefined]);
}
