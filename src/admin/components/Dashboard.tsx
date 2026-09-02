import { useEffect, useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle, StatCard } from "./shared";

/**
 * Сводка по платформе.
 *
 * Все числа настоящие — считаются из аккаунтов, заявок, отзывов и
 * содержимого. Раздел, по которому пока нечего показать, отдаёт ноль и
 * говорит об этом словами. Правдоподобная цифра хуже нуля: по сводке
 * принимают решения, и «18 562 пользователя» при одиннадцати живых —
 * это не украшение, а дезинформация.
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
  содержимое: {
    города: number;
    места: number;
    отели: number;
    рестораны: number;
    маршруты: number;
    события: number;
    реклама: number;
  };
  помесячно: { label: string; новых: number; всего: number }[];
  страны: { name: string; count: number }[];
}

export default function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [s, setS] = useState<Stats | null>(null);
  const [ошибка, setОшибка] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then(setS)
      .catch(() => setОшибка(true));
  }, []);

  if (ошибка) {
    return (
      <div className="p-4 sm:p-7">
        <PageHeader title="Обзор" />
        <p className="text-sm" style={{ color: "var(--color-rose)" }}>
          Не удалось загрузить сводку.
        </p>
      </div>
    );
  }

  if (!s) {
    return (
      <div className="p-4 sm:p-7">
        <PageHeader title="Обзор" subtitle="Загружаем…" />
      </div>
    );
  }

  const сегодня = new Date().toLocaleDateString("ru", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const пикРоста = Math.max(1, ...s.помесячно.map((m) => m.всего));
  const всегоСодержимого =
    s.содержимое.города +
    s.содержимое.места +
    s.содержимое.отели +
    s.содержимое.рестораны +
    s.содержимое.маршруты +
    s.содержимое.события;

  return (
    <div className="p-4 sm:p-7">
      <PageHeader title="Обзор" subtitle={сегодня} />

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ЗАРЕГИСТРИРОВАНО" value={String(s.пользователи.всего)} sub={`${s.пользователи.активные} активных`} />
        <StatCard label="ЗАЯВОК НА БРОНЬ" value={String(s.брони.всего)} sub={`${s.брони.новые} ждут ответа`} />
        <StatCard label="ОТЗЫВОВ" value={String(s.отзывы.всего)} sub={s.отзывы.всего ? `оценка ${s.отзывы.средняяОценка}` : "пока нет"} />
        <StatCard label="ОБРАЩЕНИЙ" value={String(s.поддержка.веток)} sub={`${s.поддержка.непрочитанных} без ответа`} />
      </div>

      {/* Требуют внимания прямо сейчас */}
      {(s.брони.новые > 0 || s.поддержка.непрочитанных > 0) && (
        <Card className="mb-6 p-5">
          <SectionTitle>Ждут вас</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {s.брони.новые > 0 && (
              <Btn small onClick={() => onNavigate("bookings")}>
                {s.брони.новые} заявок на бронь
              </Btn>
            )}
            {s.поддержка.непрочитанных > 0 && (
              <Btn small onClick={() => onNavigate("chat")}>
                {s.поддержка.непрочитанных} сообщений в поддержку
              </Btn>
            )}
          </div>
        </Card>
      )}

      <div className="mb-6 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
        {/* Рост числа аккаунтов */}
        <Card className="p-5">
          <SectionTitle>Регистрации за год</SectionTitle>
          {s.пользователи.всего === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Пока никто не зарегистрировался.
            </p>
          ) : (
            <>
              <div className="mb-2 flex h-32 items-end gap-1">
                {s.помесячно.map((m, i) => (
                  <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
                    {/* Обёртка с flex-1 задаёт колонке определённую
                        высоту: без неё процент у полосы не от чего
                        считать, и график выходил пустым. */}
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${Math.max(2, (m.всего / пикРоста) * 100)}%`,
                          background:
                            i === s.помесячно.length - 1 ? "var(--color-amber)" : "var(--color-dim)",
                        }}
                        title={`${m.label}: ${m.всего}`}
                      />
                    </div>
                    <span className="truncate text-[9px]" style={{ color: "var(--color-dim)" }}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Накопительно. Последний месяц: +{s.помесячно[s.помесячно.length - 1]?.новых ?? 0}
              </p>
            </>
          )}
        </Card>

        {/* Заявки по видам */}
        <Card className="p-5">
          <SectionTitle>Заявки по видам</SectionTitle>
          {s.брони.всего === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Заявок пока нет.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {[
                ["Отели", s.брони.поВидам.hotel, "var(--color-amber)"],
                ["Рестораны", s.брони.поВидам.restaurant, "var(--color-teal)"],
                ["Туры", s.брони.поВидам.tour, "var(--color-rose)"],
              ].map(([label, n, color]) => (
                <div key={String(label)} className="flex flex-wrap items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: String(color) }} />
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

      {/* Откуда туристы */}
      <Card className="mb-6 p-5">
        <SectionTitle>Откуда туристы</SectionTitle>
        {s.страны.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Страну указывают по желанию — пока никто не заполнил.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {s.страны.slice(0, 12).map((c) => (
              <Badge key={c.name} label={`${c.name} · ${c.count}`} color="teal" />
            ))}
          </div>
        )}
      </Card>

      {/* Содержимое платформы */}
      <Card className="p-5">
        <SectionTitle>Содержимое платформы · {всегоСодержимого}</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Города", s.содержимое.города, "cities"],
            ["Места", s.содержимое.места, "destinations"],
            ["Отели", s.содержимое.отели, "hotels"],
            ["Рестораны", s.содержимое.рестораны, "restaurants"],
            ["Маршруты", s.содержимое.маршруты, "tours"],
            ["События", s.содержимое.события, "events"],
            ["Реклама", s.содержимое.реклама, "ads"],
          ].map(([label, n, куда]) => (
            <button
              key={String(label)}
              onClick={() => onNavigate(String(куда))}
              className="cursor-pointer rounded-lg p-3 text-left"
              style={{ background: "var(--color-bg)" }}
            >
              <span className="block text-xs" style={{ color: "var(--color-muted)" }}>
                {label}
              </span>
              <span className="block text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                {n}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
