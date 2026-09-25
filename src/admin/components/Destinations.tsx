import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedPlace as Dest } from "@/lib/types";
import { ТИПЫ_МЕСТ } from "@/data/content";

/**
 * Типы мест — из того же списка, по которому приложение раскладывает их
 * по фильтрам («История», «Музеи»…). Тип вписывается выбором, а не
 * руками: «музей» с маленькой буквы в плитку «Музеи» уже не попал бы.
 */
const ТИПЫ = Array.from(new Set(Object.values(ТИПЫ_МЕСТ).flat()));

const ПУСТОЕ: Dest = {
  id: "",
  name: "",
  city: "",
  type: "Музей",
  region: "",
  rating: 0,
  reviews: 0,
  distance: "",
  entry: "",
  hours: "",
  visits: 0,
  tours: 0,
  status: "draft",
  img: "",
  desc: "",
  audio: false,
  qr: false,
};

const СТАТУС: Record<string, string> = {
  active: "активно",
  seasonal: "сезонное",
  draft: "черновик",
  suspended: "отключено",
};

const полеСтиль = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
} as const;

export default function Destinations() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [dests, setDests] = useEntity("places");
  const [cities] = useEntity("cities");
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  // Черновик правки: и новое место, и изменение старого правятся копией
  // и применяются разом по «Сохранить».
  const [selected, setSelected] = useState<Dest | null>(null);

  const поСтатусу = filter === "all" ? dests : dests.filter((d) => d.status === filter);
  const filtered = typeFilter === "all" ? поСтатусу : поСтатусу.filter((d) => d.type === typeFilter);
  const типыВСписке = ["all", ...Array.from(new Set([...ТИПЫ, ...dests.map((d) => d.type)]))];

  const save = () => {
    if (!selected || !selected.name.trim() || !selected.city) return;
    const место: Dest = { ...selected, name: selected.name.trim(), region: selected.region || selected.city };
    if (место.id) {
      setDests((prev) => prev.map((d) => (d.id === место.id ? место : d)));
    } else {
      // Без фото карточка в приложении пустая — подставляем общий снимок.
      const фото =
        место.img.trim() ||
        "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=800&h=600&fit=crop&auto=format";
      setDests((prev) => [...prev, { ...место, id: `p-${Date.now().toString(36)}`, img: фото }]);
    }
    setSelected(null);
  };

  // Удаление необратимо и сразу убирает место у туристов — спрашиваем.
  const remove = (d: Dest) => {
    if (!confirm(`Удалить «${d.name}»? Место сразу исчезнет у туристов.`)) return;
    setDests((prev) => prev.filter((x) => x.id !== d.id));
    setSelected(null);
  };

  const statusColor = (s: string) => (s === "active" ? "teal" : s === "seasonal" ? "amber" : "dim");

  const toggleStatus = (id: string) => {
    setDests((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === "active" ? "seasonal" : d.status === "seasonal" ? "draft" : "active",
            }
          : d,
      ),
    );
  };

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Места"
        subtitle={`${filtered.length} мест · достопримечательности и музеи`}
        action={<Btn onClick={() => setSelected(ПУСТОЕ)}>+ Добавить место</Btn>}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "active", "seasonal", "draft"] as const).map((f) => {
            const filterLabel: Record<string, string> = {
              all: "Все",
              active: "Активные",
              seasonal: "Сезонные",
              draft: "Черновик",
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
                  color: filter === f ? "var(--color-on-accent)" : "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {filterLabel[f]}
              </button>
            );
          })}
          <div className="w-px h-5 shrink-0 self-center" style={{ background: "var(--color-border)" }} />
          {типыВСписке.map((т) => (
            <button
              key={т}
              onClick={() => setTypeFilter(т)}
              className="px-3 py-1.5 rounded text-xs transition-all cursor-pointer"
              style={{
                background:
                  typeFilter === т
                    ? "color-mix(in srgb, var(--color-amber) 15%, transparent)"
                    : "transparent",
                color: typeFilter === т ? "var(--color-amber)" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {т === "all" ? "Все типы" : т}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
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
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}
        >
          {filtered.map((d) => (
            <div
              key={d.id}
              className="rounded-lg overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                transition: "transform 0.15s, border-color 0.15s",
              }}
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
                  <Badge label={СТАТУС[d.status] ?? d.status} color={statusColor(d.status)} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div
                      className="font-semibold text-base"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                    >
                      {d.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                      {d.type} · {d.city}
                    </div>
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}
                  >
                    ★ {d.rating}
                  </div>
                </div>
                <p
                  className="text-xs mt-2 leading-relaxed line-clamp-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  {d.desc}
                </p>
                <div
                  className="flex flex-wrap items-center gap-4 mt-3 text-xs"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                >
                  <span>{d.visits.toLocaleString()} посещений</span>
                  <span>{d.tours} туров</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          cols={["НАЗВАНИЕ", "ТИП", "ГОРОД", "РЕЙТИНГ", "ПОСЕЩЕНИЯ", "СТАТУС", ""]}
          rows={filtered.map((d) => [
            <span className="font-medium" style={{ color: "var(--color-text)" }}>
              {d.name}
            </span>,
            <span style={{ color: "var(--color-muted)" }}>{d.type}</span>,
            <span style={{ color: "var(--color-muted)" }}>{d.city}</span>,
            <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ {d.rating}</span>,
            <span style={{ fontFamily: "var(--font-mono)" }}>{d.visits.toLocaleString()}</span>,
            <Badge label={СТАТУС[d.status] ?? d.status} color={statusColor(d.status)} />,
            <div className="flex flex-wrap gap-2">
              <Btn variant="ghost" small onClick={() => toggleStatus(d.id)}>
                Статус
              </Btn>
              <Btn variant="ghost" small onClick={() => setSelected(d)}>
                Изменить
              </Btn>
              <Btn variant="danger" small onClick={() => remove(d)}>
                Удалить
              </Btn>
            </div>,
          ])}
        />
      )}

      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-xl w-full max-w-lg p-6 max-h-[90dvh] overflow-y-auto"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                {selected.id ? "Изменить место" : "Новое место"}
              </h3>
              <button
                className="opacity-50 hover:opacity-100 cursor-pointer text-xl"
                style={{ color: "var(--color-text)" }}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
            {selected.img && (
              <img
                src={selected.img}
                alt={selected.name}
                className="mb-4 h-36 w-full rounded object-cover"
                style={{ background: "var(--color-dim)" }}
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {(
                [
                  ["name", "Название", "sm:col-span-2"],
                  ["entry", "Вход (например, $5 или Бесплатно)", ""],
                  ["hours", "Часы работы", ""],
                  ["img", "Фото — ссылка на картинку", "sm:col-span-2"],
                ] as const
              ).map(([k, label, cls]) => (
                <label
                  key={k}
                  className={`text-xs ${cls}`}
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                >
                  {label.toUpperCase()}
                  <input
                    value={selected[k]}
                    onChange={(e) => setSelected((d) => d && { ...d, [k]: e.target.value })}
                    className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                    style={полеСтиль}
                  />
                </label>
              ))}
              {/* Город — из списка: приложение фильтрует по точному названию. */}
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ГОРОД
                <select
                  value={selected.city}
                  onChange={(e) => setSelected((d) => d && { ...d, city: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  <option value="">— выберите —</option>
                  {cities.map((c) => (
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
                  value={selected.type}
                  onChange={(e) => setSelected((d) => d && { ...d, type: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {/* Тип, которого нет в списке (заведён раньше), не теряем. */}
                  {[...new Set([...ТИПЫ, selected.type].filter(Boolean))].map((т) => (
                    <option key={т} value={т}>
                      {т}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                СТАТУС
                <select
                  value={selected.status}
                  onChange={(e) =>
                    setSelected((d) => d && { ...d, status: e.target.value as Dest["status"] })
                  }
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {(["active", "seasonal", "draft", "suspended"] as const).map((с) => (
                    <option key={с} value={с}>
                      {СТАТУС[с]}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="text-xs sm:col-span-2"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ОПИСАНИЕ
                <textarea
                  rows={3}
                  value={selected.desc}
                  onChange={(e) => setSelected((d) => d && { ...d, desc: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none resize-none"
                  style={полеСтиль}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              {selected.id && (
                <Btn variant="danger" onClick={() => remove(selected)}>
                  Удалить
                </Btn>
              )}
              <Btn variant="ghost" onClick={() => setSelected(null)}>
                Отмена
              </Btn>
              <Btn onClick={save}>{selected.id ? "Сохранить" : "Добавить"}</Btn>
            </div>
            {(!selected.name.trim() || !selected.city) && (
              <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
                Нужны название и город.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
