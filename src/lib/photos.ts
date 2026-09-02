import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

/**
 * Фотографии профилей — отдельными файлами, не внутри учётной записи.
 *
 * Раньше снимок лежал прямо в users.json как data-URL. Сто человек с
 * фотографиями раздували файл с 758 КБ до 4,7 МБ, а он переписывается
 * целиком при каждой записи — включая отметку «был в сети» на каждом
 * открытии приложения. Замерено: 30 мс в среднем и 80 в пике только на
 * то, чтобы сказать «этот человек зашёл».
 *
 * Теперь снимок живёт своим файлом, а в записи остаётся лишь отметка,
 * что он есть. Горячий файл снова маленький, а картинка отдаётся
 * отдельным запросом и кэшируется браузером.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const PHOTOS_DIR = path.join(DATA_DIR, "photos");

/** Имя файла собираем сами: в идентификаторе могло бы прийти «..». */
function файл(userId: string): string {
  return path.join(PHOTOS_DIR, `${userId.replace(/[^\w-]/g, "")}.txt`);
}

export async function savePhoto(userId: string, dataUrl: string): Promise<void> {
  await mkdir(PHOTOS_DIR, { recursive: true });
  const tmp = `${файл(userId)}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tmp, dataUrl, "utf8");
  await rename(tmp, файл(userId));
}

export async function readPhoto(userId: string): Promise<string | null> {
  try {
    return await readFile(файл(userId), "utf8");
  } catch {
    return null;
  }
}

export async function deletePhoto(userId: string): Promise<void> {
  await unlink(файл(userId)).catch(() => undefined);
}
