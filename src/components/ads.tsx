"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADS } from "@/data/content";
import { useAppContent } from "./content-provider";
import { useT } from "@/components/lang-provider";
import { BORDER, LIME, MUTED, SURFACE, TEXT, WHITE, контрастныйТекст, мягко } from "@/lib/theme";
import type { AdPolicy } from "@/lib/types";

/**
 * Партнёрские блоки.
 *
 * Это основной заработок приложения, поэтому блок не должен выглядеть
 * баннером, который взгляд привычно перепрыгивает. Он сделан как ещё
 * одна услуга приложения — «предложение рядом с вами»: тот же язык
 * карточек, что у мест и отелей, живая рамка акцентом-лаймом, польза
 * в первой строке.
 *
 * При этом пометка «Партнёр» видна всегда: по закону о рекламе скрывать
 * её нельзя, и прятать её ради красоты мы не будем. Сделано наоборот —
 * пометка часть оформления, а не извинение.
 */

export interface Креатив {
  id?: string;
  emoji: string;
  label: string;
  title: string;
  sub: string;
  cta: string;
  color: string;
  city?: string;
  url?: string;
  /** Ролик для полноэкранного показа: файл в /videos или ссылка на mp4. */
  videoUrl?: string;
  /** Через сколько секунд можно закрыть. По умолчанию 5. */
  skipAfter?: number;
}

/** Общий подбор креативов: живые из админки, иначе вшитые. */
function useКреативы(cities?: string[]) {
  const { ADS: live } = useAppContent();
  // Старые записи без url — демо-посев прошлой версии; их игнорируем.
  const all = useMemo(() => {
    const usable = (live as Креатив[]).filter((a) => a.url);
    return usable.length > 0 ? usable : (ADS as Креатив[]);
  }, [live]);
  // Таргет: город, где турист сейчас или куда строит маршрут. Товары
  // без города показываем везде.
  return useMemo(() => {
    const rel = all.filter((a) => !a.city || !cities || cities.length === 0 || cities.includes(a.city));
    return rel.length ? rel : all;
  }, [all, cities]);
}

function перейти(ad: Креатив) {
  if (ad.url) window.open(ad.url, "_blank", "noopener,noreferrer");
}

/** Пометка «Партнёр» — стеклянная плашка, читается на любом фоне. */
function Пометка({ тёмный = true }: { тёмный?: boolean }) {
  const { t } = useT();
  return (
    <span
      className="rounded-full px-2 py-[3px] text-[8px] font-bold uppercase"
      style={{
        letterSpacing: "0.14em",
        background: тёмный ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)",
        color: тёмный ? "rgba(255,255,255,0.92)" : MUTED,
        backdropFilter: "blur(8px)",
      }}
    >
      {t("ad_partner")}
    </span>
  );
}

/**
 * Главный формат: крупная карточка-предложение.
 *
 * Живая рамка лаймом — то, ради чего блок вообще замечают. Она не
 * мигает и не прыгает: медленный перелив по краю, который видно боковым
 * зрением, но который не мешает читать.
 */
export function AdSpotlight({ isPremium, cities }: { isPremium: boolean; cities?: string[] }) {
  const { t, трК } = useT();
  const ads = useКреативы(cities);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 1000));
  const [скрыт, setСкрыт] = useState(false);

  // Смена предложения раз в 9 секунд — достаточно, чтобы прочитать.
  useEffect(() => {
    const таймер = setInterval(() => setIdx((i) => i + 1), 9000);
    return () => clearInterval(таймер);
  }, []);

  if (isPremium || скрыт || ads.length === 0) return null;
  const ad = ads[idx % ads.length];
  const текст = контрастныйТекст(ad.color);
  const вГороде = Boolean(ad.city && cities?.includes(ad.city));

  return (
    <div className="px-4 pt-5">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          ✨ {t("ad_offer_title")}
        </p>
        <button onClick={() => setСкрыт(true)} className="text-[10px] transition-all active:scale-95" style={{ color: MUTED }}>
          {t("ad_hide")}
        </button>
      </div>

      {/* Рамка — отдельный слой под карточкой: так перелив идёт по краю,
          а содержимое остаётся неподвижным. */}
      <div
        className="rounded-3xl p-[2px]"
        style={{
          background: "linear-gradient(120deg,var(--accent-2),var(--accent),var(--accent-2))",
          backgroundSize: "200% 100%",
          animation: "ad-edge 6s linear infinite",
          // Мягкое свечение наружу: блок должен быть заметен боковым
          // зрением — на нём держится заработок приложения.
          boxShadow: "0 10px 30px var(--accent-2-soft), 0 2px 10px var(--accent-soft)",
        }}
      >
        <button
          onClick={() => перейти(ad)}
          className="relative w-full overflow-hidden rounded-[22px] text-left transition-all active:scale-[0.985]"
          style={{ background: `linear-gradient(135deg,${ad.color} 0%,${ad.color}cc 100%)` }}
        >
          {/* Мягкое свечение в углу — объём без картинки, которой у
              рекламодателя может и не быть. */}
          <span
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.22)", filter: "blur(36px)" }}
          />

          <div className="relative flex items-start gap-3 p-4">
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
            >
              {ad.emoji}
            </span>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <Пометка тёмный={текст === WHITE} />
                {ad.city && (
                  <span
                    className="min-w-0 text-[8px] font-bold uppercase leading-tight"
                    style={{ letterSpacing: "0.1em", color: текст, opacity: 0.72, overflowWrap: "anywhere" }}
                  >
                    📍 {трК(ad.city)} · {вГороде ? t("ad_in_city") : t("ad_on_route")}
                  </span>
                )}
              </div>
              <p className="font-bold leading-tight" style={{ color: текст, fontSize: 17, fontFamily: "'Fraunces',serif" }}>
                {трК(ad.title)}
              </p>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: текст, opacity: 0.82 }}>
                {трК(ad.sub)}
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 px-4 pb-4">
            <span className="min-w-0 flex-1 truncate text-[9px]" style={{ color: текст, opacity: 0.6 }}>
              {t("ad_why")}
            </span>
            <span
              className="flex-shrink-0 rounded-xl px-3.5 py-2 text-[11px] font-bold"
              style={{
                background: текст === WHITE ? WHITE : "#14201d",
                color: текст === WHITE ? "#14201d" : WHITE,
              }}
            >
              {трК(ad.cta)} <span className="rtl-flip inline-block">→</span>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * Полка товаров — те креативы, что не привязаны к городу.
 *
 * Выглядит как обычная подборка приложения: горизонтальная лента
 * маленьких карточек. Именно поэтому её листают, а не пролистывают.
 */
export function AdShelf({ isPremium }: { isPremium: boolean }) {
  const { t, трК } = useT();
  const ads = useКреативы();
  const товары = ads.filter((a) => !a.city);
  if (isPremium || товары.length === 0) return null;
  return (
    <div className="pt-5">
      <div className="mb-3 flex items-center gap-2 px-4">
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          🎒 {t("ad_shelf_title")}
        </p>
        <Пометка тёмный={false} />
      </div>
      <div className="hide-scroll flex gap-2.5 overflow-x-auto px-4 pb-1">
        {товары.map((ad) => (
          <button
            key={ad.id ?? ad.title}
            onClick={() => перейти(ad)}
            className="flex w-[138px] flex-shrink-0 flex-col rounded-2xl border p-3 text-left transition-all active:scale-95"
            style={{ background: SURFACE, borderColor: BORDER }}
          >
            <span
              className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ background: мягко(ad.color, 12) }}
            >
              {ad.emoji}
            </span>
            <p className="truncate text-xs font-bold" style={{ color: TEXT }}>
              {трК(ad.title)}
            </p>
            <p
              className="mt-0.5 overflow-hidden text-[10px] leading-snug"
              style={{ color: MUTED, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
            >
              {трК(ad.sub)}
            </p>
            <span className="mt-2 text-[10px] font-bold" style={{ color: ad.color }}>
              {трК(ad.cta)} <span className="rtl-flip inline-block">→</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Полноэкранная видео-реклама (interstitial).
 *
 * Выскакивает поверх всего на переходах между экранами — но не сразу и
 * не на каждом: частоту задаёт владелец в панели (раз в N минут и на
 * каждый N-й переход), и оба условия должны совпасть. Premium её не
 * видит вовсе.
 *
 * Показываются только объявления, у которых есть ролик: ничего не
 * выдумываем, нет видео — нет и полного экрана. Кнопка «Пропустить»
 * появляется через заданные секунды, до этого — честный обратный отсчёт.
 * Пометка «Реклама» видна с первой секунды.
 *
 * Звук: пробуем со звуком (показ идёт сразу за касанием — жест ещё в
 * силе), а если браузер заглушил — играем без звука и предлагаем
 * включить кнопкой.
 */
const КЛЮЧ_ПОСЛЕДНИЙ = "uz_interstitial_last";

export function AdInterstitial({
  isPremium,
  navCount,
  cities,
}: {
  isPremium: boolean;
  navCount: number;
  cities?: string[];
}) {
  const { t, трК } = useT();
  // Берём напрямую живые объявления с роликом. Через useКреативы нельзя:
  // он отбрасывает объявления без ссылки перехода, а видео-рекламе она
  // не обязательна — ролик может просто играть, без клика по сайту.
  const { ADS: live } = useAppContent();
  const ролики = useMemo(() => {
    const свидео = (live as Креатив[]).filter((a) => a.videoUrl);
    const поГороду = свидео.filter(
      (a) => !a.city || !cities || cities.length === 0 || cities.includes(a.city),
    );
    // По городу ничего не нашлось — показываем любой ролик, а не пусто.
    return поГороду.length ? поГороду : свидео;
  }, [live, cities]);
  const [политика, setПолитика] = useState<AdPolicy | null>(null);
  const [текущее, setТекущее] = useState<Креатив | null>(null);
  const [осталось, setОсталось] = useState(0);
  const [звук, setЗвук] = useState(false);
  const видеоRef = useRef<HTMLVideoElement | null>(null);

  // Правило показа берём один раз с сервера. Не пришло — молчим, рекламу
  // не крутим (лучше не показать, чем показать против настройки).
  useEffect(() => {
    let жив = true;
    fetch("/api/ad-policy")
      .then((r) => (r.ok ? r.json() : null))
      .then((p: AdPolicy | null) => жив && p && setПолитика(p))
      .catch(() => undefined);
    return () => {
      жив = false;
    };
  }, []);

  const закрыть = useCallback(() => setТекущее(null), []);

  // Решение о показе — на каждый новый переход.
  useEffect(() => {
    if (текущее) return; // уже висит — не накладываем второй
    if (isPremium || !политика || !политика.fullscreen || ролики.length === 0) return;
    if (navCount <= 0 || navCount % политика.everyNav !== 0) return;

    let последний = 0;
    try {
      последний = Number(localStorage.getItem(КЛЮЧ_ПОСЛЕДНИЙ) || 0);
    } catch {
      /* приватный режим — считаем, что не показывали */
    }
    if (политика.everyMinutes > 0 && Date.now() - последний < политика.everyMinutes * 60_000) return;

    const ad = ролики[Math.floor(Math.random() * ролики.length)];
    setТекущее(ad);
    setЗвук(false);
    setОсталось(Math.max(0, Math.round(ad.skipAfter ?? 5)));
    try {
      localStorage.setItem(КЛЮЧ_ПОСЛЕДНИЙ, String(Date.now()));
    } catch {
      /* не смогли запомнить — не страшно, покажем в следующий раз по счётчику */
    }
    // navCount в зависимостях: показ привязан к переходу.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navCount]);

  // Обратный отсчёт до кнопки «Пропустить».
  useEffect(() => {
    if (!текущее || осталось <= 0) return;
    const id = setTimeout(() => setОсталось((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [текущее, осталось]);

  // Заводим ролик: сперва со звуком, при отказе — без и с кнопкой.
  useEffect(() => {
    const v = видеоRef.current;
    if (!текущее || !v) return;
    v.muted = false;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        v.muted = true;
        setЗвук(false);
        v.play().catch(() => undefined);
      });
    }
    setЗвук(!v.muted);
  }, [текущее]);

  if (!текущее) return null;
  const ad = текущее;

  const включитьЗвук = () => {
    const v = видеоRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => undefined);
    setЗвук(true);
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col" style={{ background: "#000" }}>
      <video
        ref={видеоRef}
        src={ad.videoUrl}
        poster={undefined}
        loop
        playsInline
        autoPlay
        onClick={() => перейти(ad)}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Затемнение снизу — под подпись и кнопку, чтобы читались на любом кадре. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
      />

      {/* Верх: пометка «Реклама» слева, «Пропустить»/отсчёт справа. */}
      <div className="relative flex items-start justify-between p-4 device-safe-top">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
          style={{ letterSpacing: "0.14em", background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
        >
          {t("ad_label")}
        </span>

        {осталось > 0 ? (
          <span
            className="flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-bold"
            style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
          >
            {t("ad_skip_in")} {осталось}
          </span>
        ) : (
          <button
            onClick={закрыть}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.95)", color: "#14201d" }}
          >
            {t("ad_skip")} <span className="rtl-flip inline-block">✕</span>
          </button>
        )}
      </div>

      {/* Кнопка звука — только пока играем без него. */}
      {!звук && (
        <button
          onClick={включитьЗвук}
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-95"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(8px)" }}
        >
          🔊 {t("ad_sound_on")}
        </button>
      )}

      {/* Низ: рекламодатель, текст и кнопка перехода. */}
      <div className="relative mt-auto p-4 device-safe-bottom">
        <p className="mb-0.5 text-[11px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" }}>
          {трК(ad.label)}
        </p>
        <p className="mb-2 text-xl font-bold leading-tight" style={{ color: "#fff", fontFamily: "'Fraunces',serif" }}>
          {трК(ad.title)}
        </p>
        <button
          onClick={() => перейти(ad)}
          className="w-full rounded-2xl py-3 text-sm font-bold transition-all active:scale-[0.98]"
          style={{ background: ad.color, color: контрастныйТекст(ad.color) }}
        >
          {трК(ad.cta)} <span className="rtl-flip inline-block">→</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Узкая строка для экранов, где крупной карточке не место (список
 * ресторанов, практическая информация). Тот же смысл, меньше места.
 */
export function AdInline({ isPremium, cities }: { isPremium: boolean; cities?: string[] }) {
  const { трК } = useT();
  const ads = useКреативы(cities);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 1000));
  const [скрыт, setСкрыт] = useState(false);
  useEffect(() => {
    const таймер = setInterval(() => setIdx((i) => i + 1), 9000);
    return () => clearInterval(таймер);
  }, []);
  if (isPremium || скрыт || ads.length === 0) return null;
  const ad = ads[idx % ads.length];
  return (
    <div className="mx-4 mb-3">
      <div
        className="flex items-center gap-3 rounded-2xl border px-3 py-2.5"
        style={{ background: SURFACE, borderColor: BORDER, borderLeft: `3px solid ${LIME}` }}
      >
        <button
          onClick={() => перейти(ad)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all active:scale-90"
          style={{ background: мягко(ad.color, 12) }}
        >
          {ad.emoji}
        </button>
        <button onClick={() => перейти(ad)} className="min-w-0 flex-1 text-left">
          <div className="mb-0.5 flex items-center gap-1.5">
            <Пометка тёмный={false} />
          </div>
          <p className="text-xs font-bold leading-tight" style={{ color: TEXT }}>
            {трК(ad.title)}
          </p>
          <p className="mt-0.5 truncate text-[10px]" style={{ color: MUTED }}>
            {трК(ad.sub)}
          </p>
        </button>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <button
            onClick={() => setСкрыт(true)}
            className="px-1 text-[10px] transition-all active:scale-90"
            style={{ color: MUTED }}
          >
            ✕
          </button>
          <button
            onClick={() => перейти(ad)}
            className="rounded-lg px-2.5 py-1 text-[9px] font-bold transition-all active:scale-95"
            style={{ background: ad.color, color: контрастныйТекст(ad.color) }}
          >
            {трК(ad.cta)}
          </button>
        </div>
      </div>
    </div>
  );
}
