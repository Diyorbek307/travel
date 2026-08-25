"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Появление блока при попадании в кадр.
 *
 * Сознательно сдержанно: сдвиг на 28 пикселей и полсекунды. Крупные вылеты
 * и долгие задержки выглядят дёшево и мешают читать — на дорогих сайтах
 * анимация почти незаметна, её замечаешь только когда убираешь.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  // Всегда div: полиморфный тег требовал бы объединения типов ссылок
  // на разные элементы, а выигрыш в разметке этого не стоит.
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const animation = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        // Запускаем, когда блок поднялся на 12% высоты экрана —
        // так анимация успевает пройти до того, как читатель на неё смотрит.
        start: "top 88%",
        once: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
