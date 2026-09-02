import { значения } from "./storage";

/**
 * Фотографии профилей — отдельно от учётных записей.
 *
 * Раньше снимок лежал прямо в users.json как data-URL. Сто человек с
 * фотографиями раздували файл с 758 КБ до 4,7 МБ, а он переписывается
 * целиком при каждой записи — включая отметку «был в сети» на каждом
 * открытии приложения. Замерено: 30 мс в среднем и 80 в пике только на
 * то, чтобы сказать «этот человек зашёл».
 *
 * Теперь снимок хранится своим значением, а в записи остаётся лишь
 * отметка, что он есть. Горячий документ снова маленький, а картинка
 * отдаётся отдельным запросом и кэшируется браузером.
 *
 * Где именно лежит значение — в базе или в файле — решает storage.ts.
 */

/** Ключ собираем сами: в идентификаторе могло бы прийти «..». */
function ключ(userId: string): string {
  return `photo:${userId.replace(/[^\w-]/g, "")}`;
}

export async function savePhoto(userId: string, dataUrl: string): Promise<void> {
  await значения.записать(ключ(userId), dataUrl);
}

export async function readPhoto(userId: string): Promise<string | null> {
  return значения.прочитать(ключ(userId));
}

export async function deletePhoto(userId: string): Promise<void> {
  await значения.удалить(ключ(userId));
}
