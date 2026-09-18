"use client";

import { BORDER, CREAM, GREEN, MUTED, TEXT } from "@/lib/theme";
import type { Place } from "@/lib/types";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useTrip, переключитьВМаршруте, очиститьМаршрут } from "@/lib/trip";

/**
 * Маршрут, который человек собрал сам кнопкой «В маршрут».
 *
 * Тот же язык карточек, что у избранного: список короткий, и главное в
 * нём — порядок, поэтому точки пронумерованы.
 */
export default function TripScreen({
  onBack,
  onPlace,
  onПуть,
}: {
  onBack: () => void;
  onPlace: (p: Place) => void;
  onПуть: (название: string, город: string) => void;
}) {
  const { t, трК } = useT();
  const { PLACES } = useAppContent();
  const маршрут = useTrip();

  const открыть = (id: string) => {
    const p = PLACES.find((x) => x.id === id);
    if (p) onPlace(p);
  };

  return (
    <div className="flex h-full flex-col animate-slide-up" style={{ background: CREAM }}>
      <div className="flex-shrink-0 border-b bg-white px-4 pb-4 pt-14" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95" style={{ background: CREAM }}>
            <svg width="16" height="16" fill="none" stroke={TEXT} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>📋 {маршрут.length}</p>
            <h1 className="truncate text-xl font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>{t("trip_title")}</h1>
          </div>
          {маршрут.length > 0 && (
            <button onClick={очиститьМаршрут} className="flex-shrink-0 text-xs font-semibold transition-all active:scale-95" style={{ color: MUTED }}>
              {t("trip_clear")}
            </button>
          )}
        </div>
      </div>

      <div className="hide-scroll flex-1 space-y-2.5 overflow-y-auto p-4">
        {маршрут.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3 text-5xl opacity-30">🗺️</div>
            <p className="text-sm" style={{ color: MUTED }}>{t("trip_empty")}</p>
          </div>
        )}

        {маршрут.map((точка, i) => (
          <div key={точка.id} className="flex overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: BORDER }}>
            <button onClick={() => открыть(точка.id)} className="relative h-24 w-24 flex-shrink-0">
              <img src={точка.img} alt={точка.name} className="h-full w-full object-cover" />
              {/* Номер по порядку: это план поездки, и порядок в нём — смысл. */}
              <span
                className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: GREEN }}
              >
                {i + 1}
              </span>
            </button>
            {/* Две кнопки рядом, а не одна в другой: кнопка внутри
                кнопки — недопустимая разметка, React ругается на неё. */}
            <div className="min-w-0 flex-1 p-3">
              <button onClick={() => открыть(точка.id)} className="block w-full text-left">
                <p className="text-[10px] font-semibold" style={{ color: MUTED }}>📍 {трК(точка.city)}</p>
                <p className="mt-0.5 truncate text-sm font-bold" style={{ color: TEXT }}>{точка.name}</p>
              </button>
              <button
                onClick={() => onПуть(точка.name, точка.city)}
                className="mt-1.5 text-xs font-semibold transition-all active:scale-95"
                style={{ color: GREEN }}
              >
                📍 {t("d_route")}
              </button>
            </div>
            <button
              onClick={() => переключитьВМаршруте({ id: точка.id, name: точка.name, city: точка.city, img: точка.img })}
              className="flex w-12 flex-shrink-0 items-center justify-center text-lg transition-all active:scale-90"
              style={{ color: MUTED }}
              aria-label={t("trip_removed")}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
