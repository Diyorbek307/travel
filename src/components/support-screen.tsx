"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./icon";
import SupportChat from "./support-chat";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Техподдержка.
 *
 * Обращение уходит в базу и разбирается в админ-панели — не почтой:
 * письмо теряется в папке, а список в панели видно всем, кто дежурит.
 * Контакт необязателен: человек может просто сообщить об ошибке, и
 * требовать за это телефон незачем.
 *
 * Экстренные службы вынесены отдельной ссылкой наверх. Их номера живут
 * на своём экране и работают без интернета — дублировать их здесь
 * нельзя, два списка телефонов однажды разойдутся.
 */

const TOPICS = ["support_topic_data", "support_topic_bug", "support_topic_partner", "support_topic_other"];

export default function SupportScreen({ lang }: { lang: Lang }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          topic: t(lang, topic),
          message: form.get("message"),
          contact: form.get("contact"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      {/* Экстренное — первым: если человек в беде, он не должен читать
          форму обратной связи. */}
      <Link
        href="/sos"
        className="pressable mb-4 flex items-center gap-3 p-4 card hover:shadow-[var(--shadow-2)]"
        style={{ borderLeft: "4px solid var(--danger)" }}
      >
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-sm)]"
          style={{ background: "var(--danger)", color: "#ffffff" }}
        >
          <Icon name="sos" size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{t(lang, "sos")}</span>
          <span className="block text-sm soft">{t(lang, "support_sos_lead")}</span>
        </span>
        <Icon name="chevron-right" size={18} />
      </Link>

      {/* Чат — основной способ связи: ответ приходит сюда же, а не на
          почту, которую турист может не проверить в поездке. */}
      <div className="mb-4">
        <SupportChat lang={lang} />
      </div>

      <h2 className="mb-2 font-semibold">{t(lang, "support_form_title")}</h2>

      {status === "sent" ? (
        <section className="p-5 card">
          <p className="flex items-center gap-2 font-medium">
            <span style={{ color: "var(--primary-text)" }}>
              <Icon name="shield" size={20} filled />
            </span>
            {t(lang, "support_sent")}
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="pressable mt-3 rounded-[var(--radius-full)] px-4 py-2 text-sm font-medium"
            style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
          >
            {t(lang, "support_new")}
          </button>
        </section>
      ) : (
        <form onSubmit={submit} className="p-4 card">
          <p className="mb-3 text-sm soft">{t(lang, "support_lead")}</p>

          <p className="mb-2 text-sm font-medium">{t(lang, "support_topic")}</p>
          <ul className="mb-4 flex flex-wrap gap-2">
            {TOPICS.map((key) => {
              const active = topic === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setTopic(key)}
                    aria-pressed={active}
                    className="pressable rounded-[var(--radius-full)] px-3.5 py-2 text-sm"
                    style={{
                      background: active ? "var(--primary)" : "var(--surface-alt)",
                      color: active ? "var(--on-primary)" : "var(--text)",
                      border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                    }}
                  >
                    {t(lang, key)}
                  </button>
                </li>
              );
            })}
          </ul>

          <textarea
            name="message"
            required
            minLength={5}
            maxLength={2000}
            rows={5}
            placeholder={t(lang, "support_message")}
            className="mb-2 w-full rounded-[var(--radius-sm)] px-3 py-2.5 text-sm outline-none"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
          />

          <input
            name="contact"
            placeholder={t(lang, "support_contact")}
            className="mb-1 w-full rounded-[var(--radius-sm)] px-3 py-2.5 text-sm outline-none"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
          />
          <p className="mb-3 text-xs faint">{t(lang, "support_contact_hint")}</p>

          <button
            type="submit"
            disabled={status === "sending"}
            className="pressable flex min-h-12 w-full items-center justify-center rounded-[var(--radius-full)] px-4 font-medium disabled:opacity-70"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {t(lang, "support_send")}
          </button>

          {status === "error" && (
            <p className="mt-2 text-sm" style={{ color: "var(--danger)" }}>
              {t(lang, "reserve_error")}
            </p>
          )}
        </form>
      )}
    </main>
  );
}
