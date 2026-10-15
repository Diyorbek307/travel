// Скачивает шрифты Google Fonts в проект: woff2 по подмножествам
// (latin, cyrillic…) и готовый CSS с @font-face и unicode-range.
//
// Зачем: next/font/google качает шрифты во время сборки, и когда сервер
// сборки не достучался до fonts.googleapis.com, падала вся выкладка.
// Теперь файлы лежат в репозитории, сборке интернет не нужен.
//
// node scripts/fetch-fonts.mjs — перекачать (например, чтобы добавить вес).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const НАБОРЫ = [
  {
    css: "src/app/fonts.css",
    папка: "public/fonts",
    url: "/fonts",
    шрифты: [
      { семья: "Rubik", ось: "wght@300..900", подмножества: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"] },
      { семья: "Playfair Display", ось: "wght@400..900", подмножества: ["latin", "latin-ext", "cyrillic"] },
    ],
  },
  {
    css: "src/app/admin/fonts.css",
    папка: "public/fonts",
    url: "/fonts",
    шрифты: [
      { семья: "DM Sans", ось: "wght@300;400;500;600", подмножества: ["latin", "latin-ext"] },
      { семья: "Fraunces", ось: "wght@300;400;600", подмножества: ["latin"] },
      { семья: "JetBrains Mono", ось: "wght@400;500", подмножества: ["latin"] },
    ],
  },
  {
    css: "landing/src/app/fonts.css",
    папка: "landing/public/fonts",
    url: "/fonts",
    шрифты: [
      { семья: "Rubik", ось: "wght@300..900", подмножества: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"] },
      { семья: "Playfair Display", ось: "ital,wght@0,400..900;1,400..900", подмножества: ["latin", "latin-ext", "cyrillic"] },
      { семья: "Caveat", ось: "wght@400..700", подмножества: ["latin", "latin-ext", "cyrillic"] },
      { семья: "Oswald", ось: "wght@200..700", подмножества: ["latin", "latin-ext", "cyrillic"] },
      { семья: "Inter Tight", ось: "wght@400;500;600", подмножества: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"] },
    ],
  },
];

const корень = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const скачано = new Map();

for (const набор of НАБОРЫ) {
  mkdirSync(path.join(корень, набор.папка), { recursive: true });
  let итог = `/* Сгенерировано scripts/fetch-fonts.mjs — не править руками. */\n`;
  for (const ш of набор.шрифты) {
    const адрес = `https://fonts.googleapis.com/css2?family=${ш.семья.replace(/ /g, "+")}:${ш.ось}&display=swap`;
    const css = await (await fetch(адрес, { headers: { "User-Agent": UA } })).text();
    // Блоки идут с комментарием-подмножеством: /* cyrillic */ @font-face {...}
    for (const [, подмн, блок] of css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[^}]+\})/g)) {
      if (!ш.подмножества.includes(подмн)) continue;
      const src = блок.match(/url\((https:[^)]+\.woff2)\)/)[1];
      const стиль = блок.match(/font-style: (\w+)/)[1];
      const вес = блок.match(/font-weight: ([\d ]+)/)[1].trim().replace(" ", "-");
      const имя = `${ш.семья.toLowerCase().replace(/ /g, "-")}-${подмн}-${стиль}-${вес}.woff2`;
      if (!скачано.has(`${набор.папка}/${имя}`)) {
        const буфер = Buffer.from(await (await fetch(src)).arrayBuffer());
        writeFileSync(path.join(корень, набор.папка, имя), буфер);
        скачано.set(`${набор.папка}/${имя}`, буфер.length);
      }
      итог += `/* ${подмн} */\n${блок.replace(src, `${набор.url}/${имя}`).replace(/\n\s*/g, "\n  ").replace(/\n  \}$/, "\n}")}\n`;
    }
  }
  writeFileSync(path.join(корень, набор.css), итог);
  console.log(набор.css, (итог.match(/@font-face/g) ?? []).length, "faces");
}
let всего = 0;
for (const р of скачано.values()) всего += р;
console.log("files:", скачано.size, "size:", Math.round(всего / 1024), "KB");
