"use client";

import { ПросьбаВойти } from "./auth-prompt";
import { useEffect, useState } from "react";
import { BORDER, GOLD, MUTED, TEXT, SURFACE, ON_GOLD } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import { датаСловами } from "@/lib/i18n";

/**
 * Отзывы о месте.
 *
 * Показываются сразу после отправки: держать отзыв сутки на модерации
 * значит превратить раздел в пустой. Скрыть неподходящий можно в панели.
 *
 * Один человек — один отзыв на место: повторный заменяет прежний, иначе
 * оценку накручивают с одного аккаунта.
 */

interface Review {
  id: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: string;
  status?: "published" | "hidden";
  /** Имя автора. У отзывов, оставленных до его сохранения, отсутствует. */
  userName?: string;
}

/*
 * Отзывы места держим в общем кэше: их показывает и форма внизу, и шапка
 * карточки (рейтинг, число отзывов). Оставил отзыв — цифры в шапке
 * меняются сразу, без второго запроса и без перезагрузки.
 */
const кэш = new Map<string, Review[]>();
const слушатели = new Map<string, Set<() => void>>();

function положить(placeId: string, отзывы: Review[]) {
  кэш.set(placeId, отзывы);
  слушатели.get(placeId)?.forEach((f) => f());
}

function useОтзывы(placeId: string): [Review[], (f: (p: Review[]) => Review[]) => void] {
  const [, обновить] = useState(0);
  useEffect(() => {
    const f = () => обновить((n) => n + 1);
    const набор = слушатели.get(placeId) ?? new Set();
    набор.add(f);
    слушатели.set(placeId, набор);
    if (!кэш.has(placeId)) {
      кэш.set(placeId, []);
      fetch(`/api/reviews?placeId=${encodeURIComponent(placeId)}`)
        .then((r) => (r.ok ? r.json() : { reviews: [] }))
        .then((d: { reviews: Review[] }) => положить(placeId, d.reviews))
        .catch(() => кэш.delete(placeId));
    }
    return () => {
      набор.delete(f);
    };
  }, [placeId]);
  return [кэш.get(placeId) ?? [], (f) => положить(placeId, f(кэш.get(placeId) ?? []))];
}

/**
 * Рейтинг для шапки карточки: к оценке из данных добавляются отзывы,
 * оставленные в приложении. Новый отзыв сразу виден в числе отзывов.
 */
export function useРейтинг(placeId: string, рейтинг: number, отзывов: number) {
  const [свои] = useОтзывы(placeId);
  if (свои.length === 0) return { рейтинг, отзывов };
  const сумма = свои.reduce((s, r) => s + r.rating, 0);
  const всего = отзывов + свои.length;
  return { рейтинг: Math.round(((рейтинг * отзывов + сумма) / всего) * 10) / 10, отзывов: всего };
}

function Звёзды({ n, размер = 14 }: { n: number; размер?: number }) {
  return (
    <span style={{ color: GOLD, fontSize: размер }} aria-label={`${n} из 5`}>
      {"★".repeat(n)}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function ReviewForm({ placeId, placeName }: { placeId: string; placeName: string }) {
  const [отзывы, setОтзывы] = useОтзывы(placeId);
  const [все, setВсе] = useState(false);
  const { t, lang } = useT();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [итог, setИтог] = useState<"нет" | "ок" | "нужен-вход" | "ошибка">("нет");
  const [идёт, setИдёт] = useState(false);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setИдёт(true);
    setИтог("нет");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, placeName, rating, text }),
      });
      if (res.status === 401) {
        setИтог("нужен-вход");
        return;
      }
      if (!res.ok) {
        setИтог("ошибка");
        return;
      }
      const d = (await res.json()) as { review: Review };
      // Прежний отзыв этого человека заменяется новым. Скрытый модератором
      // так и остаётся скрытым — в общий список его не ставим.
      setОтзывы((p) => {
        const без = p.filter((r) => r.userId !== d.review.userId);
        return d.review.status === "hidden" ? без : [d.review, ...без];
      });
      setText("");
      setИтог("ок");
    } catch {
      setИтог("ошибка");
    } finally {
      setИдёт(false);
    }
  }

  const среднее =
    отзывы.length > 0 ? (отзывы.reduce((s, r) => s + r.rating, 0) / отзывы.length).toFixed(1) : null;

  return (
    <section className="mb-4 rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
          {t("rev_title")}
        </p>
        {среднее && (
          <span className="text-xs" style={{ color: MUTED }}>
            <Звёзды n={Math.round(Number(среднее))} /> {среднее} · {отзывы.length}
          </span>
        )}
      </div>

      {отзывы.length > 0 && (
        <div className="mb-4 flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((n) => {
            const сколько = отзывы.filter((r) => r.rating === n).length;
            return (
              <div key={n} className="flex items-center gap-2 text-[11px]" style={{ color: MUTED }}>
                <span className="w-6">{n}★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: BORDER }}>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(сколько / отзывы.length) * 100}%`, background: GOLD }}
                  />
                </span>
                <span className="w-5 text-right">{сколько}</span>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={отправить} className="mb-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} из 5`}
              className="px-0.5 text-xl"
              style={{ color: n <= rating ? GOLD : "color-mix(in srgb, var(--muted) 40%, transparent)" }}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder={t("review_ph")}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--cream)", border: `1px solid ${BORDER}`, color: TEXT }}
        />

        {итог === "нужен-вход" && <ПросьбаВойти текст="rev_need_login" компактно />}
        {итог === "ок" && (
          <p className="text-xs" style={{ color: MUTED }}>
            {t("rev_thanks")}
          </p>
        )}

        <button
          type="submit"
          disabled={идёт}
          className="rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
          style={{ background: GOLD, color: ON_GOLD }}
        >
          {идёт ? t("rev_sending") : t("rev_submit")}
        </button>
      </form>

      {отзывы.length === 0 ? (
        <p className="text-xs" style={{ color: MUTED }}>
          {t("rev_empty")}
        </p>
      ) : (
        <ul className="grid gap-3">
          {(все ? отзывы : отзывы.slice(0, 5)).map((r) => (
            <li key={r.id} className="border-t pt-3" style={{ borderColor: BORDER }}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Звёзды n={r.rating} размер={12} />
                {r.userName && (
                  <span className="text-[11px] font-semibold" style={{ color: TEXT }}>
                    {r.userName}
                  </span>
                )}
                <span className="text-[11px]" style={{ color: MUTED }}>
                  {датаСловами(new Date(r.createdAt), lang, "short")}
                </span>
              </div>
              {r.text && (
                <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                  {r.text}
                </p>
              )}
            </li>
          ))}
          {!все && отзывы.length > 5 && (
            <li>
              <button
                onClick={() => setВсе(true)}
                className="w-full rounded-xl py-2 text-xs font-semibold"
                style={{ border: `1px solid ${BORDER}`, color: TEXT }}
              >
                {t("rev_title")} · {отзывы.length}
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
