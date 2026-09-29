import { значения } from "./storage";
import { новыйИд, разобрать } from "./ad-media";

/**
 * Фотографии, загруженные в панели: гостиницы, номера, блюда, места.
 *
 * Лежат в том же общем хранилище, что и всё остальное, а в записях
 * остаётся короткая ссылка /api/media/<id>. Редактору не нужно искать,
 * где разместить снимок, — он просто выбирает файл с телефона.
 *
 * Панель сжимает фото до 1600 пикселей перед загрузкой, так что обычный
 * снимок весит сотни килобайт. Потолок ниже — страховка от огромных
 * файлов, если сжатие не сработало.
 */

export const МАКС_БАЙТ_ФОТО = 3 * 1024 * 1024;

/** Только растровые картинки: SVG может нести скрипт, его не принимаем. */
export const ТИПЫ_ФОТО = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ключ = (id: string) => `img:${id.replace(/[^\w-]/g, "")}`;

export type ИтогЗагрузки = { ok: true; id: string } | { ok: false; причина: "not_image" | "too_big" };

export async function сохранитьФото(dataUrl: string): Promise<ИтогЗагрузки> {
  const разбор = разобрать(dataUrl);
  if (!разбор || !ТИПЫ_ФОТО.includes(разбор.тип)) return { ok: false, причина: "not_image" };
  if (разбор.данные.length > МАКС_БАЙТ_ФОТО) return { ok: false, причина: "too_big" };
  const id = новыйИд();
  await значения.записать(ключ(id), dataUrl);
  return { ok: true, id };
}

export async function прочитатьФото(id: string): Promise<{ тип: string; данные: Buffer } | null> {
  const dataUrl = await значения.прочитать(ключ(id));
  if (!dataUrl) return null;
  const разбор = разобрать(dataUrl);
  return разбор && ТИПЫ_ФОТО.includes(разбор.тип) ? разбор : null;
}
