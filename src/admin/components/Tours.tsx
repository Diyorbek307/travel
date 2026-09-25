import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedRoute as Tour, RouteStop } from "@/lib/types";

/**
 * Туры — в приложении это раздел «Экскурсии».
 *
 * Раньше «Добавить» писал название в поле, которое потом не читалось, и
 * тур не создавался вовсе, а «Изменить» только показывал цифры. Теперь
 * одна форма и для нового тура, и для правки: черновик применяется разом
 * по «Сохранить», и изменения сразу видны у туристов.
 */

const КАТЕГОРИИ = ["Культура", "Классика", "Приключения", "Ремёсла", "Экспедиция", "Еда", "Город", "Природа"];
const СЛОЖНОСТЬ = ["Лёгкий", "Средний", "Сложный"];
const СТАТУС: Record<string, string> = {
  active: "активен",
  paused: "приостановлен",
  draft: "черновик",
  suspended: "отключён",
};

const ПУСТОЙ: Tour = {
  id: "",
  title: "",
  sub: "",
  duration: "",
  icon: "🗺️",
  // Цвет — настоящий hex: переменные панели приложение не знает.
  color: "#0E6F66",
  badge: "Культура",
  stops: [],
  city: "",
  img: "",
  price: 0,
  difficulty: "Лёгкий",
  category: "Культура",
  bookings: 0,
  maxGroup: 12,
  guide: "",
  nextDep: "",
  rating: 0,
  status: "draft",
};

const ПУСТАЯ_ОСТАНОВКА: RouteStop = { time: "", name: "", dur: "", note: "", entry: "" };

const полеСтиль = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
} as const;

export default function Tours() {
  const [tours, setTours] = useEntity("routes");
  const [cities] = useEntity("cities");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [черновик, setЧерновик] = useState<Tour | null>(null);

  const categories = ["all", ...Array.from(new Set(tours.map((t) => t.category)))];
  const statusFilter = filter === "all" ? tours : tours.filter((t) => t.status === filter);
  const filtered = catFilter === "all" ? statusFilter : statusFilter.filter((t) => t.category === catFilter);

  const diffColor = (d: string) => (d === "Лёгкий" ? "teal" : d === "Средний" ? "amber" : "rose");

  const statusColor = (s: string) => (s === "active" ? "teal" : s === "draft" ? "dim" : "rose");

  const toggleStatus = (id: string) => {
    setTours((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "active" ? "paused" : "active" } : t)),
    );
  };

  const save = () => {
    if (!черновик || !черновик.title.trim()) return;
    // Пустые строки остановок не сохраняем: в карточке они были бы дырами.
    const stops = черновик.stops.filter((s) => s.name.trim());
    const тур: Tour = {
      ...черновик,
      title: черновик.title.trim(),
      stops,
      badge: черновик.category,
      // Подпись под названием в приложении — из остановок и цены.
      sub: [stops.length ? `${stops.length} остановок` : "", черновик.price ? `~$${черновик.price}` : ""]
        .filter(Boolean)
        .join(" · "),
      city: черновик.city || undefined,
      img: черновик.img?.trim() || undefined,
      guide: черновик.guide.trim(),
    };
    if (тур.id) setTours((prev) => prev.map((t) => (t.id === тур.id ? тур : t)));
    else setTours((prev) => [...prev, { ...тур, id: `tour-${Date.now().toString(36)}` }]);
    setЧерновик(null);
  };

  // Удаление необратимо и сразу убирает экскурсию у туристов — спрашиваем.
  const remove = (t: Tour) => {
    if (!confirm(`Удалить тур «${t.title}»? Экскурсия сразу исчезнет у туристов.`)) return;
    setTours((prev) => prev.filter((x) => x.id !== t.id));
    setЧерновик(null);
  };

  const правка = <K extends keyof Tour>(k: K, v: Tour[K]) => setЧерновик((d) => d && { ...d, [k]: v });
  const правкаОстановки = (i: number, k: keyof RouteStop, v: string) =>
    setЧерновик((d) => d && { ...d, stops: d.stops.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });

  const totalRevenue = filtered.reduce((s, t) => s + t.price * t.bookings, 0);

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Туры и экскурсии"
        subtitle={`${filtered.length} туров · $${totalRevenue.toLocaleString()} общая выручка`}
        action={<Btn onClick={() => setЧерновик(ПУСТОЙ)}>+ Добавить тур</Btn>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "active", "paused", "draft"].map((f) => {
            const statusLabel: Record<string, string> = {
              all: "Все",
              active: "Активные",
              paused: "Приостановлены",
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
                {statusLabel[f]}
              </button>
            );
          })}
        </div>
        <div className="w-px h-5 shrink-0" style={{ background: "var(--color-border)" }} />
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="px-3 py-1.5 rounded text-xs transition-all cursor-pointer capitalize"
              style={{
                background:
                  catFilter === c ? "color-mix(in srgb, var(--color-amber) 15%, transparent)" : "transparent",
                color: catFilter === c ? "var(--color-amber)" : "var(--color-muted)",
                border: `1px solid ${
                  catFilter === c
                    ? "color-mix(in srgb, var(--color-amber) 40%, transparent)"
                    : "var(--color-border)"
                }`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Table
        cols={["НАЗВАНИЕ", "ГОРОД", "ДЛИТЕЛЬНОСТЬ", "ЦЕНА", "СЛОЖНОСТЬ", "ГИД", "БРОНИ", "СТАТУС", ""]}
        rows={filtered.map((t) => [
          <div>
            <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
              {t.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
              {t.category}
            </div>
          </div>,
          <span style={{ color: "var(--color-muted)", fontSize: "12px" }}>{t.city || "вся страна"}</span>,
          <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            {t.duration}
          </span>,
          <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
            ${t.price.toLocaleString()}
          </span>,
          <Badge label={t.difficulty} color={diffColor(t.difficulty)} />,
          <span style={{ color: "var(--color-muted)", fontSize: "12px" }}>{t.guide || "—"}</span>,
          <div>
            <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{t.bookings}</span>
            <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>/{t.maxGroup} max</span>
          </div>,
          <Badge label={СТАТУС[t.status] ?? t.status} color={statusColor(t.status)} />,
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" small onClick={() => setЧерновик(t)}>
              Изменить
            </Btn>
            <Btn
              variant={t.status === "active" ? "danger" : "ghost"}
              small
              onClick={() => toggleStatus(t.id)}
            >
              {t.status === "active" ? "Приостановить" : "Активировать"}
            </Btn>
            <Btn variant="danger" small onClick={() => remove(t)}>
              Удалить
            </Btn>
          </div>,
        ])}
      />

      {черновик && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setЧерновик(null)}
        >
          <div
            className="rounded-2xl w-full max-w-2xl p-6 max-h-[90dvh] overflow-y-auto"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                {черновик.id ? "Изменить тур" : "Новый тур"}
              </h3>
              <button
                onClick={() => setЧерновик(null)}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xl"
                style={{ color: "var(--color-text)" }}
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <label
                className="text-xs sm:col-span-2"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                НАЗВАНИЕ
                <input
                  type="text"
                  value={черновик.title ?? ""}
                  onChange={(e) => правка("title", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
              {/* Город — из списка: по нему работает фильтр «Исследовать».
                  Тур через всю страну оставляют без города. */}
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ГОРОД
                <select
                  value={черновик.city ?? ""}
                  onChange={(e) => правка("city", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  <option value="">— вся страна —</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="text-xs "
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ДЛИТЕЛЬНОСТЬ (например, 8 ч или 3 дня)
                <input
                  type="text"
                  value={черновик.duration ?? ""}
                  onChange={(e) => правка("duration", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
              <label
                className="text-xs "
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ЦЕНА ($)
                <input
                  type="number"
                  value={черновик.price ?? ""}
                  onChange={(e) => правка("price", Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
              <label
                className="text-xs "
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                ГИД
                <input
                  type="text"
                  value={черновик.guide ?? ""}
                  onChange={(e) => правка("guide", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
              <label
                className="text-xs "
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                МАКС. ГРУППА
                <input
                  type="number"
                  value={черновик.maxGroup ?? ""}
                  onChange={(e) => правка("maxGroup", Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                КАТЕГОРИЯ
                <select
                  value={черновик.category}
                  onChange={(e) => правка("category", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {[...new Set([...КАТЕГОРИИ, черновик.category])].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                СЛОЖНОСТЬ
                <select
                  value={черновик.difficulty}
                  onChange={(e) => правка("difficulty", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {СЛОЖНОСТЬ.map((d) => (
                    <option key={d} value={d}>
                      {d}
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
                  value={черновик.status}
                  onChange={(e) => правка("status", e.target.value as Tour["status"])}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {(["active", "paused", "draft"] as const).map((с) => (
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
                ФОТО — ССЫЛКА НА КАРТИНКУ
                <input
                  type="url"
                  value={черновик.img ?? ""}
                  onChange={(e) => правка("img", e.target.value)}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
            </div>

            {/* Остановки — то, что турист видит в карточке маршрута по порядку. */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                >
                  ОСТАНОВКИ ({черновик.stops.length})
                </span>
                <Btn
                  variant="ghost"
                  small
                  onClick={() => правка("stops", [...черновик.stops, ПУСТАЯ_ОСТАНОВКА])}
                >
                  + Остановка
                </Btn>
              </div>
              <div className="flex flex-col gap-2">
                {черновик.stops.map((ст, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 sm:grid-cols-[80px_1fr_80px_1fr_auto] gap-2 items-center"
                  >
                    {(
                      [
                        ["time", "Время"],
                        ["name", "Место"],
                        ["dur", "Сколько"],
                        ["note", "Заметка"],
                      ] as const
                    ).map(([k, ph]) => (
                      <input
                        key={k}
                        placeholder={ph}
                        value={ст[k]}
                        onChange={(e) => правкаОстановки(i, k, e.target.value)}
                        className="w-full rounded px-2 py-1.5 text-xs outline-none"
                        style={полеСтиль}
                      />
                    ))}
                    <Btn
                      variant="ghost"
                      small
                      onClick={() =>
                        правка(
                          "stops",
                          черновик.stops.filter((_, j) => j !== i),
                        )
                      }
                    >
                      ✕
                    </Btn>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              {черновик.id && (
                <Btn variant="danger" onClick={() => remove(черновик)}>
                  Удалить
                </Btn>
              )}
              <Btn variant="ghost" onClick={() => setЧерновик(null)}>
                Отмена
              </Btn>
              <Btn onClick={save}>{черновик.id ? "Сохранить" : "Создать"}</Btn>
            </div>
            {!черновик.title.trim() && (
              <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
                Нужно название.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
