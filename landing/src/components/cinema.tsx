"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Приёмы «кинематографичных» сайтов, собранные в одном месте:
 *
 * - Слова — заголовок проявляется по словам из размытия (как у Orven);
 * - useПрокрутка — плавный прогресс прокрутки блока для сцен «на липучке»;
 * - Шахматка — шов между светлым и тёмным блоком, который рассыпается
 *   на клетки, как клетчатый флаг на сайте пилота F1, только клетки —
 *   изразцы, и некоторые вспыхивают бирюзой;
 * - Контуры — медленно текущие линии рельефа на фоне финала.
 *
 * Всё уважает «уменьшить движение» и засыпает, когда блок вне экрана.
 */

export const ТИХО = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ограничить = (x: number, от = 0, до = 1) => Math.min(до, Math.max(от, x));
/** Доля пути x между a и b, 0…1. */
export const доля = (x: number, a: number, b: number) => ограничить((x - a) / (b - a));

/** Следит, попал ли элемент в кадр. С once — срабатывает один раз. */
export function useВКадре<T extends Element>(once = true, margin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [видно, setВидно] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setВидно(true);
          if (once) io.disconnect();
        } else if (!once) setВидно(false);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin]);
  return [ref, видно] as const;
}

/**
 * Текст, который проявляется по словам: из размытия, снизу вверх,
 * лесенкой. «уход» — обратное: слова растворяются вверх.
 * Для читалок экрана — обычная строка в aria-label.
 */
export function Слова({
  текст,
  className = "",
  шаг = 0.05,
  задержка = 0,
  видно,
  уход = false,
}: {
  текст: string;
  className?: string;
  шаг?: number;
  задержка?: number;
  /** Если не задано — проявляется сам, когда попал в кадр. */
  видно?: boolean;
  уход?: boolean;
}) {
  const [ref, вКадре] = useВКадре<HTMLSpanElement>();
  const вкл = видно ?? вКадре;
  const слова = текст.split(/(\s+)/).filter((с) => с.trim());
  // Длинный текст проявляется без размытия: размытие на десятках слов
  // сразу — заметная нагрузка, а на абзаце разницы почти не видно.
  const лёгкий = слова.length > 12;
  return (
    <span
      ref={ref}
      className={`wr ${лёгкий ? "lite" : ""} ${вкл && !уход ? "on" : ""} ${уход ? "out" : ""} ${className}`}
      style={{ ["--st" as string]: `${шаг}s`, ["--d0" as string]: `${задержка}s` }}
    >
      <span className="sr-only">{текст}</span>
      {слова.map((с, i) => (
        <span key={i} aria-hidden className="w" style={{ ["--i" as string]: i }}>
          {с}
          {i < слова.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/**
 * Прогресс прокрутки «липкого» блока: 0 — верх блока у верха экрана,
 * 1 — блок докручен до конца. Плавность даёт сам Lenis, поэтому своего
 * сглаживания здесь нет (двойное сглаживание ощущается как «тормоза»):
 * считаем один раз на кадр и только когда страница действительно
 * прокручивается, а блок на экране.
 */
export function useПрокрутка(ref: React.RefObject<HTMLElement | null>, наКадр: (п: number) => void) {
  const колбэк = useRef(наКадр);
  колбэк.current = наКадр;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let кадр = 0;
    let виден = true;
    let прошлое = -1;
    const посчитать = () => {
      кадр = 0;
      const r = el.getBoundingClientRect();
      const путь = r.height - window.innerHeight;
      const п = путь > 0 ? ограничить(-r.top / путь) : ограничить(1 - r.top / window.innerHeight);
      if (п === прошлое) return;
      прошлое = п;
      колбэк.current(п);
    };
    const запросить = () => {
      if (виден && !кадр) кадр = requestAnimationFrame(посчитать);
    };
    const io = new IntersectionObserver(([e]) => {
      виден = e.isIntersecting;
      if (виден) запросить();
    });
    io.observe(el);
    window.addEventListener("scroll", запросить, { passive: true });
    window.addEventListener("resize", запросить);
    // Первый кадр — сразу, чтобы сцена не мигнула исходным состоянием.
    посчитать();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", запросить);
      window.removeEventListener("resize", запросить);
      cancelAnimationFrame(кадр);
    };
  }, [ref]);
}

/** Псевдослучайное число 0…1 для клетки — одно и то же при каждой отрисовке. */
const хэш = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Шов-шахматка. Кладётся в начало блока (absolute top-0): цвет
 * предыдущего блока заходит сюда сплошными рядами, ниже распадается
 * на шахматку и выгорает, пока блок поднимается к верху экрана.
 * Клетки у самой границы исчезновения сжимаются, а редкие вспыхивают
 * бирюзой — как выпавшие изразцы.
 */
export function Шахматка({
  цвет,
  искра = "#34dccf",
  высота = "34vh",
  className = "",
}: {
  цвет: string;
  искра?: string;
  высота?: string;
  className?: string;
}) {
  const холст = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = холст.current;
    const блок = c?.parentElement;
    if (!c || !блок) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let кадр = 0;
    let последний = -1;
    let ш = 0;
    let в = 0;
    const размер = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ш = c.clientWidth;
      в = c.clientHeight;
      c.width = Math.round(ш * dpr);
      c.height = Math.round(в * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      последний = -1;
    };
    const рисовать = (п: number) => {
      ctx.clearRect(0, 0, ш, в);
      const клетка = Math.max(16, Math.round(ш / 44));
      const столбцы = Math.ceil(ш / клетка);
      const ряды = Math.ceil(в / клетка);
      for (let r = 0; r < ряды; r++) {
        const y = r / Math.max(1, ряды - 1);
        for (let k = 0; k < столбцы; k++) {
          const чёт = (r + k) % 2 === 0 ? 0.13 : -0.13;
          const v = (1 - y) * 1.05 + чёт + (хэш(r, k) - 0.5) * 0.34 - п * 1.45;
          if (v <= 0.2) continue;
          const м = ограничить((v - 0.2) / 0.16);
          const сторона = клетка * (0.55 + 0.45 * м);
          const сдвиг = (клетка - сторона) / 2;
          ctx.fillStyle = м < 1 && хэш(k, r) > 0.86 ? искра : цвет;
          ctx.fillRect(k * клетка + сдвиг, r * клетка + сдвиг, сторона + 0.5, сторона + 0.5);
        }
      }
    };
    let виден = false;
    // Перерисовка — только при прокрутке и только пока шов на экране;
    // прогресс округляем до 1/120, чтобы не рисовать одно и то же.
    const посчитать = () => {
      кадр = 0;
      const r = блок.getBoundingClientRect();
      const п = Math.round(ограничить(1 - r.top / window.innerHeight) * 120) / 120;
      if (п !== последний) {
        последний = п;
        рисовать(п);
      }
    };
    const запросить = () => {
      if (виден && !кадр) кадр = requestAnimationFrame(посчитать);
    };
    размер();
    const ro = new ResizeObserver(() => {
      размер();
      запросить();
    });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      виден = e.isIntersecting;
      запросить();
    });
    io.observe(c);
    window.addEventListener("scroll", запросить, { passive: true });
    if (ТИХО()) рисовать(1);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", запросить);
      cancelAnimationFrame(кадр);
    };
  }, [цвет, искра]);
  return (
    <canvas
      ref={холст}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-[5] w-full ${className}`}
      style={{ height: высота, minHeight: 160 }}
    />
  );
}

/**
 * Линии рельефа, которые медленно текут: поле из четырёх синусоид,
 * изолинии строятся «бегущими квадратами» (marching squares) на сетке
 * ~64 клетки по длинной стороне. 18 кадров в секунду хватает — движение
 * очень медленное, а батарею бережём.
 */
export function Контуры({
  цвет = "rgba(255,255,255,0.1)",
  className = "",
}: {
  цвет?: string;
  className?: string;
}) {
  const холст = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = холст.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let ш = 0;
    let в = 0;
    let кадр = 0;
    let прошлое = 0;
    const старт = performance.now();
    const размер = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ш = c.clientWidth;
      в = c.clientHeight;
      c.width = Math.round(ш * dpr);
      c.height = Math.round(в * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const поле = (x: number, y: number, t: number) =>
      Math.sin(x * 2.1 + t * 0.21) +
      Math.sin(y * 2.7 - t * 0.17 + Math.sin(x * 0.9 + t * 0.1) * 0.9) +
      Math.sin((x + y) * 1.6 + t * 0.13) +
      Math.sin(Math.hypot(x - 1.4, y - 0.8) * 2.4 - t * 0.19);
    const уровни = [-2.25, -1.5, -0.75, 0, 0.75, 1.5, 2.25];
    const рисовать = (t: number) => {
      const n = 64;
      const шаг = Math.max(ш, в) / n;
      const кол = Math.ceil(ш / шаг) + 1;
      const ряд = Math.ceil(в / шаг) + 1;
      const м = 3.8 / Math.max(ш, в);
      const зн = new Float32Array(кол * ряд);
      for (let j = 0; j < ряд; j++)
        for (let i = 0; i < кол; i++) зн[j * кол + i] = поле(i * шаг * м, j * шаг * м, t);
      ctx.clearRect(0, 0, ш, в);
      ctx.strokeStyle = цвет;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const L of уровни) {
        for (let j = 0; j < ряд - 1; j++) {
          for (let i = 0; i < кол - 1; i++) {
            const a = зн[j * кол + i] - L;
            const b = зн[j * кол + i + 1] - L;
            const cc = зн[(j + 1) * кол + i + 1] - L;
            const d = зн[(j + 1) * кол + i] - L;
            const случай = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (cc > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
            if (случай === 0 || случай === 15) continue;
            const x = i * шаг;
            const y = j * шаг;
            const верх = [x + шаг * (a / (a - b)), y];
            const право = [x + шаг, y + шаг * (b / (b - cc))];
            const низ = [x + шаг * (d / (d - cc)), y + шаг];
            const лево = [x, y + шаг * (a / (a - d))];
            const отрезок = (p: number[], q: number[]) => {
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(q[0], q[1]);
            };
            switch (случай) {
              case 1:
              case 14:
                отрезок(лево, низ);
                break;
              case 2:
              case 13:
                отрезок(низ, право);
                break;
              case 3:
              case 12:
                отрезок(лево, право);
                break;
              case 4:
              case 11:
                отрезок(верх, право);
                break;
              case 5:
                отрезок(лево, верх);
                отрезок(низ, право);
                break;
              case 6:
              case 9:
                отрезок(верх, низ);
                break;
              case 7:
              case 8:
                отрезок(лево, верх);
                break;
              case 10:
                отрезок(лево, низ);
                отрезок(верх, право);
                break;
            }
          }
        }
      }
      ctx.stroke();
    };
    const цикл = (сейчас: number) => {
      if (сейчас - прошлое > 55) {
        прошлое = сейчас;
        рисовать((сейчас - старт) / 1000);
      }
      кадр = requestAnimationFrame(цикл);
    };
    размер();
    const ro = new ResizeObserver(() => {
      размер();
      рисовать((performance.now() - старт) / 1000);
    });
    ro.observe(c);
    const тихо = ТИХО();
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(кадр);
      кадр = 0;
      if (e.isIntersecting && !тихо) кадр = requestAnimationFrame(цикл);
    });
    io.observe(c);
    рисовать(0);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(кадр);
    };
  }, [цвет]);
  return (
    <canvas
      ref={холст}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
