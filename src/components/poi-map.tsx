"use client";

import dynamic from "next/dynamic";
import type { Lang, Poi } from "@/lib/types";

// Leaflet трогает window при загрузке модуля — на сервере рендерить нельзя.
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-soft" />,
});

/** Мини-карта одного объекта на его странице. */
export default function PoiMap({
  poi,
  className,
  lang = "ru",
}: {
  poi: Poi;
  className?: string;
  lang?: Lang;
}) {
  return (
    <MapView
      pois={[poi]}
      center={[poi.lat, poi.lon]}
      zoom={16}
      lang={lang}
      className={className}
    />
  );
}
