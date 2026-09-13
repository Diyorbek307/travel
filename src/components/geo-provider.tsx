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
 * Разрешение спрашивает сам браузер/телефон. Если отказали или геолокации
 * нет — pos остаётся null, и интерфейс показывает прежнее (примерное)
 * расстояние вместо пустоты. Никаких координат никуда не отправляем —
 * всё считается на устройстве.
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
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setReady(true);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
        setReady(true);
      },
      () => setReady(true), // отказ или ошибка — просто нет позиции
      // enableHighAccuracy: на телефоне включает GPS (точнее); на ноутбуке
      // всё равно по Wi-Fi/IP — точнее физически не выйдет без приёмника.
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return <GeoContext.Provider value={{ pos, ready }}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  return useContext(GeoContext);
}
