"use client";

import { useEffect, useState } from "react";
import RealMap from "@/components/real-map";
import GoogleMap, { googleКлюч } from "@/components/google-map";
import { ГОРОДА, МЕСТА, расстояниеКм, точка } from "@/data/geo";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import type { Geo } from "@/lib/types";

type Способ = "авто" | "пешком";

interface Дорога {
  точки: Geo[];
  метры: number;
  секунды: number;
  источник: string;
}

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
 * Поэтому пошаговую навигацию отдаём тем, у кого есть дорожный граф:
 * Яндекс Карты для пешком и за рулём, Яндекс Go для такси.
 */

/** Пешком считаем по пяти километрам в час. */
const ПЕШКОМ_КМЧ = 5;
/** Дорога всегда длиннее прямой — поправка на городскую сетку. */
const ИЗВИЛИСТОСТЬ = 1.3;

function времяПешком(км: number): string {
  const минут = Math.round(((км * ИЗВИЛИСТОСТЬ) / ПЕШКОМ_КМЧ) * 60);
  if (минут < 60) return `${минут} мин`;
  const ч = Math.floor(минут / 60);
  return `${ч} ч ${минут % 60} мин`;
}

function времяВПути(секунды: number): string {
  const минут = Math.max(1, Math.round(секунды / 60));
  if (минут < 60) return `${минут} мин`;
  const ч = Math.floor(минут / 60);
  const м = минут % 60;
  return м ? `${ч} ч ${м} мин` : `${ч} ч`;
}

export default function RouteView({
  название,
  город,
  geo,
  onBack,
  onТакси,
}: {
  название: string;
  город: string;
  /** Если координаты известны точнее, чем по справочнику. */
  geo?: Geo | null;
  onBack: () => void;
  onТакси?: () => void;
}) {
  const цель = geo ?? точка(название, город);
  const [откуда, setОткуда] = useState<Geo | null>(null);
  const [состояние, setСостояние] = useState<"ищем" | "нашли" | "отказ">("ищем");
  const [способ, setСпособ] = useState<Способ>("авто");
  const [дорога, setДорога] = useState<Дорога | null>(null);
  const [считаем, setСчитаем] = useState(false);
  /** Что умеет движок. Пустой список — движка нет, остаёмся на прямой. */
  const [способы, setСпособы] = useState<Способ[]>([]);

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
    if (!откуда || !цель) return;
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

  const км = откуда && цель ? расстояниеКм(откуда, цель) : null;

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

  function навигатор(): string | null {
    if (!цель) return null;
    const п = new URLSearchParams();
    п.set("rtext", откуда ? `${откуда.lat},${откуда.lon}~${цель.lat},${цель.lon}` : `~${цель.lat},${цель.lon}`);
    п.set("rtt", "auto");
    return `https://yandex.ru/maps/?${п.toString()}`;
  }

  const адресНавигатора = навигатор();

  return (
    <div className="flex h-full flex-col" style={{ background: CREAM }}>
      <div className="flex items-center gap-3 border-b px-4 pt-14 pb-3" style={{ background: WHITE, borderColor: BORDER }}>
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: CREAM }}
          aria-label="Назад"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>
            МАРШРУТ
          </p>
          <h1 className="truncate text-lg font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
            {название}
          </h1>
        </div>
      </div>

      <div className="hide-scroll flex-1 overflow-y-auto p-4">
        {!цель ? (
          <div className="rounded-2xl border p-4" style={{ background: WHITE, borderColor: BORDER }}>
            <p className="text-sm" style={{ color: MUTED }}>
              Координат этого места у нас нет — маршрут построить не от чего.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ background: WHITE, borderColor: BORDER }}>
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
                  высота={300}
                  пешком={способ === "пешком"}
                />
              ) : (
                <RealMap
                  высота={300}
                  откуда={откуда}
                  путь={дорога?.точки ?? null}
                  точки={[
                    { geo: цель, подпись: название, главная: true },
                    ...рядом.map((р) => ({ geo: р.geo, подпись: р.название })),
                  ]}
                />
              )}
            </div>

            {способы.length > 1 && (
              <div className="mt-4 flex gap-2">
                {способы.map((в) => (
                  <button
                    key={в}
                    onClick={() => setСпособ(в)}
                    className="flex-1 rounded-xl border py-2 text-xs font-bold"
                    style={{
                      background: способ === в ? GREEN : WHITE,
                      color: способ === в ? WHITE : MUTED,
                      borderColor: способ === в ? GREEN : BORDER,
                    }}
                  >
                    {в === "авто" ? "На машине" : "Пешком"}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl border p-4" style={{ background: WHITE, borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "#2f6fd0" }} />
                <span className="min-w-0 flex-1 truncate text-sm" style={{ color: TEXT }}>
                  {состояние === "нашли"
                    ? "Вы здесь"
                    : состояние === "ищем"
                      ? "Определяем, где вы…"
                      : "Местоположение недоступно"}
                </span>
              </div>
              <div className="my-1 ml-1 h-6 w-px" style={{ background: BORDER }} />
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GOLD }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: TEXT }}>
                  {название}
                </span>
              </div>

              {дорога ? (
                <div className="mt-4 flex flex-wrap gap-6 border-t pt-3" style={{ borderColor: BORDER }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                      По дороге
                    </p>
                    <p className="text-base font-bold" style={{ color: TEXT }}>
                      {(дорога.метры / 1000).toFixed(1).replace(".", ",")} км
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                      {способ === "пешком" ? "Пешком" : "На машине"}
                    </p>
                    <p className="text-base font-bold" style={{ color: TEXT }}>
                      {времяВПути(дорога.секунды)}
                    </p>
                  </div>
                </div>
              ) : (
                км !== null && (
                  <div className="mt-4 flex flex-wrap gap-6 border-t pt-3" style={{ borderColor: BORDER }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                        По прямой
                      </p>
                      <p className="text-base font-bold" style={{ color: TEXT }}>
                        {км.toLocaleString("ru")} км
                      </p>
                    </div>
                    {км <= 6 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                          Пешком примерно
                        </p>
                        <p className="text-base font-bold" style={{ color: TEXT }}>
                          {времяПешком(км)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}

              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: MUTED }}>
                {состояние === "отказ"
                  ? "Разрешите доступ к местоположению — тогда покажем расстояние от вас."
                  : считаем
                    ? "Считаем дорогу…"
                    : дорога
                      ? `Маршрут по улицам, считал ${дорога.источник}. Время без учёта пробок.`
                      : способы.length > 0
                        ? "Дорогу посчитать не удалось — показываем прямую между точками."
                        : "Линия прямая: улицы и повороты знает навигатор, у него дорога выйдет длиннее."}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2 pb-6">
              <a
                href={адресНавигатора ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl py-3.5 text-center text-sm font-bold text-white"
                style={{ background: GREEN }}
              >
                Открыть в навигаторе
              </a>
              {onТакси && (
                <button
                  onClick={onТакси}
                  className="rounded-2xl border py-3.5 text-sm font-bold"
                  style={{ color: GREEN, borderColor: GREEN }}
                >
                  Вызвать такси сюда
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
