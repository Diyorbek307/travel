"use client";

import { useCallback, useState } from "react";
import BottomNav from "@/components/bottom-nav";
import StatusBar from "@/components/status-bar";
import SideMenu from "@/components/side-menu";
import {
  HotelDetail,
  PlaceDetail,
  RestaurantDetail,
  RouteDetail,
} from "@/components/details";
import { LoginModal, NotifsPanel, PremiumModal, SearchModal } from "@/components/modals";
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
import { MiniPlayer, Toast } from "@/components/widgets";
import { CREAM, GREEN } from "@/lib/theme";
import type { Hotel, Place, Restaurant, Route, Tab } from "@/lib/types";

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
  | { kind: "route"; value: Route };

type Phase = "splash" | "lang" | "interests" | "app";

export default function App() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [lang, setLang] = useState("🇷🇺 Русский");
  const [tab, setTab] = useState<Tab>("home");
  const [detail, setDetail] = useState<Detail | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPractical, setShowPractical] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [miniAudio, setMiniAudio] = useState<Place | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Перемонтирует содержимое вкладки, чтобы въезд проигрывался заново.
  const [tabKey, setTabKey] = useState(0);

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
  const closeDetail = () => setDetail(null);

  const switchTab = (next: Tab) => {
    setDetail(null);
    setTab(next);
    setTabKey((k) => k + 1);
  };

  const logout = () => {
    setPhase("splash");
    setTab("home");
    setDetail(null);
    setShowMenu(false);
  };

  const onboarding = phase !== "app";

  return (
    <div
      className="flex size-full items-center justify-center"
      style={{ background: `linear-gradient(135deg,${GREEN} 0%,#1A5C3A 100%)` }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(390px,100vw)",
          height: "min(844px,100vh)",
          background: CREAM,
          borderRadius: "min(44px,5vw)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.14),0 50px 150px rgba(0,0,0,0.55)",
        }}
      >
        <StatusBar transparent={onboarding} />

        {showLogin && (
          <div className="absolute inset-0 z-50">
            <LoginModal
              onClose={() => setShowLogin(false)}
              onLogin={() => {
                setShowLogin(false);
                setPhase("app");
              }}
            />
          </div>
        )}

        {phase === "splash" && (
          <div className="absolute inset-0 z-40">
            <SplashScreen onStart={() => setPhase("lang")} onLogin={() => setShowLogin(true)} />
          </div>
        )}

        {phase === "lang" && (
          <div className="absolute inset-0 z-40 pt-10">
            <OnboardingLang
              onNext={(picked) => {
                setLang(picked);
                setPhase("interests");
              }}
            />
          </div>
        )}

        {phase === "interests" && (
          <div className="absolute inset-0 z-40 pt-10">
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
            {showPractical && <PracticalScreen onBack={() => setShowPractical(false)} />}
            {showTransport && (
              <div className="absolute inset-0 z-40 pt-10">
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

            <div className="flex-1 overflow-hidden pb-16 pt-10">
              <div key={tabKey} className="animate-fade-in h-full">
                <Screen
                  tab={tab}
                  detail={detail}
                  isPremium={isPremium}
                  onCloseDetail={closeDetail}
                  onPlace={openPlace}
                  onRoute={openRoute}
                  onHotel={openHotel}
                  onRestaurant={openRestaurant}
                  onTab={switchTab}
                  onToast={showToast}
                  onPlay={setMiniAudio}
                  onSearch={() => setShowSearch(true)}
                  onNotifs={() => setShowNotifs(true)}
                  onPractical={() => setShowPractical(true)}
                  onTransport={() => setShowTransport(true)}
                  onMenu={() => setShowMenu(true)}
                  onLogout={logout}
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
  onTab: (t: Tab) => void;
  onToast: (msg: string) => void;
  onPlay: (p: Place) => void;
  onSearch: () => void;
  onNotifs: () => void;
  onPractical: () => void;
  onTransport: () => void;
  onMenu: () => void;
  onLogout: () => void;
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
          />
        );
      case "hotel":
        return <HotelDetail hotel={detail.value} onBack={p.onCloseDetail} onToast={p.onToast} />;
      case "restaurant":
        return <RestaurantDetail r={detail.value} onBack={p.onCloseDetail} onToast={p.onToast} />;
      case "route":
        return <RouteDetail route={detail.value} onBack={p.onCloseDetail} />;
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
      return <ProfileScreen onLogout={p.onLogout} />;
  }
}
