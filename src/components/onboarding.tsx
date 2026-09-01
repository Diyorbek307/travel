"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "./app-state";
import Icon from "./icon";
import { LANG_FLAG, LANG_LABEL, t, themeLabel } from "@/lib/i18n";
import { MVP_LANGS, THEMES, type Lang, type Theme } from "@/lib/types";

const LANG_COOKIE = "uz_lang";

/**
 * Приветственный экран при первом запуске: язык, затем интересы.
 *
 * Показывается поверх приложения, а не отдельным маршрутом: турист,
 * пришедший по ссылке на конкретный памятник или по QR-коду с таблички,
 * должен попасть именно туда, а не на экран приветствия. Онбординг здесь
 * лишь накрывает страницу и уходит, оставляя человека там, куда он шёл.
 *
 * Язык пишется в ту же cookie, что и переключатель в шапке: серверные
 * компоненты читают её при рендере. Интересы — в localStorage, оттуда их
 * забирает планировщик маршрутов.
 */
export default function Onboarding({ lang }: { lang: Lang }) {
  const { ready, onboarded, completeOnboarding } = useAppState();
  const [step, setStep] = useState<1 | 2>(1);
  const [picked, setPicked] = useState<Lang>(lang);
  const [interests, setInterests] = useState<Theme[]>([]);
  const router = useRouter();

  // Пока localStorage не прочитан, состояние неизвестно: показать экран
  // сразу — значит мигнуть им и тем, кто онбординг уже прошёл.
  if (!ready || onboarded) return null;

  function chooseLang(next: Lang) {
    setPicked(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  function toggleInterest(th: Theme) {
    setInterests((prev) =>
      prev.includes(th) ? prev.filter((x) => x !== th) : [...prev, th],
    );
  }

  function finish() {
    completeOnboarding(interests);
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg)" }}
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, "onb_welcome")}
    >
      {/* Шапка-обложка: тот же изумруд, что и в остальном приложении. */}
      <header
        className="relative overflow-hidden px-6 pb-8 pt-10 text-center text-white"
        style={{ background: "var(--primary)" }}
      >
        <div className="ornament" aria-hidden />
        <p className="relative text-xs uppercase tracking-[0.18em] opacity-80">
          {t(lang, "onb_step")} {step} {t(lang, "onb_of")} 2
        </p>
        <h1 className="relative mt-2 text-2xl font-semibold">
          {step === 1 ? t(lang, "onb_welcome") : t(lang, "onb_interests_title")}
        </h1>
        <p className="relative mt-1.5 text-sm opacity-90">
          {step === 1 ? t(lang, "onb_pick_lang") : t(lang, "onb_interests_lead")}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {step === 1 ? (
          <ul className="mx-auto grid max-w-md gap-2">
            {MVP_LANGS.map((l) => {
              const active = picked === l;
              return (
                <li key={l}>
                  <button
                    onClick={() => chooseLang(l)}
                    aria-pressed={active}
                    className="pressable flex w-full items-center gap-3 p-3.5 card"
                    style={{
                      background: active ? "var(--primary-tint)" : "var(--surface)",
                      boxShadow: active ? "var(--shadow-2)" : "var(--shadow-1)",
                    }}
                  >
                    <span aria-hidden className="text-xl">
                      {LANG_FLAG[l]}
                    </span>
                    <span className="flex-1 text-left font-medium">{LANG_LABEL[l]}</span>
                    {active && (
                      <span style={{ color: "var(--primary-text)" }}>
                        <Icon name="shield" size={20} filled />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="mx-auto grid max-w-md grid-cols-3 gap-2">
            {THEMES.map((th) => {
              const active = interests.includes(th);
              return (
                <li key={th}>
                  <button
                    onClick={() => toggleInterest(th)}
                    aria-pressed={active}
                    className="pressable grid h-full w-full place-items-center gap-1.5 p-3 text-center card"
                    style={{
                      background: active ? "var(--primary-tint)" : "var(--surface)",
                      boxShadow: active ? "var(--shadow-2)" : "var(--shadow-1)",
                    }}
                  >
                    <span
                      style={{
                        color: active ? "var(--primary-text)" : "var(--text-faint)",
                      }}
                    >
                      <Icon name={THEME_ICON[th]} size={22} />
                    </span>
                    <span className="text-[0.7rem] font-medium leading-tight">
                      {themeLabel(lang, th)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
        style={{ background: "var(--bg)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={finish}
            className="pressable px-3 py-3 text-sm soft"
            type="button"
          >
            {t(lang, "onb_skip")}
          </button>
          <button
            onClick={() => (step === 1 ? setStep(2) : finish())}
            className="pressable flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-full)] px-5 font-medium"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
            type="button"
          >
            {step === 1 ? t(lang, "onb_continue") : t(lang, "onb_start")}
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Иконка на каждую тему. В макете здесь стояли эмодзи, но их рисует
 * системный шрифт: на разных телефонах они выглядят по-разному и не
 * подчиняются цветовым токенам — активная плитка не смогла бы перекрасить
 * значок. Берём из своего набора.
 */
const THEME_ICON: Record<Theme, Parameters<typeof Icon>[0]["name"]> = {
  history: "landmark",
  architecture: "landmark",
  museums: "museum",
  islamic: "religious",
  nature: "nature",
  food: "restaurant",
  entertainment: "sparkle",
  family: "heart",
  crafts: "craft",
  shopping: "bazaar",
  free: "ticket",
};
