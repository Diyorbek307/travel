"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import { APP_URL, useЯзык, ЯЗЫКИ } from "@/lib/i18n";
import { СТРАНИЦЫ } from "@/lib/pages";

/**
 * Шапка: прозрачная над первым экраном, стеклянная — когда прокрутили.
 * Над тёмными блоками (data-nav="dark") перекрашивается в светлую,
 * над светлыми — обратно, как на сайтах-витринах.
 *
 * Пункты меню — страницы сайта (lib/pages.ts), текущая подчёркнута. На
 * телефоне и узком экране — кнопка «Меню» со списком страниц.
 */
export default function Nav() {
  const { t, язык, setЯзык } = useЯзык();
  const [прокручено, setПрокручено] = useState(false);
  const [тёмный, setТёмный] = useState(true);
  const [меню, setМеню] = useState(false);
  const путь = usePathname();

  // Перешли на страницу — меню закрываем, тон шапки пересчитываем.
  useEffect(() => {
    setМеню(false);
    window.dispatchEvent(new Event("scroll"));
  }, [путь]);

  // Пока открыто меню, страница под ним не прокручивается.
  useEffect(() => {
    document.documentElement.style.overflow = меню ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setМеню(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [меню]);

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

  const ссылки = СТРАНИЦЫ.map((с) => [с.путь, t(с.меню)] as const);

  return (
    <>
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
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-xl font-semibold tracking-tight">
              Hello<span style={{ color: "var(--accent)" }}>UZ</span>
            </span>
          </Link>
          {/* Шесть пунктов на 10 языках помещаются от 1280px; уже — кнопка «Меню». */}
          <nav className="ml-auto hidden items-center gap-6 whitespace-nowrap text-sm font-medium xl:flex">
            {ссылки.map(([href, текст]) => (
              <Link
                key={href}
                href={href}
                aria-current={путь === href ? "page" : undefined}
                className={`group relative py-1 ${путь === href ? "" : "opacity-80 hover:opacity-100"}`}
              >
                {текст}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300 group-hover:scale-x-100 ${
                    путь === href ? "scale-x-100" : "scale-x-0"
                  }`}
                  style={{ background: тёмный ? "#fff" : "var(--accent-ink)" }}
                />
              </Link>
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
              aria-label={t("open_app")}
              className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold text-white transition-transform hover:scale-[1.04] sm:h-auto sm:w-auto sm:px-5 sm:py-2.5"
              style={{ background: тёмный ? "var(--accent-fill)" : "var(--accent-ink)" }}
            >
              {/* На телефоне места мало — только стрелка; надпись с 640px. */}
              <span className="sm:hidden" aria-hidden>
                ↗
              </span>
              <span className="hidden sm:inline">{t("open_app")}</span>
            </a>
            <button
              onClick={() => setМеню(true)}
              className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold xl:hidden"
              style={
                тёмный
                  ? { background: "rgba(255,255,255,0.14)", color: "#fff" }
                  : { background: "var(--sand)", color: "var(--ink)" }
              }
              aria-expanded={меню}
              aria-label={t("nav_menu")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">{t("nav_menu")}</span>
            </button>
          </div>
        </div>
      </header>
      {меню && (
        <div
          className="fixed inset-0 z-[60] flex flex-col text-white xl:hidden"
          style={{ background: "var(--night)" }}
          role="dialog"
          aria-modal="true"
          aria-label={t("nav_menu")}
        >
          <div className="flex items-center justify-between px-5 py-5 sm:px-8">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setМеню(false)}>
              <Logo size={36} />
              <span className="text-xl font-semibold tracking-tight">
                Hello<span style={{ color: "var(--accent)" }}>UZ</span>
              </span>
            </Link>
            <button
              onClick={() => setМеню(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xl"
              style={{ background: "rgba(255,255,255,0.12)" }}
              aria-label={t("nav_close")}
            >
              ✕
            </button>
          </div>
          <nav data-lenis-prevent className="flex-1 overflow-y-auto px-5 pb-8 sm:px-8">
            {СТРАНИЦЫ.map((с) => (
              <Link
                key={с.путь}
                href={с.путь}
                onClick={() => setМеню(false)}
                aria-current={путь === с.путь ? "page" : undefined}
                className="flex items-center gap-4 border-b py-4"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <span className="text-2xl" aria-hidden>
                  {с.знак}
                </span>
                <span
                  className="serif text-3xl font-semibold"
                  style={{ color: путь === с.путь ? "var(--glow)" : "#fff" }}
                >
                  {t(с.меню)}
                </span>
              </Link>
            ))}
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold"
              style={{ background: "var(--accent-fill)" }}
            >
              {t("open_app")} ↗
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
