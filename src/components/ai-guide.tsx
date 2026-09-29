"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { ACCENT_FILL, BORDER, MUTED, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { AI_REPLIES } from "@/data/content";
import { useCurrency } from "@/components/currency-provider";
import { useT } from "@/components/lang-provider";

/**
 * Чат с AI-гидом.
 *
 * Раньше жил вкладкой в профиле, но профиль — это про самого человека:
 * паспорт, брони, настройки. Вопрос «что рядом?» или «где поесть?»
 * задают, когда ищут, поэтому гид переехал в «Исследовать», к городам и
 * ресторанам. Логика не менялась: быстрые кнопки отвечают заготовкой,
 * свободный вопрос уходит в /api/guide.
 */
export default function AiGuide() {
  const { t, трК, lang } = useT();
  const { rates } = useCurrency();
  const курсUZS = rates["UZS"];
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "ai",
      text: трК(
        "Assalomu alaykum! 👋 Я ваш AI-гид. Спрашивайте всё — история, маршруты, рестораны, транспорт, валюта!",
      ),
      time: new Date().toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Быстрые вопросы хранятся по-русски: это ключ, по которому ищется ответ
  // в AI_REPLIES. На экране показываем перевод (трК), а по клику отправляем
  // русский ключ — так один и тот же ответ находится на любом языке.
  const QUICK = [
    "Что рядом?",
    "История Регистана",
    "Лучшие рестораны?",
    "Что бесплатно?",
    "Как добраться до Бухары?",
    "Где переночевать?",
    "Курс валюты?",
    "Транспорт в Самарканде?",
  ];
  const sendMsg = useCallback(
    async (вопрос: string) => {
      const сейчас = () => new Date().toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
      // Известный вопрос трК переведёт; свободный текст на любом языке вернётся
      // как есть — и в пузыре пользователь видит именно то, что спросил.
      const моё: ChatMessage = { role: "user", text: трК(вопрос), time: сейчас() };
      setMessages((p) => [...p, моё]);
      setInput("");
      setTyping(true);
      const ответить = (текст: string) => {
        setMessages((p) => [...p, { role: "ai", text: текст, time: сейчас() }]);
        setTyping(false);
      };

      // Курс в заготовленном ответе вписан навсегда и уже устарел.
      // Подставляем живой из того же источника, что и конвертер.
      if (вопрос === "Курс валюты?" && курсUZS) {
        ответить(
          `💱 ${t("cur_title")}:\n\n$1 ≈ ${курсUZS.toLocaleString(lang, {
            maximumFractionDigits: 0,
          })} UZS\n\n${t("cur_live_hint")}`,
        );
        return;
      }
      // Быстрые кнопки отвечают заготовкой: мгновенно и без запроса к модели.
      const рус = AI_REPLIES[вопрос];
      if (рус) {
        ответить(трК(рус));
        return;
      }

      // Свободный вопрос — настоящему гиду. Если он не подключён или
      // недоступен, честно говорим, что умеем, а не делаем вид.
      try {
        const res = await fetch("/api/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, моё].map(({ role, text }) => ({ role, text })) }),
        });
        const data = res.ok ? ((await res.json()) as { text?: string }) : null;
        ответить(data?.text || t("ai_unknown"));
      } catch {
        ответить(t("ai_unknown"));
      }
    },
    [трК, lang, t, курсUZS, messages],
  );
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
      <div className="flex-1 overflow-y-auto hide-scroll px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-white text-[10px] font-bold"
                style={{ background: ACCENT_FILL }}
              >
                AI
              </div>
            )}
            <div
              className="max-w-[78%] rounded-2xl px-4 py-3 shadow-sm"
              style={
                m.role === "user"
                  ? { background: ACCENT_FILL, color: WHITE, borderTopRightRadius: 4 }
                  : {
                      background: SURFACE,
                      color: TEXT,
                      border: `1px solid ${BORDER}`,
                      borderTopLeftRadius: 4,
                    }
              }
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
              <p
                className="text-[10px] mt-1.5"
                style={{ color: m.role === "user" ? "rgba(255,255,255,0.5)" : MUTED }}
              >
                {m.time}
              </p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 text-white text-[10px] font-bold"
              style={{ background: ACCENT_FILL }}
            >
              AI
            </div>
            <div
              className="bg-white rounded-2xl rounded-tl px-4 py-3 shadow-sm border"
              style={{ borderColor: BORDER, borderTopLeftRadius: 4 }}
            >
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-2 h-2 rounded-full bounce-dot"
                    style={{ background: ACCENT_FILL, animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto hide-scroll">
          {QUICK.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMsg(q)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium bg-white border"
              style={{ color: TEXT, borderColor: BORDER }}
            >
              {трК(q)}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-5 pt-2">
        <div
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border"
          style={{ borderColor: BORDER }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && sendMsg(input.trim())}
            placeholder={трК("Спросите что угодно…")}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: TEXT }}
          />
          <button
            onClick={() => input.trim() && sendMsg(input.trim())}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: ACCENT_FILL }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
