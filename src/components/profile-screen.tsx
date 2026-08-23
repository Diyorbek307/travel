"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ACHIEVEMENTS, useAppState } from "./app-state";
import { haversine } from "@/lib/geo";
import { t } from "@/lib/i18n";
import { CATEGORY_ICON, type City, type Lang, type Poi } from "@/lib/types";

/**
 * Личный кабинет (п. 12) и туристический паспорт со штампами (п. 13).
 *
 * Все данные лежат в localStorage — регистрация не требуется. Это осознанный
 * выбор для MVP: турист начинает пользоваться приложением сразу после прилёта,
 * а не заполняет форму. Синхронизация между устройствами появится вместе
 * с аккаунтом, формат состояния уже к этому готов.
 */
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

  const bySlug = useMemo(() => new Map(pois.map((p) => [p.slug, p])), [pois]);

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
      <section className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={visits.length} label={t(lang, "places_visited")} />
        <Stat value={visitedCities.size} label={t(lang, "cities_visited")} />
        <Stat value={`${(meters / 1000).toFixed(1)} км`} label={t(lang, "km_walked")} />
        <Stat value={completedListens} label={t(lang, "stories_heard")} />
      </section>

      {/* Туристический паспорт — п. 13 ТЗ */}
      <section className="mb-5">
        <h2 className="mb-2 font-semibold">
          🛂 {t(lang, "passport")} · {visits.length} {t(lang, "stamps")}
        </h2>
        <div className="rounded-xl p-4 surface">
          {visits.length === 0 ? (
            <p className="text-sm soft">
              Пока ни одного штампа. Отметьте посещение на странице объекта — или
              отсканируйте QR-код на месте.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[...visits]
                .sort((a, b) => b.ts - a.ts)
                .map((visit) => {
                  const poi = bySlug.get(visit.slug);
                  const city = cities.find((c) => c.slug === visit.city);
                  return (
                    <li
                      key={visit.slug}
                      className="rounded-lg border-2 border-dashed px-3 py-2"
                      style={{ borderColor: "var(--accent)" }}
                    >
                      <span className="block text-sm font-medium" style={{ color: "var(--accent)" }}>
                        ✓ {poi?.name ?? visit.name}
                      </span>
                      <span className="block text-[0.65rem] soft">
                        {city?.name} · {new Date(visit.ts).toLocaleDateString("ru-RU")}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 font-semibold">🏆 {t(lang, "achievements")}</h2>
        <ul className="grid gap-2">
          {ACHIEVEMENTS.map((a) => {
            const { have, need } = a.progress(state);
            const done = have >= need;
            return (
              <li key={a.id} className="rounded-xl p-3 surface">
                <div className="flex items-center justify-between gap-2">
                  <span className={done ? "" : "opacity-50"}>
                    {a.icon} {a.title[lang] ?? a.title.en}
                  </span>
                  <span className="shrink-0 text-xs soft">
                    {Math.min(have, need)} / {need}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-soft">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(100, (have / need) * 100)}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <PoiList
        title={`❤️ ${t(lang, "favorited")}`}
        slugs={favorites}
        bySlug={bySlug}
        empty="Здесь появятся объекты, добавленные в избранное."
      />

      <PoiList
        title={`📍 ${t(lang, "want_to_visit")}`}
        slugs={wantToVisit}
        bySlug={bySlug}
        empty="Отмечайте места, куда планируете попасть."
      />

      {listens.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 font-semibold">🎧 История прослушиваний</h2>
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

      <section className="mb-5 grid gap-2">
        <Link href="/offline" className="rounded-xl p-3 text-sm transition-colors surface hover:bg-soft">
          ⬇️ {t(lang, "offline")}
        </Link>
        <Link href="/sos" className="rounded-xl p-3 text-sm transition-colors surface hover:bg-soft">
          🆘 {t(lang, "sos")}
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
    </main>
  );
}

function PoiList({
  title,
  slugs,
  bySlug,
  empty,
}: {
  title: string;
  slugs: string[];
  bySlug: Map<string, Poi>;
  empty: string;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 font-semibold">
        {title} · {slugs.length}
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
                  <span className="text-lg">{CATEGORY_ICON[poi.category]}</span>
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
      <div className="text-xl font-semibold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
      <div className="text-xs soft">{label}</div>
    </div>
  );
}
