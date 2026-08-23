"use client";

import { useEffect } from "react";
import { useAppState } from "./app-state";
import { track } from "@/lib/track";
import type { Lang } from "@/lib/types";

/**
 * Действия туриста над объектом: избранное, «хочу посетить», отметка
 * о посещении со штампом в паспорт (п. 12–13 ТЗ).
 */
export default function PoiActions({
  slug,
  name,
  citySlug,
  poiId,
  cityId,
  lang,
}: {
  slug: string;
  name: string;
  citySlug: string;
  poiId: number;
  cityId: number;
  lang: Lang;
}) {
  const {
    ready,
    favorites,
    wantToVisit,
    visits,
    toggleFavorite,
    toggleWantToVisit,
    addVisit,
    setLastCity,
  } = useAppState();

  useEffect(() => {
    track("poi_open", { poi_id: poiId, city_id: cityId, lang });
    setLastCity(citySlug);
  }, [poiId, cityId, lang, citySlug, setLastCity]);

  const isFavorite = favorites.includes(slug);
  const isWanted = wantToVisit.includes(slug);
  const isVisited = visits.some((v) => v.slug === slug);

  // До чтения localStorage состояние кнопок неизвестно — показываем заглушку,
  // иначе при гидратации кнопки мигнут из «не в избранном» в «в избранном».
  if (!ready) {
    return <div className="h-11 animate-pulse rounded-lg bg-soft" aria-hidden />;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => {
          toggleFavorite(slug);
          if (!isFavorite) track("favorite_add", { poi_id: poiId, city_id: cityId, lang });
        }}
        aria-pressed={isFavorite}
        className="rounded-lg px-2 py-2.5 text-sm transition-colors surface"
        style={{ color: isFavorite ? "var(--accent)" : "var(--text)" }}
      >
        {isFavorite ? "❤️" : "🤍"}
        <span className="ml-1.5">Избранное</span>
      </button>

      <button
        onClick={() => toggleWantToVisit(slug)}
        aria-pressed={isWanted}
        className="rounded-lg px-2 py-2.5 text-sm transition-colors surface"
        style={{ color: isWanted ? "var(--accent)" : "var(--text)" }}
      >
        📍<span className="ml-1.5">{isWanted ? "В планах" : "Хочу"}</span>
      </button>

      <button
        onClick={() => !isVisited && addVisit({ slug, city: citySlug, name })}
        disabled={isVisited}
        className="rounded-lg px-2 py-2.5 text-sm transition-colors surface disabled:opacity-70"
        style={{ color: isVisited ? "var(--accent)" : "var(--text)" }}
      >
        {isVisited ? "✓" : "🎫"}
        <span className="ml-1.5">{isVisited ? "Посещено" : "Отметить"}</span>
      </button>
    </div>
  );
}
