"use client";

import Link from "next/link";
import Logo from "./logo";
import { СТРАНИЦЫ } from "@/lib/pages";
import { APP_URL, useЯзык } from "@/lib/i18n";
import { Контуры, Слова } from "./cinema";
import StoreButtons from "./store-buttons";

/**
 * Финал — тёмная панель в переливающейся рамке (бирюза → золото, как
 * крыло знака) с узором-«ёлочкой» майолики по верхнему краю, по ней медленно текут линии
 * рельефа: вращающийся значок, крупный заголовок, рукописное
 * «Salom, O‘zbekiston!» и отдельный вход для заведений — у них в
 * приложении свой кабинет.
 */
export default function Finale() {
  const { t } = useЯзык();
  return (
    <footer data-nav="dark" className="relative px-2.5 pb-2.5 pt-6 text-white sm:px-5 sm:pb-5 sm:pt-10">
      <div className="footer-frame relative overflow-hidden rounded-[28px] sm:rounded-[44px]">
        {/* Узор-«ёлочка» по верхнему краю — как изразцы Хивы, гаснет к углам. */}
        <div aria-hidden className="footer-tiles pointer-events-none absolute inset-x-0 top-0 h-2.5" />
        <Контуры цвет="rgba(255,255,255,0.09)" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 35%, rgba(52,220,207,0.14), transparent 60%)",
          }}
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
              <h2
                className="condensed my-5 text-[clamp(2.8rem,7vw,6.6rem)] font-bold leading-[0.92]"
                style={{ color: "var(--glow)" }}
              >
                <Слова текст={t("fin_title")} шаг={0.1} />
              </h2>
              <StoreButtons тёмный className="mt-6 justify-center" />
            </div>

            <p className="hand mx-auto -rotate-6 text-center text-5xl leading-none text-white/90 lg:text-6xl">
              {t("fin_script")}
              <span className="mx-auto mt-3 block h-px w-32 bg-white/60" />
            </p>
          </div>

          {/* Сотрудничество — для всех, кто работает с туристами, а не
            только для отелей и ресторанов. У заведений есть свой кабинет. */}
          <div id="partners" className="glass mt-20 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center">
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                🤝
              </span>
              <div className="flex-1">
                <p className="serif text-2xl font-semibold">{t("fin_partners")}</p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/75">
                  {t("fin_partners_sub")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["fin_p_5", "fin_p_2", "fin_p_1", "fin_p_3", "fin_p_4"] as const).map((к) => (
                    <span
                      key={к}
                      className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium"
                    >
                      {t(к)}
                    </span>
                  ))}
                </div>
              </div>
              {/* Водители и гиды — в свой кабинет; заведения входят в панель. */}
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto lg:items-end">
                <a
                  href={`${APP_URL}/cabinet`}
                  target="_blank"
                  rel="noreferrer"
                  className="whitespace-nowrap rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.04]"
                  style={{ background: "var(--gold)", color: "#1c1606" }}
                >
                  {t("fin_p_cta")} ↗
                </a>
                <a
                  href={`${APP_URL}/admin`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 text-center text-xs font-medium text-white/65 underline-offset-4 hover:text-white hover:underline"
                >
                  {t("fin_p_venue")} ↗
                </a>
              </div>
            </div>
          </div>

          {/* Все разделы сайта — внизу каждой страницы. */}
          <nav className="mt-14 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-medium text-white/80">
            {СТРАНИЦЫ.map((с) => (
              <Link key={с.путь} href={с.путь} className="rounded-full px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white">
                {t(с.меню)}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-center text-xs text-white/55 sm:flex-row sm:text-start">
            <p>© {new Date().getFullYear()} HelloUZ · Made in Uzbekistan</p>
            <p>{t("fin_credits")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
