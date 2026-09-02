"use client";

import { useEffect, useState } from "react";
import { BORDER, GOLD, MUTED, TEXT, WHITE } from "@/lib/theme";

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
  rating: number;
  text: string;
  createdAt: string;
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
  const [отзывы, setОтзывы] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [итог, setИтог] = useState<"нет" | "ок" | "нужен-вход" | "ошибка">("нет");
  const [идёт, setИдёт] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?placeId=${encodeURIComponent(placeId)}`)
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d: { reviews: Review[] }) => setОтзывы(d.reviews))
      .catch(() => setОтзывы([]));
  }, [placeId]);

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
      setОтзывы((p) => [d.review, ...p.filter((r) => r.id !== d.review.id)]);
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
    <section className="mx-4 mb-4 rounded-2xl p-4" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          Отзывы
        </p>
        {среднее && (
          <span className="text-xs" style={{ color: MUTED }}>
            <Звёзды n={Math.round(Number(среднее))} /> {среднее} · {отзывы.length}
          </span>
        )}
      </div>

      <form onSubmit={отправить} className="mb-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} из 5`}
              className="px-0.5 text-xl"
              style={{ color: n <= rating ? GOLD : "rgba(0,0,0,0.18)" }}
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
          placeholder="Что понравилось, что нет"
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--cream)", border: `1px solid ${BORDER}`, color: TEXT }}
        />

        {итог === "нужен-вход" && (
          <p className="text-xs" style={{ color: "#c1603a" }}>
            Чтобы оставить отзыв, войдите в аккаунт.
          </p>
        )}
        {итог === "ок" && (
          <p className="text-xs" style={{ color: MUTED }}>
            Спасибо, отзыв опубликован.
          </p>
        )}

        <button
          type="submit"
          disabled={идёт}
          className="rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? "Отправляем…" : "Оставить отзыв"}
        </button>
      </form>

      {отзывы.length === 0 ? (
        <p className="text-xs" style={{ color: MUTED }}>
          Отзывов пока нет — ваш будет первым.
        </p>
      ) : (
        <ul className="grid gap-3">
          {отзывы.slice(0, 10).map((r) => (
            <li key={r.id} className="border-t pt-3" style={{ borderColor: BORDER }}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Звёзды n={r.rating} размер={12} />
                <span className="text-[11px]" style={{ color: MUTED }}>
                  {r.createdAt.slice(0, 10)}
                </span>
              </div>
              {r.text && (
                <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                  {r.text}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
