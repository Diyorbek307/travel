"use client";

import { МагазинEsim } from "@/components/esim-shop";
import { useEffect, useMemo, useState } from "react";
import { BORDER, CREAM, GREEN, MUTED, TEXT, ACCENT_SOFT, мягко } from "@/lib/theme";
import { useCurrency, СИМВОЛЫ, ГЛАВНЫЕ } from "@/components/currency-provider";
import { useT } from "@/components/lang-provider";
import { ПАМЯТКИ } from "@/data/guides";
import { Разговорник } from "@/components/phrasebook";

export function CurrencyConverter() {
  const { rates, loading, updated } = useCurrency();
  const { t, lang } = useT();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("UZS");

  // Список валют: сперва частые у гостей, затем все прочие по алфавиту —
  // «все валюты» значит все, что отдаёт служба курсов.
  const валюты = useMemo(() => {
    const коды = Object.keys(rates);
    if (!коды.length) return ГЛАВНЫЕ;
    const прочие = коды.filter((к) => !ГЛАВНЫЕ.includes(к)).sort();
    return [...ГЛАВНЫЕ.filter((к) => коды.includes(к)), ...прочие];
  }, [rates]);

  // Курс любой пары через доллар: rates[к] — сколько валюты за $1.
  const есть = rates[from] && rates[to];
  const результат = есть ? (parseFloat(amount || "0") * rates[to]) / rates[from] : null;

  const выбор = (значение: string, менять: (v: string) => void) => (
    <select
      value={значение}
      onChange={(e) => менять(e.target.value)}
      className="w-full rounded-xl border bg-transparent px-2 py-2.5 text-sm font-bold outline-none"
      style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
    >
      {валюты.map((к) => (
        <option key={к} value={к}>
          {СИМВОЛЫ[к] ? `${к} ${СИМВОЛЫ[к]}` : к}
        </option>
      ))}
    </select>
  );

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="mb-3 text-sm font-bold" style={{ color: TEXT }}>
        💱 {t("cur_title")}
      </p>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        {/* Сумма — своей строкой во всю ширину: рядом с двумя списками
            валют поле сжималось, и «100» читалось как «10» — казалось,
            что конвертер ошибся в десять раз. */}
        <div className="w-full">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            {t("cur_amount")}
          </p>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            className="w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none"
            style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            {t("cur_from")}
          </p>
          {выбор(from, setFrom)}
        </div>
        <button
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label={t("tr_swap")}
          className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{ borderColor: BORDER, color: GREEN }}
        >
          ⇄
        </button>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            {t("cur_to")}
          </p>
          {выбор(to, setTo)}
        </div>
      </div>

      <div className="rounded-xl p-3 text-center" style={{ background: ACCENT_SOFT }}>
        {результат !== null ? (
          <p className="text-lg font-bold" style={{ color: GREEN, fontFamily: "var(--font-heading)" }}>
            {результат.toLocaleString(lang, { maximumFractionDigits: 2 })} {СИМВОЛЫ[to] ?? to}
          </p>
        ) : (
          <p className="text-xs" style={{ color: MUTED }}>
            {loading ? t("common_loading") : t("cur_unavailable")}
          </p>
        )}
      </div>

      {updated && результат !== null && (
        <p className="mt-2 text-center text-[10px]" style={{ color: MUTED }}>
          {t("cur_updated")}: {updated.toLocaleDateString(lang)}
        </p>
      )}
    </div>
  );
}

// Помощник по билетам на поезд

/** Продажа билетов на поезда обычно открывается за 45 дней. */
const ДНЕЙ_ДО_ПРОДАЖИ = 45;

const вДату = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * «Когда можно купить билет на мою дату?» — главный вопрос туриста о
 * поездах: «Афросиёб» раскупают в первые дни продаж. Считаем день
 * открытия продаж и даём поставить напоминание в свой календарь.
 */
function ПродажаБилетов() {
  const { t, lang } = useT();
  const сегодня = вДату(new Date());
  const [дата, setДата] = useState("");
  const поездка = дата ? new Date(`${дата}T12:00:00`) : null;
  const открытие = поездка ? new Date(поездка.getTime() - ДНЕЙ_ДО_ПРОДАЖИ * 86_400_000) : null;
  const ужеИдёт = открытие ? вДату(открытие) <= сегодня : false;

  // Напоминание — файл .ics: его понимает календарь любого телефона.
  const напомнить = () => {
    if (!открытие) return;
    const день = вДату(открытие).replace(/-/g, "");
    const следующий = вДату(new Date(открытие.getTime() + 86_400_000)).replace(/-/g, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HelloUZ//Trains//EN",
      "BEGIN:VEVENT",
      `UID:train-${день}@hellouz`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${день}`,
      `DTEND;VALUE=DATE:${следующий}`,
      `SUMMARY:${t("train_ics_title")}`,
      "DESCRIPTION:https://eticket.railway.uz",
      "BEGIN:VALARM",
      "TRIGGER:PT9H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${t("train_ics_title")}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "hellouz-train.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: ACCENT_SOFT }}>
      <label className="block text-[11px] font-bold" style={{ color: TEXT }}>
        🗓️ {t("train_date")}
        <input
          type="date"
          min={сегодня}
          value={дата}
          onChange={(e) => setДата(e.target.value)}
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
        />
      </label>
      {открытие && (
        <div className="mt-2.5">
          <p className="text-sm font-bold" style={{ color: GREEN }}>
            {ужеИдёт
              ? t("train_open_now")
              : t("train_opens").replace(
                  "{d}",
                  открытие.toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" }),
                )}
          </p>
          {!ужеИдёт && (
            <button
              onClick={напомнить}
              className="mt-2 rounded-lg px-3 py-2 text-xs font-bold text-white"
              style={{ background: GREEN }}
            >
              🔔 {t("train_remind")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Экран «Полезное»

export function PracticalScreen({ onBack, раскрыть }: { onBack: () => void; раскрыть?: string }) {
  const { t, lang } = useT();
  // «раскрыть» — сразу нужная памятка: например, «Связь» после оплаты eSIM.
  const [open, setOpen] = useState<string | null>(раскрыть ?? ПАМЯТКИ[0].id);
  // Памятку, открытую снаружи (eSIM → «Связь»), ещё и показываем: она
  // шестая в списке, под конвертером валют, — сама в кадр не попадёт.
  // Ждём, пока экран въедет, иначе прокрутка считается от старой позиции.
  useEffect(() => {
    if (!раскрыть) return;
    const id = setTimeout(
      () => document.getElementById(`pamyatka-${раскрыть}`)?.scrollIntoView({ block: "start", behavior: "smooth" }),
      350,
    );
    return () => clearTimeout(id);
  }, [раскрыть]);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{ background: CREAM }}>
      <div className="bg-white px-4 pt-14 pb-4 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <button
            aria-label={t("common_back")}
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: CREAM }}
          >
            <svg
              className="rtl-flip"
              width="16"
              height="16"
              fill="none"
              stroke={TEXT}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>
              {t("pr_kicker")}
            </p>
            <h1 className="text-xl font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
              {t("pr_title")}
            </h1>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-2.5">
        <CurrencyConverter />
        {ПАМЯТКИ.map((s) => {
          const раскрыта = open === s.id;
          return (
            <div
              key={s.id}
              id={`pamyatka-${s.id}`}
              className="scroll-mt-3 bg-white rounded-2xl overflow-hidden shadow-sm border"
              style={{ borderColor: BORDER }}
            >
              <button
                onClick={() => setOpen(раскрыта ? null : s.id)}
                aria-expanded={раскрыта}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: мягко(s.color, 9) }}
                >
                  {s.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: TEXT }}>
                    {s.заголовок[lang]}
                  </p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={MUTED}
                  strokeWidth="2"
                  className="rtl-flip flex-shrink-0"
                  style={{ transform: раскрыта ? "rotate(90deg)" : undefined, transition: "transform 0.2s" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              {раскрыта && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: BORDER }}>
                  {s.пункты.length > 0 && (
                    <ul className="space-y-2 mt-3">
                      {s.пункты.map((пункт, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: s.color }}
                          />
                          <p className="text-xs leading-relaxed" style={{ color: TEXT }}>
                            {пункт[lang]}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.виджет === "поезд" && <ПродажаБилетов />}
                  {s.виджет === "разговорник" && <Разговорник />}
                  {s.виджет === "esim" && <МагазинEsim />}
                  {s.ссылки && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.ссылки.map((с) => (
                        <a
                          key={с.url}
                          href={с.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border px-3 py-2 text-xs font-bold"
                          style={{ borderColor: BORDER, color: GREEN }}
                        >
                          {с.подпись[lang]} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div className="pb-4" />
      </div>
    </div>
  );
}

// Фоновый узор

export default PracticalScreen;
