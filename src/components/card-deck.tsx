"use client";

import type { DeckItem, Place } from "@/lib/types";
import { GOLD, TEXT, WHITE } from "@/lib/theme";
import { useAppContent } from "./content-provider";
import { useT } from "@/components/lang-provider";
import { useWeather } from "@/components/weather-provider";

/**
 * Подборка карточек: колода на телефоне, лента на широком экране.
 *
 * В макете это колода — карточки лежат стопкой, соседние притушены и
 * уменьшены. На телефоне так и надо: экран узкий, показать одну крупно
 * правильнее, чем шесть мелких.
 *
 * На настольном экране колода превращалась в маленькую стопку посреди
 * пустого поля. Поэтому там те же карточки идут лентой во всю ширину —
 * как отели и рестораны ниже.
 *
 * Обе раскладки лежат в разметке и переключаются классами, а не
 * состоянием: измерять ширину в JS значило бы отрисовать сначала не ту
 * раскладку и мигнуть ею при загрузке.
 */

/** Размеры карточки из макета. */
const CARD_W = 218;
const CARD_H = 308;

function CardFace({ it, active }: { it: DeckItem; active: boolean }) {
  return (
    <>
      <div className="absolute inset-0">
        <img src={it.img} alt={it.title} className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top,rgba(0,0,0,0.94) 0%,rgba(0,0,0,0.25) 50%,rgba(0,0,0,0.04) 100%)",
          }}
        />
      </div>

      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        <span
          className="rounded-full px-2 py-0.5 text-[8px] font-bold"
          style={{ background: it.badgeColor, color: it.badgeTextColor ?? TEXT }}
        >
          {it.badge}
        </span>
        {/* Погода в углу — как на карточках отелей. */}
        {it.temp && (
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          >
            {it.tempIcon}
            {it.temp}°
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <div className="mb-1 flex items-center gap-1">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {it.sub}
          </span>
        </div>

        <p
          className="mb-1 font-bold leading-tight text-white"
          style={{ fontSize: 15, fontFamily: "'Fraunces',serif" }}
        >
          {it.title}
        </p>

        <div className="mb-2.5 flex gap-2 border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {(
            [
              [it.stat1, it.stat1l],
              [it.stat2, it.stat2l],
              [it.stat3, it.stat3l],
            ] as [string, string][]
          ).map(([v, l], si) => (
            // flex-1 + min-w-0: три равные колонки по центру — одинаково
            // аккуратно на любой карточке. truncate + nowrap: длинное значение
            // или подпись мягко обрезаются многоточием, а не переносятся
            // уродливым дефисом («Рейтин-Г») и не распирают колонку.
            <div key={si} className="min-w-0 flex-1 text-center">
              <p className="truncate whitespace-nowrap text-[11px] font-bold text-white">{v}</p>
              <p
                className="truncate whitespace-nowrap text-[8px]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {l}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {it.pricel}
            </p>
            <p className="text-sm font-bold text-white">{it.price}</p>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: active ? GOLD : "rgba(255,255,255,0.15)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? TEXT : "white"} strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export function CardDeckBase({
  items,
  title,
  onSelect,
}: {
  items: DeckItem[];
  title: string;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="pt-5">
      <div className="mb-3 flex items-center justify-between px-4">
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          {title}
        </p>
      </div>

      {/* Горизонтальная лента карточек — как у отелей и ресторанов: все
          карточки видны и листаются пальцем, а не лежат стопкой друг за
          другом. Одинаково на всех экранах. */}
      <div className="hide-scroll flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="relative shrink-0 overflow-hidden rounded-3xl text-left transition-all active:scale-95"
            style={{
              width: CARD_W,
              height: CARD_H,
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <CardFace it={it} active />
          </button>
        ))}
      </div>
    </div>
  );
}

export function CardDeck({ places, onPlace }: { places: Place[]; onPlace: (p: Place) => void }) {
  const { t, трК } = useT();
  const погода = useWeather();
  const items: DeckItem[] = places.map((p) => {
    const w = погода.get(p.city); // настоящая погода города (Open-Meteo)
    return {
      img: p.img,
      title: p.name,
      sub: `${трК(p.city)} · ${t("uz_country")}`,
      badge: p.type,
      badgeColor: "rgba(233,196,106,0.92)",
      // Погода — чипом в углу, как у отелей.
      temp: w ? String(w.temp) : undefined,
      tempIcon: w?.icon,
      // Три коротких метрики (как у отелей): рейтинг, отзывы, расстояние.
      stat1: `${p.rating}★`,
      stat1l: t("card_rating"),
      stat2: String(p.reviews),
      stat2l: t("d_reviews_word"),
      stat3: p.distance,
      stat3l: t("card_dist"),
      price: p.entry,
      pricel: t("card_entry"),
    };
  });
  return (
    <CardDeckBase items={items} title={t("deck_top_sights")} onSelect={(i) => onPlace(places[i])} />
  );
}

export function CityDeck({ onSearch }: { onSearch: () => void }) {
  const { POPULAR_CITIES } = useAppContent();
  const { t, трК } = useT();
  const погода = useWeather();
  const items: DeckItem[] = POPULAR_CITIES.map((c) => {
    const w = погода.get(c.name); // настоящая погода города (Open-Meteo)
    return {
      img: c.img,
      title: трК(c.name),
      sub: `${трК(c.sub)} · ${t("uz_country")}`,
      badge: `🏙️ ${t("deck_city_badge")}`,
      badgeColor: "rgba(46,125,90,0.85)",
      // Зелёный бейдж — светлый текст, иначе тёмный на тёмном не читался.
      badgeTextColor: WHITE,
      // Погода — чипом в углу, как у отелей.
      temp: w ? String(w.temp) : undefined,
      tempIcon: w?.icon,
      // Три коротких метрики: рейтинг, «ощущается», ветер (единица локализована).
      stat1: `${c.rating}★`,
      stat1l: t("card_rating"),
      stat2: w ? `${w.feels}°` : "—",
      stat2l: t("w_feels"),
      stat3: w ? `${w.windKmh} ${t("w_wind")}` : "—",
      stat3l: t("card_wind"),
      price: t("card_open"),
      pricel: t("card_direction"),
    };
  });
  return <CardDeckBase items={items} title={t("deck_popular_cities")} onSelect={onSearch} />;
}
