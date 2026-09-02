"use client";

import { useEffect, useState } from "react";
import { BORDER, TEXT } from "@/lib/theme";

/**
 * Верхняя полоска телефона из макета: часы, вырез, сеть и батарея.
 *
 * Над заставкой она прозрачная и белая, поверх приложения — на белом
 * фоне с разделителем.
 */
export default function StatusBar({ transparent }: { transparent: boolean }) {
  const [time, setTime] = useState<string | null>(null);

  // Часы ставим только после монтирования: на сервере время своё, и
  // разметка не сошлась бы с клиентской.
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  const ink = transparent ? "white" : TEXT;

  return (
    <div
      className="mock-status absolute left-0 right-0 top-0 z-30 h-10 items-center justify-between px-7 pt-1"
      style={{
        background: transparent ? "transparent" : "white",
        borderBottom: transparent ? "none" : `1px solid ${BORDER}`,
      }}
    >
      <span className="text-xs font-semibold" style={{ color: ink }}>
        {time ?? ""}
      </span>

      <div
        className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-2xl"
        style={{ background: transparent ? "rgba(0,0,0,0.35)" : "white" }}
      />

      <div className="flex items-center gap-1.5">
        <svg width="13" height="9" viewBox="0 0 16 12" fill={ink} aria-hidden>
          <rect x="0" y="6" width="3" height="6" rx="0.5" />
          <rect x="4.5" y="4" width="3" height="8" rx="0.5" />
          <rect x="9" y="2" width="3" height="10" rx="0.5" />
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" />
        </svg>
        <div className="relative h-2.5 w-5 rounded-sm border" style={{ borderColor: ink }}>
          <div className="absolute inset-0.5 rounded-sm" style={{ background: ink, right: "15%" }} />
        </div>
      </div>
    </div>
  );
}
