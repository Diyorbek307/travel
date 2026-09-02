import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedRestaurant as Restaurant } from "@/lib/types";



export default function Restaurants() {
  const [items, setItems] = useEntity("restaurants");
  const [filter, setFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [showAdd, setShowAdd] = useState(false);
  const [newRest, setNewRest] = useState({ name: "", city: "", cuisine: "", seats: "", phone: "", address: "", open: "", desc: "" });

  const cities = ["all", ...Array.from(new Set(items.map(r => r.city)))];
  let filtered = filter === "all" ? items : items.filter(r => r.status === filter);
  if (cityFilter !== "all") filtered = filtered.filter(r => r.city === cityFilter);

  const togglePromote = (id: string) => {
    setItems(prev => prev.map(r => r.id === id ? { ...r, promoted: !r.promoted } : r));
  };

  const approveRestaurant = (id: string) => {
    setItems(prev => prev.map(r => r.id === id ? { ...r, status: "active" } : r));
    setSelected(null);
  };

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Рестораны"
        subtitle={`${filtered.length} заведений · ${items.filter(r => r.promoted).length} продвигается`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Добавить ресторан</Btn>}
      />

      {items.filter(r => r.status === "pending").length > 0 && (
        <div
          className="rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2"
          style={{ background: "rgba(212,135,42,0.08)", border: "1px solid rgba(212,135,42,0.2)", color: "var(--color-amber-light)" }}
        >
          ⚠ {items.filter(r => r.status === "pending").length} ресторан(ов) на рассмотрении
          <button className="ml-2 underline cursor-pointer text-xs" onClick={() => setFilter("pending")}>Просмотреть</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[["all", "все"], ["active", "активные"], ["pending", "на рассмотрении"], ["suspended", "приостановлены"]].map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
              style={{
                background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
                color: filter === f ? "#0d0c0a" : "var(--color-muted)",
                border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)",
              }}
            >{label}</button>
          ))}
          <div className="w-px h-5 self-center" style={{ background: "var(--color-border)" }} />
          {cities.map(c => (
            <button key={c} onClick={() => setCityFilter(c)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
              style={{
                background: cityFilter === c ? "rgba(212,135,42,0.15)" : "transparent",
                color: cityFilter === c ? "var(--color-amber)" : "var(--color-muted)",
                border: `1px solid ${cityFilter === c ? "rgba(212,135,42,0.4)" : "var(--color-border)"}`,
                fontFamily: "var(--font-mono)",
              }}
            >{c}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["cards", "table"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer"
              style={{ background: view === v ? "var(--color-dim)" : "transparent", color: view === v ? "var(--color-text)" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
            >{v === "cards" ? "⊞" : "☰"}</button>
          ))}
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {filtered.map(r => (
            <div key={r.id} className="rounded-lg overflow-hidden cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{ background: "var(--color-panel)", border: `1px solid ${r.promoted ? "rgba(212,135,42,0.5)" : "var(--color-border)"}` }}
              onClick={() => setSelected(r)}
            >
              <div className="flex gap-0">
                <img src={r.img} alt={r.name} className="w-24 h-24 object-cover shrink-0" style={{ background: "var(--color-dim)" }} />
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
                        {r.promoted && <span style={{ color: "var(--color-amber)" }}>★ </span>}
                        {r.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{r.cuisine} · {r.city} · {r.priceRange}</div>
                    </div>
                    <Badge label={r.status} color={r.status === "active" ? "teal" : r.status === "pending" ? "amber" : "rose"} />
                  </div>
                  <div className="flex gap-3 mt-2 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                    <span style={{ color: "var(--color-amber)" }}>★ {r.rating}</span>
                    <span>{r.seats} мест</span>
                    <span>{r.open}</span>
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: "var(--color-muted)" }}>{r.monthlyViews.toLocaleString()} просмотров/мес</div>
                </div>
              </div>
              <div className="px-3 py-2 flex gap-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                <Btn variant={r.promoted ? "danger" : "ghost"} small onClick={e => { e.stopPropagation(); togglePromote(r.id); }}>
                  {r.promoted ? "Убрать продвижение" : "Продвигать ★"}
                </Btn>
                {r.status === "pending" && (
                  <Btn small onClick={e => { e.stopPropagation(); approveRestaurant(r.id); }}>Одобрить</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          cols={["НАЗВАНИЕ", "ГОРОД", "КУХНЯ", "РЕЙТИНГ", "ЦЕНА", "ПРОСМ/МЕС", "СТАТУС", "ПРОДВ.", ""]}
          rows={filtered.map(r => [
            <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{r.name}</span>,
            <span style={{ color: "var(--color-muted)" }}>{r.city}</span>,
            <span style={{ color: "var(--color-muted)" }}>{r.cuisine}</span>,
            <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ {r.rating}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{r.priceRange}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{r.monthlyViews.toLocaleString()}</span>,
            <Badge label={r.status} color={r.status === "active" ? "teal" : r.status === "pending" ? "amber" : "rose"} />,
            <span style={{ color: r.promoted ? "var(--color-amber)" : "var(--color-dim)" }}>{r.promoted ? "★ Да" : "—"}</span>,
            <div className="flex gap-2">
              <Btn variant="ghost" small onClick={() => setSelected(r)}>Изменить</Btn>
              <Btn variant={r.promoted ? "danger" : "ghost"} small onClick={() => togglePromote(r.id)}>
                {r.promoted ? "Убрать" : "Продвинуть"}
              </Btn>
            </div>,
          ])}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-lg p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить ресторан</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {([["name","Название","text","col-span-2"],["city","Город","text",""],["cuisine","Кухня","text",""],["seats","Мест","number",""],["phone","Телефон","text",""],["address","Адрес","text","col-span-2"],["openHours","Часы работы","text",""]] as [string,string,string,string][]).map(([k,label,type,cls]) => (
                <div key={k} className={cls}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newRest as any)[k]} onChange={e => setNewRest(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ОПИСАНИЕ</label>
                <textarea rows={2} value={newRest.desc} onChange={e => setNewRest(p => ({ ...p, desc: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newRest.name) return;
                setItems(prev => [...prev, {
                  id: `new-${Date.now()}`, name: newRest.name, city: newRest.city || "Tashkent",
                  cuisine: newRest.cuisine || "Uzbek", rating: 0, priceRange: "$$" as const,
                  seats: Number(newRest.seats) || 0, status: "pending" as const, promoted: false,
                  phone: newRest.phone || "", address: newRest.address || "",
                  open: newRest.open || "", monthlyViews: 0,
                  img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=80&h=60&fit=crop&auto=format",
                  desc: newRest.desc || "", reviews: 0,
                  price: "$$",
                }]);
                setShowAdd(false);
                setNewRest({ name: "", city: "", cuisine: "", seats: "", phone: "", address: "", open: "", desc: "" });
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setSelected(null)}>
          <div className="rounded-xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{selected.name}</h3>
              <button className="text-xl opacity-50 hover:opacity-100 cursor-pointer" style={{ color: "var(--color-text)" }} onClick={() => setSelected(null)}>×</button>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>{selected.desc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "Город", val: selected.city },
                { label: "Кухня", val: selected.cuisine },
                { label: "Рейтинг", val: `★ ${selected.rating}` },
                { label: "Мест", val: String(selected.seats) },
                { label: "Часы работы", val: selected.open },
                { label: "Телефон", val: selected.phone },
              ].map(s => (
                <div key={s.label} className="rounded p-2" style={{ background: "var(--color-surface)" }}>
                  <div className="text-xs mb-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                  <div className="text-sm" style={{ color: "var(--color-text)" }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {selected.status === "pending" && <Btn onClick={() => approveRestaurant(selected.id)}>Одобрить</Btn>}
              <Btn variant={selected.promoted ? "danger" : "ghost"} onClick={() => { togglePromote(selected.id); setSelected(null); }}>
                {selected.promoted ? "Убрать продвижение" : "Продвигать ★"}
              </Btn>
              <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
