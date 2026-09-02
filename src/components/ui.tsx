import { GOLD, GREEN } from "@/lib/theme";

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
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18" stroke={GREEN} strokeWidth="2" />
      <path
        d="M20 6l3.8 8.2 8.8.8-6.4 6.2 1.9 8.8L20 25.5l-8.1 4.5 1.9-8.8-6.4-6.2 8.8-.8z"
        fill={GREEN}
        fillOpacity="0.18"
        stroke={GREEN}
        strokeWidth="1.4"
      />
      <circle cx="20" cy="20" r="4" fill={GREEN} />
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
