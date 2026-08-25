"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import { formatDuration, formatPrice } from "@/lib/geo";
import { t } from "@/lib/i18n";
import { iconMarkup } from "@/lib/icon-paths";
import type { Lang, Poi } from "@/lib/types";

/**
 * Интерактивная карта (п. 9 ТЗ).
 *
 * Leaflet подключается динамическим импортом внутри эффекта: библиотека
 * обращается к window при загрузке модуля и на сервере падает.
 * Тайлы OpenStreetMap кэшируются Service Worker — карта работает офлайн
 * по ранее просмотренной области.
 */
export default function MapView({
  pois,
  center,
  zoom = 14,
  userPosition,
  routeLine,
  activeSlug,
  onSelect,
  className = "",
  lang = "ru",
}: {
  pois: Poi[];
  center: [number, number];
  zoom?: number;
  userPosition?: [number, number] | null;
  /** Линия маршрута между остановками. */
  routeLine?: [number, number][];
  activeSlug?: string | null;
  onSelect?: (poi: Poi) => void;
  className?: string;
  lang?: Lang;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  // Держим колбэк в ref: иначе каждый ре-рендер родителя пересоздавал бы метки.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Готовность карты — именно состояние, а не ref. Leaflet грузится
  // динамическим импортом, то есть асинхронно, и эффект отрисовки меток
  // успевает отработать раньше, чем карта появится. Ref не вызывает
  // повторный рендер, поэтому метки никогда бы не нарисовались.
  const [ready, setReady] = useState(false);

  // Инициализация карты — один раз за жизнь компонента.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      leafletRef.current = leaflet;
      const map = leaflet.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map);

      layerRef.current = leaflet.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
      // Контейнер часто монтируется до того, как получит финальную высоту.
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перерисовка меток при смене набора объектов.
  useEffect(() => {
    const leaflet = leafletRef.current;
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!leaflet || !layer || !map) return;

    layer.clearLayers();

    for (const poi of pois) {
      const dimmed = activeSlug && activeSlug !== poi.slug ? " is-dimmed" : "";
      const icon = leaflet.divIcon({
        className: "",
        html: `<div class="poi-marker${dimmed}">${iconMarkup(poi.category, 18)}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = leaflet.marker([poi.lat, poi.lon], { icon, title: poi.name });
      const price = formatPrice(poi.price_uzs, lang);
      const visit = formatDuration(poi.avg_visit_min, lang);

      marker.bindPopup(
        `<strong>${escapeHtml(poi.name)}</strong><br>` +
          `<span style="opacity:.7">${poi.rating.toFixed(1)} · ${escapeHtml(price)} · ${escapeHtml(visit)}</span><br>` +
          `<a href="/poi/${encodeURIComponent(poi.slug)}" style="color:var(--primary);font-weight:500">${t(lang, "read")} →</a>`,
      );
      marker.on("click", () => onSelectRef.current?.(poi));
      marker.addTo(layer);
    }

    if (routeLine && routeLine.length > 1) {
      leaflet
        .polyline(routeLine, { color: "#2e7d5a", weight: 4, opacity: 0.8, dashArray: "6 8" })
        .addTo(layer);
    }

    if (userPosition) {
      leaflet
        .circleMarker(userPosition, {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#2e7d5a",
          fillOpacity: 1,
        })
        .bindPopup(t(lang, "nearby"))
        .addTo(layer);
    }
  }, [ready, pois, routeLine, userPosition, activeSlug, lang]);

  // Следование за выбранным объектом.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeSlug) return;
    const poi = pois.find((p) => p.slug === activeSlug);
    if (poi) map.setView([poi.lat, poi.lon], Math.max(map.getZoom(), 16));
  }, [ready, activeSlug, pois]);

  return (
    <>
      {/* Стили Leaflet берём из пакета, чтобы не тянуть внешний CDN:
          при офлайн-режиме и строгом CSP внешняя ссылка не сработает. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="/leaflet/leaflet.css" />
      <div ref={containerRef} className={className} />
    </>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
