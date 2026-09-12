import { CREAM, GOLD, GREEN, GREEN_DARK } from "@/lib/theme";

/** Мелкие элементы, которые встречаются на каждом втором экране. */

export function Badge({ text, color = GREEN }: { text: string; color?: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
      // Хвост «18» — это альфа в hex: та же краска, что у текста, но
      // разбавленная до фона.
      style={{ background: `${color}18`, color }}
    >
      {text}
    </span>
  );
}

export function StarRow({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-0.5 text-xs font-semibold"
      style={{ color: GOLD }}
    >
      ★ {rating}
    </span>
  );
}

export function LogoMark({ size = 30 }: { size?: number }) {
  // Знак UzRoam: купол-михраб с окном-звездой и вьющейся дорогой-рекой —
  // путешествие, наследие, открытие. Кладём на тёмно-зелёную плитку,
  // чтобы значок читался и на фото, и на зелёных шапках.
  const cut = GREEN_DARK; // цвет звезды и дороги — совпадает с плиткой
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <rect width="100" height="100" rx="22" fill={GREEN_DARK} />
      <g transform="translate(50 51) scale(0.74) translate(-50 -50)">
        <path
          d="M50 6C56 15 68 18 74.5 26C81 34 82 42 82 50C82 65 70 80 50 92C30 80 18 65 18 50C18 42 19 34 25.5 26C32 18 44 15 50 6Z"
          fill={CREAM}
        />
        <path
          d="M50 26C51.2 33 54 35.8 61 38C54 40.2 51.2 43 50 50C48.8 43 46 40.2 39 38C46 35.8 48.8 33 50 26Z"
          fill={cut}
        />
        <path
          d="M59 57C60 69 45 70 37 82C43 86 52 84 57 79"
          fill="none"
          stroke={cut}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Восьмиконечная звезда в круге — орнамент для шапок. */
export function GeomPattern({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ opacity }} aria-hidden>
      <polygon
        points="90,10 108,50 150,50 117,75 130,115 90,90 50,115 63,75 30,50 72,50"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="90" cy="90" r="60" stroke="white" strokeWidth="1" fill="none" />
      <circle cx="90" cy="90" r="40" stroke="white" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

export function EmptyRoute({ icon }: { icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-5xl opacity-30">{icon}</div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Ничего не найдено
      </p>
    </div>
  );
}
