"use client";

import { useEffect, useRef, useState } from "react";
import { ACCENT_FILL, BORDER, GOLD, MUTED, ON_GOLD, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { ДетиВидео, ФОН_ВИДЕО } from "./onboarding";

/**
 * Обучение: те же дети, что встречали на выборе языка, за три экрана
 * показывают, как устроено приложение. Внизу каждого экрана — кусочек
 * настоящего HelloUZ (его плитки, плеер, чат), а не нарисованный
 * интерфейс: человек потом узнаёт эти места на главной.
 *
 * Показывается один раз после выбора языка; пройти заново можно из
 * настроек («Обучение»).
 */

interface Шаг {
  видео: string;
  реплика: TKey;
  заголовок: TKey;
  текст: TKey;
  показ: () => React.ReactNode;
}

const ШАГИ: Шаг[] = [
  {
    видео: "/videos/kids-map.mp4",
    реплика: "tour1_say",
    заголовок: "tour1_title",
    текст: "tour1_text",
    показ: () => <Плитки />,
  },
  {
    видео: "/videos/kids-audio.mp4",
    реплика: "tour2_say",
    заголовок: "tour2_title",
    текст: "tour2_text",
    показ: () => <Плеер />,
  },
  {
    видео: "/videos/kids-phone.mp4",
    реплика: "tour3_say",
    заголовок: "tour3_title",
    текст: "tour3_text",
    показ: () => <Чат />,
  },
];

export function ОбучениеДети({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [n, setN] = useState(0);
  const шаг = ШАГИ[n];
  const последний = n === ШАГИ.length - 1;

  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ background: ФОН_ВИДЕО }}>
      <ВидеоШагов n={n} />

      <div className="relative z-10 mt-14 flex justify-center px-8">
        <div
          key={n}
          className="bubble-in relative max-w-[280px] rounded-2xl px-4 py-2.5 text-center text-sm font-semibold shadow-lg"
          style={{ background: "#ffffff", color: "#10302c" }}
        >
          {t(шаг.реплика)}
          <span
            className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
            style={{ background: "#ffffff" }}
            aria-hidden
          />
        </div>
      </div>

      <div
        className="relative z-10 mt-auto rounded-t-[28px] px-5 pb-7 pt-5"
        style={{
          background: "color-mix(in srgb, var(--surface) 92%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.12)",
        }}
      >
        <div key={n} className="tile-in">
          {шаг.показ()}
          <p className="mt-4 text-lg font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
            {t(шаг.заголовок)}
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
            {t(шаг.текст)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
          {ШАГИ.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === n ? 22 : 6, background: i === n ? ACCENT_FILL : BORDER }}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {n > 0 && (
            <button
              onClick={() => setN(n - 1)}
              className="rounded-2xl border px-5 py-4 text-sm font-bold"
              style={{ borderColor: BORDER, color: TEXT, background: SURFACE }}
            >
              {t("common_back")}
            </button>
          )}
          <button
            onClick={() => (последний ? onDone() : setN(n + 1))}
            className="flex-1 rounded-2xl py-4 text-sm font-bold text-white"
            style={{ background: ACCENT_FILL }}
          >
            {последний ? t("d_start") : t("onb_continue")}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Видео всех шагов сразу, одно над другим; видно и играет только
 * текущее. Раньше на каждое «Продолжить» ролик создавался заново:
 * мелькал чужой кадр-заставка, потом ждали загрузку — выглядело как
 * подвисание. Три ролика по ~250 КБ грузятся заранее, смена — мгновенная.
 */
function ВидеоШагов({ n }: { n: number }) {
  const ролики = useRef<(HTMLVideoElement | null)[]>([]);
  const [спокойно, setСпокойно] = useState(false);
  useEffect(() => {
    setСпокойно(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    ролики.current.forEach((в, i) => {
      if (!в) return;
      if (i === n) {
        в.currentTime = 0;
        в.play().catch(() => {});
      } else в.pause();
    });
  }, [n, спокойно]);
  if (спокойно) return <ДетиВидео src={ШАГИ[n].видео} />;
  return (
    <>
      {ШАГИ.map((ш, i) => (
        <video
          key={ш.видео}
          ref={(в) => {
            ролики.current[i] = в;
          }}
          src={ш.видео}
          autoPlay={i === 0}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain object-top transition-opacity duration-300"
          style={{ opacity: i === n ? 1 : 0 }}
        />
      ))}
    </>
  );
}

/* ── Кусочки настоящего приложения ───────────────────────────────── */

/** Плитки главной — те же картинки, что человек увидит в «HelloUZ». */
function Плитки() {
  const { t } = useT();
  const плитки: [string, TKey][] = [
    ["/tiles/places.webp", "home_places"],
    ["/tiles/museums.webp", "f_museums"],
    ["/tiles/hotels.webp", "home_hotels"],
    ["/tiles/restaurants.webp", "home_restaurants"],
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {плитки.map(([src, k]) => (
        <div
          key={k}
          className="flex flex-col items-center rounded-2xl border p-1.5"
          style={{ background: SURFACE, borderColor: BORDER }}
        >
          <img src={src} alt="" className="h-12 w-12 object-contain" />
          <span
            className="mt-0.5 w-full truncate text-center text-[10px] font-semibold"
            style={{ color: TEXT }}
          >
            {t(k)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Плеер аудиогида — как в карточке места. */
function Плеер() {
  const { t } = useT();
  return (
    <div className="rounded-2xl p-3" style={{ background: ACCENT_FILL }}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: GOLD }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={ON_GOLD}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">🎧 {t("d_audioguide")}</p>
          <div className="mt-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
            <div className="h-1.5 w-2/5 rounded-full" style={{ background: GOLD }} />
          </div>
        </div>
        <img src="/tiles/routes.webp" alt="" className="h-10 w-10 object-contain" />
      </div>
    </div>
  );
}

/** Чат ИИ-гида: вопрос туриста и ответ. */
function Чат() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="self-end rounded-2xl rounded-br-md px-3 py-2 text-xs font-medium"
        style={{ background: ACCENT_FILL, color: WHITE }}
      >
        {t("tour3_q")}
      </div>
      <div className="flex items-end gap-2">
        <img src="/tiles/ai.webp" alt="" className="h-9 w-9 object-contain" />
        <div
          className="rounded-2xl rounded-bl-md border px-3 py-2 text-xs"
          style={{ background: SURFACE, borderColor: BORDER, color: TEXT }}
        >
          {t("tour3_a")}
        </div>
      </div>
    </div>
  );
}
