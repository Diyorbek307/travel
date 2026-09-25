"use client";

import { useCallback, useEffect, useState } from "react";
import BottomNav from "@/components/bottom-nav";
import SideMenu from "@/components/side-menu";
import { HotelDetail, PlaceDetail, RestaurantDetail, RouteDetail } from "@/components/details";
import { NotifsPanel, PremiumModal, SearchModal } from "@/components/modals";
import { OnboardingInterests, OnboardingLang, SplashScreen } from "@/components/onboarding";
import HomeScreen from "@/components/screens/home";
import ExploreScreen, { type РазделОбзора } from "@/components/screens/explore";
import MapScreen from "@/components/screens/map";
import AudioScreen from "@/components/screens/audio";
import ProfileScreen from "@/components/screens/profile";
import TransportScreen from "@/components/screens/transport";
import PracticalScreen from "@/components/screens/practical";
import FavoritesScreen from "@/components/screens/favorites";
import RouteView from "@/components/route-view";
import { MiniPlayer, Toast } from "@/components/widgets";
import { AdInterstitial } from "@/components/ads";
import { ContentProvider } from "@/components/content-provider";
import { LangProvider } from "@/components/lang-provider";
import { WeatherProvider } from "@/components/weather-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { GeoProvider } from "@/components/geo-provider";
import { AudioPlayerProvider } from "@/components/audio-player";
import { AuthSplash, LoginScreen, RegisterScreen } from "@/components/auth-screens";
import NativeBack from "@/components/native-back";
import { отметитьВизит, отметитьМесто } from "@/lib/visits";
import { инитТему } from "@/lib/settings";
import type { Hotel, Place, PublicUser, Restaurant, Route, Tab } from "@/lib/types";
import WelcomeWow from "@/components/welcome-wow";
import TripScreen from "@/components/screens/trip";
import IntroCinematic from "@/components/intro-cinematic";

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
type Phase = "checking" | "splash" | "register" | "login" | "lang" | "interests" | "welcome" | "app";

export default function Page() {
  return (
    <ContentProvider>
      <LangProvider>
        <WeatherProvider>
          <CurrencyProvider>
            <GeoProvider>
              <AudioPlayerProvider>
                <App />
              </AudioPlayerProvider>
            </GeoProvider>
          </CurrencyProvider>
        </WeatherProvider>
      </LangProvider>
    </ContentProvider>
  );
}

function App() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [detail, setDetail] = useState<Detail | null>(null);
  /*
   * Код на табличке ведёт на «/?audio=<номер>». Большинство людей снимают
   * его обычной камерой телефона, а не сканером внутри приложения, и
   * попадают сюда по ссылке. Забираем номер и сразу же убираем его из
   * адреса: иначе при каждом обновлении страницы рассказ включался бы
   * заново, даже когда человек давно занят другим.
   */
  const [кодЗаписи, setКодЗаписи] = useState<string | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // предзаполнение поиска (напр. клик по городу)
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPractical, setShowPractical] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showTrip, setShowTrip] = useState(false);
  // С какого раздела открыть профиль, когда в него ведут из меню.
  const [profileView, setProfileView] = useState<"stats" | "bookings" | "support" | undefined>(undefined);
  /*
   * Открытый раздел «Исследовать» и выбранный город живут здесь, а не в
   * самом экране: карточка места перекрывает вкладку и размонтирует её,
   * и без этого после «назад» человек оказывался бы снова на плитках, а
   * не в списке, из которого пришёл. Город переживает и смену вкладок —
   * это выбор человека, а не состояние одного экрана.
   */
  const [разделОбзора, setРазделОбзора] = useState<РазделОбзора | undefined>(undefined);
  const [городОбзора, setГородОбзора] = useState<string | null>(null);

  // Premium включает владелец в панели, увидев оплату, — приложение
  // только читает срок из аккаунта.
  const isPremium = Boolean(user?.premiumUntil && new Date(user.premiumUntil).getTime() > Date.now());
  const [toast, setToast] = useState<string | null>(null);

  // Кинематографичная заставка при запуске — полная версия каждый раз
  // (с пролётом сквозь города). Оверлей поверх всего; навигация и сессия
  // под ней работают как обычно, к моменту перехода приложение готово.
  const [introDone, setIntroDone] = useState(false);
  // Счётчик переходов между экранами — по нему решается показ
  // полноэкранной рекламы. Растёт при открытии карточек.
  const [navCount, setNavCount] = useState(0);

  // Перемонтирует содержимое вкладки, чтобы въезд проигрывался заново.
  const [tabKey, setTabKey] = useState(0);

  // Сохранённую тему применяем сразу при запуске; по умолчанию она
  // следует за системой телефона.
  useEffect(() => {
    инитТему();
  }, []);

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

  // Каждое открытие карточки — переход: считаем их для показа рекламы.
  const переход = () => setNavCount((n) => n + 1);

  const openPlace = (value: Place) => {
    // Город и само место — в «Цифровой паспорт»: у места свой штамп.
    отметитьВизит(value.city);
    отметитьМесто(value.id);
    setDetail({ kind: "place", value });
    setTab("explore");
    переход();
  };

  const openRoute = (value: Route) => {
    setDetail({ kind: "route", value });
    setTab("map");
    переход();
  };

  const openHotel = (value: Hotel) => {
    отметитьВизит(value.city);
    setDetail({ kind: "hotel", value });
    переход();
  };
  const openRestaurant = (value: Restaurant) => {
    отметитьВизит(value.city);
    setDetail({ kind: "restaurant", value });
    переход();
  };
  const openПуть = (название: string, город: string) => setDetail({ kind: "путь", название, город });
  /*
   * Вход по адресу: QR-код ведёт на `?audio=<id>`, а ярлыки приложения на
   * домашнем экране телефона — на `?tab=<вкладка>` (долгое нажатие по
   * значку). Оба параметра одноразовые: сразу после разбора стираем их из
   * адреса, иначе обновление страницы снова утащило бы человека на ту же
   * вкладку, откуда он уже ушёл.
   */
  useEffect(() => {
    const п = new URLSearchParams(window.location.search);
    const id = п.get("audio");
    const вкладка = п.get("tab");
    const вкладки: Tab[] = ["home", "explore", "map", "audio", "profile"];

    if (id) {
      setКодЗаписи(id);
      setTab("audio");
      п.delete("audio");
    } else if (вкладка && (вкладки as string[]).includes(вкладка)) {
      setTab(вкладка as Tab);
    }
    if (!id && !вкладка) return;

    п.delete("tab");
    const хвост = п.toString();
    window.history.replaceState({}, "", window.location.pathname + (хвост ? `?${хвост}` : ""));
  }, []);

  const closeDetail = () => setDetail(null);

  const switchTab = (next: Tab) => {
    // Закрываем все всплывающие слои: иначе на десктопе клик по меню менял
    // вкладку под открытым экраном «Транспорт»/«Поиск», и казалось, что
    // навигация не работает.
    setShowSearch(false);
    setShowNotifs(false);
    setShowPractical(false);
    setShowTransport(false);
    setShowPremium(false);
    setShowMenu(false);
    setShowFavorites(false);
    setShowTrip(false);
    setProfileView(undefined);
    setРазделОбзора(undefined);
    setDetail(null);
    // Смена вкладки — тоже переход: так полноэкранная реклама выходит и
    // при обычном перелистывании разделов, а не только при открытии
    // карточек. Частота всё равно ограничена настройкой в панели.
    if (next !== tab) переход();
    setTab(next);
    setTabKey((k) => k + 1);
  };

  const openExplore = (раздел?: РазделОбзора) => {
    switchTab("explore");
    // После switchTab: он сбрасывает раздел, а нам нужен выбранный.
    setРазделОбзора(раздел);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setPhase("splash");
    setTab("home");
    setDetail(null);
    setShowMenu(false);
  };

  /*
   * Один шаг назад — тот же, что делают стрелки на экранах, но из одной
   * точки, чтобы к нему могла привязаться аппаратная кнопка телефона.
   * Разбираем сверху вниз по приоритету: сначала всплывающие слои, затем
   * открытая карточка, затем шаги входа, и в самом низу — возврат с
   * вкладки на главную. Вернули true — что-то закрыли; false — мы на
   * самом верху, дальше только выход из приложения.
   */
  const назадНаШаг = useCallback((): boolean => {
    if (showSearch) return setShowSearch(false), true;
    if (showNotifs) return setShowNotifs(false), true;
    if (showPremium) return setShowPremium(false), true;
    if (showMenu) return setShowMenu(false), true;
    if (showPractical) return setShowPractical(false), true;
    if (showTransport) return setShowTransport(false), true;
    if (showFavorites) return setShowFavorites(false), true;
    if (showTrip) return setShowTrip(false), true;
    if (detail) return setDetail(null), true;
    if (tab === "explore" && разделОбзора) return setРазделОбзора(undefined), true;
    if (phase === "register" || phase === "login") return setPhase("splash"), true;
    if (phase === "interests") return setPhase("lang"), true;
    if (phase === "app" && tab !== "home") return switchTab("home"), true;
    return false;
  }, [
    showSearch,
    showNotifs,
    showPremium,
    showMenu,
    showPractical,
    showTransport,
    showFavorites,
    showTrip,
    detail,
    разделОбзора,
    phase,
    tab,
  ]);

  return (
    <div className="device-shell">
      {!introDone && <IntroCinematic onDone={() => setIntroDone(true)} />}
      <NativeBack onBack={назадНаШаг} />
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
            <OnboardingLang onNext={() => setPhase("interests")} />
          </div>
        )}

        {phase === "interests" && (
          <div className="overlay-screen device-safe-top absolute inset-0 z-40">
            <OnboardingInterests onDone={() => setPhase("welcome")} />
          </div>
        )}

        {/* Между онбордингом и приложением — экран-«вау». Он только у тех,
            кто прошёл регистрацию целиком: при обычном входе не мешает. */}
        {phase === "welcome" && (
          <div className="absolute inset-0 z-40">
            <WelcomeWow name={user?.firstName} onDone={() => setPhase("app")} />
          </div>
        )}

        {phase === "app" && (
          <>
            {showSearch && (
              <SearchModal
                initialQuery={searchQuery}
                onClose={() => setShowSearch(false)}
                onPlace={(p) => {
                  setShowSearch(false);
                  openPlace(p);
                }}
              />
            )}
            {showNotifs && (
              <NotifsPanel
                onClose={() => setShowNotifs(false)}
                onOpen={(раздел) => {
                  switchTab("profile");
                  // После switchTab: он сбрасывает раздел профиля.
                  setProfileView(раздел);
                }}
              />
            )}
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
            {showTrip && (
              <div className="overlay-screen device-safe-top absolute inset-0 z-40">
                <TripScreen
                  onBack={() => setShowTrip(false)}
                  onPlace={(p) => {
                    setShowTrip(false);
                    openPlace(p);
                  }}
                  onПуть={(название, город) => {
                    setShowTrip(false);
                    openПуть(название, город);
                  }}
                />
              </div>
            )}
            {showFavorites && (
              <div className="overlay-screen device-safe-top absolute inset-0 z-40">
                <FavoritesScreen
                  onBack={() => setShowFavorites(false)}
                  onPlace={(p) => {
                    setShowFavorites(false);
                    openPlace(p);
                  }}
                  onHotel={(h) => {
                    setShowFavorites(false);
                    openHotel(h);
                  }}
                  onRestaurant={(r) => {
                    setShowFavorites(false);
                    openRestaurant(r);
                  }}
                  onRoute={(m) => {
                    setShowFavorites(false);
                    openRoute(m);
                  }}
                />
              </div>
            )}
            {showMenu && (
              <SideMenu
                user={user}
                onClose={() => setShowMenu(false)}
                onTab={switchTab}
                currentTab={tab}
                isPremium={isPremium}
                onFavorites={() => {
                  setShowMenu(false);
                  setShowFavorites(true);
                }}
                onTrip={() => {
                  setShowMenu(false);
                  setShowTrip(true);
                }}
                onProfileStats={() => {
                  setShowMenu(false);
                  switchTab("profile");
                  // После switchTab: он сбрасывает раздел, а нам нужен «Стат.».
                  setProfileView("stats");
                }}
                onPremium={() => {
                  setShowMenu(false);
                  setShowPremium(true);
                }}
                onLogout={logout}
              />
            )}
            {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}

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
                  profileView={profileView}
                  разделОбзора={разделОбзора}
                  onРазделОбзора={setРазделОбзора}
                  городОбзора={городОбзора}
                  onГородОбзора={setГородОбзора}
                  onExplore={openExplore}
                  кодЗаписи={кодЗаписи}
                  onTab={switchTab}
                  onToast={showToast}
                  onSearch={(q?: string) => {
                    setSearchQuery(q ?? "");
                    setShowSearch(true);
                  }}
                  onNotifs={() => setShowNotifs(true)}
                  onPractical={() => setShowPractical(true)}
                  onTransport={() => setShowTransport(true)}
                  onMenu={() => setShowMenu(true)}
                  onLogout={logout}
                  user={user}
                />
              </div>
            </div>

            <MiniPlayer />
            {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

            {/* Полноэкранная видео-реклама: сама решает, показываться ли,
                по счётчику переходов и настройке частоты из панели. */}
            <AdInterstitial isPremium={isPremium} navCount={navCount} />

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
  profileView?: "stats" | "bookings" | "support";
  разделОбзора?: РазделОбзора;
  onРазделОбзора: (р?: РазделОбзора) => void;
  городОбзора: string | null;
  onГородОбзора: (г: string | null) => void;
  onExplore: (р?: РазделОбзора) => void;
  кодЗаписи: string | null;
  onTab: (t: Tab) => void;
  onToast: (msg: string) => void;
  onSearch: (q?: string) => void;
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
          <PlaceDetail place={detail.value} onBack={p.onCloseDetail} onToast={p.onToast} onПуть={p.onПуть} />
        );
      case "hotel":
        return <HotelDetail hotel={detail.value} onBack={p.onCloseDetail} />;
      case "restaurant":
        return <RestaurantDetail r={detail.value} onBack={p.onCloseDetail} onПуть={p.onПуть} />;
      case "route":
        return (
          <RouteDetail route={detail.value} onBack={p.onCloseDetail} onПуть={p.onПуть} onToast={p.onToast} />
        );
      case "путь":
        return <RouteView название={detail.название} город={detail.город} onBack={p.onCloseDetail} />;
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
          onExplore={p.onExplore}
          onTransport={p.onTransport}
          onToast={p.onToast}
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
          раздел={p.разделОбзора}
          onРаздел={p.onРазделОбзора}
          город={p.городОбзора}
          onГород={p.onГородОбзора}
          onTab={p.onTab}
          onTransport={p.onTransport}
          onPractical={p.onPractical}
        />
      );
    case "map":
      return <MapScreen onRoute={p.onRoute} onAudio={() => p.onTab("audio")} onPlace={p.onPlace} />;
    case "audio":
      return <AudioScreen isPremium={p.isPremium} сразуИграть={p.кодЗаписи} />;
    case "profile":
      return (
        <ProfileScreen
          onLogout={p.onLogout}
          user={p.user}
          isPremium={p.isPremium}
          startView={p.profileView}
        />
      );
  }
}
