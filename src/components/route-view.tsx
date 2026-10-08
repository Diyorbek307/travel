"use client";

import { useEffect, useState } from "react";
import RealMap from "@/components/real-map";
import { useT } from "@/components/lang-provider";
import { useДистанция } from "@/lib/distance";
import GoogleMap, { googleКлюч } from "@/components/google-map";
import { ГОРОДА, МЕСТА, расстояниеКм, точка } from "@/data/geo";
import { ссылкаНаЗаказ } from "@/lib/taxi";
import type { СпособПути } from "@/components/how-to-get";
import { ACCENT_FILL, BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE, SURFACE } from "@/lib/theme";
import type { Geo } from "@/lib/types";
import type { Маршрут } from "@/lib/routing";
import Навигатор from "@/components/navigator";

type Способ = "авто" | "пешком";
type Дорога = Маршрут;

/**
 * Маршрут до места.
 *
 * Раньше кнопка «Построить маршрут» показывала всплывающую надпись, что
 * маршрут построен, и на этом всё заканчивалось. Здесь она показывает
 * настоящую картину: где человек, где цель, сколько между ними.
 *
 * Линия прямая, и подписана как прямая. Повороты по улицам мы не знаем —
 * для этого нужен маршрутный сервис. Нарисовать кривую «на глаз» и
 * назвать её дорогой значило бы подсунуть человеку цифру, по которой он
 * рассчитает время выезда.
 *
 * Когда движок посчитал дорогу с поворотами, кнопка «Начать навигацию»
 * ведёт по ней прямо здесь, шаг за шагом и голосом (components/navigator).
 * Яндекс Карты остаются запасным вариантом, Яндекс Go — для такси.
 *
 * Три режима — пешком, на машине, на такси — выбираются прямо в
 * карточке («Как добраться»), экран открывается уже в нужном.
 *
 * Если точных координат нет (гостиницы и рестораны без точки в панели),
 * раньше маршрут вёл в центр города — человек приехал бы не туда. Теперь
 * навигатор и такси ищут место по названию и городу, а экран прямо
 * говорит, что адрес примерный.
 */

/** Подписи единиц времени приходят из словаря — «мин» есть не в каждом языке. */
type Единицы = { ч: string; мин: string };

/** Пешком считаем по пяти километрам в час. */
const ПЕШКОМ_КМЧ = 5;
/** Дорога всегда длиннее прямой — поправка на городскую сетку. */
const ИЗВИЛИСТОСТЬ = 1.3;

function минутыСловами(минут: number, е: Единицы): string {
  if (минут < 60) return `${минут} ${е.мин}`;
  const ч = Math.floor(минут / 60);
  const м = минут % 60;
  return м ? `${ч} ${е.ч} ${м} ${е.мин}` : `${ч} ${е.ч}`;
}

function времяПешком(км: number, е: Единицы): string {
  return минутыСловами(Math.round(((км * ИЗВИЛИСТОСТЬ) / ПЕШКОМ_КМЧ) * 60), е);
}

function времяВПути(секунды: number, е: Единицы): string {
  return минутыСловами(Math.max(1, Math.round(секунды / 60)), е);
}

export default function RouteView({
  название,
  город,
  geo,
  способ: начальный,
  onBack,
}: {
  название: string;
  город: string;
  /** Если координаты известны точнее, чем по справочнику. */
  geo?: Geo | null;
  /** Как человек хочет добираться — выбрано в карточке. */
  способ?: СпособПути;
  onBack: () => void;
}) {
  const { t, трК } = useT();
  const единицы: Единицы = { ч: t("common_h"), мин: t("common_min") };
  const дист = useДистанция();
  // Точно знаем, где цель: координаты из панели или общеизвестное место.
  // Иначе точка — центр города, и по ней можно только показать район.
  const точно = Boolean(geo) || название in МЕСТА;
  const цель = geo ?? точка(название, город);
  /** Текст для поиска в навигаторе, когда координат нет. */
  const поиск = [название, город, "Uzbekistan"].filter(Boolean).join(", ");
  const [режим, setРежим] = useState<СпособПути>(начальный ?? "авто");
  const [откуда, setОткуда] = useState<Geo | null>(null);
  const [состояние, setСостояние] = useState<"ищем" | "нашли" | "отказ">("ищем");
  // Движок маршрутов знает два способа; такси едет по той же дороге, что и машина.
  const способ: Способ = режим === "пешком" ? "пешком" : "авто";
  const [дорога, setДорога] = useState<Дорога | null>(null);
  const [считаем, setСчитаем] = useState(false);
  /** Что умеет движок. Пустой список — движка нет, остаёмся на прямой. */
  const [способы, setСпособы] = useState<Способ[]>([]);
  /** Идёт ли пошаговое ведение. */
  const [ведём, setВедём] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setСостояние("отказ");
      return;
    }
    let живо = true;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (!живо) return;
        setОткуда({ lat: p.coords.latitude, lon: p.coords.longitude });
        setСостояние("нашли");
      },
      () => {
        if (живо) setСостояние("отказ");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
    return () => {
      живо = false;
    };
  }, []);

  /*
   * Дорога от движка маршрутизации. Пока движок не подключён, ответ
   * приходит с available: false — и экран остаётся на прямой линии,
   * прямо об этом говоря.
   */
  useEffect(() => {
    // Дорогу до центра города вместо места не рисуем — это была бы неправда.
    if (!откуда || !цель || !точно) return;
    let отменено = false;
    setСчитаем(true);
    fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: откуда, to: цель, mode: способ }),
    })
      .then((r) => r.json())
      .then((д: { available: boolean; route: Дорога | null; modes?: Способ[] }) => {
        if (отменено) return;
        setСпособы(д.modes ?? []);
        setДорога(д.available ? д.route : null);
      })
      .catch(() => {
        if (!отменено) setДорога(null);
      })
      .finally(() => {
        if (!отменено) setСчитаем(false);
      });
    return () => {
      отменено = true;
    };
    // Цель за время жизни экрана не меняется, следим за точкой и способом.
  }, [откуда, цель?.lat, цель?.lon, способ]);

  // Без точного адреса расстояние было бы до центра города — не показываем.
  const км = точно && откуда && цель ? расстояниеКм(откуда, цель) : null;

  /*
   * Окно карты. Считаем по обеим осям отдельно: карта шире, чем выше, и
   * если брать радиус по расстоянию между точками, кадр выходит втрое
   * шире нужного, а маршрут сжимается в точку посередине.
   */
  const зона = (() => {
    if (!цель) return null;
    if (!откуда) return { центр: цель, радиусКм: 12 };

    // Считаем по всем точкам дороги: объезд уходит в сторону, и рамка по
    // двум концам обрезала бы половину маршрута.
    const все = дорога?.точки.length ? дорога.точки : [откуда, цель];
    const широты = все.map((т) => т.lat);
    const долготы = все.map((т) => т.lon);
    const центр = {
      lat: (Math.min(...широты) + Math.max(...широты)) / 2,
      lon: (Math.min(...долготы) + Math.max(...долготы)) / 2,
    };
    const поШироте = (Math.max(...широты) - Math.min(...широты)) * 111;
    const поДолготе =
      (Math.max(...долготы) - Math.min(...долготы)) * 111 * Math.cos((центр.lat * Math.PI) / 180);
    // Пропорция холста: по ширине помещается в 1.57 раза больше.
    const нужно = Math.max(поШироте / 2, поДолготе / 2 / 1.57);
    return { центр, радиусКм: Math.max(1.2, нужно * 1.4) };
  })();

  /*
   * Что ещё показать на карте. Пустая заливка вокруг двух точек ничего не
   * говорит: рядом стоящие знакомые места сразу дают понять, куда едем и
   * далеко ли это по городским меркам.
   */
  const рядом = цель
    ? [...Object.entries(МЕСТА), ...Object.entries(ГОРОДА)]
        .filter(([имя]) => имя !== название)
        .map(([имя, geo]) => ({ название: имя, geo, км: расстояниеКм(цель, geo) }))
        .filter((м) => м.км <= (зона?.радиусКм ?? 12) * 1.5)
        .sort((a, b) => a.км - b.км)
        .slice(0, 8)
    : [];

  /**
   * Навигатор: Яндекс Карты с маршрутом нужного вида — pd (пешком), auto
   * (за рулём), taxi (такси). Без точных координат цель — текстом, Карты
   * сами найдут место по названию.
   */
  function навигатор(вид: "pd" | "auto" | "taxi"): string | null {
    if (!цель && !поиск) return null;
    const п = new URLSearchParams();
    const куда = точно && цель ? `${цель.lat},${цель.lon}` : поиск;
    п.set("rtext", `${откуда ? `${откуда.lat},${откуда.lon}` : ""}~${куда}`);
    п.set("rtt", вид);
    return `https://yandex.ru/maps/?${п.toString()}`;
  }

  const адресНавигатора = навигатор(режим === "пешком" ? "pd" : "auto");
  // Такси: с точной точкой — сразу Яндекс Go; без неё — Карты в режиме
  // такси, они найдут место по названию и предложат вызвать машину.
  const адресТакси = точно && цель ? ссылкаНаЗаказ(откуда, цель, название) : навигатор("taxi");
  // Вести сами можем, только когда знаем и человека, и цель, и дорогу между ними.
  const можноВести = Boolean(дорога && откуда && цель && точно && режим !== "такси");

  if (ведём && дорога && откуда && цель) {
    return (
      <Навигатор
        дорога={дорога}
        откуда={откуда}
        цель={цель}
        название={название}
        способ={способ}
        onStop={() => setВедём(false)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ background: CREAM }}>
      <div
        className="flex items-center gap-3 border-b px-4 pt-14 pb-3"
        style={{ background: SURFACE, borderColor: BORDER }}
      >
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: CREAM }}
          aria-label={t("common_back")}
        >
          <svg
            className="rtl-flip"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke={TEXT}
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>
            {t("route_kicker")}
          </p>
          <h1
            className="truncate text-lg font-bold"
            style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
          >
            {трК(название)}
          </h1>
        </div>
      </div>

      <div className="hide-scroll flex-1 overflow-y-auto p-4">
        {!цель ? (
          <div className="rounded-2xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
            <p className="text-sm" style={{ color: MUTED }}>
              {t("route_no_coords")}
            </p>
          </div>
        ) : (
          <>
            <div
              className="overflow-hidden rounded-2xl border shadow-sm"
              style={{ background: SURFACE, borderColor: BORDER }}
            >
              {/*
                Есть ключ Google — показываем его карту с его же маршрутом.
                Нет ключа — карту OpenStreetMap с линией, которую посчитал
                наш движок. Обе живут внутри приложения и никуда не уводят.
              */}
              {googleКлюч() ? (
                <GoogleMap
                  откуда={откуда}
                  куда={цель}
                  подпись={название}
                  высота="clamp(280px, 44vh, 520px)"
                  пешком={способ === "пешком"}
                />
              ) : (
                <RealMap
                  высота="clamp(280px, 44vh, 520px)"
                  откуда={откуда}
                  путь={дорога?.точки ?? null}
                  точки={[
                    { geo: цель, подпись: точно ? название : трК(город), главная: true },
                    ...рядом.map((р) => ({ geo: р.geo, подпись: р.название })),
                  ]}
                />
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {(
                [
                  ["пешком", "🚶", "route_mode_walk"],
                  ["авто", "🚗", "route_mode_car"],
                  ["такси", "🚕", "tr_taxi"],
                ] as const
              ).map(([в, знак, подпись]) => (
                <button
                  key={в}
                  onClick={() => setРежим(в)}
                  className="flex-1 rounded-xl border py-2 text-xs font-bold"
                  style={{
                    background: режим === в ? ACCENT_FILL : SURFACE,
                    color: режим === в ? WHITE : MUTED,
                    borderColor: режим === в ? GREEN : BORDER,
                  }}
                >
                  {знак} {t(подпись)}
                </button>
              ))}
            </div>
            {!точно && (
              <p
                className="mt-3 rounded-xl px-3 py-2 text-[11px] leading-relaxed"
                style={{ background: SURFACE, color: MUTED }}
              >
                ℹ️ {t("route_approx")}
              </p>
            )}

            <div className="mt-4 rounded-2xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "#2f6fd0" }} />
                <span className="min-w-0 flex-1 truncate text-sm" style={{ color: TEXT }}>
                  {состояние === "нашли"
                    ? t("geo_you_here")
                    : состояние === "ищем"
                    ? t("geo_searching")
                    : t("geo_unavailable")}
                </span>
              </div>
              <div className="my-1 ml-1 h-6 w-px" style={{ background: BORDER }} />
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GOLD }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: TEXT }}>
                  {трК(название)}
                </span>
              </div>

              {дорога ? (
                <div className="mt-4 flex flex-wrap gap-6 border-t pt-3" style={{ borderColor: BORDER }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                      {t("route_by_road")}
                    </p>
                    <p className="text-base font-bold" style={{ color: TEXT }}>
                      {дист.формат(дорога.метры / 1000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                      {способ === "пешком" ? t("route_mode_walk") : t("route_mode_car")}
                    </p>
                    <p className="text-base font-bold" style={{ color: TEXT }}>
                      {времяВПути(дорога.секунды, единицы)}
                    </p>
                  </div>
                </div>
              ) : (
                км !== null && (
                  <div className="mt-4 flex flex-wrap gap-6 border-t pt-3" style={{ borderColor: BORDER }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                        {t("route_straight")}
                      </p>
                      <p className="text-base font-bold" style={{ color: TEXT }}>
                        {дист.формат(км)}
                      </p>
                    </div>
                    {км <= 6 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                          {t("route_walk_about")}
                        </p>
                        <p className="text-base font-bold" style={{ color: TEXT }}>
                          {времяПешком(км, единицы)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}

              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: MUTED }}>
                {состояние === "отказ"
                  ? t("geo_denied_hint")
                  : считаем
                  ? t("route_calc")
                  : дорога
                  ? t("route_by_streets").replace("{s}", дорога.источник) + (дорога.исправить ? " " : "")
                  : способы.length > 0
                  ? t("route_calc_failed")
                  : t("route_straight_note")}
                {дорога?.исправить && !считаем && состояние !== "отказ" && (
                  <a href={дорога.исправить} target="_blank" rel="noopener noreferrer" className="underline">
                    {t("nav_fix_map")}
                  </a>
                )}
              </p>
            </div>

            <div className={`mt-4 flex gap-2 pb-6 ${режим === "такси" ? "flex-col-reverse" : "flex-col"}`}>
              {можноВести && (
                <button
                  onClick={() => setВедём(true)}
                  className="rounded-2xl py-3.5 text-center text-sm font-bold"
                  style={{ background: ACCENT_FILL, color: WHITE }}
                >
                  ▶ {t("nav_start")}
                </button>
              )}
              <a
                href={адресНавигатора ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl py-3.5 text-center text-sm font-bold"
                style={
                  режим === "такси" || можноВести
                    ? { color: GREEN, border: `1px solid ${GREEN}` }
                    : { background: ACCENT_FILL, color: WHITE }
                }
              >
                {режим === "пешком" ? "🚶" : "🚗"} {t(можноВести ? "route_open_yandex" : "route_open_nav")}
              </a>
              {/* Такси — сразу в Яндекс Go с этой точкой назначения. */}
              <a
                href={адресТакси ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl py-3.5 text-center text-sm font-bold"
                style={
                  режим === "такси"
                    ? { background: ACCENT_FILL, color: WHITE }
                    : { color: GREEN, border: `1px solid ${GREEN}` }
                }
              >
                🚕 {t("route_taxi_here")}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
