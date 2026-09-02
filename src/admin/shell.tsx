"use client";

import React, { useState } from "react";
import { useTheme } from "./context/ThemeContext";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Destinations from "./components/Destinations";
import Tours from "./components/Tours";
import Hotels from "./components/Hotels";
import Bookings from "./components/Bookings";
import Users from "./components/Users";
import Reviews from "./components/Reviews";
import Chat from "./components/Chat";
import UserTracking from "./components/UserTracking";
import AdsManager from "./components/AdsManager";
import Restaurants from "./components/Restaurants";
import Events from "./components/Events";
import Cities from "./components/Cities";
import Transport from "./components/Transport";
import ThemeEditor from "./components/ThemeEditor";
import AppPreview from "./components/AppPreview";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";
import Guides from "./components/Guides";
import PromoCodes from "./components/PromoCodes";
import Finance from "./components/Finance";
import TourCalendar from "./components/TourCalendar";
import NotifCenter from "./components/NotifCenter";
import PushCampaigns from "./components/PushCampaigns";
import Integrations from "./components/Integrations";
import AccessControl from "./components/AccessControl";
import Staff from "./components/Staff";
import { INITIAL_MESSAGES } from "./data/mockData";

const NAV_GROUPS = [
  {
    label: "Операции",
    items: [
      { id: "dashboard", label: "Дашборд", icon: "⬡" },
      { id: "bookings", label: "Бронирования", icon: "◫" },
      { id: "chat", label: "Чат поддержки", icon: "◈", badge: true },
      { id: "calendar", label: "Календарь туров", icon: "◉" },
      { id: "analytics", label: "Аналитика", icon: "◎" },
    ],
  },
  {
    label: "Контент",
    items: [
      { id: "destinations", label: "Направления", icon: "◉" },
      { id: "tours", label: "Туры", icon: "◎" },
      { id: "guides", label: "Гиды", icon: "◈" },
      { id: "hotels", label: "Отели", icon: "▣" },
      { id: "restaurants", label: "Рестораны", icon: "◇" },
      { id: "events", label: "События", icon: "◈" },
      { id: "cities", label: "Города", icon: "⬡" },
    ],
  },
  {
    label: "Пользователи",
    items: [
      { id: "users", label: "Пользователи", icon: "◎" },
      { id: "tracking", label: "Карта геолокации", icon: "◈" },
      { id: "reviews", label: "Отзывы", icon: "◇" },
    ],
  },
  {
    label: "Монетизация",
    items: [
      { id: "ads", label: "Реклама", icon: "◈" },
      { id: "promos", label: "Промокоды", icon: "◇" },
      { id: "finance", label: "Финансы", icon: "▣" },
      { id: "push", label: "Push-кампании", icon: "◉" },
    ],
  },
  {
    label: "Транспорт",
    items: [
      { id: "transport", label: "Транспорт", icon: "◉" },
    ],
  },
  {
    label: "Инструменты",
    items: [
      { id: "preview", label: "Превью приложения", icon: "◎" },
      { id: "theme", label: "Визуальный редактор", icon: "◈" },
    ],
  },
  {
    label: "Система",
    items: [
      { id: "notifs", label: "Уведомления", icon: "◈" },
      { id: "integrations", label: "Интеграции", icon: "⬡" },
      { id: "access", label: "Управление доступом", icon: "◉" },
      { id: "staff", label: "Сотрудники", icon: "◎" },
    ],
  },
  {
    label: "Аккаунт",
    items: [
      { id: "settings", label: "Настройки", icon: "▣" },
    ],
  },
];

export default function AdminShell() {
  const [active, setActive] = useState("dashboard");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, toggleMode } = useTheme();

  const unreadCount = Object.values(messages).reduce(
    (s, msgs) => s + msgs.filter((m) => m.from === "user" && !m.read).length,
    0
  );

  const pages: Record<string, React.ReactElement> = {
    dashboard: <Dashboard onNavigate={setActive} />,
    destinations: <Destinations />,
    tours: <Tours />,
    hotels: <Hotels />,
    bookings: <Bookings />,
    users: <Users />,
    reviews: <Reviews />,
    chat: <Chat messages={messages} setMessages={setMessages} />,
    tracking: <UserTracking />,
    ads: <AdsManager />,
    restaurants: <Restaurants />,
    events: <Events />,
    cities: <Cities />,
    transport: <Transport />,
    theme: <ThemeEditor />,
    preview: <AppPreview />,
    settings: <Settings onNavigate={setActive} />,
    analytics: <Analytics />,
    guides: <Guides />,
    promos: <PromoCodes />,
    finance: <Finance />,
    calendar: <TourCalendar />,
    notifs: <NotifCenter onNavigate={setActive} />,
    push: <PushCampaigns />,
    integrations: <Integrations />,
    access: <AccessControl />,
    staff: <Staff />,
  };

  const sidebarWidth = sidebarCollapsed ? "56px" : "224px";

  return (
    <div className="flex h-full" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full shrink-0 overflow-hidden transition-all duration-200"
        style={{
          width: sidebarWidth,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-3 shrink-0 overflow-hidden"
          style={{
            height: "var(--header-height, 52px)",
            borderBottom: "1px solid var(--color-border)",
            gap: sidebarCollapsed ? "0" : "10px",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            paddingLeft: sidebarCollapsed ? "0" : "12px",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--color-amber)", color: "#0d0c0a" }}
          >
            UZ
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-semibold leading-none whitespace-nowrap" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                Узбекистан
              </div>
              <div className="text-xs mt-0.5 whitespace-nowrap" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                Админ-панель
              </div>
            </div>
          )}
          {!sidebarCollapsed && (
            <button onClick={toggleMode} title={isDark ? "Светлая тема" : "Тёмная тема"}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 cursor-pointer transition-all hover:opacity-80"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}
            >{isDark ? "☀" : "☾"}</button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              {!sidebarCollapsed && (
                <div
                  className="px-2 mb-1 text-xs tracking-widest uppercase font-medium"
                  style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className="flex items-center w-full text-left text-sm transition-all duration-150 rounded cursor-pointer relative"
                  style={{
                    gap: sidebarCollapsed ? "0" : "8px",
                    padding: sidebarCollapsed ? "8px 0" : "7px 10px",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    background: active === item.id ? "var(--color-panel)" : "transparent",
                    color: active === item.id ? "var(--color-amber)" : "var(--color-muted)",
                    borderLeft: active === item.id ? "2px solid var(--color-amber)" : "2px solid transparent",
                    fontFamily: "var(--font-body)",
                    marginBottom: "1px",
                  }}
                >
                  <span className="text-sm w-4 text-center shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap overflow-hidden">{item.label}</span>
                      {item.badge && unreadCount > 0 && (
                        <span
                          className="text-xs rounded-full px-1.5 py-0.5 font-bold shrink-0"
                          style={{ background: "var(--color-rose)", color: "#fff", fontSize: "10px" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && item.badge && unreadCount > 0 && (
                    <div
                      className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
                      style={{ background: "var(--color-rose)" }}
                    />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom profile */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <button
              onClick={() => setActive("settings")}
              className="flex items-center gap-2.5 w-full cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: "var(--color-amber)", color: "#0d0c0a" }}
              >
                AD
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "var(--color-text)" }}>Администратор</div>
                <div className="text-xs truncate" style={{ color: "var(--color-muted)" }}>admin@uztravel.uz</div>
              </div>
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex justify-center py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "var(--color-amber)", color: "#0d0c0a" }}>
              AD
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header
          active={active}
          onNavigate={setActive}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(p => !p)}
        />
        <main className="flex-1 overflow-y-auto">
          {pages[active] ?? (
            <div className="p-7 text-sm" style={{ color: "var(--color-muted)" }}>Страница не найдена</div>
          )}
        </main>
      </div>
    </div>
  );
}
