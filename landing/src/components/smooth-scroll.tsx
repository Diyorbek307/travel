"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Инерционный скролл.
 *
 * Половина ощущения «дорогого» сайта — именно он: страница не дёргается
 * по строкам, а плавно доезжает. Lenis перехватывает нативный скролл
 * и двигает контент сам, поэтому GSAP нужно синхронизировать с ним вручную:
 * ScrollTrigger должен считать позицию из Lenis, а не из window.scrollY.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // При системной настройке «уменьшить движение» инерцию не включаем:
    // для части людей плавная прокрутка вызывает тошноту.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      // Экспоненциальное затухание: быстрый старт, мягкая остановка.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // На тач-устройствах инерция уже есть своя — вторую не навешиваем.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Один общий тикер вместо двух независимых циклов анимации.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
