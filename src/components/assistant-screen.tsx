"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "./icon";
import PoiCard from "./poi-card";
import { t } from "@/lib/i18n";
import type { AssistantReply } from "@/lib/assistant";
import type { City, Lang } from "@/lib/types";

/**
 * Экран помощника.
 *
 * Помощник намеренно не языковая модель. Он разбирает фразу и отвечает
 * данными из нашей базы: время работы, цена, расстояние, готовый маршрут.
 * Поэтому он не умеет поболтать — зато физически не может выдумать памятник,
 * назвать неверную цену или отправить туриста в закрытый музей. Для
 * путеводителя это важнее свободной речи.
 *
 * Переписка держится в состоянии страницы и не сохраняется: истории вопросов
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
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

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

  async function send(question: string) {
    const asked = question.trim();
    if (!asked || busy) return;

    setTurns((prev) => [...prev, { role: "user", text: asked }]);
    setText("");
    setBusy(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: asked, lang, ...(position ?? {}) }),
      });
      const reply = (await response.json()) as AssistantReply;
      setTurns((prev) => [...prev, { role: "bot", text: reply.message, reply }]);
    } catch {
      setTurns((prev) => [
        ...prev,
        { role: "bot", text: t(lang, "assistant_offline") },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-8.5rem)] max-w-3xl flex-col px-4 pb-4">
      {turns.length === 0 ? (
        <section
          className="rise-in relative mt-3 overflow-hidden rounded-[var(--radius-lg)] px-5 py-6"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-tint) 0%, var(--surface-alt) 55%, #f4ead2 100%)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="aurora" aria-hidden />
          <div className="ornament" aria-hidden />

          <div className="relative">
            <span
              className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)]"
              style={{ background: "var(--primary)", color: "var(--on-primary)" }}
            >
              <Icon name="sparkle" size={26} />
            </span>
            <h2 className="mt-3 text-lg font-semibold">{t(lang, "assistant_title")}</h2>
            <p className="mt-1 max-w-md text-sm soft">{t(lang, "assistant_lead")}</p>

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

            <p className="mt-4 text-xs faint">{t(lang, "assistant_honest")}</p>
          </div>
        </section>
      ) : (
        <ol className="mt-3 flex-1 space-y-3">
          {turns.map((turn, i) => (
            <li key={i} className="rise-in">
              {turn.role === "user" ? (
                <p
                  className="ml-auto w-fit max-w-[85%] rounded-[var(--radius-md)] px-3.5 py-2 text-sm"
                  style={{ background: "var(--primary)", color: "var(--on-primary)" }}
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
                            cities.find((c) => c.slug === turn.reply!.parsed!.city)?.name,
                          turn.reply.parsed.minutes &&
                            `${turn.reply.parsed.minutes} ${t(lang, "minutes")}`,
                          ...turn.reply.parsed.themes,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>

                  {turn.reply?.route?.stops && turn.reply.route.stops.length > 0 && (
                    <Link
                      href="/planner"
                      className="pressable mt-2 flex items-center gap-2 p-3 text-sm card"
                    >
                      <Icon name="explore" size={18} />
                      <span className="flex-1">{t(lang, "assistant_open_planner")}</span>
                      <Icon name="chevron-right" size={16} />
                    </Link>
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
      )}

      {/* Распорка: поле ввода прижимается к низу экрана, а не висит
          посреди пустоты, пока разговор не начался. */}
      <div className="flex-1" aria-hidden />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="sticky bottom-0 mt-3 flex gap-2 pb-1"
        style={{ background: "var(--bg)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t(lang, "assistant_placeholder")}
          maxLength={500}
          className="min-w-0 flex-1 rounded-full px-4 py-3 text-sm outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
    </main>
  );
}
