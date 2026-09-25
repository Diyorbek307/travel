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

/** Какие картинки принимаем. Тип потом уходит в Content-Type ответа. */
const ТИПЫ = "jpeg|png|webp|gif";
const ФОРМА = new RegExp(`^data:image/(?:${ТИПЫ});base64,[A-Za-z0-9+/]+=*$`);

/** Снимок профиля, а не фотоархив: data-URL не длиннее 400 000 знаков. */
export const MAX_PHOTO_CHARS = 400_000;

/**
 * Годится ли присланное как снимок профиля.
 *
 * Проверка не только на размер. Тип из data-URL отдаётся браузеру как
 * есть, и без неё под видом снимка можно было положить
 * `data:text/html;base64,...` — страница со скриптом открылась бы с
 * нашего адреса.
 */
export function фотоГодится(dataUrl: string): boolean {
  return dataUrl.length <= MAX_PHOTO_CHARS && ФОРМА.test(dataUrl);
}

/** Тип картинки из data-URL, если он из разрешённых. */
export function типФото(dataUrl: string): string | null {
  return new RegExp(`^data:(image/(?:${ТИПЫ}));base64,`).exec(dataUrl)?.[1] ?? null;
}

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
