"use client";

import { useState } from "react";
import type { Hotel, Place, Restaurant, Tab } from "@/lib/types";
import { ACCENT_FILL, BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE, SURFACE, ON_GOLD } from "@/lib/theme";
import { ТИПЫ_МЕСТ } from "@/data/content";
import type { TKey } from "@/lib/i18n";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useДистанция } from "@/lib/distance";
import { useДеньги } from "@/lib/money";
import { useWeather } from "@/components/weather-provider";
import { useGeo } from "@/components/geo-provider";
import { дистанцияКм, ближайшийГород } from "@/data/geo";
import { Badge, StarRow } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import { AdInline } from "@/components/ads";

/**
 * Раздел внутри «Исследовать». Без раздела экран — сетка плиток, как
 * витрина услуг: человек сначала выбирает, что ищет, и только потом
 * видит список.
 */
export type РазделОбзора = "cities" | "places" | "hotels" | "restaurants";

/*
 * Город — не отдельный мир, а фильтр над всеми разделами.
 *
 * Если бы плитка «Города» вела в город, а в нём снова были бы места,
 * отели и рестораны, получилось бы два пути к одному и тому же списку,
 * и в «Ресторанах» человек видел бы всё вперемешку без понятного
 * способа сузить. Поэтому город выбирают один раз — чипом вверху или
 * карточкой в «Городах» — и он действует везде: плитки показывают, сколько
 * всего в этом городе, а списки внутри сразу отфильтрованы. Сменить или
 * сбросить город можно прямо в списке, не возвращаясь назад.
 */

/** Подтипы мест: внутри «Мест» — чипами, а не отдельными плитками. */
const ТИПЫ: { значение: string; подпись: TKey }[] = [
  { значение: "Всё", подпись: "common_all" },
  { значение: "История", подпись: "f_history" },
  { значение: "Мечети", подпись: "f_mosques" },
  { значение: "Музеи", подпись: "f_museums" },
  { значение: "Природа", подпись: "f_nature" },
  { значение: "Базары", подпись: "f_bazaars" },
];

export function ExploreScreen({
  onPlace,
  onHotel,
  onRestaurant,
  isPremium,
  раздел,
  onРаздел,
  город,
  onГород,
  onTab,
  onTransport,
  onPractical,
}: {
  onPlace: (p: Place) => void;
  onHotel: (h: Hotel) => void;
  onRestaurant: (r: Restaurant) => void;
  isPremium: boolean;
  раздел?: РазделОбзора;
  onРаздел: (р?: РазделОбзора) => void;
  /** Русское название города (ключ в данных) или null — все города. */
  город: string | null;
  onГород: (г: string | null) => void;
  onTab: (t: Tab) => void;
  onTransport: () => void;
  onPractical: () => void;
}) {
  const { AUDIO, CITIES, HOTELS, PLACES, RESTAURANTS } = useAppContent();
  const { t, трК } = useT();
  const { pos } = useGeo();
  const рядом = ближайшийГород(pos);

  const вГороде = <T extends { city: string }>(список: T[]) =>
    город ? список.filter((x) => x.city === город) : список;
  const места = вГороде(PLACES);
  const отели = вГороде(HOTELS);
  const рестораны = вГороде(RESTAURANTS);

  /*
   * Чипы городов — только там, где есть что показать: город без единой
   * записи дал бы одни пустые списки. Выбранный город остаётся в ряду в
   * любом случае, иначе его нельзя было бы увидеть и снять. Ближайший к
   * человеку — первым.
   */
  const есть = (имя: string) =>
    PLACES.some((p) => p.city === имя) ||
    HOTELS.some((h) => h.city === имя) ||
    RESTAURANTS.some((r) => r.city === имя);
  const городаЧипы = CITIES.map((c) => c.name)
    .filter((имя) => имя === город || есть(имя))
    .sort((a, b) => Number(b === рядом) - Number(a === рядом));

  const чипыГородов = (
    <div className="flex gap-2 overflow-x-auto hide-scroll">
      {[null, ...городаЧипы].map((имя) => (
        <button
          key={имя ?? "*"}
          onClick={() => onГород(имя)}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={
            город === имя
              ? { background: SURFACE, color: GREEN }
              : { background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)" }
          }
        >
          {имя === null ? t("ex_all_cities") : `${имя === рядом ? "📍 " : ""}${трК(имя)}`}
        </button>
      ))}
    </div>
  );

  if (!раздел) {
    const плитки: {
      ключ: string;
      заголовок: string;
      под: string;
      эмодзи: string;
      пусто?: boolean;
      go: () => void;
    }[] = [
      {
        ключ: "cities",
        заголовок: t("ex_cities"),
        под: String(CITIES.length),
        эмодзи: "🕌",
        go: () => onРаздел("cities"),
      },
      {
        ключ: "places",
        заголовок: t("home_places"),
        под: String(места.length),
        эмодзи: "🏛️",
        пусто: места.length === 0,
        go: () => onРаздел("places"),
      },
      {
        ключ: "hotels",
        заголовок: t("home_hotels"),
        под: String(отели.length),
        эмодзи: "🏨",
        пусто: отели.length === 0,
        go: () => onРаздел("hotels"),
      },
      {
        ключ: "restaurants",
        заголовок: t("home_restaurants"),
        под: String(рестораны.length),
        эмодзи: "🍽️",
        пусто: рестораны.length === 0,
        go: () => onРаздел("restaurants"),
      },
      {
        ключ: "routes",
        заголовок: t("home_routes"),
        под: t("map_tab_ai"),
        эмодзи: "🗺️",
        go: () => onTab("map"),
      },
      {
        ключ: "transport",
        заголовок: t("home_transport"),
        под: t("home_transport_sub"),
        эмодзи: "🚆",
        go: onTransport,
      },
      {
        ключ: "audio",
        заголовок: t("ex_audio"),
        под: String(AUDIO.length),
        эмодзи: "🎧",
        go: () => onTab("audio"),
      },
      {
        ключ: "tips",
        заголовок: t("ex_tips"),
        под: t("home_practical_sub"),
        эмодзи: "💡",
        go: onPractical,
      },
    ];
    const выбран = город ? CITIES.find((c) => c.name === город) : undefined;

    return (
      <div className="flex flex-col h-full" style={{ background: CREAM }}>
        <Шапка кикер="HelloUZ" заголовок={t("explore_title")}>
          {чипыГородов}
        </Шапка>
        <div className="flex-1 overflow-y-auto hide-scroll p-4">
          {выбран && (
            <div className="relative mb-4 h-24 overflow-hidden rounded-2xl">
              <img src={выбран.img} alt={трК(выбран.name)} className="h-full w-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right,rgba(0,0,0,0.65) 0%,transparent 75%)" }}
              />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-4">
                <p className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  {трК(выбран.name)}
                </p>
                <p className="text-[11px] text-white/75">{трК(выбран.sub)}</p>
              </div>
              <button
                onClick={() => onГород(null)}
                aria-label={t("ex_all_cities")}
                className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-sm text-white"
                style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
              >
                ✕
              </button>
            </div>
          )}

          <p className="mb-3 text-base font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
            {t("ex_sections")}
          </p>
          {/*
            Две колонки на телефоне, как витрина услуг: название и число
            слева сверху, крупная картинка выглядывает из угла. Раздел, где
            в выбранном городе пусто, приглушён, но нажимается — внутри
            можно сразу сменить город.
          */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {плитки.map((п) => (
              <button
                key={п.ключ}
                onClick={п.go}
                className="relative h-[124px] overflow-hidden rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-all active:scale-[0.97]"
                style={{ borderColor: BORDER, opacity: п.пусто ? 0.55 : 1 }}
              >
                <p
                  className="text-[15px] font-bold leading-tight"
                  style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
                >
                  {п.заголовок}
                </p>
                <p className="mt-1 line-clamp-2 pr-12 text-[10px] leading-snug" style={{ color: MUTED }}>
                  {п.под}
                </p>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-2 -right-1 select-none"
                  style={{ fontSize: 58, lineHeight: 1, transform: "rotate(-10deg)" }}
                >
                  {п.эмодзи}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <AdInline isPremium={isPremium} cities={город ? [город] : рядом ? [рядом] : undefined} />
          </div>
        </div>
      </div>
    );
  }

  const заголовки: Record<РазделОбзора, TKey> = {
    cities: "ex_cities",
    places: "home_places",
    hotels: "home_hotels",
    restaurants: "home_restaurants",
  };

  return (
    <div className="flex flex-col h-full" style={{ background: CREAM }}>
      <Шапка кикер="HelloUZ" заголовок={t(заголовки[раздел])} onBack={() => onРаздел(undefined)}>
        {раздел !== "cities" && чипыГородов}
      </Шапка>
      <div className="flex-1 overflow-y-auto hide-scroll p-4">
        {раздел === "cities" && (
          <СписокГородов
            рядом={рядом}
            onВыбор={(имя) => {
              onГород(имя);
              onРаздел(undefined);
            }}
          />
        )}
        {раздел === "places" && <СписокМест места={места} onPlace={onPlace} />}
        {раздел === "hotels" && <СписокОтелей отели={отели} onHotel={onHotel} />}
        {раздел === "restaurants" && <СписокРесторанов рестораны={рестораны} onRestaurant={onRestaurant} />}
        {город && раздел !== "cities" && (
          <button
            onClick={() => onГород(null)}
            className="mx-auto mt-4 block rounded-full px-4 py-2 text-xs font-semibold"
            style={{ background: SURFACE, color: GREEN, border: `1px solid ${BORDER}` }}
          >
            {t("ex_all_cities")} →
          </button>
        )}
      </div>
    </div>
  );
}

/** Зелёная шапка экрана: подпись, заголовок и ряд чипов под ними. */
function Шапка({
  кикер,
  заголовок,
  onBack,
  children,
}: {
  кикер: string;
  заголовок: string;
  onBack?: () => void;
  children?: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <div
      className="relative pt-14 pb-3 overflow-hidden border-b"
      style={{ borderColor: BORDER, background: ACCENT_FILL }}
    >
      <div className="absolute inset-0 opacity-20">
        <AnimatedBg />
      </div>
      <div className="relative z-10 px-4">
        <div className="mb-3 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              aria-label={t("common_back")}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl active:scale-95"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <svg
                className="rtl-flip"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <p
              className="text-[9px] font-bold mb-0.5 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {кикер}
            </p>
            <h1
              className="truncate text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {заголовок}
            </h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Пусто() {
  const { t } = useT();
  return (
    <p className="py-10 text-center text-sm sm:col-span-2 xl:col-span-3" style={{ color: MUTED }}>
      {t("explore_empty")}
    </p>
  );
}

/** Карточки городов: выбор города возвращает к плиткам, уже отфильтрованным. */
function СписокГородов({ рядом, onВыбор }: { рядом: string | null; onВыбор: (имя: string) => void }) {
  const { CITIES, HOTELS, PLACES, RESTAURANTS } = useAppContent();
  const { t, трК } = useT();
  const города = [...CITIES].sort((a, b) => Number(b.name === рядом) - Number(a.name === рядом));
  if (города.length === 0) return <Пусто />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {города.map((c) => {
        const счёт = [
          ["🏛️", PLACES.filter((p) => p.city === c.name).length],
          ["🏨", HOTELS.filter((h) => h.city === c.name).length],
          ["🍽️", RESTAURANTS.filter((r) => r.city === c.name).length],
        ] as const;
        return (
          <button
            key={c.id}
            onClick={() => onВыбор(c.name)}
            className="relative h-32 w-full overflow-hidden rounded-2xl text-left shadow-sm active:scale-[0.98] transition-all"
          >
            <img src={c.img} alt={трК(c.name)} className="h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 65%)" }}
            />
            {c.name === рядом && (
              <span
                className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ background: GOLD, color: ON_GOLD }}
              >
                📍 {t("ex_near")}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  {трК(c.name)}
                </p>
                <p className="truncate text-[10px] text-white/70">{трК(c.sub)}</p>
              </div>
              <div className="flex flex-shrink-0 gap-1.5">
                {счёт.map(([эмодзи, n]) => (
                  <span
                    key={эмодзи}
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
                  >
                    {эмодзи} {n}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function СписокМест({ места, onPlace }: { места: Place[]; onPlace: (p: Place) => void }) {
  const { t, трК } = useT();
  const погода = useWeather(); // настоящая погода города (Open-Meteo)
  const { pos } = useGeo(); // живое местоположение для расстояний
  const дист = useДистанция(); // км или мили — как выбрано в настройках
  const дг = useДеньги();
  // Значение типа остаётся русским: по нему сверяется тип места в
  // данных. Переводится только подпись на чипе.
  const [тип, setТип] = useState("Всё");
  const список = места.filter((p) => тип === "Всё" || (ТИПЫ_МЕСТ[тип] ?? []).includes(p.typeRu ?? p.type));
  // Первое место крупной карточкой — только в общем списке, не в подтипе.
  const главное = тип === "Всё" ? список[0] : undefined;
  const остальные = главное ? список.slice(1) : список;

  return (
    <>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 hide-scroll">
        {ТИПЫ.map((т) => (
          <button
            key={т.значение}
            onClick={() => setТип(т.значение)}
            className="flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
            style={
              тип === т.значение
                ? { background: ACCENT_FILL, color: WHITE, borderColor: "transparent" }
                : { background: SURFACE, color: MUTED, borderColor: BORDER }
            }
          >
            {t(т.подпись)}
          </button>
        ))}
      </div>
      {/*
        Сетка вместо столбца. На телефоне это по-прежнему один столбец,
        а на широком экране карточки встают рядом: иначе каждая
        растягивается через весь стол, и от неё остаётся полоска с
        картинкой в углу.
      */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {список.length === 0 && <Пусто />}
        {главное && (
          <button
            onClick={() => onPlace(главное)}
            className="w-full relative rounded-2xl overflow-hidden shadow-sm text-left active:scale-[0.98] sm:col-span-2 xl:col-span-3"
            style={{ height: 180 }}
          >
            <img src={главное.img} alt={главное.name} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)" }}
            />
            <div className="absolute top-3 left-3">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: GOLD, color: ON_GOLD }}
              >
                ⭐ {t("feat_badge")}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>
                {главное.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <StarRow rating={главное.rating} onPhoto />
                <span className="text-white/70 text-xs">{трК(главное.city)}</span>
                <span className="text-white/70 text-xs">{дг.цена(главное.entry)}</span>
                {главное.audio && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: ACCENT_FILL, color: WHITE }}
                  >
                    🎧
                  </span>
                )}
                {(() => {
                  const w = погода.get(главное.city);
                  return w ? (
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(8px)",
                        color: WHITE,
                      }}
                    >
                      {w.icon} {w.temp}°C
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          </button>
        )}
        {остальные.map((p) => (
          <button
            key={p.id}
            onClick={() => onPlace(p)}
            className="w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]"
            style={{ borderColor: BORDER }}
          >
            <div className="w-24 flex-shrink-0 bg-gray-100">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" style={{ height: 96 }} />
            </div>
            <div className="flex-1 py-3 pr-3 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge text={p.type} color={GREEN} />
                {p.audio && <Badge text="🎧" color={MUTED} />}
              </div>
              <p className="font-bold text-sm leading-tight" style={{ color: TEXT }}>
                {p.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                {трК(p.city)} ·{" "}
                {(() => {
                  const к = дистанцияКм(pos, p.nameRu ?? p.name, p.city);
                  return к != null ? дист.формат(к) : дист.изДанных(p.distance);
                })()}
              </p>
              <div className="flex items-center justify-between mt-2">
                <StarRow rating={p.rating} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: GREEN }}>
                    {дг.цена(p.entry)}
                  </span>
                  {(() => {
                    const w = погода.get(p.city);
                    return w ? (
                      <span className="text-[9px] font-semibold" style={{ color: MUTED }}>
                        {w.icon}
                        {w.temp}°
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function СписокОтелей({ отели, onHotel }: { отели: Hotel[]; onHotel: (h: Hotel) => void }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {отели.length === 0 && <Пусто />}
      {отели.map((h) => (
        <button
          key={h.id}
          onClick={() => onHotel(h)}
          className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border text-left active:scale-[0.98] transition-all"
          style={{ borderColor: BORDER }}
        >
          <div className="relative h-40">
            <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)" }}
            />
            <div className="absolute top-3 left-3">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: GOLD, color: ON_GOLD }}
              >
                {h.tag}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {h.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRow rating={h.rating} onPhoto />
                <span className="text-white/70 text-xs">{трК(h.city)}</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-2.5 flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {h.facilities.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: CREAM, color: MUTED }}
                >
                  {f}
                </span>
              ))}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-base" style={{ color: GREEN }}>
                {дг.цена(h.price)}
              </p>
              <p className="text-[9px]" style={{ color: MUTED }}>
                {t("home_per_night")}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function СписокРесторанов({
  рестораны,
  onRestaurant,
}: {
  рестораны: Restaurant[];
  onRestaurant: (r: Restaurant) => void;
}) {
  const { трК } = useT();
  const дг = useДеньги();
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {рестораны.length === 0 && <Пусто />}
      {рестораны.map((r) => (
        <button
          key={r.id}
          onClick={() => onRestaurant(r)}
          className="w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]"
          style={{ borderColor: BORDER }}
        >
          <div className="w-24 flex-shrink-0 bg-gray-100">
            <img src={r.img} alt={r.name} className="w-full h-full object-cover" style={{ height: 96 }} />
          </div>
          <div className="flex-1 py-3 pr-3 min-w-0">
            <Badge text={r.cuisine} color={"#C1603A"} />
            <p className="font-bold text-sm leading-tight mt-1" style={{ color: TEXT }}>
              {r.name}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
              {трК(r.city)} · {r.open}
            </p>
            <div className="flex items-center justify-between mt-2">
              <StarRow rating={r.rating} />
              <span className="text-xs font-bold" style={{ color: "#C1603A" }}>
                {дг.цена(r.price)}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ExploreScreen;
