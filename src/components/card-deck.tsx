"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "./icon";

/**
 * Колода карточек из макета.
 *
 * Пять карточек лежат стопкой: центральная в полный размер, соседние
 * уменьшены и притушены яркостью, дальние — ещё сильнее. Листается
 * стрелками, точками, свайпом и клавишами, а нажатие на центральную
 * открывает объект.
 *
 * Размеры, масштабы и кривая перехода взяты из исходников макета как
 * есть: 218×308, шаг 52 пикселя, яркость 1 / 0.6 / 0.38.
 */

export interface DeckItem {
  href: string;
  img: string | null;
  badge: string;
  sub: string;
  title: string;
  stats: [string, string][];
  price: string;
  priceLabel: string;
}

/** Смещения карточек относительно центральной. */
const SLOTS = [-2, -1, 0, 1, 2];

export default function CardDeck({
  items,
  title,
  seeAllHref,
  seeAllLabel,
}: {
  items: DeckItem[];
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
}) {
  const [cur, setCur] = useState(0);
  const dragX = useRef(0);
  const router = useRouter();
  const n = items.length;
  if (n === 0) return null;

  const go = (d: number) => setCur((c) => (c + d + n) % n);

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="display-font text-base font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <a href={seeAllHref} className="text-sm font-medium" style={{ color: "var(--primary-text)" }}>
              {seeAllLabel}
            </a>
          )}
          <button
            onClick={() => go(-1)}
            aria-label="←"
            className="pressable grid h-7 w-7 place-items-center rounded-full"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="rotate-180">
              <Icon name="chevron-right" size={11} />
            </span>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="→"
            className="pressable grid h-7 w-7 place-items-center rounded-full"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            <Icon name="chevron-right" size={11} />
          </button>
        </div>
      </div>

      <div
        className="relative"
        style={{ height: 334 }}
        onTouchStart={(e) => {
          dragX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - dragX.current;
          if (Math.abs(dx) > 38) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="absolute inset-0">
          {SLOTS.map((offset) => {
            const idx = (cur + offset + n) % n;
            const it = items[idx];
            const center = offset === 0;
            const abs = Math.abs(offset);
            const scale = center ? 1 : abs === 1 ? 0.85 : 0.74;
            const dim = center ? 1 : abs === 1 ? 0.6 : 0.38;

            return (
              <button
                key={`slot${offset}`}
                onClick={() => (center ? router.push(it.href) : go(offset > 0 ? 1 : -1))}
                aria-hidden={!center}
                tabIndex={center ? 0 : -1}
                className="absolute overflow-hidden rounded-3xl text-left"
                style={{
                  width: 218,
                  height: 308,
                  left: "50%",
                  marginLeft: -109,
                  transform: `translateX(${offset * 52}px) translateY(${abs * 8}px) scale(${scale})`,
                  zIndex: 10 - abs * 3,
                  transition: "all 0.42s cubic-bezier(.22,1,.36,1)",
                  filter: `brightness(${dim})`,
                  boxShadow: center
                    ? "0 28px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)"
                    : "0 6px 20px rgba(0,0,0,0.35)",
                }}
              >
                <span className="absolute inset-0">
                  {it.img ? (
                    <Image
                      src={it.img}
                      alt=""
                      fill
                      sizes="218px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="photo-placeholder block h-full w-full" />
                  )}
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.04) 100%)",
                    }}
                  />
                </span>

                <span className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span
                    className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                    style={{ background: "var(--accent)", color: "#2b2b2b" }}
                  >
                    {it.badge}
                  </span>
                </span>

                <span className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                  <span className="mb-1 flex items-center gap-1">
                    <Icon name="map" size={8} />
                    <span className="text-[8px] text-white/50">{it.sub}</span>
                  </span>

                  <span className="display-font mb-1 block text-[15px] font-bold leading-tight">
                    {it.title}
                  </span>

                  <span
                    className="mb-2.5 flex gap-4 border-t pt-2"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    {it.stats.map(([value, label], i) => (
                      <span key={i} className="block">
                        <span className="block text-[11px] font-bold">{value}</span>
                        <span className="block text-[8px] text-white/40">{label}</span>
                      </span>
                    ))}
                  </span>

                  <span className="flex items-center justify-between">
                    <span>
                      <span className="block text-[8px] text-white/40">{it.priceLabel}</span>
                      <span className="block text-sm font-bold">{it.price}</span>
                    </span>
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full"
                      style={{
                        background: center ? "var(--accent)" : "rgba(255,255,255,0.15)",
                        color: center ? "#2b2b2b" : "#ffffff",
                      }}
                    >
                      <Icon name="chevron-right" size={13} />
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-2.5 z-20 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              aria-label={`${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === cur ? 14 : 4,
                height: 4,
                background: i === cur ? "var(--accent)" : "rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
