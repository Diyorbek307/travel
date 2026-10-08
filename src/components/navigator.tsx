"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RealMap from "@/components/real-map";
import { useT } from "@/components/lang-provider";
import { useДистанция } from "@/lib/distance";
import { useSettings } from "@/lib/settings";
import type { Locale } from "@/lib/i18n";
import type { Маршрут, Шаг } from "@/lib/routing";
import {
  круглыеМетры,
  местаШагов,
  метрыМежду,
  накопленные,
  положение,
  пораСказать,
  привязать,
  сбился,
  type Способ,
} from "@/lib/navigation";
import { ACCENT_FILL, BORDER, CREAM, GOLD, GREEN, MUTED, ON_GOLD, SURFACE, TEXT, WHITE } from "@/lib/theme";
import type { Geo } from "@/lib/types";

/**
 * Навигатор внутри приложения: ведёт по шагам, как Яндекс Навигатор, —
 * «через 150 м поверните направо», — и никуда не уводит.
 *
 * Положение берём из GPS телефона раз в секунду, привязываем к линии
 * дороги и считаем, сколько осталось до следующего поворота. Голос
 * говорит заранее и в самый момент. Ушёл с дороги дальше допуска —
 * маршрут пересчитывается от того места, где человек сейчас.
 *
 * Голос — синтез речи самого телефона. В браузерах он есть, а во
 * встроенном окне Android-приложения его может не оказаться; тогда
 * переключателя голоса просто нет, а на поворотах телефон вибрирует.
 */

const КОД_РЕЧИ: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
  uz: "uz-UZ",
  zh: "zh-CN",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  ja: "ja-JP",
  tr: "tr-TR",
  ar: "ar-SA",
};
const КЛЮЧ_ГОЛОСА = "uzup.nav.voice";

/** Цель достигнута, когда до неё осталось столько метров. */
const ПРИБЫЛИ: Record<Способ, number> = { пешком: 20, авто: 35 };
/** Пересчитываем не чаще, чем раз в столько: общий сервер просит бережности. */
const ПЕРЕСЧЁТ_МС = 10_000;

function Стрелка({ шаг, размер = 44 }: { шаг: Шаг | undefined; размер?: number }) {
  const м = шаг?.манёвр ?? "финиш";
  const влево = м === "налево" || м === "плавно-налево" || м === "резко-налево" || м === "левее";
  const путь: Record<string, string> = {
    прямо: "M12 21V4 M6 10l6-6 6 6",
    поворот: "M7 21v-8a4 4 0 0 1 4-4h8 M15 5l4 4-4 4",
    плавно: "M8 21v-6.5l8.5-8.5 M10.5 6H16.5v6",
    резко: "M8 21V5 M8 5l9 9 M17 8v6h-6",
    разворот: "M7 21V10a5 5 0 0 1 10 0v5 M13 12l4 4 4-4",
    финиш: "M6 21V4 M6 4h11l-2.5 4 2.5 4H6",
  };
  const вид =
    м === "налево" || м === "направо"
      ? "поворот"
      : м === "плавно-налево" || м === "плавно-направо" || м === "левее" || м === "правее"
        ? "плавно"
        : м === "резко-налево" || м === "резко-направо"
          ? "резко"
          : м === "разворот"
            ? "разворот"
            : м === "финиш"
              ? "финиш"
              : "прямо";
  return (
    <svg
      width={размер}
      height={размер}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      // Налево — зеркало направо. Для арабского не переворачиваем:
      // лево на дороге остаётся левом при любом письме.
      style={{ transform: влево ? "scaleX(-1)" : undefined }}
    >
      {м === "кольцо" ? (
        <>
          <circle cx="12" cy="10" r="4.2" />
          <path d="M12 21v-6.8 M15 7l4-4 M15 3h4v4" />
        </>
      ) : (
        <path d={путь[вид]} />
      )}
    </svg>
  );
}

export default function Навигатор({
  дорога: начальная,
  откуда: старт,
  цель,
  название,
  способ,
  onStop,
}: {
  дорога: Маршрут;
  откуда: Geo;
  цель: Geo;
  название: string;
  способ: Способ;
  onStop: () => void;
}) {
  const { t, трК, lang } = useT();
  const дист = useДистанция();
  const { units } = useSettings();
  const [дорога, setДорога] = useState(начальная);
  const [позиция, setПозиция] = useState<Geo>(старт);
  const [точность, setТочность] = useState(30);
  const [естьGps, setЕстьGps] = useState(false);
  const [перестраиваем, setПерестраиваем] = useState(false);
  const [неПерестроили, setНеПерестроили] = useState(false);
  const [прибыли, setПрибыли] = useState(false);
  const [голосЕсть, setГолосЕсть] = useState(false);
  const [голос, setГолос] = useState(true);

  const сказано = useRef(new Set<string>());
  const пройденоРаньше = useRef(0);
  const мимо = useRef(0);
  const последнийПересчёт = useRef(0);

  // Где на дороге каждый поворот — считаем раз на маршрут, а не на каждый сигнал GPS.
  const линия = useMemo(() => {
    const накоп = накопленные(дорога.точки);
    return { накоп, места: местаШагов(дорога.точки, накоп, дорога.шаги), всего: накоп[накоп.length - 1] ?? 0 };
  }, [дорога]);

  const привязка = привязать(дорога.точки, линия.накоп, позиция, пройденоРаньше.current);
  const где = положение(линия.места, линия.всего, привязка.пройдено);
  const шаг: Шаг | undefined = дорога.шаги[где.следующий];
  const доЦели = метрыМежду(позиция, цель);

  /* ---------- слова ---------- */

  const заглавная = (с: string) => с.charAt(0).toLocaleUpperCase(lang) + с.slice(1);

  function действие(ш: Шаг | undefined): string {
    switch (ш?.манёвр) {
      case "налево":
        return t("nav_left");
      case "направо":
        return t("nav_right");
      case "плавно-налево":
        return t("nav_slight_left");
      case "плавно-направо":
        return t("nav_slight_right");
      case "резко-налево":
        return t("nav_sharp_left");
      case "резко-направо":
        return t("nav_sharp_right");
      case "левее":
        return t("nav_keep_left");
      case "правее":
        return t("nav_keep_right");
      case "разворот":
        return t("nav_uturn");
      case "кольцо":
        return t("nav_roundabout").replace("{n}", String(ш.съезд ?? 1));
      case "прямо":
      case "старт":
        return t("nav_straight");
      default:
        return t("nav_arrive");
    }
  }

  /** Расстояние для глаз: «150 м», «1.2 км», «500 фт». */
  function метрыНаЭкран(м: number): string {
    if (units === "imperial") {
      const фт = м * 3.28084;
      if (фт < 1000) return t("nav_ft").replace("{n}", String(Math.max(50, Math.round(фт / 50) * 50)));
      return дист.формат(м / 1000);
    }
    if (м < 1000) return t("nav_m").replace("{n}", String(круглыеМетры(м)));
    return дист.формат(м / 1000);
  }

  /** Расстояние для голоса: «150 метров» — сокращение «м» синтез читает плохо. */
  function метрыВслух(м: number): string {
    if (units === "imperial") {
      const фт = м * 3.28084;
      if (фт < 1000) return t("nav_ft_spoken").replace("{n}", String(Math.max(50, Math.round(фт / 50) * 50)));
      return дист.формат(м / 1000);
    }
    if (м < 1000) return t("nav_m_spoken").replace("{n}", String(круглыеМетры(м)));
    return дист.формат(м / 1000);
  }

  /* ---------- голос ---------- */

  useEffect(() => {
    const есть = typeof window !== "undefined" && "speechSynthesis" in window;
    setГолосЕсть(есть);
    try {
      if (localStorage.getItem(КЛЮЧ_ГОЛОСА) === "off") setГолос(false);
    } catch {
      // Приватный режим — голос просто включён.
    }
  }, []);

  const голосРеф = useRef(голос);
  голосРеф.current = голос;

  function сказать(текст: string) {
    if (!голосРеф.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const синтез = window.speechSynthesis;
    const голоса = синтез.getVoices();
    const свой = голоса.find((г) => г.lang.replace("_", "-").toLowerCase().startsWith(lang));
    // Голоса этого языка в телефоне нет — молчим: английский голос,
    // читающий узбекские слова, только запутает.
    if (голоса.length > 0 && !свой) return;
    const фраза = new SpeechSynthesisUtterance(текст);
    фраза.lang = КОД_РЕЧИ[lang];
    if (свой) фраза.voice = свой;
    синтез.cancel();
    синтез.speak(фраза);
  }

  function переключитьГолос() {
    const новое = !голос;
    setГолос(новое);
    if (!новое) window.speechSynthesis?.cancel();
    try {
      localStorage.setItem(КЛЮЧ_ГОЛОСА, новое ? "on" : "off");
    } catch {
      // Не сохранилось — до конца поездки всё равно работает.
    }
  }

  /* ---------- GPS и экран ---------- */

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setПозиция({ lat: p.coords.latitude, lon: p.coords.longitude });
        setТочность(p.coords.accuracy || 30);
        setЕстьGps(true);
      },
      () => setЕстьGps(false),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Экран не гаснет, пока ведём: иначе в кармане подсказка не видна, а
  // на руле телефон засыпает посреди перекрёстка.
  useEffect(() => {
    let замок: { release: () => Promise<void> } | null = null;
    const взять = async () => {
      try {
        const wl = (navigator as Navigator & { wakeLock?: { request: (т: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        замок = (await wl?.request("screen")) ?? null;
      } catch {
        // Браузер не разрешил — обойдёмся.
      }
    };
    void взять();
    const снова = () => {
      if (document.visibilityState === "visible") void взять();
    };
    document.addEventListener("visibilitychange", снова);
    return () => {
      document.removeEventListener("visibilitychange", снова);
      void замок?.release().catch(() => undefined);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Первая фраза — сразу после нажатия «Начать».
  useEffect(() => {
    сказать(t("nav_go"));
    // Только при старте.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- ведение ---------- */

  async function перестроить(откуда: Geo) {
    последнийПересчёт.current = Date.now();
    setПерестраиваем(true);
    setНеПерестроили(false);
    try {
      const ответ = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: откуда, to: цель, mode: способ }),
      });
      const д = (await ответ.json()) as { available?: boolean; route?: Маршрут | null };
      if (д.available && д.route && д.route.точки.length >= 2) {
        сказано.current = new Set();
        пройденоРаньше.current = 0;
        мимо.current = 0;
        setДорога({ ...д.route, шаги: д.route.шаги ?? [] });
      } else {
        setНеПерестроили(true);
      }
    } catch {
      setНеПерестроили(true);
    } finally {
      setПерестраиваем(false);
    }
  }

  useEffect(() => {
    if (!естьGps || прибыли) return;

    // Приехали — по расстоянию до самой цели или до конца линии.
    if (доЦели <= ПРИБЫЛИ[способ] || (где.осталось <= 15 && доЦели < 80)) {
      setПрибыли(true);
      сказать(t("nav_arrived"));
      navigator.vibrate?.([120, 80, 120]);
      return;
    }

    // Сбился с дороги дважды подряд — один шальной сигнал GPS не повод.
    if (сбился(привязка.отЛинии, точность, способ)) {
      мимо.current++;
      if (мимо.current >= 2 && !перестраиваем && Date.now() - последнийПересчёт.current > ПЕРЕСЧЁТ_МС) {
        сказать(t("nav_rerouting"));
        void перестроить(позиция);
      }
      return;
    }
    мимо.current = 0;
    пройденоРаньше.current = Math.max(пройденоРаньше.current, привязка.пройдено);

    const длина = (линия.места[где.следующий] ?? линия.всего) - (линия.места[где.следующий - 1] ?? 0);
    const пора = пораСказать(способ, где.следующий, где.доМанёвра, длина, сказано.current);
    if (!пора) return;
    сказано.current.add(`${где.следующий}|${пора.порог}`);
    if (пора.сейчас) {
      // Финиш «прямо сейчас» объявляет проверка прибытия выше.
      if (шаг?.манёвр === "финиш" || !шаг) return;
      сказать(заглавная(действие(шаг)));
      navigator.vibrate?.(200);
    } else {
      сказать(t("nav_in").replace("{d}", метрыВслух(где.доМанёвра)).replace("{a}", действие(шаг)));
    }
    // Считаем заново на каждый сигнал GPS и на новый маршрут.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [позиция, дорога, естьGps]);

  /* ---------- экран ---------- */

  const осталосьСек = линия.всего > 0 ? (дорога.секунды * где.осталось) / линия.всего : 0;
  const минут = Math.max(1, Math.round(осталосьСек / 60));
  const времяСловами =
    минут < 60
      ? `${минут} ${t("common_min")}`
      : `${Math.floor(минут / 60)} ${t("common_h")}${минут % 60 ? ` ${минут % 60} ${t("common_min")}` : ""}`;
  const прибытие = new Date(Date.now() + осталосьСек * 1000).toLocaleTimeString(lang, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const точки = useMemo(() => [{ geo: цель, подпись: название, главная: true }], [цель, название]);

  return (
    <div className="flex h-full flex-col" style={{ background: CREAM }}>
      {/* Подсказка о повороте — главное на экране, крупно и контрастно. */}
      <div className="px-3 pt-12 pb-3" style={{ background: ACCENT_FILL, color: WHITE }}>
        {прибыли ? (
          <div className="flex items-center gap-3 px-1 py-2">
            <Стрелка шаг={undefined} />
            <div>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {t("nav_arrived")}
              </p>
              <p className="text-sm opacity-85">{трК(название)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1 py-1" aria-live="polite">
            <Стрелка шаг={шаг} />
            <div className="min-w-0 flex-1">
              <p className="text-3xl leading-none font-bold tabular-nums" style={{ fontFamily: "var(--font-heading)" }}>
                {естьGps ? метрыНаЭкран(где.доМанёвра) : "…"}
              </p>
              <p className="mt-1 text-base leading-snug font-semibold">
                {естьGps ? заглавная(действие(шаг)) : t("nav_waiting_gps")}
              </p>
              {шаг?.улица && шаг.манёвр !== "финиш" && (
                <p className="truncate text-sm opacity-85">{t("nav_onto").replace("{s}", шаг.улица)}</p>
              )}
            </div>
          </div>
        )}
        {(перестраиваем || неПерестроили) && !прибыли && (
          <p className="mt-2 rounded-xl px-3 py-1.5 text-xs font-semibold" style={{ background: "rgba(255,255,255,0.16)" }}>
            {перестраиваем ? t("nav_rerouting") : t("nav_reroute_failed")}
          </p>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <RealMap
            высота="100%"
            откуда={позиция}
            фокус={позиция}
            зумФокуса={способ === "пешком" ? 17 : 16}
            путь={дорога.точки}
            точки={точки}
            приблизить={false}
          />
        </div>
      </div>

      <div className="border-t px-4 pt-3 pb-6" style={{ background: SURFACE, borderColor: BORDER }}>
        {!прибыли && (
          <div className="mb-3 flex items-end gap-5">
            <div>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: MUTED }}>
                {t("nav_left_total")}
              </p>
              <p className="text-lg font-bold" style={{ color: TEXT }}>
                {дист.формат(где.осталось / 1000)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: MUTED }}>
                {способ === "пешком" ? t("route_mode_walk") : t("route_mode_car")}
              </p>
              <p className="text-lg font-bold" style={{ color: TEXT }}>
                {времяСловами}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: MUTED }}>
                {t("nav_eta")}
              </p>
              <p className="text-lg font-bold tabular-nums" style={{ color: TEXT }}>
                {прибытие}
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          {голосЕсть && (
            <button
              onClick={переключитьГолос}
              className="rounded-2xl border px-4 py-3 text-sm font-bold"
              style={{ borderColor: голос ? GREEN : BORDER, color: голос ? GREEN : MUTED, background: SURFACE }}
              aria-pressed={голос}
            >
              {голос ? "🔊" : "🔇"} {t("nav_voice")}
            </button>
          )}
          <button
            onClick={onStop}
            className="flex-1 rounded-2xl py-3 text-sm font-bold"
            style={прибыли ? { background: ACCENT_FILL, color: WHITE } : { background: GOLD, color: ON_GOLD }}
          >
            {t("nav_stop")}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px]" style={{ color: MUTED }}>
          {t("nav_keep_screen")} · {дорога.источник}
          {дорога.исправить && (
            <>
              {" · "}
              <a href={дорога.исправить} target="_blank" rel="noopener noreferrer" className="underline">
                {t("nav_fix_map")}
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
