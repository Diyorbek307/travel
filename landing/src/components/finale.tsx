"use client";

import Logo from "./logo";
import { APP_URL, useЯзык } from "@/lib/i18n";

/**
 * Финал — глубокая бирюза над горами Заамина: вращающийся значок,
 * знак HelloUZ, рукописное «Salom, O‘zbekiston!» и отдельный вход для
 * заведений — у них в приложении свой кабинет.
 */
export default function Finale() {
  const { t } = useЯзык();
  return (
    <footer className="relative overflow-hidden text-white" style={{ background: "#0d3b37" }}>
      <img
        src="https://images.unsplash.com/photo-1716657309938-800da49506fa?w=1920&q=70&auto=format&fit=crop"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg,#0d3b37 0%,rgba(13,59,55,0.65) 45%,#0a2b28 100%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr_auto]">
          {/* Вращающийся значок */}
          <div className="relative mx-auto h-40 w-40">
            <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <path id="круг" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              {/* Длина текста — ровно окружность (2π·78): надпись замыкается без нахлёста. */}
              <text fill="rgba(255,255,255,0.85)" fontSize="14" fontWeight="600">
                <textPath href="#круг" textLength="488" lengthAdjust="spacing">
                  {t("fin_badge")}
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Logo size={56} />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.5em] text-white/70">HelloUZ</p>
            <h2 className="serif my-4 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-none">
              {t("fin_title")}
            </h2>
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] font-semibold transition-transform hover:scale-[1.04]"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              {t("open_app")} ↗
            </a>
          </div>

          <p className="hand mx-auto -rotate-6 text-center text-5xl leading-none text-white/90 lg:text-6xl">
            {t("fin_script")}
            <span className="mx-auto mt-3 block h-px w-32 bg-white/60" />
          </p>
        </div>

        <div className="glass mt-20 flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
          <span className="text-3xl">🏨</span>
          <div className="flex-1">
            <p className="font-semibold">{t("fin_partners")}</p>
            <p className="text-sm text-white/70">{t("fin_partners_sub")}</p>
          </div>
          <a
            href={`${APP_URL}/admin`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white hover:text-black"
          >
            HelloUZ Partner ↗
          </a>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-xs text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} HelloUZ · 🇺🇿 Made in Uzbekistan</p>
          <p>{t("fin_credits")}</p>
        </div>
      </div>
    </footer>
  );
}
