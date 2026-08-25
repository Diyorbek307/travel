"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { City, Lang } from "@/lib/types";

/**
 * Экран «Исследовать»: трёхмерная карта страны.
 *
 * Сцена подключается динамическим импортом и монтируется только после того,
 * как контейнер измерен: R3F не рендерит содержимое холста при нулевом
 * размере, а при динамической загрузке он монтируется в том же кадре,
 * когда контейнер получает разметку.
 */
const RegionMap3D = dynamic(() => import("./region-map-3d"), { ssr: false });

export default function ExploreScreen({
  cities,
  counts,
  lang,
}: {
  cities: City[];
  counts: Record<string, number>;
  lang: Lang;
}) {
  const router = useRouter();
  const holder = useRef<HTMLDivElement>(null);
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <div
        ref={holder}
        className="relative mb-5 h-[58vh] min-h-80 overflow-hidden rounded-[var(--radius-lg)]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #eef6f1 0%, #dcebe2 55%, #cfe2d6 100%)",
        }}
      >
        {webglOk ? (
          <RegionMap3D
            counts={counts}
            onSelect={(city) => router.push(`/city/${city}`)}
            className="h-full w-full"
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <p className="text-sm soft">
              Ваш браузер не поддерживает трёхмерную графику. Регионы доступны
              списком ниже.
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-start gap-2 text-xs soft">
        <span className="mt-0.5 shrink-0">
          <Icon name="sparkle" size={14} />
        </span>
        <p>
          Высота региона показывает, сколько в нём объектов на платформе.
          Наведите или нажмите, чтобы открыть.
        </p>
      </div>

      <h2 className="mb-3 text-base font-semibold">{t(lang, "cities")}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/city/${city.slug}`}
              className="pressable flex items-center gap-3 p-3 card"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
              >
                <Icon name="landmark" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{city.name}</span>
                <span className="block text-xs faint">
                  {counts[city.slug] ?? 0} {t(lang, "objects")}
                </span>
              </span>
              <Icon name="chevron-right" size={18} />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
