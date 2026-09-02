import { useEffect, useState } from "react";
import { PageHeader, Btn, Card, SectionTitle, StatCard } from "./shared";

/**
 * Аналитика по настоящим данным.
 *
 * Показывается только то, что платформа действительно знает: аккаунты,
 * заявки, отзывы, обращения, страны. Посещаемости, глубины просмотра и
 * воронки здесь нет — счётчика событий мы не ведём, и рисовать эти
 * графики значило бы сочинять.
 *
 * Когда появится сбор событий, разделы добавятся сюда же, с той же
 * оговоркой: сперва данные, потом график.
 */

interface Stats {
  пользователи: { всего: number; активные: number; подтверждённые: number; сФотографией: number };
  брони: {
    всего: number;
    новые: number;
    подтверждённые: number;
    отменённые: number;
    поВидам: { hotel: number; restaurant: number; tour: number };
  };
  отзывы: { всего: number; средняяОценка: number; скрытые: number };
  поддержка: { веток: number; непрочитанных: number };
  помесячно: { label: string; новых: number; всего: number }[];
  страны: { name: string; count: number }[];
}

type Метрика = "новых" | "всего";

export default function Analytics() {
  const [s, setS] = useState<Stats | null>(null);
  const [метрика, setМетрика] = useState<Метрика>("всего");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then(setS)
      .catch(() => setS(null));
  }, []);

  if (!s) {
    return (
      <div className="p-4 sm:p-7">
        <PageHeader title="Аналитика" subtitle="Загружаем…" />
      </div>
    );
  }

  const ряд = s.помесячно.map((m) => m[метрика]);
  const пик = Math.max(1, ...ряд);
  const доляПодтверждённых =
    s.пользователи.всего > 0
      ? Math.round((s.пользователи.подтверждённые / s.пользователи.всего) * 100)
      : 0;
  const доляОтменённых =
    s.брони.всего > 0 ? Math.round((s.брони.отменённые / s.брони.всего) * 100) : 0;

  return (
    <div className="p-4 sm:p-7">
      <PageHeader title="Аналитика" subtitle="Только то, что платформа действительно знает" />

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ПОЛЬЗОВАТЕЛЕЙ" value={String(s.пользователи.всего)} sub={`${s.пользователи.активные} активных`} />
        <StatCard label="ПОЧТА ПОДТВЕРЖДЕНА" value={`${доляПодтверждённых}%`} />
        <StatCard label="ЗАЯВОК" value={String(s.брони.всего)} sub={доляОтменённых ? `${доляОтменённых}% отменено` : undefined} />
        <StatCard label="СРЕДНЯЯ ОЦЕНКА" value={s.отзывы.всего ? String(s.отзывы.средняяОценка) : "—"} sub={`${s.отзывы.всего} отзывов`} />
      </div>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>Регистрации по месяцам</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            <Btn variant={метрика === "всего" ? "primary" : "ghost"} small onClick={() => setМетрика("всего")}>
              Накопительно
            </Btn>
            <Btn variant={метрика === "новых" ? "primary" : "ghost"} small onClick={() => setМетрика("новых")}>
              За месяц
            </Btn>
          </div>
        </div>

        {s.пользователи.всего === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Пока никто не зарегистрировался — график появится с первым аккаунтом.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1.5">
            {s.помесячно.map((m, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
                  {m[метрика] || ""}
                </span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max(2, (m[метрика] / пик) * 100)}%`,
                    background: i === s.помесячно.length - 1 ? "var(--color-amber)" : "var(--color-dim)",
                  }}
                />
                <span className="truncate text-[9px]" style={{ color: "var(--color-dim)" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-6 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
        <Card className="p-5">
          <SectionTitle>Страны туристов</SectionTitle>
          {s.страны.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Страну указывают по желанию — пока никто не заполнил.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {s.страны.slice(0, 8).map((c) => (
                <div key={c.name} className="flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--color-muted)" }}>
                    {c.name}
                  </span>
                  <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full sm:w-28" style={{ background: "var(--color-dim)" }}>
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(c.count / s.страны[0].count) * 100}%`,
                        background: "var(--color-teal)",
                      }}
                    />
                  </span>
                  <span className="w-7 shrink-0 text-right text-xs" style={{ color: "var(--color-text)" }}>
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle>Состояние заявок</SectionTitle>
          {s.брони.всего === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Заявок пока нет.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {[
                ["Ждут ответа", s.брони.новые, "var(--color-amber)"],
                ["Подтверждены", s.брони.подтверждённые, "var(--color-teal)"],
                ["Отменены", s.брони.отменённые, "var(--color-rose)"],
              ].map(([label, n, color]) => (
                <div key={String(label)} className="flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1 text-sm" style={{ color: "var(--color-muted)" }}>
                    {label}
                  </span>
                  <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full sm:w-28" style={{ background: "var(--color-dim)" }}>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(Number(n) / s.брони.всего) * 100}%`, background: String(color) }}
                    />
                  </span>
                  <span className="w-7 shrink-0 text-right text-xs" style={{ color: "var(--color-text)" }}>
                    {n}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle>Чего здесь пока нет</SectionTitle>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Посещаемости, глубины просмотра и воронки конверсии в этом разделе нет: счётчик событий
          на платформе не ведётся, и такие графики пришлось бы выдумать. Появится сбор событий —
          появятся и они.
        </p>
      </Card>
    </div>
  );
}
