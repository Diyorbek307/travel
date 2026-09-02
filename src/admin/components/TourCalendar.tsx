import { useState } from "react";
import { PageHeader, Badge, Btn } from "./shared";

type CalEvent = {
  id: number;
  title: string;
  guide: string;
  destination: string;
  start: number; // day of month
  end: number;
  seats: number;
  booked: number;
  color: string;
  status: "confirmed" | "pending" | "cancelled";
};

const EVENTS_INIT: CalEvent[] = [
  { id: 1, title: "Silk Road Heritage", guide: "Bobur T.", destination: "Samarkand", start: 1, end: 4, seats: 12, booked: 10, color: "var(--color-amber)", status: "confirmed" },
  { id: 2, title: "Desert Sunset Camp", guide: "Malika Y.", destination: "Nurata", start: 2, end: 5, seats: 8, booked: 8, color: "var(--color-rose)", status: "confirmed" },
  { id: 3, title: "Khiva Walls & Tales", guide: "Jasur K.", destination: "Khiva", start: 5, end: 8, seats: 10, booked: 7, color: "var(--color-teal)", status: "confirmed" },
  { id: 4, title: "Fergana Craft Trail", guide: "Sherzod N.", destination: "Fergana", start: 6, end: 9, seats: 14, booked: 11, color: "#7a8fff", status: "confirmed" },
  { id: 5, title: "Tashkent Deep Dive", guide: "Dilnoza E.", destination: "Tashkent", start: 8, end: 9, seats: 16, booked: 9, color: "var(--color-amber)", status: "confirmed" },
  { id: 6, title: "Aral Sea Expedition", guide: "Amir A.", destination: "Aral", start: 10, end: 14, seats: 6, booked: 4, color: "var(--color-rose)", status: "pending" },
  { id: 7, title: "Registan Photo Tour", guide: "Bobur T.", destination: "Samarkand", start: 11, end: 14, seats: 10, booked: 10, color: "var(--color-teal)", status: "confirmed" },
  { id: 8, title: "Ancient Bukhara", guide: "Malika Y.", destination: "Bukhara", start: 13, end: 17, seats: 12, booked: 5, color: "#c47ae8", status: "confirmed" },
  { id: 9, title: "Mountain Valleys", guide: "Jasur K.", destination: "Chimgan", start: 15, end: 19, seats: 8, booked: 8, color: "var(--color-amber)", status: "confirmed" },
  { id: 10, title: "Ceramics & Craft", guide: "Sherzod N.", destination: "Rishtan", start: 16, end: 17, seats: 10, booked: 6, color: "var(--color-rose)", status: "cancelled" },
  { id: 11, title: "Silk Road Night", guide: "Dilnoza E.", destination: "Bukhara", start: 19, end: 22, seats: 12, booked: 11, color: "var(--color-teal)", status: "confirmed" },
  { id: 12, title: "Nukus Art Route", guide: "Amir A.", destination: "Nukus", start: 20, end: 24, seats: 8, booked: 3, color: "#7a8fff", status: "pending" },
  { id: 13, title: "Tashkent to Samarkand", guide: "Bobur T.", destination: "Samarkand", start: 22, end: 24, seats: 14, booked: 12, color: "var(--color-amber)", status: "confirmed" },
  { id: 14, title: "Surkhandarya Ruins", guide: "Malika Y.", destination: "Termez", start: 24, end: 28, seats: 8, booked: 6, color: "var(--color-rose)", status: "confirmed" },
  { id: 15, title: "Fergana Valley Loop", guide: "Sherzod N.", destination: "Fergana", start: 26, end: 30, seats: 12, booked: 9, color: "#c47ae8", status: "confirmed" },
  { id: 16, title: "Khorezm Kingdom", guide: "Jasur K.", destination: "Khiva", start: 28, end: 30, seats: 10, booked: 7, color: "var(--color-teal)", status: "pending" },
];

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const SEP_OFFSET = 1; // Sep 1, 2026 is a Tuesday (index 1)
const DAYS_IN_MONTH = 30;

const EMPTY_TOUR = { title: "", destination: "", guide: "", start: "", end: "", seats: "" };

export default function TourCalendar() {
  const [events, setEvents] = useState<CalEvent[]>(EVENTS_INIT);
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [view, setView] = useState<"month" | "list">("month");
  const [showAdd, setShowAdd] = useState(false);
  const [newTour, setNewTour] = useState(EMPTY_TOUR);

  const confirmEvent = (id: number) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "confirmed" as const } : e));
    setSelected(prev => prev?.id === id ? { ...prev, status: "confirmed" } : prev);
  };

  const rows: number[][] = [];
  let week: number[] = [];
  for (let pre = 0; pre < SEP_OFFSET; pre++) week.push(0);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    week.push(d);
    if (week.length === 7) { rows.push(week); week = []; }
  }
  while (week.length > 0 && week.length < 7) week.push(0);
  if (week.length) rows.push(week);

  const eventsOnDay = (day: number) =>
    events.filter(e => day >= e.start && day <= e.end && e.status !== "cancelled");

  const totalBooked = events.filter(e => e.status !== "cancelled").reduce((s, e) => s + e.booked, 0);
  const totalSeats = events.filter(e => e.status !== "cancelled").reduce((s, e) => s + e.seats, 0);
  const confirmedCount = events.filter(e => e.status === "confirmed").length;

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Расписание туров"
        subtitle="Сентябрь 2026 — все отправления"
        action={
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => setView(v => v === "month" ? "list" : "month")}>
              {view === "month" ? "Список" : "Календарь"}
            </Btn>
            <Btn onClick={() => setShowAdd(true)}>+ Новый тур</Btn>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "ВСЕГО ТУРОВ", val: String(events.length), color: "var(--color-text)" },
          { label: "ПОДТВЕРЖДЁННЫХ", val: String(confirmedCount), color: "var(--color-teal)" },
          { label: "МЕСТ ЗАНЯТО", val: `${totalBooked} / ${totalSeats}`, color: "var(--color-amber)" },
          { label: "ЗАПОЛНЕННОСТЬ", val: `${Math.round(totalBooked / totalSeats * 100)}%`, color: "var(--color-text)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {view === "month" ? (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-panel)" }}>
          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--color-border)" }}>
            {DAYS.map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{d}</div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7" style={{ borderBottom: wi < rows.length - 1 ? "1px solid var(--color-border)" : "none", minHeight: "100px" }}>
              {week.map((day, di) => {
                const dayEvents = day ? eventsOnDay(day) : [];
                const isToday = day === 2;
                return (
                  <div
                    key={di}
                    className="p-1.5 relative"
                    style={{ borderLeft: di > 0 ? "1px solid var(--color-border)" : "none", minHeight: "100px", background: isToday ? "rgba(212,135,42,0.05)" : "transparent" }}
                  >
                    {day > 0 && (
                      <>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1"
                          style={{
                            background: isToday ? "var(--color-amber)" : "transparent",
                            color: isToday ? "#0d0c0a" : "var(--color-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >{day}</div>
                        <div className="flex flex-col gap-0.5">
                          {dayEvents.slice(0, 3).map(ev => (
                            <button
                              key={ev.id}
                              onClick={() => setSelected(ev)}
                              className="rounded text-left px-1.5 py-0.5 text-xs w-full overflow-hidden cursor-pointer truncate transition-all"
                              style={{ background: ev.color + "22", color: ev.color, border: `1px solid ${ev.color}33`, fontFamily: "var(--font-mono)", fontSize: "10px" }}
                            >
                              {ev.title}
                            </button>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs pl-1" style={{ color: "var(--color-muted)", fontSize: "10px" }}>+{dayEvents.length - 3} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.slice().sort((a, b) => a.start - b.start).map(ev => (
            <div
              key={ev.id}
              className="rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              style={{ background: "var(--color-panel)", border: `1px solid var(--color-border)`, opacity: ev.status === "cancelled" ? 0.5 : 1 }}
              onClick={() => setSelected(ev)}
            >
              <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: ev.color }} />
              <div className="w-20 text-center shrink-0">
                <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>СЕН</div>
                <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{ev.start}–{ev.end}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-0.5" style={{ color: "var(--color-text)" }}>{ev.title}</div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>{ev.destination} · Гид: {ev.guide}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{ev.booked}/{ev.seats}</div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>мест</div>
              </div>
              <Badge
                label={{ confirmed: "подтверждён", pending: "ожидание", cancelled: "отменён" }[ev.status] ?? ev.status}
                color={ev.status === "confirmed" ? "teal" : ev.status === "pending" ? "amber" : "rose"}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tour detail modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setSelected(null)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-5">
              <div className="w-2 h-full rounded-full self-stretch shrink-0" style={{ background: selected.color, minHeight: "24px" }} />
              <div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{selected.title}</h3>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>{selected.destination}</p>
              </div>
              <Badge label={{ confirmed: "подтверждён", pending: "ожидание", cancelled: "отменён" }[selected.status] ?? selected.status} color={selected.status === "confirmed" ? "teal" : selected.status === "pending" ? "amber" : "rose"} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                { label: "ДАТЫ", val: `Sep ${selected.start}–${selected.end}, 2026` },
                { label: "ГИД", val: selected.guide },
                { label: "ЗАБРОНИРОВАНО", val: `${selected.booked} из ${selected.seats} мест` },
                { label: "ДОСТУПНО", val: selected.seats - selected.booked > 0 ? `${selected.seats - selected.booked} мест свободно` : "Заполнен" },
              ].map(f => (
                <div key={f.label} className="rounded-lg p-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{f.label}</div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{f.val}</div>
                </div>
              ))}
            </div>

            {/* Occupancy bar */}
            <div className="mb-5">
              <div className="flex justify-between gap-2 text-xs mb-1.5">
                <span style={{ color: "var(--color-muted)" }}>Заполненность</span>
                <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{Math.round(selected.booked / selected.seats * 100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                <div className="h-full rounded-full" style={{ width: `${selected.booked / selected.seats * 100}%`, background: selected.color }} />
              </div>
            </div>

            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
              {selected.status === "pending" && <Btn onClick={() => confirmEvent(selected.id)}>Подтвердить</Btn>}
            </div>
          </div>
        </div>
      )}

      {/* Add tour modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Новый тур</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {([["title","Название","text"],["destination","Направление","text"],["guide","Гид","text"],["seats","Мест","number"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k} className={k === "title" || k === "guide" ? "col-span-2" : ""}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newTour as any)[k]} onChange={e => setNewTour(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ДЕНЬ НАЧАЛА (сен)</label>
                <input type="number" min={1} max={30} value={newTour.start} onChange={e => setNewTour(p => ({ ...p, start: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ДЕНЬ КОНЦА (сен)</label>
                <input type="number" min={1} max={30} value={newTour.end} onChange={e => setNewTour(p => ({ ...p, end: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newTour.title) return;
                const COLORS = ["var(--color-amber)","var(--color-teal)","var(--color-rose)","#7a8fff","#c47ae8"];
                setEvents(prev => [...prev, {
                  id: prev.length + 1, title: newTour.title, destination: newTour.destination || "—",
                  guide: newTour.guide || "Не назначен", start: Number(newTour.start) || 1,
                  end: Number(newTour.end) || 1, seats: Number(newTour.seats) || 10, booked: 0,
                  color: COLORS[prev.length % COLORS.length], status: "pending" as const,
                }]);
                setShowAdd(false);
                setNewTour(EMPTY_TOUR);
              }}>Создать</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
