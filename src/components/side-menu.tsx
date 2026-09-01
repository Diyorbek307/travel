"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "./app-state";
import Icon, { type IconName } from "./icon";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Боковое меню из макета.
 *
 * Имя и уровень берутся из паспорта — того же локального состояния, что
 * и на экране профиля. В макете здесь стоял выдуманный «Алекс Джонсон ·
 * Уровень 3»; пока турист не вписал себя, показываем приглашение, а не
 * чужое имя.
 *
 * Счётчики у пунктов настоящие: сколько объектов в избранном и сколько
 * городов скачано. Ноль тоже честный ответ, поэтому пустые не прячем —
 * иначе непонятно, есть раздел или нет.
 */

/** Сколько объектов нужно посетить, чтобы поднять уровень. */
const PER_LEVEL = 5;

const NAV: { href: string; icon: IconName; key: string }[] = [
  { href: "/", icon: "home", key: "cities" },
  { href: "/explore", icon: "explore", key: "explore_short" },
  { href: "/map", icon: "map", key: "explore_title" },
  { href: "/audio", icon: "headphones", key: "audio_title" },
  { href: "/profile", icon: "user", key: "profile" },
];

export default function SideMenu({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const { name, visits, favorites, offlineCities } = useAppState();
  const pathname = usePathname();

  // Закрываем по Escape: панель перекрывает экран, и уйти с клавиатуры
  // должно быть можно без мыши.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const level = 1 + Math.floor(visits.length / PER_LEVEL);

  const extras: { href: string; icon: IconName; key: string; badge?: number }[] = [
    { href: "/profile", icon: "heart", key: "favorited", badge: favorites.length },
    { href: "/routes", icon: "explore", key: "my_routes" },
    { href: "/offline", icon: "download", key: "offline", badge: offlineCities.length },
    { href: "/search", icon: "search", key: "search_action" },
    { href: "/sos", icon: "sos", key: "sos" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t(lang, "menu_title")}
        aria-expanded={open}
        className="pressable grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] glass"
      >
        <Icon name="menu-lines" size={18} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <aside
            className="slide-in-left fixed bottom-0 left-0 top-0 z-50 flex w-[290px] flex-col text-white"
            style={{ background: "#0F1A14" }}
            role="dialog"
            aria-modal="true"
            aria-label={t(lang, "menu_title")}
          >
            <div
              className="border-b px-5 pb-5 pt-6"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <Icon name="logo" size={34} />
                  <span>
                    <span className="display-font block text-lg font-bold leading-tight">
                      {t(lang, "app_name")}
                    </span>
                    <span className="block text-[10px]" style={{ color: "var(--accent)" }}>
                      {t(lang, "tagline_short")}
                    </span>
                  </span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t(lang, "back")}
                  className="pressable grid h-8 w-8 place-items-center rounded-[var(--radius-sm)]"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon name="chevron-right" size={16} />
                </button>
              </div>

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="pressable flex items-center gap-3 rounded-[var(--radius-md)] p-3"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                  style={{ background: "linear-gradient(135deg,#2d7b57,#66B38E)" }}
                >
                  <Icon name="user" size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {name ?? t(lang, "passport_name_hint")}
                  </span>
                  <span
                    className="block text-[10px]"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {t(lang, "level")} {level} · {visits.length} {t(lang, "stamps")}
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              <p
                className="mb-2 px-5 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {t(lang, "menu_nav")}
              </p>
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-3"
                    style={{
                      background: active ? "rgba(45,123,87,0.18)" : undefined,
                      borderRight: `3px solid ${active ? "var(--primary-soft)" : "transparent"}`,
                    }}
                  >
                    <span
                      className="w-6"
                      style={{ color: active ? "var(--primary-soft)" : "rgba(255,255,255,0.75)" }}
                    >
                      <Icon name={item.icon} size={19} />
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: active ? "var(--primary-soft)" : "rgba(255,255,255,0.75)" }}
                    >
                      {t(lang, item.key)}
                    </span>
                  </Link>
                );
              })}

              <div
                className="mx-5 my-3 border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              />
              <p
                className="mb-2 px-5 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {t(lang, "menu_more")}
              </p>
              {extras.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="w-6" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {t(lang, item.key)}
                  </span>
                  {item.badge != null && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: "rgba(45,123,87,0.35)", color: "var(--primary-soft)" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div
                className="mx-5 my-3 border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              />

              <Link
                href="/pro"
                onClick={() => setOpen(false)}
                className="pressable mx-4 flex items-center gap-3 rounded-[var(--radius-md)] p-4"
                style={{ background: "linear-gradient(135deg,#1A1A2E,#2C1810)" }}
              >
                <span style={{ color: "var(--accent)" }}>
                  <Icon name="sparkle" size={22} filled />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-bold" style={{ color: "var(--accent)" }}>
                    {t(lang, "pro_title")}
                  </span>
                  <span
                    className="block text-[9px]"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {t(lang, "pro_perk_ads")}
                  </span>
                </span>
                <Icon name="chevron-right" size={14} />
              </Link>
            </nav>

            <div
              className="border-t px-5 py-4 text-[10px]"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}
            >
              {t(lang, "app_name")} · {t(lang, "made_in_uz")}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
