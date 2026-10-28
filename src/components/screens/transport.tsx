"use client";

import { useЛёгкийРежим } from "@/lib/lite";
import { useState } from "react";
import { ГОРОДА } from "@/data/geo";
import { ссылкаНаЗаказ } from "@/lib/taxi";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { ACCENT_FILL, BORDER, CREAM, GREEN, MUTED, TEXT, SURFACE, ACCENT_SOFT } from "@/lib/theme";
import { FLIGHTS, INTERCITY, TRAINS, UZ_CITIES } from "@/data/content";
import { EmptyRoute } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import { AdInline } from "@/components/ads";
import { ВИДЕО, ФОН_ВИДЕО } from "@/data/city-reels";

export function CityPicker({
  value,
  onChange,
  label,
  icon,
}: {
  value: string;
  onChange: (c: string) => void;
  label: string;
  icon: string;
}) {
  const { t, трК } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex flex-col gap-0.5 px-3 py-2.5 rounded-2xl text-left"
        style={{ background: "rgba(255,255,255,0.18)" }}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {label}
        </span>
        <span className="font-bold text-sm text-white truncate">
          {icon} {value ? трК(value) : t("tr_choose")}
        </span>
      </button>
      {open && (
        // fixed, а не absolute: пикер лежит внутри двух relative-контейнеров
        // (зелёная шапка + строка полей), и absolute сжимал лист в шапку.
        // fixed раскрывает его на весь экран.
        <div
          className="fixed inset-0 z-[60] flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="rounded-t-3xl overflow-hidden animate-slide-up"
            style={{ background: SURFACE, maxHeight: "65%" }}
          >
            <div
              className="flex items-center justify-between px-4 pt-4 pb-3 border-b"
              style={{ borderColor: BORDER }}
            >
              <p className="font-bold text-base" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
                {label}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: CREAM }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(65vh - 60px)" }}>
              {UZ_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onChange(city);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b text-left active:opacity-60"
                  style={{ borderColor: BORDER, background: value === city ? ACCENT_SOFT : SURFACE }}
                >
                  <span className="text-lg">📍</span>
                  <span
                    className="flex-1 font-semibold text-sm"
                    style={{ color: value === city ? GREEN : TEXT }}
                  >
                    {трК(city)}
                  </span>
                  {value === city && <span style={{ color: GREEN }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Экран транспорта

export function TransportScreen({ onBack, isPremium }: { onBack: () => void; isPremium: boolean }) {
  const { t, трК } = useT();
  const [mode, setMode] = useState<"trains" | "flights" | "taxi">("trains");
  /*
   * Билеты продаёт перевозчик. Раньше «Купить» просто переключало
   * надпись на «✓ Забронировано» — человек уходил уверенный, что место
   * за ним, хотя не происходило ничего. Теперь кнопка честно уводит на
   * сайт продавца.
   */
  const САЙТЫ = { trains: "https://eticket.railway.uz/", flights: "https://www.uzairways.com/" } as const;
  /*
   * Межгород на такси: кнопка «Заказать» раньше не делала ничего —
   * обработчика у неё не было вовсе. Ведём в Яндекс Go с уже
   * подставленными точками; оформляет поездку он, не мы.
   */
  function заказатьТакси(откуда: string, куда: string) {
    const a = ГОРОДА[откуда];
    const b = ГОРОДА[куда];
    if (!b) return;
    window.open(ссылкаНаЗаказ(a ?? null, b, куда), "_blank", "noopener,noreferrer");
  }
  const купить = (куда: keyof typeof САЙТЫ) => window.open(САЙТЫ[куда], "_blank", "noopener,noreferrer");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  // Ролик города для шапки: свой у города «откуда», иначе общий об
  // Узбекистане. Пока не заиграл (или автозапуск закрыт) — держим чистый
  // бирюзовый фон, без чужой кнопки «play».
  const видеоШапки = ВИДЕО[fromCity] ?? ФОН_ВИДЕО;
  const [видеоOk, setВидеоOk] = useState(false);
  const лёгкий = useЛёгкийРежим();
  const TABS: [typeof mode, string, TKey][] = [
    ["trains", "🚄", "tr_trains"],
    ["flights", "✈️", "tr_flights"],
    ["taxi", "🚌", "tr_taxi"],
  ];

  /** Время в пути: «≈ 2 ч 10 мин». Минуты — округлённые, отсюда «≈». */
  const вПути = (минут: number) => {
    const ч = Math.floor(минут / 60);
    const м = минут % 60;
    return `≈ ${ч ? `${ч} ${t("common_h")}` : ""}${ч && м ? " " : ""}${м ? `${м} ${t("common_min")}` : ""}`;
  };

  /** Маршрут: откуда → куда, время в пути и кнопка к продавцу. */
  const Маршрут = ({
    метка,
    подпись,
    значок,
    from,
    to,
    минут,
    через,
    кнопка,
    пояснение,
    onClick,
  }: {
    метка: string;
    подпись?: string;
    значок: string;
    from: string;
    to: string;
    минут: number;
    через?: string;
    кнопка: string;
    /** Где смотреть цену; по умолчанию — у перевозчика. */
    пояснение?: string;
    onClick: () => void;
  }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BORDER }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: ACCENT_SOFT, color: GREEN }}
          >
            {метка}
          </span>
          {подпись && (
            <span className="text-[9px] font-semibold" style={{ color: MUTED }}>
              {подпись}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
              {трК(from)}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: MUTED }}>
              {t("tr_departure")}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <p className="text-[10px] font-semibold" style={{ color: MUTED }}>
              {вПути(минут)}
            </p>
            <div className="flex items-center gap-1">
              <div className="w-8 h-px" style={{ background: BORDER }} />
              <span className="text-base">{значок}</span>
              <div className="w-8 h-px" style={{ background: BORDER }} />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="font-bold text-base truncate" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
              {трК(to)}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: MUTED }}>
              {через ? трК(через) : t("tr_arrival")}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] leading-snug" style={{ color: MUTED }}>
          {пояснение ?? t("tr_schedule_note")}
        </p>
        <button
          onClick={onClick}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          style={{ background: ACCENT_FILL }}
        >
          {кнопка}
        </button>
      </div>
    </div>
  );

  const trains = TRAINS.filter((п) => (!fromCity || п.from === fromCity) && (!toCity || п.to === toCity));
  const flights = FLIGHTS.filter((f) => (!fromCity || f.from === fromCity) && (!toCity || f.to === toCity));
  const taxis = INTERCITY.filter((i) => (!fromCity || i.from === fromCity) && (!toCity || i.to === toCity));

  return (
    <div className="flex flex-col h-full animate-slide-up" style={{ background: CREAM }}>
      <div className="relative overflow-hidden px-4 pt-14 pb-4" style={{ background: ACCENT_FILL }}>
        {/* Живой фон города. Зелёная плёнка поверх держит фирменный цвет и
            читаемость белого текста в любой теме. */}
        {!лёгкий && (
          <video
            key={видеоШапки}
            src={видеоШапки}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            onLoadStart={() => setВидеоOk(false)}
            onPlaying={() => setВидеоOk(true)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: видеоOk ? 0.9 : 0, transition: "opacity 1s ease" }}
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.5) 100%)" }}
        />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <AnimatedBg />
        </div>
        <div className="relative z-10">
          <button
            aria-label={t("common_back")}
            onClick={onBack}
            className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <svg
              className="rtl-flip"
              width="16"
              height="16"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            {t("tr_kicker")}
          </p>
          <h1 className="text-white text-xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            {t("tr_subtitle")}
          </h1>
          <div className="relative flex items-center gap-2 mb-3">
            <CityPicker value={fromCity} onChange={setFromCity} label={t("tr_from")} icon="🛫" />
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <button
                onClick={() => {
                  const t = fromCity;
                  setFromCity(toCity);
                  setToCity(t);
                }}
                title={t("tr_swap")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                  <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
            <CityPicker value={toCity} onChange={setToCity} label={t("tr_to")} icon="🛬" />
          </div>
          <div className="flex gap-2">
            {TABS.map(([v, e, l]) => (
              <button
                key={v}
                onClick={() => setMode(v)}
                className="flex-1 py-2.5 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-0.5"
                style={
                  mode === v
                    ? { background: SURFACE, color: GREEN }
                    : { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }
                }
              >
                <span className="text-base">{e}</span>
                <span>{t(l)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-3">
        {/* Реклама городов маршрута: куда турист едет — того города и реклама. */}
        <AdInline isPremium={isPremium} cities={[fromCity, toCity].filter(Boolean)} />

        {/* Кто на самом деле продаёт билет — сказано сразу, а не после нажатия. */}
        {mode !== "taxi" && (
          <p className="px-1 text-[10px] leading-relaxed" style={{ color: MUTED }}>
            {t("tr_seller_note")}
          </p>
        )}

        {mode === "trains" && trains.length === 0 && <EmptyRoute icon="🚄" />}
        {mode === "trains" &&
          trains.map((п) => (
            <Маршрут
              key={п.id}
              метка={трК(п.type)}
              подпись={трК(п.name)}
              значок="🚄"
              from={п.from}
              to={п.to}
              минут={п.минут}
              кнопка={`${t("tr_buy_ext")} ↗`}
              onClick={() => купить("trains")}
            />
          ))}

        {mode === "flights" && flights.length === 0 && <EmptyRoute icon="✈️" />}
        {mode === "flights" &&
          flights.map((f) => (
            <Маршрут
              key={f.id}
              метка={f.airline}
              значок="✈️"
              from={f.from}
              to={f.to}
              минут={f.минут}
              через={f.через}
              кнопка={`${t("tr_buy_ext")} ↗`}
              onClick={() => купить("flights")}
            />
          ))}

        {mode === "taxi" && taxis.length === 0 && <EmptyRoute icon="🚌" />}
        {mode === "taxi" &&
          taxis.map((ic) => (
            <Маршрут
              key={ic.id}
              метка={t("tr_taxi")}
              подпись={трК(ic.note)}
              значок="🚕"
              from={ic.from}
              to={ic.to}
              минут={ic.минут}
              кнопка={t("tr_book")}
              пояснение={t("ex_taxi_sub")}
              onClick={() => заказатьТакси(ic.from, ic.to)}
            />
          ))}

        <div className="pb-4" />
      </div>
    </div>
  );
}

export default TransportScreen;
