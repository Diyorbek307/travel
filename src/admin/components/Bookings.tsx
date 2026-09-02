import { useCallback, useEffect, useState } from "react";
import { PageHeader, Badge, Btn, Table, StatCard } from "./shared";

/**
 * Заявки на бронь.
 *
 * Приходят из приложения: турист оставляет их на странице отеля,
 * ресторана или тура. Подтверждает администратор вручную — интеграции с
 * системами заведений нет, и обещать место автоматически было бы
 * обманом.
 */

interface Booking {
  id: string;
  kind: "hotel" | "restaurant" | "tour";
  itemName: string;
  date: string;
  guests: number;
  note: string;
  status: "new" | "confirmed" | "cancelled";
  createdAt: string;
  name: string;
  email: string;
  country: string;
}

const ВИД: Record<Booking["kind"], string> = {
  hotel: "Отель",
  restaurant: "Ресторан",
  tour: "Тур",
};

const ЦВЕТ: Record<Booking["status"], "teal" | "amber" | "rose"> = {
  confirmed: "teal",
  new: "amber",
  cancelled: "rose",
};

const ПОДПИСЬ: Record<Booking["status"], string> = {
  confirmed: "подтверждена",
  new: "новая",
  cancelled: "отменена",
};

export default function Bookings() {
  const [брони, setБрони] = useState<Booking[]>([]);
  const [загрузка, setЗагрузка] = useState(true);
  const [фильтр, setФильтр] = useState<"all" | Booking["status"]>("all");

  const подтянуть = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const d = (await res.json()) as { bookings: Booking[] };
      setБрони(d.bookings ?? []);
    } catch {
      setБрони([]);
    }
  }, []);

  useEffect(() => {
    подтянуть().finally(() => setЗагрузка(false));
  }, [подтянуть]);

  async function сменить(id: string, status: Booking["status"]) {
    // Показываем изменение сразу, не дожидаясь ответа: список длинный, и
    // задержка выглядела бы как несработавшая кнопка.
    setБрони((p) => p.map((b) => (b.id === id ? { ...b, status } : b)));
    await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => подтянуть());
  }

  const список = фильтр === "all" ? брони : брони.filter((b) => b.status === фильтр);

  const ФИЛЬТРЫ: [typeof фильтр, string][] = [
    ["all", "Все"],
    ["new", "Новые"],
    ["confirmed", "Подтверждённые"],
    ["cancelled", "Отменённые"],
  ];

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Бронирования"
        subtitle={загрузка ? "Загружаем…" : `${брони.length} заявок`}
      />

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ВСЕГО" value={String(брони.length)} />
        <StatCard label="ЖДУТ ОТВЕТА" value={String(брони.filter((b) => b.status === "new").length)} />
        <StatCard label="ПОДТВЕРЖДЕНО" value={String(брони.filter((b) => b.status === "confirmed").length)} />
        <StatCard label="ГОСТЕЙ" value={String(брони.reduce((s, b) => s + b.guests, 0))} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {ФИЛЬТРЫ.map(([k, label]) => (
          <Btn key={k} variant={фильтр === k ? "primary" : "ghost"} small onClick={() => setФильтр(k)}>
            {label}
          </Btn>
        ))}
      </div>

      {!загрузка && брони.length === 0 && (
        <div
          className="rounded-lg p-8 text-center text-sm leading-relaxed"
          style={{ background: "var(--color-panel)", color: "var(--color-muted)" }}
        >
          Заявок пока нет. Они появятся здесь, когда турист забронирует номер, столик или тур в
          приложении.
        </div>
      )}

      {список.length > 0 && (
        <Table
          cols={["ТУРИСТ", "ЧТО", "ДАТА", "ГОСТЕЙ", "СТАТУС", ""]}
          rows={список.map((b) => [
            <span key="n" className="block min-w-0">
              <span className="block truncate">{b.name}</span>
              <span className="block truncate text-xs" style={{ color: "var(--color-muted)" }}>
                {b.email}
              </span>
            </span>,
            <span key="i" className="block min-w-0">
              <span className="block truncate">{b.itemName}</span>
              <span className="block text-xs" style={{ color: "var(--color-muted)" }}>
                {ВИД[b.kind]}
              </span>
            </span>,
            b.date,
            String(b.guests),
            <Badge key="s" label={ПОДПИСЬ[b.status]} color={ЦВЕТ[b.status]} />,
            <span key="a" className="flex flex-wrap gap-2">
              {b.status !== "confirmed" && (
                <Btn variant="ghost" small onClick={() => сменить(b.id, "confirmed")}>
                  Подтвердить
                </Btn>
              )}
              {b.status !== "cancelled" && (
                <Btn variant="danger" small onClick={() => сменить(b.id, "cancelled")}>
                  Отменить
                </Btn>
              )}
            </span>,
          ])}
        />
      )}
    </div>
  );
}
