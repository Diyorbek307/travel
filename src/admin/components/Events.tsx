import { useState } from "react";
import { PageHeader, Badge, Btn } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedEvent as Event } from "@/lib/types";



export default function Events() {
  const [events, setEvents] = useEntity("events");
  const [filter, setFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", city: "", category: "Festival", date: "", venue: "", price: "", capacity: "" });

  const cities = ["all", ...Array.from(new Set(events.map(e => e.city)))];
  let filtered = filter === "all" ? events : events.filter(e => e.status === filter);
  if (cityFilter !== "all") filtered = filtered.filter(e => e.city === cityFilter);

  const toggleFeatured = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, featured: !e.featured } : e));
  };

  const statusColor = (s: string) => s === "upcoming" ? "teal" : s === "ongoing" ? "amber" : s === "past" ? "dim" : "rose";

  const catColors: Record<string, string> = {
    Festival: "var(--color-amber)", Concert: "var(--color-teal)", Exhibition: "var(--color-muted)",
    Sport: "var(--color-rose)", Cultural: "#7a5fd4", Food: "#d4872a",
  };

  const catLabels: Record<string, string> = {
    Festival: "Фестиваль", Concert: "Концерт", Exhibition: "Выставка",
    Sport: "Спорт", Cultural: "Культура", Food: "Еда",
  };

  const addEvent = () => {
    setEvents(prev => [{
      id: `new-${Date.now()}`, emoji: "🎫", color: "#2E7D5A",
      name: newEvent.name || "New Event", city: newEvent.city || "Tashkent",
      category: newEvent.category as Event["category"], date: newEvent.date || "TBD", endDate: newEvent.date || "TBD",
      venue: newEvent.venue || "TBD", capacity: Number(newEvent.capacity) || 500, ticketsSold: 0,
      price: Number(newEvent.price) || 0, status: "upcoming", featured: false,
      desc: "New event description.", img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=400&h=220&fit=crop&auto=format",
    }, ...prev]);
    setShowForm(false);
    setNewEvent({ name: "", city: "", category: "Festival", date: "", venue: "", price: "", capacity: "" });
  };

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="События"
        subtitle={`${filtered.length} событий · ${events.filter(e => e.featured).length} рекомендуемых`}
        action={<Btn onClick={() => setShowForm(true)}>+ Добавить событие</Btn>}
      />

      <div className="flex gap-2 flex-wrap mb-6">
        {[["all", "все"], ["upcoming", "предстоящие"], ["ongoing", "сейчас"], ["past", "прошедшие"], ["cancelled", "отменены"]].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
            style={{ background: filter === f ? "var(--color-amber)" : "var(--color-panel)", color: filter === f ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
          >{label}</button>
        ))}
        <div className="w-px h-5 self-center" style={{ background: "var(--color-border)" }} />
        {cities.map(c => (
          <button key={c} onClick={() => setCityFilter(c)}
            className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
            style={{ background: cityFilter === c ? "rgba(212,135,42,0.15)" : "transparent", color: cityFilter === c ? "var(--color-amber)" : "var(--color-muted)", border: `1px solid ${cityFilter === c ? "rgba(212,135,42,0.4)" : "var(--color-border)"}`, fontFamily: "var(--font-mono)" }}
          >{c}</button>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}>
        {filtered.map(e => {
          const soldPct = Math.round((e.ticketsSold / e.capacity) * 100);
          return (
            <div key={e.id} className="rounded-xl overflow-hidden transition-all hover:translate-y-[-2px]"
              style={{ background: "var(--color-panel)", border: `1px solid ${e.featured ? "rgba(212,135,42,0.5)" : "var(--color-border)"}` }}
            >
              <div className="relative h-40 overflow-hidden" style={{ background: "var(--color-dim)" }}>
                <img src={e.img} alt={e.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,12,10,0.85) 0%, transparent 50%)" }} />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: catColors[e.category] + "22", color: catColors[e.category], border: `1px solid ${catColors[e.category]}44`, fontFamily: "var(--font-mono)" }}>
                    {catLabels[e.category] ?? e.category}
                  </span>
                  {e.featured && <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "var(--color-amber)", color: "#0d0c0a", fontFamily: "var(--font-mono)" }}>★ Рекомендуемое</span>}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge label={e.status} color={statusColor(e.status) as any} />
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="font-semibold text-sm text-white" style={{ fontFamily: "var(--font-display)" }}>{e.name}</div>
                  <div className="text-xs text-white opacity-70 mt-0.5">{e.date}{e.endDate !== e.date ? ` → ${e.endDate}` : ""}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="text-xs mb-2 flex flex-wrap gap-3" style={{ color: "var(--color-muted)" }}>
                  <span>📍 {e.venue}, {e.city}</span>
                  <span>{e.price === 0 ? "Бесплатно" : `$${e.price}/билет`}</span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--color-muted)" }}>{e.desc}</p>

                {/* Ticket progress */}
                <div className="mb-3">
                  <div className="flex flex-wrap justify-between gap-2 text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>Билетов продано</span>
                    <span style={{ color: soldPct > 80 ? "var(--color-rose)" : "var(--color-teal)" }}>
                      {e.ticketsSold.toLocaleString()} / {e.capacity.toLocaleString()} ({soldPct}%)
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                    <div className="h-full rounded-full" style={{ width: `${soldPct}%`, background: soldPct === 100 ? "var(--color-rose)" : soldPct > 80 ? "var(--color-amber)" : "var(--color-teal)" }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Btn variant={e.featured ? "danger" : "ghost"} small onClick={() => toggleFeatured(e.id)}>
                    {e.featured ? "Убрать из рек." : "Рекомендовать ★"}
                  </Btn>
                  <Btn variant="ghost" small>Изменить</Btn>
                  {e.status !== "cancelled" && e.status !== "past" && (
                    <Btn variant="danger" small onClick={() => setEvents(prev => prev.map(ev => ev.id === e.id ? { ...ev, status: "cancelled" } : ev))}>
                      Отменить
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowForm(false)}>
          <div className="rounded-xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Новое событие</h3>
            <div className="flex flex-col gap-3 mb-4">
              {[
                { key: "title", label: "Название события", ph: "Navruz Festival 2027" },
                { key: "city", label: "Город", ph: "Tashkent" },
                { key: "date", label: "Дата", ph: "Mar 21, 2027" },
                { key: "venue", label: "Место", ph: "Mustakillik Square" },
                { key: "capacity", label: "Вместимость", ph: "5000" },
                { key: "price", label: "Цена билета ($, 0 = бесплатно)", ph: "0" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{f.label.toUpperCase()}</label>
                  <input type="text" placeholder={f.ph} value={(newEvent as any)[f.key]} onChange={e => setNewEvent(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>КАТЕГОРИЯ</label>
                <div className="flex flex-wrap gap-1.5">
                  {[["Festival", "Фестиваль"], ["Concert", "Концерт"], ["Exhibition", "Выставка"], ["Sport", "Спорт"], ["Cultural", "Культура"], ["Food", "Еда"]].map(([c, label]) => (
                    <button key={c} onClick={() => setNewEvent(p => ({ ...p, category: c }))}
                      className="px-2.5 py-1 rounded text-xs cursor-pointer transition-all"
                      style={{ background: newEvent.category === c ? "var(--color-amber)" : "var(--color-surface)", color: newEvent.category === c ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn>
              <Btn onClick={addEvent}>Создать событие</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
