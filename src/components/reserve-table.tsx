"use client";

import { useState } from "react";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Заявка на столик (п. «Фаза 2» плана рестораны/бронирование).
 *
 * Это заявка, не подтверждённая бронь: у заведений нет системы
 * бронирования, с которой можно было бы интегрироваться, поэтому
 * форма честно обещает лишь то, что администратор перезвонит.
 */
export default function ReserveTable({
  slug,
  lang,
}: {
  slug: string;
  lang: Lang;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch(`/api/venues/${slug}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          name: form.get("name"),
          phone: form.get("phone"),
          partySize: Number(form.get("party_size")),
          requestedAt: form.get("requested_at"),
          note: form.get("note"),
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <section className="mb-4 p-4 card">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span style={{ color: "var(--primary-text)" }}>
            <Icon name="booking" size={18} />
          </span>
          {t(lang, "reserve_sent")}
        </p>
      </section>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
  };
  const inputClass =
    "w-full rounded-[var(--radius-sm)] px-3 py-2.5 text-sm outline-none";

  return (
    <section className="mb-4 p-4 card">
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: "var(--primary-text)" }}>
          <Icon name="booking" size={20} />
        </span>
        <span className="font-medium">{t(lang, "reserve_table")}</span>
      </div>

      <form onSubmit={submit} className="grid gap-2.5">
        <input
          name="name"
          required
          placeholder={t(lang, "reserve_name")}
          className={inputClass}
          style={inputStyle}
        />
        <input
          name="phone"
          type="tel"
          required
          placeholder={t(lang, "reserve_phone")}
          className={inputClass}
          style={inputStyle}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <input
            name="party_size"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={2}
            aria-label={t(lang, "reserve_party_size")}
            className={inputClass}
            style={inputStyle}
          />
          <input
            name="requested_at"
            type="datetime-local"
            required
            aria-label={t(lang, "reserve_time")}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <textarea
          name="note"
          rows={2}
          placeholder={t(lang, "reserve_note")}
          className={inputClass}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="pressable mt-1 flex min-h-12 items-center justify-center rounded-[var(--radius-full)] px-4 font-medium disabled:opacity-70"
          style={{ background: "var(--primary)", color: "var(--on-primary)" }}
        >
          {t(lang, "reserve_submit")}
        </button>

        {status === "error" && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {t(lang, "reserve_error")}
          </p>
        )}
      </form>
    </section>
  );
}
