"use client";

import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import type { Hotel, Place, Restaurant, Route } from "@/lib/types";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useFavorites, переключитьИзбранное } from "@/lib/favorites";

const ЗНАЧОК: Record<string, string> = { place: "📍", hotel: "🏨", restaurant: "🍽️", route: "🗺️" };

export default function FavoritesScreen({
  onBack,
  onPlace,
  onHotel,
  onRestaurant,
  onRoute,
}: {
  onBack: () => void;
  onPlace: (p: Place) => void;
  onHotel: (h: Hotel) => void;
  onRestaurant: (r: Restaurant) => void;
  onRoute: (m: Route) => void;
}) {
  const { t, трК } = useT();
  const { PLACES, HOTELS, RESTAURANTS, ROUTES } = useAppContent();
  const избранное = useFavorites();

  const открыть = (f: (typeof избранное)[number]) => {
    if (f.kind === "place") {
      const p = PLACES.find((x) => x.id === f.id);
      if (p) onPlace(p);
    } else if (f.kind === "hotel") {
      const h = HOTELS.find((x) => x.id === f.id);
      if (h) onHotel(h);
    } else if (f.kind === "restaurant") {
      const r = RESTAURANTS.find((x) => x.id === f.id);
      if (r) onRestaurant(r);
    } else {
      const m = ROUTES.find((x) => x.id === f.id);
      if (m) onRoute(m);
    }
  };

  return (
    <div className="flex h-full flex-col animate-slide-up" style={{ background: CREAM }}>
      <div className="flex-shrink-0 border-b bg-white px-4 pb-4 pt-14" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: CREAM }}>
            <svg className="rtl-flip" width="16" height="16" fill="none" stroke={TEXT} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <p className="text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>❤ {избранное.length}</p>
            <h1 className="text-xl font-bold" style={{ color: TEXT, fontFamily:"var(--font-heading)" }}>{t("menu_favorites")}</h1>
          </div>
        </div>
      </div>

      <div className="hide-scroll flex-1 space-y-2.5 overflow-y-auto p-4">
        {избранное.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3 text-5xl opacity-30">❤</div>
            <p className="text-sm" style={{ color: MUTED }}>{t("fav_empty")}</p>
          </div>
        )}

        {избранное.map((f) => (
          <div key={f.key} className="flex overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: BORDER }}>
            <button onClick={() => открыть(f)} className="h-24 w-24 flex-shrink-0">
              <img src={f.img} alt={f.name} className="h-full w-full object-cover" />
            </button>
            <button onClick={() => открыть(f)} className="min-w-0 flex-1 p-3 text-left">
              <p className="text-[10px] font-semibold" style={{ color: MUTED }}>{ЗНАЧОК[f.kind]} {трК(f.city)}</p>
              <p className="mt-0.5 truncate font-bold text-sm" style={{ color: TEXT }}>{трК(f.name)}</p>
              <p className="mt-1 text-xs font-semibold" style={{ color: "var(--gold-ink)" }}>★ {f.rating}</p>
            </button>
            <button
              onClick={() => переключитьИзбранное({ id: f.id, kind: f.kind, name: f.name, city: f.city, img: f.img, rating: f.rating })}
              className="flex w-12 flex-shrink-0 items-center justify-center"
              aria-label={t("a11y_unfav")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={GOLD} stroke={GOLD} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
