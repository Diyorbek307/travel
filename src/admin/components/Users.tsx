import { useState } from "react";
import { PageHeader, Badge, Btn, Table } from "./shared";

type User = {
  id: number;
  name: string;
  email: string;
  country: string;
  flag: string;
  joined: string;
  bookings: number;
  spent: number;
  role: "traveler" | "guide" | "hotel_manager" | "admin";
  status: "active" | "suspended" | "unverified";
};

const USERS: User[] = [
  { id: 1, name: "Alisher Nazarov", email: "ali.nazarov@mail.uz", country: "Uzbekistan", flag: "🇺🇿", joined: "Jan 12, 2025", bookings: 8, spent: 12840, role: "traveler", status: "active" },
  { id: 2, name: "Maria Chen", email: "m.chen@gmail.com", country: "China", flag: "🇨🇳", joined: "Mar 4, 2025", bookings: 3, spent: 2100, role: "traveler", status: "active" },
  { id: 3, name: "James Walker", email: "j.walker@outlook.com", country: "UK", flag: "🇬🇧", joined: "Feb 19, 2024", bookings: 12, spent: 18400, role: "traveler", status: "active" },
  { id: 4, name: "Bobur Tashkentov", email: "bobur.t@uztravel.uz", country: "Uzbekistan", flag: "🇺🇿", joined: "Mar 1, 2023", bookings: 0, spent: 0, role: "guide", status: "active" },
  { id: 5, name: "Malika Yusupova", email: "m.yusupova@uztravel.uz", country: "Uzbekistan", flag: "🇺🇿", joined: "Jun 15, 2022", bookings: 0, spent: 0, role: "guide", status: "active" },
  { id: 6, name: "Dmitri Volkov", email: "d.volkov@yandex.ru", country: "Russia", flag: "🇷🇺", joined: "Nov 3, 2025", bookings: 1, spent: 0, role: "traveler", status: "suspended" },
  { id: 7, name: "Sophie Bernhard", email: "s.bernhard@gmail.de", country: "Germany", flag: "🇩🇪", joined: "Apr 22, 2024", bookings: 7, spent: 9200, role: "traveler", status: "active" },
  { id: 8, name: "Fatima Al-Hassan", email: "fatima.h@dubai.ae", country: "UAE", flag: "🇦🇪", joined: "Aug 9, 2026", bookings: 1, spent: 670, role: "traveler", status: "unverified" },
  { id: 9, name: "Jasur Karimov", email: "jasur.k@uztravel.uz", country: "Uzbekistan", flag: "🇺🇿", joined: "Sep 1, 2022", bookings: 0, spent: 0, role: "guide", status: "active" },
  { id: 10, name: "Ahmed Khalil", email: "a.khalil@eg.com", country: "Egypt", flag: "🇪🇬", joined: "Jul 1, 2025", bookings: 4, spent: 14200, role: "traveler", status: "active" },
  { id: 11, name: "Admin User", email: "admin@uztravel.uz", country: "Uzbekistan", flag: "🇺🇿", joined: "Jan 1, 2022", bookings: 0, spent: 0, role: "admin", status: "active" },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(USERS);
  const [filter, setFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", country: "", role: "traveler" });

  const roleColor = (r: string) => {
    if (r === "admin") return "rose";
    if (r === "guide") return "amber";
    if (r === "hotel_manager") return "teal";
    return "dim";
  };
  const statusColor = (s: string) =>
    s === "active" ? "teal" : s === "unverified" ? "amber" : "rose";

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  let filtered = users;
  if (filter !== "all") filtered = filtered.filter((u) => u.status === filter);
  if (roleFilter !== "all") filtered = filtered.filter((u) => u.role === roleFilter);
  if (search) filtered = filtered.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend = users.filter(u => u.role === "traveler").reduce((s, u) => s + u.spent, 0);

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Пользователи"
        subtitle={`${users.length} зарегистрировано · $${totalSpend.toLocaleString()} lifetime value`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Добавить</Btn>}
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "ПУТЕШЕСТВЕННИКИ", val: String(users.filter((u) => u.role === "traveler").length) },
          { label: "ГИДЫ", val: String(users.filter((u) => u.role === "guide").length) },
          { label: "НЕ ВЕРИФИЦИРОВАНЫ", val: String(users.filter((u) => u.status === "unverified").length) },
          { label: "ЗАБЛОКИРОВАНЫ", val: String(users.filter((u) => u.status === "suspended").length) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
          >
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по имени или email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded px-3 py-1.5 text-sm outline-none"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            width: "220px",
          }}
        />
        <div className="flex flex-wrap gap-1.5">
          {["all", "active", "unverified", "suspended"].map((f) => {
            const statusLabel: Record<string, string> = { all: "Все", active: "Активные", unverified: "Не верифицированы", suspended: "Заблокированы" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
                  color: filter === f ? "#0d0c0a" : "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {statusLabel[f]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "traveler", "guide", "hotel_manager", "admin"].map((r) => {
            const roleLabel: Record<string, string> = { all: "Все", traveler: "Путешественник", guide: "Гид", hotel_manager: "Менеджер отеля", admin: "Админ" };
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded text-xs transition-all cursor-pointer"
                style={{
                  background: roleFilter === r ? "rgba(212,135,42,0.15)" : "transparent",
                  color: roleFilter === r ? "var(--color-amber)" : "var(--color-muted)",
                  border: `1px solid ${roleFilter === r ? "rgba(212,135,42,0.4)" : "var(--color-border)"}`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {roleLabel[r]}
              </button>
            );
          })}
        </div>
      </div>

      <Table
        cols={["ПОЛЬЗОВАТЕЛЬ", "СТРАНА", "РОЛЬ", "ДАТА", "БРОНИ", "ВСЕГО ПОТРАЧЕНО", "СТАТУС", ""]}
        rows={filtered.map((u) => [
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
            >
              {u.name[0]}
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{u.name}</div>
              <div className="text-xs" style={{ color: "var(--color-muted)" }}>{u.email}</div>
            </div>
          </div>,
          <span style={{ color: "var(--color-muted)" }}>{u.flag} {u.country}</span>,
          <Badge label={u.role.replace("_", " ")} color={roleColor(u.role) as any} />,
          <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{u.joined}</span>,
          <span style={{ fontFamily: "var(--font-mono)" }}>{u.bookings}</span>,
          <span style={{ fontFamily: "var(--font-mono)", color: u.spent > 5000 ? "var(--color-teal)" : "var(--color-text)" }}>
            {u.spent > 0 ? `$${u.spent.toLocaleString()}` : "—"}
          </span>,
          <Badge label={u.status} color={statusColor(u.status) as any} />,
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" small onClick={() => setViewing(u)}>Просмотр</Btn>
            {u.role !== "admin" && (
              <Btn variant={u.status === "active" ? "danger" : "ghost"} small onClick={() => toggleStatus(u.id)}>
                {u.status === "active" ? "Блокировать" : "Восстановить"}
              </Btn>
            )}
          </div>,
        ])}
      />
      {/* User profile modal */}
      {viewing && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setViewing(null)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex flex-wrap items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0" style={{ background: "var(--color-amber)", color: "#0d0c0a" }}>
                {viewing.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{viewing.name}</div>
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>{viewing.email}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge label={viewing.role.replace("_", " ")} color={roleColor(viewing.role) as any} />
                  <Badge label={viewing.status} color={statusColor(viewing.status) as any} />
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                { label: "Страна", val: `${viewing.flag} ${viewing.country}` },
                { label: "Регистрация", val: viewing.joined },
                { label: "Бронирований", val: String(viewing.bookings) },
                { label: "Потрачено", val: viewing.spent > 0 ? `$${viewing.spent.toLocaleString()}` : "—" },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3" style={{ background: "var(--color-surface)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="ghost" onClick={() => setViewing(null)}>Закрыть</Btn>
              {viewing.role !== "admin" && (
                <Btn variant={viewing.status === "active" ? "danger" : "ghost"} onClick={() => { toggleStatus(viewing.id); setViewing(null); }}>
                  {viewing.status === "active" ? "Заблокировать" : "Восстановить"}
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add user modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить пользователя</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {([["name","Имя","text"],["email","Email","email"],["country","Страна","text"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newUser as any)[k]} onChange={e => setNewUser(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>РОЛЬ</label>
                <div className="flex gap-2 flex-wrap">
                  {["traveler","guide","hotel_manager"].map(r => {
                    const rLabel: Record<string,string> = { traveler:"Путешественник", guide:"Гид", hotel_manager:"Менеджер отеля" };
                    return (
                      <button key={r} onClick={() => setNewUser(p => ({ ...p, role: r }))}
                        className="px-3 py-1.5 rounded text-xs cursor-pointer"
                        style={{ background: newUser.role === r ? "var(--color-amber)" : "var(--color-surface)", color: newUser.role === r ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                      >{rLabel[r]}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newUser.name || !newUser.email) return;
                setUsers(prev => [...prev, { id: prev.length + 1, name: newUser.name, email: newUser.email, country: newUser.country || "Uzbekistan", flag: "🇺🇿", joined: new Date().toLocaleDateString("ru-RU"), bookings: 0, spent: 0, role: newUser.role as User["role"], status: "active" }]);
                setShowAdd(false);
                setNewUser({ name: "", email: "", country: "", role: "traveler" });
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
