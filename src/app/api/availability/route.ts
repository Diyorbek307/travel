import { NextResponse } from "next/server";
import { readContent } from "@/lib/store";
import { наличие } from "@/lib/partners";
import { ipЗапроса, подЛимитом } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ДАТА = /^\d{4}-\d{2}-\d{2}$/;
const ВРЕМЯ = /^\d{1,2}:\d{2}$/;

/**
 * Свободные места в гостинице или ресторане.
 *
 *   GET /api/availability?kind=hotel&id=…&checkin=2026-10-01&nights=2&guests=2
 *   GET /api/availability?kind=restaurant&id=…&date=2026-10-01&time=19:00&guests=4
 *
 * Отвечает { наличие: null }, если заведение о местах не сообщает, —
 * тогда карточка просто не показывает бейдж «свободно».
 */
export async function GET(request: Request) {
  // Каждый запрос может уйти в кассу заведения — не даём её заваливать.
  if (!подЛимитом(`avail:${ipЗапроса(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const q = new URL(request.url).searchParams;
  const вид = q.get("kind");
  const id = q.get("id") ?? "";
  if ((вид !== "hotel" && вид !== "restaurant") || !id) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const content = await readContent();
  const запись =
    вид === "hotel" ? content.hotels.find((h) => h.id === id) : content.restaurants.find((r) => r.id === id);
  if (!запись) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const число = (имя: string, мин: number, макс: number) => {
    const n = Number(q.get(имя));
    return Number.isInteger(n) && n >= мин && n <= макс ? n : undefined;
  };
  const строка = (имя: string, шаблон: RegExp) => {
    const v = q.get(имя) ?? "";
    return шаблон.test(v) ? v : undefined;
  };

  const н = await наличие(вид, запись, {
    checkin: строка("checkin", ДАТА),
    nights: число("nights", 1, 60),
    date: строка("date", ДАТА),
    time: строка("time", ВРЕМЯ),
    guests: число("guests", 1, 30),
  });
  // Кешировать у браузера нельзя: места меняются каждую минуту.
  return NextResponse.json({ наличие: н }, { headers: { "Cache-Control": "no-store" } });
}
