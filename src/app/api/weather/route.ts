import { NextResponse } from "next/server";
import { ГОРОДА } from "@/data/geo";

/**
 * Погода по всем городам — одним запросом, с сервера.
 *
 * Ключ OpenWeather держим ТОЛЬКО здесь (process.env), в браузер он не
 * попадает. Если ключа нет — берём бесплатный Open-Meteo, чтобы погода
 * работала и без настройки. Добавишь OPENWEATHER_API_KEY в окружении
 * Render — маршрут сам переключится на OpenWeather.
 *
 * Ответ кэшируется на полчаса: погода меняется не поминутно, а лимиты
 * бесплатного OpenWeather беречь надо.
 */

export const revalidate = 1800;

type Погода = {
  temp: number;
  feels: number;
  windKmh: number;
  icon: string;
  condKey: string;
};

/** Коды OpenWeather (weather[0].id) → значок и ключ состояния. */
function поOpenWeather(id: number): { icon: string; condKey: string } {
  if (id >= 200 && id < 300) return { icon: "⛈️", condKey: "w_thunder" };
  if (id >= 300 && id < 400) return { icon: "🌦️", condKey: "w_drizzle" };
  if (id >= 500 && id < 600) return { icon: "🌧️", condKey: "w_rain" };
  if (id >= 600 && id < 700) return { icon: "❄️", condKey: "w_snow" };
  if (id >= 700 && id < 800) return { icon: "🌫️", condKey: "w_fog" };
  if (id === 800) return { icon: "☀️", condKey: "w_clear" };
  if (id <= 802) return { icon: "🌤️", condKey: "w_partly" };
  return { icon: "☁️", condKey: "w_cloudy" };
}

/** Коды Open-Meteo (WMO) → значок и ключ состояния. */
function поOpenMeteo(code: number): { icon: string; condKey: string } {
  if (code === 0) return { icon: "☀️", condKey: "w_clear" };
  if (code <= 2) return { icon: "🌤️", condKey: "w_partly" };
  if (code === 3) return { icon: "☁️", condKey: "w_cloudy" };
  if (code <= 48) return { icon: "🌫️", condKey: "w_fog" };
  if (code <= 57) return { icon: "🌦️", condKey: "w_drizzle" };
  if (code <= 67) return { icon: "🌧️", condKey: "w_rain" };
  if (code <= 77) return { icon: "❄️", condKey: "w_snow" };
  if (code <= 82) return { icon: "🌧️", condKey: "w_rain" };
  if (code <= 86) return { icon: "❄️", condKey: "w_snow" };
  return { icon: "⛈️", condKey: "w_thunder" };
}

async function изOpenWeather(lat: number, lon: number, key: string): Promise<Погода | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 1800 } });
    if (!r.ok) return null;
    const d = await r.json();
    if (typeof d?.main?.temp !== "number" || !Array.isArray(d.weather)) return null;
    const { icon, condKey } = поOpenWeather(Number(d.weather[0]?.id ?? 800));
    return {
      temp: Math.round(d.main.temp),
      feels: Math.round(d.main.feels_like ?? d.main.temp),
      windKmh: Math.round((d.wind?.speed ?? 0) * 3.6), // м/с → км/ч
      icon,
      condKey,
    };
  } catch {
    return null;
  }
}

async function изOpenMeteo(lat: number, lon: number): Promise<Погода | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 1800 } });
    if (!r.ok) return null;
    const c = (await r.json())?.current;
    if (!c || typeof c.temperature_2m !== "number") return null;
    const { icon, condKey } = поOpenMeteo(Number(c.weather_code));
    return {
      temp: Math.round(c.temperature_2m),
      feels: Math.round(c.apparent_temperature ?? c.temperature_2m),
      windKmh: Math.round(c.wind_speed_10m ?? 0),
      icon,
      condKey,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const key = process.env.OPENWEATHER_API_KEY;
  const города = Object.entries(ГОРОДА);

  const пары = await Promise.all(
    города.map(async ([имя, geo]) => {
      // С ключом — OpenWeather, и если он не ответил, страхуемся Open-Meteo.
      const п = key
        ? (await изOpenWeather(geo.lat, geo.lon, key)) ?? (await изOpenMeteo(geo.lat, geo.lon))
        : await изOpenMeteo(geo.lat, geo.lon);
      return п ? ([имя, п] as const) : null;
    }),
  );

  const weather: Record<string, Погода> = {};
  for (const п of пары) if (п) weather[п[0]] = п[1];

  return NextResponse.json(
    { source: key ? "openweather" : "open-meteo", weather },
    { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600" } },
  );
}
