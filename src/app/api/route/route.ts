import { NextResponse } from "next/server";
import { доступныеСпособы, построитьМаршрут, type Способ } from "@/lib/routing";

export const dynamic = "force-dynamic";

/**
 * Маршрут по дорогам.
 *
 * Ходит к движку маршрутизации вместо браузера: ключ должен остаться на
 * сервере. Если движок не настроен, честно отвечаем available: false —
 * экран нарисует прямую и скажет, что это прямая.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const точка = (v: unknown) => {
    if (typeof v !== "object" || v === null) return null;
    const { lat, lon } = v as { lat?: unknown; lon?: unknown };
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { lat, lon };
  };

  const откуда = точка(body.from);
  const куда = точка(body.to);
  if (!откуда || !куда) {
    return NextResponse.json({ error: "points_required" }, { status: 400 });
  }

  const способ: Способ = body.mode === "пешком" ? "пешком" : "авто";

  // Экран должен знать, что мы вообще умеем: предлагать «пешком» там, где
  // пеший маршрут посчитать нечем, значит обещать несуществующее.
  const способы = доступныеСпособы();
  if (!способы.includes(способ)) {
    return NextResponse.json({ available: false, route: null, modes: способы });
  }

  const маршрут = await построитьМаршрут(откуда, куда, способ);
  return NextResponse.json({ available: маршрут !== null, route: маршрут, modes: способы });
}
