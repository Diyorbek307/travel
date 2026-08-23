"use client";

import dynamic from "next/dynamic";
import type { Lang, Poi } from "@/lib/types";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-soft" />,
});

/** Карта маршрута: остановки и линия между ними. */
export default function RouteMap({
  pois,
  center,
  className,
  lang = "ru",
}: {
  pois: Poi[];
  center: [number, number];
  className?: string;
  lang?: Lang;
}) {
  const line = pois.map((p) => [p.lat, p.lon] as [number, number]);
  return (
    <MapView pois={pois} center={center} zoom={14} routeLine={line} lang={lang} className={className} />
  );
}
