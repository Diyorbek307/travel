import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { SEED } from "@/data/seed";
import type { Content } from "@/lib/types";

/**
 * Хранилище содержимого платформы.
 *
 * Один файл JSON на диске: объём — сотни записей, и городить ради этого
 * базу незачем. Пока файла нет, отдаются семена, поэтому пустой
 * развёрнутый экземпляр сразу выглядит наполненным.
 *
 * ВАЖНО о сохранности. Каталог берётся из DATA_DIR, а на бесплатном
 * тарифе Render постоянного диска нет: файловая система контейнера
 * обнуляется при перезапуске и выкате, и правки редакторов пропадут.
 * Чтобы они жили, нужен тариф с диском и DATA_DIR, указывающий на него.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "content.json");

/** Кэш процесса: файл читается один раз, дальше живёт в памяти. */
let cache: Content | null = null;

export async function readContent(): Promise<Content> {
  if (cache) return cache;
  try {
    const raw = await readFile(FILE, "utf8");
    // Семена подкладываются снизу: если в сохранённом файле не хватает
    // раздела, добавленного позже, он не окажется пустым.
    cache = { ...SEED, ...(JSON.parse(raw) as Partial<Content>) };
  } catch {
    cache = SEED;
  }
  return cache;
}

export async function writeContent(next: Content): Promise<void> {
  cache = next;
  await mkdir(DATA_DIR, { recursive: true });

  // Пишем во временный файл и переименовываем: если процесс упадёт на
  // середине записи, на диске останется прошлая целая версия, а не
  // обрезанный JSON, который потом не прочитается.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await rename(tmp, FILE);
}
