"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "./app-state";
import { formatDistance, formatPrice, haversine } from "@/lib/geo";
import Icon from "./icon";
import { categoryLabel, t, themeLabel } from "@/lib/i18n";
import { track } from "@/lib/track";
import {
  CATEGORIES,
  THEMES,
  type Category,
  type City,
  type Lang,
  type Poi,
  type Theme,
} from "@/lib/types";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-soft" />,
});

/** Радиус, в котором объект считается «рядом» и предлагается аудиогид (п. 8 ТЗ). */
const NEARBY_RADIUS_M = 150;

/** Повторно не предлагаем один и тот же объект в течение двух часов. */
const NEARBY_COOLDOWN_MS = 2 * 60 * 60 * 1000;

export default function MapScreen({
  city,
  pois,
  lang,
}: {
  city: City;
  pois: Poi[];
  lang: Lang;
}) {
  const { setLastCity } = useAppState();
  const [categories, setCategories] = useState<Set<Category>>(new Set());
  const [themes, setThemes] = useState<Set<Theme>>(new Set());
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<Poi | null>(null);
  const shownRef = useRef<Map<number, number>>(new Map());

  useEffect(() => setLastCity(city.slug), [city.slug, setLastCity]);

  const filtered = useMemo(() => {
    return pois.filter((p) => {
      if (categories.size > 0 && !categories.has(p.category)) return false;
      if (themes.size === 0) return true;
      if (themes.has("free") && p.is_free === 1) return true;
      return p.themes.some((th) => themes.has(th));
    });
  }, [pois, categories, themes]);

  /* --- GPS-аудиогид ------------------------------------------------- */

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Геолокация не поддерживается этим браузером.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(here);
        setGeoError(null);

        // Поиск идёт по уже загруженному списку объектов — сервер не нужен,
        // поэтому подсказки работают и в офлайне.
        let closest: Poi | null = null;
        let closestDistance = Infinity;
        for (const poi of pois) {
          const d = haversine(here[0], here[1], poi.lat, poi.lon);
          if (d < closestDistance) {
            closestDistance = d;
            closest = poi;
          }
        }

        if (!closest || closestDistance > NEARBY_RADIUS_M) return;
        const lastShown = shownRef.current.get(closest.id) ?? 0;
        if (Date.now() - lastShown < NEARBY_COOLDOWN_MS) return;

        shownRef.current.set(closest.id, Date.now());
        setNearby(closest);
        track("gps_nearby_shown", { poi_id: closest.id, city_id: city.id, lang });
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Доступ к геолокации запрещён. Разрешите его, чтобы видеть объекты рядом."
            : "Не удалось определить местоположение.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 20000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [pois, city.id, lang]);

  const sorted = useMemo(() => {
    if (!position) return filtered;
    return [...filtered].sort(
      (a, b) =>
        haversine(position[0], position[1], a.lat, a.lon) -
        haversine(position[0], position[1], b.lat, b.lon),
    );
  }, [filtered, position]);

  function toggle<T>(set: Set<T>, value: T, apply: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    apply(next);
  }

  const present = CATEGORIES.filter((c) => pois.some((p) => p.category === c));

  return (
    <div className="flex flex-col">
      <div className="relative h-[52vh] min-h-72 w-full">
        <MapView
          pois={filtered}
          center={[city.lat, city.lon]}
          zoom={city.zoom}
          userPosition={position}
          lang={lang}
          className="h-full w-full"
        />

        {/* Карточка «вы рядом с объектом» — п. 8 ТЗ */}
        {nearby && (
          <div
            className="absolute inset-x-3 bottom-3 z-[500] rounded-xl p-3 shadow-xl surface"
            role="alert"
          >
            <p className="text-sm">
              Вы находитесь рядом с объектом <strong>{nearby.name}</strong>. Хотите
              узнать его историю?
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/poi/${nearby.slug}`}
                className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-white"
                style={{ background: "var(--primary)" }}
              >
                <Icon name="headphones" size={16} className="mr-1 inline align-[-3px]" />Слушать
              </Link>
              <button
                onClick={() => setNearby(null)}
                className="rounded-lg px-3 py-2 text-sm surface"
              >
                Позже
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        {geoError && <p className="mb-3 text-xs soft">{geoError}</p>}

        <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
          {present.map((c) => (
            <Chip
              key={c}
              active={categories.has(c)}
              onClick={() => toggle(categories, c, setCategories)}
            >
              <Icon name={c} size={16} /> {categoryLabel(lang, c)}
            </Chip>
          ))}
        </div>

        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {THEMES.map((th) => (
            <Chip key={th} active={themes.has(th)} onClick={() => toggle(themes, th, setThemes)}>
              {themeLabel(lang, th)}
            </Chip>
          ))}
        </div>

        <p className="mb-2 text-sm soft">
          {filtered.length} {t(lang, "objects")}
          {position && ` · ${t(lang, "nearby")}`}
        </p>

        <ul className="grid gap-2">
          {sorted.slice(0, 40).map((poi) => (
            <li key={poi.id}>
              <Link
                href={`/poi/${poi.slug}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors surface hover:bg-soft"
              >
                <span style={{ color: "var(--primary)" }}><Icon name={poi.category} size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{poi.name}</span>
                  <span className="block truncate text-xs soft">
                    {categoryLabel(lang, poi.category)} ·{" "}
                    {formatPrice(poi.price_uzs, lang)}
                  </span>
                </span>
                {position && (
                  <span className="shrink-0 text-xs" style={{ color: "var(--primary-text)" }}>
                    {formatDistance(haversine(position[0], position[1], poi.lat, poi.lon), lang)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors"
      style={{
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "#fff" : "var(--text)",
        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
  );
}
