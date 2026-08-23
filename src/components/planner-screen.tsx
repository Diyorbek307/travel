"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "./app-state";
import { formatDistance, formatDuration, formatPrice } from "@/lib/geo";
import { t, themeLabel } from "@/lib/i18n";
import {
  THEMES,
  type Budget,
  type City,
  type Lang,
  type Poi,
  type Theme,
  type TransportMode,
} from "@/lib/types";

/** Ответ планировщика — форма совпадает с PlanResult на сервере. */
interface PlannedRoute {
  title: string;
  total_min: number;
  total_meters: number;
  total_cost_uzs: number;
  mode: TransportMode;
  summary: string;
  skipped: { name: string; reason: string }[];
  stops: {
    poi: Poi;
    order_index: number;
    arrive_min: number;
    stay_min: number;
    leg_meters: number;
    leg_min: number;
    note?: string;
  }[];
}

interface AssistantReply {
  intent: string;
  message: string;
  pois: Poi[];
  route?: PlannedRoute | null;
  parsed?: {
    city?: string;
    minutes?: number;
    themes: Theme[];
    budget: Budget;
    mode: TransportMode;
  };
}

const TIME_OPTIONS = [
  { minutes: 120, label: "2 часа" },
  { minutes: 240, label: "4 часа" },
  { minutes: 360, label: "6 часов" },
  { minutes: 480, label: "1 день" },
];

const MODE_OPTIONS: { value: TransportMode; label: string; icon: string }[] = [
  { value: "walk", label: "Пешком", icon: "🚶" },
  { value: "taxi", label: "Такси", icon: "🚕" },
  { value: "car", label: "Машина", icon: "🚗" },
];

const BUDGET_OPTIONS: { value: Budget; label: string; hint: string }[] = [
  { value: "low", label: "Экономный", hint: "до 50 000 сум" },
  { value: "medium", label: "Средний", hint: "до 200 000 сум" },
  { value: "high", label: "Свободный", hint: "без ограничений" },
];

const EXAMPLES = [
  "У меня 4 часа в Бухаре, люблю историю и хочу попробовать плов",
  "Что находится рядом со мной?",
  "Расскажи историю Регистана",
  "Где рядом хороший ресторан?",
  "Что можно посетить бесплатно?",
  "Что посмотреть вечером?",
];

export default function PlannerScreen({
  cities,
  initialCity,
  lang,
}: {
  cities: City[];
  initialCity: string | null;
  lang: Lang;
}) {
  const { lastCity } = useAppState();
  const [tab, setTab] = useState<"form" | "assistant">("form");

  const [city, setCity] = useState(initialCity ?? cities[0]?.slug ?? "");
  const [minutes, setMinutes] = useState(240);
  const [themes, setThemes] = useState<Set<Theme>>(new Set(["history", "architecture"]));
  const [budget, setBudget] = useState<Budget>("medium");
  const [mode, setMode] = useState<TransportMode>("walk");
  const [includeMeals, setIncludeMeals] = useState(true);
  // null = «сейчас»: планировщик возьмёт текущее время сервера.
  const [startAt, setStartAt] = useState<string | null>(null);

  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [route, setRoute] = useState<PlannedRoute | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [asking, setAsking] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Если город не задан явно, берём последний открытый — турист, скорее всего,
  // планирует именно тот город, который только что смотрел.
  useEffect(() => {
    if (!initialCity && lastCity && cities.some((c) => c.slug === lastCity)) {
      setCity(lastCity);
    }
  }, [initialCity, lastCity, cities]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => undefined,
      { maximumAge: 60000, timeout: 10000 },
    );
  }, []);

  async function generate() {
    setLoading(true);
    setRouteError(null);
    setRoute(null);
    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          city,
          minutes,
          themes: [...themes],
          budget,
          mode,
          lang,
          includeMeals,
          ...(startAt ? { startAtMin: hhmmToMinutes(startAt) } : {}),
          ...(position ?? {}),
        }),
      });
      const data = await response.json();
      if (data.route) {
        setRoute(data.route);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } else {
        setRouteError(data.reason ?? "Не удалось составить маршрут.");
      }
    } catch {
      setRouteError("Нет связи с сервером. В офлайне доступны сохранённые маршруты.");
    } finally {
      setLoading(false);
    }
  }

  async function ask(text: string) {
    if (!text.trim()) return;
    setAsking(true);
    setReply(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, lang, city, ...(position ?? {}) }),
      });
      setReply(await response.json());
    } catch {
      setReply({
        intent: "unknown",
        message: "Нет связи с сервером. Попробуйте ещё раз.",
        pois: [],
      });
    } finally {
      setAsking(false);
    }
  }

  function toggleTheme(th: Theme) {
    const next = new Set(themes);
    if (next.has(th)) next.delete(th);
    else next.add(th);
    setThemes(next);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <div className="mb-4 flex gap-2">
        <TabButton active={tab === "form"} onClick={() => setTab("form")}>
          🧭 {t(lang, "planner")}
        </TabButton>
        <TabButton active={tab === "assistant"} onClick={() => setTab("assistant")}>
          💬 {t(lang, "assistant")}
        </TabButton>
      </div>

      {tab === "form" ? (
        <>
          <Field label={t(lang, "choose_city")}>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg px-3 py-2 surface"
              style={{ color: "var(--text)" }}
            >
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t(lang, "time_available")}>
            <div className="grid grid-cols-4 gap-2">
              {TIME_OPTIONS.map((opt) => (
                <Choice
                  key={opt.minutes}
                  active={minutes === opt.minutes}
                  onClick={() => setMinutes(opt.minutes)}
                >
                  {opt.label}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label={t(lang, "interests")}>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((th) => (
                <Choice key={th} active={themes.has(th)} onClick={() => toggleTheme(th)}>
                  {themeLabel(lang, th)}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label={t(lang, "budget")}>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <Choice key={opt.value} active={budget === opt.value} onClick={() => setBudget(opt.value)}>
                  <span className="block">{opt.label}</span>
                  <span className="block text-[0.65rem] opacity-70">{opt.hint}</span>
                </Choice>
              ))}
            </div>
          </Field>

          <Field label={t(lang, "transport")}>
            <div className="grid grid-cols-3 gap-2">
              {MODE_OPTIONS.map((opt) => (
                <Choice key={opt.value} active={mode === opt.value} onClick={() => setMode(opt.value)}>
                  {opt.icon} {opt.label}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label="Когда начинаете">
            <div className="flex flex-wrap gap-2">
              <Choice active={startAt === null} onClick={() => setStartAt(null)}>
                Сейчас
              </Choice>
              {["09:00", "12:00", "15:00"].map((time) => (
                <Choice key={time} active={startAt === time} onClick={() => setStartAt(time)}>
                  {time}
                </Choice>
              ))}
              <input
                type="time"
                value={startAt ?? ""}
                onChange={(e) => setStartAt(e.target.value || null)}
                aria-label="Другое время начала"
                className="rounded-lg px-3 py-2 text-sm surface"
                style={{ color: "var(--text)" }}
              />
            </div>
            <p className="mt-1.5 text-xs soft">
              Объекты подбираются с учётом часов работы. Вечером почти всё уже
              закрыто — выберите утро, чтобы спланировать завтрашний день.
            </p>
          </Field>

          <label className="mb-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeMeals}
              onChange={(e) => setIncludeMeals(e.target.checked)}
            />
            Включить остановку на еду
          </label>

          <button
            onClick={generate}
            disabled={loading || !city}
            className="w-full rounded-lg px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Считаю маршрут…" : t(lang, "generate")}
          </button>

          {position && (
            <p className="mt-2 text-center text-xs soft">
              Маршрут начнётся от вашего текущего местоположения
            </p>
          )}

          {routeError && <p className="mt-4 rounded-lg px-3 py-2 text-sm surface">{routeError}</p>}

          <div ref={resultRef}>{route && <RouteResult route={route} lang={lang} />}</div>
        </>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t(lang, "ask_placeholder")}
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-lg px-3 py-2 surface"
              style={{ color: "var(--text)" }}
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="mt-2 w-full rounded-lg px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {asking ? "Думаю…" : "Спросить"}
            </button>
          </form>

          <div className="mt-4">
            <p className="mb-2 text-xs soft">Примеры вопросов:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuestion(ex);
                    ask(ex);
                  }}
                  className="rounded-full px-3 py-1.5 text-left text-xs surface"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {reply && (
            <div className="mt-5">
              <div className="rounded-xl p-4 surface">
                <p className="whitespace-pre-line text-sm">{reply.message}</p>
              </div>

              {reply.parsed && (
                <p className="mt-2 text-xs soft">
                  Понял так: город — {reply.parsed.city ?? "не указан"}
                  {reply.parsed.minutes ? `, время — ${formatDuration(reply.parsed.minutes, lang)}` : ""}
                  {reply.parsed.themes.length
                    ? `, интересы — ${reply.parsed.themes.map((th) => themeLabel(lang, th)).join(", ")}`
                    : ""}
                </p>
              )}

              {reply.route && <RouteResult route={reply.route} lang={lang} />}

              {!reply.route && reply.pois.length > 0 && (
                <ul className="mt-3 grid gap-2">
                  {reply.pois.map((poi) => (
                    <li key={poi.id}>
                      <Link
                        href={`/poi/${poi.slug}`}
                        className="block rounded-xl p-3 transition-colors surface hover:bg-soft"
                      >
                        <span className="block font-medium">{poi.name}</span>
                        {poi.short_desc && (
                          <span className="block truncate text-sm soft">{poi.short_desc}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed soft">
            Помощник разбирает вопрос и формулирует ответ, но сам маршрут, цены и
            часы работы всегда берутся из базы объектов — модель их не выдумывает.
          </p>
        </>
      )}
    </main>
  );
}

function RouteResult({ route, lang }: { route: PlannedRoute; lang: Lang }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 font-semibold">{route.title}</h2>

      <dl className="mb-3 grid grid-cols-3 gap-2">
        <Fact label={t(lang, "duration")}>{formatDuration(route.total_min, lang)}</Fact>
        <Fact label={t(lang, "distance")}>{formatDistance(route.total_meters, lang)}</Fact>
        <Fact label={t(lang, "price")}>
          {formatPrice(route.total_cost_uzs, lang)}
        </Fact>
      </dl>

      <ol className="grid gap-2">
        {route.stops.map((stop, i) => (
          <li key={`${stop.poi.id}-${i}`}>
            {stop.leg_meters > 0 && (
              <p className="py-1 pl-6 text-xs soft">
                ↓ {formatDistance(stop.leg_meters, lang)}, {stop.leg_min} {t(lang, "minutes")}
              </p>
            )}
            <Link
              href={`/poi/${stop.poi.slug}`}
              className="flex gap-3 rounded-xl p-3 transition-colors surface hover:bg-soft"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{stop.poi.name}</span>
                <span className="block text-xs soft">
                  через {formatDuration(stop.arrive_min, lang)} · осмотр {stop.stay_min}{" "}
                  {t(lang, "minutes")} ·{" "}
                  {formatPrice(stop.poi.price_uzs, lang)}
                  {stop.note ? ` · ${stop.note}` : ""}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {route.skipped.length > 0 && (
        <details className="mt-3 rounded-xl p-3 surface">
          <summary className="cursor-pointer text-sm">
            Что не поместилось ({route.skipped.length})
          </summary>
          <ul className="mt-2 grid gap-1 text-sm soft">
            {route.skipped.map((s) => (
              <li key={s.name}>
                {s.name} — {s.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

/** "09:30" -> 570. Планировщик принимает минуты от полуночи. */
function hhmmToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-2 surface">
      <dt className="text-[0.65rem] uppercase tracking-wide soft">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="rounded-lg px-3 py-2 text-sm transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
  );
}
