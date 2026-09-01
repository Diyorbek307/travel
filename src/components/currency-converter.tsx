"use client";

import { useState } from "react";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { Rate } from "@/lib/rates";
import type { Lang } from "@/lib/types";

/**
 * Конвертер валют на курсах Центробанка.
 *
 * Дата курса подписана намеренно: курс меняется каждый день, и турист
 * должен видеть, на какое число посчитано, — иначе цифра выглядит вечной.
 * Пересчёт идёт в обе стороны, потому что в поездке нужны обе: прикинуть
 * цену в своей валюте и понять, сколько сумов снять в банкомате.
 */
export default function CurrencyConverter({
  rates,
  lang,
}: {
  rates: Rate[];
  lang: Lang;
}) {
  const [code, setCode] = useState<string>(rates[0]?.code ?? "USD");
  const [amount, setAmount] = useState("100");
  const [toSum, setToSum] = useState(true);

  const rate = rates.find((r) => r.code === code) ?? rates[0];
  if (!rate) return null;

  const value = Number(amount.replace(",", ".")) || 0;
  const result = toSum ? value * rate.perUnit : value / rate.perUnit;

  const format = (n: number) =>
    n.toLocaleString(lang === "en" ? "en-GB" : "ru-RU", {
      maximumFractionDigits: toSum ? 0 : 2,
    });

  return (
    <section className="p-4 card">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)]"
          style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
        >
          <Icon name="ticket" size={18} />
        </span>
        <span className="min-w-0 flex-1 font-medium">{t(lang, "currency_title")}</span>
        <button
          onClick={() => setToSum((v) => !v)}
          className="pressable shrink-0 rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium"
          style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
        >
          {toSum ? `${code} → UZS` : `UZS → ${code}`}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          aria-label={t(lang, "currency_amount")}
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
        />
        {rates.length > 1 && (
          <span className="flex shrink-0 gap-1">
            {rates.map((r) => (
              <button
                key={r.code}
                onClick={() => setCode(r.code)}
                aria-pressed={r.code === code}
                className="pressable rounded-[var(--radius-full)] px-2.5 py-2 text-xs font-medium"
                style={{
                  background: r.code === code ? "var(--primary)" : "var(--surface-alt)",
                  color: r.code === code ? "var(--on-primary)" : "var(--text-soft)",
                  border: `1px solid ${r.code === code ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {r.code}
              </button>
            ))}
          </span>
        )}
      </div>

      <p className="mt-3 text-xl font-semibold">
        {format(result)} {toSum ? t(lang, "currency_sum") : code}
      </p>

      {/* Дата и источник обязательны: без них цифра выглядит вечной. */}
      <p className="mt-1 text-xs faint">
        {t(lang, "currency_source")}
        {rate.date ? ` · ${rate.date}` : ""}
      </p>
    </section>
  );
}
