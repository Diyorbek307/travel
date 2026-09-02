import { useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle } from "./shared";

type Flight = {
  id: string; from: string; to: string; airline: string; dep: string; arr: string;
  price: number; seats: number; status: "on_time" | "delayed" | "cancelled" | "boarding";
  date: string;
};

type Train = {
  id: string; from: string; to: string; dep: string; arr: string;
  price: number; seats: number; class: "economy" | "business" | "kupé";
  date: string; status: "on_time" | "delayed" | "cancelled";
};

type Bus = {
  id: string; from: string; to: string; dep: string; arr: string; price: number;
  seats: number; company: string; date: string; status: "on_time" | "delayed" | "cancelled";
};

const FLIGHTS: Flight[] = [
  { id: "HY-101", from: "TAS", to: "SKD", airline: "Uzbekistan Airways", dep: "07:00", arr: "08:15", price: 45, seats: 12, status: "on_time", date: "Sep 2, 2026" },
  { id: "HY-205", from: "TAS", to: "BHK", airline: "Uzbekistan Airways", dep: "09:30", arr: "11:00", price: 62, seats: 8, status: "boarding", date: "Sep 2, 2026" },
  { id: "HY-312", from: "SKD", to: "TAS", airline: "Uzbekistan Airways", dep: "14:00", arr: "15:20", price: 45, seats: 24, status: "on_time", date: "Sep 2, 2026" },
  { id: "QX-88", from: "TAS", to: "FRG", airline: "Qanot Sharq", dep: "11:45", arr: "12:55", price: 38, seats: 3, status: "delayed", date: "Sep 2, 2026" },
  { id: "HY-420", from: "BHK", to: "TAS", airline: "Uzbekistan Airways", dep: "16:30", arr: "18:00", price: 55, seats: 0, status: "cancelled", date: "Sep 2, 2026" },
];

const TRAINS: Train[] = [
  { id: "AF-001", from: "Tashkent", to: "Samarkand", dep: "07:00", arr: "09:30", price: 18, seats: 42, class: "business", date: "Sep 2, 2026", status: "on_time" },
  { id: "AF-003", from: "Tashkent", to: "Bukhara", dep: "08:15", arr: "12:00", price: 24, seats: 28, class: "business", date: "Sep 2, 2026", status: "on_time" },
  { id: "AF-012", from: "Samarkand", to: "Tashkent", dep: "15:30", arr: "18:00", price: 18, seats: 55, class: "economy", date: "Sep 2, 2026", status: "on_time" },
  { id: "S-055", from: "Tashkent", to: "Fergana", dep: "06:00", arr: "10:30", price: 12, seats: 80, class: "kupé", date: "Sep 2, 2026", status: "delayed" },
  { id: "AF-021", from: "Bukhara", to: "Khiva", dep: "13:00", arr: "16:30", price: 15, seats: 36, class: "economy", date: "Sep 2, 2026", status: "on_time" },
];

const BUSES: Bus[] = [
  { id: "BUS-1", from: "Tashkent", to: "Samarkand", dep: "06:00", arr: "11:00", price: 8, seats: 16, company: "Uzavtoyol", date: "Sep 2, 2026", status: "on_time" },
  { id: "BUS-2", from: "Samarkand", to: "Bukhara", dep: "09:00", arr: "14:00", price: 7, seats: 22, company: "Sharq Express", date: "Sep 2, 2026", status: "on_time" },
  { id: "BUS-3", from: "Tashkent", to: "Nukus", dep: "20:00", arr: "08:00+1", price: 15, seats: 4, company: "Uzavtoyol", date: "Sep 2, 2026", status: "on_time" },
  { id: "BUS-4", from: "Bukhara", to: "Khiva", dep: "10:00", arr: "14:30", price: 6, seats: 0, company: "Khorezm Trans", date: "Sep 2, 2026", status: "delayed" },
];

const STATUS_COLOR: Record<string, "teal" | "amber" | "rose" | "dim"> = {
  on_time: "teal", boarding: "amber", delayed: "amber", cancelled: "rose",
};

const STATUS_LABEL: Record<string, string> = {
  on_time: "вовремя", boarding: "посадка", delayed: "задержан", cancelled: "отменён",
};

const EMPTY_FLIGHT = { id: "", from: "", to: "", airline: "", dep: "", arr: "", price: "", seats: "" };
const EMPTY_ROUTE = { id: "", from: "", to: "", dep: "", arr: "", price: "", seats: "" };

export default function Transport() {
  const [tab, setTab] = useState<"overview" | "taxi" | "flights" | "trains" | "buses">("overview");
  const [yandexConnected, setYandexConnected] = useState(false);
  const [yandexLogin, setYandexLogin] = useState("");
  const [flights, setFlights] = useState<Flight[]>(FLIGHTS);
  const [trains, setTrains] = useState<Train[]>(TRAINS);
  const [buses, setBuses] = useState<Bus[]>(BUSES);
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState<"train" | "bus" | null>(null);
  const [showYandexMgmt, setShowYandexMgmt] = useState(false);
  const [newFlight, setNewFlight] = useState(EMPTY_FLIGHT);
  const [newRoute, setNewRoute] = useState(EMPTY_ROUTE);

  const activeTaxis = 8;

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader title="Транспорт" subtitle="Управление всеми транспортными интеграциями" />

      {/* Tab nav */}
      <div className="flex gap-1 mb-7 flex-wrap">
        {([
          ["overview", "Обзор"],
          ["taxi", "🚕 Яндекс Такси"],
          ["flights", "✈ Авиарейсы"],
          ["trains", "🚄 Поезда"],
          ["buses", "🚌 Автобусы"],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{ background: tab === id ? "var(--color-amber)" : "var(--color-panel)", color: tab === id ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}
          >{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {[
              { label: "ПОЕЗДОК СЕГОДНЯ", val: String(activeTaxis), sub: "через Яндекс", color: "var(--color-amber)" },
              { label: "АВИАРЕЙСОВ", val: String(flights.length), sub: "сегодня", color: "var(--color-teal)" },
              { label: "МАРШРУТОВ ПОЕЗДОВ", val: String(trains.length), sub: "активных сегодня", color: "var(--color-text)" },
              { label: "МАРШРУТОВ АВТОБУСОВ", val: String(buses.length), sub: "активных сегодня", color: "var(--color-text)" },
            ].map(s => (
              <div key={s.label} className="rounded-lg px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
                <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Taxi widget */}
            <Card className="p-5">
              <SectionTitle>Яндекс Такси</SectionTitle>
              <div className={`rounded-lg p-4 mb-4 ${yandexConnected ? "" : ""}`}
                style={{ background: yandexConnected ? "rgba(42,141,122,0.08)" : "rgba(212,135,42,0.08)", border: `1px solid ${yandexConnected ? "rgba(42,141,122,0.3)" : "rgba(212,135,42,0.3)"}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: yandexConnected ? "var(--color-teal)" : "var(--color-amber)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {yandexConnected ? "Подключено к Яндекс" : "Не подключено"}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {yandexConnected ? `Аккаунт: ${yandexLogin} · ${activeTaxis} активных поездок` : "Подключите аккаунт Яндекс для предложения такси пользователям"}
                </div>
              </div>
              {yandexConnected ? (
                <div className="flex gap-2">
                  <Btn variant="ghost" small onClick={() => setYandexConnected(false)}>Отключить</Btn>
                  <Btn small>Управление поездками</Btn>
                </div>
              ) : (
                <button
                  onClick={() => { setYandexConnected(true); setYandexLogin("admin@uztravel"); }}
                  className="w-full rounded-lg py-3 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ background: "#FC3F1D", color: "#fff", border: "none" }}
                >
                  <span style={{ fontSize: "16px" }}>Y</span> Подключить аккаунт Яндекс
                </button>
              )}
            </Card>

            {/* Flight summary */}
            <Card className="p-5">
              <SectionTitle>Статус рейсов сегодня</SectionTitle>
              <div className="flex flex-col gap-2">
                {flights.slice(0, 4).map(f => (
                  <div key={f.id} className="flex items-center gap-3 text-xs py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", width: "56px" }}>{f.id}</span>
                    <span style={{ color: "var(--color-text)" }}>{f.from} → {f.to}</span>
                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{f.dep}</span>
                    <div className="ml-auto"><Badge label={STATUS_LABEL[f.status] ?? f.status} color={STATUS_COLOR[f.status]} /></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Train summary */}
            <Card className="p-5">
              <SectionTitle>Расписание поездов</SectionTitle>
              <div className="flex flex-col gap-2">
                {trains.slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-center gap-3 text-xs py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", width: "56px" }}>{t.id}</span>
                    <span style={{ color: "var(--color-text)" }}>{t.from} → {t.to}</span>
                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{t.dep}</span>
                    <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>${t.price}</span>
                    <div className="ml-auto"><Badge label={STATUS_LABEL[t.status] ?? t.status} color={STATUS_COLOR[t.status]} /></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bus summary */}
            <Card className="p-5">
              <SectionTitle>Маршруты автобусов</SectionTitle>
              <div className="flex flex-col gap-2">
                {buses.map(b => (
                  <div key={b.id} className="flex items-center gap-3 text-xs py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", width: "56px" }}>{b.id}</span>
                    <span style={{ color: "var(--color-text)" }}>{b.from} → {b.to}</span>
                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{b.dep}</span>
                    <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>${b.price}</span>
                    <div className="ml-auto">
                      <Badge label={b.seats === 0 ? "распродан" : STATUS_LABEL[b.status] ?? b.status} color={b.seats === 0 ? "rose" : STATUS_COLOR[b.status]} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "taxi" && (
        <div className="max-w-xl">
          <Card className="p-6 mb-5">
            <SectionTitle>Интеграция Яндекс Такси</SectionTitle>
            <div className={`rounded-lg p-4 mb-5`}
              style={{ background: yandexConnected ? "rgba(42,141,122,0.08)" : "rgba(212,135,42,0.08)", border: `1px solid ${yandexConnected ? "rgba(42,141,122,0.3)" : "rgba(212,135,42,0.3)"}` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg font-bold" style={{ background: "#FC3F1D" }}>Y</div>
                <div>
                  <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>Yandex.Taxi</div>
                  <div className="text-xs" style={{ color: yandexConnected ? "var(--color-teal)" : "var(--color-amber)" }}>
                    {yandexConnected ? `✓ Подключено — ${yandexLogin}` : "Не подключено"}
                  </div>
                </div>
              </div>
              {!yandexConnected && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  Подключите аккаунт Яндекс, чтобы пользователи могли заказывать такси прямо в приложении. Поездки бронируются и оплачиваются через инфраструктуру Яндекса.
                </p>
              )}
            </div>

            {!yandexConnected ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ЛОГИН ИЛИ EMAIL ЯНДЕКС</label>
                  <input type="text" placeholder="yourname@yandex.com" value={yandexLogin} onChange={e => setYandexLogin(e.target.value)}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  />
                </div>
                <button
                  onClick={() => setYandexConnected(true)}
                  className="w-full rounded-lg py-3 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: "#FC3F1D", color: "#fff" }}
                >
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>Y</span> Подключить через OAuth
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Активных поездок", val: String(activeTaxis) },
                    { label: "Бронирований сегодня", val: "23" },
                    { label: "Доход", val: "$186" },
                  ].map(s => (
                    <div key={s.label} className="rounded p-3 text-center" style={{ background: "var(--color-surface)" }}>
                      <div className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}>{s.val}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Btn onClick={() => setShowYandexMgmt(true)}>Управление интеграцией</Btn>
                  <Btn variant="danger" onClick={() => setYandexConnected(false)}>Отключить</Btn>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <SectionTitle>Активные поездки (онлайн)</SectionTitle>
            {yandexConnected ? (
              <div className="flex flex-col gap-2">
                {[
                  { user: "Maria Chen", from: "Registan Hotel", to: "Airport", status: "in_ride", driver: "B. Tursunov" },
                  { user: "James Walker", from: "Bukhara Center", to: "Train Station", status: "arriving", driver: "S. Karimov" },
                  { user: "Yuki Tanaka", from: "Tashkent Airport", to: "Wyndham Hotel", status: "in_ride", driver: "F. Yusupov" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 text-sm" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}>
                      {r.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium" style={{ color: "var(--color-text)" }}>{r.user}</div>
                      <div className="text-xs" style={{ color: "var(--color-muted)" }}>{r.from} → {r.to}</div>
                    </div>
                    <div className="text-xs text-right shrink-0">
                      <div style={{ color: "var(--color-muted)" }}>{r.driver}</div>
                      <Badge label={r.status === "in_ride" ? "в поездке" : "подъезжает"} color={r.status === "in_ride" ? "teal" : "amber"} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>
                Подключите Яндекс для просмотра поездок
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "flights" && (
        <div>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-panel)", borderBottom: "1px solid var(--color-border)" }}>
                  {["РЕЙС", "МАРШРУТ", "АВИАКОМПАНИЯ", "ДАТА", "ОТПР", "ПРИБЫТИЕ", "ЦЕНА", "МЕСТА", "СТАТУС"].map(c => (
                    <th key={c} className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flights.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: i < FLIGHTS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <td className="px-4 py-3" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>{f.id}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>{f.from} → {f.to}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-muted)" }}>{f.airline}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{f.date}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)" }}>{f.dep}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)" }}>{f.arr}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: "var(--color-teal)" }}>${f.price}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: f.seats === 0 ? "var(--color-rose)" : "var(--color-text)" }}>
                      {f.seats === 0 ? "Нет мест" : f.seats}
                    </td>
                    <td className="px-4 py-3"><Badge label={STATUS_LABEL[f.status] ?? f.status} color={STATUS_COLOR[f.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-3">
            <Btn onClick={() => setShowAddFlight(true)}>+ Добавить рейс</Btn>
            <Btn variant="ghost">Импорт из API</Btn>
          </div>
        </div>
      )}

      {tab === "trains" && (
        <div>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-panel)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ПОЕЗД", "МАРШРУТ", "ДАТА", "ОТПР", "ПРИБЫТИЕ", "КЛАСС", "ЦЕНА", "МЕСТА", "СТАТУС"].map(c => (
                    <th key={c} className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trains.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < TRAINS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <td className="px-4 py-3" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>{t.id}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>{t.from} → {t.to}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>{t.date}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)" }}>{t.dep}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)" }}>{t.arr}</td>
                    <td className="px-4 py-3"><Badge label={t.class} color={t.class === "business" ? "amber" : "dim"} /></td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: "var(--color-teal)" }}>${t.price}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)" }}>{t.seats}</td>
                    <td className="px-4 py-3"><Badge label={STATUS_LABEL[t.status] ?? t.status} color={STATUS_COLOR[t.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-3">
            <Btn onClick={() => setShowAddRoute("train")}>+ Добавить маршрут</Btn>
            <Btn variant="ghost">Синхронизация с ЖД Узбекистана</Btn>
          </div>
        </div>
      )}

      {tab === "buses" && (
        <div>
          <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {buses.map(b => (
              <div key={b.id} className="rounded-lg p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{b.from} → {b.to}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{b.company}</div>
                  </div>
                  <Badge label={b.seats === 0 ? "распродан" : STATUS_LABEL[b.status] ?? b.status} color={b.seats === 0 ? "rose" : STATUS_COLOR[b.status]} />
                </div>
                <div className="flex gap-4 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                  <span>{b.dep} → {b.arr}</span>
                  <span style={{ color: "var(--color-teal)" }}>${b.price}</span>
                  <span>{b.seats > 0 ? `${b.seats} мест` : "Нет мест"}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Btn variant="ghost" small>Изменить</Btn>
                  <Btn variant="ghost" small>Бронирования</Btn>
                </div>
              </div>
            ))}
          </div>
          <Btn onClick={() => setShowAddRoute("bus")}>+ Добавить маршрут</Btn>
        </div>
      )}

      {/* Add flight modal */}
      {showAddFlight && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAddFlight(false)}>
          <div className="rounded-2xl w-full max-w-lg p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить рейс</h3>
              <button onClick={() => setShowAddFlight(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {([["id","Номер рейса","text"],["from","Откуда (код)","text"],["to","Куда (код)","text"],["airline","Авиакомпания","text"],["dep","Отправление","text"],["arr","Прибытие","text"],["price","Цена ($)","number"],["seats","Мест","number"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newFlight as any)[k]} onChange={e => setNewFlight(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAddFlight(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newFlight.id || !newFlight.from) return;
                setFlights(prev => [...prev, {
                  id: newFlight.id, from: newFlight.from, to: newFlight.to,
                  airline: newFlight.airline || "Uzbekistan Airways",
                  dep: newFlight.dep, arr: newFlight.arr,
                  price: Number(newFlight.price) || 0, seats: Number(newFlight.seats) || 0,
                  status: "on_time" as const, date: "Sep 2, 2026",
                }]);
                setShowAddFlight(false);
                setNewFlight(EMPTY_FLIGHT);
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add train/bus route modal */}
      {showAddRoute && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAddRoute(null)}>
          <div className="rounded-2xl w-full max-w-lg p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                {showAddRoute === "train" ? "Добавить маршрут поезда" : "Добавить маршрут автобуса"}
              </h3>
              <button onClick={() => setShowAddRoute(null)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {([["id","Номер","text"],["from","Откуда","text"],["to","Куда","text"],["dep","Отправление","text"],["arr","Прибытие","text"],["price","Цена ($)","number"],["seats","Мест","number"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newRoute as any)[k]} onChange={e => setNewRoute(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAddRoute(null)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newRoute.id || !newRoute.from) return;
                if (showAddRoute === "train") {
                  setTrains(prev => [...prev, {
                    id: newRoute.id, from: newRoute.from, to: newRoute.to,
                    dep: newRoute.dep, arr: newRoute.arr,
                    price: Number(newRoute.price) || 0, seats: Number(newRoute.seats) || 0,
                    class: "economy" as const, date: "Sep 2, 2026", status: "on_time" as const,
                  }]);
                } else {
                  setBuses(prev => [...prev, {
                    id: newRoute.id, from: newRoute.from, to: newRoute.to,
                    dep: newRoute.dep, arr: newRoute.arr,
                    price: Number(newRoute.price) || 0, seats: Number(newRoute.seats) || 0,
                    company: "Uzavtoyol", date: "Sep 2, 2026", status: "on_time" as const,
                  }]);
                }
                setShowAddRoute(null);
                setNewRoute(EMPTY_ROUTE);
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Yandex management modal */}
      {showYandexMgmt && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowYandexMgmt(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Управление Яндекс Такси</h3>
              <button onClick={() => setShowYandexMgmt(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "Аккаунт", val: yandexLogin },
                { label: "Активных поездок", val: String(activeTaxis) },
                { label: "Бронирований сегодня", val: "23" },
                { label: "Статус интеграции", val: "✓ Подключено" },
              ].map(s => (
                <div key={s.label} className="flex justify-between gap-2 items-center py-2 text-sm" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ color: "var(--color-muted)" }}>{s.label}</span>
                  <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowYandexMgmt(false)}>Закрыть</Btn>
              <Btn variant="danger" onClick={() => { setYandexConnected(false); setShowYandexMgmt(false); }}>Отключить интеграцию</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
