"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BORDER, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";

/**
 * Переписка с поддержкой.
 *
 * Новые ответы дотягиваются опросом раз в несколько секунд. Постоянное
 * соединение здесь избыточно: разговор с оператором не требует
 * мгновенности, а опрос переживает сон вкладки и обрыв связи без всякой
 * логики переподключения.
 */

interface Message {
  id: string;
  author: "user" | "staff";
  text: string;
  createdAt: string;
}

const ОПРОС_МС = 5000;

export default function SupportChat({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [загрузка, setЗагрузка] = useState(true);
  const [отправка, setОтправка] = useState(false);
  const низ = useRef<HTMLDivElement>(null);

  const подтянуть = useCallback(async () => {
    try {
      const res = await fetch("/api/support");
      if (!res.ok) return;
      const d = (await res.json()) as { messages: Message[] };
      setMessages(d.messages);
    } catch {
      // Нет сети — ждём следующего опроса, показывать ошибку незачем.
    }
  }, []);

  useEffect(() => {
    подтянуть().finally(() => setЗагрузка(false));
    const t = setInterval(подтянуть, ОПРОС_МС);
    return () => clearInterval(t);
  }, [подтянуть]);

  useEffect(() => {
    низ.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    const значение = text.trim();
    if (!значение) return;

    setОтправка(true);
    setText("");
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: значение }),
      });
      await подтянуть();
    } catch {
      // Вернём текст в поле, чтобы человек не набирал заново.
      setText(значение);
    } finally {
      setОтправка(false);
    }
  }

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--cream)" }}>
      <header
        className="flex shrink-0 items-center gap-3 px-4 py-3"
        style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}
      >
        <button onClick={onBack} className="text-sm" style={{ color: MUTED }}>
          ← Назад
        </button>
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
            Поддержка
          </p>
          <p className="text-[11px]" style={{ color: MUTED }}>
            Отвечаем в рабочие часы
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {загрузка && (
          <p className="py-10 text-center text-sm" style={{ color: MUTED }}>
            Загружаем переписку…
          </p>
        )}

        {!загрузка && messages.length === 0 && (
          <p className="py-10 text-center text-sm leading-relaxed" style={{ color: MUTED }}>
            Напишите нам — ответим здесь же.
            <br />
            Вопросы о маршрутах, бронях, оплате.
          </p>
        )}

        {messages.map((m) => {
          const свой = m.author === "user";
          return (
            <div key={m.id} className={`flex ${свой ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm"
                style={
                  свой
                    ? { background: GREEN, color: WHITE }
                    : { background: WHITE, color: TEXT, border: `1px solid ${BORDER}` }
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className="mt-1 text-[10px] opacity-60">{m.createdAt.slice(11, 16)}</p>
              </div>
            </div>
          );
        })}
        <div ref={низ} />
      </div>

      <form
        onSubmit={отправить}
        className="flex shrink-0 items-center gap-2 p-3"
        style={{ background: WHITE, borderTop: `1px solid ${BORDER}` }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение"
          maxLength={2000}
          className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
          style={{ background: "var(--cream)", border: `1px solid ${BORDER}`, color: TEXT }}
        />
        <button
          type="submit"
          disabled={отправка || !text.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full disabled:opacity-50"
          style={{ background: GOLD, color: TEXT }}
          aria-label="Отправить"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
