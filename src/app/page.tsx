"use client";

import { useCallback, useEffect, useState } from "react";
import BottomNav from "@/components/bottom-nav";
import SideMenu from "@/components/side-menu";
import {
  HotelDetail,
  PlaceDetail,
  RestaurantDetail,
  RouteDetail,
} from "@/components/details";
import { NotifsPanel, PremiumModal, SearchModal } from "@/components/modals";
import {
  OnboardingInterests,
  OnboardingLang,
  SplashScreen,
} from "@/components/onboarding";
import HomeScreen from "@/components/screens/home";
import ExploreScreen from "@/components/screens/explore";
import MapScreen from "@/components/screens/map";
import AudioScreen from "@/components/screens/audio";
import ProfileScreen from "@/components/screens/profile";
import TransportScreen from "@/components/screens/transport";
import PracticalScreen from "@/components/screens/practical";
import RouteView from "@/components/route-view";
import { MiniPlayer, Toast } from "@/components/widgets";
import { ContentProvider } from "@/components/content-provider";
import { AuthSplash, LoginScreen, RegisterScreen } from "@/components/auth-screens";
import type { Hotel, Place, PublicUser, Restaurant, Route, Tab } from "@/lib/types";

/**
 * Оболочка приложения.
 *
 * Навигация держится на состоянии, а не на маршрутах: экраны меняются
 * внутри одного «телефона», как в макете, и переход между вкладками не
 * перезагружает страницу.
 *
 * Открытая карточка — одно поле `detail`, а не четыре отдельных флага.
 * Открыть можно ровно одну, и размеченное объединение делает это
 * невозможным нарушить: раньше пришлось бы гасить три чужих состояния
 * при каждом открытии четвёртого.
 */

type Detail =
  | { kind: "place"; value: Place }
  | { kind: "hotel"; value: Hotel }
  | { kind: "restaurant"; value: Restaurant }
  | { kind: "route"; value: Route }
  /** Дорога до выбранного места: своя карточка, а не всплывающая надпись. */
  | { kind: "путь"; название: string; город: string };

/**
 * «checking» — пока не пришёл ответ о сессии. Без него приложение
 * мигало бы экраном входа тому, кто уже вошёл: сессия живёт в куке, и
 * узнать о ней можно только запросом.
 */
type Phase = "checking" | "splash" | "register" | "login" | "lang" | "interests" | "app";

/**
 * Язык по настройкам телефона.
 *
 * Приложение поставит и иностранец, и открывать его на русском только
 * потому, что мы в Узбекистане, — неуважительно. Берём язык системы и
 * подставляем его в список первым выбором.
 */
function языкУстройства(): string {
  const код = (typeof navigator !== "undefined" ? navigator.language : "ru").slice(0, 2).toLowerCase();
  const карта: Record<string, string> = {
    en: "🇬🇧 English",
    ru: "🇷🇺 Русский",
    uz: "🇺🇿 O'zbek",
    zh: "🇨🇳 中文",
    ko: "🇰🇷 한국어",
    de: "🇩🇪 Deutsch",
    fr: "🇫🇷 Français",
    ja: "🇯🇵 日本語",
    tr: "🇹🇷 Türkçe",
    ar: "🇸🇦 العربية",
  };
  return карта[код] ?? "🇬🇧 English";
}

export default function Page() {
  return (
    <ContentProvider>
      <App />
    </ContentProvider>
  );
}

function App() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [lang, setLang] = useState(языкУстройства);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [detail, setDetail] = useState<Detail | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPractical, setShowPractical] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [miniAudio, setMiniAudio] = useState<Place | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Перемонтирует содержимое вкладки, чтобы въезд проигрывался заново.
  const [tabKey, setTabKey] = useState(0);

  // Кто вошёл. Сессия живёт три месяца и продлевается при каждом
  // запуске, поэтому постоянный пользователь пароль больше не вводит.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: PublicUser | null }) => {
        if (cancelled) return;
        if (d.user) {
          setUser(d.user);
          setPhase("app");
        } else {
          setPhase("splash");
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("splash");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const openPlace = (value: Place) => {
    setDetail({ kind: "place", value });
    setTab("explore");
  };

  const openRoute = (value: Route) => {
    setDetail({ kind: "route", value });
    setTab("map");
  };

  const openHotel = (value: Hotel) => setDetail({ kind: "hotel", value });
  const openRestaurant = (value: Restaurant) => setDetail({ kind: "restaurant", value });
  const openПуть = (название: string, город: string) => setDetail({ kind: "путь", название, город });
  const closeDetail = () => setDetail(null);

  const switchTab = (next: Tab) => {
    setDetail(null);
    setTab(next);
    setTabKey((k) => k + 1);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setPhase("splash");
    setTab("home");
    setDetail(null);
    setShowMenu(false);
  };


  return (
    <div className="device-shell">
      <div className="device">

        {phase === "checking" && (
          <div className="absolute inset-0 z-40">
            <AuthSplash />
          </div>
        )}

        {phase === "splash" && (
          <div className="absolute inset-0 z-40">
            <SplashScreen onStart={() => setPhase("register")} onLogin={() => setPhase("login")} />
          </div>
        )}

        {phase === "register" && (
          <div className="absolute inset-0 z-40">
            <RegisterScreen
              onBack={() => setPhase("splash")}
              onDone={(u) => {
                setUser(u);
                // Сюда попадаем уже после подтверждения почты: сессия
                // открыта. Новичку показываем язык и интересы.
                setPhase("lang");
              }}
            />
          </div>
        )}

        {phase === "login" && (
          <div className="absolute inset-0 z-40">
            <LoginScreen
              onBack={() => setPhase("splash")}
              onRegister={() => setPhase("register")}
              onDone={(u) => {
                setUser(u);
                setPhase("app");
              }}
            />
          </div>
        )}

        {phase === "lang" && (
          <div className="overlay-screen device-safe-top absolute inset-0 z-40">
            <OnboardingLang
              defaultLang={lang}
              onNext={(picked) => {
                setLang(picked);
                setPhase("interests");
              }}
            />
          </div>
        )}

        {phase === "interests" && (
          <div className="overlay-screen device-safe-top absolute inset-0 z-40">
            <OnboardingInterests lang={lang} onDone={() => setPhase("app")} />
          </div>
        )}

        {phase === "app" && (
          <>
            {showSearch && (
              <SearchModal
                onClose={() => setShowSearch(false)}
                onPlace={(p) => {
                  setShowSearch(false);
                  openPlace(p);
                }}
              />
            )}
            {showNotifs && <NotifsPanel onClose={() => setShowNotifs(false)} />}
            {showPractical && (
              <div className="overlay-screen absolute inset-0 z-40">
                <PracticalScreen onBack={() => setShowPractical(false)} />
              </div>
            )}
            {showTransport && (
              <div className="overlay-screen device-safe-top absolute inset-0 z-40">
                <TransportScreen onBack={() => setShowTransport(false)} isPremium={isPremium} />
              </div>
            )}
            {showMenu && (
              <SideMenu
                onClose={() => setShowMenu(false)}
                onTab={switchTab}
                currentTab={tab}
                isPremium={isPremium}
                onPremium={() => {
                  setShowMenu(false);
                  setShowPremium(true);
                }}
                onLogout={logout}
              />
            )}
            {showPremium && (
              <PremiumModal
                onClose={() => setShowPremium(false)}
                onActivate={() => {
                  setIsPremium(true);
                  setShowPremium(false);
                }}
              />
            )}

            <div className="device-content flex-1 overflow-hidden">
              <div key={tabKey} className="app-page animate-fade-in h-full">
                <Screen
                  tab={tab}
                  detail={detail}
                  isPremium={isPremium}
                  onCloseDetail={closeDetail}
                  onPlace={openPlace}
                  onRoute={openRoute}
                  onHotel={openHotel}
                  onRestaurant={openRestaurant}
                  onПуть={openПуть}
                  onTab={switchTab}
                  onToast={showToast}
                  onPlay={setMiniAudio}
                  onSearch={() => setShowSearch(true)}
                  onNotifs={() => setShowNotifs(true)}
                  onPractical={() => setShowPractical(true)}
                  onTransport={() => setShowTransport(true)}
                  onMenu={() => setShowMenu(true)}
                  onLogout={logout}
                  user={user}
                />
              </div>
            </div>

            {miniAudio && <MiniPlayer place={miniAudio} onClose={() => setMiniAudio(null)} />}
            {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

            <BottomNav tab={tab} onTab={switchTab} />
          </>
        )}
      </div>
    </div>
  );
}

interface ScreenProps {
  tab: Tab;
  detail: Detail | null;
  isPremium: boolean;
  onCloseDetail: () => void;
  onPlace: (p: Place) => void;
  onRoute: (r: Route) => void;
  onHotel: (h: Hotel) => void;
  onRestaurant: (r: Restaurant) => void;
  onПуть: (название: string, город: string) => void;
  onTab: (t: Tab) => void;
  onToast: (msg: string) => void;
  onPlay: (p: Place) => void;
  onSearch: () => void;
  onNotifs: () => void;
  onPractical: () => void;
  onTransport: () => void;
  onMenu: () => void;
  onLogout: () => void;
  user: PublicUser | null;
}

/**
 * Что показывать на текущей вкладке.
 *
 * Открытая карточка перекрывает вкладку целиком — поэтому сначала
 * разбираем её, и лишь потом доходим до самих экранов. Так порядок
 * проверок читается сверху вниз вместо гирлянды из && по всем сочетаниям.
 */
function Screen({ tab, detail, ...p }: ScreenProps) {
  if (detail) {
    switch (detail.kind) {
      case "place":
        return (
          <PlaceDetail
            place={detail.value}
            onBack={p.onCloseDetail}
            onPlay={p.onPlay}
            onToast={p.onToast}
            onПуть={p.onПуть}
          />
        );
      case "hotel":
        return <HotelDetail hotel={detail.value} onBack={p.onCloseDetail} onToast={p.onToast} />;
      case "restaurant":
        return (
          <RestaurantDetail
            r={detail.value}
            onBack={p.onCloseDetail}
            onToast={p.onToast}
            onПуть={p.onПуть}
          />
        );
      case "route":
        return <RouteDetail route={detail.value} onBack={p.onCloseDetail} />;
      case "путь":
        return (
          <RouteView
            название={detail.название}
            город={detail.город}
            onBack={p.onCloseDetail}
            onТакси={p.onTransport}
          />
        );
    }
  }

  switch (tab) {
    case "home":
      return (
        <HomeScreen
          onPlace={p.onPlace}
          onSearch={p.onSearch}
          onHotel={p.onHotel}
          onNotifs={p.onNotifs}
          onPractical={p.onPractical}
          onRestaurant={p.onRestaurant}
          onMenu={p.onMenu}
          onTab={p.onTab}
          onTransport={p.onTransport}
          isPremium={p.isPremium}
        />
      );
    case "explore":
      return (
        <ExploreScreen
          onPlace={p.onPlace}
          onHotel={p.onHotel}
          onRestaurant={p.onRestaurant}
          isPremium={p.isPremium}
        />
      );
    case "map":
      return <MapScreen onRoute={p.onRoute} />;
    case "audio":
      return <AudioScreen onPlay={p.onPlay} isPremium={p.isPremium} />;
    case "profile":
      return <ProfileScreen onLogout={p.onLogout} user={p.user} />;
  }
}
