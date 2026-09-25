import { мягко } from "@/lib/theme";
import { useState, useEffect, useRef } from "react";
import { useУведомления, type Notif } from "../context/NotifContext";
import { useМеня } from "../context/MeContext";
import { useContent } from "../context/ContentContext";
import { ROLE_META } from "@/lib/admin-roles";
import { logout } from "@/app/admin/actions";

const ICON: Record<Notif["id"], string> = { sos: "🆘", booking: "◫", chat: "◈" };
const ICON_COLOR: Record<Notif["id"], string> = {
  sos: "var(--color-rose)",
  booking: "var(--color-teal)",
  chat: "var(--color-amber)",
};

/** Раздел для поиска: те же пункты, что в меню, — с учётом роли. */
export interface Раздел {
  id: string;
  label: string;
  group: string;
}

type Props = {
  active: string;
  /** Разделы, доступные вошедшему. Поиск не ведёт никуда за их пределы. */
  разделы: Раздел[];
  onNavigate: (id: string) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ active, разделы, onNavigate, sidebarCollapsed, onToggleSidebar }: Props) {
  const меня = useМеня();
  const { saveState } = useContent();
  const { notifs, markRead, markAllRead, unreadCount } = useУведомления();
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
    ? разделы.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : разделы;

  const grouped = filtered.reduce<Record<string, Раздел[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const activePage = разделы.find(s => s.id === active);

  return (
    <>
      <header
        className="flex flex-wrap items-center gap-3 px-4 shrink-0"
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
          title="Свернуть боковое меню"
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
        <div className="flex flex-wrap items-center gap-1.5 text-sm min-w-0">
          <span className="hidden md:inline" style={{ color: "var(--color-faint)" }}>HelloUZ Админ</span>
          <span style={{ color: "var(--color-faint)" }}>›</span>
          <span className="font-medium truncate" style={{ color: "var(--color-text)" }}>
            {activePage?.label ?? active}
          </span>
          {/* Правки содержимого сохраняются сами — здесь видно, дошли ли. */}
          {saveState !== "idle" && (
            <span
              className="text-xs"
              style={{
                color: saveState === "error" ? "var(--color-rose)" : "var(--color-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {saveState === "saving" ? "· сохраняем…" : saveState === "saved" ? "· сохранено ✓" : "· не сохранено — проверьте связь"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1" />

        {/* Search trigger */}
        <button
          onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }}
          className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
            fontFamily: "var(--font-body)",
            minWidth: "180px",
          }}
        >
          <span style={{ fontSize: "12px" }}>⌕</span>
          <span className="min-w-0 flex-1 text-left text-xs">Поиск…</span>
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
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
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

              <div className="overflow-y-auto min-w-0 flex-1">
                {notifs.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
                    Новых событий нет
                  </div>
                )}
                {notifs.map(n => (
                  <div
                    key={n.id}
                    className="flex flex-wrap gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: n.read ? "transparent" : "color-mix(in srgb, var(--color-amber) 5%, transparent)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface)")}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "color-mix(in srgb, var(--color-amber) 5%, transparent)")}
                    onClick={() => {
                      markRead(n.id);
                      onNavigate(n.action);
                      setShowNotifs(false);
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                      style={{ background: мягко(ICON_COLOR[n.id], 12), color: ICON_COLOR[n.id] }}
                    >
                      {ICON[n.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-tight" style={{ color: n.read ? "var(--color-muted)" : "var(--color-text)" }}>
                          {n.title}
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "var(--color-amber)" }} />}
                      </div>
                      <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-muted)" }}>{n.body}</div>
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
          className="flex flex-wrap items-center gap-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: меня ? ROLE_META[меня.role].color : "var(--color-amber)", color: "var(--color-on-accent)" }}
            title={меня?.name}
          >
            {(меня?.name ?? "AD").slice(0, 2).toUpperCase()}
          </div>
        </button>

        {/* Выход. Форма, а не onClick: logout — серверное действие, и
            через action оно отрабатывает без ручного вызова с клиента. */}
        <form action={logout}>
          <button
            type="submit"
            title="Выйти из панели"
            className="w-8 h-8 rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            style={{ background: "transparent", color: "var(--color-muted)", fontSize: "15px" }}
          >
            ⎋
          </button>
        </form>
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
            <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ color: "var(--color-muted)", fontSize: "16px" }}>⌕</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Поиск страниц, пользователей, туров…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="min-w-0 flex-1 outline-none bg-transparent text-sm"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
              />
              <kbd className="text-xs px-2 py-1 rounded" style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ESC</kbd>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-4 py-2 text-xs tracking-widest uppercase" style={{ color: "var(--color-faint)", fontFamily: "var(--font-mono)" }}>
                    {group}
                  </div>
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setShowSearch(false); setQuery(""); }}
                      className="w-full flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm text-left cursor-pointer transition-colors hover:opacity-80"
                      style={{
                        background: active === item.id ? "color-mix(in srgb, var(--color-amber) 10%, transparent)" : "transparent",
                        color: active === item.id ? "var(--color-amber)" : "var(--color-text)",
                        fontFamily: "var(--font-body)",
                        borderLeft: active === item.id ? "2px solid var(--color-amber)" : "2px solid transparent",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface)")}
                      onMouseLeave={e => (e.currentTarget.style.background = active === item.id ? "color-mix(in srgb, var(--color-amber) 10%, transparent)" : "transparent")}
                    >
                      <span style={{ color: "var(--color-faint)", fontSize: "12px" }}>→</span>
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
