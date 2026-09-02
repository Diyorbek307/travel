"use client";

import { useRef, useState } from "react";
import type { DeckItem, Place } from "@/lib/types";
import { BORDER, GOLD, GREEN, TEXT, WHITE } from "@/lib/theme";
import { WEATHER } from "@/data/content";
import { useAppContent } from "./content-provider";

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
          style={{ background: it.badgeColor, color: TEXT }}
        >
          {it.badge}
        </span>
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

        <div className="mb-2.5 flex gap-4 border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {(
            [
              [it.stat1, it.stat1l],
              [it.stat2, it.stat2l],
              [it.stat3, it.stat3l],
            ] as [string, string][]
          ).map(([v, l], si) => (
            <div key={si}>
              <p className="text-[11px] font-bold text-white">{v}</p>
              <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>
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
  const [cur, setCur] = useState(0);
  const drag = useRef(0);
  const n = items.length;
  const go = (d: number) => setCur((c) => (c + d + n) % n);

  /** Карточка в колоде: смещение считается от центральной. */
  const card = (offset: number) => {
    const idx = (cur + offset + n) % n;
    const it = items[idx];
    const center = offset === 0;
    const abs = Math.abs(offset);
    const scale = center ? 1 : abs === 1 ? 0.85 : 0.74;
    const dim = center ? 1 : abs === 1 ? 0.6 : 0.38;

    return (
      <button
        key={`slot${offset}`}
        onClick={() => (center ? onSelect(idx) : go(offset > 0 ? 1 : -1))}
        aria-hidden={!center}
        tabIndex={center ? 0 : -1}
        className="absolute overflow-hidden rounded-3xl text-left"
        style={{
          width: CARD_W,
          height: CARD_H,
          left: "50%",
          marginLeft: -CARD_W / 2,
          transform: `translateX(${offset * 52}px) translateY(${abs * 8}px) scale(${scale})`,
          zIndex: 10 - abs * 3,
          transition: "all 0.42s cubic-bezier(.22,1,.36,1)",
          filter: `brightness(${dim})`,
          boxShadow: center
            ? "0 28px 64px rgba(0,0,0,0.6),0 8px 24px rgba(0,0,0,0.4)"
            : "0 6px 20px rgba(0,0,0,0.35)",
        }}
      >
        <CardFace it={it} active={center} />
      </button>
    );
  };

  return (
    <div className="px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          {title}
        </p>

        {/* Стрелки листают только колоду — ленту листают прокруткой. */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => go(-1)}
            aria-label="Назад"
            className="flex h-7 w-7 items-center justify-center rounded-full border"
            style={{ borderColor: BORDER, background: WHITE }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Вперёд"
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: GREEN }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Колода — узкий экран */}
      <div
        className="relative lg:hidden"
        style={{ height: 334 }}
        onTouchStart={(e) => {
          drag.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - drag.current;
          if (Math.abs(dx) > 38) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="absolute inset-0">{[-2, -1, 0, 1, 2].map((o) => card(o))}</div>

        <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              aria-label={`Карточка ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === cur ? 14 : 4,
                height: 4,
                background: i === cur ? GOLD : "rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Лента — широкий экран */}
      <div className="hide-scroll hidden gap-3 overflow-x-auto pb-1 lg:flex">
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
  const items: DeckItem[] = places.map((p) => ({
    img: p.img,
    title: p.name,
    sub: `${p.city} · Узбекистан`,
    badge: p.type,
    badgeColor: "rgba(233,196,106,0.92)",
    stat1: p.distance,
    stat1l: "Расст.",
    stat2: WEATHER[p.city] ? `${WEATHER[p.city].temp}°` : "—",
    stat2l: "Темп.",
    stat3: `${p.rating}★`,
    stat3l: "Рейтинг",
    price: p.entry,
    pricel: "Вход",
  }));
  return (
    <CardDeckBase items={items} title="Топ достопримечательности" onSelect={(i) => onPlace(places[i])} />
  );
}

export function CityDeck({ onSearch }: { onSearch: () => void }) {
  const { POPULAR_CITIES } = useAppContent();
  const items: DeckItem[] = POPULAR_CITIES.map((c) => ({
    img: c.img,
    title: c.name,
    sub: `${c.sub} · Узбекистан`,
    badge: "🏙️ Город",
    badgeColor: "rgba(46,125,90,0.85)",
    stat1: WEATHER[c.name] ? `${WEATHER[c.name].temp}°` : "—",
    stat1l: "Сейчас",
    stat2: WEATHER[c.name] ? WEATHER[c.name].cond : "—",
    stat2l: "Погода",
    stat3: `${c.rating}★`,
    stat3l: "Рейтинг",
    price: "Открыть",
    pricel: "Направление",
  }));
  return <CardDeckBase items={items} title="Популярные города" onSelect={onSearch} />;
}
