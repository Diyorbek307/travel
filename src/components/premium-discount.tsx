"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BORDER, GOLD, MUTED, ON_GOLD, SURFACE, TEXT } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import { useТурист } from "./tourist-provider";

/**
 * Скидка для Premium в карточке гостиницы или ресторана.
 *
 * Не Premium — видит, сколько сэкономит, и кнопку «Подключить». Premium —
 * кнопку «Показать скидку»: экран для кассира или ресепшена с именем,
 * сроком Premium и живыми часами. Часы идут каждую секунду, а по карточке
 * бежит блик — скриншот чужого экрана так не подделать.
 */
export function СкидкаPremium({ процент, заведение }: { процент?: number; заведение: string }) {
  const { t } = useT();
  const турист = useТурист();
  const [показ, setПоказ] = useState(false);
  if (!процент || процент <= 0) return null;

  return (
    <div
      className="mb-3 flex items-center gap-3 rounded-2xl border p-3"
      style={{
        background: "linear-gradient(135deg, rgba(233,196,106,0.18), transparent)",
        borderColor: GOLD,
      }}
    >
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-base font-extrabold"
        style={{ background: GOLD, color: ON_GOLD }}
      >
        −{процент}%
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold" style={{ color: TEXT }}>
          👑 {t("prem_disc_title")}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: MUTED }}>
          {t("prem_disc_sub")}
        </p>
      </div>
      <button
        onClick={() => (турист.isPremium ? setПоказ(true) : турист.открытьPremium())}
        className="flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold"
        style={{ background: GOLD, color: ON_GOLD }}
      >
        {турист.isPremium ? t("prem_disc_show") : t("prem_disc_get")}
      </button>
      {показ && (
        <ЭкранСкидки
          процент={процент}
          заведение={заведение}
          имя={турист.имя}
          до={турист.premiumUntil}
          onClose={() => setПоказ(false)}
        />
      )}
    </div>
  );
}

function ЭкранСкидки({
  процент,
  заведение,
  имя,
  до,
  onClose,
}: {
  процент: number;
  заведение: string;
  имя: string;
  до: string | null;
  onClose: () => void;
}) {
  const { t, lang } = useT();
  const [сейчас, setСейчас] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setСейчас(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Поверх всего, как просмотр фото: у экранов есть transform-анимации,
  // и fixed внутри них прилип бы к экрану, а не к окну.
  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-5"
      style={{ background: "rgba(5,12,11,0.92)" }}
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div
        className="discount-card relative w-full max-w-sm overflow-hidden rounded-3xl p-6 text-center"
        style={{ background: "linear-gradient(145deg, #f5d98a, #e9c46a 45%, #c99a2e)", color: ON_GOLD }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-70">HelloUZ Premium</p>
        <p className="mt-3 text-6xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          −{процент}%
        </p>
        <p className="mt-2 text-base font-bold">{заведение}</p>
        <div className="mx-auto my-4 h-px w-2/3" style={{ background: "rgba(28,22,6,0.25)" }} />
        <p className="text-sm font-semibold">{имя}</p>
        {до && (
          <p className="text-xs opacity-75">
            {t("prem_disc_until")} {new Date(до).toLocaleDateString(lang)}
          </p>
        )}
        {/* Живые часы — главное отличие настоящего экрана от скриншота. */}
        <p className="mt-4 font-mono text-3xl font-bold tabular-nums">
          {сейчас.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
        <p className="text-[10px] opacity-70">{сейчас.toLocaleDateString(lang)}</p>
        <p className="mt-4 text-[11px] leading-snug opacity-80">{t("prem_disc_hint")}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold"
          style={{ background: "rgba(28,22,6,0.85)", color: "#f5d98a" }}
        >
          {t("common_close")}
        </button>
      </div>
    </div>,
    document.body,
  );
}

/** Значок на шапке и в списках: «👑 −15%». */
export function ЗначокСкидки({ процент }: { процент?: number }) {
  if (!процент || процент <= 0) return null;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{
        background: GOLD,
        color: ON_GOLD,
        border: `1px solid ${BORDER}`,
        boxShadow: `0 0 0 1px ${SURFACE}`,
      }}
    >
      👑 −{процент}%
    </span>
  );
}
