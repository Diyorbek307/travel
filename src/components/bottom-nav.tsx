"use client";

import { GREEN, MUTED } from "@/lib/theme";
import type { Tab } from "@/lib/types";

/** Иконки нижней панели: контур в покое, заливка у активной вкладки. */
const ITEMS: { key: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    key: "home",
    label: "Главная",
    icon: (a) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={a ? GREEN : "none"} stroke={a ? GREEN : MUTED} strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "explore",
    label: "Исследовать",
    icon: (a) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a ? GREEN : MUTED} strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    // Карта всегда белая: она лежит в приподнятом зелёном кружке и
    // подсвечивается им, а не цветом штриха.
    key: "map",
    label: "Карта",
    icon: () => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    key: "audio",
    label: "Аудио",
    icon: (a) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a ? GREEN : MUTED} strokeWidth="2" strokeLinecap="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Профиль",
    icon: (a) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a ? GREEN : MUTED} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({
  tab,
  onTab,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
}) {
  return (
    <>
      {/* Телефон и планшет: панель внизу, под большим пальцем. */}
      <nav
        className="device-nav absolute bottom-0 left-0 right-0 flex items-center justify-center border-t lg:hidden"
        style={{ background: "#FFFFFF", borderColor: "var(--border)" }}
      >
        {/*
          На планшете пять кнопок, растянутых на всю ширину, расползаются
          по углам и перестают читаться как одна панель. Держим их вместе:
          на телефоне ограничение всё равно не срабатывает.
        */}
        <div className="flex h-full w-full max-w-lg items-center">
        {ITEMS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => onTab(key)}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all active:scale-95"
            >
              {key === "map" ? (
                <span
                  className="-mt-6 mb-0.5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
                  style={{ background: GREEN }}
                >
                  {icon(true)}
                </span>
              ) : (
                icon(active)
              )}
              <span className="text-[9px] font-semibold" style={{ color: active ? GREEN : MUTED }}>
                {label}
              </span>
            </button>
          );
        })}
        </div>
      </nav>

      {/*
        Ноутбук: меню слева колонкой.

        Пять кнопок, растянутых по нижнему краю широкого экрана, выглядят
        потерянными и далеки от курсора. Приподнятый кружок у «Карты»
        здесь тоже ни к чему: он придуман для большого пальца, а мышь
        попадает и в обычную строку.
      */}
      <nav
        className="device-rail hidden shrink-0 flex-col gap-1 p-3 lg:flex"
        style={{ order: -1 }}
      >
        <div className="mb-4 flex items-center gap-2.5 px-3 pt-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ background: GREEN }}
          >
            Uz
          </span>
          <span className="text-lg font-bold" style={{ color: "var(--text)", fontFamily: "'Fraunces',serif" }}>
            UzUp
          </span>
        </div>

        {ITEMS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => onTab(key)}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
              style={{
                background: active ? "#F0F8F4" : "transparent",
                color: active ? GREEN : MUTED,
              }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {key === "map" ? иконкаКарты(active) : icon(active)}
              </span>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/** Та же карта, но цветом строки: зелёного кружка на боковом меню нет. */
function иконкаКарты(active: boolean) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? GREEN : MUTED} strokeWidth="2" strokeLinecap="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
