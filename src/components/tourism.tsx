"use client";

import { BORDER, GOLD, GREEN, MUTED, ON_GOLD, SURFACE, TEXT } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";

/**
 * «Туризм Узбекистана»: чем страна открылась гостям.
 *
 * Каждая цифра здесь — с официальным источником, он указан внизу. Текст
 * о реформах, которые называют имя Президента, особенно не терпит
 * неточностей: одна придуманная цифра обесценила бы весь раздел. Если
 * цифры устареют, их правят здесь вместе со ссылкой.
 *
 * Ссылка на электронную визу — только на официальный портал МИД: в
 * поиске встречаются сайты с похожим адресом, берущие деньги за «визу».
 */

/**
 * Флаг Узбекистана. Рисуем сами, а не эмодзи 🇺🇿: Windows показывает
 * вместо него буквы «UZ». Пропорции 2:1; полосы — голубая, белая,
 * зелёная, между ними тонкие красные; в голубой — полумесяц и
 * двенадцать звёзд рядами по три, четыре и пять.
 */
export function ФлагУз({ ширина = 28 }: { ширина?: number }) {
  const звезда = (x: number, y: number) => {
    const r = 1.5;
    const точки = Array.from({ length: 10 }, (_, i) => {
      const угол = -Math.PI / 2 + (i * Math.PI) / 5;
      const д = i % 2 === 0 ? r : r * 0.4;
      return `${(x + д * Math.cos(угол)).toFixed(2)},${(y + д * Math.sin(угол)).toFixed(2)}`;
    });
    return <polygon key={`${x}-${y}`} points={точки.join(" ")} fill="#fff" />;
  };
  const ряды = [
    { y: 4, x: [30.2, 34.8, 39.4] },
    { y: 8.3, x: [25.6, 30.2, 34.8, 39.4] },
    { y: 12.6, x: [21, 25.6, 30.2, 34.8, 39.4] },
  ];
  return (
    <svg
      width={ширина}
      height={ширина / 2}
      viewBox="0 0 100 50"
      aria-hidden
      className="flex-shrink-0 overflow-hidden rounded-[3px]"
      style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}
    >
      <rect width="100" height="50" fill="#fff" />
      <rect width="100" height="16.2" fill="#0099B5" />
      <rect y="34" width="100" height="16" fill="#1EB53A" />
      <rect y="16" width="100" height="1" fill="#CE1126" />
      <rect y="33" width="100" height="1" fill="#CE1126" />
      <circle cx="12" cy="8.3" r="5.6" fill="#fff" />
      <circle cx="14" cy="8.3" r="4.7" fill="#0099B5" />
      {ряды.flatMap((р) => р.x.map((x) => звезда(x, р.y)))}
    </svg>
  );
}

const ПОРТАЛ_ВИЗ = "https://e-visa.gov.uz/";

const ФАКТЫ: { число: string | TKey; подпись: TKey; переводЧисла?: boolean }[] = [
  { число: "≈ 90", подпись: "tour_f_visa" },
  { число: "tour_f_evisa_num", подпись: "tour_f_evisa", переводЧисла: true },
  { число: "tour_f_tourists_num", подпись: "tour_f_tourists", переводЧисла: true },
];

const ИСТОЧНИКИ = [
  {
    текст: "Агентство статистики Республики Узбекистан — туристы за 2024 год (Kun.uz, 3.02.2025)",
    ссылка:
      "https://kun.uz/ru/news/2025/02/03/obyavleno-kolichestvo-turistov-posetivshix-uzbekistan-v-2024-godu",
  },
  {
    текст: "The Diplomat — безвизовый режим для 90 стран (2025)",
    ссылка:
      "https://thediplomat.com/2025/05/uzbekistan-seeks-to-increase-tourist-flows-floats-possibility-of-visa-free-regime-for-us-citizens/",
  },
  { текст: "e-visa.gov.uz — портал электронных виз МИД Республики Узбекистан", ссылка: ПОРТАЛ_ВИЗ },
];

export default function Туризм() {
  const { t } = useT();
  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-2xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
        <p
          className="flex items-center gap-2 text-lg font-bold leading-tight"
          style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
        >
          <ФлагУз />
          {t("tour_banner_title")}
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT }}>
          {t("tour_lead")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {ФАКТЫ.map((ф) => (
          <div
            key={ф.подпись}
            className="flex flex-col rounded-2xl border p-3"
            style={{ background: SURFACE, borderColor: BORDER }}
          >
            <p
              className="text-lg font-bold leading-tight"
              style={{ color: GREEN, fontFamily: "var(--font-heading)" }}
            >
              {ф.переводЧисла ? t(ф.число as TKey) : ф.число}
            </p>
            <p className="mt-1 text-[10px] leading-snug" style={{ color: MUTED }}>
              {t(ф.подпись)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
        <a
          href={ПОРТАЛ_ВИЗ}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold active:scale-[0.98]"
          style={{ background: GOLD, color: ON_GOLD }}
        >
          {t("tour_evisa_btn")} ↗
        </a>
        <p className="mt-2 text-center text-[10px]" style={{ color: MUTED }}>
          {t("tour_evisa_note")}
        </p>
      </div>

      <p className="px-1 text-sm leading-relaxed" style={{ color: TEXT }}>
        {t("tour_thanks")}
      </p>

      <div className="px-1">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>
          {t("tour_sources")}
        </p>
        <ul className="space-y-1">
          {ИСТОЧНИКИ.map((и) => (
            <li key={и.ссылка}>
              <a
                href={и.ссылка}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] leading-snug underline"
                style={{ color: MUTED }}
              >
                {и.текст}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
