import path from "node:path";

/**
 * Расположение изменяемых данных: база и загруженные медиафайлы.
 *
 * Локально это каталог `data/` в проекте. На хостинге вроде Render файловая
 * система контейнера эфемерна — всё, что записано в код проекта, пропадает
 * при перезапуске. Поэтому путь выносится в переменную `DATA_DIR`:
 * туда монтируется постоянный диск.
 *
 * Файл намеренно на обычном JavaScript, а не на TypeScript: его импортируют
 * и приложение, и скрипт наполнения базы, который запускается голым node.
 */

export function dataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

export function dbPath() {
  return path.join(dataDir(), "app.db");
}

/**
 * Каталог загруженных аудиогидов.
 *
 * Отдаётся не статикой Next.js, а обработчиком `/media/[...path]`: статика
 * раздаётся только из `public/`, который лежит внутри образа и тоже эфемерен.
 */
export function mediaDir() {
  return path.join(dataDir(), "media");
}
