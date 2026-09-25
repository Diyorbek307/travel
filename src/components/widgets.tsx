"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/lang-provider";
import { useAppContent } from "./content-provider";
import { useAudioPlayer, времяЗвука } from "./audio-player";
import {
  ACCENT_FILL,
  ACCENT_SOFT,
  BORDER,
  CREAM,
  GOLD,
  GREEN,
  GREEN_LIGHT,
  MUTED,
  ON_GOLD,
  TEXT,
  WHITE,
} from "@/lib/theme";

/**
 * Мини-плеер над нижним меню: пульт к общему проигрывателю. Виден, пока
 * выбрана запись, и управляет именно ею — пауза здесь ставит на паузу
 * звук, а крестик выключает рассказ.
 */
export function MiniPlayer() {
  const { t, трК } = useT();
  const { PLACES } = useAppContent();
  const плеер = useAudioPlayer();
  const запись = плеер.запись;
  if (!запись) return null;

  const место = PLACES.find((p) => p.id === запись.placeId);
  const доля = плеер.длительность ? (плеер.позиция / плеер.длительность) * 100 : 0;
  const всего = времяЗвука(плеер.длительность);

  return (
    <div className="absolute bottom-16 left-0 right-0 z-20 px-3 pb-1 lg:bottom-3 lg:left-auto lg:w-96">
      <div
        className="rounded-2xl overflow-hidden shadow-lg border"
        style={{ background: ACCENT_FILL, borderColor: ACCENT_SOFT }}
      >
        <div className="h-0.5 w-full" style={{ background: "rgba(255,255,255,0.2)" }}>
          <div
            className="h-0.5"
            style={{ background: GOLD, width: `${доля}%`, transition: "width 0.25s linear" }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          {место && (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <img src={место.img} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-xs truncate">{трК(запись.title)}</p>
            <p className="text-white/60 text-[10px] truncate">
              {трК(запись.placeName)} · {времяЗвука(плеер.позиция) || "0:00"}
              {всего ? ` / ${всего}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => плеер.включить(запись)}
              aria-label={плеер.играет ? t("d_pause") : t("d_listen")}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: GOLD }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={ON_GOLD}>
                {плеер.играет ? (
                  <>
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </>
                ) : (
                  <polygon points="5 3 19 12 5 21 5 3" />
                )}
              </svg>
            </button>
            <button
              onClick={плеер.стоп}
              aria-label={t("common_close")}
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Что уже скачано: город → сколько файлов и байт. Лежит на устройстве. */
const КЛЮЧ_ОФЛАЙН = "uzup.offline";
type Скачано = Record<string, { файлов: number; байт: number }>;

function прочитатьСкачанное(): Скачано {
  try {
    return JSON.parse(localStorage.getItem(КЛЮЧ_ОФЛАЙН) || "{}") as Скачано;
  } catch {
    return {};
  }
}

/**
 * Город с собой.
 *
 * Здесь были три выдуманных пакета («127 гидов · 2,4 ГБ») и полоска,
 * которая заполнялась случайными шагами и ничего не скачивала. Теперь
 * «Скачать» кладёт в кэш устройства настоящие фото мест, отелей и
 * ресторанов города и его аудиогиды, а офлайн-кэш приложения
 * (public/sw.js) отдаёт их потом без сети.
 */
export function OfflinePacks() {
  const { t, трК, lang } = useT();
  const { PLACES, HOTELS, RESTAURANTS, AUDIO } = useAppContent();
  const [скачано, setСкачано] = useState<Скачано>({});
  const [прогресс, setПрогресс] = useState<Record<string, number>>({});
  const [сбой, setСбой] = useState<string | null>(null);
  const [можно, setМожно] = useState(false);

  useEffect(() => {
    setМожно("caches" in window);
    setСкачано(прочитатьСкачанное());
  }, []);

  // Города — те, где есть места; порядок как в данных.
  const города = Array.from(new Set(PLACES.map((p) => p.city)));
  const файлыГорода = (город: string) => {
    const фото = [
      ...PLACES.filter((p) => p.city === город).map((p) => p.img),
      ...HOTELS.filter((h) => h.city === город).flatMap((h) => [h.img, ...(h.imgs ?? [])]),
      ...RESTAURANTS.filter((r) => r.city === город).map((r) => r.img),
    ];
    const аудио = AUDIO.filter((а) => а.city === город).map((а) => а.url);
    return { фото: Array.from(new Set(фото.filter(Boolean))), аудио: Array.from(new Set(аудио)) };
  };

  async function скачать(город: string) {
    const { фото, аудио } = файлыГорода(город);
    const все = [...фото, ...аудио];
    setСбой(null);
    setПрогресс((p) => ({ ...p, [город]: 0 }));
    try {
      const кэш = await caches.open(`offline-${город}`);
      let байт = 0;
      let готово = 0;
      for (let i = 0; i < все.length; i++) {
        const адрес = все[i];
        try {
          // Сначала с CORS: тогда известен размер. Не отдаёт — берём
          // «непрозрачный» ответ: показать его картинкой можно и так.
          let ответ = await fetch(адрес, { mode: "cors" }).catch(() => null);
          if (!ответ?.ok) ответ = await fetch(адрес, { mode: "no-cors" });
          await кэш.put(адрес, ответ.clone());
          if (ответ.type !== "opaque") байт += (await ответ.blob()).size;
          готово += 1;
        } catch {
          // Один недоступный файл не должен ронять весь город.
        }
        setПрогресс((p) => ({ ...p, [город]: Math.round(((i + 1) / все.length) * 100) }));
      }
      if (все.length > 0 && готово === 0) throw new Error("nothing saved");
      const новое = { ...прочитатьСкачанное(), [город]: { файлов: готово, байт } };
      localStorage.setItem(КЛЮЧ_ОФЛАЙН, JSON.stringify(новое));
      setСкачано(новое);
    } catch {
      setСбой(город);
    } finally {
      setПрогресс((p) => {
        const остальные = { ...p };
        delete остальные[город];
        return остальные;
      });
    }
  }

  async function удалить(город: string) {
    await caches.delete(`offline-${город}`).catch(() => false);
    const остальные = прочитатьСкачанное();
    delete остальные[город];
    localStorage.setItem(КЛЮЧ_ОФЛАЙН, JSON.stringify(остальные));
    setСкачано(остальные);
  }

  if (!можно || города.length === 0) return null;

  return (
    <div>
      <p className="font-bold text-sm mb-1" style={{ color: TEXT }}>
        ⬇️ {t("off_packs")}
      </p>
      <p className="text-xs mb-2.5" style={{ color: MUTED }}>
        {t("off_hint")}
      </p>
      <div className="space-y-2.5">
        {города.map((город) => {
          const { фото, аудио } = файлыГорода(город);
          const есть = скачано[город];
          const pct = прогресс[город];
          const качается = pct !== undefined;
          return (
            <div
              key={город}
              className="bg-white rounded-2xl p-3.5 shadow-sm border"
              style={{ borderColor: BORDER }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: есть ? ACCENT_SOFT : CREAM }}
                >
                  <span style={{ color: есть ? GREEN : MUTED }}>{есть ? "✓" : "⬇"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: TEXT }}>
                    {трК(город)}
                  </p>
                  <p className="text-xs" style={{ color: MUTED }}>
                    {фото.length} {t("off_photos")}
                    {аудио.length ? ` · ${аудио.length} ${t("off_audio")}` : ""}
                    {есть && есть.байт > 0
                      ? ` · ${(есть.байт / 1048576).toLocaleString(lang, { maximumFractionDigits: 1 })} ${t(
                          "unit_mb",
                        )}`
                      : ""}
                  </p>
                </div>
                {!есть && !качается && (
                  <button
                    onClick={() => скачать(город)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: ACCENT_FILL, color: WHITE }}
                  >
                    {t("off_download")}
                  </button>
                )}
                {есть && !качается && (
                  <button
                    onClick={() => удалить(город)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{ borderColor: BORDER, color: MUTED }}
                  >
                    {t("off_delete")}
                  </button>
                )}
              </div>
              {качается && (
                <div className="mt-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: MUTED }}>
                      {t("off_loading")}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: GREEN }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="rounded-full h-1.5 overflow-hidden" style={{ background: BORDER }}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg,${GREEN},${GREEN_LIGHT})`,
                      }}
                    />
                  </div>
                </div>
              )}
              {сбой === город && (
                <p className="mt-2 text-xs" style={{ color: "#c1603a" }}>
                  {t("off_failed")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="absolute bottom-20 left-4 right-4 z-50 pointer-events-none"
      style={{ animation: "slide-up 0.3s cubic-bezier(.22,1,.36,1) forwards" }}
    >
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl"
        style={{ background: "rgba(15,26,20,0.92)", backdropFilter: "blur(12px)" }}
      >
        {/* Значок несёт само сообщение («✅ добавлено», «✕ убрано»):
            вшитая галочка стояла и перед сообщениями об ошибке. */}
        <p className="text-white text-sm font-medium">{msg}</p>
      </div>
    </div>
  );
}
