import { useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedAd as Ad } from "@/lib/types";


type Promotion = {
  id: string;
  business: string;
  category: "restaurant" | "hotel" | "tour" | "attraction";
  currentRank: number;
  boostedRank: number;
  monthlyFee: number;
  active: boolean;
  since: string;
  city: string;
};


const PROMOTIONS: Promotion[] = [
  { id: "1", business: "Плов Центр Тошкент", category: "restaurant", currentRank: 1, boostedRank: 1, monthlyFee: 250, active: true, since: "Jan 2026", city: "Tashkent" },
  { id: "2", business: "Samarkand Coffe House", category: "restaurant", currentRank: 8, boostedRank: 2, monthlyFee: 180, active: true, since: "Mar 2026", city: "Samarkand" },
  { id: "3", business: "Bukhara Pilaf Club", category: "restaurant", currentRank: 15, boostedRank: 3, monthlyFee: 120, active: true, since: "Jun 2026", city: "Bukhara" },
  { id: "4", business: "Khiva Bazaar Kitchen", category: "restaurant", currentRank: 22, boostedRank: 4, monthlyFee: 90, active: false, since: "Aug 2026", city: "Khiva" },
  { id: "5", business: "Fergana Valley Grill", category: "restaurant", currentRank: 31, boostedRank: 5, monthlyFee: 75, active: true, since: "Jul 2026", city: "Fergana" },
  { id: "6", business: "Tashkent Night Market", category: "attraction", currentRank: 12, boostedRank: 2, monthlyFee: 200, active: true, since: "Apr 2026", city: "Tashkent" },
];

const AD_TYPE_LABELS: Record<string, string> = {
  banner: "Баннер",
  spotlight: "Спотлайт",
  top_listing: "Топ листинг",
  push: "Push-уведомление",
};

export default function AdsManager() {
  const [ads, setAds] = useEntity("ads");
  const [promos, setPromos] = useState<Promotion[]>(PROMOTIONS);
  const [tab, setTab] = useState<"ads" | "promotions" | "new">("ads");
  const [newAd, setNewAd] = useState({
    advertiser: "", type: "banner", target: "", budget: "", bid: "", startDate: "", endDate: "",
  });
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({ business: "", city: "", category: "restaurant", monthlyFee: "" });

  const totalRevenue = promos.filter(p => p.active).reduce((s, p) => s + p.monthlyFee, 0);
  const activeAds = ads.filter(a => a.status === "active").length;
  const totalAdSpend = ads.reduce((s, a) => s + a.spent, 0);

  const togglePromo = (id: string) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const toggleAd = (id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a));
  };

  const submitAd = () => {
    const ad: Ad = {
      id: `new-${Date.now()}`,
      advertiser: newAd.advertiser || "New Advertiser",
      type: newAd.type as Ad["type"],
      target: newAd.target || "All pages",
      budget: Number(newAd.budget) || 100,
      spent: 0,
      clicks: 0,
      impressions: 0,
      status: "pending",
      startDate: newAd.startDate || "Sep 5",
      endDate: newAd.endDate || "Oct 5",
      bid: Number(newAd.bid) || 0.5,
      // Креатив: то, что увидит турист. Без него объявление есть в
      // отчётах, но в приложении показать нечего.
      emoji: "📣",
      label: "РЕКЛАМА",
      title: newAd.advertiser || "Новый рекламодатель",
      sub: newAd.target || "",
      cta: "Подробнее",
      color: "#1B6B8A",
    };
    setAds(prev => [ad, ...prev]);
    setTab("ads");
    setNewAd({ advertiser: "", type: "banner", target: "", budget: "", bid: "", startDate: "", endDate: "" });
  };

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Реклама"
        subtitle={`$${totalRevenue}/мес от продвижений · ${activeAds} активных кампаний`}
        action={<Btn onClick={() => setTab("new")}>+ Новая кампания</Btn>}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "ДОХОД ОТ ПРОДВИЖЕНИЙ", val: `$${totalRevenue}`, color: "var(--color-teal)" },
          { label: "АКТИВНЫХ КАМПАНИЙ", val: String(activeAds), color: "var(--color-amber)" },
          { label: "ПОТРАЧЕНО НА РЕКЛАМУ", val: `$${totalAdSpend.toLocaleString()}`, color: "var(--color-text)" },
          { label: "ВСЕГО ПОКАЗОВ", val: ads.reduce((s, a) => s + a.impressions, 0).toLocaleString(), color: "var(--color-text)" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {([["ads", "Кампании"], ["promotions", "Продвижение листинга"], ["new", "+ Новая кампания"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{
              background: tab === id ? "var(--color-amber)" : "var(--color-panel)",
              color: tab === id ? "#0d0c0a" : "var(--color-muted)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-body)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ads" && (
        <div className="flex flex-col gap-3">
          {ads.map((ad) => {
            const pct = Math.round((ad.spent / ad.budget) * 100) || 0;
            return (
              <div
                key={ad.id}
                className="rounded-lg p-4"
                style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{ad.advertiser}</span>
                      <Badge
                        label={AD_TYPE_LABELS[ad.type]}
                        color={ad.type === "spotlight" ? "amber" : ad.type === "push" ? "rose" : "dim"}
                      />
                      <Badge
                        label={ad.status}
                        color={ad.status === "active" ? "teal" : ad.status === "ended" ? "dim" : ad.status === "pending" ? "amber" : "rose"}
                      />
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                      Цель: {ad.target} · {ad.startDate} → {ad.endDate} · Ставка: ${ad.bid}/клик
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {ad.status !== "ended" && (
                      <Btn variant={ad.status === "active" ? "danger" : "ghost"} small onClick={() => toggleAd(ad.id)}>
                        {ad.status === "active" ? "Приостановить" : "Активировать"}
                      </Btn>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                  {[
                    { label: "БЮДЖЕТ", val: `$${ad.budget}` },
                    { label: "ПОТРАЧЕНО", val: `$${ad.spent}` },
                    { label: "КЛИКИ", val: ad.clicks.toLocaleString() },
                    { label: "ПОКАЗЫ", val: ad.impressions.toLocaleString() },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-xs mb-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                      <div className="text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between gap-2 text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>Использовано бюджета</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: pct > 90 ? "var(--color-rose)" : pct > 60 ? "var(--color-amber)" : "var(--color-teal)",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "promotions" && (
        <div>
          <div
            className="rounded-lg px-4 py-3 mb-5 text-sm"
            style={{ background: "rgba(212,135,42,0.08)", border: "1px solid rgba(212,135,42,0.2)", color: "var(--color-amber-light)" }}
          >
            💰 Бизнесы платят ежемесячную плату для повышения позиции в результатах поиска. Рейтинг ниже показывает продвинутую позицию по сравнению с органической.
          </div>

          <div className="grid gap-3">
            {promos.map((p, idx) => (
              <div
                key={p.id}
                className="rounded-lg p-4 flex items-center gap-4"
                style={{
                  background: "var(--color-panel)",
                  border: `1px solid ${p.active ? "rgba(212,135,42,0.3)" : "var(--color-border)"}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: p.active ? "var(--color-amber)" : "var(--color-dim)", color: p.active ? "#0d0c0a" : "var(--color-muted)" }}
                >
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{p.business}</span>
                    <Badge label={p.category} color="dim" />
                    <span className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>📍 {p.city}</span>
                  </div>
                  <div className="text-xs mt-0.5 flex gap-3" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>Органическая позиция: #{p.currentRank}</span>
                    <span style={{ color: "var(--color-amber)" }}>→ Продвинутая: #{p.boostedRank}</span>
                    <span>С {p.since}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-teal)" }}>
                    ${p.monthlyFee}/mo
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    {p.active ? "Активна" : "Приостановлена"}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Btn variant={p.active ? "danger" : "ghost"} small onClick={() => togglePromo(p.id)}>
                    {p.active ? "Приостановить" : "Активировать"}
                  </Btn>
                  <Btn variant="ghost" small>Изменить</Btn>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 rounded-lg p-4 flex items-center justify-between"
            style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)" }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>Добавить бизнес в продвижение</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-dim)" }}>Рестораны, отели, достопримечательности, туры</div>
            </div>
            <Btn onClick={() => setShowAddPromo(true)}>+ Добавить продвижение</Btn>
          </div>
        </div>
      )}

      {tab === "new" && (
        <Card className="p-6 max-w-lg">
          <SectionTitle>Новая рекламная кампания</SectionTitle>
          <div className="flex flex-col gap-4">
            {[
              { label: "Имя рекламодателя", key: "advertiser", placeholder: "напр. Samarkand Hotel Group" },
              { label: "Место размещения", key: "target", placeholder: "напр. Страница отелей, Главный баннер" },
              { label: "Бюджет ($)", key: "budget", placeholder: "500" },
              { label: "Макс. ставка CPC ($)", key: "bid", placeholder: "0.50" },
              { label: "Дата начала", key: "startDate", placeholder: "Sep 5, 2026" },
              { label: "Дата окончания", key: "endDate", placeholder: "Oct 5, 2026" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  {f.label.toUpperCase()}
                </label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={(newAd as any)[f.key]}
                  onChange={(e) => setNewAd((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
            ))}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ТИП РЕКЛАМЫ</label>
              <div className="flex gap-2 flex-wrap">
                {(["banner", "spotlight", "top_listing", "push"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewAd(p => ({ ...p, type: t }))}
                    className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
                    style={{
                      background: newAd.type === t ? "var(--color-amber)" : "var(--color-surface)",
                      color: newAd.type === t ? "#0d0c0a" : "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {AD_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setTab("ads")}>Отмена</Btn>
              <Btn onClick={submitAd}>Запустить кампанию</Btn>
            </div>
          </div>
        </Card>
      )}

      {showAddPromo && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAddPromo(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить продвижение</h3>
              <button onClick={() => setShowAddPromo(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>НАЗВАНИЕ БИЗНЕСА</label>
                <input type="text" placeholder="напр. Плов Центр Тошкент" value={newPromo.business}
                  onChange={e => setNewPromo(p => ({ ...p, business: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ГОРОД</label>
                <input type="text" placeholder="Tashkent" value={newPromo.city}
                  onChange={e => setNewPromo(p => ({ ...p, city: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
              <div>
                <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>КАТЕГОРИЯ</label>
                <div className="flex gap-2 flex-wrap">
                  {(["restaurant","hotel","tour","attraction"] as const).map(c => (
                    <button key={c} onClick={() => setNewPromo(p => ({ ...p, category: c }))}
                      className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize"
                      style={{ background: newPromo.category === c ? "var(--color-amber)" : "var(--color-surface)", color: newPromo.category === c ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
                    >{{ restaurant: "Ресторан", hotel: "Отель", tour: "Тур", attraction: "Достопримечательность" }[c]}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ЕЖЕМЕСЯЧНАЯ ПЛАТА ($)</label>
                <input type="number" placeholder="150" value={newPromo.monthlyFee}
                  onChange={e => setNewPromo(p => ({ ...p, monthlyFee: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAddPromo(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newPromo.business) return;
                const maxRank = Math.max(...promos.map(p => p.boostedRank), 0);
                setPromos(prev => [...prev, {
                  id: `new-${Date.now()}`, business: newPromo.business,
                  category: newPromo.category as Promotion["category"],
                  currentRank: 99, boostedRank: maxRank + 1,
                  monthlyFee: Number(newPromo.monthlyFee) || 100,
                  active: true, since: new Date().toLocaleDateString("ru", { month: "short", year: "numeric" }),
                  city: newPromo.city || "Tashkent",
                }]);
                setShowAddPromo(false);
                setNewPromo({ business: "", city: "", category: "restaurant", monthlyFee: "" });
                setTab("promotions");
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
