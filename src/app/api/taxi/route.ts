import { NextResponse } from "next/server";
import { оценить, ценаДоступна } from "@/lib/taxi";

export const dynamic = "force-dynamic";

/**
 * Оценка стоимости поездки.
 *
 * Ключи Яндекса остаются на сервере: отдавать их в браузер нельзя, ими
 * тут же начнут пользоваться посторонние.
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
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { lat, lon };
  };

  const откуда = точка(body.from);
  const куда = точка(body.to);
  if (!откуда || !куда) {
    return NextResponse.json({ error: "points_required" }, { status: 400 });
  }

  // Договора с Яндексом нет — так и говорим, вместо выдуманной цены.
  if (!ценаДоступна()) {
    return NextResponse.json({ available: false, options: [] });
  }

  const оценки = await оценить(откуда, куда);
  return NextResponse.json({ available: оценки !== null, options: оценки ?? [] });
}
