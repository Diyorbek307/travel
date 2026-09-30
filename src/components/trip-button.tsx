"use client";

import { ACCENT_SOFT, GREEN, SURFACE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import { useTrip, переключитьВМаршруте, type ВидТочки } from "@/lib/trip";

/**
 * «В маршрут» у отеля и ресторана: план поездки — это не только
 * достопримечательности, но и где ночевать и где обедать.
 */
export function КнопкаВМаршрут({
  вид,
  id,
  name,
  city,
  img,
}: {
  вид: ВидТочки;
  id: string;
  name: string;
  city: string;
  img: string;
}) {
  const { t } = useT();
  const маршрут = useTrip();
  const есть = маршрут.some((т) => т.id === id && (т.kind ?? "place") === вид);
  return (
    <button
      onClick={() => переключитьВМаршруте({ id, kind: вид, name, city, img })}
      className="mb-3 w-full rounded-2xl border py-3 text-sm font-bold transition-all active:scale-[0.98]"
      style={{ color: GREEN, borderColor: GREEN, background: есть ? ACCENT_SOFT : SURFACE }}
    >
      {есть ? `✓ ${t("trip_in")}` : `🗺️ ${t("d_add_route")}`}
    </button>
  );
}
