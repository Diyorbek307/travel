"use client";

import { useEffect, useRef, useState } from "react";
import { СОСЕДИ, УЗБЕКИСТАН, ХОЛСТ, вОкне, вХолст, изХолста } from "@/data/borders";
import { ГОРОДА } from "@/data/geo";
import { GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import type { Geo } from "@/lib/types";

/**
 * Карта Узбекистана.
 *
 * Плоская, а не объёмная: наклонённая карта красива на витрине, но по
 * ней невозможно ни попасть пальцем в город, ни понять расстояние.
 * Здесь по карте работают — выбирают точку, смотрят маршрут.
 *
 * Контуры настоящие, из Natural Earth. Соседи показаны приглушённо:
 * Узбекистан не остров, и туристу полезно видеть, что рядом.
 *
 * Расстояние считается по прямой и так и подписано. Дороги здесь не
 * проложены: для этого нужен маршрутный сервис, а рисовать кривую «на
 * глаз» и называть её маршрутом — обман, по которому будут планировать
 * поездку.
 */

/** Радиус Земли для расстояния по большому кругу, километры. */
const РАДИУС_КМ = 6371;

export function расстояниеКм(a: Geo, b: Geo): number {
  const рад = (г: number) => (г * Math.PI) / 180;
  const dφ = рад(b.lat - a.lat);
  const dλ = рад(b.lon - a.lon);
  const φ1 = рад(a.lat);
  const φ2 = рад(b.lat);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return Math.round(2 * РАДИУС_КМ * Math.asin(Math.sqrt(h)));
}

export interface Метка {
  название: string;
  geo: Geo;
  /** Выделенная метка крупнее и подписана всегда. */
  главная?: boolean;
}

export default function UzMap({
  метки = [],
  выбрано,
  откуда,
  onВыбор,
  onТочка,
  путь = null,
  зона = null,
  высота = 300,
  подписи = true,
  подписьРасстояния = true,
}: {
  метки?: Метка[];
  /** Куда едем: подсвечивается и соединяется линией с началом. */
  выбрано?: Geo | null;
  /** Где человек сейчас. */
  откуда?: Geo | null;
  onВыбор?: (м: Метка) => void;
  /** Нажатие по свободному месту — своя точка на карте. */
  onТочка?: (g: Geo) => void;
  /**
   * Линия дороги от движка маршрутизации. Пока её нет, между точками
   * рисуется пунктирная прямая — и подписывается как прямая.
   */
  путь?: Geo[] | null;
  /**
   * Приблизить к месту. Без этого на карте всей страны один пиксель —
   * около двух километров: пальцем в нужный двор не попасть.
   */
  зона?: { центр: Geo; радиусКм: number } | null;
  высота?: number;
  подписи?: boolean;
  /** Строка с расстоянием под картой. Лишняя там, где её печатает сам экран. */
  подписьРасстояния?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  /*
   * Что показываем. Радиус в километрах переводим в пиксели холста через
   * его же масштаб — так зона одинаково честна на любой широте.
   */
  const вид = (() => {
    if (!зона) return { x: 0, y: 0, ш: ХОЛСТ.ширина, в: ХОЛСТ.высота };
    const ц = вХолст(зона.центр.lon, зона.центр.lat);
    const край = вХолст(зона.центр.lon, зона.центр.lat + зона.радиусКм / 111);
    const r = Math.max(0.3, Math.abs(ц.y - край.y));
    const пропорция = ХОЛСТ.высота / ХОЛСТ.ширина;
    return { x: ц.x - r / пропорция, y: ц.y - r, ш: (2 * r) / пропорция, в: 2 * r };
  })();
  const [наведено, setНаведено] = useState<string | null>(null);

  // Города платформы — всегда на карте, даже если меток не передали.
  const города = Object.entries(ГОРОДА)
    .filter(([, g]) => вОкне(g.lon, g.lat))
    .map(([название, geo]) => ({ название, geo }));

  const все: Метка[] = метки.length > 0 ? метки : города;

  /** Переводит нажатие по холсту обратно в долготу и широту. */
  function точкаИзСобытия(e: React.MouseEvent<SVGSVGElement>): Geo | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return изХолста(
      вид.x + ((e.clientX - r.left) / r.width) * вид.ш,
      вид.y + ((e.clientY - r.top) / r.height) * вид.в,
    );
  }

  /*
   * Единица экрана в единицах холста. Числа у кружков и подписей ниже —
   * это пиксели на телефоне шириной 375: считать их прямо в единицах
   * холста нельзя, иначе точка выходит в два пикселя и её не видно.
   */
  const масштаб = вид.ш / 375;

  /*
   * Раскладка подписей. Рядом стоящие места (в Самарканде между Регистаном
   * и Гур-Эмиром меньше километра) на карте дают кашу из наложенных строк.
   * Идём от главного к второстепенному и пропускаем подпись, которая легла
   * бы поверх уже поставленной. Точка при этом остаётся — теряется только
   * имя, и то у менее важного места.
   */
  const разложенные = (() => {
    const масштабПодписи = вид.ш / 375;
    const занято: { x1: number; y1: number; x2: number; y2: number }[] = [];

    const подготовленные = все.map((м) => {
      const т = вХолст(м.geo.lon, м.geo.lat);
      const выбран = Boolean(
        выбрано && Math.abs(выбрано.lat - м.geo.lat) < 0.0008 && Math.abs(выбрано.lon - м.geo.lon) < 0.0008,
      );
      return { м, т, выбран };
    });

    // Выбранное место подписываем в первую очередь, остальные — после.
    const порядок = [...подготовленные].sort((a, b) => Number(b.выбран) - Number(a.выбран));
    const решение = new Map<string, boolean>();

    for (const { м, т, выбран } of порядок) {
      if (!подписи && !выбран) {
        решение.set(м.название, false);
        continue;
      }
      const кегль = (выбран ? 12 : 10.5) * масштабПодписи;
      const пол = (м.название.length * кегль * 0.55) / 2;
      const рамка = {
        x1: т.x - пол,
        y1: т.y - 10 * масштабПодписи - кегль,
        x2: т.x + пол,
        y2: т.y - 10 * масштабПодписи + кегль * 0.3,
      };
      const мешает = занято.some(
        (з) => рамка.x1 < з.x2 && рамка.x2 > з.x1 && рамка.y1 < з.y2 && рамка.y2 > з.y1,
      );
      решение.set(м.название, !мешает);
      if (!мешает) занято.push(рамка);
    }

    return подготовленные.map((п) => ({ ...п, подпись: решение.get(п.м.название) ?? false }));
  })();

  const н = откуда ? вХолст(откуда.lon, откуда.lat) : null;
  const к = выбрано ? вХолст(выбрано.lon, выбрано.lat) : null;
  const км = откуда && выбрано ? расстояниеКм(откуда, выбрано) : null;

  /**
   * Как прижать подпись у края кадра. По центру она обрезается на
   * середине слова, а обрезанное название хуже отсутствующего.
   */
  const краем = (x: number): "start" | "middle" | "end" => {
    const поле = вид.ш * 0.18;
    if (x > вид.x + вид.ш - поле) return "end";
    if (x < вид.x + поле) return "start";
    return "middle";
  };

  /** Линия дороги в единицах холста. */
  const дорога =
    путь && путь.length >= 2
      ? путь
          .map((г, i) => {
            const т = вХолст(г.lon, г.lat);
            return `${i === 0 ? "M" : "L"}${т.x.toFixed(2)},${т.y.toFixed(2)}`;
          })
          .join("")
      : null;

  return (
    /*
     * Фон на обёртке, а не только на холсте: карта держит пропорции, и
     * поля сверху-снизу без этого выглядят белым обрывом.
     */
    <div className="relative" style={{ background: "#eef4f0" }}>
      <svg
        ref={svgRef}
        viewBox={`${вид.x} ${вид.y} ${вид.ш} ${вид.в}`}
        style={{ width: "100%", height: высота, display: "block" }}
        onClick={(e) => {
          if (!onТочка) return;
          const g = точкаИзСобытия(e);
          if (g) onТочка(g);
        }}
        role="img"
        aria-label="Карта Узбекистана"
      >
        <defs>
          <linearGradient id="uz-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fd0ae" />
            <stop offset="100%" stopColor="#5fae86" />
          </linearGradient>
          <filter id="uz-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(20,64,44,0.35)" />
          </filter>
        </defs>

        <rect x={вид.x} y={вид.y} width={вид.ш} height={вид.в} fill="#eef4f0" />

        {/* Соседи — приглушённо: Узбекистан не сам по себе. */}
        {СОСЕДИ.map((с) => (
          <path key={с.имя} d={с.путь} fill="#dfe6e1" stroke="#cfd9d2" strokeWidth={1.5 * масштаб} />
        ))}

        {подписи &&
          !зона &&
          СОСЕДИ.map((с) => {
            if (!с.подпись) return null;
            /*
             * Кыргызстан лежит у самого края окна, и его название
             * обрезалось на середине слова. Прижимаем такие подписи к краю
             * вместо центрирования.
             */
            const поле = 6;
            const уПравого = с.подпись.x > ХОЛСТ.ширина - 120;
            const уЛевого = с.подпись.x < 120;
            return (
              <text
                key={`п-${с.имя}`}
                x={уПравого ? ХОЛСТ.ширина - поле : уЛевого ? поле : с.подпись.x}
                y={с.подпись.y}
                textAnchor={уПравого ? "end" : уЛевого ? "start" : "middle"}
                fontSize={11 * масштаб}
                fill="#a8b5ac"
                style={{ letterSpacing: "0.08em", textTransform: "uppercase", pointerEvents: "none" }}
              >
                {с.имя}
              </text>
            );
          })}

        <path d={УЗБЕКИСТАН} fill="url(#uz-fill)" stroke="#2e7d5a" strokeWidth={2.5 * масштаб} filter="url(#uz-shadow)" />

        {/*
          Сетка. Вблизи страна — сплошная заливка без единого ориентира, и
          глазу не за что зацепиться: непонятно ни куда смотреть, ни какой
          тут масштаб. Клетка это чинит и ничего не выдумывает — это
          просто координатная сетка, а не улицы.
        */}
        {зона &&
          (() => {
            const шаг = вид.ш / 7;
            const линии: React.ReactElement[] = [];
            const с0 = Math.ceil(вид.x / шаг) * шаг;
            for (let x = с0; x < вид.x + вид.ш; x += шаг) {
              линии.push(
                <line key={`в${x}`} x1={x} y1={вид.y} x2={x} y2={вид.y + вид.в} stroke="#ffffff" strokeWidth={0.6 * масштаб} opacity={0.45} />,
              );
            }
            const р0 = Math.ceil(вид.y / шаг) * шаг;
            for (let y = р0; y < вид.y + вид.в; y += шаг) {
              линии.push(
                <line key={`г${y}`} x1={вид.x} y1={y} x2={вид.x + вид.ш} y2={y} stroke="#ffffff" strokeWidth={0.6 * масштаб} opacity={0.45} />,
              );
            }
            return <g style={{ pointerEvents: "none" }}>{линии}</g>;
          })()}

        {/*
          Дорога. Сплошная линия — это настоящий маршрут от движка
          маршрутизации. Пунктир — прямая между точками, когда движка нет.
          Разные линии специально: по сплошной можно считать время, по
          пунктиру нельзя, и человек должен видеть разницу, не читая
          подписи.
        */}
        {дорога && (
          <>
            <path
              d={дорога}
              fill="none"
              stroke="#ffffff"
              strokeWidth={7 * масштаб}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
            <path
              d={дорога}
              fill="none"
              stroke={GOLD}
              strokeWidth={4 * масштаб}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {!дорога && н && к && (
          <line
            x1={н.x}
            y1={н.y}
            x2={к.x}
            y2={к.y}
            stroke={GOLD}
            strokeWidth={3 * масштаб}
            strokeDasharray={`${10 * масштаб} ${7 * масштаб}`}
            strokeLinecap="round"
          />
        )}

        {н && к && (
          <circle cx={н.x} cy={н.y} r={7 * масштаб} fill={WHITE} stroke={GREEN} strokeWidth={3 * масштаб} />
        )}

        {/* Города */}
        {разложенные.map(({ м, т, выбран, подпись }) => {
          const активна = выбран || наведено === м.название;
          return (
            <g
              key={м.название}
              onClick={(e) => {
                e.stopPropagation();
                onВыбор?.(м);
              }}
              onMouseEnter={() => setНаведено(м.название)}
              onMouseLeave={() => setНаведено(null)}
              style={{ cursor: onВыбор ? "pointer" : "default" }}
            >
              {выбран && <circle cx={т.x} cy={т.y} r={13 * масштаб} fill={GOLD} opacity={0.3} />}
              <circle
                cx={т.x}
                cy={т.y}
                r={(активна ? 6.5 : 4.5) * масштаб}
                fill={выбран ? GOLD : WHITE}
                stroke={выбран ? "#8c681d" : GREEN}
                strokeWidth={2.5 * масштаб}
              />
              {(подпись || активна) && (
                <text
                  x={краем(т.x) === "end" ? вид.x + вид.ш - 4 * масштаб : краем(т.x) === "start" ? вид.x + 4 * масштаб : т.x}
                  y={т.y - 10 * масштаб}
                  textAnchor={краем(т.x)}
                  fontSize={(активна ? 12 : 10.5) * масштаб}
                  fontWeight={активна ? 700 : 500}
                  fill={активна ? TEXT : "#3f6b55"}
                  style={{ pointerEvents: "none" }}
                >
                  {м.название}
                </text>
              )}
            </g>
          );
        })}

        {/* Где человек. Пульсирующая точка, как принято на картах. */}
        {н && (
          <g style={{ pointerEvents: "none" }}>
            <circle cx={н.x} cy={н.y} fill="#2f6fd0" opacity={0}>
              <animate attributeName="r" values={`${7 * масштаб};${20 * масштаб}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={н.x} cy={н.y} r={7 * масштаб} fill="#2f6fd0" stroke={WHITE} strokeWidth={3 * масштаб} />
          </g>
        )}
      </svg>

      {км !== null && подписьРасстояния && (
        <p className="mt-2 px-1 text-xs" style={{ color: MUTED }}>
          По прямой {км.toLocaleString("ru")} км. Дорога будет длиннее — маршрут построит навигатор.
        </p>
      )}
    </div>
  );
}
