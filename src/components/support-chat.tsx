"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACCENT_FILL, ACCENT_SOFT, BORDER, GOLD, GREEN, MUTED, TEXT, WHITE, SURFACE, ON_GOLD } from "@/lib/theme";
import { useT } from "@/components/lang-provider";

/**
 * Переписка с поддержкой.
 *
 * Первым отвечает ИИ-помощник с именем — «Равшан · HelloUZ», — и он
 * всегда помечен как ИИ. Живой оператор подключается по кнопке «Позвать
 * оператора» или когда помощник сам передаёт ему вопрос; его ответы
 * подписаны настоящим именем и пометкой «Оператор».
 *
 * Новые ответы дотягиваются опросом. Постоянное соединение здесь
 * избыточно, а опрос переживает сон вкладки и обрыв связи без всякой
 * логики переподключения.
 */

interface Message {
  id: string;
  author: "user" | "staff" | "ai";
  text: string;
  createdAt: string;
  name?: string;
}

interface Ответ {
  messages: Message[];
  typing: boolean;
  mode: "ai" | "human";
  needsHuman: boolean;
  ai: boolean;
  agent: string;
}

const ОПРОС_МС = 3000;

function Аватар({ имя, ии }: { имя: string; ии: boolean }) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
      style={{ background: ии ? ACCENT_SOFT : GOLD, color: ии ? GREEN : ON_GOLD }}
      aria-hidden
    >
      {имя.charAt(0)}
    </span>
  );
}

function Метка({ текст }: { текст: string }) {
  return (
    <span
      className="rounded-full px-1.5 py-px text-[9px] font-bold tracking-wide uppercase"
      style={{ background: ACCENT_SOFT, color: GREEN }}
    >
      {текст}
    </span>
  );
}

export default function SupportChat({ onBack }: { onBack: () => void }) {
  const { t, lang } = useT();
  const [данные, setДанные] = useState<Ответ | null>(null);
  const [ошибка, setОшибка] = useState(false);
  const [text, setText] = useState("");
  const [загрузка, setЗагрузка] = useState(true);
  const [отправка, setОтправка] = useState(false);
  const низ = useRef<HTMLDivElement>(null);

  const подтянуть = useCallback(async () => {
    try {
      const res = await fetch(`/api/support?lang=${lang}`);
      if (!res.ok) return;
      setДанные((await res.json()) as Ответ);
    } catch {
      // Нет сети — ждём следующего опроса, показывать ошибку незачем.
    }
  }, [lang]);

  useEffect(() => {
    подтянуть().finally(() => setЗагрузка(false));
    const t = setInterval(подтянуть, ОПРОС_МС);
    return () => clearInterval(t);
  }, [подтянуть]);

  const messages = данные?.messages ?? [];
  const ведётИИ = Boolean(данные?.ai) && данные?.mode !== "human";
  const агент = данные?.agent ?? "";

  useEffect(() => {
    низ.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, данные?.typing]);

  async function послать(тело: Record<string, unknown>, вернуть?: string) {
    setОтправка(true);
    setОшибка(false);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...тело, lang }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await подтянуть();
    } catch {
      // Сеть или отказ сервера: возвращаем текст в поле, чтобы человек
      // не набирал заново, и честно говорим, что не ушло.
      if (вернуть) setText(вернуть);
      setОшибка(true);
    } finally {
      setОтправка(false);
    }
  }

  function отправить(e: React.FormEvent) {
    e.preventDefault();
    const значение = text.trim();
    if (!значение) return;
    setText("");
    void послать({ text: значение }, значение);
  }

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--cream)" }}>
      <header
        className="flex shrink-0 items-center gap-3 px-4 py-3"
        style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}
      >
        <button onClick={onBack} className="text-sm" style={{ color: MUTED }}>
          ← {t("common_back")}
        </button>
        {ведётИИ && агент && <Аватар имя={агент} ии />}
        <div className="min-w-0 flex-1">
          <p
            className="flex items-center gap-1.5 truncate text-sm font-bold"
            style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
          >
            {ведётИИ && агент ? `${агент} · HelloUZ` : t("prof_support")}
            {ведётИИ && <Метка текст={t("sup_ai_badge")} />}
          </p>
          <p className="truncate text-[11px]" style={{ color: MUTED }}>
            {ведётИИ ? t("sup_ai_sub") : t("sup_hours")}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {загрузка && (
          <p className="py-10 text-center text-sm" style={{ color: MUTED }}>
            {t("sup_loading")}
          </p>
        )}

        {!загрузка && ведётИИ && (
          <p
            className="mx-auto mb-2 max-w-sm rounded-2xl px-3 py-2 text-center text-[11px] leading-relaxed"
            style={{ background: SURFACE, color: MUTED, border: `1px solid ${BORDER}` }}
          >
            🤖 {t("sup_ai_note")}
          </p>
        )}

        {!загрузка && messages.length === 0 && (
          <p className="py-8 text-center text-sm leading-relaxed" style={{ color: MUTED }}>
            {t("sup_empty1")}
            <br />
            {t("sup_empty2")}
          </p>
        )}

        {messages.map((m, i) => {
          const свой = m.author === "user";
          // Подпись над ответом — когда сменился отвечающий.
          const пред = messages[i - 1];
          const подпись = !свой && (!пред || пред.author !== m.author || пред.name !== m.name);
          return (
            <div key={m.id} className={`flex flex-col ${свой ? "items-end" : "items-start"}`}>
              {подпись && (
                <p className="mb-0.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold" style={{ color: MUTED }}>
                  {m.name ? `${m.name} · HelloUZ` : "HelloUZ"}
                  <Метка текст={m.author === "ai" ? t("sup_ai_badge") : t("sup_staff_badge")} />
                </p>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm"
                style={
                  свой
                    ? { background: ACCENT_FILL, color: WHITE }
                    : { background: SURFACE, color: TEXT, border: `1px solid ${BORDER}` }
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(m.createdAt).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}

        {данные?.typing && ведётИИ && (
          <div className="flex items-center gap-2" aria-live="polite">
            <div
              className="flex items-center gap-1 rounded-2xl px-3.5 py-3"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              aria-hidden
            >
              {[0, 1, 2].map((к) => (
                <span
                  key={к}
                  className="h-1.5 w-1.5 animate-bounce rounded-full"
                  style={{ background: MUTED, animationDelay: `${к * 150}ms` }}
                />
              ))}
            </div>
            <span className="text-[11px]" style={{ color: MUTED }}>
              {t("sup_typing").replace("{n}", агент)}
            </span>
          </div>
        )}

        {данные?.mode === "human" && messages.length > 0 && (
          <p
            className="mx-auto max-w-sm rounded-2xl px-3 py-2 text-center text-[11px] leading-relaxed"
            style={{ background: ACCENT_SOFT, color: GREEN }}
          >
            👤 {t("sup_human_mode")}
          </p>
        )}
        <div ref={низ} />
      </div>

      {ошибка && (
        <p className="shrink-0 px-4 pb-1 text-xs" style={{ color: "#c1603a", background: "var(--cream)" }}>
          {t("sup_error")}
        </p>
      )}
      {ведётИИ && messages.length > 0 && (
        <div className="shrink-0 px-3 pb-2" style={{ background: "var(--cream)" }}>
          <button
            onClick={() => void послать({ handoff: true, text: t("sup_call_human_msg") })}
            disabled={отправка}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: GREEN, color: GREEN, background: SURFACE }}
          >
            👤 {t("sup_call_human")}
          </button>
        </div>
      )}
      <form
        onSubmit={отправить}
        className="flex shrink-0 items-center gap-2 p-3"
        style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("sup_ph")}
          maxLength={2000}
          className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
          style={{ background: "var(--cream)", border: `1px solid ${BORDER}`, color: TEXT }}
        />
        <button
          type="submit"
          disabled={отправка || !text.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full disabled:opacity-50"
          style={{ background: GOLD, color: ON_GOLD }}
          aria-label={t("a11y_send")}
        >
          <svg
            className="rtl-flip"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
