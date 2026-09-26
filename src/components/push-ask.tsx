"use client";

import { useEffect, useState } from "react";
import { usePush } from "@/lib/push-client";
import { useGeo } from "@/components/geo-provider";
import { ближайшийГород } from "@/data/geo";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { ACCENT_FILL, BORDER, MUTED, SURFACE, TEXT, WHITE, CREAM } from "@/lib/theme";

/**
 * Мягкое предложение включить уведомления.
 *
 * Включить их без спроса нельзя: браузер показывает уведомления сайта
 * только после разрешения человека, и спросить его можно только по
 * нажатию. Системный вопрос сразу при входе почти всегда отклоняют, а
 * отклонённое браузер больше спросить не даёт. Поэтому сначала — своя
 * карточка, объясняющая, зачем уведомления, и системный вопрос только
 * после «Включить».
 *
 * Первый раз — отдельным экраном сразу при входе (ЭкранУведомлений ниже):
 * человек только что зарегистрировался или вошёл и настроен разобраться
 * с приложением. Отказался — позже напомним карточкой (PushAsk), когда
 * он уже огляделся. Не назойливо: не чаще раза в неделю и не больше трёх
 * раз всего, экран входа тоже считается.
 */

const КЛЮЧ = "uzup.push-ask";
const ЗАДЕРЖКА_МС = 30_000;
const ПАУЗА_МС = 7 * 86_400_000;
const МАКС_РАЗ = 3;

interface Отметка {
  раз: number;
  когда: string;
}

function прочитать(): Отметка {
  try {
    const v = JSON.parse(localStorage.getItem(КЛЮЧ) || "null") as Отметка | null;
    return v && typeof v.раз === "number" ? v : { раз: 0, когда: "" };
  } catch {
    return { раз: 0, когда: "" };
  }
}

export function пораСпросить(): boolean {
  const { раз, когда } = прочитать();
  if (раз >= МАКС_РАЗ) return false;
  return !когда || Date.now() - Date.parse(когда) > ПАУЗА_МС;
}

export function отметитьПоказ() {
  try {
    const { раз } = прочитать();
    localStorage.setItem(КЛЮЧ, JSON.stringify({ раз: раз + 1, когда: new Date().toISOString() }));
  } catch {
    // Хранилище закрыто (приватный режим) — спросим в следующий раз, не страшно.
  }
}

export default function PushAsk() {
  const { t } = useT();
  const { pos } = useGeo();
  const { состояние, занято, включить } = usePush(ближайшийГород(pos));
  const [открыто, setОткрыто] = useState(false);

  const подходит = состояние === "выключено" || состояние === "нужен-экран-домой";

  useEffect(() => {
    if (!подходит || !пораСпросить()) return;
    const таймер = setTimeout(() => {
      setОткрыто(true);
      отметитьПоказ();
    }, ЗАДЕРЖКА_МС);
    return () => clearTimeout(таймер);
  }, [подходит]);

  if (!открыто || !подходит) return null;
  const айфон = состояние === "нужен-экран-домой";

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="animate-slide-up absolute inset-x-3 z-30 rounded-3xl border p-4 shadow-xl lg:inset-x-auto lg:right-6 lg:w-96"
      style={{
        background: SURFACE,
        borderColor: BORDER,
        // Над нижней панелью вкладок, с учётом полосы жестов iPhone.
        bottom: "calc(84px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: CREAM }}
        >
          🔔
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
            {t("push_ask_title")}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: MUTED }}>
            {айфон ? t("push_ios_home") : t("push_ask_body")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => setОткрыто(false)}
          className="rounded-xl px-4 py-2 text-xs font-semibold"
          style={{ color: MUTED }}
        >
          {айфон ? t("push_ask_ok") : t("push_ask_later")}
        </button>
        {!айфон && (
          <button
            disabled={занято}
            onClick={async () => {
              await включить();
              setОткрыто(false);
            }}
            className="rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50"
            style={{ background: ACCENT_FILL, color: WHITE }}
          >
            {t("push_enable")}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Экран при входе: «Включите уведомления». Стоит между входом и
 * приложением. Если спрашивать нечего — push не настроен, уже включён,
 * запрещён в браузере или спрашивали недавно, — экран сразу пропускает
 * дальше, и человек его не видит.
 */
export function ЭкранУведомлений({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const { pos } = useGeo();
  const { состояние, занято, включить } = usePush(ближайшийГород(pos));
  const подходит = состояние === "выключено" || состояние === "нужен-экран-домой";
  const [показан, setПоказан] = useState(false);

  useEffect(() => {
    if (состояние === "проверка") return;
    if (!подходит || !пораСпросить()) return onDone();
    setПоказан(true);
    отметитьПоказ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [состояние]);

  // Пока выясняем состояние — пустой фон того же цвета: без мигания.
  if (!показан) return <div className="h-full" style={{ background: CREAM }} />;
  const айфон = состояние === "нужен-экран-домой";

  const польза: [string, TKey][] = [
    ["🏷️", "push_b_deals"],
    ["🎉", "push_b_events"],
    ["🧳", "push_b_trip"],
  ];

  return (
    <div className="animate-slide-up flex h-full flex-col px-6 pt-20 pb-8" style={{ background: CREAM }}>
      <div className="flex flex-1 flex-col items-center text-center">
        <div
          className="mb-6 flex h-28 w-28 items-center justify-center rounded-[32px] text-6xl shadow-lg"
          style={{ background: ACCENT_FILL }}
        >
          🔔
        </div>
        <h2 className="text-2xl font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
          {t("push_ask_title")}
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: MUTED }}>
          {айфон ? t("push_ios_home") : t("push_ask_body")}
        </p>
        {!айфон && (
          <div className="mt-7 w-full max-w-xs space-y-2.5 text-left">
            {польза.map(([э, ключ]) => (
              <div
                key={ключ}
                className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{ background: SURFACE, borderColor: BORDER }}
              >
                <span className="text-xl">{э}</span>
                <span className="text-sm font-medium" style={{ color: TEXT }}>
                  {t(ключ)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-xs">
        {!айфон && (
          <button
            disabled={занято}
            onClick={async () => {
              await включить();
              onDone();
            }}
            className="w-full rounded-2xl py-4 text-sm font-bold disabled:opacity-60"
            style={{ background: ACCENT_FILL, color: WHITE }}
          >
            {t("push_enable_full")}
          </button>
        )}
        <button onClick={onDone} className="mt-2 w-full py-3 text-sm font-semibold" style={{ color: MUTED }}>
          {айфон ? t("push_ask_ok") : t("push_not_now")}
        </button>
      </div>
    </div>
  );
}
