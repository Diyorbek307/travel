"use client";

import Link from "next/link";
import { useЯзык } from "@/lib/i18n";
import { СТРАНИЦЫ, следующая, страница } from "@/lib/pages";
import { Контуры } from "./cinema";
import Reveal from "./reveal";

/**
 * Шапка внутренней страницы: тёмная полоса с названием раздела и одной
 * строкой о том, что внутри. Тёмная — чтобы меню сверху оставалось
 * светлым, как над первым экраном главной.
 */
export function PageIntro({ путь }: { путь: string }) {
  const { t } = useЯзык();
  const с = страница(путь);
  return (
    <section data-nav="dark" className="relative overflow-hidden text-white" style={{ background: "var(--night)" }}>
      <Контуры цвет="rgba(255,255,255,0.07)" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 20% 0%, rgba(52,220,207,0.18), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-44">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: "var(--glow)" }}>
          {с.знак} HelloUZ
        </p>
        <h1 className="serif max-w-4xl text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[1.02]">
          {с.заголовок ? t(с.заголовок) : t(с.меню)}
        </h1>
        {с.текст && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{t(с.текст)}</p>}
      </div>
    </section>
  );
}

/** «Дальше: …» внизу страницы — чтобы не возвращаться в меню. */
export function NextPage({ путь }: { путь: string }) {
  const { t } = useЯзык();
  const с = следующая(путь);
  return (
    <section className="px-5 py-16 sm:px-8">
      <Link
        href={с.путь}
        className="group mx-auto flex max-w-5xl items-center gap-5 rounded-[28px] border p-6 transition-colors hover:bg-white sm:p-8"
        style={{ borderColor: "var(--line)", background: "var(--cream)" }}
      >
        <span className="text-4xl" aria-hidden>
          {с.знак}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t("pg_next")}
          </span>
          <span className="serif mt-1 block text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-tight">
            {с.заголовок ? t(с.заголовок) : t(с.меню)}
          </span>
          {с.текст && (
            <span className="mt-1 block text-sm" style={{ color: "var(--ink-soft)" }}>
              {t(с.текст)}
            </span>
          )}
        </span>
        <span className="text-3xl transition-transform group-hover:translate-x-1 rtl:rotate-180" aria-hidden>
          →
        </span>
      </Link>
    </section>
  );
}

/** На главной: вход во все разделы карточками, а не лентой блоков. */
export function SiteSections() {
  const { t } = useЯзык();
  return (
    <section className="paper-grain px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t("pg_sections_kicker")}
          </p>
          <h2 className="serif text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.04]">
            {t("pg_sections_title")}
          </h2>
        </Reveal>
        {/* Пять карточек: три в первом ряду, две пошире во втором — без дыры. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {СТРАНИЦЫ.slice(1).map((с, n) => (
            <Reveal
              key={с.путь}
              delay={n * 0.06}
              className={`${n < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${n === 4 ? "sm:col-span-2 lg:col-span-3" : ""}`}
            >
              <Link
                href={с.путь}
                className="group flex h-full flex-col rounded-[28px] border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(13,23,21,0.45)]"
                style={{ borderColor: "var(--line)" }}
              >
                <span
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: "var(--cream)" }}
                  aria-hidden
                >
                  {с.знак}
                </span>
                <span className="serif text-2xl font-semibold">{с.заголовок ? t(с.заголовок) : t(с.меню)}</span>
                {с.текст && (
                  <span className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {t(с.текст)}
                  </span>
                )}
                <span
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "var(--accent-ink)" }}
                >
                  {t("pg_open")}
                  <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
