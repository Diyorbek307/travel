"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCENT_FILL, BORDER, CREAM, GOLD, MUTED, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import type { ПереводФото } from "@/lib/photo-translate";

/**
 * Переводчик по фото и фото-гид.
 *
 * Турист снимает меню, вывеску или памятник — Claude читает снимок и
 * отвечает на языке туриста. Снимок ужимаем прямо в телефоне до 1600
 * пикселей: быстрее уходит по мобильной сети и дешевле обрабатывается.
 * На сервере фото не сохраняется.
 */

export type РежимФото = "translate" | "guide";

/* Включён ли ИИ на сервере — спрашиваем один раз на всё приложение. */
let включёнЗапрос: Promise<boolean> | null = null;
export function useФотоИИ(): boolean | null {
  const [вкл, setВкл] = useState<boolean | null>(null);
  useEffect(() => {
    включёнЗапрос ??= fetch("/api/translate-photo")
      .then((r) => (r.ok ? r.json() : { on: false }))
      .then((d: { on?: boolean }) => Boolean(d.on))
      .catch(() => false);
    let жив = true;
    void включёнЗапрос.then((v) => жив && setВкл(v));
    return () => {
      жив = false;
    };
  }, []);
  return вкл;
}

const МАКС_СТОРОНА = 1600;

/** Фото → JPEG не больше 1600 пикселей по длинной стороне. */
async function ужать(файл: File): Promise<string> {
  const url = URL.createObjectURL(файл);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = fail;
      i.src = url;
    });
    const k = Math.min(1, МАКС_СТОРОНА / Math.max(img.naturalWidth, img.naturalHeight));
    const холст = document.createElement("canvas");
    холст.width = Math.round(img.naturalWidth * k);
    холст.height = Math.round(img.naturalHeight * k);
    холст.getContext("2d")!.drawImage(img, 0, 0, холст.width, холст.height);
    return холст.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const ОШИБКИ: Record<string, TKey> = { off: "ph_off", too_many: "ph_limit" };

export function ПереводчикФото({ режим = "translate" }: { режим?: РежимФото }) {
  const { t, lang } = useT();
  const камера = useRef<HTMLInputElement>(null);
  const галерея = useRef<HTMLInputElement>(null);
  const [фото, setФото] = useState<string | null>(null);
  const [идёт, setИдёт] = useState(false);
  const [итог, setИтог] = useState<ПереводФото | null>(null);
  const [ошибка, setОшибка] = useState<TKey | null>(null);
  const гид = режим === "guide";

  const выбрано = async (файл: File | undefined) => {
    if (!файл) return;
    setИтог(null);
    setОшибка(null);
    setИдёт(true);
    try {
      const картинка = await ужать(файл);
      setФото(картинка);
      const r = await fetch("/api/translate-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: картинка, lang, mode: режим }),
      });
      const d = (await r.json().catch(() => null)) as (ПереводФото & { error?: string }) | null;
      if (!r.ok || !d) setОшибка(ОШИБКИ[d?.error ?? ""] ?? "ph_error");
      else setИтог(d);
    } catch {
      setОшибка("ph_error");
    } finally {
      setИдёт(false);
    }
  };

  const кнопки = (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => камера.current?.click()}
        disabled={идёт}
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-transform active:scale-[0.97] disabled:opacity-60"
        style={{ background: ACCENT_FILL, color: WHITE }}
      >
        📷 {t("ph_camera")}
      </button>
      <button
        onClick={() => галерея.current?.click()}
        disabled={идёт}
        className="flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-bold transition-transform active:scale-[0.97] disabled:opacity-60"
        style={{ borderColor: BORDER, color: TEXT, background: SURFACE }}
      >
        🖼️ {t("ph_gallery")}
      </button>
      {/* Сброс value — чтобы тот же снимок можно было выбрать ещё раз. */}
      <input
        ref={камера}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void выбрано(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={галерея}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void выбрано(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {!фото && (
        <div
          className="rounded-3xl border p-5 text-center"
          style={{ background: SURFACE, borderColor: BORDER }}
        >
          <p className="text-4xl">{гид ? "🏛️" : "📜"}</p>
          <p className="mt-2 text-base font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
            {t(гид ? "ph_guide_title" : "ph_title")}
          </p>
          <p className="mt-1 text-sm leading-snug" style={{ color: MUTED }}>
            {t(гид ? "ph_guide_intro" : "ph_intro")}
          </p>
        </div>
      )}

      {фото && (
        <div className="relative overflow-hidden rounded-3xl border" style={{ borderColor: BORDER }}>
          <img src={фото} alt="" className="max-h-64 w-full object-cover" />
          {идёт && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "rgba(3,10,9,0.55)" }}
            >
              <span className="photo-scan absolute inset-x-0 h-1" style={{ background: GOLD }} />
              <p className="text-sm font-bold text-white">{t(гид ? "ph_looking" : "ph_reading")}</p>
            </div>
          )}
        </div>
      )}

      {ошибка && (
        <p
          className="rounded-2xl border p-3 text-sm"
          style={{ borderColor: BORDER, background: SURFACE, color: TEXT }}
          role="alert"
        >
          {t(ошибка)}
        </p>
      )}

      {итог && <Итог итог={итог} />}

      {кнопки}
      <p className="text-center text-[11px]" style={{ color: MUTED }}>
        🔒 {t("ph_privacy")}
      </p>
    </div>
  );
}

function Итог({ итог }: { итог: ПереводФото }) {
  const { t } = useT();
  return (
    <div className="bubble-in rounded-3xl border p-4" style={{ background: SURFACE, borderColor: BORDER }}>
      {итог.title && (
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
          {итог.title}
        </p>
      )}
      {итог.summary && (
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed" style={{ color: TEXT }}>
          {итог.summary}
        </p>
      )}
      {итог.items.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y" style={{ borderColor: BORDER }}>
          {итог.items.map((с, i) => (
            <li key={i} className="flex gap-3 py-2.5" style={{ borderColor: BORDER }}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug" style={{ color: TEXT }}>
                  {с.translation}
                </p>
                {с.original && с.original !== с.translation && (
                  <p className="text-[11px] leading-snug" style={{ color: MUTED }}>
                    {с.original}
                  </p>
                )}
                {с.note && (
                  <p className="mt-0.5 text-xs leading-snug" style={{ color: MUTED }}>
                    {с.note}
                  </p>
                )}
              </div>
              {с.price && (
                <span className="flex-shrink-0 text-sm font-bold" style={{ color: TEXT }}>
                  {с.price}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {!итог.summary && итог.items.length === 0 && (
        <p className="text-sm" style={{ color: MUTED }}>
          {t("ph_none")}
        </p>
      )}
    </div>
  );
}

/**
 * Кнопка в карточке ресторана: бумажное меню на столе — сфотографировал и
 * читаешь на своём языке. Без ИИ на сервере кнопки нет вовсе.
 */
export function КнопкаПереводаМеню() {
  const { t } = useT();
  const вкл = useФотоИИ();
  const [открыт, setОткрыт] = useState(false);
  if (!вкл) return null;
  return (
    <>
      <button
        onClick={() => setОткрыт(true)}
        className="mb-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-transform active:scale-[0.98]"
        style={{ borderColor: BORDER, background: SURFACE }}
      >
        <span className="text-2xl">📷</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold" style={{ color: TEXT }}>
            {t("ph_menu_btn")}
          </span>
          <span className="block text-[11px]" style={{ color: MUTED }}>
            {t("ph_menu_btn_sub")}
          </span>
        </span>
        <span style={{ color: MUTED }} aria-hidden>
          ›
        </span>
      </button>
      {/* Поверх всего, как экран скидки: у экранов есть transform-анимации,
          и fixed внутри них прилип бы к экрану, а не к окну. */}
      {открыт &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex flex-col"
            style={{ background: CREAM }}
            role="dialog"
            aria-modal
          >
            <div
              className="flex items-center gap-3 border-b px-4 py-3"
              style={{ borderColor: BORDER, background: SURFACE }}
            >
              <button
                onClick={() => setОткрыт(false)}
                aria-label={t("common_close")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border text-lg"
                style={{ borderColor: BORDER, color: TEXT }}
              >
                ✕
              </button>
              <p className="text-base font-bold" style={{ color: TEXT }}>
                {t("ex_translate")}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-md">
                <ПереводчикФото />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
