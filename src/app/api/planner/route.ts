import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/db";
import { planRoute } from "@/lib/planner";
import { langFromParam } from "@/lib/server-lang";
import { THEMES, type Budget, type Theme, type TransportMode } from "@/lib/types";

export const dynamic = "force-dynamic";

const MODES: TransportMode[] = ["walk", "taxi", "car"];
const BUDGETS: Budget[] = ["low", "medium", "high"];

/** Построение маршрута под параметры туриста (п. 3 ТЗ). */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const city = typeof body.city === "string" ? body.city : null;
  if (!city) return NextResponse.json({ error: "city_required" }, { status: 400 });

  const minutes = Number(body.minutes);
  if (!Number.isFinite(minutes) || minutes < 30 || minutes > 12 * 60) {
    return NextResponse.json({ error: "minutes_out_of_range" }, { status: 400 });
  }

  const themes = Array.isArray(body.themes)
    ? (body.themes.filter((x): x is Theme => (THEMES as readonly string[]).includes(x as string)))
    : [];

  const mode = MODES.includes(body.mode as TransportMode) ? (body.mode as TransportMode) : "walk";
  const budget = BUDGETS.includes(body.budget as Budget) ? (body.budget as Budget) : "medium";
  const lang = langFromParam(typeof body.lang === "string" ? body.lang : null);

  const route = planRoute({
    city,
    minutes,
    themes,
    budget,
    mode,
    lang,
    startLat: typeof body.lat === "number" ? body.lat : undefined,
    startLon: typeof body.lon === "number" ? body.lon : undefined,
    startAtMin: typeof body.startAtMin === "number" ? body.startAtMin : undefined,
    includeMeals: body.includeMeals !== false,
  });

  if (!route) {
    return NextResponse.json(
      { error: "no_route", reason: "Слишком мало времени или подходящие объекты закрыты" },
      { status: 200 },
    );
  }

  trackEvent({
    type: "route_generated",
    city_id: route.city_id,
    lang,
    meta: { minutes, themes, mode, budget, stops: route.stops.length },
  });

  return NextResponse.json({ route });
}
