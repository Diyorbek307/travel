"use client";

import { ACCENT_FILL, BORDER, MUTED, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { открытьВход } from "@/lib/guest";

/**
 * «Нужен аккаунт» — не тупик, а кнопка: гость видит, зачем входить, и
 * сразу попадает на вход. Регистрация — ссылкой рядом.
 */
export function ПросьбаВойти({ текст, компактно = false }: { текст: TKey; компактно?: boolean }) {
  const { t } = useT();
  return (
    <div
      className={`rounded-2xl border ${компактно ? "p-3" : "p-4 text-center"}`}
      style={{ borderColor: BORDER, background: SURFACE }}
      role="status"
    >
      <p className="text-xs leading-snug" style={{ color: компактно ? TEXT : MUTED }}>
        {t(текст)}
      </p>
      <div className={`mt-2.5 flex gap-2 ${компактно ? "" : "justify-center"}`}>
        <button
          onClick={() => открытьВход("login")}
          className="rounded-xl px-4 py-2 text-xs font-bold transition-transform active:scale-95"
          style={{ background: ACCENT_FILL, color: WHITE }}
        >
          {t("guest_login")}
        </button>
        <button
          onClick={() => открытьВход("register")}
          className="rounded-xl border px-4 py-2 text-xs font-bold transition-transform active:scale-95"
          style={{ borderColor: BORDER, color: TEXT }}
        >
          {t("guest_register")}
        </button>
      </div>
    </div>
  );
}
