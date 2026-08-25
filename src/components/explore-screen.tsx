"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./icon";
import { objectsCount, t } from "@/lib/i18n";
import { RAMP_CSS, rampColor } from "@/lib/map-palette";
import type { City, Lang } from "@/lib/types";

/**
 * Экран «Исследовать»: трёхмерная карта страны и список регионов.
 *
 * Сцена подключается динамическим импортом: three.js уезжает в отдельный
 * чанк и не ложится на вес остальных экранов. Шкала цвета берётся из
 * lib/map-palette — того же модуля, что и карта, поэтому карточка региона
 * и его призма на карте всегда одного цвета.
 */
const RegionMap3D = dynamic(() => import("./region-map-3d"), { ssr: false });

interface Totals {
  cities: number;
  objects: number;
  routes: number;
}

export default function ExploreScreen({
  cities,
  counts,
  totals,
  lang,
}: {
  cities: City[];
  counts: Record<string, number>;
  totals: Totals;
  lang: Lang;
}) {
  const router = useRouter();
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    // Без WebGL сцену рисовать нечем — на таких устройствах остаётся список.
    try {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2") && !probe.getContext("webgl")) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }

    // Страховка от того, что R3F измерит контейнер до того, как страница
    // разложена, получит ноль и больше измерять не станет: один resize
    // после монтирования заставляет его пересчитать размер.
    const kick = requestAnimationFrame(() =>
      window.dispatchEvent(new Event("resize")),
    );
    return () => cancelAnimationFrame(kick);
  }, []);

  const maxCount = Math.max(1, ...Object.values(counts));
  const ranked = [...cities].sort(
    (a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0),
  );

  const stats: { value: number; label: string }[] = [
    { value: totals.cities, label: t(lang, "map_stat_cities") },
    { value: totals.objects, label: t(lang, "map_stat_objects") },
    { value: totals.routes, label: t(lang, "map_stat_routes") },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-6">
      {/* Вводная полоса. Движение здесь — единственное на экране помимо
          карты, и оно медленное: фон не должен спорить со сценой. */}
      <section
        className="rise-in relative mb-4 overflow-hidden rounded-[var(--radius-lg)] px-5 py-5"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-tint) 0%, var(--surface-alt) 55%, #f4ead2 100%)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="aurora" aria-hidden />
        <div className="ornament" aria-hidden />

        <div className="relative">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-soft)" }}>
            {t(lang, "map_intro")}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {stats.map((stat, i) => (
              <li
                key={stat.label}
                className="rise-in rounded-[var(--radius-sm)] px-3 py-2"
                style={{
                  animationDelay: `${120 + i * 90}ms`,
                  background: "color-mix(in srgb, var(--surface) 86%, transparent)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <span
                  className="block text-xl font-semibold leading-none"
                  style={{ color: "var(--primary-text)" }}
                >
                  {stat.value}
                </span>
                <span className="mt-1 block text-[11px] faint">{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Карта */}
      <section
        className="rise-in relative mb-3 h-[56vh] min-h-80 overflow-hidden rounded-[var(--radius-lg)]"
        style={{
          animationDelay: "80ms",
          background:
            "radial-gradient(ellipse at 50% 20%, #fbf7ec 0%, #eee7d5 60%, #e0d7c0 100%)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        {webglOk ? (
          <RegionMap3D
            cities={cities}
            counts={counts}
            lang={lang}
            onSelect={(city) => router.push(`/city/${city}`)}
            className="h-full w-full"
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <p className="text-sm soft">{t(lang, "map_no_webgl")}</p>
          </div>
        )}
      </section>

      <div className="mb-5 flex items-start gap-2 text-xs soft">
        <span className="mt-0.5 shrink-0">
          <Icon name="sparkle" size={14} />
        </span>
        <p>{t(lang, "map_hint")}</p>
      </div>

      {/* Регионы. Порядок — по количеству объектов: список рассказывает
          ту же историю, что и рельеф на карте. */}
      <h2 className="mb-3 text-base font-semibold">{t(lang, "map_regions")}</h2>

      <ul className="grid gap-2 sm:grid-cols-2">
        {ranked.map((city, i) => {
          const count = counts[city.slug] ?? 0;
          const ratio = count / maxCount;

          return (
            <li
              key={city.slug}
              className="rise-in"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <Link
                href={`/city/${city.slug}`}
                className="pressable card flex items-stretch gap-3 overflow-hidden p-0"
              >
                {/* Полоска цвета связывает карточку с призмой на карте. */}
                <span
                  aria-hidden
                  className="w-1.5 shrink-0"
                  style={{ background: rampColor(ratio) }}
                />

                <span className="flex flex-1 items-center gap-3 py-3 pr-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                    style={{
                      background: "var(--primary-tint)",
                      color: "var(--primary-text)",
                    }}
                  >
                    <Icon name="landmark" size={20} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{city.name}</span>
                    <span className="mt-1 block text-xs faint">
                      {objectsCount(lang, count)}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1.5 block h-1 rounded-full"
                      style={{
                        width: `${Math.max(8, ratio * 100)}%`,
                        background: RAMP_CSS,
                      }}
                    />
                  </span>

                  <Icon name="chevron-right" size={18} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
