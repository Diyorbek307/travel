"use client";

import { useEffect, useState } from "react";
import Logo from "./logo";
import { APP_URL, useЯзык, ЯЗЫКИ } from "@/lib/i18n";

/**
 * Шапка: прозрачная над первым экраном, стеклянная — когда прокрутили.
 * Над тёмными блоками (data-nav="dark") перекрашивается в светлую,
 * над светлыми — обратно, как на сайтах-витринах.
 */
export default function Nav() {
  const { t, язык, setЯзык } = useЯзык();
  const [прокручено, setПрокручено] = useState(false);
  const [тёмный, setТёмный] = useState(true);
  useEffect(() => {
    let кадр = 0;
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(() => {
        setПрокручено(window.scrollY > 40);
        // Что сейчас под шапкой: проверяем точку на её середине.
        const под = Array.from(document.querySelectorAll<HTMLElement>("[data-nav='dark']")).some((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= 34 && r.bottom > 34;
        });
        setТёмный(под);
      });
    };
    при();
    window.addEventListener("scroll", при, { passive: true });
    window.addEventListener("resize", при);
    return () => {
      cancelAnimationFrame(кадр);
      window.removeEventListener("scroll", при);
      window.removeEventListener("resize", при);
    };
  }, []);

  const ссылки = [
    ["#open", t("nav_open")],
    ["#cities", t("nav_cities")],
    ["#features", t("nav_features")],
    ["#esim", t("nav_esim")],
    ["#quiz", t("nav_quiz")],
  ] as const;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${тёмный ? "text-white" : ""} ${
        прокручено
          ? тёмный
            ? "glass py-2.5"
            : "glass-light py-2.5 shadow-[0_8px_30px_-20px_rgba(13,23,21,0.5)]"
          : "py-5"
      }`}
      style={
        // Над тёмными блоками — без размытия подложки: под шапкой там движется
        // фото первого экрана, и размытие пересчитывалось бы каждый кадр.
        тёмный && прокручено
          ? {
              borderColor: "transparent",
              background: "rgba(10,17,16,0.82)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
            }
          : undefined
      }
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-xl font-semibold tracking-tight">
            Hello<span style={{ color: "var(--accent)" }}>UZ</span>
          </span>
        </a>
        {/* Пять пунктов на 10 языках — места хватает только от 1280px;
            уже — навигация прокруткой, пункты не переносятся. */}
        <nav className="ml-auto hidden items-center gap-6 whitespace-nowrap text-sm font-medium xl:flex">
          {ссылки.map(([href, текст]) => (
            <a key={href} href={href} className="group relative py-1">
              {текст}
              <span
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: тёмный ? "#fff" : "var(--accent-ink)" }}
              />
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          {/* Все 10 языков приложения; по умолчанию — язык устройства. */}
          <label className="relative flex items-center">
            <span className="sr-only">Language</span>
            <select
              value={язык}
              onChange={(e) => setЯзык(e.target.value as typeof язык)}
              className="appearance-none rounded-full py-2 pl-3 pr-8 text-xs font-bold outline-none transition-colors"
              style={
                тёмный
                  ? { background: "rgba(255,255,255,0.14)", color: "#fff" }
                  : { background: "var(--sand)", color: "var(--ink)" }
              }
            >
              {ЯЗЫКИ.map((я) => (
                <option key={я.код} value={я.код} style={{ color: "#0d1715", background: "#fff" }}>
                  {я.флаг} {я.имя}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 text-[10px]">▾</span>
          </label>
          <a
            href={APP_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.04] sm:inline-block"
            style={{ background: тёмный ? "var(--accent-fill)" : "var(--accent-ink)" }}
          >
            {t("open_app")}
          </a>
        </div>
      </div>
    </header>
  );
}
