"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS, LANGS, type Lang } from "@/lib/types";

const LANG_COOKIE = "uz_lang";

/**
 * Выбор языка. Пишем в cookie, а не в localStorage: серверные компоненты
 * читают её при рендере и сразу отдают страницу на нужном языке.
 *
 * Языки вне MVP показаны неактивными — так видно, что архитектура
 * рассчитана на все 10 языков из п. 6 ТЗ, но контент ещё не переведён.
 */
export default function LangSwitcher({ current }: { current: Lang }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function pick(lang: Lang) {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm surface"
        aria-label={LANG_LABEL[current]}
        aria-expanded={open}
        disabled={pending}
      >
        <span>{LANG_FLAG[current]}</span>
        <span className="font-medium uppercase">{current}</span>
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-hidden
            tabIndex={-1}
          />
          <ul
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl shadow-xl surface"
            role="listbox"
          >
            {LANGS.map((lang) => {
              const available = MVP_LANGS.includes(lang);
              return (
                <li key={lang}>
                  <button
                    onClick={() => available && pick(lang)}
                    disabled={!available}
                    role="option"
                    aria-selected={lang === current}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-40"
                    style={{
                      background: lang === current ? "var(--bg-soft)" : "transparent",
                      cursor: available ? "pointer" : "not-allowed",
                    }}
                  >
                    <span>{LANG_FLAG[lang]}</span>
                    <span className="flex-1">{LANG_LABEL[lang]}</span>
                    {!available && <span className="text-[0.6rem] soft">скоро</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
