/**
 * Фото «Красивых мест» с Wikimedia Commons — к себе, в public/scenic.
 *
 * Держим у себя, а не ссылкой на Commons: чужой сервер может ответить
 * медленно или сменить адрес. Лицензии CC BY-SA и CC0 это разрешают;
 * автора и лицензию карточка места показывает под галереей (credits).
 *
 *   node scripts/scenic-photos.mjs
 */
import { existsSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const C = "https://upload.wikimedia.org/wikipedia/commons/";
const T = "https://thumb.wikimedia.org/wikipedia/commons/thumb/";
const ФОТО = {
  "kitob-1": T + "3/3c/Kitob_dovoni.jpg/960px-Kitob_dovoni.jpg",
  "kitob-2": C + "3/39/Kitab_davlat_qo%27riqxonasi_tabiati.jpg",
  "kitob-3": C + "e/ef/Kitob_davlat_qo%27riqxonasining_manzarasi.jpg",
  "urungach-1":
    T +
    "c/cb/%D0%92%D0%B8%D0%B4_%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9_%D0%A3%D1%80%D1%83%D0%BD%D0%B3%D0%B0%D1%87.jpg/960px-%D0%92%D0%B8%D0%B4_%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9_%D0%A3%D1%80%D1%83%D0%BD%D0%B3%D0%B0%D1%87.jpg",
  "urungach-2": C + "1/1b/Lake_Urungach_01.jpg",
  "urungach-3": C + "0/06/Lake_Urungach_03.jpg",
  "sarmish-1": T + "5/5c/2023.03.20_Sarmishsay_003.jpg/960px-2023.03.20_Sarmishsay_003.jpg",
  "sarmish-2": T + "f/f3/2023.03.20_Sarmishsay_012.jpg/960px-2023.03.20_Sarmishsay_012.jpg",
  "sarmish-3": T + "4/4e/2023.03.20_Sarmishsay_071.jpg/960px-2023.03.20_Sarmishsay_071.jpg",
  "muynak-2": T + "2/2b/Muynak_%288600908422%29.jpg/960px-Muynak_%288600908422%29.jpg",
  "muynak-3": T + "1/1c/Muynak_%288600898948%29.jpg/960px-Muynak_%288600898948%29.jpg",
  "sentob-1": T + "e/e5/Sentob_valley.jpg/960px-Sentob_valley.jpg",
  "sentob-2": T + "4/45/Nuratau_mountains_and_Aydar_lake.jpg/960px-Nuratau_mountains_and_Aydar_lake.jpg",
  "sentob-3": T + "5/5a/Sap_village.jpg/960px-Sap_village.jpg",
  "shohimardon-1":
    T +
    "4/49/Shohimardon_qishlog%CA%BBining_yuqoridan_ko%CA%BBrinishi.jpg/960px-Shohimardon_qishlog%CA%BBining_yuqoridan_ko%CA%BBrinishi.jpg",
  "shohimardon-2":
    T + "b/bf/Hazrat_Ali_Shohimardon_ziyoratgohi.jpg/960px-Hazrat_Ali_Shohimardon_ziyoratgohi.jpg",
  "shohimardon-3": C + "4/4e/Shohimardon_turistik_zonasi.jpg",
  "zaamin-3":
    T +
    "3/3e/Sunset_landscape_at_the_Zaamin_National_Park.jpg/960px-Sunset_landscape_at_the_Zaamin_National_Park.jpg",
  "zaamin-4":
    T + "b/bc/Landscape_of_the_Zaamin_National_park.jpg/960px-Landscape_of_the_Zaamin_National_park.jpg",
  "boysun-4": T + "b/bb/Khoja_Gur_Gur_Ota_05.jpg/960px-Khoja_Gur_Gur_Ota_05.jpg",
};

mkdirSync("public/scenic", { recursive: true });
for (const [имя, url] of Object.entries(ФОТО)) {
  // Уже скачанное не трогаем: Commons ограничивает частоту запросов.
  if (existsSync(`public/scenic/${имя}.webp`)) continue;
  await new Promise((ok) => setTimeout(ok, 1500));
  const r = await fetch(url, { headers: { "User-Agent": "HelloUZ/1.0 (travel app; contact via site)" } });
  if (!r.ok) {
    console.log("✗", имя, r.status);
    continue;
  }
  const буфер = Buffer.from(await r.arrayBuffer());
  const итог = await sharp(буфер)
    .rotate()
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(`public/scenic/${имя}.webp`);
  console.log("✓", имя, итог.width + "×" + итог.height, Math.round(итог.size / 1024) + " КБ");
}
