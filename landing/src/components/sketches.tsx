/**
 * Карандашные наброски памятников — как в путевом блокноте. Линии
 * «рисуются» при загрузке (класс .sketch в globals.css), подписи — от руки.
 * Рисунки упрощённые, но узнаваемые по силуэту.
 */

const штрих = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Минарет Калян, Бухара: высокий конический ствол с фонарём наверху. */
export function Минарет({ className, delay = 0.4 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 80 200" className={`sketch ${className ?? ""}`} style={{ ["--delay" as string]: `${delay}s` }}>
      <g {...штрих}>
        <path d="M28 190 L33 70 L47 70 L52 190 Z" />
        <path d="M31 150 H49 M32 120 H48 M33 95 H47" />
        <path d="M26 70 H54 L52 62 H28 Z" />
        <path d="M30 62 V46 H50 V62" />
        <path d="M33 46 V40 M40 46 V40 M47 46 V40" />
        <path d="M28 40 H52 L48 32 H32 Z" />
        <path d="M36 32 Q40 22 44 32" />
        <path d="M40 22 V16" />
        <path d="M18 190 H62" />
        <path d="M35 175 Q40 168 45 175 V190 H35 Z" />
      </g>
    </svg>
  );
}

/** Гур-Эмир, Самарканд: ребристый купол на барабане и два портала. */
export function Купол({ className, delay = 0.9 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 200 150" className={`sketch ${className ?? ""}`} style={{ ["--delay" as string]: `${delay}s` }}>
      <g {...штрих}>
        <path d="M58 70 Q100 -2 142 70" />
        <path d="M70 70 Q100 8 130 70 M84 70 Q100 12 116 70 M100 70 V14" />
        <path d="M100 14 V6 M97 8 H103" />
        <path d="M54 70 H146 V96 H54 Z" />
        <path d="M62 78 H138 M62 88 H138" />
        <path d="M34 96 H166 V140 H34 Z" />
        <path d="M84 140 V112 Q100 96 116 112 V140" />
        <path d="M44 140 V116 Q52 106 60 116 V140 M140 140 V116 Q148 106 156 116 V140" />
        <path d="M20 140 H180" />
      </g>
    </svg>
  );
}

/** Портал медресе (пештак) Регистана со стрельчатой аркой. */
export function Портал({ className, delay = 1.3 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 160 150" className={`sketch ${className ?? ""}`} style={{ ["--delay" as string]: `${delay}s` }}>
      <g {...штрих}>
        <path d="M40 140 V30 H120 V140" />
        <path d="M58 140 V80 Q80 42 102 80 V140" />
        <path d="M46 36 H114 M46 44 H114" />
        <path d="M22 140 V54 H30 V140 M130 140 V54 H138 V140" />
        <path d="M20 54 Q26 38 32 54 M128 54 Q134 38 140 54" />
        <path d="M66 108 H94 M66 118 H94" />
        <path d="M10 140 H150" />
      </g>
    </svg>
  );
}

/** Летящие птицы — три галочки. */
export function Птицы({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" className={`sketch ${className ?? ""}`} style={{ ["--delay" as string]: "1.8s" }}>
      <g {...штрих}>
        <path d="M2 10 Q7 4 12 10 Q17 4 22 10" />
        <path d="M30 6 Q34 2 38 6 Q42 2 46 6" />
        <path d="M44 18 Q47 14 50 18 Q53 14 56 18" />
      </g>
    </svg>
  );
}

/** Гранат — символ достатка, узнаваем на базарах. */
export function Гранат({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 70" className={`sketch ${className ?? ""}`} style={{ ["--delay" as string]: "2s" }}>
      <g {...штрих}>
        <path d="M35 64 C14 64 8 46 12 34 C16 22 28 18 35 20 C42 18 54 22 58 34 C62 46 56 64 35 64 Z" />
        <path d="M29 20 L31 10 L35 16 L39 10 L41 20" />
        <path d="M24 40 Q35 30 46 40" />
      </g>
    </svg>
  );
}
