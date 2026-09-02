import path from "node:path";
import { SEED } from "@/data/seed";
import { создатьХранилище } from "./storage";
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
 * О сохранности заботится storage.ts: при заданном DATABASE_URL всё
 * ложится во внешнюю базу и переживает перезапуски, иначе — в файлы, что
 * годится только для своей машины.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "content.json");

const хранилище = создатьХранилище<Partial<Content>>(FILE, () => ({}));

export async function readContent(): Promise<Content> {
  // Семена подкладываются снизу: если в сохранённом файле не хватает
  // раздела, добавленного позже, он не окажется пустым.
  return { ...SEED, ...(await хранилище.read()) };
}

export async function writeContent(next: Content): Promise<void> {
  await хранилище.update(() => [next, undefined]);
}
