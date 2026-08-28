"use client";

import { useEffect } from "react";
import { useAppState } from "./app-state";
import { track } from "@/lib/track";
import Icon from "./icon";
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
    return (
      <div className="h-11 animate-pulse rounded-lg bg-soft" aria-hidden />
    );
  }

  /*
   * Активное состояние раньше меняло только цвет текста поверх той же
   * белой плашки — разница едва читалась. Теперь активная кнопка получает
   * заливку: «Посещено» — золотую, тем же акцентом, что и звезда рейтинга
   * и нить Шёлкового пути на карте, — это уже цвет «достижения» в
   * приложении, а не новый смысл. Остальные два — фирменную тёмно-синюю.
   */
  const tint = (active: boolean, gold = false) =>
    active
      ? gold
        ? "color-mix(in srgb, var(--accent) 24%, transparent)"
        : "var(--primary-tint)"
      : "var(--surface)";
  const ink = (active: boolean, gold = false) =>
    active
      ? gold
        ? "var(--accent-strong)"
        : "var(--primary-text)"
      : "var(--text-soft)";

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => {
          toggleFavorite(slug);
          if (!isFavorite)
            track("favorite_add", { poi_id: poiId, city_id: cityId, lang });
        }}
        aria-pressed={isFavorite}
        className="pressable flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--radius-full)] px-2 text-sm card"
        style={{ background: tint(isFavorite), color: ink(isFavorite) }}
      >
        <Icon name="heart" size={18} filled={isFavorite} />
        <span>Избранное</span>
      </button>

      <button
        onClick={() => toggleWantToVisit(slug)}
        aria-pressed={isWanted}
        className="pressable flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--radius-full)] px-2 text-sm card"
        style={{ background: tint(isWanted), color: ink(isWanted) }}
      >
        <Icon name="explore" size={18} filled={isWanted} />
        <span>{isWanted ? "В планах" : "Хочу"}</span>
      </button>

      <button
        onClick={() => !isVisited && addVisit({ slug, city: citySlug, name })}
        disabled={isVisited}
        className="pressable flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--radius-full)] px-2 text-sm card disabled:opacity-100"
        style={{
          background: tint(isVisited, true),
          color: ink(isVisited, true),
        }}
      >
        <Icon name="ticket" size={18} filled={isVisited} />
        <span>{isVisited ? "Посещено" : "Отметить"}</span>
      </button>
    </div>
  );
}
