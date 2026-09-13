"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { TKey } from "@/lib/i18n";

/**
 * Настоящая погода.
 *
 * Раньше температура была вписана в код: «34° в Самарканде» показывалось
 * всегда, хоть в январе. Для приложения про поездки это прямая
 * дезинформация — по такой цифре собирают чемодан.
 *
 * Данные берём с нашего маршрута /api/weather. Он на сервере ходит в
 * OpenWeather (если задан ключ OPENWEATHER_API_KEY) или в бесплатный
 * Open-Meteo — ключ в браузер не попадает. Запрашиваем разом все города
 * и держим ответ в памяти: погода меняется не поминутно.
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

    async function обновить() {
      try {
        const r = await fetch("/api/weather", { signal: AbortSignal.timeout(9000) });
        if (!r.ok) return;
        const d = (await r.json()) as { weather?: Record<string, Погода> };
        if (!живо || !d.weather) return;
        // Пустой ответ (сеть отвалилась) не затираем прежними данными —
        // старая правда лучше внезапного прочерка на всех городах.
        if (Object.keys(d.weather).length) setКарта(d.weather);
      } catch {
        // сеть недоступна — оставляем что было
      } finally {
        if (живо) setLoading(false);
      }
    }

    обновить();

    /*
     * Держим данные свежими без перезагрузки.
     *
     * Источник обновляет показания примерно раз в час, чаще спрашивать
     * незачем. Плюс перезапрашиваем, когда человек возвращается на
     * вкладку: телефон мог пролежать в кармане полдня, и цифра к моменту
     * возврата успела устареть.
     */
    const час = 60 * 60 * 1000;
    const таймер = setInterval(обновить, час);

    let последнее = Date.now();
    function приВозврате() {
      if (document.visibilityState !== "visible") return;
      // Обновляем, только если прошло заметное время — не на каждый щелчок.
      if (Date.now() - последнее > 30 * 60 * 1000) {
        последнее = Date.now();
        обновить();
      }
    }
    document.addEventListener("visibilitychange", приВозврате);

    return () => {
      живо = false;
      clearInterval(таймер);
      document.removeEventListener("visibilitychange", приВозврате);
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
