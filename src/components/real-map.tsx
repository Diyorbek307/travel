"use client";

import { useEffect, useRef } from "react";
import type { Map as LMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { GOLD, GREEN } from "@/lib/theme";
import type { Geo } from "@/lib/types";

/**
 * Настоящая карта с улицами.
 *
 * Своя рисованная карта показывала страну и границы, но улиц на ней нет,
 * и найти по ней перекрёсток невозможно. Здесь настоящая подложка: дома,
 * дороги, названия.
 *
 * Карта живёт внутри приложения. Нажатие по ней не открывает чужое
 * картографическое приложение и вообще никуда не уводит — человек
 * остаётся там, где был.
 *
 * Подложку берём из OpenStreetMap. Ключ и платёжная карта для неё не
 * нужны, но у проекта есть правила пользования: он терпит умеренную
 * нагрузку и требует указывать авторство. Когда людей станет много,
 * подложку нужно будет купить у поставщика тайлов — меняется одна строка
 * с адресом.
 *
 * Метки рисуем кружками, а не картинками: стандартные значки Leaflet
 * тянут свои файлы по путям, которые ломаются при сборке, и вместо метки
 * получается пустое место.
 */

export interface Точка {
  geo: Geo;
  подпись?: string;
  /** Выделенная: крупнее и золотая. */
  главная?: boolean;
}

export default function RealMap({
  точки = [],
  откуда,
  путь,
  высота = 300,
  приблизить = true,
  onТочка,
  onВыбор,
}: {
  точки?: Точка[];
  /** Где человек. Рисуется синим кружком. */
  откуда?: Geo | null;
  /** Линия дороги, если её посчитал движок маршрутизации. */
  путь?: Geo[] | null;
  высота?: number;
  /** Подогнать вид под содержимое. */
  приблизить?: boolean;
  /** Нажатие по свободному месту. */
  onТочка?: (g: Geo) => void;
  onВыбор?: (т: Точка) => void;
}) {
  const узел = useRef<HTMLDivElement>(null);
  const карта = useRef<LMap | null>(null);
  const слой = useRef<LayerGroup | null>(null);

  // Свежие обработчики без пересоздания карты: иначе при каждом нажатии
  // карта собиралась бы заново и теряла положение.
  const действия = useRef({ onТочка, onВыбор });
  действия.current = { onТочка, onВыбор };

  useEffect(() => {
    let живо = true;

    // Leaflet трогает window, поэтому подгружаем его только в браузере.
    import("leaflet").then((L) => {
      if (!живо || !узел.current || карта.current) return;

      const м = L.map(узел.current, {
        center: [41.3, 69.24],
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(м);

      м.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        действия.current.onТочка?.({ lat: e.latlng.lat, lon: e.latlng.lng });
      });

      карта.current = м;
      слой.current = L.layerGroup().addTo(м);
      нарисовать();
    });

    return () => {
      живо = false;
      карта.current?.remove();
      карта.current = null;
      слой.current = null;
    };
    // Карта создаётся один раз за жизнь экрана.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Перерисовать всё, что лежит поверх подложки. */
  async function нарисовать() {
    const м = карта.current;
    const с = слой.current;
    if (!м || !с) return;
    const L = await import("leaflet");
    с.clearLayers();

    if (путь && путь.length >= 2) {
      const линия = путь.map((г) => [г.lat, г.lon] as [number, number]);
      // Белая подложка под золотой линией: на пёстрой карте одна тонкая
      // линия теряется среди дорог.
      L.polyline(линия, { color: "#ffffff", weight: 9, opacity: 0.85 }).addTo(с);
      L.polyline(линия, { color: GOLD, weight: 5 }).addTo(с);
    }

    for (const т of точки) {
      const кружок = L.circleMarker([т.geo.lat, т.geo.lon], {
        radius: т.главная ? 9 : 6,
        color: т.главная ? "#8c681d" : GREEN,
        weight: 2.5,
        fillColor: т.главная ? GOLD : "#ffffff",
        fillOpacity: 1,
      }).addTo(с);
      if (т.подпись) кружок.bindTooltip(т.подпись, { direction: "top" });
      кружок.on("click", (e: { originalEvent?: Event }) => {
        // Иначе нажатие по метке считается ещё и нажатием по карте.
        e.originalEvent?.stopPropagation();
        действия.current.onВыбор?.(т);
      });
    }

    if (откуда) {
      L.circleMarker([откуда.lat, откуда.lon], {
        radius: 7,
        color: "#ffffff",
        weight: 3,
        fillColor: "#2f6fd0",
        fillOpacity: 1,
      })
        .addTo(с)
        .bindTooltip("Вы здесь", { direction: "top" });
    }

    if (!приблизить) return;

    const всё: [number, number][] = [
      ...(путь ?? []).map((г) => [г.lat, г.lon] as [number, number]),
      ...точки.map((т) => [т.geo.lat, т.geo.lon] as [number, number]),
      ...(откуда ? [[откуда.lat, откуда.lon] as [number, number]] : []),
    ];
    if (всё.length === 1) м.setView(всё[0], 14);
    else if (всё.length > 1) м.fitBounds(L.latLngBounds(всё), { padding: [30, 30] });
  }

  // Содержимое меняется чаще, чем сама карта.
  useEffect(() => {
    void нарисовать();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [точки, откуда, путь, приблизить]);

  return <div ref={узел} style={{ height: высота, width: "100%", zIndex: 0 }} />;
}
