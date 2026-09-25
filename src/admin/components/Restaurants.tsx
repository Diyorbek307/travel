import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedRestaurant as Restaurant, RestaurantKind } from "@/lib/types";

/**
 * Тип заведения. В приложении бары и клубы — отдельная плитка, а в
 * «Ресторанах» их нет. У старых записей поля нет — они рестораны.
 */
const ТИП: Record<RestaurantKind, string> = { restaurant: "Ресторан", bar: "Бар или клуб" };
const типЗаведения = (r: Restaurant): RestaurantKind => r.kind ?? "restaurant";

const полеСтиль = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
} as const;

export default function Restaurants() {
  const [items, setItems] = useEntity("restaurants");
  const [allCities] = useEntity("cities");
  const [filter, setFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<RestaurantKind | "all">("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selected, setSelected] = useState<Restaurant | null>(null);
  // Черновик правки: карточка заведения раньше только показывала поля,
  // изменить их было нельзя. Правим копию, применяем по «Сохранить».
  const [draft, setDraft] = useState<Restaurant | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [showAdd, setShowAdd] = useState(false);
  const [newRest, setNewRest] = useState({
    name: "",
    city: "",
    cuisine: "",
    seats: "",
    phone: "",
    address: "",
    open: "",
    desc: "",
    kind: "restaurant" as RestaurantKind,
  });

  const cities = ["all", ...Array.from(new Set(items.map((r) => r.city)))];
  let filtered = filter === "all" ? items : items.filter((r) => r.status === filter);
  if (cityFilter !== "all") filtered = filtered.filter((r) => r.city === cityFilter);
  if (kindFilter !== "all") filtered = filtered.filter((r) => типЗаведения(r) === kindFilter);

  // Удаление необратимо и сразу убирает заведение у туристов — спрашиваем.
  const remove = (r: Restaurant) => {
    if (!confirm(`Удалить «${r.name}»? Заведение сразу исчезнет у туристов.`)) return;
    setItems((prev) => prev.filter((x) => x.id !== r.id));
    setSelected(null);
  };

  const togglePromote = (id: string) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, promoted: !r.promoted } : r)));
  };

  const approveRestaurant = (id: string) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "active" } : r)));
    setSelected(null);
  };

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Рестораны"
        subtitle={`${filtered.length} заведений · ${items.filter((r) => r.promoted).length} продвигается`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Добавить заведение</Btn>}
      />

      {items.filter((r) => r.status === "pending").length > 0 && (
        <div
          className="rounded-lg px-4 py-3 mb-6 text-sm flex flex-wrap items-center gap-2"
          style={{
            background: "color-mix(in srgb, var(--color-amber) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-amber) 20%, transparent)",
            color: "var(--color-amber-light)",
          }}
        >
          ⚠ {items.filter((r) => r.status === "pending").length} ресторан(ов) на рассмотрении
          <button className="ml-2 underline cursor-pointer text-xs" onClick={() => setFilter("pending")}>
            Просмотреть
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            ["all", "все"],
            ["active", "активные"],
            ["pending", "на рассмотрении"],
            ["suspended", "приостановлены"],
          ].map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
              style={{
                background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
                color: filter === f ? "var(--color-on-accent)" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-5 self-center" style={{ background: "var(--color-border)" }} />
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
              style={{
                background:
                  cityFilter === c
                    ? "color-mix(in srgb, var(--color-amber) 15%, transparent)"
                    : "transparent",
                color: cityFilter === c ? "var(--color-amber)" : "var(--color-muted)",
                border: `1px solid ${
                  cityFilter === c
                    ? "color-mix(in srgb, var(--color-amber) 40%, transparent)"
                    : "var(--color-border)"
                }`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {c}
            </button>
          ))}
          <div className="w-px h-5 self-center" style={{ background: "var(--color-border)" }} />
          {(["all", "restaurant", "bar"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
              style={{
                background:
                  kindFilter === k
                    ? "color-mix(in srgb, var(--color-amber) 15%, transparent)"
                    : "transparent",
                color: kindFilter === k ? "var(--color-amber)" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {k === "all" ? "все типы" : ТИП[k]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(["cards", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer"
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
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}
        >
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-lg overflow-hidden cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{
                background: "var(--color-panel)",
                border: `1px solid ${r.promoted ? "rgba(212,135,42,0.5)" : "var(--color-border)"}`,
              }}
              onClick={() => {
                setSelected(r);
                setDraft(r);
              }}
            >
              <div className="flex flex-wrap gap-0">
                <img
                  src={r.img}
                  alt={r.name}
                  className="w-24 h-24 object-cover shrink-0"
                  style={{ background: "var(--color-dim)" }}
                />
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
                        {r.promoted && <span style={{ color: "var(--color-amber)" }}>★ </span>}
                        {r.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                        {ТИП[типЗаведения(r)]} · {r.cuisine} · {r.city} · {r.priceRange}
                      </div>
                    </div>
                    <Badge
                      label={r.status}
                      color={r.status === "active" ? "teal" : r.status === "pending" ? "amber" : "rose"}
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-3 mt-2 text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
                  >
                    <span style={{ color: "var(--color-amber)" }}>★ {r.rating}</span>
                    <span>{r.seats} мест</span>
                    <span>{r.open}</span>
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: "var(--color-muted)" }}>
                    {r.monthlyViews.toLocaleString()} просмотров/мес
                  </div>
                </div>
              </div>
              <div
                className="px-3 py-2 flex flex-wrap gap-2"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <Btn
                  variant={r.promoted ? "danger" : "ghost"}
                  small
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePromote(r.id);
                  }}
                >
                  {r.promoted ? "Убрать продвижение" : "Продвигать ★"}
                </Btn>
                {r.status === "pending" && (
                  <Btn
                    small
                    onClick={(e) => {
                      e.stopPropagation();
                      approveRestaurant(r.id);
                    }}
                  >
                    Одобрить
                  </Btn>
                )}
                <Btn
                  variant="danger"
                  small
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(r);
                  }}
                >
                  Удалить
                </Btn>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          cols={["НАЗВАНИЕ", "ТИП", "ГОРОД", "КУХНЯ", "РЕЙТИНГ", "ЦЕНА", "ПРОСМ/МЕС", "СТАТУС", "ПРОДВ.", ""]}
          rows={filtered.map((r) => [
            <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
              {r.name}
            </span>,
            <span style={{ color: "var(--color-muted)" }}>{ТИП[типЗаведения(r)]}</span>,
            <span style={{ color: "var(--color-muted)" }}>{r.city}</span>,
            <span style={{ color: "var(--color-muted)" }}>{r.cuisine}</span>,
            <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ {r.rating}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{r.priceRange}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{r.monthlyViews.toLocaleString()}</span>,
            <Badge
              label={r.status}
              color={r.status === "active" ? "teal" : r.status === "pending" ? "amber" : "rose"}
            />,
            <span style={{ color: r.promoted ? "var(--color-amber)" : "var(--color-dim)" }}>
              {r.promoted ? "★ Да" : "—"}
            </span>,
            <div className="flex flex-wrap gap-2">
              <Btn
                variant="ghost"
                small
                onClick={() => {
                  setSelected(r);
                  setDraft(r);
                }}
              >
                Изменить
              </Btn>
              <Btn variant={r.promoted ? "danger" : "ghost"} small onClick={() => togglePromote(r.id)}>
                {r.promoted ? "Убрать" : "Продвинуть"}
              </Btn>
              <Btn variant="danger" small onClick={() => remove(r)}>
                Удалить
              </Btn>
            </div>,
          ])}
        />
      )}

      {showAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="rounded-2xl w-full max-w-lg p-6"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                Добавить заведение
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xl"
                style={{ color: "var(--color-text)" }}
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {(
                [
                  ["name", "Название", "text", "col-span-2"],
                  ["cuisine", "Кухня", "text", ""],
                  ["seats", "Мест", "number", ""],
                  ["phone", "Телефон", "text", ""],
                  ["address", "Адрес", "text", "col-span-2"],
                  ["open", "Часы работы", "text", ""],
                ] as [string, string, string, string][]
              ).map(([k, label, type, cls]) => (
                <div key={k} className={cls}>
                  <label
                    className="text-xs block mb-1"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {label.toUpperCase()}
                  </label>
                  <input
                    type={type}
                    value={newRest[k as keyof typeof newRest]}
                    onChange={(e) => setNewRest((p) => ({ ...p, [k]: e.target.value }))}
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
              {/* Город — из списка: приложение фильтрует по точному названию,
                  «Tashkent» вместо «Ташкент» у него не найдётся. */}
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ГОРОД
                <select
                  value={newRest.city}
                  onChange={(e) => setNewRest((p) => ({ ...p, city: e.target.value }))}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  <option value="">— выберите —</option>
                  {allCities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ТИП
                <select
                  value={newRest.kind}
                  onChange={(e) => setNewRest((p) => ({ ...p, kind: e.target.value as RestaurantKind }))}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {(Object.keys(ТИП) as RestaurantKind[]).map((k) => (
                    <option key={k} value={k}>
                      {ТИП[k]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="col-span-2">
                <label
                  className="text-xs block mb-1"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                >
                  ОПИСАНИЕ
                </label>
                <textarea
                  rows={2}
                  value={newRest.desc}
                  onChange={(e) => setNewRest((p) => ({ ...p, desc: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none resize-none"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>
                Отмена
              </Btn>
              <Btn
                onClick={() => {
                  if (!newRest.name.trim() || !newRest.city) return;
                  setItems((prev) => [
                    ...prev,
                    {
                      id: `new-${Date.now()}`,
                      name: newRest.name,
                      city: newRest.city,
                      kind: newRest.kind,
                      cuisine: newRest.cuisine || "Узбекская",
                      rating: 0,
                      priceRange: "$$" as const,
                      seats: Number(newRest.seats) || 0,
                      status: "pending" as const,
                      promoted: false,
                      phone: newRest.phone || "",
                      address: newRest.address || "",
                      open: newRest.open || "",
                      monthlyViews: 0,
                      img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=800&h=600&fit=crop&auto=format",
                      desc: newRest.desc || "",
                      reviews: 0,
                      price: "$$",
                    },
                  ]);
                  setShowAdd(false);
                  setNewRest({
                    name: "",
                    city: "",
                    cuisine: "",
                    seats: "",
                    phone: "",
                    address: "",
                    open: "",
                    desc: "",
                    kind: "restaurant",
                  });
                }}
              >
                Добавить
              </Btn>
            </div>
          </div>
        </div>
      )}

      {selected && draft && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-xl w-full max-w-md p-6 max-h-[90dvh] overflow-y-auto"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                {draft.name}
              </h3>
              <button
                className="text-xl opacity-50 hover:opacity-100 cursor-pointer"
                style={{ color: "var(--color-text)" }}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
            {/* Правим копию, применяем всё разом по «Сохранить». */}
            <div className="flex flex-col gap-3 mb-4">
              {(
                [
                  ["name", "Название", "text"],
                  ["cuisine", "Кухня", "text"],
                  ["open", "Часы работы", "text"],
                  ["phone", "Телефон", "text"],
                  ["address", "Адрес", "text"],
                  ["seats", "Мест", "number"],
                ] as const
              ).map(([k, label, type]) => (
                <div key={k}>
                  <label
                    className="text-xs block mb-1"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {label.toUpperCase()}
                  </label>
                  <input
                    type={type}
                    value={String(draft[k as keyof Restaurant] ?? "")}
                    onChange={(e) =>
                      setDraft(
                        (d) =>
                          d && { ...d, [k]: type === "number" ? Number(e.target.value) : e.target.value },
                      )
                    }
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
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ТИП
                <select
                  value={типЗаведения(draft)}
                  onChange={(e) => setDraft((d) => d && { ...d, kind: e.target.value as RestaurantKind })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {(Object.keys(ТИП) as RestaurantKind[]).map((k) => (
                    <option key={k} value={k}>
                      {ТИП[k]}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <label
                  className="text-xs block mb-1"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                >
                  ОПИСАНИЕ
                </label>
                <textarea
                  rows={3}
                  value={draft.desc}
                  onChange={(e) => setDraft((d) => d && { ...d, desc: e.target.value })}
                  className="w-full rounded px-3 py-2 text-sm outline-none resize-none"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn
                onClick={() => {
                  setItems((prev) => prev.map((r) => (r.id === draft.id ? draft : r)));
                  setSelected(null);
                }}
              >
                Сохранить
              </Btn>
              {draft.status === "pending" && (
                <Btn variant="ghost" onClick={() => approveRestaurant(draft.id)}>
                  Одобрить
                </Btn>
              )}
              <Btn
                variant={draft.promoted ? "danger" : "ghost"}
                onClick={() => {
                  togglePromote(draft.id);
                  setSelected(null);
                }}
              >
                {draft.promoted ? "Убрать продвижение" : "Продвигать ★"}
              </Btn>
              <Btn variant="ghost" onClick={() => setSelected(null)}>
                Отмена
              </Btn>
              <Btn variant="danger" onClick={() => remove(draft)}>
                Удалить
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
