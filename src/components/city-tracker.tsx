"use client";

import { useEffect } from "react";
import { useAppState } from "./app-state";
import { track } from "@/lib/track";
import type { Lang } from "@/lib/types";

/**
 * Фиксирует открытие города: событие аналитики и запоминание последнего
 * города, чтобы планировщик и ассистент знали, где находится турист.
 */
export default function CityTracker({
  cityId,
  citySlug,
  lang,
}: {
  cityId: number;
  citySlug: string;
  lang: Lang;
}) {
  const { setLastCity } = useAppState();

  useEffect(() => {
    track("city_open", { city_id: cityId, lang });
    setLastCity(citySlug);
  }, [cityId, citySlug, lang, setLastCity]);

  return null;
}
