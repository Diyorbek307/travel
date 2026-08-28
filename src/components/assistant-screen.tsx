"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "./icon";
import PoiCard from "./poi-card";
import { t } from "@/lib/i18n";
import {
  createRecognizer,
  speechSupported,
  type Recognizer,
} from "@/lib/speech";
import type { AssistantReply } from "@/lib/assistant";
import type { City, Lang } from "@/lib/types";

/**
 * Экран помощника.
 *
 * Вопрос понимает языковая модель, но факты она берёт только из нашей базы
 * через инструменты (см. lib/ai.ts): цену, часы работы и маршрут выдумать
 * нельзя. Без ключа или связи отвечает разбор по правилам — суше, зато
 * всегда и бесплатно.
 *
 * Текст приходит потоком и дописывается на месте: ответ модели идёт
 * несколько секунд, и молчащий экран читается как зависший.
 *
 * Переписка живёт в состоянии страницы и не сохраняется: истории вопросов
 * мы не ведём, и обещать её в интерфейсе нельзя.
 */

interface Turn {
  role: "user" | "bot";
  text: string;
  reply?: AssistantReply;
}

/** Примеры показывают, на что помощник вообще способен. */
const SAMPLES: Partial<Record<Lang, string[]>> = {
  ru: [
    "Маршрут на 4 часа по Самарканду",
    "Что посмотреть бесплатно в Бухаре",
    "Где поесть плов рядом",
    "Расскажи про Регистан",
    "Куда сходить вечером в Ташкенте",
  ],
  uz: [
    "Samarqand bo'ylab 4 soatlik marshrut",
    "Buxoroda bepul nima ko'rish mumkin",
    "Yaqin atrofda palov qayerda",
    "Registon haqida gapirib bering",
    "Toshkentda kechqurun qayerga borish mumkin",
  ],
  en: [
    "A 4-hour route around Samarkand",
    "What is free to see in Bukhara",
    "Where to eat plov nearby",
    "Tell me about the Registan",
    "Where to go in Tashkent in the evening",
  ],
};

export default function AssistantScreen({
  cities,
  lang,
}: {
  cities: City[];
  lang: Lang;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const bottom = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const recognizer = useRef<Recognizer | null>(null);

  // Координаты нужны только для «что рядом»; спрашиваем один раз и тихо
  // обходимся без них, если пользователь отказал.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPosition({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  // Кнопку микрофона показываем только там, где распознавание есть:
  // в Firefox его нет, и мёртвая кнопка хуже её отсутствия.
  useEffect(() => setVoiceReady(speechSupported()), []);

  function toggleVoice() {
    if (listening) {
      recognizer.current?.stop();
      return;
    }
    const created = createRecognizer(
      lang,
      (heard, final) => {
        setText(heard);
        // Договорил — сразу отправляем: лишнее нажатие на ходу неудобно.
        if (final && heard) void send(heard);
      },
      () => setListening(false),
    );
    if (!created) return;
    recognizer.current = created;
    setListening(true);
    created.start();
  }

  async function send(question: string) {
    const asked = question.trim();
    if (!asked || busy) return;

    setTurns((prev) => [...prev, { role: "user", text: asked }]);
    setText("");
    setBusy(true);

    // Историю шлём на сервер: без неё «а сколько это стоит?» после рассказа
    // о Регистане не к чему привязать.
    const history = turns
      .filter((turn) => turn.text)
      .map((turn) => ({
        role: turn.role === "user" ? ("user" as const) : ("assistant" as const),
        content: turn.text,
      }));

    // Пустую реплику помощника ставим сразу и наполняем по мере ответа:
    // иначе экран молчит несколько секунд и выглядит зависшим.
    const slot = turns.length + 1;
    setTurns((prev) => [...prev, { role: "bot", text: "" }]);

    try {
      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: asked,
          lang,
          history,
          ...(position ?? {}),
        }),
      });

      if (response.status === 429) {
        setTurns((prev) =>
          prev.map((turn, i) =>
            i === slot
              ? { ...turn, text: t(lang, "assistant_rate_limited") }
              : turn,
          ),
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("нет потока");

      const decoder = new TextDecoder();
      let buffer = "";
      let collected = "";

      // Ответ приходит построчным JSON: одна строка — одно событие.
      // Хвост без перевода строки держим в буфере до следующего куска.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          if (!raw.trim()) continue;
          const parsed = JSON.parse(raw) as { event: string; data: unknown };

          if (parsed.event === "delta") {
            collected += parsed.data as string;
            setTurns((prev) =>
              prev.map((turn, i) =>
                i === slot ? { ...turn, text: collected } : turn,
              ),
            );
          }

          if (parsed.event === "done") {
            const payload = parsed.data as { pois: AssistantReply["pois"] };
            setTurns((prev) =>
              prev.map((turn, i) =>
                i === slot
                  ? {
                      ...turn,
                      text: collected,
                      reply: {
                        intent: "ai",
                        message: collected,
                        pois: payload.pois,
                      },
                    }
                  : turn,
              ),
            );
          }
        }
      }
    } catch {
      setTurns((prev) =>
        prev.map((turn, i) =>
          i === slot ? { ...turn, text: t(lang, "assistant_offline") } : turn,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  /*
   * Поле ввода определяется один раз и вставляется в двух разных местах:
   * центром экрана, пока разговора нет, и прижатым к низу, когда он идёт.
   * Раньше это был один и тот же `<form>` с `sticky bottom-0`, а пустое
   * место над ним держал безусловный `<div className="flex-1" />` — он
   * стоял и в пустом состоянии, и рядом со списком реплик, который сам
   * уже `flex-1`. Два растущих элемента в одной колонке делят место
   * пополам, поэтому даже в разговоре под последним сообщением оставался
   * зазор. Теперь распорки нет вовсе — на пустом экране карточка и поле
   * ввода центрируются одним блоком, в разговоре форму подпирает список.
   */
  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send(text);
      }}
      className="flex gap-2"
    >
      {voiceReady && (
        <button
          type="button"
          onClick={toggleVoice}
          aria-label={t(
            lang,
            listening ? "assistant_voice_stop" : "assistant_voice",
          )}
          aria-pressed={listening}
          className="pressable grid h-12 w-12 shrink-0 place-items-center rounded-full"
          style={{
            background: listening ? "var(--danger)" : "var(--surface)",
            color: listening ? "#ffffff" : "var(--primary-text)",
            border: `1px solid ${listening ? "var(--danger)" : "var(--border)"}`,
          }}
        >
          <Icon name="headphones" size={20} />
        </button>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t(lang, "assistant_placeholder")}
        maxLength={500}
        className="min-w-0 flex-1 rounded-full px-4 py-3 text-sm outline-none"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      />
      <button
        type="submit"
        disabled={busy || !text.trim()}
        aria-label={t(lang, "assistant_send")}
        className="pressable grid h-12 w-12 shrink-0 place-items-center rounded-full disabled:opacity-45"
        style={{ background: "var(--primary)", color: "var(--on-primary)" }}
      >
        <Icon name="chevron-right" size={22} />
      </button>
    </form>
  );

  return (
    <main
      className={`mx-auto flex min-h-[calc(100dvh-8.5rem)] max-w-3xl flex-col px-4 pb-4 ${
        turns.length === 0 ? "justify-center" : ""
      }`}
    >
      {turns.length === 0 ? (
        <div className="rise-in">
          <section
            className="relative overflow-hidden rounded-[var(--radius-lg)] px-5 py-6"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-tint) 0%, var(--surface-alt) 55%, #dfeaf2 100%)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="aurora" aria-hidden />
            <div className="ornament" aria-hidden />

            <div className="relative">
              <span
                className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)]"
                style={{
                  background: "var(--primary)",
                  color: "var(--on-primary)",
                }}
              >
                <Icon name="sparkle" size={26} />
              </span>
              <h2 className="mt-3 text-lg font-semibold">
                {t(lang, "assistant_title")}
              </h2>
              <p className="mt-1 max-w-md text-sm soft">
                {t(lang, "assistant_lead")}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {(SAMPLES[lang] ?? SAMPLES.en!).map((sample, i) => (
                  <li key={sample}>
                    <button
                      type="button"
                      onClick={() => send(sample)}
                      className="rise-in pressable rounded-full px-3 py-1.5 text-left text-xs"
                      style={{
                        animationDelay: `${100 + i * 70}ms`,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-soft)",
                      }}
                    >
                      {sample}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs faint">
                {t(lang, "assistant_honest")}
              </p>
            </div>
          </section>

          <div className="mt-4">{composer}</div>
        </div>
      ) : (
        <>
          <ol className="mt-3 flex-1 space-y-3">
            {turns.map((turn, i) => (
              <li key={i} className="rise-in">
                {turn.role === "user" ? (
                  <p
                    className="ml-auto w-fit max-w-[85%] rounded-[var(--radius-md)] px-3.5 py-2 text-sm"
                    style={{
                      background: "var(--primary)",
                      color: "var(--on-primary)",
                    }}
                  >
                    {turn.text}
                  </p>
                ) : (
                  <div className="max-w-[92%]">
                    <div className="card p-3.5">
                      <p className="whitespace-pre-line text-sm">{turn.text}</p>

                      {turn.reply?.parsed && (
                        <p className="mt-2 text-xs faint">
                          {t(lang, "assistant_parsed")}:{" "}
                          {[
                            turn.reply.parsed.city &&
                              cities.find(
                                (c) => c.slug === turn.reply!.parsed!.city,
                              )?.name,
                            turn.reply.parsed.minutes &&
                              `${turn.reply.parsed.minutes} ${t(lang, "minutes")}`,
                            ...turn.reply.parsed.themes,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    {turn.reply?.route?.stops &&
                      turn.reply.route.stops.length > 0 && (
                        <Link
                          href="/planner"
                          className="pressable mt-2 flex items-center gap-2 p-3 text-sm card"
                        >
                          <Icon name="explore" size={18} />
                          <span className="flex-1">
                            {t(lang, "assistant_open_planner")}
                          </span>
                          <Icon name="chevron-right" size={16} />
                        </Link>
                      )}

                    {/* Помощник должен уметь действовать, а не только советовать:
                      город берётся из первого названного места. */}
                    {turn.reply?.pois[0]?.city_slug && (
                      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
                        {[
                          {
                            href: `/planner?city=${turn.reply.pois[0].city_slug}`,
                            icon: "sparkle" as const,
                            label: t(lang, "assistant_act_route"),
                          },
                          {
                            href: `/map?city=${turn.reply.pois[0].city_slug}`,
                            icon: "map" as const,
                            label: t(lang, "assistant_act_map"),
                          },
                          {
                            href: `/city/${turn.reply.pois[0].city_slug}`,
                            icon: "download" as const,
                            label: t(lang, "assistant_act_offline"),
                          },
                        ].map((action) => (
                          <Link
                            key={action.href}
                            href={action.href}
                            className="pressable flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs card"
                            style={{ color: "var(--primary-text)" }}
                          >
                            <Icon name={action.icon} size={15} />
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {turn.reply && turn.reply.pois.length > 0 && (
                      <ul className="mt-2 grid gap-2">
                        {turn.reply.pois.slice(0, 6).map((poi) => (
                          <li key={poi.id} className="min-w-0">
                            <PoiCard poi={poi} lang={lang} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}

            {busy && (
              <li className="w-fit rounded-[var(--radius-md)] px-3.5 py-2 text-sm soft card">
                …
              </li>
            )}
            <div ref={bottom} />
          </ol>

          <div
            className="sticky bottom-0 mt-3 pb-1"
            style={{ background: "var(--bg)" }}
          >
            {composer}
          </div>
        </>
      )}
    </main>
  );
}
