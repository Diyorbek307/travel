"use client";

import { useState } from "react";
import { useAppState } from "./app-state";
import Icon from "./icon";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Цифровой паспорт туриста из макета: имя, уровень, номер и прогресс.
 *
 * Имя вводит сам турист — аккаунтов в приложении нет, и брать его неоткуда.
 * В макете стояло «Алекс Джонсон · Турист из Нью-Йорка», но это подпись на
 * картинке; здесь пустое поле честнее выдуманного человека.
 *
 * Уровень и номер не выдуманы, а посчитаны: уровень растёт от числа
 * посещённых объектов, номер закреплён за устройством при первом запуске.
 */

/** Сколько объектов нужно посетить, чтобы поднять уровень. */
const PER_LEVEL = 5;

export default function PassportCard({
  lang,
  totalPlaces,
}: {
  lang: Lang;
  /** Сколько объектов в базе всего — от этого считается прогресс. */
  totalPlaces: number;
}) {
  const { visits, name, travellerId, setName } = useAppState();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");

  const level = 1 + Math.floor(visits.length / PER_LEVEL);
  const inLevel = visits.length % PER_LEVEL;
  const percent = Math.round((inLevel / PER_LEVEL) * 100);
  const toNext = PER_LEVEL - inLevel;

  return (
    <section
      className="relative mb-5 overflow-hidden p-5 text-white"
      style={{
        background: "linear-gradient(140deg, #2d7b57 0%, #246144 55%, #1d4e37 100%)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      <div className="ornament" aria-hidden />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6rem] uppercase tracking-[0.18em] opacity-75">
            {t(lang, "app_name")} · {t(lang, "country")}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{t(lang, "passport")}</h2>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "var(--accent)", color: "#2b2b2b" }}
        >
          {t(lang, "level")} {level}
        </span>
      </div>

      <div className="relative mt-4 flex items-center gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          <Icon name="user" size={24} />
        </span>

        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setName(draft);
                setEditing(false);
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={40}
                placeholder={t(lang, "passport_name_hint")}
                className="min-w-0 flex-1 rounded-full px-3 py-1.5 text-sm text-[color:var(--text)]"
                style={{ background: "rgba(255,255,255,0.92)" }}
              />
              <button
                type="submit"
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "var(--accent)", color: "#2b2b2b" }}
              >
                {t(lang, "save")}
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setDraft(name ?? "");
                setEditing(true);
              }}
              className="pressable flex items-center gap-1.5 text-left"
            >
              <span className="truncate font-semibold">
                {name ?? t(lang, "passport_name_hint")}
              </span>
              <Icon name="chevron-right" size={16} />
            </button>
          )}

          <p className="mt-0.5 font-mono text-[0.7rem] opacity-75">
            {travellerId ?? "—"}
          </p>
        </div>
      </div>

      {/* Прогресс до следующего уровня. Число посещённых объектов — из
          отметок туриста, а не из воздуха: пока он не отметит посещение,
          полоса стоит на нуле. */}
      <div className="relative mt-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="opacity-85">
            {visits.length} / {totalPlaces} {t(lang, "objects")}
          </span>
          <span className="font-semibold">{percent}%</span>
        </div>
        <div
          className="mt-1.5 h-2 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${percent}%`, background: "var(--accent)" }}
          />
        </div>
        <p className="mt-1.5 text-xs opacity-80">
          {t(lang, "level_next").replace("{n}", String(toNext))}
        </p>
      </div>
    </section>
  );
}
