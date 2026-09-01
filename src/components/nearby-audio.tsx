"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./icon";
import { formatDistance, haversine } from "@/lib/geo";
import { t } from "@/lib/i18n";
import type { Lang, Poi } from "@/lib/types";

/**
 * «Рядом с вами» из макета: озвученные объекты, отсортированные по
 * расстоянию от туриста.
 *
 * Расстояние считается на клиенте, потому что координаты человека знает
 * только браузер и никуда не отправляются — мы их не храним и не пишем
 * в аналитику. Пока разрешения нет, блок показывает объекты в обычном
 * порядке и предлагает включить геолокацию, а не пустоту.
 */
export default function NearbyAudio({
  pois,
  lang,
  limit = 6,
}: {
  pois: Poi[];
  lang: Lang;
  limit?: number;
}) {
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setDenied(true),
      { maximumAge: 60_000, timeout: 10_000 },
    );
  }, []);

  const withDistance = pos
    ? pois
        .map((poi) => ({ poi, meters: haversine(pos.lat, pos.lon, poi.lat, poi.lon) }))
        .sort((a, b) => a.meters - b.meters)
    : pois.map((poi) => ({ poi, meters: null as number | null }));

  const shown = withDistance.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <section className="mb-5">
      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: pos ? "var(--primary)" : "var(--text-faint)" }}
        />
        {t(lang, "nearby")}
      </h2>

      {denied && (
        <p className="mb-2 text-xs soft">{t(lang, "nearby_no_gps")}</p>
      )}

      <ul className="grid gap-2">
        {shown.map(({ poi, meters }) => (
          <li key={poi.id}>
            <Link
              href={`/poi/${poi.slug}`}
              className="pressable flex items-center gap-3 p-3 card hover:shadow-[var(--shadow-2)]"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
              >
                <Icon name="headphones" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{poi.name}</span>
                <span className="block truncate text-xs faint">
                  {meters != null ? `${formatDistance(meters, lang)} · ` : ""}
                  {poi.avg_visit_min} {t(lang, "minutes")}
                </span>
              </span>
              <Icon name="play" size={18} filled />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
