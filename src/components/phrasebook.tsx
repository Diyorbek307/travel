"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ACCENT_FILL, BORDER, CREAM, GREEN, MUTED, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { РАЗГОВОРНИК, type Фраза } from "@/data/phrases";

/**
 * Разговорник с озвучкой.
 *
 * Голос — встроенный в телефон (speechSynthesis): работает без интернета
 * и ничего не стоит. Узбекского голоса на большинстве телефонов нет —
 * тогда читаем турецким: узбекская латиница по звучанию к нему ближе
 * всех, и таксист поймёт. Русский голос есть почти везде.
 *
 * «Показать» — фраза крупно на весь экран: телефон можно просто
 * протянуть продавцу или водителю.
 */

const ПОДПИСИ: Record<string, TKey> = {
  basic: "pb_basic",
  taxi: "pb_taxi",
  food: "pb_food",
  shop: "pb_shop",
  help: "pb_help",
};

/** Подходящий голос: сам язык, для узбекского — турецкий как запасной. */
function голос(язык: "uz" | "ru"): SpeechSynthesisVoice | null {
  const все = window.speechSynthesis.getVoices();
  const найти = (код: string) => все.find((v) => v.lang.toLowerCase().startsWith(код)) ?? null;
  return язык === "uz" ? найти("uz") ?? найти("tr") : найти("ru");
}

function сказать(текст: string, язык: "uz" | "ru") {
  const речь = window.speechSynthesis;
  речь.cancel();
  const фраза = new SpeechSynthesisUtterance(текст);
  const г = голос(язык);
  if (г) фраза.voice = г;
  фраза.lang = г?.lang ?? (язык === "uz" ? "uz-UZ" : "ru-RU");
  фраза.rate = 0.85;
  речь.speak(фраза);
}

export function Разговорник() {
  const { t, lang } = useT();
  const [раздел, setРаздел] = useState(РАЗГОВОРНИК[0].id);
  const [крупно, setКрупно] = useState<Фраза | null>(null);
  // Голоса у браузера появляются не сразу — ждём список. Кнопку 🔊
  // показываем только там, где есть подходящий голос: чужой голос
  // исковеркал бы фразу так, что её не поймут.
  const [голоса, setГолоса] = useState({ uz: false, ru: false });
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const обновить = () => setГолоса({ uz: Boolean(голос("uz")), ru: Boolean(голос("ru")) });
    обновить();
    window.speechSynthesis.addEventListener("voiceschanged", обновить);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", обновить);
      window.speechSynthesis.cancel();
    };
  }, []);

  const смысл = (ф: Фраза) => (lang === "ru" ? ф.ru : lang === "uz" ? ф.uz : ф.смысл[lang]);
  const фразы = РАЗГОВОРНИК.find((р) => р.id === раздел)?.фразы ?? [];

  const строка = (текст: string, флаг: string, язык: "uz" | "ru") => (
    <div className="flex items-center gap-2">
      <span className="text-sm">{флаг}</span>
      <p className="flex-1 text-sm" style={{ color: TEXT }} lang={язык}>
        {текст}
      </p>
      {голоса[язык] && (
        <button
          onClick={() => сказать(текст, язык)}
          aria-label={t("pb_listen")}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
          style={{ background: CREAM, color: GREEN }}
        >
          🔊
        </button>
      )}
    </div>
  );

  return (
    <div className="mt-3">
      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 hide-scroll">
        {РАЗГОВОРНИК.map((р) => (
          <button
            key={р.id}
            onClick={() => setРаздел(р.id)}
            className="flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={
              раздел === р.id
                ? { background: ACCENT_FILL, color: WHITE, borderColor: "transparent" }
                : { background: SURFACE, color: MUTED, borderColor: BORDER }
            }
          >
            {р.icon} {t(ПОДПИСИ[р.id])}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {фразы.map((ф) => (
          <li key={ф.uz} className="rounded-xl border p-3" style={{ borderColor: BORDER }}>
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <p className="text-sm font-bold" style={{ color: TEXT }}>
                {смысл(ф)}
              </p>
              <button
                onClick={() => setКрупно(ф)}
                className="flex-shrink-0 rounded-lg border px-2 py-1 text-[10px] font-bold"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                ⤢ {t("pb_show")}
              </button>
            </div>
            <div className="space-y-1">
              {lang !== "uz" && строка(ф.uz, "🇺🇿", "uz")}
              {lang !== "ru" && строка(ф.ru, "🇷🇺", "ru")}
            </div>
          </li>
        ))}
      </ul>
      {!голоса.uz && lang !== "uz" && (
        <p className="mt-2 text-[10px]" style={{ color: MUTED }}>
          {t("pb_no_voice")}
        </p>
      )}
      {крупно &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-6 p-6 text-center"
            style={{ background: SURFACE }}
            role="dialog"
            aria-modal
            onClick={() => setКрупно(null)}
          >
            <p className="text-4xl font-extrabold leading-tight" style={{ color: TEXT }} lang="uz">
              {крупно.uz}
            </p>
            <p className="text-2xl font-bold leading-tight" style={{ color: MUTED }} lang="ru">
              {крупно.ru}
            </p>
            <p className="text-sm" style={{ color: MUTED }}>
              {смысл(крупно)}
            </p>
            <button
              className="mt-4 rounded-2xl px-6 py-3 text-sm font-bold"
              style={{ background: ACCENT_FILL, color: WHITE }}
            >
              {t("common_close")}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
