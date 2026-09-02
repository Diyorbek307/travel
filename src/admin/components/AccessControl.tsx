import { useState } from "react";
import { PageHeader, Badge, Btn, SectionTitle } from "./shared";

type Role = {
  id: number;
  name: string;
  desc: string;
  color: string;
  users: number;
  permissions: Record<string, "full" | "read" | "none">;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: "active" | "suspended";
  avatar: string;
  twofa: boolean;
};

const MODULES = ["Дашборд", "Бронирования", "Туры", "Отели", "Пользователи", "Чат", "Финансы", "Аналитика", "Реклама", "Транспорт", "Настройки", "API-ключи"];

const ROLES: Role[] = [
  {
    id: 1, name: "Суперадмин", desc: "Полный доступ ко всем функциям и настройкам", color: "var(--color-amber)", users: 1,
    permissions: Object.fromEntries(MODULES.map(m => [m, "full"])) as Record<string, "full" | "read" | "none">,
  },
  {
    id: 2, name: "Менеджер контента", desc: "Управляет турами, направлениями, отелями и событиями", color: "var(--color-teal)", users: 3,
    permissions: { "Дашборд": "read", "Бронирования": "read", "Туры": "full", "Отели": "full", "Пользователи": "read", "Чат": "none", "Финансы": "none", "Аналитика": "read", "Реклама": "read", "Транспорт": "read", "Настройки": "none", "API-ключи": "none" },
  },
  {
    id: 3, name: "Агент поддержки", desc: "Обрабатывает обращения клиентов и вопросы бронирований", color: "#7a8fff", users: 5,
    permissions: { "Дашборд": "read", "Бронирования": "full", "Туры": "read", "Отели": "read", "Пользователи": "full", "Чат": "full", "Финансы": "read", "Аналитика": "read", "Реклама": "none", "Транспорт": "read", "Настройки": "none", "API-ключи": "none" },
  },
  {
    id: 4, name: "Финансовый менеджер", desc: "Доступ только к финансовым отчётам и счетам", color: "var(--color-rose)", users: 2,
    permissions: { "Дашборд": "read", "Бронирования": "read", "Туры": "none", "Отели": "none", "Пользователи": "none", "Чат": "none", "Финансы": "full", "Аналитика": "full", "Реклама": "read", "Транспорт": "none", "Настройки": "none", "API-ключи": "none" },
  },
];

const ADMIN_USERS: AdminUser[] = [
  { id: 1, name: "Рустам Мирзаев", email: "rustam@uztravel.uz", role: "Суперадмин", lastActive: "Онлайн", status: "active", avatar: "РМ", twofa: true },
  { id: 2, name: "Камола Ташкентова", email: "kamola@uztravel.uz", role: "Менеджер контента", lastActive: "2 ч назад", status: "active", avatar: "КТ", twofa: true },
  { id: 3, name: "Сардор Исмоилов", email: "sardor@uztravel.uz", role: "Менеджер контента", lastActive: "1 д назад", status: "active", avatar: "СИ", twofa: false },
  { id: 4, name: "Нилуфар Рахимова", email: "nilufar@uztravel.uz", role: "Агент поддержки", lastActive: "30 мин назад", status: "active", avatar: "НР", twofa: true },
  { id: 5, name: "Бобур Юсупов", email: "bobur@uztravel.uz", role: "Агент поддержки", lastActive: "3 ч назад", status: "active", avatar: "БЮ", twofa: false },
  { id: 6, name: "Дилшод Каримов", email: "dilshod@uztravel.uz", role: "Агент поддержки", lastActive: "5 д назад", status: "suspended", avatar: "ДК", twofa: false },
  { id: 7, name: "Зулфия Эргашева", email: "zulfiya@uztravel.uz", role: "Финансовый менеджер", lastActive: "1 ч назад", status: "active", avatar: "ЗЭ", twofa: true },
  { id: 8, name: "Алишер Нишанов", email: "alisher@uztravel.uz", role: "Финансовый менеджер", lastActive: "4 ч назад", status: "active", avatar: "АН", twofa: true },
];

const PERM_COLORS: Record<string, string> = {
  full: "var(--color-teal)",
  read: "var(--color-amber)",
  none: "var(--color-dim)",
};
const PERM_LABELS: Record<string, string> = { full: "Полный", read: "Чтение", none: "—" };

export default function AccessControl() {
  const [tab, setTab] = useState<"roles" | "users" | "audit">("roles");
  const [selectedRole, setSelectedRole] = useState<Role | null>(ROLES[0]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Агент поддержки" });

  const toggleSuspend = (id: number) => setAdminUsers(p =>
    p.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)
  );

  const roleColor = (roleName: string) => ROLES.find(r => r.name === roleName)?.color ?? "var(--color-muted)";

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Управление доступом"
        subtitle="Роли, права и управление командой администраторов"
        action={<Btn onClick={() => setShowInvite(true)}>+ Пригласить</Btn>}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6">
        {([["roles", "Роли и права"], ["users", "Администраторы"], ["audit", "Журнал аудита"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{ background: tab === id ? "var(--color-amber)" : "var(--color-panel)", color: tab === id ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}
          >{label}</button>
        ))}
      </div>

      {tab === "roles" && (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Role list */}
          <div className="flex flex-col gap-2 w-60 shrink-0">
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setSelectedRole(r)}
                className="rounded-xl p-3 text-left cursor-pointer transition-all"
                style={{
                  background: selectedRole?.id === r.id ? "var(--color-panel)" : "transparent",
                  border: `1px solid ${selectedRole?.id === r.id ? r.color : "var(--color-border)"}`,
                }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{r.name}</span>
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>{r.users} {r.users === 1 ? "пользователь" : "пользователей"}</div>
              </button>
            ))}
          </div>

          {/* Permission matrix */}
          {selectedRole && (
            <div className="min-w-0 flex-1 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              <div className="p-4 flex flex-wrap items-center gap-3" style={{ background: "var(--color-panel)", borderBottom: "1px solid var(--color-border)" }}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: selectedRole.color }} />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{selectedRole.name}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{selectedRole.desc}</div>
                </div>
                <Btn variant="ghost" small>Изменить</Btn>
              </div>

              <div className="overflow-x-auto">
<table className="w-full min-w-[34rem]">
                <thead>
                  <tr style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
                    <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>МОДУЛЬ</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ДОСТУП</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium w-24" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>УРОВЕНЬ</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod, i) => {
                    const perm = selectedRole.permissions[mod];
                    return (
                      <tr key={mod} style={{ borderBottom: i < MODULES.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                        <td className="px-4 py-2.5 text-sm" style={{ color: "var(--color-text)" }}>{mod}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className="inline-block rounded px-2.5 py-0.5 text-xs font-medium"
                            style={{ background: PERM_COLORS[perm] + "22", color: PERM_COLORS[perm], fontFamily: "var(--font-mono)" }}
                          >
                            {PERM_LABELS[perm]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {(["full", "read", "none"] as const).map(level => (
                              <div key={level} className="w-2 h-2 rounded-full cursor-pointer" style={{ background: perm === level ? PERM_COLORS[level] : "var(--color-dim)" }} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
</div>
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="flex flex-col gap-3">
          {adminUsers.map(u => (
            <div key={u.id} className="rounded-xl p-4 flex flex-wrap items-center gap-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", opacity: u.status === "suspended" ? 0.6 : 1 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: roleColor(u.role) + "33", color: roleColor(u.role) }}
              >
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{u.name}</span>
                  <span className="text-xs rounded px-2 py-0.5" style={{ background: roleColor(u.role) + "22", color: roleColor(u.role), fontFamily: "var(--font-mono)" }}>{u.role}</span>
                  {u.twofa && <span className="text-xs rounded px-2 py-0.5" style={{ background: "rgba(42,141,122,0.15)", color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>2FA ✓</span>}
                  {!u.twofa && <span className="text-xs rounded px-2 py-0.5" style={{ background: "rgba(196,90,66,0.1)", color: "var(--color-rose)", fontFamily: "var(--font-mono)" }}>Без 2FA</span>}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>{u.email} · {u.lastActive}</div>
              </div>
              <Badge label={u.status} color={u.status === "active" ? "teal" : "rose"} />
              <div className="flex flex-wrap gap-2 shrink-0">
                <Btn variant="ghost" small>Изменить</Btn>
                <Btn variant={u.status === "active" ? "danger" : "ghost"} small onClick={() => toggleSuspend(u.id)}>
                  {u.status === "active" ? "Заблокировать" : "Восстановить"}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowInvite(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Пригласить администратора</h3>
              <button onClick={() => setShowInvite(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {([["name","Имя"],["email","Email"]] as [string,string][]).map(([k,label]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={k === "email" ? "email" : "text"} value={(inviteForm as any)[k]} onChange={e => setInviteForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>РОЛЬ</label>
                <div className="flex flex-col gap-1.5">
                  {ROLES.map(r => (
                    <button key={r.name} onClick={() => setInviteForm(p => ({ ...p, role: r.name }))}
                      className="rounded-lg px-3 py-2.5 text-left cursor-pointer transition-all"
                      style={{ background: inviteForm.role === r.name ? r.color + "22" : "var(--color-surface)", border: `1px solid ${inviteForm.role === r.name ? r.color : "var(--color-border)"}` }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                        <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{r.name}</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="ghost" onClick={() => setShowInvite(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!inviteForm.name || !inviteForm.email) return;
                const initials = inviteForm.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
                setAdminUsers(prev => [...prev, {
                  id: prev.length + 1, name: inviteForm.name, email: inviteForm.email,
                  role: inviteForm.role, lastActive: "Никогда", status: "active" as const,
                  avatar: initials, twofa: false,
                }]);
                setShowInvite(false);
                setInviteForm({ name: "", email: "", role: "Агент поддержки" });
                setTab("users");
              }}>Отправить приглашение</Btn>
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <div className="overflow-x-auto">
<table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr style={{ background: "var(--color-panel)", borderBottom: "1px solid var(--color-border)" }}>
                {["ВРЕМЯ", "АДМИНИСТРАТОР", "ДЕЙСТВИЕ", "ОБЪЕКТ", "IP"].map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { time: "09:42", admin: "Рустам М.", action: "Обновил цены тура", target: "Silk Road Heritage", ip: "91.185.xx.xx" },
                { time: "09:38", admin: "Камола Т.", action: "Опубликовала страницу города", target: "Наманган", ip: "37.110.xx.xx" },
                { time: "08:55", admin: "Нилуфар Р.", action: "Закрыла обращение", target: "Тикет #4821", ip: "195.158.xx.xx" },
                { time: "08:12", admin: "Рустам М.", action: "Отозвал API-ключ", target: "Старая CMS", ip: "91.185.xx.xx" },
                { time: "Вчера", admin: "Зулфия Э.", action: "Экспортировала финансовый отчёт", target: "Август 2026", ip: "46.8.xx.xx" },
                { time: "Вчера", admin: "Камола Т.", action: "Удалила событие", target: "Fergana Spring Fest", ip: "37.110.xx.xx" },
                { time: "2 д назад", admin: "Дилшод К.", action: "Ошибка входа (3 попытки)", target: "—", ip: "176.221.xx.xx" },
                { time: "2 д назад", admin: "Рустам М.", action: "Заблокировал аккаунт", target: "Дилшод К.", ip: "91.185.xx.xx" },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-panel)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-2.5" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{row.time}</td>
                  <td className="px-4 py-2.5" style={{ color: "var(--color-amber)", fontSize: "13px" }}>{row.admin}</td>
                  <td className="px-4 py-2.5" style={{ color: "var(--color-text)", fontSize: "13px" }}>{row.action}</td>
                  <td className="px-4 py-2.5" style={{ color: "var(--color-muted)", fontSize: "13px" }}>{row.target}</td>
                  <td className="px-4 py-2.5" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{row.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      )}
    </div>
  );
}
