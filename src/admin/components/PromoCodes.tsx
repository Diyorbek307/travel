import { useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle } from "./shared";

type Promo = {
  id: number;
  code: string;
  description: string;
  type: "percent" | "fixed" | "free_transport" | "upgrade";
  value: number;
  minOrder: number;
  used: number;
  limit: number;
  category: "tours" | "hotels" | "transport" | "all";
  status: "active" | "paused" | "expired";
  startDate: string;
  endDate: string;
  revenue: number;
};

const PROMOS: Promo[] = [
  { id: 1, code: "SILKROAD20", description: "20% off all Silk Road tours in September", type: "percent", value: 20, minOrder: 200, used: 124, limit: 500, category: "tours", status: "active", startDate: "Sep 1", endDate: "Sep 30, 2026", revenue: 18600 },
  { id: 2, code: "WELCOME50", description: "Welcome discount — $50 off first booking", type: "fixed", value: 50, minOrder: 150, used: 89, limit: 1000, category: "all", status: "active", startDate: "Jan 1", endDate: "Dec 31, 2026", revenue: 4450 },
  { id: 3, code: "KHIVA15", description: "15% off all Khiva hotel bookings", type: "percent", value: 15, minOrder: 100, used: 34, limit: 200, category: "hotels", status: "active", startDate: "Sep 1", endDate: "Nov 30, 2026", revenue: 3200 },
  { id: 4, code: "FREETAXI", description: "Free airport taxi for bookings over $300", type: "free_transport", value: 0, minOrder: 300, used: 56, limit: 150, category: "all", status: "active", startDate: "Sep 1", endDate: "Oct 15, 2026", revenue: 0 },
  { id: 5, code: "UPGRADE2026", description: "Free hotel room upgrade", type: "upgrade", value: 0, minOrder: 500, used: 22, limit: 100, category: "hotels", status: "paused", startDate: "Aug 1", endDate: "Sep 30, 2026", revenue: 0 },
  { id: 6, code: "SUMMER30", description: "Summer special — 30% off all tours", type: "percent", value: 30, minOrder: 250, used: 300, limit: 300, category: "tours", status: "expired", startDate: "Jul 1", endDate: "Aug 31, 2026", revenue: 22400 },
  { id: 7, code: "TRAIN10", description: "10% off all train bookings", type: "percent", value: 10, minOrder: 20, used: 148, limit: 500, category: "transport", status: "active", startDate: "Sep 1", endDate: "Dec 31, 2026", revenue: 890 },
];

export default function PromoCodes() {
  const [promos, setPromos] = useState<Promo[]>(PROMOS);
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", description: "", type: "percent", value: "", minOrder: "", limit: "", category: "all", endDate: "" });

  const filtered = filter === "all" ? promos : promos.filter(p => p.status === filter);

  const totalRevenue = promos.reduce((s, p) => s + p.revenue, 0);
  const totalUsed = promos.reduce((s, p) => s + p.used, 0);
  const activeCount = promos.filter(p => p.status === "active").length;

  const toggle = (id: number) => {
    setPromos(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === "active" ? "paused" : "active" } : p
    ));
  };

  const addPromo = () => {
    const p: Promo = {
      id: Date.now(),
      code: (newCode.code || "NEW2026").toUpperCase(),
      description: newCode.description || "Новый промокод",
      type: newCode.type as Promo["type"],
      value: Number(newCode.value) || 10,
      minOrder: Number(newCode.minOrder) || 0,
      used: 0,
      limit: Number(newCode.limit) || 100,
      category: newCode.category as Promo["category"],
      status: "active",
      startDate: "Sep 2, 2026",
      endDate: newCode.endDate || "Dec 31, 2026",
      revenue: 0,
    };
    setPromos(prev => [p, ...prev]);
    setShowNew(false);
    setNewCode({ code: "", description: "", type: "percent", value: "", minOrder: "", limit: "", category: "all", endDate: "" });
  };

  const valueLabel = (p: Promo) => {
    if (p.type === "percent") return `-${p.value}%`;
    if (p.type === "fixed") return `-$${p.value}`;
    if (p.type === "free_transport") return "Бесплатное такси";
    return "Апгрейд";
  };

  const usagePct = (p: Promo) => Math.min(Math.round((p.used / p.limit) * 100), 100);

  return (
    <div className="p-7">
      <PageHeader
        title="Промокоды и скидки"
        subtitle={`${activeCount} активных · ${totalUsed.toLocaleString()} использований · $${totalRevenue.toLocaleString()} влияние на выручку`}
        action={<Btn onClick={() => setShowNew(true)}>+ Создать код</Btn>}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: "АКТИВНЫХ КОДОВ", val: String(activeCount), color: "var(--color-teal)" },
          { label: "ВСЕГО ИСПОЛЬЗОВАНИЙ", val: totalUsed.toLocaleString(), color: "var(--color-text)" },
          { label: "ВЛИЯНИЕ НА ВЫРУЧКУ", val: `$${totalRevenue.toLocaleString()}`, color: "var(--color-amber)" },
          { label: "СРЕДНЯЯ СКИДКА", val: "$34", color: "var(--color-text)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-5">
        {([["all", "Все"], ["active", "Активные"], ["paused", "Приостановлен"], ["expired", "Истёк"]] as [string, string][]).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
            style={{
              background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
              color: filter === f ? "#0d0c0a" : "var(--color-muted)",
              border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)",
            }}
          >{label}</button>
        ))}
      </div>

      {/* Promo list */}
      <div className="flex flex-col gap-3">
        {filtered.map(p => {
          const pct = usagePct(p);
          return (
            <div key={p.id} className="rounded-xl p-4" style={{ background: "var(--color-panel)", border: `1px solid ${p.status === "active" ? "var(--color-border)" : "var(--color-border)"}`, opacity: p.status === "expired" ? 0.6 : 1 }}>
              <div className="flex items-start gap-4">
                {/* Code badge */}
                <div
                  className="rounded-lg px-3 py-2 text-center shrink-0"
                  style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)", minWidth: "100px" }}
                >
                  <div className="font-bold tracking-widest" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>{p.code}</div>
                  <div className="text-xs mt-0.5 font-semibold" style={{ color: "var(--color-text)" }}>{valueLabel(p)}</div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{p.description}</span>
                    <Badge label={p.status === "active" ? "активный" : p.status === "paused" ? "приостановлен" : "истёк"} color={p.status === "active" ? "teal" : p.status === "paused" ? "amber" : "dim"} />
                    <Badge label={p.category === "all" ? "всё" : p.category === "tours" ? "туры" : p.category === "hotels" ? "отели" : "транспорт"} color="dim" />
                  </div>
                  <div className="text-xs flex gap-4 mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>Мин. заказ: ${p.minOrder}</span>
                    <span>Действует: {p.startDate} → {p.endDate}</span>
                    {p.revenue > 0 && <span style={{ color: "var(--color-teal)" }}>Выручка: ${p.revenue.toLocaleString()}</span>}
                  </div>

                  {/* Usage bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                      <span>Использование</span>
                      <span style={{ color: pct === 100 ? "var(--color-rose)" : pct > 75 ? "var(--color-amber)" : "var(--color-muted)" }}>
                        {p.used} / {p.limit} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100 ? "var(--color-rose)" : pct > 75 ? "var(--color-amber)" : "var(--color-teal)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {p.status !== "expired" && (
                  <div className="flex gap-2 shrink-0">
                    <Btn variant={p.status === "active" ? "danger" : "ghost"} small onClick={() => toggle(p.id)}>
                      {p.status === "active" ? "Приостановить" : "Активировать"}
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New promo modal */}
      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowNew(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Новый промокод</h3>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { key: "code", label: "Код (будет в верхнем регистре)", ph: "SUMMER30" },
                { key: "description", label: "Описание", ph: "Скидка 30% на все туры летом" },
                { key: "value", label: "Размер скидки (% или $)", ph: "20" },
                { key: "minOrder", label: "Мин. заказ ($)", ph: "100" },
                { key: "limit", label: "Лимит использований", ph: "500" },
                { key: "endDate", label: "Срок действия", ph: "Dec 31, 2026" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{f.label.toUpperCase()}</label>
                  <input type="text" placeholder={f.ph} value={(newCode as any)[f.key]}
                    onChange={e => setNewCode(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ТИП СКИДКИ</label>
                <div className="flex gap-2 flex-wrap">
                  {([["percent", "Процент"], ["fixed", "Фикс. сумма"], ["free_transport", "Бесплатное такси"], ["upgrade", "Апгрейд"]] as [string, string][]).map(([t, tLabel]) => (
                    <button key={t} onClick={() => setNewCode(p => ({ ...p, type: t }))}
                      className="px-2.5 py-1 rounded text-xs cursor-pointer"
                      style={{ background: newCode.type === t ? "var(--color-amber)" : "var(--color-surface)", color: newCode.type === t ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                    >{tLabel}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ПРИМЕНЯТЬ К</label>
                <div className="flex gap-2">
                  {([["all", "Всё"], ["tours", "Туры"], ["hotels", "Отели"], ["transport", "Транспорт"]] as [string, string][]).map(([c, cLabel]) => (
                    <button key={c} onClick={() => setNewCode(p => ({ ...p, category: c }))}
                      className="px-2.5 py-1 rounded text-xs cursor-pointer"
                      style={{ background: newCode.category === c ? "var(--color-amber)" : "var(--color-surface)", color: newCode.category === c ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                    >{cLabel}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowNew(false)}>Отмена</Btn>
              <Btn onClick={addPromo}>Создать код</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
