"use client";

import { useEffect, useState } from "react";
import Logo from "./logo";
import { APP_URL, useЯзык } from "@/lib/i18n";

/** Шапка: прозрачная над первым экраном, стеклянная — когда прокрутили. */
export default function Nav() {
  const { t, язык, setЯзык } = useЯзык();
  const [прокручено, setПрокручено] = useState(false);
  useEffect(() => {
    const при = () => setПрокручено(window.scrollY > 40);
    при();
    window.addEventListener("scroll", при, { passive: true });
    return () => window.removeEventListener("scroll", при);
  }, []);

  const ссылки = [
    ["#cities", t("nav_cities")],
    ["#features", t("nav_features")],
    ["#demo", t("nav_demo")],
    ["#quiz", t("nav_quiz")],
  ] as const;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${прокручено ? "glass-light py-2.5 shadow-[0_8px_30px_-20px_rgba(34,26,19,0.5)]" : "py-5"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-xl font-semibold tracking-tight">
            Hello<span style={{ color: "var(--tile)" }}>UZ</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-7 text-sm font-medium md:flex">
          {ссылки.map(([href, текст]) => (
            <a key={href} href={href} className="group relative py-1">
              {текст}
              <span
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: "var(--brick)" }}
              />
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="flex rounded-full p-0.5 text-xs font-bold" style={{ background: "var(--sand)" }}>
            {(["ru", "en"] as const).map((я) => (
              <button
                key={я}
                onClick={() => setЯзык(я)}
                className="rounded-full px-2.5 py-1 uppercase transition-colors"
                style={язык === я ? { background: "var(--ink)", color: "var(--paper)" } : { color: "var(--ink-soft)" }}
              >
                {я}
              </button>
            ))}
          </div>
          <a
            href={APP_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.04] sm:inline-block"
            style={{ background: "var(--brick)" }}
          >
            {t("open_app")}
          </a>
        </div>
      </div>
    </header>
  );
}
