import type { CSSProperties } from "react";

/**
 * Парящая узбекская геометрия за шапками экранов.
 *
 * Раньше это был один SVG, внутри которого качались двадцать фигур и
 * рисовались линии «шёлкового пути». Анимация внутри SVG не уходит на
 * видеокарту: браузер перерисовывал весь рисунок каждый кадр, и при
 * возврате на главную это давало больше секунды перерисовки на слабом
 * телефоне. Теперь каждая фигура — свой HTML-слой, а движутся они только
 * transform и opacity — это делает видеокарта, без перерисовки.
 * Линии пути нарисованы неподвижно и лишь проявляются и гаснут.
 */

const STAR =
  "M12,2 L14.2,8.8 L21.5,8.8 L15.9,13.1 L18.1,19.9 L12,15.7 L5.9,19.9 L8.1,13.1 L2.5,8.8 L9.8,8.8 Z";

const ЗВЁЗДЫ = [
  { cls: "uz-float-1", x: 18, y: 22, size: 28, opacity: 0.18, delay: 0 },
  { cls: "uz-float-2", x: 72, y: 8, size: 20, opacity: 0.13, delay: 1.2 },
  { cls: "uz-float-3", x: 55, y: 55, size: 36, opacity: 0.1, delay: 2.4 },
  { cls: "uz-drift", x: 88, y: 38, size: 22, opacity: 0.14, delay: 0.8 },
  { cls: "uz-float-1", x: 8, y: 70, size: 16, opacity: 0.1, delay: 3.1 },
  { cls: "uz-float-2", x: 40, y: 82, size: 24, opacity: 0.12, delay: 1.7 },
  { cls: "uz-float-3", x: 82, y: 75, size: 18, opacity: 0.09, delay: 4.2 },
  { cls: "uz-drift", x: 28, y: 42, size: 12, opacity: 0.08, delay: 2.0 },
];

const РОМБЫ = [
  [15, 35],
  [62, 18],
  [45, 68],
  [90, 55],
  [32, 85],
];

const ИСКРЫ = [
  [20, 50],
  [35, 30],
  [58, 42],
  [75, 25],
  [90, 48],
];

/** Слой в точке (x%, y%) размером в пикселях, центр — в точке. */
const слой = (x: number, y: number, размер: number, задержка: number): CSSProperties => ({
  position: "absolute",
  left: `${x}%`,
  top: `${y}%`,
  width: размер,
  height: размер,
  marginLeft: -размер / 2,
  marginTop: -размер / 2,
  animationDelay: `${задержка}s`,
  willChange: "transform, opacity",
});

export function AnimatedBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[
        { d: "M 0,60 Q 15,45 30,50 Q 50,55 65,42 Q 80,30 100,38", цвет: "rgba(233,196,106,0.25)", ш: 0.4, з: 0 },
        { d: "M 0,72 Q 20,58 45,65 Q 70,72 100,55", цвет: "rgba(7,120,111,0.2)", ш: 0.3, з: 2 },
      ].map((л) => (
        <svg
          key={л.d}
          className="silk-road-path absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ animationDelay: `${л.з}s`, willChange: "opacity" }}
        >
          <path d={л.d} fill="none" stroke={л.цвет} strokeWidth={л.ш} />
        </svg>
      ))}

      {ЗВЁЗДЫ.map((з, i) => (
        <div key={"star" + i} className={з.cls} style={слой(з.x, з.y, з.size, з.delay)}>
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <path d={STAR} fill={i % 2 === 0 ? "rgb(233,196,106)" : "rgb(255,255,255)"} opacity={з.opacity} />
          </svg>
        </div>
      ))}

      {/* Ромбы: поворот на 45° уже заложен в кадрах uz-float-2. */}
      {РОМБЫ.map(([x, y], i) => (
        <div
          key={"d" + i}
          className="uz-float-2"
          style={{ ...слой(x, y, 10, i * 1.3), background: "rgba(233,196,106,0.15)" }}
        />
      ))}

      {ИСКРЫ.map(([x, y], i) => (
        <div
          key={"c" + i}
          className="star-twinkle rounded-full"
          style={{ ...слой(x, y, 2.5, i * 0.6), background: "rgba(255,255,255,0.25)" }}
        />
      ))}
    </div>
  );
}
