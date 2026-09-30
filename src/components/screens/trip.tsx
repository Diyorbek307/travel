"use client";

import { useState } from "react";
import { ACCENT_FILL, ACCENT_SOFT, BORDER, CREAM, GREEN, MUTED, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import {
  useTrip,
  переключитьВМаршруте,
  очиститьМаршрут,
  задатьДень,
  сдвинуть,
  поДням,
  деньТочки,
  кодМаршрута,
  type ТочкаМаршрута,
} from "@/lib/trip";
import { МЕСТА, расстояниеТочноКм } from "@/data/geo";
import type { Geo } from "@/lib/types";

/**
 * План поездки по дням.
 *
 * Раньше это был плоский список мест в порядке добавления. Теперь — как
 * у лучших планировщиков: дни, порядок внутри дня, отели и рестораны
 * рядом с достопримечательностями, расстояние между соседними точками и
 * «Маршрут дня» одной кнопкой в картах. Всё хранится на устройстве, а
 * поделиться планом можно ссылкой.
 */

const ЗНАЧОК = { place: "📍", hotel: "🏨", restaurant: "🍽️" } as const;

/** Точные координаты есть только у известных мест — для остальных расстояние не выдумываем. */
function координаты(название: string): Geo | null {
  return МЕСТА[название] ?? null;
}

/** Ссылка «Маршрут дня» в Google Картах: по координатам, а где их нет — по названию. */
function ссылкаДня(точки: { имя: string; город: string; гео: Geo | null }[]): string {
  const адрес = (т: (typeof точки)[number]) =>
    т.гео ? `${т.гео.lat},${т.гео.lon}` : `${т.имя}, ${т.город}, Uzbekistan`;
  const п = new URLSearchParams({ api: "1", destination: адрес(точки[точки.length - 1]) });
  if (точки.length > 1) {
    п.set("origin", адрес(точки[0]));
    const середина = точки.slice(1, -1).map(адрес);
    if (середина.length) п.set("waypoints", середина.join("|"));
  }
  return `https://www.google.com/maps/dir/?${п.toString()}`;
}

export default function TripScreen({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  /** Открыть карточку: «place:<id>», «hotel:<id>», «restaurant:<id>». */
  onOpen: (ссылка: string) => void;
}) {
  const { t, трК, lang } = useT();
  const { PLACES, HOTELS, RESTAURANTS } = useAppContent();
  const маршрут = useTrip();
  const [скопировано, setСкопировано] = useState(false);
  const дни = поДням(маршрут);
  const последнийДень = Math.max(1, ...маршрут.map(деньТочки));

  /** Живая запись из содержимого: имя на текущем языке, свежее фото. */
  const запись = (т: ТочкаМаршрута) => {
    const вид = т.kind ?? "place";
    if (вид === "hotel") {
      const h = HOTELS.find((x) => x.id === т.id);
      return { имя: h?.name ?? трК(т.name), исходное: т.name, img: h?.img ?? т.img };
    }
    if (вид === "restaurant") {
      const r = RESTAURANTS.find((x) => x.id === т.id);
      return { имя: r?.name ?? трК(т.name), исходное: т.name, img: r?.img ?? т.img };
    }
    const p = PLACES.find((x) => x.id === т.id);
    return { имя: p?.name ?? трК(т.name), исходное: p?.nameRu ?? т.name, img: p?.img ?? т.img };
  };

  const открыть = (т: ТочкаМаршрута) => onOpen(`${т.kind ?? "place"}:${т.id}`);

  const поделиться = async () => {
    const url = `${window.location.origin}/?trip=${encodeURIComponent(кодМаршрута(маршрут))}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${t("trip_title")} — HelloUZ`, url });
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setСкопировано(true);
      setTimeout(() => setСкопировано(false), 1800);
    } catch {
      window.prompt(t("share_copy"), url);
    }
  };

  const путь = (км: number) => {
    // Прямая, а не дорога — поэтому «≈». Пешком до 3 км, дальше — машиной.
    const пешком = км < 3;
    const мин = Math.max(1, Math.round((км / (пешком ? 4.5 : 30)) * 60));
    return `≈ ${км.toLocaleString(lang, { maximumFractionDigits: 1 })} ${t("unit_km")} · ${t(
      пешком ? "trip_walk" : "trip_drive",
    ).replace("{m}", String(мин))}`;
  };

  return (
    <div className="flex h-full flex-col animate-slide-up" style={{ background: CREAM }}>
      <div className="flex-shrink-0 border-b bg-white px-4 pb-4 pt-14" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <button
            aria-label={t("common_back")}
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: CREAM }}
          >
            <svg
              className="rtl-flip"
              width="16"
              height="16"
              fill="none"
              stroke={TEXT}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>
              📋 {маршрут.length} · {t("trip_days").replace("{n}", String(дни.length))}
            </p>
            <h1
              className="truncate text-xl font-bold"
              style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
            >
              {t("trip_title")}
            </h1>
          </div>
          {маршрут.length > 0 && (
            <>
              <button
                onClick={поделиться}
                aria-label={t("share")}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold transition-all active:scale-95"
                style={{ background: ACCENT_SOFT, color: GREEN }}
              >
                {скопировано ? "✓" : "↗"}
              </button>
              <button
                onClick={() => window.confirm(t("trip_clear_confirm")) && очиститьМаршрут()}
                aria-label={t("trip_clear")}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base transition-all active:scale-95"
                style={{ background: CREAM }}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      <div className="hide-scroll flex-1 overflow-y-auto p-4">
        {маршрут.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3 text-5xl opacity-30">🗺️</div>
            <p className="text-sm" style={{ color: MUTED }}>
              {t("trip_empty")}
            </p>
          </div>
        )}

        {дни.map((точкиДня, номерДня) => {
          const подробно = точкиДня.map((т) => {
            const з = запись(т);
            return { т, ...з, город: т.city, гео: координаты(з.исходное) };
          });
          const города = [...new Set(точкиДня.map((т) => трК(т.city)))].join(", ");
          return (
            <section key={номерДня} className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="rounded-lg px-2 py-1 text-xs font-bold"
                  style={{ background: ACCENT_FILL, color: WHITE }}
                >
                  {t("trip_day").replace("{n}", String(номерДня + 1))}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold" style={{ color: MUTED }}>
                  {города}
                </span>
                <a
                  href={ссылкаДня(подробно)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg border px-2 py-1 text-[11px] font-bold"
                  style={{ borderColor: BORDER, color: GREEN, background: SURFACE }}
                >
                  🗺️ {t("trip_day_route")} ↗
                </a>
              </div>

              {подробно.map((д, i) => {
                const ключ = `${д.т.kind ?? "place"}:${д.т.id}`;
                const пред = подробно[i - 1];
                const км = пред?.гео && д.гео ? расстояниеТочноКм(пред.гео, д.гео) : null;
                return (
                  <div key={ключ}>
                    {км !== null && (
                      <p className="my-1 pl-10 text-[10px] font-semibold" style={{ color: MUTED }}>
                        ↓ {путь(км)}
                      </p>
                    )}
                    <div
                      className="mt-1.5 flex overflow-hidden rounded-2xl border bg-white shadow-sm"
                      style={{ borderColor: BORDER }}
                    >
                      <button onClick={() => открыть(д.т)} className="relative h-24 w-20 flex-shrink-0">
                        <img src={д.img} alt={д.имя} className="h-full w-full object-cover" />
                        <span
                          className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: ACCENT_FILL }}
                        >
                          {i + 1}
                        </span>
                      </button>
                      <div className="min-w-0 flex-1 p-2.5">
                        <button onClick={() => открыть(д.т)} className="block w-full text-left">
                          <p className="text-[10px] font-semibold" style={{ color: MUTED }}>
                            {ЗНАЧОК[д.т.kind ?? "place"]} {трК(д.т.city)}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-bold" style={{ color: TEXT }}>
                            {д.имя}
                          </p>
                        </button>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <select
                            value={деньТочки(д.т)}
                            onChange={(e) => задатьДень(ключ, Number(e.target.value))}
                            aria-label={t("trip_move_day")}
                            className="rounded-lg border px-1.5 py-1 text-[11px] font-semibold outline-none"
                            style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
                          >
                            {/* Дни плана и ещё один новый — так добавляется день. */}
                            {Array.from({ length: последнийДень + 1 }, (_, k) => k + 1).map((n) => (
                              <option key={n} value={n}>
                                {n > последнийДень
                                  ? `＋ ${t("trip_day").replace("{n}", String(n))}`
                                  : t("trip_day").replace("{n}", String(n))}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => сдвинуть(ключ, -1)}
                            disabled={i === 0}
                            aria-label={t("trip_up")}
                            className="h-7 w-7 rounded-lg border text-xs disabled:opacity-30"
                            style={{ borderColor: BORDER, color: TEXT }}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => сдвинуть(ключ, 1)}
                            disabled={i === подробно.length - 1}
                            aria-label={t("trip_down")}
                            className="h-7 w-7 rounded-lg border text-xs disabled:opacity-30"
                            style={{ borderColor: BORDER, color: TEXT }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          переключитьВМаршруте({
                            id: д.т.id,
                            kind: д.т.kind,
                            name: д.т.name,
                            city: д.т.city,
                            img: д.т.img,
                          })
                        }
                        className="flex w-10 flex-shrink-0 items-center justify-center text-lg transition-all active:scale-90"
                        style={{ color: MUTED }}
                        aria-label={t("trip_removed")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
        {маршрут.length > 0 && (
          <p className="pb-4 text-center text-[10px]" style={{ color: MUTED }}>
            {t("trip_hint")}
          </p>
        )}
      </div>
    </div>
  );
}
