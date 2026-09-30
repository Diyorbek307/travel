"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LOGO_D, LOGO_GOLD, LOGO_H, LOGO_SWOOSH } from "./ui";
import { маска, посадкаНаШапку } from "./intro-cinematic";

/**
 * Короткая заставка для тех, кто уже с нами.
 *
 * Полный пролёт над городами хорош один раз. Дальше человек открывает
 * приложение по делу, поэтому ему — пара секунд: на чёрном фоне знак
 * прорисовывается контуром, наливается фирменным цветом и светится,
 * по нему пробегает блик, и он садится на логотип в шапке главной.
 *
 * Пропуска касанием нет: три секунды не успевают надоесть, а так знак
 * всегда долетает до шапки.
 *
 * Финал тот же, что у полной заставки: белый знак с неоновым свечением.
 * Он есть в любом варианте — и при «уменьшить движение», где вместо
 * анимации сразу стоит светящийся знак (задержки анимаций там не
 * сокращаются, и раньше знак просто не успевал появиться).
 */

/** Реперы времени, мс. */
const ЗАЛИВКА = 700; // контур уже почти прорисован — знак наливается цветом
const БЕЛЫЙ = 1250; // знак белеет и загорается неоном, как в полной заставке
const БЛИК = 1700;
const ПОСАДКА = 2600; // светящийся знак летит в шапку
/** При «уменьшить движение» — столько стоит неподвижный светящийся знак. */
const ТИХО_ДЕРЖАТЬ = 1200;
/** Сколько ещё ждать шапку, если главная не успела отрисоваться. */
const ЖДАТЬ_ШАПКУ = 1500;
const УХОД = 700;

export default function IntroLogo({ onDone }: { onDone: () => void }) {
  const id = useId().replace(/:/g, "");
  const [уходит, setУходит] = useState(false);
  const [посадка, setПосадка] = useState<{ origin: string; transform: string } | null>(null);
  const [S, setS] = useState(160);
  const [тихо, setТихо] = useState(false);
  const белыйRef = useRef<SVGSVGElement | null>(null);
  const старт = useRef(0);
  const завершено = useRef(false);
  const тихоRef = useRef(false);
  тихоRef.current = тихо;

  const финиш = useRef(() => {});
  финиш.current = () => {
    if (завершено.current) return;
    завершено.current = true;
    // Садимся, только если знак успел проявиться; при «уменьшить
    // движение» заставка короче — тогда просто растворяемся. Смотрим на
    // часы, а не на ход анимации: её браузер может начать чуть позже
    // таймера.
    const проявился = тихоRef.current || performance.now() - старт.current >= БЛИК;
    const путь = проявился && белыйRef.current ? посадкаНаШапку(белыйRef.current) : null;
    if (путь) setПосадка(путь);
    setУходит(true);
    window.setTimeout(onDone, УХОД);
  };

  useEffect(() => {
    старт.current = performance.now();
    setS(Math.round(Math.min(window.innerWidth * 0.42, window.innerHeight * 0.3, 200)));
    document.documentElement.classList.add("intro-landing");

    const мало = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (мало) {
      setТихо(true);
      const t = window.setTimeout(() => финиш.current(), ТИХО_ДЕРЖАТЬ);
      return () => {
        window.clearTimeout(t);
        document.documentElement.classList.remove("intro-landing");
      };
    }

    // Главная могла ещё не отрисоваться — тогда ждём шапку понемногу,
    // но не дольше ЖДАТЬ_ШАПКУ, чтобы человек не смотрел на чёрный экран.
    let ждём = 0;
    let t = 0;
    const попробовать = () => {
      const есть = document.querySelector("[data-brand-logo]");
      if (есть || ждём >= ЖДАТЬ_ШАПКУ) return финиш.current();
      ждём += 100;
      t = window.setTimeout(попробовать, 100);
    };
    t = window.setTimeout(попробовать, ПОСАДКА);
    return () => {
      window.clearTimeout(t);
      document.documentElement.classList.remove("intro-landing");
    };
  }, []);

  const плавно = `${УХОД}ms cubic-bezier(.5,.1,.25,1)`;
  const сек = (мс: number) => `${мс / 1000}s`;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" aria-label="HelloUZ">
      <div
        className="absolute inset-0"
        style={{ background: "#000", opacity: уходит ? 0 : 1, transition: `opacity ${плавно}` }}
      />

      {/* Обёртка посадки: в конце вся группа летит в логотип шапки. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transformOrigin: посадка?.origin ?? "50% 50%",
          transform: уходит && посадка ? посадка.transform : "none",
          opacity: уходит && !посадка ? 0 : 1,
          transition: `transform ${плавно}, opacity ${плавно}`,
          willChange: "transform",
        }}
      >
        <div
          className="absolute"
          style={{ left: "50%", top: "50%", width: S, height: S, marginLeft: -S / 2, marginTop: -S / 2 }}
        >
          {/* Свечение позади знака: бирюза, уходящая в золото. */}
          <div
            className="absolute"
            style={{
              inset: -S * 0.3,
              opacity: уходит ? 0 : undefined,
              transition: `opacity ${плавно}`,
              animation: `intro-white .9s ease ${сек(ЗАЛИВКА + 200)} both`,
            }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background: `radial-gradient(circle, #2FD0C680 0%, ${LOGO_GOLD}33 42%, transparent 68%)`,
                filter: "blur(30px)",
                animation: `intro-neon 2.4s ease-in-out ${сек(ЗАЛИВКА + 200)} infinite`,
              }}
            />
          </div>

          {/* Белое неоновое свечение — как у полной заставки; ложится поверх
              бирюзового, и знак горит белым, а не голубым. */}
          <div
            className="absolute"
            style={{
              inset: -S * 0.3,
              opacity: уходит ? 0 : тихо ? 1 : undefined,
              transition: `opacity ${плавно}`,
              animation: тихо ? "none" : `intro-white .7s ease ${сек(БЕЛЫЙ)} both`,
            }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background: "radial-gradient(circle, #ffffffd9 0%, #ffffff66 34%, transparent 66%)",
                filter: "blur(28px)",
                animation: тихо ? "none" : `intro-neon 2.4s ease-in-out ${сек(БЕЛЫЙ)} infinite`,
                willChange: "transform, opacity",
              }}
            />
          </div>

          {/* Знак в фирменных цветах — наливается после контура. */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            style={{
              overflow: "visible",
              opacity: 0,
              // Цветной знак гаснет, когда загорается белый: его бирюзовая
              // тень иначе подкрашивала белое неоновое свечение.
              display: тихо ? "none" : undefined,
              animation: `intro-fill .8s ease ${сек(ЗАЛИВКА)} both, intro-unfill .5s ease ${сек(БЕЛЫЙ + 300)} forwards`,
              filter: "drop-shadow(0 0 10px #2FD0C699)",
            }}
          >
            <defs>
              <linearGradient id={`${id}h`} x1="0.1" y1="0.95" x2="0.9" y2="0.05">
                <stop offset="0" stopColor="#0FB3AC" />
                <stop offset="1" stopColor="#8AE9E0" />
              </linearGradient>
              <linearGradient id={`${id}s`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#2FD0C6" />
                <stop offset="1" stopColor={LOGO_GOLD} />
              </linearGradient>
            </defs>
            <path d={LOGO_H} fill={`url(#${id}h)`} />
            <path d={LOGO_SWOOSH} fill={`url(#${id}s)`} />
          </svg>

          {/* Белый светящийся знак — таким он и сядет в шапку. */}
          <svg
            ref={белыйRef}
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            style={{
              overflow: "visible",
              opacity: тихо ? 1 : 0,
              animation: тихо ? "none" : `intro-white .6s ease ${сек(БЕЛЫЙ)} both`,
            }}
          >
            <path
              d={LOGO_D}
              fill="#ffffff"
              style={{
                filter: уходит
                  ? "drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
                  : "drop-shadow(0 0 4px #ffffffcc) drop-shadow(0 0 14px #ffffff66)",
                transition: `filter ${плавно}`,
              }}
            />
          </svg>

          {/* Блик — полоса света пробегает по знаку. */}
          <div
            className="absolute inset-0"
            style={{
              ...маска,
              background:
                "linear-gradient(110deg, transparent 38%, rgba(255,255,255,.9) 50%, transparent 62%)",
              backgroundSize: "260% 100%",
              opacity: 0,
              animation: `intro-shimmer .7s ease-in-out ${сек(БЛИК)} both`,
            }}
          />

          {/* Контур: с него всё начинается. */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible", opacity: уходит ? 0 : 1, transition: `opacity ${плавно}` }}
          >
            <path
              d={LOGO_D}
              fill="none"
              stroke="#8AE9E0"
              strokeWidth={0.9}
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
                filter: "drop-shadow(0 0 5px #2FD0C6cc)",
                // Бирюзовый контур гаснет вместе с цветным знаком — дальше
                // горит только белый неон.
                display: тихо ? "none" : undefined,
                animation: `intro-draw 1s ease .15s forwards, intro-unfill .5s ease ${сек(БЕЛЫЙ + 300)} forwards`,
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
