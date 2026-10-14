"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/lang-provider";
import { useGeo } from "@/components/geo-provider";
import { useДистанция } from "@/lib/distance";
import { расстояниеТочноКм, точка } from "@/data/geo";
import { замолчать, рассказать, языкГолоса } from "@/lib/speech";
import { BORDER, GREEN, MUTED, TEXT, ACCENT_SOFT, ACCENT_FILL, WHITE } from "@/lib/theme";
import type { Geo, Place, StorySection } from "@/lib/types";
import type { TKey } from "@/lib/i18n";

/**
 * ИИ-гид внутри карточки места.
 *
 * Он знает, где человек: по геолокации считает расстояние до места и,
 * если турист уже стоит у него, так и говорит — «Вы здесь». Ближе
 * трёх километров добавляет, сколько идти пешком.
 *
 * Кнопки («История», «Что посмотреть», «Легенды»…) отвечают из подробного
 * рассказа о месте — сразу и без сети. Свободный вопрос уходит настоящему
 * гиду (/api/guide) вместе с местом и расстоянием до него. Пока ключ ИИ не
 * подключён, гид честно говорит об этом и отвечает тем, что нашёл в
 * рассказе, — без выдумок.
 */

/** Ближе этого — человек уже у места. */
const ЗДЕСЬ_КМ = 0.15;
/** Пешеход проходит ~4,5 км в час. */
const ПЕШКОМ_КМ_В_ЧАС = 4.5;

type Реплика = { от: "гид" | "я"; текст: string };

const КНОПКИ: { ключ: TKey; раздел?: StorySection["kind"]; вид?: "где" | "часы" }[] = [
  { ключ: "pg_q_where", вид: "где" },
  { ключ: "pg_q_history", раздел: "history" },
  { ключ: "pg_q_see", раздел: "see" },
  { ключ: "pg_q_legend", раздел: "legend" },
  { ключ: "pg_q_facts", раздел: "facts" },
  { ключ: "pg_q_tips", раздел: "tips" },
  { ключ: "pg_q_hours", вид: "часы" },
];

/** Номер голоса карточки — у каждого места свой, но всегда один и тот же. */
export function голосМеста(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Слова вопроса, по которым ищем ответ в рассказе (без коротких связок). */
function слова(текст: string): string[] {
  return текст
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((с) => с.length >= 4)
    .map((с) => с.slice(0, Math.max(4, с.length - 2))); // грубо отрезаем окончания
}

/** Два самых подходящих предложения из рассказа — или null. */
export function найтиВРассказе(вопрос: string, тексты: string[]): string | null {
  const ищем = слова(вопрос);
  if (!ищем.length) return null;
  const предложения = тексты.flatMap((т) => т.split(/(?<=[.!?。！？])\s+/));
  const оценены = предложения
    .map((п, i) => {
      const низ = п.toLowerCase();
      return { п, i, балл: ищем.filter((с) => низ.includes(с)).length };
    })
    .filter((x) => x.балл > 0)
    .sort((a, b) => b.балл - a.балл || a.i - b.i)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i);
  return оценены.length ? оценены.map((x) => x.п).join(" ") : null;
}

export default function ГидМеста({ place }: { place: Place & { geo?: Geo } }) {
  const { t, lang } = useT();
  const { pos } = useGeo();
  const дист = useДистанция();
  const [реплики, setРеплики] = useState<Реплика[]>([]);
  const [вопрос, setВопрос] = useState("");
  const [думает, setДумает] = useState(false);
  const [звучит, setЗвучит] = useState<number | null>(null);
  const низ = useRef<HTMLDivElement>(null);

  const место = place.geo ?? точка(place.nameRu ?? place.name, place.city);
  const км = pos && место ? расстояниеТочноКм(pos, место) : null;
  const разделы = place.story ?? [];
  const подставить = (ключ: TKey) => t(ключ).replace("{name}", place.name);

  /** Где человек относительно места — живая строка и ответ на «Где я?». */
  function где(): string {
    if (км == null) return подставить("pg_nogeo");
    if (км <= ЗДЕСЬ_КМ) {
      // У места — сразу главное о нём, как сказал бы гид на месте.
      return `${подставить("pg_here")} ${place.desc}`;
    }
    const минут = Math.max(1, Math.round((км / ПЕШКОМ_КМ_В_ЧАС) * 60));
    const шаблон = км <= 3 ? "pg_near" : "pg_far";
    return подставить(шаблон).replace("{d}", дист.формат(км)).replace("{m}", String(минут));
  }

  // Ушли с карточки — гид замолкает.
  useEffect(() => () => замолчать(), []);
  useEffect(() => {
    низ.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [реплики.length]);

  const ответить = (текст: string) => setРеплики((р) => [...р, { от: "гид", текст }]);

  function нажать(к: (typeof КНОПКИ)[number]) {
    setРеплики((р) => [...р, { от: "я", текст: t(к.ключ) }]);
    if (к.вид === "где") return ответить(где());
    if (к.вид === "часы")
      return ответить(t("pg_hours_answer").replace("{h}", place.hours).replace("{e}", place.entry));
    const р = разделы.find((x) => x.kind === к.раздел);
    ответить(р ? р.text : t("pg_nothing"));
  }

  async function спросить() {
    const текст = вопрос.trim();
    if (!текст || думает) return;
    setВопрос("");
    const история = [...реплики, { от: "я" as const, текст }];
    setРеплики(история);
    setДумает(true);
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: история.slice(-8).map((р) => ({ role: р.от === "я" ? "user" : "ai", text: р.текст })),
          place: place.id,
          distanceM: км == null ? null : Math.round(км * 1000),
        }),
      });
      const data = res.ok ? ((await res.json()) as { text?: string }) : null;
      if (data?.text) return ответить(data.text);
      throw new Error("no ai");
    } catch {
      // Гид не подключён или недоступен — отвечаем из рассказа о месте.
      const найдено = найтиВРассказе(текст, [place.desc, ...разделы.map((р) => р.text)]);
      ответить(найдено ? `${t("pg_offline")} ${найдено}` : t("pg_nothing"));
    } finally {
      setДумает(false);
    }
  }

  async function озвучить(i: number, текст: string) {
    if (звучит === i) {
      замолчать();
      setЗвучит(null);
      return;
    }
    const код = await языкГолоса(lang);
    if (!код) return;
    setЗвучит(i);
    void рассказать(текст, код, { голос: голосМеста(place.id), конец: () => setЗвучит(null) });
  }

  return (
    <div
      className="mb-3 overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-center gap-2 px-4 pt-3.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl text-base"
          style={{ background: ACCENT_FILL, color: WHITE }}
          aria-hidden
        >
          🤖
        </span>
        <p className="flex-1 text-sm font-bold" style={{ color: TEXT }}>
          {t("pg_title")}
        </p>
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
          style={{ background: ACCENT_SOFT, color: GREEN }}
        >
          {t("pg_ai_mark")}
        </span>
      </div>
      {/* Живая строка: где вы относительно места. Меняется, пока идёте. */}
      <p
        className="mx-4 mt-2.5 rounded-xl px-3 py-2 text-xs leading-relaxed"
        style={{ background: ACCENT_SOFT, color: TEXT }}
      >
        {км != null && км <= ЗДЕСЬ_КМ ? подставить("pg_here") : где()} {реплики.length === 0 && t("pg_hello")}
      </p>

      {реплики.length > 0 && (
        <div className="mt-2 space-y-2 px-4">
          {реплики.map((р, i) => (
            <div key={i} className={р.от === "я" ? "flex justify-end" : "flex items-end gap-1.5"}>
              <p
                className="max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-xs leading-relaxed"
                style={
                  р.от === "я"
                    ? { background: ACCENT_FILL, color: WHITE }
                    : { background: "var(--cream)", color: TEXT }
                }
              >
                {р.текст}
              </p>
              {р.от === "гид" && (
                <button
                  onClick={() => озвучить(i, р.текст)}
                  aria-label={t("pg_listen")}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs"
                  style={{ background: ACCENT_SOFT, color: GREEN }}
                >
                  {звучит === i ? "⏸" : "🔊"}
                </button>
              )}
            </div>
          ))}
          {думает && (
            <p className="text-xs" style={{ color: MUTED }}>
              …
            </p>
          )}
          <div ref={низ} />
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto px-4 pt-3 hide-scroll">
        {КНОПКИ
          .filter((к) => !к.раздел || разделы.some((р) => р.kind === к.раздел))
          .map((к) => (
            <button
              key={к.ключ}
              onClick={() => нажать(к)}
              className="flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
              style={{ borderColor: BORDER, color: GREEN, background: "var(--surface)" }}
            >
              {t(к.ключ)}
            </button>
          ))}
      </div>

      <form
        className="flex gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void спросить();
        }}
      >
        <input
          value={вопрос}
          onChange={(e) => setВопрос(e.target.value)}
          placeholder={t("pg_placeholder")}
          maxLength={500}
          className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
          style={{ borderColor: BORDER, color: TEXT, background: "var(--surface)" }}
        />
        <button
          type="submit"
          disabled={!вопрос.trim() || думает}
          aria-label={t("pg_send")}
          className="rounded-xl px-3 text-xs font-bold disabled:opacity-50"
          style={{ background: ACCENT_FILL, color: WHITE }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
