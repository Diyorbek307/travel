import { useState, useEffect, useRef } from "react";
import { useNotifs } from "../context/NotifContext";

const ICON: Record<string, string> = {
  booking: "◫", review: "◇", chat: "◈", transport: "◉", system: "⬡", payment: "▣",
};
const ICON_COLOR: Record<string, string> = {
  booking: "var(--color-teal)", review: "var(--color-amber)", chat: "var(--color-amber)",
  transport: "var(--color-rose)", system: "var(--color-muted)", payment: "var(--color-teal)",
};

const ALL_SEARCH = [
  { label: "Дашборд", id: "dashboard", group: "Операции" },
  { label: "Бронирования", id: "bookings", group: "Операции" },
  { label: "Чат поддержки", id: "chat", group: "Операции" },
  { label: "Календарь туров", id: "calendar", group: "Операции" },
  { label: "Аналитика", id: "analytics", group: "Операции" },
  { label: "Направления", id: "destinations", group: "Контент" },
  { label: "Туры", id: "tours", group: "Контент" },
  { label: "Гиды", id: "guides", group: "Контент" },
  { label: "Отели", id: "hotels", group: "Контент" },
  { label: "Рестораны", id: "restaurants", group: "Контент" },
  { label: "События", id: "events", group: "Контент" },
  { label: "Города", id: "cities", group: "Контент" },
  { label: "Пользователи", id: "users", group: "Пользователи" },
  { label: "Карта геолокации", id: "tracking", group: "Пользователи" },
  { label: "Отзывы", id: "reviews", group: "Пользователи" },
  { label: "Реклама", id: "ads", group: "Монетизация" },
  { label: "Промокоды", id: "promos", group: "Монетизация" },
  { label: "Финансы", id: "finance", group: "Монетизация" },
  { label: "Push-кампании", id: "push", group: "Монетизация" },
  { label: "Транспорт", id: "transport", group: "Транспорт" },
  { label: "Сотрудники", id: "staff", group: "Система" },
  { label: "Уведомления", id: "notifs", group: "Система" },
  { label: "Интеграции", id: "integrations", group: "Система" },
  { label: "Управление доступом", id: "access", group: "Система" },
  { label: "Превью приложения", id: "preview", group: "Инструменты" },
  { label: "Визуальный редактор", id: "theme", group: "Инструменты" },
  { label: "Настройки", id: "settings", group: "Аккаунт" },
];

type Props = {
  active: string;
  onNavigate: (id: string) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ active, onNavigate, sidebarCollapsed, onToggleSidebar }: Props) {
  const { notifs, markRead, markAllRead, unreadCount } = useNotifs();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifs(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? ALL_SEARCH.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : ALL_SEARCH;

  const grouped = filtered.reduce<Record<string, typeof ALL_SEARCH>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const activePage = ALL_SEARCH.find(s => s.id === active);

  return (
    <>
      <header
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: "var(--header-height, 52px)",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 flex flex-col items-center justify-center gap-1 rounded cursor-pointer hover:opacity-70 transition-opacity shrink-0"
          title="Toggle sidebar"
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                height: "1.5px",
                background: "var(--color-muted)",
                width: i === 1 && sidebarCollapsed ? "10px" : "14px",
              }}
            />
          ))}
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="hidden md:inline" style={{ color: "var(--color-dim)" }}>Узбекистан Админ</span>
          <span style={{ color: "var(--color-dim)" }}>›</span>
          <span className="font-medium truncate" style={{ color: "var(--color-text)" }}>
            {activePage?.label ?? active}
          </span>
        </div>

        <div className="flex-1" />

        {/* Search trigger */}
        <button
          onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
            fontFamily: "var(--font-body)",
            minWidth: "180px",
          }}
        >
          <span style={{ fontSize: "12px" }}>⌕</span>
          <span className="flex-1 text-left text-xs">Поиск…</span>
          <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "9px" }}>
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-8 h-8 rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative"
            style={{ background: showNotifs ? "var(--color-panel)" : "transparent", border: "1px solid transparent" }}
          >
            <span style={{ color: "var(--color-muted)", fontSize: "14px" }}>◈</span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-xs font-bold px-1"
                style={{ background: "var(--color-rose)", color: "#fff", fontSize: "9px" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-10 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{
                width: "360px",
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                maxHeight: "480px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <div className="font-medium text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
                  Уведомления
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-rose)", color: "#fff" }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button onClick={markAllRead} className="text-xs cursor-pointer hover:opacity-70" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>
                  Прочитать все
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {notifs.map(n => (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: n.read ? "transparent" : "rgba(212,135,42,0.04)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface)")}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(212,135,42,0.04)")}
                    onClick={() => {
                      markRead(n.id);
                      if (n.action) { onNavigate(n.action); setShowNotifs(false); }
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                      style={{ background: ICON_COLOR[n.type] + "20", color: ICON_COLOR[n.type] }}
                    >
                      {ICON[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-tight" style={{ color: n.read ? "var(--color-muted)" : "var(--color-text)" }}>
                          {n.title}
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "var(--color-amber)" }} />}
                      </div>
                      <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-muted)" }}>{n.body}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <button
          onClick={() => onNavigate("settings")}
          className="flex items-center gap-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--color-amber)", color: "#0d0c0a" }}
          >
            AD
          </div>
        </button>
      </header>

      {/* Command palette overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => { setShowSearch(false); setQuery(""); }}
        >
          <div
            className="rounded-xl overflow-hidden w-full max-w-lg shadow-2xl"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ color: "var(--color-muted)", fontSize: "16px" }}>⌕</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Поиск страниц, пользователей, туров…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none bg-transparent text-sm"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
              />
              <kbd className="text-xs px-2 py-1 rounded" style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ESC</kbd>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-4 py-2 text-xs tracking-widest uppercase" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>
                    {group}
                  </div>
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setShowSearch(false); setQuery(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left cursor-pointer transition-colors hover:opacity-80"
                      style={{
                        background: active === item.id ? "rgba(212,135,42,0.1)" : "transparent",
                        color: active === item.id ? "var(--color-amber)" : "var(--color-text)",
                        fontFamily: "var(--font-body)",
                        borderLeft: active === item.id ? "2px solid var(--color-amber)" : "2px solid transparent",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface)")}
                      onMouseLeave={e => (e.currentTarget.style.background = active === item.id ? "rgba(212,135,42,0.1)" : "transparent")}
                    >
                      <span style={{ color: "var(--color-dim)", fontSize: "12px" }}>→</span>
                      {item.label}
                      {active === item.id && <span className="ml-auto text-xs" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>текущая</span>}
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
                  Ничего не найдено по запросу "{query}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
