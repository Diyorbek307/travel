"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./icon";
import PoiCard from "./poi-card";
import { categoryLabel, t } from "@/lib/i18n";
import type { City, Lang, Poi } from "@/lib/types";

/**
 * Поиск по объектам платформы.
 *
 * Ищем по названию, городу и названию категории сразу: турист набирает
 * то, что помнит, а помнит он по-разному — «Регистан», «Самарканд» или
 * «мечеть». Фильтрация на клиенте: объектов сотня, это мгновенно и
 * работает офлайн, когда страница уже открыта.
 */
export default function SearchScreen({
  pois,
  cities,
  lang,
}: {
  pois: Poi[];
  cities: City[];
  lang: Lang;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Индекс строим один раз: приводим к нижнему регистру заранее, чтобы не
  // пересобирать это на каждое нажатие клавиши.
  const index = useMemo(
    () =>
      pois.map((poi) => ({
        poi,
        haystack: [
          poi.name,
          poi.short_desc ?? "",
          cities.find((c) => c.slug === poi.city_slug)?.name ?? "",
          categoryLabel(lang, poi.category),
        ]
          .join(" ")
          .toLowerCase(),
      })),
    [pois, cities, lang],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((x) => x.haystack.includes(q)).map((x) => x.poi);
  }, [index, query]);

  const trimmed = query.trim();

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] px-4 py-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <span className="faint">
            <Icon name="search" size={16} />
          </span>
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(lang, "search_placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={t(lang, "search_clear")}
              className="pressable shrink-0 faint"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          )}
        </span>
      </div>

      {!trimmed ? (
        <>
          <h2 className="mb-2 font-semibold">{t(lang, "choose_city")}</h2>
          <ul className="mb-6 flex flex-wrap gap-2">
            {cities.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => setQuery(c.name)}
                  className="pressable rounded-[var(--radius-full)] px-3.5 py-2 text-sm card hover:shadow-[var(--shadow-2)]"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>

          <h2 className="mb-2 font-semibold">{t(lang, "all_categories")}</h2>
          <ul className="flex flex-wrap gap-2">
            {[...new Set(pois.map((p) => p.category))].map((c) => (
              <li key={c}>
                <button
                  onClick={() => setQuery(categoryLabel(lang, c))}
                  className="pressable flex items-center gap-1.5 rounded-[var(--radius-full)] px-3.5 py-2 text-sm card hover:shadow-[var(--shadow-2)]"
                >
                  <Icon name={c} size={15} />
                  {categoryLabel(lang, c)}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : results.length > 0 ? (
        <>
          <p className="mb-2 text-sm soft">
            {t(lang, "search_found")}: {results.length}
          </p>
          <ul className="grid gap-2">
            {results.map((poi) => (
              <li key={poi.id}>
                <PoiCard poi={poi} lang={lang} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="py-16 text-center">
          <span className="inline-grid h-14 w-14 place-items-center rounded-full faint" style={{ background: "var(--surface-alt)" }}>
            <Icon name="search" size={26} />
          </span>
          <p className="mt-3 font-semibold">{t(lang, "not_found")}</p>
          <p className="mt-1 text-sm soft">{t(lang, "search_try_other")}</p>
          <Link
            href="/map"
            className="pressable mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-4 py-2.5 text-sm font-medium"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {t(lang, "explore_title")}
            <Icon name="chevron-right" size={16} />
          </Link>
        </div>
      )}
    </main>
  );
}
