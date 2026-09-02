import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";

type Booking = {
  id: string;
  customer: string;
  email: string;
  tour: string;
  hotel: string;
  departure: string;
  pax: number;
  total: number;
  paid: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  created: string;
};

const BOOKINGS: Booking[] = [
  { id: "BK-2640", customer: "Alisher Nazarov", email: "ali.nazarov@mail.uz", tour: "Silk Road Classic", hotel: "Malika Classic", departure: "Sep 8, 2026", pax: 2, total: 3780, paid: 3780, status: "confirmed", created: "Aug 28" },
  { id: "BK-2639", customer: "Maria Chen", email: "m.chen@gmail.com", tour: "Registan Sunrise", hotel: "Samarkand Palace", departure: "Sep 3, 2026", pax: 1, total: 630, paid: 315, status: "pending", created: "Aug 28" },
  { id: "BK-2638", customer: "James Walker", email: "j.walker@outlook.com", tour: "Fergana Artisan Trail", hotel: "Fergana Grand", departure: "Sep 10, 2026", pax: 4, total: 3120, paid: 3120, status: "confirmed", created: "Aug 27" },
  { id: "BK-2637", customer: "Fatima Al-Hassan", email: "fatima.h@dubai.ae", tour: "Bukhara Jewish Heritage", hotel: "Ark Palace Boutique", departure: "TBD", pax: 2, total: 1340, paid: 670, status: "pending", created: "Aug 27" },
  { id: "BK-2636", customer: "Dmitri Volkov", email: "d.volkov@yandex.ru", tour: "Khiva Night Tour", hotel: "Orient Star Khiva", departure: "Sep 4, 2026", pax: 1, total: 430, paid: 0, status: "cancelled", created: "Aug 26" },
  { id: "BK-2635", customer: "Sophie Bernhard", email: "s.bernhard@gmail.de", tour: "Silk Road Classic", hotel: "Malika Classic", departure: "Aug 24, 2026", pax: 2, total: 3780, paid: 3780, status: "completed", created: "Aug 1" },
  { id: "BK-2634", customer: "Tariq Hassan", email: "tariq@cairo.eg", tour: "Aral Sea Expedition", hotel: "—", departure: "Oct 1, 2026", pax: 2, total: 2480, paid: 1240, status: "confirmed", created: "Aug 25" },
  { id: "BK-2633", customer: "Yuki Tanaka", email: "yuki.t@jp.co", tour: "Nurata Trek & Yurt", hotel: "—", departure: "Sep 12, 2026", pax: 3, total: 1860, paid: 1860, status: "confirmed", created: "Aug 24" },
  { id: "BK-2632", customer: "Elena Morozova", email: "e.morozova@mail.ru", tour: "Tashkent Modern", hotel: "Wyndham Tashkent", departure: "Sep 5, 2026", pax: 2, total: 880, paid: 880, status: "completed", created: "Aug 20" },
  { id: "BK-2631", customer: "Ahmed Khalil", email: "a.khalil@eg.com", tour: "Silk Road Classic", hotel: "Samarkand Palace", departure: "Oct 15, 2026", pax: 6, total: 11340, paid: 5670, status: "confirmed", created: "Aug 18" },
];

const FILTER_LABELS: Record<string, string> = {
  all: "Все",
  confirmed: "Подтверждён",
  pending: "Ожидание",
  completed: "Завершён",
  cancelled: "Отменён",
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newBooking, setNewBooking] = useState({ customer: "", email: "", tour: "", hotel: "", departure: "", pax: "1", total: "" });

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const statusColor = (s: string) => {
    if (s === "confirmed") return "teal";
    if (s === "pending") return "amber";
    if (s === "cancelled") return "rose";
    return "dim";
  };

  const totalRev = filtered.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.paid, 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
    setSelected(null);
  };

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Бронирования"
        subtitle={`${filtered.length} бронирований · $${totalRev.toLocaleString()} получено`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Новое бронирование</Btn>}
      />

      {pendingCount > 0 && (
        <div
          className="rounded-lg px-4 py-3 mb-6 flex items-center gap-3 text-sm"
          style={{
            background: "rgba(212,135,42,0.1)",
            border: "1px solid rgba(212,135,42,0.25)",
            color: "var(--color-amber-light)",
          }}
        >
          <span>⚠</span>
          <span>{pendingCount} бронирований ожидают подтверждения — частичная оплата</span>
          <button
            className="ml-auto text-xs cursor-pointer underline opacity-70 hover:opacity-100"
            onClick={() => setFilter("pending")}
          >
            Просмотреть
          </button>
        </div>
      )}

      <div className="flex gap-1.5 mb-6">
        {["all", "confirmed", "pending", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
              color: filter === f ? "#0d0c0a" : "var(--color-muted)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <Table
        cols={["НОМ", "КЛИЕНТ", "ТУР", "ОТЕЛЬ", "ОТПРАВЛЕНИЕ", "МЕСТ", "ИТОГО", "ОПЛАЧЕНО", "СТАТУС", ""]}
        rows={filtered.map((b) => [
          <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{b.id}</span>,
          <div>
            <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{b.customer}</div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>{b.email}</div>
          </div>,
          <span className="text-sm" style={{ color: "var(--color-text)" }}>{b.tour}</span>,
          <span className="text-sm" style={{ color: "var(--color-muted)" }}>{b.hotel}</span>,
          <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{b.departure}</span>,
          <span style={{ fontFamily: "var(--font-mono)" }}>{b.pax}</span>,
          <span style={{ fontFamily: "var(--font-mono)" }}>${b.total.toLocaleString()}</span>,
          <div>
            <div style={{ fontFamily: "var(--font-mono)", color: b.paid === b.total ? "var(--color-teal)" : "var(--color-amber)" }}>
              ${b.paid.toLocaleString()}
            </div>
            {b.paid < b.total && b.status !== "cancelled" && (
              <div style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                ${(b.total - b.paid).toLocaleString()} долг
              </div>
            )}
          </div>,
          <Badge label={b.status} color={statusColor(b.status) as any} />,
          <Btn variant="ghost" small onClick={() => setSelected(b)}>Просмотр</Btn>,
        ])}
      />

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-xl w-full max-w-md p-6"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                >
                  Бронирование {selected.id}
                </h3>
                <div className="mt-1">
                  <Badge label={selected.status} color={statusColor(selected.status) as any} />
                </div>
              </div>
              <button
                className="text-xl opacity-50 hover:opacity-100 cursor-pointer"
                style={{ color: "var(--color-text)" }}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "Клиент", val: selected.customer },
                { label: "Email", val: selected.email },
                { label: "Тур", val: selected.tour },
                { label: "Отель", val: selected.hotel },
                { label: "Отправление", val: selected.departure },
                { label: "Мест", val: String(selected.pax) },
                { label: "Итого", val: `$${selected.total.toLocaleString()}` },
                { label: "Оплачено", val: `$${selected.paid.toLocaleString()}` },
                { label: "Долг", val: `$${(selected.total - selected.paid).toLocaleString()}` },
                { label: "Создано", val: selected.created },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2 text-sm py-1.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ color: "var(--color-muted)" }}>{row.label}</span>
                  <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>{row.val}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              {selected.status !== "cancelled" && selected.status !== "completed" && (
                <Btn variant="danger" onClick={() => cancelBooking(selected.id)}>Отменить</Btn>
              )}
              <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
              {selected.status === "pending" && <Btn onClick={() => {
                setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, status: "confirmed" } : b));
                setSelected(null);
              }}>Подтвердить</Btn>}
            </div>
          </div>
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Новое бронирование</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {([["customer","Клиент","text"],["email","Email","email"],["tour","Тур","text"],["hotel","Отель","text"],["departure","Дата отправления","text"],["pax","Кол-во мест","number"],["total","Стоимость ($)","number"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newBooking as any)[k]} onChange={e => setNewBooking(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newBooking.customer || !newBooking.tour) return;
                const total = Number(newBooking.total) || 0;
                const nextNum = Math.max(...bookings.map(b => parseInt(b.id.replace("BK-","")))) + 1;
                setBookings(prev => [{
                  id: `BK-${nextNum}`, customer: newBooking.customer, email: newBooking.email,
                  tour: newBooking.tour, hotel: newBooking.hotel || "—", departure: newBooking.departure || "TBD",
                  pax: Number(newBooking.pax) || 1, total, paid: 0, status: "pending" as const,
                  created: new Date().toLocaleDateString("ru", { day: "numeric", month: "short" }),
                }, ...prev]);
                setShowAdd(false);
                setNewBooking({ customer: "", email: "", tour: "", hotel: "", departure: "", pax: "1", total: "" });
              }}>Создать</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
