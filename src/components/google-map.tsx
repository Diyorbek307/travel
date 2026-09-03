"use client";

import type { Geo } from "@/lib/types";

/**
 * Карта Google внутри приложения.
 *
 * Показывается через Maps Embed API: это готовая карта Google со всеми
 * улицами и, когда заданы обе точки, с настоящим маршрутом, который Google
 * считает сам.
 *
 * Главное — она остаётся внутри окна приложения. Нажатие по карте не
 * открывает приложение Google Карт и вообще никуда не уводит: рамка
 * изолирована, а сам виджет ссылок наружу не расставляет.
 *
 * Ключ обязателен. Google выдаёт его в облачной консоли, и для выдачи
 * нужен привязанный платёжный аккаунт, даже когда сам Embed API денег не
 * стоит. Пока ключа нет, вызывающий экран показывает карту OpenStreetMap:
 * улицы там тоже настоящие, а карта и платёжный аккаунт не нужны.
 *
 * Ключ этот открытый, он уходит в браузер по самому устройству Embed API.
 * Чтобы им не воспользовались посторонние, в консоли Google его нужно
 * ограничить своим доменом — это единственная защита, которая тут
 * работает.
 */

export function googleКлюч(): string | null {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || null;
}

export default function GoogleMap({
  откуда,
  куда,
  подпись,
  высота = 300,
  пешком = false,
}: {
  откуда?: Geo | null;
  куда: Geo;
  подпись?: string;
  /** Как и у своей карты: число или строка CSS. */
  высота?: number | string;
  пешком?: boolean;
}) {
  const ключ = googleКлюч();
  if (!ключ) return null;

  const т = (г: Geo) => `${г.lat},${г.lon}`;

  // С двумя точками — маршрут, с одной — просто место на карте.
  const адрес = откуда
    ? `https://www.google.com/maps/embed/v1/directions?key=${ключ}&origin=${т(откуда)}&destination=${т(куда)}&mode=${пешком ? "walking" : "driving"}`
    : `https://www.google.com/maps/embed/v1/place?key=${ключ}&q=${т(куда)}&zoom=15`;

  return (
    <iframe
      src={адрес}
      title={подпись ? `Карта: ${подпись}` : "Карта"}
      width="100%"
      height={высота}
      style={{ border: 0, display: "block" }}
      loading="lazy"
      // Рамка не должна уметь ничего, кроме показа карты.
      referrerPolicy="no-referrer-when-downgrade"
      allow="fullscreen"
    />
  );
}
