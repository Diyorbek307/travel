"use client";

import { useState } from "react";
import Icon from "./icon";
import { conditionLabel, dayLabel, weatherIcon, type Forecast } from "@/lib/weather";
import type { Lang } from "@/lib/types";

/**
 * Прогноз погоды в городе с выбором дня.
 *
 * Турист планирует не «вообще», а на конкретную дату: в Бухаре в июле сорок
 * градусов, и это меняет маршрут сильнее, чем рейтинг объекта. Поэтому день
 * выбирается, а не показывается только сегодняшний.
 *
 * Часы показываются с шагом в три часа: почасовая лента на сутки не
 * помещается в ширину телефона и ничего не добавляет к решению.
 */

/** Часы, которые попадают в ленту: утро, день, вечер, ночь. */
const SHOWN_HOURS = [6, 9, 12, 15, 18, 21];

export default function WeatherCard({
  forecast,
  lang,
}: {
  forecast: Forecast;
  lang: Lang;
}) {
  const [picked, setPicked] = useState(0);

  // Погода необязательна: если сервис не ответил, страница живёт без неё.
  if (!forecast.days.length) return null;

  const today = forecast.days[0].date;
  const day = forecast.days[picked] ?? forecast.days[0];
  const isToday = day.date === today;

  // Для сегодняшнего дня прошедшие часы бесполезны — начинаем с текущего.
  const hours = day.hours.filter((h) => {
    if (isToday && forecast.now) return h.hour >= forecast.now.hour;
    return SHOWN_HOURS.includes(h.hour);
  });
  const strip = (isToday ? hours : hours).slice(0, 6);

  const headline = isToday && forecast.now ? forecast.now : null;

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-lg)]"
      style={{
        background: "linear-gradient(140deg, #1f6f8b 0%, #175a73 60%, #12475b 100%)",
        color: "#ffffff",
        boxShadow: "var(--shadow-2)",
      }}
    >
      {/* Выбор дня */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pt-3">
        {forecast.days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            onClick={() => setPicked(i)}
            aria-pressed={i === picked}
            className="pressable shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: i === picked ? "#ffffff" : "rgba(255,255,255,0.14)",
              color: i === picked ? "var(--primary-text)" : "rgba(255,255,255,0.92)",
            }}
          >
            {dayLabel(d.date, lang, today)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 px-5 pb-1 pt-4">
        <Icon name={headline ? weatherIcon(headline.code) : day.icon} size={52} />
        <div className="min-w-0">
          <p className="text-4xl font-semibold leading-none">
            {headline ? headline.temp : day.max}°
          </p>
          <p className="mt-1.5 truncate text-sm opacity-90">
            {conditionLabel(headline ? headline.code : day.code, lang)}
          </p>
        </div>
        <p className="ml-auto shrink-0 text-right text-xs opacity-80">
          <span className="block">{day.max}°</span>
          <span className="block opacity-70">{day.min}°</span>
        </p>
      </div>

      {strip.length > 0 && (
        <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto px-3 pb-4">
          {strip.map((h) => (
            <div
              key={h.hour}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2"
              style={{ background: "rgba(255,255,255,0.12)", minWidth: "4rem" }}
            >
              <span className="text-[11px] opacity-80">
                {String(h.hour).padStart(2, "0")}:00
              </span>
              <Icon name={h.icon} size={20} />
              <span className="text-sm font-medium">{h.temp}°</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
