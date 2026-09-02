"use client";

import { useEffect, useState } from "react";
import { BORDER, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { ГОРОДА, МЕСТА, точка } from "@/data/geo";
import type { Geo } from "@/lib/types";

/**
 * Заказ такси.
 *
 * Маршрут строится по координатам и открывается в Яндекс Go: цену и
 * подтверждение человек видит там. Внутри нашего экрана цена
 * показывается только при подключённом партнёрском доступе — иначе
 * пришлось бы её выдумывать, а по ней принимают решение.
 *
 * Точка отправления берётся с устройства. Разрешение спрашиваем только
 * когда человек нажал «Отсюда»: просить геолокацию при открытии экрана
 * — верный способ получить отказ навсегда.
 */

interface Оценка {
  цена: number;
  валюта: string;
  тариф: string;
  минут: number | null;
}

export default function TaxiOrder({
  город = "Самарканд",
  сразуКуда,
}: {
  город?: string;
  /** Если экран открыт со страницы места — оно уже выбрано. */
  сразуКуда?: { название: string; geo: Geo | null };
}) {
  const [откуда, setОткуда] = useState<Geo | null>(null);
  const [подписьОткуда, setПодписьОткуда] = useState("Моё местоположение");
  const [геоОшибка, setГеоОшибка] = useState<string | null>(null);
  const [куда, setКуда] = useState<{ название: string; geo: Geo } | null>(() => {
    if (сразуКуда?.geo) return { название: сразуКуда.название, geo: сразуКуда.geo };
    return null;
  });
  const [оценки, setОценки] = useState<Оценка[] | null>(null);
  const [ценаДоступна, setЦенаДоступна] = useState<boolean | null>(null);

  // Куда можно поехать: известные места этого города плюс сам центр.
  const направления = Object.entries(МЕСТА)
    .filter(([, g]) => {
      const центр = ГОРОДА[город];
      if (!центр) return true;
      // Грубо «в пределах города»: половина градуса примерно 50 км.
      return Math.abs(g.lat - центр.lat) < 0.5 && Math.abs(g.lon - центр.lon) < 0.5;
    })
    .map(([название, geo]) => ({ название, geo }));

  function определитьГде() {
    if (!navigator.geolocation) {
      setГеоОшибка("Устройство не умеет определять местоположение");
      return;
    }
    setГеоОшибка(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setОткуда({ lat: p.coords.latitude, lon: p.coords.longitude });
        setПодписьОткуда("Моё местоположение");
      },
      () => setГеоОшибка("Не удалось определить — поедем от центра города"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  // Спрашиваем цену, когда есть обе точки.
  useEffect(() => {
    if (!куда) return;
    const старт = откуда ?? ГОРОДА[город];
    if (!старт) return;

    let отменено = false;
    fetch("/api/taxi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: старт, to: куда.geo }),
    })
      .then((r) => r.json())
      .then((d: { available: boolean; options: Оценка[] }) => {
        if (отменено) return;
        setЦенаДоступна(d.available);
        setОценки(d.options);
      })
      .catch(() => {
        if (!отменено) setЦенаДоступна(false);
      });
    return () => {
      отменено = true;
    };
  }, [куда, откуда, город]);

  const старт = откуда ?? ГОРОДА[город] ?? null;

  function ссылка(): string | null {
    if (!куда) return null;
    const п = new URLSearchParams();
    if (старт) {
      п.set("start-lat", старт.lat.toFixed(6));
      п.set("start-lon", старт.lon.toFixed(6));
    }
    п.set("end-lat", куда.geo.lat.toFixed(6));
    п.set("end-lon", куда.geo.lon.toFixed(6));
    п.set("end-name", куда.название);
    const ref = process.env.NEXT_PUBLIC_YANDEX_TAXI_REF;
    if (ref) п.set("ref", ref);
    return `https://3.redirect.appmetrica.yandex.com/route?${п.toString()}`;
  }

  const адрес = ссылка();

  return (
    <section className="px-4 pt-5">
      <p className="mb-3 text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
        🚖 Такси
      </p>

      <div className="rounded-2xl border p-4" style={{ background: WHITE, borderColor: BORDER }}>
        {/* Откуда */}
        <div className="mb-2 flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#F0F8F4" }}>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: GREEN }} />
          <span className="min-w-0 flex-1 truncate text-sm" style={{ color: TEXT }}>
            {откуда ? подписьОткуда : `Центр города · ${город}`}
          </span>
          <button
            onClick={определитьГде}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: GREEN, color: WHITE }}
          >
            Отсюда
          </button>
        </div>

        {/* Куда */}
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5" style={{ borderColor: BORDER }}>
          <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: GOLD }} />
          <span className="min-w-0 flex-1 truncate text-sm" style={{ color: куда ? TEXT : MUTED }}>
            {куда ? куда.название : "Куда едем"}
          </span>
        </div>

        {геоОшибка && (
          <p className="mb-2 text-xs" style={{ color: MUTED }}>
            {геоОшибка}
          </p>
        )}

        {/* Быстрый выбор */}
        <div className="hide-scroll mb-3 flex gap-2 overflow-x-auto pb-1">
          {направления.map((н) => (
            <button
              key={н.название}
              onClick={() => setКуда(н)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium"
              style={{
                borderColor: куда?.название === н.название ? GREEN : BORDER,
                background: куда?.название === н.название ? "#F0F8F4" : WHITE,
                color: TEXT,
              }}
            >
              {н.название}
            </button>
          ))}
        </div>

        {/* Цена — только настоящая */}
        {куда && ценаДоступна === true && оценки && оценки.length > 0 && (
          <ul className="mb-3 grid gap-1.5">
            {оценки.map((o) => (
              <li key={o.тариф} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span style={{ color: MUTED }}>{o.тариф}</span>
                <span style={{ color: TEXT }}>
                  {o.цена.toLocaleString("ru")} {o.валюта}
                  {o.минут ? ` · ${o.минут} мин` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        {куда && ценаДоступна === false && (
          <p className="mb-3 text-xs leading-relaxed" style={{ color: MUTED }}>
            Цену покажет Яндекс Go — там же подтвердите поездку.
          </p>
        )}

        <a
          href={адрес ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!адрес}
          onClick={(e) => {
            if (!адрес) e.preventDefault();
          }}
          className="block rounded-xl py-3.5 text-center text-sm font-bold"
          style={{
            background: адрес ? GOLD : BORDER,
            color: адрес ? TEXT : MUTED,
            pointerEvents: адрес ? undefined : "none",
          }}
        >
          {куда ? "Открыть в Яндекс Go" : "Выберите, куда едем"}
        </a>

        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: MUTED }}>
          Поездку оформляет Яндекс Go: там оплата, машина и поддержка по поездке.
        </p>
      </div>
    </section>
  );
}
