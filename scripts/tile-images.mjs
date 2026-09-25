/**
 * Иллюстрации для плиток «Исследовать»: из больших PNG — лёгкие WebP с
 * прозрачным фоном.
 *
 * Картинки рисуются на белом. В светлой теме это незаметно, а в тёмной
 * плитка получила бы белый квадрат. Поэтому фон вырезаем: заливкой от
 * краёв картинки по почти белым пикселям. Именно от краёв, а не по цвету
 * вообще — иначе прозрачными стали бы белые детали самого предмета
 * (корпус робота, машина такси). Тень под предметом не белая и остаётся.
 *
 *   node scripts/tile-images.mjs <папка с PNG>
 *
 * Результат — public/tiles/<имя>.webp.
 */
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const РАЗМЕР = 512;
/** Фон не темнее этого (по самому тёмному каналу)... */
const СВЕТЛЕЕ = 170;
/** ...и почти без цвета: разброс каналов не больше этого. */
const СЕРОСТЬ = 22;
/** Насколько соседние пиксели фона могут отличаться друг от друга. */
const ШАГ = 5;
/** Островки меньше этой доли картинки считаем крошками фона. */
const ОСТРОВОК = 0.004;
/**
 * Белые предметы (робот, поезд) по краю почти сливаются с фоном — для
 * них шаг строже, иначе заливка съедает корпус.
 */
const СТРОЖЕ = { "ai.png": 1, "transport.png": 1 };

const откуда = process.argv[2];
if (!откуда) {
  console.error("Укажите папку с PNG: node scripts/tile-images.mjs <папка>");
  process.exit(1);
}
const куда = path.join(process.cwd(), "public", "tiles");
mkdirSync(куда, { recursive: true });

for (const файл of readdirSync(откуда).filter((f) => f.endsWith(".png"))) {
  const { data, info } = await sharp(path.join(откуда, файл))
    .resize(РАЗМЕР, РАЗМЕР)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const к = (i, c) => data[i * 4 + c];
  // Фон — светлый и почти серый: цветное (бирюза, золото) в него не
  // попадёт никогда.
  const похожНаФон = (i) => {
    const мин = Math.min(к(i, 0), к(i, 1), к(i, 2));
    const макс = Math.max(к(i, 0), к(i, 1), к(i, 2));
    return мин >= СВЕТЛЕЕ && макс - мин <= СЕРОСТЬ;
  };
  // Фон на картинках не ровно белый, а с мягким переходом к краям.
  // Поэтому сравниваем соседей друг с другом, а не с белым: по плавному
  // переходу заливка идёт, на контуре предмета — упирается.
  const шаг = СТРОЖЕ[файл] ?? ШАГ;
  const рядом = (a, b) =>
    Math.abs(к(a, 0) - к(b, 0)) <= шаг && Math.abs(к(a, 1) - к(b, 1)) <= шаг && Math.abs(к(a, 2) - к(b, 2)) <= шаг;

  const фон = new Uint8Array(w * h);
  const очередь = [];
  const начать = (x, y) => {
    const i = y * w + x;
    if (!фон[i] && похожНаФон(i)) {
      фон[i] = 1;
      очередь.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    начать(x, 0);
    начать(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    начать(0, y);
    начать(w - 1, y);
  }
  while (очередь.length) {
    const i = очередь.pop();
    const x = i % w;
    const y = (i - x) / w;
    for (const j of [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]) {
      if (j === false || фон[j] || !похожНаФон(j) || !рядом(i, j)) continue;
      фон[j] = 1;
      очередь.push(j);
    }
  }

  // При строгом шаге в фоне остаются крошки — мелкие островки, не
  // связанные с предметом. Всё, что меньше ОСТРОВОК от площади, — тоже фон.
  const метка = new Int32Array(w * h).fill(-1);
  for (let старт = 0; старт < w * h; старт++) {
    if (фон[старт] || метка[старт] !== -1) continue;
    const остров = [старт];
    метка[старт] = старт;
    for (let k = 0; k < остров.length; k++) {
      const i = остров[k];
      const x = i % w;
      const y = (i - x) / w;
      for (const j of [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]) {
        if (j === false || фон[j] || метка[j] !== -1) continue;
        метка[j] = старт;
        остров.push(j);
      }
    }
    if (остров.length < w * h * ОСТРОВОК) for (const i of остров) фон[i] = 1;
  }

  // Маска прозрачности с чуть размытым краем — без «лесенки» по контуру.
  const маска = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) маска[i] = фон[i] ? 0 : 255;
  const мягкая = await sharp(маска, { raw: { width: w, height: h, channels: 1 } })
    .blur(0.8)
    .extractChannel(0)
    .raw()
    .toBuffer();
  for (let i = 0; i < w * h; i++) data[i * 4 + 3] = мягкая[i];

  const имя = файл.replace(/\.png$/, ".webp");
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(path.join(куда, имя));
  console.log(имя);
}
