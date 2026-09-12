import { GOLD, GREEN, GREEN_LIGHT } from "@/lib/theme";

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
  // Знак UzRoam: булавка-путь с узбекской стрельчатой аркой (пиштак)
  // внутри и звездой-искрой — путешествие, наследие, открытие.
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M20 3C27.5 3 34 9.2 34 17.5C34 25.5 27 31.5 20 37.5C13 31.5 6 25.5 6 17.5C6 9.2 12.5 3 20 3Z"
        fill={GREEN}
      />
      <path
        d="M14.5 27.5V18.5C14.5 13.5 16.7 10.2 20 7.5C23.3 10.2 25.5 13.5 25.5 18.5V27.5Z"
        fill={GREEN_LIGHT}
      />
      <path
        d="M29 4C29.9 7.3 31.2 8.6 34.5 9.5C31.2 10.4 29.9 11.7 29 15C28.1 11.7 26.8 10.4 23.5 9.5C26.8 8.6 28.1 7.3 29 4Z"
        fill={GOLD}
      />
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
