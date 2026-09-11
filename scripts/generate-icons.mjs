/**
 * Иконки приложения из одного исходника.
 *
 * Запуск: npm run icons
 *
 * Рисуем один раз в SVG (`public/icons/icon.svg` и `maskable.svg`), а все
 * растровые размеры получаем отсюда. Иначе при смене логотипа пришлось бы
 * вручную пересобирать десяток файлов и один непременно забыли бы —
 * а забытая иконка видна на экране телефона у каждого гостя.
 *
 * Почему PNG вообще нужны, если SVG уже есть:
 *
 *  - iOS не читает web-манифест. Иконку домашнего экрана он берёт только
 *    из <link rel="apple-touch-icon"> и только растровую. Без неё на
 *    айфоне вместо значка окажется скриншот страницы.
 *  - Часть лаунчеров Android и поисковые превью тоже ждут PNG.
 *
 * Прозрачность: Android умеет альфа-канал и сам обрежет «маскируемую»
 * иконку под форму лаунчера. iOS альфу не понимает — прозрачные углы он
 * заливает чёрным, поэтому для apple-touch-icon фон подкладываем сами.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/icons");
await mkdir(OUT, { recursive: true });

const icon = path.join(OUT, "icon.svg");
const maskable = path.join(OUT, "maskable.svg");

/** Тёмно-зелёный фон бренда — им заливаем углы там, где нельзя альфу. */
const ФОН = { r: 0x16, g: 0x3c, b: 0x2a, alpha: 1 };

const работы = [
  { из: icon, размер: 192, имя: "icon-192.png", плоско: false },
  { из: icon, размер: 512, имя: "icon-512.png", плоско: false },
  // Адаптивные иконки Android: лаунчер сам обрежет под свою форму.
  { из: maskable, размер: 192, имя: "maskable-192.png", плоско: false },
  { из: maskable, размер: 512, имя: "maskable-512.png", плоско: false },
  // Домашний экран iPhone — без альфы.
  { из: icon, размер: 180, имя: "apple-touch-icon.png", плоско: true },
  { из: icon, размер: 32, имя: "favicon-32.png", плоско: false },
];

for (const { из, размер, имя, плоско } of работы) {
  // density повышаем, чтобы SVG растеризовался без ступенек на крупных размерах.
  let конвейер = sharp(из, { density: 384 }).resize(размер, размер);
  if (плоско) конвейер = конвейер.flatten({ background: ФОН });
  const инфо = await конвейер.png({ compressionLevel: 9 }).toFile(path.join(OUT, имя));
  console.log(`${имя.padEnd(24)} ${инфо.width}×${инфо.height}  ${(инфо.size / 1024).toFixed(1)} КБ`);
}
