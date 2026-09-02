import { useState } from "react";
import { PageHeader, Badge, Btn } from "./shared";

type Event = {
  id: number;
  title: string;
  city: string;
  category: "Festival" | "Concert" | "Exhibition" | "Sport" | "Cultural" | "Food";
  date: string;
  endDate: string;
  venue: string;
  capacity: number;
  ticketsSold: number;
  price: number;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  featured: boolean;
  description: string;
  img: string;
};

const EVENTS: Event[] = [
  { id: 1, title: "Navruz Festival 2027", city: "Tashkent", category: "Festival", date: "Mar 21, 2027", endDate: "Mar 23, 2027", venue: "Mustakillik Square", capacity: 50000, ticketsSold: 31200, price: 0, status: "upcoming", featured: true, description: "Uzbekistan's biggest spring festival celebrating Persian New Year with music, dance, traditional crafts and food.", img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=400&h=220&fit=crop&auto=format" },
  { id: 2, title: "Silk & Spice International Food Fair", city: "Samarkand", category: "Food", date: "Sep 15, 2026", endDate: "Sep 17, 2026", venue: "Registan Square", capacity: 8000, ticketsSold: 5400, price: 15, status: "upcoming", featured: true, description: "Three-day culinary festival showcasing Uzbek cuisine and dishes from 40+ countries along the historical Silk Road.", img: "https://images.unsplash.com/photo-1662468752704-f256cf5c6784?w=400&h=220&fit=crop&auto=format" },
  { id: 3, title: "Sharq Taronalari Music Festival", city: "Samarkand", category: "Concert", date: "Aug 21, 2026", endDate: "Aug 25, 2026", venue: "Registan Square", capacity: 10000, ticketsSold: 10000, price: 25, status: "past", featured: false, description: "Biennial international music festival featuring artists from over 50 countries performing traditional and classical music.", img: "https://images.unsplash.com/photo-1677156811762-842312963ecd?w=400&h=220&fit=crop&auto=format" },
  { id: 4, title: "Bukhara Handicraft Fair", city: "Bukhara", category: "Exhibition", date: "Oct 10, 2026", endDate: "Oct 14, 2026", venue: "Ark Citadel", capacity: 3000, ticketsSold: 800, price: 10, status: "upcoming", featured: false, description: "Annual exhibition of traditional Uzbek crafts — carpets, ceramics, woodwork and silk embroidery.", img: "https://images.unsplash.com/photo-1557841621-d9f6673405ed?w=400&h=220&fit=crop&auto=format" },
  { id: 5, title: "Tashkent International Film Festival", city: "Tashkent", category: "Cultural", date: "Oct 25, 2026", endDate: "Nov 1, 2026", venue: "Ishtirok Cinema", capacity: 1500, ticketsSold: 420, price: 20, status: "upcoming", featured: false, description: "Central Asia's premier film festival screening over 100 films from 60 countries.", img: "https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=400&h=220&fit=crop&auto=format" },
  { id: 6, title: "Fergana Valley Marathon", city: "Fergana", category: "Sport", date: "Nov 5, 2026", endDate: "Nov 5, 2026", venue: "City Center", capacity: 2000, ticketsSold: 1240, price: 30, status: "upcoming", featured: false, description: "Annual marathon through the scenic Fergana Valley. Routes: 5km, 10km, half-marathon, full marathon.", img: "https://images.unsplash.com/photo-1728565721798-cf65c7bf1efe?w=400&h=220&fit=crop&auto=format" },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [filter, setFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", city: "", category: "Festival", date: "", venue: "", price: "", capacity: "" });

  const cities = ["all", ...Array.from(new Set(events.map(e => e.city)))];
  let filtered = filter === "all" ? events : events.filter(e => e.status === filter);
  if (cityFilter !== "all") filtered = filtered.filter(e => e.city === cityFilter);

  const toggleFeatured = (id: number) => {
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
      id: Date.now(), title: newEvent.title || "New Event", city: newEvent.city || "Tashkent",
      category: newEvent.category as Event["category"], date: newEvent.date || "TBD", endDate: newEvent.date || "TBD",
      venue: newEvent.venue || "TBD", capacity: Number(newEvent.capacity) || 500, ticketsSold: 0,
      price: Number(newEvent.price) || 0, status: "upcoming", featured: false,
      description: "New event description.", img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=400&h=220&fit=crop&auto=format",
    }, ...prev]);
    setShowForm(false);
    setNewEvent({ title: "", city: "", category: "Festival", date: "", venue: "", price: "", capacity: "" });
  };

  return (
    <div className="p-7">
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

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
        {filtered.map(e => {
          const soldPct = Math.round((e.ticketsSold / e.capacity) * 100);
          return (
            <div key={e.id} className="rounded-xl overflow-hidden transition-all hover:translate-y-[-2px]"
              style={{ background: "var(--color-panel)", border: `1px solid ${e.featured ? "rgba(212,135,42,0.5)" : "var(--color-border)"}` }}
            >
              <div className="relative h-40 overflow-hidden" style={{ background: "var(--color-dim)" }}>
                <img src={e.img} alt={e.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,12,10,0.85) 0%, transparent 50%)" }} />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: catColors[e.category] + "22", color: catColors[e.category], border: `1px solid ${catColors[e.category]}44`, fontFamily: "var(--font-mono)" }}>
                    {catLabels[e.category] ?? e.category}
                  </span>
                  {e.featured && <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "var(--color-amber)", color: "#0d0c0a", fontFamily: "var(--font-mono)" }}>★ Рекомендуемое</span>}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge label={e.status} color={statusColor(e.status) as any} />
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="font-semibold text-sm text-white" style={{ fontFamily: "var(--font-display)" }}>{e.title}</div>
                  <div className="text-xs text-white opacity-70 mt-0.5">{e.date}{e.endDate !== e.date ? ` → ${e.endDate}` : ""}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="text-xs mb-2 flex gap-3" style={{ color: "var(--color-muted)" }}>
                  <span>📍 {e.venue}, {e.city}</span>
                  <span>{e.price === 0 ? "Бесплатно" : `$${e.price}/билет`}</span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--color-muted)" }}>{e.description}</p>

                {/* Ticket progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>Билетов продано</span>
                    <span style={{ color: soldPct > 80 ? "var(--color-rose)" : "var(--color-teal)" }}>
                      {e.ticketsSold.toLocaleString()} / {e.capacity.toLocaleString()} ({soldPct}%)
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                    <div className="h-full rounded-full" style={{ width: `${soldPct}%`, background: soldPct === 100 ? "var(--color-rose)" : soldPct > 80 ? "var(--color-amber)" : "var(--color-teal)" }} />
                  </div>
                </div>

                <div className="flex gap-2">
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
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn>
              <Btn onClick={addEvent}>Создать событие</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
