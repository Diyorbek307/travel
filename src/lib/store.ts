import path from "node:path";
import { SEED } from "@/data/seed";
import { createFileStore } from "./file-store";
import type { Content } from "@/lib/types";

/**
 * Хранилище содержимого платформы.
 *
 * Один файл JSON: объём — сотни записей, и городить ради этого базу
 * незачем. Пока файла нет, отдаются семена, поэтому пустой развёрнутый
 * экземпляр сразу выглядит наполненным.
 *
 * Запись идёт через общую очередь: два редактора, нажавшие «Сохранить»
 * одновременно, иначе затёрли бы правки друг друга.
 *
 * ВАЖНО о сохранности. Каталог берётся из DATA_DIR, а на бесплатном
 * тарифе Render постоянного диска нет: файловая система контейнера
 * обнуляется при перезапуске и выкате, и правки редакторов пропадут.
 * Чтобы они жили, нужен тариф с диском и DATA_DIR, указывающий на него.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "content.json");

const хранилище = createFileStore<Partial<Content>>(FILE, () => ({}));

export async function readContent(): Promise<Content> {
  // Семена подкладываются снизу: если в сохранённом файле не хватает
  // раздела, добавленного позже, он не окажется пустым.
  return { ...SEED, ...(await хранилище.read()) };
}

export async function writeContent(next: Content): Promise<void> {
  await хранилище.update(() => [next, undefined]);
}
