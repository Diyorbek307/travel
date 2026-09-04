"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { useNarrow } from "./context/useNarrow";
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
import AudioGuides from "./components/AudioGuides";
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

/*
 * В меню только разделы с настоящими данными: они читают и пишут через
 * /api (учётные записи, брони, отзывы, чат, статистика) или через общий
 * контент /api/content (города, места, отели, рестораны, события, туры,
 * аудиогиды, реклама).
 *
 * Демонстрационные разделы с вымышленными людьми и цифрами — сотрудники,
 * гиды, «карта геолокации», финансы, промокоды, push-кампании, календарь
 * туров, интеграции, управление доступом, транспорт — убраны: показывать
 * выдуманные данные как настоящие нельзя. Сами компоненты остались в
 * коде (в `pages` ниже) — раздел вернётся в меню, как только за ним
 * появится реальный источник данных.
 */
const NAV_GROUPS = [
  {
    label: "Операции",
    items: [
      { id: "dashboard", label: "Дашборд", icon: "⬡" },
      { id: "bookings", label: "Бронирования", icon: "◫" },
      { id: "chat", label: "Чат поддержки", icon: "◈", badge: true },
      { id: "analytics", label: "Аналитика", icon: "◎" },
    ],
  },
  {
    label: "Контент",
    items: [
      { id: "destinations", label: "Направления", icon: "◉" },
      { id: "tours", label: "Туры", icon: "◎" },
      { id: "hotels", label: "Отели", icon: "▣" },
      { id: "restaurants", label: "Рестораны", icon: "◇" },
      { id: "events", label: "События", icon: "◈" },
      { id: "audio", label: "Аудиогиды", icon: "◉" },
      { id: "cities", label: "Города", icon: "⬡" },
    ],
  },
  {
    label: "Пользователи",
    items: [
      { id: "users", label: "Пользователи", icon: "◎" },
      { id: "reviews", label: "Отзывы", icon: "◇" },
    ],
  },
  {
    label: "Монетизация",
    items: [
      { id: "ads", label: "Реклама", icon: "◈" },
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
    label: "Аккаунт",
    items: [
      { id: "settings", label: "Настройки", icon: "▣" },
    ],
  },
];

export default function AdminShell() {
  const [active, setActive] = useState("dashboard");
  /*
   * На телефоне боковая панель шириной 224 пикселя оставляла контенту
   * 136 из 360 — работать в такой щели невозможно. Поэтому на узком
   * экране она свёрнута, а раскрытая ложится поверх содержимого, а не
   * отжимает его.
   */
  const narrow = useNarrow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 900 : false,
  );
  const overlay = narrow && !sidebarCollapsed;
  const { isDark, toggleMode } = useTheme();

  // Сколько обращений ждут ответа. Значок в меню должен быть честным,
  // поэтому число берётся с сервера, а не считается по локальному
  // состоянию, которого больше нет.
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const обновить = () =>
      fetch("/api/admin/support")
        .then((r) => (r.ok ? r.json() : { threads: [] }))
        .then((d: { threads: { unreadForStaff: number }[] }) =>
          setUnreadCount(d.threads.reduce((s, t) => s + t.unreadForStaff, 0)),
        )
        .catch(() => setUnreadCount(0));
    обновить();
    const t = setInterval(обновить, 15000);
    return () => clearInterval(t);
  }, []);

  const pages: Record<string, React.ReactElement> = {
    dashboard: <Dashboard onNavigate={setActive} />,
    destinations: <Destinations />,
    tours: <Tours />,
    hotels: <Hotels />,
    bookings: <Bookings />,
    users: <Users />,
    reviews: <Reviews />,
    chat: <Chat />,
    tracking: <UserTracking />,
    ads: <AdsManager />,
    restaurants: <Restaurants />,
    events: <Events />,
    cities: <Cities />,
    audio: <AudioGuides />,
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
      {overlay && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden
        />
      )}

      {/*
        Позицию меняет обёртка, а не сама колонка.
        Раньше колонка на узком экране переключалась со static на fixed
        одновременно с шириной — переход обрывался на полпути, и она
        застревала раскрытой шириной в 56 пикселей. Теперь у неё
        меняется только ширина, и анимации нечего срывать.
      */}
      <div
        className="shrink-0"
        style={
          overlay
            ? { position: "fixed", insetBlock: 0, left: 0, zIndex: 50 }
            : undefined
        }
      >
      <aside
        /*
          Плавного изменения ширины здесь нет намеренно. На узком экране
          вместе с шириной меняется позиционирование обёртки, у колонки
          сбрасывается содержащий блок, и переход обрывается на полпути —
          раскрытая колонка застревала шириной в 56 пикселей. Мгновенная
          и верная смена лучше плавной и сломанной.
        */
        className="flex h-full flex-col overflow-hidden"
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
                  onClick={() => {
                    setActive(item.id);
                    if (narrow) setSidebarCollapsed(true);
                  }}
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
      </div>

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
