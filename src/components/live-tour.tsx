"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ACCENT_FILL, BORDER, GOLD, MUTED, SURFACE, TEXT } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import type { Tab } from "@/lib/types";

/**
 * Обучение поверх настоящего приложения: дети в облачке объясняют, а
 * нужная кнопка подсвечивается — остальное затемнено. Цели помечены в
 * разметке атрибутом data-tour, поэтому тур видит ровно то, что увидит
 * турист, а не нарисованную копию экрана.
 */

interface Шаг {
  цель: string;
  вкладка?: Tab;
  текст: TKey;
}

const ШАГИ: Шаг[] = [
  { цель: "tiles", вкладка: "explore", текст: "live1" },
  { цель: "scenic", вкладка: "explore", текст: "live2" },
  { цель: "ai", вкладка: "explore", текст: "live3" },
  { цель: "nav-map", текст: "live4" },
  { цель: "nav-audio", текст: "live5" },
  { цель: "nav-profile", текст: "live6" },
  { цель: "nav-home", текст: "live7" },
];

/** Видимый элемент с этой меткой: у меню их два — внизу и сбоку. */
function найти(цель: string): HTMLElement | null {
  const все = [...document.querySelectorAll<HTMLElement>(`[data-tour="${цель}"]`)];
  return все.find((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0) ?? null;
}

type Рамка = { top: number; left: number; width: number; height: number };

export function ЖивоеОбучение({ onTab, onDone }: { onTab: (t: Tab) => void; onDone: () => void }) {
  const { t } = useT();
  const [n, setN] = useState(0);
  const [рамка, setРамка] = useState<Рамка | null>(null);
  const корень = useRef<HTMLDivElement>(null);
  const шаг = ШАГИ[n];
  const последний = n === ШАГИ.length - 1;

  const измерить = useCallback(() => {
    const el = найти(шаг.цель);
    const коробка = корень.current?.parentElement?.getBoundingClientRect();
    if (!el || !коробка) return;
    const r = el.getBoundingClientRect();
    const новая = { top: r.top - коробка.top, left: r.left - коробка.left, width: r.width, height: r.height };
    // Без лишних перерисовок: замер идёт каждый кадр, а рамка стоит.
    setРамка((с) =>
      с && с.top === новая.top && с.left === новая.left && с.width === новая.width && с.height === новая.height
        ? с
        : новая,
    );
  }, [шаг.цель]);

  // Переход к шагу. Раньше рамка сбрасывалась, экран темнел целиком, и
  // только через полсекунды-секунду окно появлялось снова — «Продолжить»
  // ощущалось как подвисание. Теперь старая рамка остаётся и плавно
  // переезжает: вкладку переключаем сразу, цель ищем каждый кадр, пока
  // она не отрисуется, и прокручиваем к ней, только если её не видно.
  useEffect(() => {
    if (шаг.вкладка) onTab(шаг.вкладка);
    const старт = performance.now();
    let прокрутили = false;
    let кадр = 0;
    const тик = (сейчас: number) => {
      const el = найти(шаг.цель);
      if (el && !прокрутили) {
        прокрутили = true;
        const r = el.getBoundingClientRect();
        if (r.top < 60 || r.bottom > window.innerHeight - 60) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
      измерить();
      // Секунды хватает и на смену вкладки, и на плавную прокрутку.
      if (сейчас - старт < 1000) кадр = requestAnimationFrame(тик);
    };
    кадр = requestAnimationFrame(тик);
    return () => cancelAnimationFrame(кадр);
    // onTab меняется на каждый рендер страницы — шаг решает сам n.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // Цель едет вместе с плавной прокруткой: перемеряем на каждом её шаге
  // (capture — ловим прокрутку любого вложенного списка) и при повороте.
  useLayoutEffect(() => {
    window.addEventListener("resize", измерить);
    window.addEventListener("scroll", измерить, true);
    return () => {
      window.removeEventListener("resize", измерить);
      window.removeEventListener("scroll", измерить, true);
    };
  }, [измерить]);

  const отступ = 6;
  const коробкаВыс = корень.current?.parentElement?.clientHeight ?? 800;
  // Облачко — под целью, если внизу хватает места, иначе над ней.
  const снизу = рамка ? рамка.top + рамка.height + 190 < коробкаВыс : true;

  return (
    <div ref={корень} className="absolute inset-0 z-[80]" role="dialog" aria-modal aria-live="polite">
      {/* Затемнение с «окном» над целью. Пока цель ищется — просто тень. */}
      {рамка ? (
        <div
          className="tour-spot pointer-events-none absolute rounded-2xl"
          style={{
            top: рамка.top - отступ,
            left: рамка.left - отступ,
            width: рамка.width + отступ * 2,
            height: рамка.height + отступ * 2,
            boxShadow: "0 0 0 9999px rgba(3,10,9,0.72)",
            border: `2px solid ${GOLD}`,
            transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(3,10,9,0.72)" }} />
      )}

      <div
        key={n}
        className="bubble-in absolute left-3 right-3 mx-auto max-w-sm rounded-2xl border p-3 shadow-2xl"
        style={{
          background: SURFACE,
          borderColor: BORDER,
          ...(рамка
            ? снизу
              ? { top: рамка.top + рамка.height + отступ + 12 }
              : { bottom: коробкаВыс - рамка.top + отступ + 12 }
            : { top: "40%" }),
        }}
      >
        <div className="flex gap-3">
          <img
            src="/videos/kids-hello.webp"
            alt=""
            className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
            style={{ objectPosition: "center 42%" }}
          />
          <p className="text-sm font-medium leading-snug" style={{ color: TEXT }}>
            {t(шаг.текст)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={onDone} className="px-1 text-xs font-semibold" style={{ color: MUTED }}>
            {t("tour_skip")}
          </button>
          <span className="flex-1 text-center text-[11px]" style={{ color: MUTED }}>
            {n + 1} / {ШАГИ.length}
          </span>
          {n > 0 && (
            <button
              onClick={() => setN(n - 1)}
              className="rounded-xl border px-3 py-2 text-xs font-bold"
              style={{ borderColor: BORDER, color: TEXT }}
            >
              {t("common_back")}
            </button>
          )}
          <button
            onClick={() => (последний ? onDone() : setN(n + 1))}
            className="rounded-xl px-4 py-2 text-xs font-bold text-white"
            style={{ background: ACCENT_FILL }}
          >
            {последний ? t("d_start") : t("onb_continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
