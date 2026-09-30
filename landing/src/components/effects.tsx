"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./logo";
import { useЯзык } from "@/lib/i18n";

/**
 * Эффекты лендинга: заставка, курсор, «магнитные» кнопки, счёт цифр.
 * Всё уважает «уменьшить движение» и не мешает на телефоне.
 */

const ТИХО = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Заставка при первом входе за сессию: знак рисуется, счётчик бежит до
 * 100, шторка уезжает вверх. Пока она на экране, анимации первого экрана
 * стоят на паузе (класс intro-wait ставит скрипт в layout до отрисовки).
 */
export function Заставка() {
  const [показ, setПоказ] = useState(false);
  const [число, setЧисло] = useState(0);
  const [уходит, setУходит] = useState(false);

  useEffect(() => {
    if (!document.documentElement.classList.contains("intro-wait")) return;
    setПоказ(true);
    const старт = performance.now();
    const длина = ТИХО() ? 300 : 1500;
    let кадр = 0;
    const шаг = (сейчас: number) => {
      const п = Math.min(1, (сейчас - старт) / длина);
      setЧисло(Math.round((1 - Math.pow(1 - п, 3)) * 100));
      if (п < 1) кадр = requestAnimationFrame(шаг);
      else {
        setУходит(true);
        setTimeout(() => {
          document.documentElement.classList.remove("intro-wait");
          try {
            sessionStorage.setItem("hz.seen", "1");
          } catch {}
        }, 250);
        setTimeout(() => setПоказ(false), 1100);
      }
    };
    кадр = requestAnimationFrame(шаг);
    return () => cancelAnimationFrame(кадр);
  }, []);

  if (!показ) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-transform duration-[900ms]"
      style={{
        background: "var(--night)",
        transform: уходит ? "translateY(-100%)" : "none",
        transitionTimingFunction: "cubic-bezier(0.77,0,0.18,1)",
      }}
    >
      <div className="intro-logo">
        <Logo size={96} />
      </div>
      <p className="serif mt-6 text-2xl text-white/90">HelloUZ</p>
      <p className="condensed absolute bottom-8 right-8 text-7xl font-bold tabular-nums text-white/90 sm:text-9xl">
        {число}
      </p>
      <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-full" style={{ width: `${число}%`, background: "var(--gold)" }} />
      </div>
    </div>
  );
}

/** Свой курсор: точка и кольцо с запаздыванием; над ссылками кольцо растёт. */
export function Курсор() {
  const точка = useRef<HTMLDivElement>(null);
  const кольцо = useRef<HTMLDivElement>(null);
  const [есть, setЕсть] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || ТИХО()) return;
    setЕсть(true);
    const мышь = { x: -100, y: -100 };
    const тень = { x: -100, y: -100 };
    let над = false;
    const при = (e: PointerEvent) => {
      мышь.x = e.clientX;
      мышь.y = e.clientY;
      над = Boolean((e.target as HTMLElement)?.closest("a,button,[data-cursor]"));
    };
    let кадр = 0;
    const цикл = () => {
      тень.x += (мышь.x - тень.x) * 0.18;
      тень.y += (мышь.y - тень.y) * 0.18;
      if (точка.current) точка.current.style.transform = `translate(${мышь.x}px,${мышь.y}px)`;
      if (кольцо.current) {
        кольцо.current.style.transform = `translate(${тень.x}px,${тень.y}px) scale(${над ? 1.9 : 1})`;
        кольцо.current.style.opacity = над ? "0.9" : "0.55";
      }
      кадр = requestAnimationFrame(цикл);
    };
    window.addEventListener("pointermove", при);
    кадр = requestAnimationFrame(цикл);
    document.documentElement.classList.add("own-cursor");
    return () => {
      window.removeEventListener("pointermove", при);
      cancelAnimationFrame(кадр);
      document.documentElement.classList.remove("own-cursor");
    };
  }, []);
  if (!есть) return null;
  return (
    <>
      <div
        ref={кольцо}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-5 -mt-5 h-10 w-10 rounded-full border-2 transition-[opacity,scale] duration-200"
        style={{ borderColor: "var(--accent-ink)", mixBlendMode: "multiply" }}
      />
      <div
        ref={точка}
        className="pointer-events-none fixed left-0 top-0 z-[91] -ml-1 -mt-1 h-2 w-2 rounded-full"
        style={{ background: "var(--accent-ink)" }}
      />
    </>
  );
}

/** Кнопка слегка тянется к курсору — «магнит». */
export function Магнит({ children, сила = 0.3 }: { children: React.ReactNode; сила?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const двигать = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * сила}px, ${
      (e.clientY - r.top - r.height / 2) * сила
    }px)`;
  };
  return (
    <span
      ref={ref}
      onPointerMove={двигать}
      onPointerLeave={() => ref.current && (ref.current.style.transform = "")}
      className="inline-block transition-transform duration-300 ease-out"
    >
      {children}
    </span>
  );
}

/** Число «набегает» от нуля, когда попадает в кадр. */
export function Счёт({ до, знаков = 0 }: { до: number; знаков?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  // Формат по языку лендинга: 8,2 по-русски, 8.2 по-английски.
  const { язык } = useЯзык();
  const формат = new Intl.NumberFormat(`${язык}-u-nu-latn`, { minimumFractionDigits: знаков, maximumFractionDigits: знаков });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (ТИХО()) return setN(до);
    const наб = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      наб.disconnect();
      const старт = performance.now();
      const шаг = (t: number) => {
        const п = Math.min(1, (t - старт) / 1600);
        const м = 10 ** знаков;
        setN(Math.round((1 - Math.pow(1 - п, 4)) * до * м) / м);
        if (п < 1) requestAnimationFrame(шаг);
      };
      requestAnimationFrame(шаг);
    });
    наб.observe(el);
    return () => наб.disconnect();
  }, [до, знаков]);
  return <span ref={ref}>{формат.format(n)}</span>;
}

/** Тонкая полоса прочитанного сверху страницы: бирюза переходит в золото. */
export function Прогресс() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let кадр = 0;
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
      });
    };
    при();
    window.addEventListener("scroll", при, { passive: true });
    window.addEventListener("resize", при);
    return () => {
      window.removeEventListener("scroll", при);
      window.removeEventListener("resize", при);
      cancelAnimationFrame(кадр);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={ref}
        className="h-full origin-left rtl:origin-right"
        style={{ transform: "scaleX(0)", background: "linear-gradient(90deg,var(--accent),var(--gold))" }}
      />
    </div>
  );
}

/**
 * Карточка с «фонариком»: мягкое бирюзовое пятно идёт за курсором.
 * Координаты пишем в CSS-переменные, без перерисовки React.
 */
export function Фонарик({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const двигать = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={двигать} className={`spotlight ${className}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Манифест: крупный текст, слова которого «загораются» по одному, пока
 * человек листает.
 */
export function Манифест({ текст, акцент }: { текст: string; акцент: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [п, setП] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (ТИХО()) return setП(1);
    let кадр = 0;
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const h = window.innerHeight;
        setП(Math.min(1, Math.max(0, (h * 0.85 - r.top) / (r.height + h * 0.35))));
      });
    };
    при();
    window.addEventListener("scroll", при, { passive: true });
    return () => {
      window.removeEventListener("scroll", при);
      cancelAnimationFrame(кадр);
    };
  }, []);
  const слова = текст.split(/\s+/);
  return (
    <p ref={ref} className="serif text-[clamp(1.9rem,4.2vw,3.6rem)] font-semibold leading-[1.18]">
      {слова.map((с, i) => {
        const горит = i / слова.length < п;
        const особое = акцент.some((а) => с.toLowerCase().includes(а.toLowerCase()));
        return (
          <span
            key={i}
            className="transition-colors duration-300"
            style={{ color: горит ? (особое ? "var(--accent-ink)" : "var(--ink)") : "rgba(13,23,21,0.14)" }}
          >
            {с}{" "}
          </span>
        );
      })}
    </p>
  );
}
