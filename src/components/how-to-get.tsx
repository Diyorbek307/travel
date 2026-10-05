"use client";

import { ACCENT_SOFT, BORDER, GREEN, SURFACE, TEXT } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";

/** Как добираться: пешком, на машине или на такси. */
export type СпособПути = "пешком" | "авто" | "такси";

const СПОСОБЫ: { способ: СпособПути; знак: string; подпись: TKey }[] = [
  { способ: "пешком", знак: "🚶", подпись: "route_mode_walk" },
  { способ: "авто", знак: "🚗", подпись: "route_mode_car" },
  { способ: "такси", знак: "🚕", подпись: "tr_taxi" },
];

/**
 * «Как добраться» в карточке места, гостиницы или ресторана — три кнопки
 * вместо одной «Маршрут»: человек сразу выбирает, как поедет, и попадает
 * на экран маршрута уже в этом режиме (а такси — в Яндекс Go).
 */
export default function КакДобраться({ onВыбор }: { onВыбор: (способ: СпособПути) => void }) {
  const { t } = useT();
  return (
    <div className="mb-3">
      <p className="mb-2 text-sm font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
        📍 {t("d_how_get")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {СПОСОБЫ.map((с) => (
          <button
            key={с.способ}
            onClick={() => onВыбор(с.способ)}
            className="flex flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-bold transition-all active:scale-[0.97]"
            style={{
              borderColor: BORDER,
              background: с.способ === "такси" ? ACCENT_SOFT : SURFACE,
              color: GREEN,
            }}
          >
            <span className="text-xl" aria-hidden>
              {с.знак}
            </span>
            {t(с.подпись)}
          </button>
        ))}
      </div>
    </div>
  );
}
