import { useCallback, useEffect, useState } from "react";
import { PageHeader, Badge, Btn, StatCard } from "./shared";

/**
 * Отзывы туристов.
 *
 * Публикуются сразу — премодерация каждого задержала бы отзывы на сутки
 * и оставила раздел пустым. Здесь их можно скрыть, и это обратимо:
 * удаления нет, скрытый отзыв возвращается одной кнопкой.
 */

interface Review {
  id: string;
  placeName: string;
  rating: number;
  text: string;
  status: "published" | "hidden";
  createdAt: string;
  name: string;
  photo: string | null;
}

function Звёзды({ n }: { n: number }) {
  return (
    <span style={{ color: "var(--color-amber)" }} aria-label={`${n} из 5`}>
      {"★".repeat(n)}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function Reviews() {
  const [отзывы, setОтзывы] = useState<Review[]>([]);
  const [загрузка, setЗагрузка] = useState(true);
  const [фильтр, setФильтр] = useState<"all" | "published" | "hidden">("all");

  const подтянуть = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const d = (await res.json()) as { reviews: Review[] };
      setОтзывы(d.reviews ?? []);
    } catch {
      setОтзывы([]);
    }
  }, []);

  useEffect(() => {
    подтянуть().finally(() => setЗагрузка(false));
  }, [подтянуть]);

  async function сменить(id: string, status: Review["status"]) {
    setОтзывы((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => подтянуть());
  }

  const список = фильтр === "all" ? отзывы : отзывы.filter((r) => r.status === фильтр);
  const среднее =
    отзывы.length > 0 ? (отзывы.reduce((s, r) => s + r.rating, 0) / отзывы.length).toFixed(1) : "—";

  const ФИЛЬТРЫ: [typeof фильтр, string][] = [
    ["all", "Все"],
    ["published", "Опубликованные"],
    ["hidden", "Скрытые"],
  ];

  return (
    <div className="p-4 sm:p-7">
      <PageHeader title="Отзывы" subtitle={загрузка ? "Загружаем…" : `${отзывы.length} всего`} />

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ВСЕГО" value={String(отзывы.length)} />
        <StatCard label="СРЕДНЯЯ ОЦЕНКА" value={среднее} />
        <StatCard label="ОПУБЛИКОВАНЫ" value={String(отзывы.filter((r) => r.status === "published").length)} />
        <StatCard label="СКРЫТЫ" value={String(отзывы.filter((r) => r.status === "hidden").length)} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {ФИЛЬТРЫ.map(([k, label]) => (
          <Btn key={k} variant={фильтр === k ? "primary" : "ghost"} small onClick={() => setФильтр(k)}>
            {label}
          </Btn>
        ))}
      </div>

      {!загрузка && отзывы.length === 0 && (
        <div
          className="rounded-lg p-8 text-center text-sm leading-relaxed"
          style={{ background: "var(--color-panel)", color: "var(--color-muted)" }}
        >
          Отзывов пока нет. Они появятся, когда турист оценит место в приложении.
        </div>
      )}

      <ul className="grid gap-3">
        {список.map((r) => (
          <li
            key={r.id}
            className="rounded-lg p-4"
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              opacity: r.status === "hidden" ? 0.55 : 1,
            }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {r.photo ? (
                <img src={r.photo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                >
                  {r.name.slice(0, 1)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  {r.name}
                </span>
                <span className="block truncate text-xs" style={{ color: "var(--color-muted)" }}>
                  {r.placeName} · {r.createdAt.slice(0, 10)}
                </span>
              </span>
              <Звёзды n={r.rating} />
              {r.status === "hidden" && <Badge label="скрыт" color="dim" />}
            </div>

            {r.text && (
              <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                {r.text}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {r.status === "published" ? (
                <Btn variant="danger" small onClick={() => сменить(r.id, "hidden")}>
                  Скрыть
                </Btn>
              ) : (
                <Btn variant="ghost" small onClick={() => сменить(r.id, "published")}>
                  Вернуть
                </Btn>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
