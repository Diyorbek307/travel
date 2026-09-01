"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ACHIEVEMENTS, useAppState } from "./app-state";
import { haversine } from "@/lib/geo";
import { t } from "@/lib/i18n";
import type { City, Lang, Poi } from "@/lib/types";
import Icon, { type IconName } from "./icon";
import PassportCard from "./passport-card";

/**
 * Личный кабинет (п. 12) и туристический паспорт со штампами (п. 13).
 *
 * Все данные лежат в localStorage — регистрация не требуется. Это осознанный
 * выбор для MVP: турист начинает пользоваться приложением сразу после прилёта,
 * а не заполняет форму. Синхронизация между устройствами появится вместе
 * с аккаунтом, формат состояния уже к этому готов.
 */
const TABS: { id: "passport" | "lists" | "stats" | "settings"; icon: IconName; key: string }[] = [
  { id: "passport", icon: "ticket", key: "passport" },
  { id: "lists", icon: "heart", key: "tab_lists" },
  { id: "stats", icon: "star", key: "tab_stats" },
  { id: "settings", icon: "shield", key: "tab_settings" },
];

export default function ProfileScreen({
  pois,
  cities,
  lang,
}: {
  pois: Poi[];
  cities: City[];
  lang: Lang;
}) {
  const state = useAppState();
  const { ready, favorites, wantToVisit, visits, listens } = state;

  /*
   * Вкладки из макета. Профиль был одной длинной лентой: паспорт, цифры,
   * штампы, достижения, два списка, история и настройки подряд — до
   * настроек приходилось листать через всё остальное. Вместо «AI-гида»
   * из макета здесь «Списки»: помощник у нас живёт отдельным экраном, и
   * дублировать его в профиле незачем.
   */
  const [tab, setTab] = useState<"passport" | "lists" | "stats" | "settings">("passport");

  const bySlug = useMemo(() => new Map(pois.map((p) => [p.slug, p])), [pois]);

  // Шесть целей коллекции: самые значимые объекты страны. Список
  // стабильный, поэтому штампы не перескакивают между заходами.
  const stampGoals = useMemo(
    () => [...pois].sort((a, b) => b.popularity - a.popularity).slice(0, 6),
    [pois],
  );
  const earnedCount = stampGoals.filter((p) =>
    visits.some((v) => v.slug === p.slug),
  ).length;

  // Пройденное расстояние оцениваем как сумму отрезков между посещёнными
  // объектами в порядке их посещения. Это приближение: реальный трек мы
  // не пишем, чтобы не собирать историю перемещений туриста.
  const meters = useMemo(() => {
    const ordered = [...visits].sort((a, b) => a.ts - b.ts);
    let total = 0;
    for (let i = 1; i < ordered.length; i++) {
      const prev = bySlug.get(ordered[i - 1].slug);
      const cur = bySlug.get(ordered[i].slug);
      if (prev && cur) total += haversine(prev.lat, prev.lon, cur.lat, cur.lon);
    }
    return total;
  }, [visits, bySlug]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="h-24 animate-pulse rounded-xl bg-soft" />
      </main>
    );
  }

  const visitedCities = new Set(visits.map((v) => v.city));
  const completedListens = listens.filter((l) => l.completed).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <PassportCard lang={lang} totalPlaces={pois.length} />

      <nav className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className="pressable flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] px-3.5 py-2 text-sm"
            style={{
              background: tab === item.id ? "var(--primary)" : "var(--surface)",
              color: tab === item.id ? "var(--on-primary)" : "var(--text)",
              border: `1px solid ${tab === item.id ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            <Icon name={item.icon} size={16} />
            {t(lang, item.key)}
          </button>
        ))}
      </nav>

      {tab === "stats" && (
      <section className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={visits.length} label={t(lang, "places_visited")} />
        <Stat value={visitedCities.size} label={t(lang, "cities_visited")} />
        <Stat value={`${(meters / 1000).toFixed(1)} км`} label={t(lang, "km_walked")} />
        <Stat value={completedListens} label={t(lang, "stories_heard")} />
      </section>
      )}

      {tab === "passport" && (
      <>
      {/* Коллекция штампов из макета: сетка квадратных плиток, где видны
          и полученные, и ещё не полученные. Показывать только собранные
          было бы честно, но бессмысленно — турист не понимает, что ему
          осталось. Цели берутся из самых значимых объектов страны. */}
      <section className="mb-5">
        <h2 className="mb-3 font-semibold">
          {t(lang, "passport")} · {visits.length} {t(lang, "stamps")}
        </h2>
        <ul className="grid grid-cols-3 gap-2.5">
          {stampGoals.map((poi) => {
            const visit = visits.find((v) => v.slug === poi.slug);
            const earned = Boolean(visit);
            return (
              <li key={poi.slug}>
                <Link
                  href={`/poi/${poi.slug}`}
                  className="pressable grid aspect-square place-items-center gap-1 rounded-[var(--radius-md)] p-3 text-center"
                  style={
                    earned
                      ? { background: "var(--primary)", color: "#ffffff", boxShadow: "var(--shadow-1)" }
                      : { background: "var(--surface)", border: "2px dashed var(--border)" }
                  }
                >
                  <span style={{ color: earned ? "#ffffff" : "var(--text-faint)" }}>
                    <Icon name={poi.category} size={22} />
                  </span>
                  <span className="line-clamp-2 text-[9px] font-bold leading-tight">
                    {poi.name}
                  </span>
                  <span
                    className="text-[8px]"
                    style={{ color: earned ? "var(--accent)" : "var(--text-faint)" }}
                  >
                    {earned
                      ? new Date(visit!.ts).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })
                      : t(lang, "stamp_not_visited")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Полоса прогресса по этой же коллекции. */}
        <div className="mt-3 p-4 card">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{t(lang, "progress")}</span>
            <span className="text-sm font-bold" style={{ color: "var(--primary-text)" }}>
              {earnedCount}/{stampGoals.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--bg)" }}>
            <div
              className="h-2 rounded-full transition-[width] duration-500"
              style={{
                width: `${stampGoals.length ? (earnedCount / stampGoals.length) * 100 : 0}%`,
                background: "var(--primary)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Достижения — сеткой, как в макете, а не списком строк. */}
      <section className="mb-5">
        <h2 className="mb-3 font-semibold">{t(lang, "achievements")}</h2>
        <ul className="grid grid-cols-3 gap-2.5">
          {ACHIEVEMENTS.map((a) => {
            const { have, need } = a.progress(state);
            const done = have >= need;
            return (
              <li
                key={a.id}
                className="grid place-items-center gap-1.5 p-3 text-center card"
                style={{ opacity: done ? 1 : 0.55 }}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)]"
                  style={{
                    background: done ? "var(--primary-tint)" : "var(--surface-alt)",
                    color: done ? "var(--primary-text)" : "var(--text-faint)",
                  }}
                >
                  <Icon name="star" size={20} filled={done} />
                </span>
                <span className="text-[9px] font-semibold leading-tight">
                  {a.title[lang] ?? a.title.en}
                </span>
                <span
                  className="text-[8px]"
                  style={{ color: done ? "var(--primary-text)" : "var(--text-faint)" }}
                >
                  {done ? t(lang, "achievement_done") : `${Math.min(have, need)} / ${need}`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      </>
      )}

      {tab === "lists" && (
      <>
      <PoiList
        title={t(lang, "favorited")}
        icon="heart"
        slugs={favorites}
        bySlug={bySlug}
        empty="Здесь появятся объекты, добавленные в избранное."
      />

      <PoiList
        title={t(lang, "want_to_visit")}
        icon="explore"
        slugs={wantToVisit}
        bySlug={bySlug}
        empty="Отмечайте места, куда планируете попасть."
      />
      </>
      )}

      {tab === "stats" && listens.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 font-semibold"><Icon name="headphones" size={18} className="inline align-[-3px]" /> История прослушиваний</h2>
          <ul className="grid gap-1 rounded-xl p-3 text-sm surface">
            {[...listens]
              .sort((a, b) => b.ts - a.ts)
              .slice(0, 10)
              .map((l) => (
                <li key={l.slug} className="flex justify-between gap-2">
                  <span className="truncate">{l.name}</span>
                  <span className="shrink-0 soft">{l.completed ? "дослушано" : "частично"}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {tab === "settings" && (
      <>
      <section className="mb-5 grid gap-2">
        <Link href="/offline" className="rounded-xl p-3 text-sm transition-colors surface hover:bg-soft">
          <Icon name="download" size={18} className="inline align-[-3px]" /> {t(lang, "offline")}
        </Link>
        <Link href="/sos" className="rounded-xl p-3 text-sm transition-colors surface hover:bg-soft">
          <Icon name="sos" size={18} className="inline align-[-3px]" /> {t(lang, "sos")}
        </Link>
      </section>

      <button
        onClick={() => {
          if (confirm("Удалить все ваши отметки, избранное и штампы? Отменить будет нельзя.")) {
            state.reset();
          }
        }}
        className="w-full rounded-lg px-4 py-2.5 text-sm surface"
      >
        Очистить мои данные
      </button>
      <p className="mt-2 text-xs leading-relaxed soft">
        Данные профиля хранятся только на этом устройстве и никуда не отправляются.
        Аналитика платформы обезличена: в неё попадают события без привязки к вам.
      </p>
      </>
      )}
    </main>
  );
}

function PoiList({
  title,
  icon,
  slugs,
  bySlug,
  empty,
}: {
  title: string;
  icon: "heart" | "explore";
  slugs: string[];
  bySlug: Map<string, Poi>;
  empty: string;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 flex items-center gap-1.5 font-semibold">
        <Icon name={icon} size={18} /> {title} · {slugs.length}
      </h2>
      {slugs.length === 0 ? (
        <p className="rounded-xl p-3 text-sm surface soft">{empty}</p>
      ) : (
        <ul className="grid gap-2">
          {slugs.map((slug) => {
            const poi = bySlug.get(slug);
            if (!poi) return null;
            return (
              <li key={slug}>
                <Link
                  href={`/poi/${slug}`}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors surface hover:bg-soft"
                >
                  <span style={{ color: "var(--primary)" }}><Icon name={poi.category} size={20} /></span>
                  <span className="min-w-0 flex-1 truncate">{poi.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl p-3 surface">
      <div className="text-xl font-semibold" style={{ color: "var(--primary-text)" }}>
        {value}
      </div>
      <div className="text-xs soft">{label}</div>
    </div>
  );
}
