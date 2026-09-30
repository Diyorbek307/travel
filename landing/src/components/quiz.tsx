"use client";

import { useState } from "react";
import { APP_URL, useЯзык, тр, type Многоязычно } from "@/lib/i18n";
import Reveal from "./reveal";

/**
 * «Какая поездка вам подходит?» — три вопроса и готовый маршрут по дням
 * из настоящих мест HelloUZ. Кнопка открывает его прямо в приложении:
 * ссылка «/?trip=<код>» (формат — src/lib/trip.ts приложения).
 */

type Интерес = "history" | "nature" | "food";
type Старт = "tashkent" | "samarkand" | "bukhara";

interface Точка {
  вид: "p" | "r";
  id: string;
  /** Имена собственные: по-русски и латиницей для остальных языков. */
  имя: Многоязычно;
}

const м = (id: string, ru: string, en: string): Точка => ({ вид: "p", id, имя: { ru, en } });
const р = (id: string, ru: string, en: string): Точка => ({ вид: "r", id, имя: { ru, en } });

/** Дни по городам: сперва город старта, дальше — по Шёлковому пути. */
const ДНИ: Record<Интерес, Record<Старт | "khiva" | "extra", Точка[][]>> = {
  history: {
    tashkent: [
      [
        м("14-hast", "Хаст-Имам", "Hast-Imam"),
        м("15-chorsu", "Базар Чорсу", "Chorsu Bazaar"),
        м("22-timur", "Музей Амира Темура", "Amir Timur Museum"),
      ],
    ],
    samarkand: [
      [
        м("1-reg", "Регистан", "Registan"),
        м("6-gur", "Гур-Эмир", "Gur-e-Amir"),
        м("2-shah", "Шахи-Зинда", "Shah-i-Zinda"),
      ],
      [
        м("9-bibi", "Мечеть Биби-Ханым", "Bibi-Khanym Mosque"),
        м("10-ulug", "Обсерватория Улугбека", "Ulugh Beg Observatory"),
        м("26-meros", "Бумажная фабрика «Мейрос»", "Meros paper mill"),
      ],
    ],
    bukhara: [
      [
        м("3-ark", "Арк", "Ark Fortress"),
        м("5-kalon", "Минарет Калян", "Kalon Minaret"),
        м("11-labi", "Ляби-Хауз", "Lyabi-Hauz"),
      ],
      [
        м("12-ismail", "Мавзолей Самани", "Samanid Mausoleum"),
        м("29-xsito", "Ситораи Мохи-Хоса", "Sitorai Mohi-Khosa"),
      ],
    ],
    khiva: [
      [м("4-ikhon", "Ичан-Кала", "Itchan Kala"), м("13-ihlj", "Минарет Ислам-Ходжа", "Islam Khodja Minaret")],
    ],
    extra: [],
  },
  nature: {
    tashkent: [
      [
        м("7-chrvk", "Чарвакское водохранилище", "Charvak Reservoir"),
        м("19-chimgn", "Чимганские горы", "Chimgan Mountains"),
      ],
      [
        м("51-scurng", "Урунгачские озёра", "Urungach Lakes"),
        м("57-scamir", "Курорт Амирсой", "Amirsoy Resort"),
      ],
    ],
    samarkand: [[м("52-sczaam", "Зааминский нацпарк", "Zaamin National Park")]],
    bukhara: [
      [
        м("43-xaydr", "Озеро Айдаркуль", "Aydarkul Lake"),
        м("55-scsent", "Сентоб и Нуратинские горы", "Sentob & Nuratau"),
      ],
    ],
    khiva: [[м("53-scsarm", "Петроглифы Сармишсая", "Sarmishsay petroglyphs")]],
    extra: [[м("56-scshoh", "Шахимардан", "Shakhimardan")]],
  },
  food: {
    tashkent: [
      [
        м("15-chorsu", "Базар Чорсу", "Chorsu Bazaar"),
        р("1-rs1", "Плов-центр", "Central Asian Plov Centre"),
        р("3-rs3", "Чайхана Рохат", "Rokhat Teahouse"),
      ],
    ],
    samarkand: [
      [
        м("20-savsav", "Базар Сиаб", "Siyob Bazaar"),
        р("5-rs5", "Плов-центр Самарканда", "Samarkand Plov Centre"),
        р("9-rs9", "Чайхана у Регистана", "Registan Teahouse"),
      ],
    ],
    bukhara: [
      [
        м("11-labi", "Ляби-Хауз", "Lyabi-Hauz"),
        р("7-rs7", "Ресторан Ляби-Хауз", "Lyabi-Hauz Restaurant"),
        р("8-rs8", "Minzifa", "Minzifa"),
      ],
    ],
    khiva: [
      [
        м("4-ikhon", "Ичан-Кала", "Itchan Kala"),
        р("10-rs10", "Oshxona Khiva", "Oshxona Khiva"),
        р("11-rs11", "Terrassa Khiva", "Terrassa Khiva"),
      ],
    ],
    extra: [[р("6-rs6", "Silk Road Spices", "Silk Road Spices"), р("2-rs2", "Caravan", "Caravan")]],
  },
};

const ПОРЯДОК: Record<Старт, (Старт | "khiva" | "extra")[]> = {
  tashkent: ["tashkent", "samarkand", "bukhara", "khiva", "extra"],
  samarkand: ["samarkand", "bukhara", "khiva", "tashkent", "extra"],
  bukhara: ["bukhara", "khiva", "samarkand", "tashkent", "extra"],
};

const ДНЕЙ = { short: 2, mid: 4, long: 6 } as const;

export function собратьМаршрут(интерес: Интерес, старт: Старт, дней: number): Точка[][] {
  const все = ПОРЯДОК[старт].flatMap((г) => ДНИ[интерес][г]);
  return все.slice(0, дней);
}

export default function Quiz() {
  const { t, язык } = useЯзык();
  const [интерес, setИнтерес] = useState<Интерес>("history");
  const [длина, setДлина] = useState<keyof typeof ДНЕЙ>("mid");
  const [старт, setСтарт] = useState<Старт>("tashkent");
  const [маршрут, setМаршрут] = useState<Точка[][] | null>(null);

  const код = маршрут
    ?.flatMap((день, d) => день.map((т) => `${т.вид === "r" ? "r" : "p"}.${d + 1}.${т.id}`))
    .join("~");

  const выбор = <T extends string>(
    подпись: string,
    значение: T,
    set: (v: T) => void,
    варианты: [T, string][],
  ) => (
    <label className="block">
      <span
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-soft)" }}
      >
        {подпись}
      </span>
      <div className="flex flex-wrap gap-2">
        {варианты.map(([v, текст]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              set(v);
              setМаршрут(null);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={
              значение === v
                ? { background: "var(--ink)", color: "var(--paper)" }
                : { background: "rgba(255,255,255,0.7)", border: "1px solid var(--line)" }
            }
          >
            {текст}
          </button>
        ))}
      </div>
    </label>
  );

  return (
    <section id="quiz" className="paper-grain px-3 pb-24 sm:px-6">
      <Reveal>
        <div
          className="mx-auto max-w-6xl rounded-[36px] border px-6 py-12 sm:px-12"
          style={{ borderColor: "var(--line)", background: "linear-gradient(135deg,#fffaf2,#f3e3cc)" }}
        >
          <h2 className="serif mb-3 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight">
            {t("quiz_title")}
          </h2>
          <p className="mb-10 max-w-xl text-[15px]" style={{ color: "var(--ink-soft)" }}>
            {t("quiz_sub")}
          </p>
          <div className="grid gap-7 md:grid-cols-3">
            {выбор(t("quiz_q1"), интерес, setИнтерес, [
              ["history", t("q_history")],
              ["nature", t("q_nature")],
              ["food", t("q_food")],
            ])}
            {выбор(t("quiz_q2"), длина, setДлина, [
              ["short", t("q_short")],
              ["mid", t("q_mid")],
              ["long", t("q_long")],
            ])}
            {выбор(t("quiz_q3"), старт, setСтарт, [
              ["tashkent", t("city_tashkent")],
              ["samarkand", t("city_samarkand")],
              ["bukhara", t("city_bukhara")],
            ])}
          </div>
          <button
            onClick={() => setМаршрут(собратьМаршрут(интерес, старт, ДНЕЙ[длина]))}
            className="mt-10 inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ background: "var(--ink)" }}
          >
            {t("quiz_go")} →
          </button>

          {маршрут && (
            <div className="fade-up mt-10">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {маршрут.map((день, d) => (
                  <div
                    key={d}
                    className="rounded-2xl border bg-white/70 p-4"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <p className="hand mb-1 text-2xl" style={{ color: "var(--brick)" }}>
                      {t("quiz_day")} {d + 1}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {день.map((т) => (
                        <li key={т.id}>
                          {т.вид === "r" ? "🍽️" : "📍"} {тр(т.имя, язык)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <a
                href={`${APP_URL}/?trip=${encodeURIComponent(код ?? "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(154,59,34,0.7)] transition-transform hover:scale-[1.03]"
                style={{ background: "var(--brick)" }}
              >
                {t("quiz_open")} ↗
              </a>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
