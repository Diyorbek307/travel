"use client";

import { useState } from "react";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Экран подписки.
 *
 * Кнопки «Оплатить» здесь нет намеренно: платёжная система не подключена,
 * а кнопка оплаты, которая не принимает оплату, — обман. Вместо неё сбор
 * контактов: будет кому написать, когда подписка заработает. Когда
 * появятся ключи Payme или Click, форма заменяется на оплату, а список
 * собранных контактов станет первой рассылкой.
 */
export default function ProScreen({ lang }: { lang: Lang }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const contact = String(new FormData(e.currentTarget).get("contact") ?? "");
    setStatus("sending");
    try {
      const res = await fetch("/api/pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, lang }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const perks = [
    { icon: "shield" as const, key: "ads" },
    { icon: "heart" as const, key: "support" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <section
        className="relative mb-5 overflow-hidden p-6 text-white"
        style={{
          background: "linear-gradient(140deg, #2d7b57 0%, #246144 55%, #1d4e37 100%)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <div className="ornament" aria-hidden />
        <span
          className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "var(--accent)", color: "#2b2b2b" }}
        >
          <Icon name="sparkle" size={14} filled />
          {t(lang, "pro_title")}
        </span>
        <p className="relative mt-3 text-sm leading-relaxed opacity-95">
          {t(lang, "pro_lead")}
        </p>
      </section>

      <ul className="mb-5 grid gap-2">
        {perks.map((p) => (
          <li key={p.key} className="flex items-start gap-3 p-4 card">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
              style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
            >
              <Icon name={p.icon} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{t(lang, `pro_perk_${p.key}`)}</span>
              <span className="mt-0.5 block text-sm leading-relaxed soft">
                {t(lang, `pro_perk_${p.key}_d`)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <section className="p-4 card">
        <h2 className="font-semibold">{t(lang, "pro_soon")}</h2>
        <p className="mt-1 text-sm leading-relaxed soft">{t(lang, "pro_soon_d")}</p>

        {status === "sent" ? (
          <p
            className="mt-3 flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--primary-text)" }}
          >
            <Icon name="shield" size={18} filled />
            {t(lang, "pro_thanks")}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
            <input
              name="contact"
              required
              minLength={5}
              placeholder={t(lang, "pro_contact")}
              className="min-w-0 flex-1 rounded-[var(--radius-full)] px-4 py-3 text-sm outline-none"
              style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="pressable min-h-12 shrink-0 rounded-[var(--radius-full)] px-5 text-sm font-medium disabled:opacity-70"
              style={{ background: "var(--primary)", color: "var(--on-primary)" }}
            >
              {t(lang, "pro_notify")}
            </button>
            {status === "error" && (
              <p className="w-full text-sm" style={{ color: "var(--danger)" }}>
                {t(lang, "reserve_error")}
              </p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
