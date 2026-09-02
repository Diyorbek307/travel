import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedHotel as Hotel } from "@/lib/types";



type HotelForm = { name: string; city: string; stars: string; rooms: string; priceFrom: string };
const EMPTY_FORM: HotelForm = { name: "", city: "", stars: "3", rooms: "", priceFrom: "" };

export default function Hotels() {
  const [hotels, setHotels] = useEntity("hotels");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<HotelForm>(EMPTY_FORM);

  const openEdit = (h: Hotel) => {
    setEditing(h);
    setForm({ name: h.name, city: h.city, stars: String(h.stars), rooms: String(h.rooms), priceFrom: String(h.priceFrom) });
  };

  const saveEdit = () => {
    if (!editing) return;
    setHotels(prev => prev.map(h => h.id === editing.id ? {
      ...h, name: form.name || h.name, city: form.city || h.city,
      stars: Number(form.stars) || h.stars, rooms: Number(form.rooms) || h.rooms,
      priceFrom: Number(form.priceFrom) || h.priceFrom,
    } : h));
    setEditing(null);
  };

  const saveNew = () => {
    if (!form.name) return;
    const newHotel: Hotel = {
      id: `new-${Date.now()}`, name: form.name, city: form.city || "Tashkent",
      stars: Number(form.stars) || 3, rooms: Number(form.rooms) || 20,
      occupied: 0, priceFrom: Number(form.priceFrom) || 80,
      rating: 0, reviews: 0, status: "active", facilities: ["WiFi"],
      price: `$${Number(form.priceFrom) || 80}`, tag: "Новый", desc: "", imgs: [],
      img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=80&h=60&fit=crop&auto=format",
    };
    setHotels(prev => [...prev, newHotel]);
    setShowAdd(false);
    setForm(EMPTY_FORM);
  };

  const toggleSuspend = (id: string) => setHotels(prev => prev.map(h =>
    h.id === id ? { ...h, status: h.status === "active" ? "suspended" as const : "active" as const } : h
  ));

  const filtered = filter === "all" ? hotels : hotels.filter((h) => h.city === filter);
  const cities = ["all", ...Array.from(new Set(hotels.map((h) => h.city)))];

  const occupancy = (h: Hotel) => Math.round((h.occupied / h.rooms) * 100);
  const statusColor = (s: string) =>
    s === "active" ? "teal" : s === "maintenance" ? "amber" : "rose";

  const totalRooms = filtered.reduce((s, h) => s + h.rooms, 0);
  const totalOccupied = filtered.reduce((s, h) => s + h.occupied, 0);
  const avgOccupancy = Math.round((totalOccupied / totalRooms) * 100);

  return (
    <div className="p-7">
      <PageHeader
        title="Отели"
        subtitle={`${filtered.length} объектов · ${avgOccupancy}% средн. заполненность`}
        action={<Btn onClick={() => { setForm(EMPTY_FORM); setShowAdd(true); }}>+ Добавить отель</Btn>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: "ВСЕГО ОБЪЕКТОВ", val: String(hotels.length) },
          { label: "ВСЕГО НОМЕРОВ", val: String(totalRooms) },
          { label: "ЗАНЯТО", val: String(totalOccupied) },
          { label: "СРЕДН. ЗАПОЛНЕННОСТЬ", val: `${avgOccupancy}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
          >
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}
            >
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer capitalize"
              style={{
                background: filter === c ? "var(--color-amber)" : "var(--color-panel)",
                color: filter === c ? "#0d0c0a" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["cards", "table"] as const).map((v) => (
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
              {v === "cards" ? "⊞" : "☰"}
            </button>
          ))}
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filtered.map((h) => (
            <div
              key={h.id}
              className="rounded-lg overflow-hidden"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex gap-0">
                <img
                  src={h.img}
                  alt={h.name}
                  className="w-24 h-24 object-cover shrink-0"
                  style={{ background: "var(--color-dim)" }}
                />
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
                        {h.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                        {h.city} · {"★".repeat(h.stars)}
                      </div>
                    </div>
                    <Badge label={h.status} color={statusColor(h.status) as any} />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                    <span style={{ color: "var(--color-amber)" }}>★ {h.rating}</span>
                    <span>От ${h.priceFrom}/ночь</span>
                  </div>
                  {/* Occupancy bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                      <span>Заполненность</span>
                      <span style={{ color: occupancy(h) > 80 ? "var(--color-teal)" : occupancy(h) > 50 ? "var(--color-amber)" : "var(--color-rose)" }}>
                        {occupancy(h)}% ({h.occupied}/{h.rooms})
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${occupancy(h)}%`,
                          background: occupancy(h) > 80 ? "var(--color-teal)" : occupancy(h) > 50 ? "var(--color-amber)" : "var(--color-rose)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="px-3 py-2.5 flex items-center gap-2 flex-wrap"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                {h.facilities.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {a}
                  </span>
                ))}
                <div className="ml-auto flex gap-2">
                  <Btn variant="ghost" small onClick={() => openEdit(h)}>Изменить</Btn>
                  <Btn variant={h.status === "active" ? "danger" : "ghost"} small onClick={() => toggleSuspend(h.id)}>
                    {h.status === "active" ? "Откл." : "Вкл."}
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          cols={["ОТЕЛЬ", "ГОРОД", "ЗВ.", "НОМЕРОВ", "ЗАПОЛНЕННОСТЬ", "ОТ/НОЧЬ", "РЕЙТИНГ", "СТАТУС", ""]}
          rows={filtered.map((h) => [
            <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{h.name}</span>,
            <span style={{ color: "var(--color-muted)" }}>{h.city}</span>,
            <span style={{ color: "var(--color-amber)" }}>{"★".repeat(h.stars)}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{h.rooms}</span>,
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${occupancy(h)}%`,
                    background: occupancy(h) > 80 ? "var(--color-teal)" : "var(--color-amber)",
                  }}
                />
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-muted)" }}>{occupancy(h)}%</span>
            </div>,
            <span style={{ fontFamily: "var(--font-mono)" }}>${h.priceFrom}</span>,
            <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ {h.rating}</span>,
            <Badge label={h.status} color={statusColor(h.status) as any} />,
            <div className="flex gap-2">
              <Btn variant="ghost" small onClick={() => openEdit(h)}>Изменить</Btn>
              <Btn variant={h.status === "active" ? "danger" : "ghost"} small onClick={() => toggleSuspend(h.id)}>
                {h.status === "active" ? "Откл." : "Вкл."}
              </Btn>
            </div>,
          ])}
        />
      )}
      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setEditing(null)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Редактировать отель</h3>
              <button onClick={() => setEditing(null)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {([["name","Название","text"],["city","Город","text"],["stars","Звёзды (1–5)","number"],["rooms","Номеров","number"],["priceFrom","Цена от ($)","number"]] as [keyof HotelForm,string,string][]).map(([k, label, type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Отмена</Btn>
              <Btn onClick={saveEdit}>Сохранить</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить отель</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {([["name","Название","text"],["city","Город","text"],["stars","Звёзды (1–5)","number"],["rooms","Кол-во номеров","number"],["priceFrom","Цена от ($)","number"]] as [keyof HotelForm,string,string][]).map(([k, label, type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                    placeholder={k === "name" ? "Название отеля" : ""}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={saveNew}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
