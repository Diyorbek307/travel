import { useState } from "react";
import { PageHeader, Badge, Btn, Table, Card } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedPlace as Dest } from "@/lib/types";



export default function Destinations() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [dests, setDests] = useEntity("places");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Dest | null>(null);

  const filtered = filter === "all" ? dests : dests.filter((d) => d.status === filter);

  const statusColor = (s: string) =>
    s === "active" ? "teal" : s === "seasonal" ? "amber" : "dim";

  const toggleStatus = (id: string) => {
    setDests((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "active" ? "seasonal" : d.status === "seasonal" ? "draft" : "active" }
          : d
      )
    );
  };

  return (
    <div className="p-7">
      <PageHeader
        title="Направления"
        subtitle={`${filtered.length} направлений`}
        action={<Btn onClick={() => setSelected({ id: "", name: "", city: "", type: "", region: "", rating: 0, reviews: 0, distance: "", entry: "", hours: "", visits: 0, tours: 0, status: "draft", img: "", desc: "", audio: false, qr: false })}>+ Добавить</Btn>}
      />

      {/* Filters + view toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5">
          {(["all", "active", "seasonal", "draft"] as const).map((f) => {
            const filterLabel: Record<string, string> = { all: "Все", active: "Активные", seasonal: "Сезонные", draft: "Черновик" };
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
                {filterLabel[f]}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          {(["grid", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
              style={{
                background: view === v ? "var(--color-dim)" : "transparent",
                color: view === v ? "var(--color-text)" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              {v === "grid" ? "⊞" : "☰"}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((d) => (
            <div
              key={d.id}
              className="rounded-lg overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", transition: "transform 0.15s, border-color 0.15s" }}
              onClick={() => setSelected(d)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-amber)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
              }}
            >
              <div className="relative h-40 overflow-hidden" style={{ background: "var(--color-dim)" }}>
                <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(13,12,10,0.7) 0%, transparent 60%)" }}
                />
                <div className="absolute top-3 right-3">
                  <Badge label={d.status} color={statusColor(d.status) as any} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="font-semibold text-base"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                    >
                      {d.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                      {d.region}
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>
                    ★ {d.rating}
                  </div>
                </div>
                <p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{ color: "var(--color-muted)" }}>
                  {d.desc}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  <span>{d.visits.toLocaleString()} посещений</span>
                  <span>{d.tours} туров</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          cols={["НАЗВАНИЕ", "РЕГИОН", "РЕЙТИНГ", "ПОСЕЩЕНИЯ", "ТУРЫ", "СТАТУС", ""]}
          rows={filtered.map((d) => [
            <span className="font-medium" style={{ color: "var(--color-text)" }}>{d.name}</span>,
            <span style={{ color: "var(--color-muted)" }}>{d.region}</span>,
            <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ {d.rating}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{d.visits.toLocaleString()}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{d.tours}</span>,
            <Badge label={d.status} color={statusColor(d.status) as any} />,
            <div className="flex gap-2">
              <Btn variant="ghost" small onClick={() => toggleStatus(d.id)}>Статус</Btn>
              <Btn variant="ghost" small onClick={() => setSelected(d)}>Изменить</Btn>
            </div>,
          ])}
        />
      )}

      {/* Detail panel */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-xl overflow-hidden w-full max-w-lg"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52" style={{ background: "var(--color-dim)" }}>
              <img src={selected.img} alt={selected.name} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(13,12,10,0.85) 0%, transparent 50%)" }}
              />
              <div className="absolute bottom-4 left-5">
                <h2
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "#fff" }}
                >
                  {selected.name}
                </h2>
                <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {selected.region}
                </div>
              </div>
              <button
                className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100 cursor-pointer text-xl leading-none"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>
                {selected.desc}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Рейтинг", val: `★ ${selected.rating}` },
                  { label: "Посещений", val: selected.visits.toLocaleString() },
                  { label: "Туров", val: String(selected.tours) },
                ].map((s) => (
                  <div key={s.label} className="rounded p-3 text-center" style={{ background: "var(--color-surface)" }}>
                    <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}>
                      {s.val}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
                <Btn onClick={() => setSelected(null)}>Сохранить</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
