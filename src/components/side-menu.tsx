import type { PublicUser, Tab } from "@/lib/types";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { ACCENT_FILL, GOLD, GREEN, SURFACE, CREAM, TEXT, MUTED, BORDER, ACCENT_BORDER } from "@/lib/theme";
import { LogoMark, Wordmark } from "./ui";

export function SideMenu({
  onClose,
  onTab,
  currentTab,
  isPremium,
  onPremium,
  onLogout,
  onFavorites,
  onTrip,
  onProfileStats,
  user,
}: {
  onClose: () => void;
  onTab: (t: Tab) => void;
  currentTab: Tab;
  isPremium: boolean;
  onPremium: () => void;
  onLogout: () => void;
  onFavorites: () => void;
  onTrip: () => void;
  onProfileStats: () => void;
  user: PublicUser | null;
}) {
  const { t } = useT();
  const NAV: [Tab, string, TKey][] = [
    ["home", "🏠", "nav_home"],
    ["explore", "🔍", "nav_explore"],
    ["map", "🗺️", "nav_map"],
    ["audio", "🎧", "nav_audio"],
    ["profile", "👤", "nav_profile"],
  ];
  // Третье поле — вкладка, куда ведёт пункт. Избранное и маршрут поездки
  // открываются своими экранами, валюта и экстренная помощь живут в
  // статистике профиля — их разбирает обработчик ниже.
  const EXTRAS: [string, TKey, Tab | null][] = [
    ["❤️", "menu_favorites", null],
    ["📋", "trip_title", null],
    ["⬇️", "menu_downloads", "audio"],
    ["💱", "cur_title", "profile"],
    ["🆘", "menu_emergency", "profile"],
  ];
  const имя = user ? `${user.firstName} ${user.lastName}`.trim() : "—";
  const откуда = user?.country || "";
  return (
    <>
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      <div
        className="absolute top-0 left-0 bottom-0 z-50 flex flex-col slide-in-left"
        style={{ width: 290, background: SURFACE }}
      >
        <div className="px-5 pt-14 pb-5 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <LogoMark size={36} />
              <div>
                <p className="leading-none">
                  <Wordmark size={19} />
                </p>
                <p className="text-[10px] mt-1" style={{ color: "var(--gold-ink)" }}>
                  {t("splash_tagline")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: CREAM }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: CREAM }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg,var(--accent-light),var(--accent-deep))" }}
            >
              👤
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm truncate" style={{ color: TEXT }}>
                {имя}
              </p>
              {откуда && (
                <p className="text-[10px] truncate" style={{ color: MUTED }}>
                  {откуда}
                </p>
              )}
            </div>
            {isPremium && <span className="text-sm">👑</span>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto hide-scroll py-3">
          <p className="px-5 text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: MUTED }}>
            {t("menu_nav")}
          </p>
          {NAV.map(([таб, e, k]) => (
            <button
              key={таб}
              onClick={() => {
                onTab(таб);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all"
              style={
                currentTab === таб
                  ? { background: `${ACCENT_BORDER}`, borderRight: `3px solid ${GREEN}` }
                  : { borderRight: "3px solid transparent" }
              }
            >
              <span className="text-lg w-6">{e}</span>
              <span className="font-semibold text-sm" style={{ color: currentTab === таб ? GREEN : TEXT }}>
                {t(k)}
              </span>
              {currentTab === таб && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: ACCENT_FILL }} />
              )}
            </button>
          ))}
          <div className="mx-5 my-3 border-t" style={{ borderColor: BORDER }} />
          <p className="px-5 text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: MUTED }}>
            {t("menu_more")}
          </p>
          {EXTRAS.map(([e, k, target]) => (
            <button
              key={k}
              onClick={() => {
                onClose();
                if (k === "menu_favorites") {
                  onFavorites();
                } else if (k === "trip_title") {
                  onTrip();
                } else if (k === "cur_title" || k === "menu_emergency") {
                  onProfileStats();
                } else if (target) {
                  onTab(target);
                }
              }}
              className="w-full flex items-center gap-3 px-5 py-3 text-left active:opacity-70"
            >
              <span className="text-lg w-6">{e}</span>
              <span className="flex-1 font-medium text-sm" style={{ color: TEXT }}>
                {t(k)}
              </span>
              <svg
                className="rtl-flip"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke={MUTED}
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
          <div className="mx-5 my-3 border-t" style={{ borderColor: BORDER }} />
          {!isPremium && (
            <button
              onClick={() => {
                onPremium();
                onClose();
              }}
              className="mx-4 w-[calc(100%-32px)] rounded-2xl p-4 flex items-center gap-3 glow-pulse"
              style={{ background: "linear-gradient(135deg,#0a1f20,#0e3b38)" }}
            >
              <span className="text-2xl">👑</span>
              <div className="text-left flex-1">
                <p className="font-bold text-sm" style={{ color: GOLD }}>
                  HelloUZ Premium
                </p>
                <p className="text-[9px]" style={{ color: MUTED }}>
                  {t("pay_no_ads")} · 39 000 {t("cur_uzs_word")}
                  {t("prem_per_month")}
                </p>
              </div>
              <svg
                className="rtl-flip"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GOLD}
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
        <div className="device-safe-bottom px-5 pt-3 pb-4 border-t" style={{ borderColor: BORDER }}>
          {/* Знак национального туристического бренда. На светлой плашке
              в обеих темах: тёмно-синие буквы знака на тёмном фоне не
              читались бы, а перекрашивать чужой знак нельзя. */}
          {/* Знак национального бренда — компактно: подвал и так делит
              высоту с навигацией, а в полный рост он её съедал. */}
          <div className="mb-2.5 flex items-center gap-2.5">
            <img
              src="/uzbekistan-brand.png"
              alt="Uzbekistan"
              className="brand-mark-auto flex-shrink-0"
              style={{ height: 18, width: "auto", opacity: 0.75 }}
            />
            <p className="text-[8px] leading-tight" style={{ color: MUTED }}>
              {t("brand_uz")}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px]" style={{ color: MUTED }}>
              HelloUZ v2.4.1 · 🇺🇿 {t("menu_made")}
            </p>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="text-[10px] font-semibold"
              style={{ color: MUTED }}
            >
              🚪 {t("prof_logout")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Главная

export default SideMenu;
