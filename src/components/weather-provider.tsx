"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ГОРОДА } from "@/data/geo";
import type { TKey } from "@/lib/i18n";

/**
 * Настоящая погода.
 *
 * Раньше температура была вписана в код: «34° в Самарканде» показывалось
 * всегда, хоть в январе. Для приложения про поездки это прямая
 * дезинформация — по такой цифре собирают чемодан.
 *
 * Теперь данные берутся у Open-Meteo. Эта служба бесплатна и не требует
 * ключа или платёжной карты — то, что нужно, чтобы «просто работало» без
 * настройки. Запрашиваем разом все города и держим ответ в памяти:
 * погода меняется не поминутно, дёргать службу на каждый экран незачем.
 *
 * Если служба недоступна, отдаём null, и экран показывает прочерк вместо
 * выдуманного числа.
 */

export interface Погода {
  temp: number;
  feels: number;
  windKmh: number;
  icon: string;
  /** Ключ состояния для перевода — сам текст подставит интерфейс. */
  condKey: TKey;
}

/** Коды погоды Open-Meteo (WMO) в значок и состояние. */
function поКоду(code: number): { icon: string; condKey: TKey } {
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

interface Контекст {
  get: (city: string) => Погода | null;
  loading: boolean;
}

const WeatherContext = createContext<Контекст>({ get: () => null, loading: true });

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [карта, setКарта] = useState<Record<string, Погода>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let живо = true;
    const города = Object.entries(ГОРОДА);

    Promise.all(
      города.map(async ([имя, geo]) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m`;
          const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (!r.ok) return null;
          const d = await r.json();
          const c = d.current;
          if (!c) return null;
          const { icon, condKey } = поКоду(Number(c.weather_code));
          const п: Погода = {
            temp: Math.round(c.temperature_2m),
            feels: Math.round(c.apparent_temperature ?? c.temperature_2m),
            windKmh: Math.round(c.wind_speed_10m),
            icon,
            condKey,
          };
          return [имя, п] as const;
        } catch {
          return null;
        }
      }),
    ).then((пары) => {
      if (!живо) return;
      const собрано: Record<string, Погода> = {};
      for (const п of пары) if (п) собрано[п[0]] = п[1];
      setКарта(собрано);
      setLoading(false);
    });

    return () => {
      живо = false;
    };
  }, []);

  return (
    <WeatherContext.Provider value={{ get: (city) => карта[city] ?? null, loading }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
