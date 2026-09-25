"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Geo } from "@/lib/types";

/**
 * Живое местоположение пользователя.
 *
 * Нужно, чтобы показывать настоящее расстояние «от меня до места», а не
 * захардкоженные километры. Следим за позицией через watchPosition: пока
 * человек ходит по городу, цифры обновляются сами.
 *
 * Разрешение при запуске не спрашиваем: непрошеный запрос посреди
 * заставки почти всегда получает отказ, и второй раз система его уже не
 * покажет. Спрашивают кнопки, где позиция нужна по смыслу («Где я»,
 * маршрут, такси), а здесь следим за ней, как только разрешение есть —
 * уже было или только что дано.
 *
 * Нет разрешения или геолокации — pos остаётся null, и интерфейс
 * показывает прежнее (примерное) расстояние вместо пустоты. Никаких
 * координат никуда не отправляем — всё считается на устройстве.
 */

interface Контекст {
  pos: Geo | null;
  /** true, когда попытка получить позицию уже завершилась (успехом или нет). */
  ready: boolean;
}

const GeoContext = createContext<Контекст>({ pos: null, ready: false });

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState<Geo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation || !navigator.permissions) {
      setReady(true);
      return;
    }
    let следим: number | null = null;
    let живо = true;

    const следить = () => {
      if (следим !== null) return;
      следим = navigator.geolocation.watchPosition(
        (p) => {
          setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
          setReady(true);
        },
        () => setReady(true), // ошибка — просто нет позиции
        // enableHighAccuracy: на телефоне включает GPS (точнее); на ноутбуке
        // всё равно по Wi-Fi/IP — точнее физически не выйдет без приёмника.
        { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 },
      );
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((разрешение) => {
        if (!живо) return;
        if (разрешение.state === "granted") следить();
        else setReady(true);
        // Разрешили по кнопке «Где я» — начинаем следить без перезагрузки.
        разрешение.onchange = () => {
          if (разрешение.state === "granted") следить();
        };
      })
      .catch(() => setReady(true));

    return () => {
      живо = false;
      if (следим !== null) navigator.geolocation.clearWatch(следим);
    };
  }, []);

  return <GeoContext.Provider value={{ pos, ready }}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  return useContext(GeoContext);
}
