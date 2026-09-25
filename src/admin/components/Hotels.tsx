import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";
import { useEntity } from "../context/useEntity";
import type { HotelKind, ManagedHotel as Hotel } from "@/lib/types";

/**
 * Отели.
 *
 * Здесь была ещё «заполненность номеров» — числа из семян, которые ничто
 * не обновляло: связи с системами бронирования отелей нет. Показывать их
 * рядом с настоящими данными значило бы подсовывать выдумку, поэтому
 * убраны. Цена хранится дважды — числом для таблицы и строкой для
 * приложения, — и правится в обоих местах сразу.
 */

type HotelForm = {
  name: string;
  city: string;
  stars: string;
  rooms: string;
  priceFrom: string;
  img: string;
  desc: string;
  kind: HotelKind;
};
const EMPTY_FORM: HotelForm = {
  name: "",
  city: "",
  stars: "3",
  rooms: "",
  priceFrom: "",
  img: "",
  desc: "",
  kind: "hotel",
};

/**
 * Вид гостиницы. В приложении по нему работают чипы «Отели / Мотели /
 * Хостелы» внутри раздела «Гостиницы». У старых записей поля нет — они
 * считаются отелями.
 */
const ВИД: Record<HotelKind, string> = { hotel: "Отель", motel: "Мотель", hostel: "Хостел" };
const видОтеля = (h: Hotel): HotelKind => h.kind ?? "hotel";

const СТАТУС: Record<string, string> = {
  active: "работает",
  suspended: "отключён",
  maintenance: "ремонт",
  draft: "черновик",
};

const ПОЛЯ: [keyof HotelForm, string, string][] = [
  ["name", "Название", "text"],
  ["stars", "Звёзды (1–5)", "number"],
  ["rooms", "Номеров", "number"],
  ["priceFrom", "Цена от ($ за ночь)", "number"],
  ["img", "Фото — ссылка на картинку", "url"],
];

export default function Hotels() {
  const [hotels, setHotels] = useEntity("hotels");
  const [cities] = useEntity("cities");
  const [filter, setFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<HotelKind | "all">("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<HotelForm>(EMPTY_FORM);

  const openEdit = (h: Hotel) => {
    setEditing(h);
    setForm({
      name: h.name,
      city: h.city,
      stars: String(h.stars),
      rooms: String(h.rooms),
      priceFrom: String(h.priceFrom),
      img: h.img,
      desc: h.desc,
      kind: видОтеля(h),
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id !== editing.id) return h;
        const priceFrom = Number(form.priceFrom) || h.priceFrom;
        return {
          ...h,
          name: form.name.trim() || h.name,
          city: form.city || h.city,
          stars: Math.min(5, Math.max(1, Number(form.stars) || h.stars)),
          rooms: Number(form.rooms) || h.rooms,
          priceFrom,
          // Приложение показывает строку — без неё новая цена туда не дошла бы.
          price: `$${priceFrom}`,
          img: form.img.trim() || h.img,
          desc: form.desc.trim(),
          kind: form.kind,
        };
      }),
    );
    setEditing(null);
  };

  const saveNew = () => {
    if (!form.name.trim() || !form.city) return;
    const priceFrom = Number(form.priceFrom) || 80;
    // Без фото карточка в приложении пустая — подставляем общий снимок.
    const фото =
      form.img.trim() ||
      "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=800&h=600&fit=crop&auto=format";
    const newHotel: Hotel = {
      id: `h-${Date.now().toString(36)}`,
      name: form.name.trim(),
      city: form.city,
      stars: Math.min(5, Math.max(1, Number(form.stars) || 3)),
      rooms: Number(form.rooms) || 20,
      occupied: 0,
      priceFrom,
      price: `$${priceFrom}`,
      rating: 0,
      reviews: 0,
      status: "active",
      facilities: ["Wi-Fi"],
      tag: "Новый",
      desc: form.desc.trim(),
      img: фото,
      imgs: фото ? [фото] : [],
      kind: form.kind,
    };
    setHotels((prev) => [...prev, newHotel]);
    setShowAdd(false);
    setForm(EMPTY_FORM);
  };

  const toggleSuspend = (id: string) =>
    setHotels((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, status: h.status === "active" ? ("suspended" as const) : ("active" as const) }
          : h,
      ),
    );

  // Удаление необратимо и сразу убирает гостиницу у туристов, поэтому
  // спрашиваем. Чаще хватает «Отключить» — запись остаётся в панели.
  const remove = (h: Hotel) => {
    if (!confirm(`Удалить «${h.name}»? Гостиница сразу исчезнет у туристов.`)) return;
    setHotels((prev) => prev.filter((x) => x.id !== h.id));
  };

  const поГороду = filter === "all" ? hotels : hotels.filter((h) => h.city === filter);
  const filtered = kindFilter === "all" ? поГороду : поГороду.filter((h) => видОтеля(h) === kindFilter);
  const filterCities = ["all", ...Array.from(new Set(hotels.map((h) => h.city)))];
  const statusColor = (s: string) => (s === "active" ? "teal" : s === "maintenance" ? "amber" : "rose");
  const totalRooms = filtered.reduce((s, h) => s + h.rooms, 0);
  const активных = hotels.filter((h) => h.status === "active").length;

  const поля = (
    <div className="flex flex-col gap-3 mb-5">
      {ПОЛЯ.map(([k, label, type]) => (
        <label
          key={k}
          className="text-xs"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          {label.toUpperCase()}
          <input
            type={type}
            value={form[k]}
            onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
            className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
            }}
          />
        </label>
      ))}
      <label className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
        ВИД
        <select
          value={form.kind}
          onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value as HotelKind }))}
          className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
        >
          {(Object.keys(ВИД) as HotelKind[]).map((k) => (
            <option key={k} value={k}>
              {ВИД[k]}
            </option>
          ))}
        </select>
      </label>
      {/* Город — из списка: приложение ищет погоду и фильтрует по точному
          названию, «Tashkent» вместо «Ташкент» у него не найдётся. */}
      <label className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
        ГОРОД
        <select
          value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="">— выберите —</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
        ОПИСАНИЕ
        <textarea
          rows={3}
          value={form.desc}
          onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
          className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
        />
      </label>
    </div>
  );

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Гостиницы"
        subtitle={`${filtered.length} объектов · ${активных} работают`}
        action={
          <Btn
            onClick={() => {
              setForm(EMPTY_FORM);
              setShowAdd(true);
            }}
          >
            + Добавить гостиницу
          </Btn>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        {[
          { label: "ВСЕГО ОБЪЕКТОВ", val: String(hotels.length) },
          { label: "РАБОТАЮТ", val: String(активных) },
          { label: "ВСЕГО НОМЕРОВ", val: String(totalRooms) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
          >
            <div
              className="text-xs mb-1.5"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
            >
              {s.label}
            </div>
            <div
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}
            >
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {filterCities.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer"
              style={{
                background: filter === c ? "var(--color-amber)" : "var(--color-panel)",
                color: filter === c ? "var(--color-on-accent)" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {c === "all" ? "Все" : c}
            </button>
          ))}
          <div className="w-px h-5 shrink-0 self-center" style={{ background: "var(--color-border)" }} />
          {(["all", "hotel", "motel", "hostel"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className="px-3 py-1.5 rounded text-xs transition-all cursor-pointer"
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
              {k === "all" ? "Все виды" : ВИД[k]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(["cards", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={v === "cards" ? "Карточки" : "Таблица"}
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
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))" }}
        >
          {filtered.map((h) => (
            <div
              key={h.id}
              className="rounded-lg overflow-hidden"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex flex-wrap gap-0">
                {h.img ? (
                  <img
                    src={h.img}
                    alt={h.name}
                    className="w-24 h-24 object-cover shrink-0"
                    style={{ background: "var(--color-dim)" }}
                  />
                ) : (
                  <div
                    className="flex w-24 h-24 shrink-0 items-center justify-center text-2xl"
                    style={{ background: "var(--color-dim)" }}
                  >
                    🏨
                  </div>
                )}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
                        {h.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                        {ВИД[видОтеля(h)]} · {h.city} · {"★".repeat(h.stars)}
                      </div>
                    </div>
                    <Badge label={СТАТУС[h.status] ?? h.status} color={statusColor(h.status)} />
                  </div>
                  <div
                    className="flex flex-wrap gap-4 mt-2 text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
                  >
                    <span style={{ color: "var(--color-amber)" }}>★ {h.rating || "—"}</span>
                    <span>От ${h.priceFrom}/ночь</span>
                    <span>{h.rooms} номеров</span>
                  </div>
                  {!h.img && (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-rose)" }}>
                      Нет фото — в приложении карточка будет пустой
                    </p>
                  )}
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
                    style={{
                      background: "var(--color-dim)",
                      color: "var(--color-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {a}
                  </span>
                ))}
                <div className="ml-auto flex flex-wrap gap-2">
                  <Btn variant="ghost" small onClick={() => openEdit(h)}>
                    Изменить
                  </Btn>
                  <Btn
                    variant={h.status === "active" ? "danger" : "ghost"}
                    small
                    onClick={() => toggleSuspend(h.id)}
                  >
                    {h.status === "active" ? "Отключить" : "Включить"}
                  </Btn>
                  <Btn variant="danger" small onClick={() => remove(h)}>
                    Удалить
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          cols={["НАЗВАНИЕ", "ВИД", "ГОРОД", "ЗВ.", "НОМЕРОВ", "ОТ/НОЧЬ", "РЕЙТИНГ", "СТАТУС", ""]}
          rows={filtered.map((h) => [
            <span key="n" className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
              {h.name}
            </span>,
            <span key="k" style={{ color: "var(--color-muted)" }}>
              {ВИД[видОтеля(h)]}
            </span>,
            <span key="c" style={{ color: "var(--color-muted)" }}>
              {h.city}
            </span>,
            <span key="s" style={{ color: "var(--color-amber)" }}>
              {"★".repeat(h.stars)}
            </span>,
            <span key="r" style={{ fontFamily: "var(--font-mono)" }}>
              {h.rooms}
            </span>,
            <span key="p" style={{ fontFamily: "var(--font-mono)" }}>
              ${h.priceFrom}
            </span>,
            <span key="t" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>
              ★ {h.rating || "—"}
            </span>,
            <Badge key="st" label={СТАТУС[h.status] ?? h.status} color={statusColor(h.status)} />,
            <div key="a" className="flex flex-wrap gap-2">
              <Btn variant="ghost" small onClick={() => openEdit(h)}>
                Изменить
              </Btn>
              <Btn
                variant={h.status === "active" ? "danger" : "ghost"}
                small
                onClick={() => toggleSuspend(h.id)}
              >
                {h.status === "active" ? "Отключить" : "Включить"}
              </Btn>
              <Btn variant="danger" small onClick={() => remove(h)}>
                Удалить
              </Btn>
            </div>,
          ])}
        />
      )}

      {(editing || showAdd) && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => {
            setEditing(null);
            setShowAdd(false);
          }}
        >
          <div
            className="rounded-2xl w-full max-w-md p-6 max-h-[90dvh] overflow-y-auto"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                {editing ? "Редактировать гостиницу" : "Добавить гостиницу"}
              </h3>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowAdd(false);
                }}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xl"
                style={{ color: "var(--color-text)" }}
              >
                ×
              </button>
            </div>
            {поля}
            <div className="flex flex-wrap gap-3">
              <Btn
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setShowAdd(false);
                }}
              >
                Отмена
              </Btn>
              <Btn onClick={editing ? saveEdit : saveNew}>{editing ? "Сохранить" : "Добавить"}</Btn>
            </div>
            {!editing && (!form.name.trim() || !form.city) && (
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
