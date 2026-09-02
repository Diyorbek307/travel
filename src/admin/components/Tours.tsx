import { useState } from "react";
import { PageHeader, Badge, Btn, Table, Card, SectionTitle } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedRoute as Tour } from "@/lib/types";



export default function Tours() {
  const [tours, setTours] = useEntity("routes");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<Tour | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTour, setNewTour] = useState({ title: "", duration: "", price: "", category: "Cultural", guide: "", maxGroup: "" });

  const categories = ["all", ...Array.from(new Set(tours.map((t) => t.category)))];
  const statusFilter = filter === "all" ? tours : tours.filter((t) => t.status === filter);
  const filtered = catFilter === "all" ? statusFilter : statusFilter.filter((t) => t.category === catFilter);

  const diffColor = (d: string) =>
    d === "Easy" ? "teal" : d === "Moderate" ? "amber" : "rose";

  const statusColor = (s: string) =>
    s === "active" ? "teal" : s === "draft" ? "dim" : "rose";

  const toggleStatus = (id: string) => {
    setTours((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "active" ? "paused" : "active" }
          : t
      )
    );
  };

  const totalRevenue = filtered.reduce((s, t) => s + t.price * t.bookings, 0);

  return (
    <div className="p-7">
      <PageHeader
        title="Туры"
        subtitle={`${filtered.length} туров · $${totalRevenue.toLocaleString()} общая выручка`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Добавить тур</Btn>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "active", "paused", "draft"].map((f) => {
            const statusLabel: Record<string, string> = { all: "Все", active: "Активные", paused: "Приостановлены", draft: "Черновик" };
            return (
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
                {statusLabel[f]}
              </button>
            );
          })}
        </div>
        <div
          className="w-px h-5 shrink-0"
          style={{ background: "var(--color-border)" }}
        />
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="px-3 py-1.5 rounded text-xs transition-all cursor-pointer capitalize"
              style={{
                background: catFilter === c ? "rgba(212,135,42,0.15)" : "transparent",
                color: catFilter === c ? "var(--color-amber)" : "var(--color-muted)",
                border: `1px solid ${catFilter === c ? "rgba(212,135,42,0.4)" : "var(--color-border)"}`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Table
        cols={["НАЗВАНИЕ", "ДЛИТЕЛЬНОСТЬ", "ЦЕНА", "СЛОЖНОСТЬ", "ОТПРАВЛЕНИЕ", "ГИД", "БРОНИ", "СТАТУС", ""]}
        rows={filtered.map((t) => [
          <div>
            <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{t.title}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{t.category}</div>
          </div>,
          <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.duration}</span>,
          <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>${t.price.toLocaleString()}</span>,
          <Badge label={t.difficulty} color={diffColor(t.difficulty) as any} />,
          <span style={{ color: "var(--color-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>{t.nextDep}</span>,
          <span style={{ color: "var(--color-muted)", fontSize: "12px" }}>{t.guide}</span>,
          <div>
            <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{t.bookings}</span>
            <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>/{t.maxGroup} max</span>
          </div>,
          <Badge label={t.status} color={statusColor(t.status) as any} />,
          <div className="flex gap-2">
            <Btn variant="ghost" small onClick={() => setEditing(t)}>Изменить</Btn>
            <Btn variant={t.status === "active" ? "danger" : "ghost"} small onClick={() => toggleStatus(t.id)}>
              {t.status === "active" ? "Приостановить" : "Активировать"}
            </Btn>
          </div>,
        ])}
      />

      {/* Add tour modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Новый тур</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {([["name","Название тура","text"],["duration","Длительность","text"],["price","Цена ($)","number"],["guide","Гид","text"],["maxGroup","Макс. группа","number"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newTour as any)[k]} onChange={e => setNewTour(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>КАТЕГОРИЯ</label>
                <div className="flex gap-1.5 flex-wrap">
                  {["Cultural","Adventure","Craft","Expedition","Food & Wine","Urban"].map(c => (
                    <button key={c} onClick={() => setNewTour(p => ({ ...p, category: c }))}
                      className="px-2.5 py-1 rounded text-xs cursor-pointer"
                      style={{ background: newTour.category === c ? "var(--color-amber)" : "var(--color-surface)", color: newTour.category === c ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newTour.title) return;
                setTours(prev => [...prev, {
                  id: `new-${Date.now()}`, title: newTour.title, duration: newTour.duration || "1 day",
                  price: Number(newTour.price) || 100, difficulty: "Easy" as const, category: newTour.category,
                  bookings: 0, maxGroup: Number(newTour.maxGroup) || 12, status: "draft" as const,
                  nextDep: "TBD", guide: newTour.guide || "Не назначен", rating: 0,
                  sub: newTour.category, icon: "🗺️", color: "#2E7D5A",
                  badge: newTour.category, stops: [],
                }]);
                setShowAdd(false);
                setNewTour({ title: "", duration: "", price: "", category: "Cultural", guide: "", maxGroup: "" });
              }}>Создать</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setEditing(null)}
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
                  {editing.title}
                </h3>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  Тур ID #{editing.id}
                </div>
              </div>
              <button
                className="text-xl opacity-50 hover:opacity-100 cursor-pointer"
                style={{ color: "var(--color-text)" }}
                onClick={() => setEditing(null)}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Длительность", val: editing.duration },
                { label: "Цена", val: `$${editing.price}` },
                { label: "Сложность", val: editing.difficulty },
                { label: "Брони", val: String(editing.bookings) },
                { label: "Размер группы", val: String(editing.maxGroup) },
                { label: "Рейтинг", val: editing.rating > 0 ? `★ ${editing.rating}` : "Н/Д" },
              ].map((s) => (
                <div key={s.label} className="rounded p-3" style={{ background: "var(--color-surface)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div className="mb-5 rounded p-3" style={{ background: "var(--color-surface)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>Гид</div>
              <div className="text-sm" style={{ color: "var(--color-text)" }}>{editing.guide}</div>
            </div>

            <div className="flex gap-3 justify-end">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Отмена</Btn>
              <Btn onClick={() => setEditing(null)}>Сохранить</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
