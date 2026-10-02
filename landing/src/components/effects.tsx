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
      <p className="condensed absolute bottom-6 right-8 text-8xl font-bold leading-none tabular-nums text-white/90 sm:text-[11rem]">
        {String(число).padStart(3, "0")}
      </p>
      <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-full" style={{ width: `${число}%`, background: "var(--gold)" }} />
      </div>
    </div>
  );
}

/**
 * Свой курсор в цветах логотипа: светящаяся точка, за ней — «хвост
 * кометы» из шести искр (бирюза переходит в золото), и кольцо с
 * переливающейся бирюзово-золотой каймой, которое догоняет с запаздыванием.
 * Над ссылкой кольцо растёт и наполняется светом, при нажатии — сжимается.
 * Всё двигается transform в одном requestAnimationFrame; цикл засыпает,
 * когда мышь стоит и всё догнало.
 */
const ХВОСТ = 6;
export function Курсор() {
  const точка = useRef<HTMLDivElement>(null);
  const кольцо = useRef<HTMLDivElement>(null);
  const масштаб = useRef<HTMLDivElement>(null);
  const заливка = useRef<HTMLDivElement>(null);
  const искры = useRef<(HTMLDivElement | null)[]>([]);
  const [есть, setЕсть] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || ТИХО()) return;
    setЕсть(true);
    const мышь = { x: -100, y: -100 };
    const тень = { x: -100, y: -100 };
    const хвост = Array.from({ length: ХВОСТ }, () => ({ x: -100, y: -100 }));
    let над = false;
    let нажато = false;
    let виден = true;
    let кадр = 0;
    const состояние = () => {
      if (масштаб.current) масштаб.current.style.transform = `scale(${нажато ? 0.75 : над ? 1.9 : 1})`;
      if (заливка.current) заливка.current.style.opacity = над ? "1" : "0";
      if (точка.current) точка.current.style.opacity = виден ? (над ? "0" : "1") : "0";
      if (кольцо.current) кольцо.current.style.opacity = виден ? "1" : "0";
    };
    const цикл = () => {
      тень.x += (мышь.x - тень.x) * 0.16;
      тень.y += (мышь.y - тень.y) * 0.16;
      let пред = мышь;
      let покой = Math.abs(мышь.x - тень.x) + Math.abs(мышь.y - тень.y) < 0.3;
      хвост.forEach((т, i) => {
        т.x += (пред.x - т.x) * 0.42;
        т.y += (пред.y - т.y) * 0.42;
        if (Math.abs(пред.x - т.x) + Math.abs(пред.y - т.y) > 0.3) покой = false;
        const у = искры.current[i];
        if (у) у.style.transform = `translate(${т.x}px,${т.y}px)`;
        пред = т;
      });
      if (точка.current) точка.current.style.transform = `translate(${мышь.x}px,${мышь.y}px)`;
      if (кольцо.current) кольцо.current.style.transform = `translate(${тень.x}px,${тень.y}px)`;
      кадр = покой ? 0 : requestAnimationFrame(цикл);
    };
    const разбудить = () => {
      if (!кадр) кадр = requestAnimationFrame(цикл);
    };
    const при = (e: PointerEvent) => {
      мышь.x = e.clientX;
      мышь.y = e.clientY;
      const новое = Boolean((e.target as HTMLElement)?.closest("a,button,select,[data-cursor]"));
      if (новое !== над || !виден) {
        над = новое;
        виден = true;
        состояние();
      }
      разбудить();
    };
    const вниз = () => ((нажато = true), состояние());
    const вверх = () => ((нажато = false), состояние());
    const ушла = (e: MouseEvent) => {
      if (!e.relatedTarget) ((виден = false), состояние());
    };
    window.addEventListener("pointermove", при, { passive: true });
    window.addEventListener("pointerdown", вниз);
    window.addEventListener("pointerup", вверх);
    document.addEventListener("mouseout", ушла);
    document.documentElement.classList.add("own-cursor");
    return () => {
      window.removeEventListener("pointermove", при);
      window.removeEventListener("pointerdown", вниз);
      window.removeEventListener("pointerup", вверх);
      document.removeEventListener("mouseout", ушла);
      cancelAnimationFrame(кадр);
      document.documentElement.classList.remove("own-cursor");
    };
  }, []);
  if (!есть) return null;
  return (
    <>
      {/* Хвост кометы: от бирюзы к золоту, всё меньше и прозрачнее */}
      {Array.from({ length: ХВОСТ }, (_, i) => {
        const р = 7 - i;
        const к = i / (ХВОСТ - 1);
        return (
          <div
            key={i}
            ref={(у) => {
              искры.current[i] = у;
            }}
            className="pointer-events-none fixed left-0 top-0 z-[89]"
            style={{ willChange: "transform" }}
          >
            <div
              className="rounded-full"
              style={{
                width: р,
                height: р,
                marginLeft: -р / 2,
                marginTop: -р / 2,
                opacity: 0.55 - к * 0.45,
                background: `color-mix(in srgb, #0fb3ac ${Math.round((1 - к) * 100)}%, #e9c46a)`,
                boxShadow: "0 0 8px rgba(47,208,198,0.6)",
              }}
            />
          </div>
        );
      })}
      <div
        ref={кольцо}
        className="pointer-events-none fixed left-0 top-0 z-[90] transition-opacity duration-300"
        style={{ willChange: "transform" }}
      >
        <div
          ref={масштаб}
          className="relative -ml-5 -mt-5 h-10 w-10 transition-transform duration-300 ease-out"
        >
          {/* Кайма: вращающийся конический градиент, вырезанный в кольцо */}
          <div
            className="cursor-ring absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #0fb3ac, #e9c46a, #2fd0c6, #0a847e, #0fb3ac)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
            }}
          />
          <div
            ref={заливка}
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300"
            style={{
              background: "radial-gradient(circle, rgba(233,196,106,0.28), rgba(15,179,172,0.14) 60%, transparent 72%)",
              backdropFilter: "blur(1px)",
            }}
          />
        </div>
      </div>
      <div
        ref={точка}
        className="pointer-events-none fixed left-0 top-0 z-[91] transition-opacity duration-200"
        style={{ willChange: "transform" }}
      >
        <div
          className="-ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #fff, #2fd0c6 45%, #0a847e)",
            boxShadow: "0 0 10px rgba(47,208,198,0.9), 0 0 18px rgba(233,196,106,0.45)",
          }}
        />
      </div>
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
