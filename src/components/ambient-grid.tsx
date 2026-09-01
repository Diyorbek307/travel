/**
 * Фоновая графика приложения.
 *
 * Вместо буквального самолёта с пунктиром — светящаяся сеть гириха,
 * традиционной исламской геометрии, из которой сложены изразцы Самарканда.
 * Мотив узнаваемо узбекский, а исполнение современное: тонкие линии,
 * пульсирующие узлы и медленно плывущие многоугольники. Так фон говорит
 * «Узбекистан» и «технологичный продукт» одновременно, не изображая
 * поездку в лоб.
 *
 * Всё построено на transform и opacity: браузер считает их на видеокарте
 * и не пересобирает раскладку, поэтому слой не отнимает кадры у карты и
 * трёхмерной сцены. Слой чисто декоративный и скрыт от чтения с экрана.
 */

/** Узлы сетки: точки пересечения линий, вокруг которых строится узор. */
const NODES: [number, number, number][] = [
  // x, y, задержка пульсации
  [12, 18, 0],
  [50, 10, 1.4],
  [86, 24, 2.6],
  [28, 46, 0.8],
  [68, 52, 2.0],
  [16, 76, 3.2],
  [54, 84, 1.1],
  [90, 70, 2.4],
];

/** Линии сетки — соединяют узлы в решётку, как в настоящем гирихе. */
const LINES: [number, number, number, number][] = [
  [12, 18, 50, 10],
  [50, 10, 86, 24],
  [12, 18, 28, 46],
  [50, 10, 68, 52],
  [86, 24, 68, 52],
  [28, 46, 68, 52],
  [28, 46, 16, 76],
  [68, 52, 54, 84],
  [16, 76, 54, 84],
  [54, 84, 90, 70],
  [68, 52, 90, 70],
];

/** Восьмиконечная звезда — тот же мотив, что в плашке без фотографии. */
const STAR =
  "M12,2 L14.2,8.8 L21.5,8.8 L15.9,13.1 L18.1,19.9 L12,15.7 L5.9,19.9 L8.1,13.1 L2.5,8.8 L9.8,8.8 Z";

/** Крупные фигуры, медленно плывущие в глубине. */
const SHAPES = [
  { cls: "uz-float-1", x: 20, y: 30, size: 46, delay: 0 },
  { cls: "uz-drift", x: 78, y: 20, size: 34, delay: 1.8 },
  { cls: "uz-float-3", x: 62, y: 72, size: 52, delay: 3.4 },
  { cls: "uz-float-2", x: 14, y: 64, size: 28, delay: 2.2 },
];

export default function AmbientGrid() {
  return (
    <svg
      className="ambient-grid"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/* Свечение узлов — мягкое, иначе точки читаются как пыль. */}
        <radialGradient id="node-glow">
          <stop offset="0%" stopColor="var(--primary-soft)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--primary-soft)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="line-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary-soft)" stopOpacity="0.5" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary-soft)" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Плывущие звёзды в глубине — самый дальний слой. */}
      <g className="ambient-grid-deep">
        {SHAPES.map((s, i) => (
          <g
            key={`shape-${i}`}
            className={s.cls}
            style={{ animationDelay: `${s.delay}s`, transformOrigin: `${s.x}% ${s.y}%` }}
          >
            <path
              d={STAR}
              fill="none"
              stroke={i % 2 === 0 ? "var(--primary-soft)" : "var(--accent)"}
              strokeWidth="0.35"
              transform={`translate(${s.x - s.size * 0.12},${s.y - s.size * 0.12}) scale(${s.size * 0.02})`}
            />
          </g>
        ))}
      </g>

      {/* Решётка гириха: линии прочерчивают себя по кругу. */}
      <g className="ambient-grid-lines">
        {LINES.map(([x1, y1, x2, y2], i) => (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#line-fade)"
            strokeWidth="0.18"
            className="grid-line"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </g>

      {/* Узлы: свечение плюс точка. */}
      {NODES.map(([x, y, delay], i) => (
        <g key={`node-${i}`}>
          <circle
            cx={x}
            cy={y}
            r="3.2"
            fill="url(#node-glow)"
            className="grid-node-glow"
            style={{ animationDelay: `${delay}s` }}
          />
          <circle cx={x} cy={y} r="0.5" fill="var(--primary-soft)" opacity="0.75" />
        </g>
      ))}
    </svg>
  );
}
