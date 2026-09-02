"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppState } from "./app-state";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Чат с поддержкой.
 *
 * Ветка склеивается по номеру паспорта из localStorage — аккаунтов в
 * приложении нет. Новые сообщения дотягиваются опросом раз в несколько
 * секунд: постоянное соединение здесь избыточно, разговор с оператором
 * не требует мгновенности, а опрос переживает сон вкладки и обрыв связи.
 *
 * Трансляция геопозиции включается только кнопкой и только на выбранный
 * срок. Постоянного слежения нет: браузер не отдаёт координаты закрытой
 * вкладке, а бессрочная передача местоположения без ведома человека —
 * не безопасность, а слежка. Турист видит таймер и может выключить в
 * любой момент, и тогда координаты стираются немедленно.
 */

interface Message {
  id: number;
  author: "user" | "staff";
  text: string;
  lat: number | null;
  lon: number | null;
  created_at: string;
}

/** Насколько можно включить трансляцию. */
const SHARE_OPTIONS = [60, 8 * 60];

export default function SupportChat({ lang }: { lang: Lang }) {
  const { ready, travellerId, name } = useAppState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sharingUntil, setSharingUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lastId = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);

  const pull = useCallback(async () => {
    if (!travellerId) return;
    try {
      const res = await fetch(
        `/api/support/chat?id=${encodeURIComponent(travellerId)}&after=${lastId.current}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[] };
      if (data.messages?.length) {
        lastId.current = data.messages[data.messages.length - 1].id;
        setMessages((prev) => [...prev, ...data.messages]);
      }
    } catch {
      // Нет сети — просто ждём следующего опроса.
    }
  }, [travellerId]);

  useEffect(() => {
    if (!ready || !travellerId) return;
    void pull();
    const timer = setInterval(pull, 5000);
    return () => clearInterval(timer);
  }, [ready, travellerId, pull]);

  // Тикаем раз в секунду только пока идёт трансляция — ради таймера.
  useEffect(() => {
    if (sharingUntil === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sharingUntil]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // Пока трансляция активна, шлём координаты каждые полминуты.
  useEffect(() => {
    if (!travellerId || sharingUntil === null) return;
    if (sharingUntil <= Date.now()) {
      setSharingUntil(null);
      return;
    }
    const send = () => {
      navigator.geolocation?.getCurrentPosition(
        (p) => {
          const minutes = Math.max(1, Math.round((sharingUntil - Date.now()) / 60_000));
          void fetch("/api/support/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              travellerId,
              lat: p.coords.latitude,
              lon: p.coords.longitude,
              minutes,
            }),
          });
        },
        () => setSharingUntil(null),
        { maximumAge: 15_000, timeout: 10_000 },
      );
    };
    send();
    const timer = setInterval(send, 30_000);
    return () => clearInterval(timer);
  }, [travellerId, sharingUntil]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !travellerId) return;
    setSending(true);
    setText("");
    try {
      await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travellerId, name, lang, text: value }),
      });
      await pull();
    } catch {
      setText(value);
    } finally {
      setSending(false);
    }
  }

  /** Отправляет точку отдельным сообщением — как «поделиться» в мессенджере. */
  function sendPoint() {
    if (!travellerId || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (p) => {
      await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travellerId,
          name,
          lang,
          text: t(lang, "chat_my_location"),
          lat: p.coords.latitude,
          lon: p.coords.longitude,
        }),
      });
      await pull();
    });
  }

  function startShare(minutes: number) {
    setSharingUntil(Date.now() + minutes * 60_000);
  }

  async function stopShare() {
    setSharingUntil(null);
    if (!travellerId) return;
    await fetch("/api/support/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ travellerId, stop: true }),
    });
  }

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-[var(--radius-md)] bg-soft" />;
  }

  const left = sharingUntil ? Math.max(0, sharingUntil - now) : 0;
  const leftLabel = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}`;

  return (
    <section className="flex flex-col overflow-hidden card" style={{ minHeight: 420 }}>
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ background: "var(--primary)", color: "var(--on-primary)" }}
        >
          <Icon name="shield" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{t(lang, "chat_title")}</span>
          <span className="block truncate text-xs faint">{t(lang, "chat_hours")}</span>
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm soft">{t(lang, "chat_empty")}</p>
        )}

        {messages.map((m) => {
          const mine = m.author === "user";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm"
                style={
                  mine
                    ? { background: "var(--primary)", color: "var(--on-primary)" }
                    : { background: "var(--surface-alt)", border: "1px solid var(--border)" }
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                {m.lat != null && m.lon != null && (
                  <a
                    href={`https://www.google.com/maps?q=${m.lat},${m.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs underline"
                  >
                    <Icon name="map" size={13} />
                    {m.lat.toFixed(4)}, {m.lon.toFixed(4)}
                  </a>
                )}
                <p className="mt-1 text-[10px] opacity-60">
                  {String(m.created_at).slice(11, 16)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {/* Трансляция геопозиции: включает сам турист, видит таймер. */}
      <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
        {sharingUntil ? (
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="pulse-ring inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: "var(--danger)" }}
            />
            <span className="min-w-0 flex-1 text-xs">
              {t(lang, "chat_sharing")} · {leftLabel}
            </span>
            <button
              onClick={stopShare}
              className="pressable shrink-0 rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium"
              style={{ background: "var(--danger)", color: "#ffffff" }}
            >
              {t(lang, "chat_stop_sharing")}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs faint">{t(lang, "chat_share_location")}</span>
            {SHARE_OPTIONS.map((min) => (
              <button
                key={min}
                onClick={() => startShare(min)}
                className="pressable rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium"
                style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
              >
                {min < 60 ? `${min} ${t(lang, "minutes")}` : `${min / 60} ${t(lang, "hours_short")}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t p-3"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={sendPoint}
          aria-label={t(lang, "chat_my_location")}
          className="pressable grid h-10 w-10 shrink-0 place-items-center rounded-full"
          style={{ background: "var(--surface-alt)", color: "var(--primary-text)" }}
        >
          <Icon name="map" size={18} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t(lang, "chat_placeholder")}
          className="min-w-0 flex-1 rounded-[var(--radius-full)] px-4 py-2.5 text-sm outline-none"
          style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label={t(lang, "assistant_send")}
          className="pressable grid h-10 w-10 shrink-0 place-items-center rounded-full disabled:opacity-50"
          style={{ background: "var(--primary)", color: "var(--on-primary)" }}
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </form>
    </section>
  );
}
