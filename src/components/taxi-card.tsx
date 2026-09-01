"use client";

import { useState } from "react";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { Lang, Poi } from "@/lib/types";

/**
 * Такси до объекта.
 *
 * В макете здесь стояла цена «~$2» и кнопка «заказать». Цену поездки
 * знает только служба такси — она зависит от времени, спроса и точки
 * подачи, и выдуманное число обмануло бы туриста. Поэтому цены нет, а
 * кнопка открывает Яндекс Go с координатами выбранного места: дальше
 * человек видит настоящую стоимость и заказывает сам.
 */
export default function TaxiCard({
  destinations,
  lang,
}: {
  /** Куда чаще всего едут: вокзал, аэропорт, главные объекты. */
  destinations: Poi[];
  lang: Lang;
}) {
  const [picked, setPicked] = useState<Poi | null>(destinations[0] ?? null);
  if (destinations.length === 0) return null;

  // Схема Яндекс Go: точка назначения по координатам, откуда — текущее
  // положение, его подставит само приложение.
  const href = picked
    ? `https://3.redirect.appmetrica.yandex.com/route?end-lat=${picked.lat}&end-lon=${picked.lon}&appmetrica_tracking_id=1178268795219780156`
    : "https://taxi.yandex.uz";

  return (
    <section className="mb-8">
      <h2 className="display-font mb-3 text-base font-bold">{t(lang, "taxi_title")}</h2>

      <div className="p-4 card">
        <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5"
          style={{ background: "var(--primary-tint)" }}
        >
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: "var(--primary)" }}
          />
          <span className="text-sm font-medium">{t(lang, "taxi_from")}</span>
        </div>

        <ul className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
          {destinations.map((d) => {
            const active = picked?.id === d.id;
            return (
              <li key={d.id} className="shrink-0">
                <button
                  onClick={() => setPicked(d)}
                  aria-pressed={active}
                  className="pressable whitespace-nowrap rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: active ? "var(--primary)" : "var(--surface-alt)",
                    color: active ? "var(--on-primary)" : "var(--text)",
                    border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  {d.name}
                </button>
              </li>
            );
          })}
        </ul>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 text-sm font-bold"
          style={{ background: "var(--primary)", color: "var(--on-primary)" }}
        >
          <Icon name="transport" size={18} />
          {t(lang, "taxi_open")}
        </a>

        <p className="mt-2 text-xs faint">{t(lang, "taxi_note")}</p>
      </div>
    </section>
  );
}
