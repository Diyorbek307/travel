import { useState } from "react";
import { PageHeader, Badge, Btn, SectionTitle } from "./shared";

type Permission =
  | "dashboard" | "bookings" | "calendar" | "analytics"
  | "destinations" | "tours" | "guides" | "hotels" | "restaurants" | "events" | "cities"
  | "users" | "tracking" | "reviews" | "chat"
  | "ads" | "promos" | "finance" | "push"
  | "transport" | "preview" | "theme"
  | "notifs" | "integrations" | "access" | "staff" | "settings";

const ALL_PERMS: { id: Permission; label: string; group: string }[] = [
  { id: "dashboard", label: "Дашборд", group: "Операции" },
  { id: "bookings", label: "Бронирования", group: "Операции" },
  { id: "calendar", label: "Календарь туров", group: "Операции" },
  { id: "analytics", label: "Аналитика", group: "Операции" },
  { id: "chat", label: "Чат поддержки", group: "Операции" },
  { id: "destinations", label: "Направления", group: "Контент" },
  { id: "tours", label: "Туры", group: "Контент" },
  { id: "guides", label: "Гиды", group: "Контент" },
  { id: "hotels", label: "Отели", group: "Контент" },
  { id: "restaurants", label: "Рестораны", group: "Контент" },
  { id: "events", label: "События", group: "Контент" },
  { id: "cities", label: "Города", group: "Контент" },
  { id: "users", label: "Пользователи", group: "Пользователи" },
  { id: "tracking", label: "Карта геолокации", group: "Пользователи" },
  { id: "reviews", label: "Отзывы", group: "Пользователи" },
  { id: "ads", label: "Реклама", group: "Монетизация" },
  { id: "promos", label: "Промокоды", group: "Монетизация" },
  { id: "finance", label: "Финансы", group: "Монетизация" },
  { id: "push", label: "Push-кампании", group: "Монетизация" },
  { id: "transport", label: "Транспорт", group: "Транспорт" },
  { id: "notifs", label: "Уведомления", group: "Система" },
  { id: "integrations", label: "Интеграции", group: "Система" },
  { id: "access", label: "Управление доступом", group: "Система" },
  { id: "staff", label: "Сотрудники", group: "Система" },
  { id: "settings", label: "Настройки", group: "Аккаунт" },
];

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  permissions: Permission[];
  status: "active" | "pending" | "suspended";
  invitedAt: string;
  lastActive: string;
  avatar: string;
};

const STAFF_SEED: StaffMember[] = [
  {
    id: 1, name: "Камола Ташкентова", email: "kamola@uztravel.uz", phone: "+998 90 123-45-67",
    position: "Менеджер контента", department: "Контент",
    permissions: ["dashboard", "destinations", "tours", "guides", "hotels", "restaurants", "events", "cities", "reviews"],
    status: "active", invitedAt: "15 янв 2026", lastActive: "2 часа назад", avatar: "КТ",
  },
  {
    id: 2, name: "Сардор Исмоилов", email: "sardor@uztravel.uz", phone: "+998 91 234-56-78",
    position: "Контент-редактор", department: "Контент",
    permissions: ["dashboard", "destinations", "tours", "hotels", "events", "cities"],
    status: "active", invitedAt: "20 фев 2026", lastActive: "1 день назад", avatar: "СИ",
  },
  {
    id: 3, name: "Нилуфар Рахимова", email: "nilufar@uztravel.uz", phone: "+998 93 345-67-89",
    position: "Агент поддержки", department: "Поддержка",
    permissions: ["dashboard", "bookings", "chat", "users", "reviews"],
    status: "active", invitedAt: "1 мар 2026", lastActive: "30 мин назад", avatar: "НР",
  },
  {
    id: 4, name: "Бобур Юсупов", email: "bobur@uztravel.uz", phone: "+998 97 456-78-90",
    position: "Агент поддержки", department: "Поддержка",
    permissions: ["dashboard", "bookings", "chat", "users"],
    status: "active", invitedAt: "1 мар 2026", lastActive: "3 часа назад", avatar: "БЮ",
  },
  {
    id: 5, name: "Зулфия Эргашева", email: "zulfiya@uztravel.uz", phone: "+998 94 567-89-01",
    position: "Финансовый аналитик", department: "Финансы",
    permissions: ["dashboard", "finance", "analytics", "bookings", "ads", "promos"],
    status: "active", invitedAt: "10 апр 2026", lastActive: "1 час назад", avatar: "ЗЭ",
  },
  {
    id: 6, name: "Дилшод Каримов", email: "dilshod@uztravel.uz", phone: "+998 98 678-90-12",
    position: "Менеджер по рекламе", department: "Маркетинг",
    permissions: ["dashboard", "ads", "promos", "push", "analytics"],
    status: "suspended", invitedAt: "5 мая 2026", lastActive: "5 дней назад", avatar: "ДК",
  },
  {
    id: 7, name: "Шахло Мирзаева", email: "shahlo@uztravel.uz", phone: "+998 99 789-01-23",
    position: "Менеджер туров", department: "Туры",
    permissions: ["dashboard", "tours", "guides", "calendar", "bookings", "transport"],
    status: "pending", invitedAt: "2 сен 2026", lastActive: "—", avatar: "ШМ",
  },
];

const DEPT_COLORS: Record<string, string> = {
  "Контент": "var(--color-teal)",
  "Поддержка": "#7a8fff",
  "Финансы": "var(--color-amber)",
  "Маркетинг": "#c47ae8",
  "Туры": "var(--color-rose)",
  "Система": "var(--color-muted)",
};

const permGroups = Array.from(new Set(ALL_PERMS.map(p => p.group)));

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_SEED);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [editPerms, setEditPerms] = useState<Permission[]>([]);
  const [editing, setEditing] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [filter, setFilter] = useState("все");

  const [invite, setInvite] = useState({
    name: "", email: "", phone: "", position: "", department: "Контент",
    permissions: [] as Permission[],
  });

  const filtered = filter === "все" ? staff : filter === "активные" ? staff.filter(s => s.status === "active")
    : filter === "ожидание" ? staff.filter(s => s.status === "pending")
    : staff.filter(s => s.status === "suspended");

  const openEdit = (member: StaffMember) => {
    setSelected(member);
    setEditPerms([...member.permissions]);
    setEditing(false);
  };

  const togglePerm = (perm: Permission, list: Permission[], setList: (p: Permission[]) => void) => {
    setList(list.includes(perm) ? list.filter(p => p !== perm) : [...list, perm]);
  };

  const savePerms = () => {
    if (!selected) return;
    setStaff(prev => prev.map(s => s.id === selected.id ? { ...s, permissions: editPerms } : s));
    setSelected(prev => prev ? { ...prev, permissions: editPerms } : null);
    setEditing(false);
  };

  const toggleSuspend = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "active" ? "suspended" : "active" } : s));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: prev.status === "active" ? "suspended" : "active" } : null);
  };

  const sendInvite = () => {
    const m: StaffMember = {
      id: Date.now(), name: invite.name || "Новый сотрудник", email: invite.email,
      phone: invite.phone, position: invite.position || "Сотрудник", department: invite.department,
      permissions: invite.permissions, status: "pending",
      invitedAt: "2 сен 2026", lastActive: "—", avatar: (invite.name || "НС").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    };
    setStaff(prev => [m, ...prev]);
    setShowInvite(false);
    setInvite({ name: "", email: "", phone: "", position: "", department: "Контент", permissions: [] });
  };

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Сотрудники"
        subtitle={`${staff.filter(s => s.status === "active").length} активных · ${staff.filter(s => s.status === "pending").length} ожидают`}
        action={<Btn onClick={() => setShowInvite(true)}>+ Пригласить сотрудника</Btn>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "ВСЕГО СОТРУДНИКОВ", val: String(staff.length), color: "var(--color-text)" },
          { label: "АКТИВНЫХ", val: String(staff.filter(s => s.status === "active").length), color: "var(--color-teal)" },
          { label: "ОЖИДАЮТ ВХОДА", val: String(staff.filter(s => s.status === "pending").length), color: "var(--color-amber)" },
          { label: "ЗАБЛОКИРОВАННЫХ", val: String(staff.filter(s => s.status === "suspended").length), color: "var(--color-rose)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-5">
        {["все", "активные", "ожидание", "заблокированные"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize"
            style={{ background: filter === f ? "var(--color-amber)" : "var(--color-panel)", color: filter === f ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
          >{f}</button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Staff list */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {filtered.map(member => (
            <div
              key={member.id}
              onClick={() => openEdit(member)}
              className="rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all"
              style={{
                background: selected?.id === member.id ? "var(--color-panel)" : "transparent",
                border: `1px solid ${selected?.id === member.id ? "var(--color-amber)" : "var(--color-border)"}`,
                opacity: member.status === "suspended" ? 0.6 : 1,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: (DEPT_COLORS[member.department] ?? "var(--color-muted)") + "33", color: DEPT_COLORS[member.department] ?? "var(--color-muted)" }}
              >
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{member.name}</span>
                  <Badge label={member.status === "active" ? "активен" : member.status === "pending" ? "ожидание" : "заблокирован"} color={member.status === "active" ? "teal" : member.status === "pending" ? "amber" : "rose"} />
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>{member.position} · {member.department}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{member.permissions.length} доступов</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-dim)" }}>{member.lastActive}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail / Permission editor */}
        {selected ? (
          <div className="w-80 shrink-0">
            <div className="rounded-2xl p-5 sticky top-0" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                  style={{ background: (DEPT_COLORS[selected.department] ?? "var(--color-muted)") + "33", color: DEPT_COLORS[selected.department] ?? "var(--color-muted)" }}
                >
                  {selected.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{selected.name}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{selected.position}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs mb-4" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                <div>📧 {selected.email}</div>
                <div>📱 {selected.phone}</div>
                <div>🏢 {selected.department}</div>
                <div>📅 Приглашён: {selected.invitedAt}</div>
                <div>🕐 Активность: {selected.lastActive}</div>
              </div>

              {/* Permissions */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <SectionTitle>Доступы</SectionTitle>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="text-xs cursor-pointer" style={{ color: "var(--color-amber)" }}>Изменить</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="text-xs cursor-pointer" style={{ color: "var(--color-muted)" }}>Отмена</button>
                    <button onClick={savePerms} className="text-xs cursor-pointer font-semibold" style={{ color: "var(--color-teal)" }}>Сохранить</button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                {permGroups.map(group => (
                  <div key={group}>
                    <div className="text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>{group}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_PERMS.filter(p => p.group === group).map(p => {
                        const active = editing ? editPerms.includes(p.id) : selected.permissions.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => editing && togglePerm(p.id, editPerms, setEditPerms)}
                            className="rounded px-2 py-0.5 text-xs transition-all"
                            style={{
                              background: active ? "var(--color-amber)" : "var(--color-surface)",
                              color: active ? "#0d0c0a" : "var(--color-muted)",
                              border: "1px solid var(--color-border)",
                              fontFamily: "var(--font-mono)",
                              cursor: editing ? "pointer" : "default",
                            }}
                          >{p.label}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                {selected.status === "pending" && <Btn small onClick={() => {
                  setStaff(prev => prev.map(s => s.id === selected.id ? { ...s, status: "active" as const } : s));
                  setSelected(prev => prev ? { ...prev, status: "active" as const } : null);
                }}>Подтвердить</Btn>}
                <Btn variant={selected.status === "active" ? "danger" : "ghost"} small onClick={() => toggleSuspend(selected.id)}>
                  {selected.status === "active" ? "Заблокировать" : "Восстановить"}
                </Btn>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-80 shrink-0 rounded-2xl flex items-center justify-center text-center p-8" style={{ border: "1px dashed var(--color-border)" }}>
            <p className="text-sm" style={{ color: "var(--color-dim)" }}>Выберите сотрудника для управления доступами</p>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowInvite(false)}>
          <div className="rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Пригласить сотрудника</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { key: "name", label: "ФИО", ph: "Камола Ташкентова" },
                { key: "email", label: "Email", ph: "kamola@uztravel.uz" },
                { key: "phone", label: "Телефон", ph: "+998 90 123-45-67" },
                { key: "position", label: "Должность", ph: "Менеджер контента" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{f.label.toUpperCase()}</label>
                  <input type="text" placeholder={f.ph} value={(invite as any)[f.key]}
                    onChange={e => setInvite(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
            </div>

            {/* Department */}
            <div className="mb-4">
              <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ОТДЕЛ</label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(DEPT_COLORS).map(d => (
                  <button key={d} onClick={() => setInvite(p => ({ ...p, department: d }))}
                    className="px-3 py-1.5 rounded text-xs cursor-pointer"
                    style={{ background: invite.department === d ? DEPT_COLORS[d] : "var(--color-surface)", color: invite.department === d ? "#fff" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-5">
              <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ДОСТУПЫ К РАЗДЕЛАМ</label>
              <div className="flex flex-col gap-3">
                {permGroups.map(group => (
                  <div key={group}>
                    <div className="text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>{group}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_PERMS.filter(p => p.group === group).map(p => {
                        const on = invite.permissions.includes(p.id);
                        return (
                          <button key={p.id}
                            onClick={() => togglePerm(p.id, invite.permissions, (perms) => setInvite(prev => ({ ...prev, permissions: perms })))}
                            className="rounded px-2 py-0.5 text-xs cursor-pointer transition-all"
                            style={{ background: on ? "var(--color-amber)" : "var(--color-surface)", color: on ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
                          >{p.label}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowInvite(false)}>Отмена</Btn>
              <Btn onClick={sendInvite}>Отправить приглашение</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
