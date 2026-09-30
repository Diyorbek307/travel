"use client";

import { запомнитьЗаказEsim } from "@/components/esim-shop";
import { разобратьКод, заменитьМаршрут, текущийМаршрут } from "@/lib/trip";
import { лёгкийСейчас } from "@/lib/lite";
import { ЖивоеОбучение } from "@/components/live-tour";
import { гость, статьГостем, забытьГостя, ПАРАМЕТРЫ_ССЫЛКИ } from "@/lib/guest";
import { ТуристProvider } from "@/components/tourist-provider";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import BottomNav from "@/components/bottom-nav";
import SideMenu from "@/components/side-menu";
import { HotelDetail, PlaceDetail, RestaurantDetail, RouteDetail } from "@/components/details";
import { NotifsPanel, PremiumModal, SearchModal } from "@/components/modals";
import { OnboardingInterests, OnboardingLang, SplashScreen } from "@/components/onboarding";
import { ОбучениеДети } from "@/components/kids-tour";
import { Слой } from "@/components/layer";
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
import { ContentProvider, useAppContent, useContentReady } from "@/components/content-provider";
import { LangProvider, useT } from "@/components/lang-provider";
import { WeatherProvider } from "@/components/weather-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { GeoProvider, useGeo } from "@/components/geo-provider";
import { ГОРОДА, ближайшийГород, дистанцияКм, расстояниеТочноКм } from "@/data/geo";
import { useГородПодписки } from "@/lib/push-client";
import { разобратьСсылку } from "@/lib/campaign-rules";
import { AudioPlayerProvider } from "@/components/audio-player";
import { AuthSplash, LoginScreen, RegisterScreen } from "@/components/auth-screens";
import NativeBack from "@/components/native-back";
import { отметитьВизит, отметитьМесто } from "@/lib/visits";
import { инитТему } from "@/lib/settings";
import type { Hotel, Place, PublicUser, Restaurant, Route, Tab } from "@/lib/types";
import TripScreen from "@/components/screens/trip";
import IntroCinematic from "@/components/intro-cinematic";
import IntroLogo from "@/components/intro-logo";
import PushAsk, { ЭкранУведомлений } from "@/components/push-ask";

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
/** Отметка на устройстве: человек уже входил — ему короткая заставка. */
const ВХОДИЛ = "uzup.returning";

// Хранилище браузера бывает закрыто (приватный режим) — тогда отметки
// просто нет, и человек видит полную заставку.
function входил(): boolean {
  try {
    return Boolean(localStorage.getItem(ВХОДИЛ));
  } catch {
    return false;
  }
}
function запомнитьВход(да: boolean): void {
  try {
    if (да) localStorage.setItem(ВХОДИЛ, "1");
    else запомнитьВход(false);
  } catch {}
}

/*
 * «push» — экран «Включите уведомления» между входом и приложением. Он сам
 * пропускает дальше, если спрашивать нечего (см. components/push-ask).
 */
type Phase = "checking" | "splash" | "register" | "login" | "lang" | "tour" | "interests" | "push" | "app";

/**
 * Первый экран для не вошедшего. Язык выбирают до всего остального:
 * иностранец, которому сразу показали регистрацию по-русски, закрыл бы
 * приложение. Кто язык уже выбирал — сразу на заставку.
 */
function первыйЭкран(): Phase {
  try {
    return localStorage.getItem("uzup.lang") ? "splash" : "lang";
  } catch {
    return "lang";
  }
}

/** Вкладка при входе и та, куда ведёт «назад» с остальных. */
const СТАРТ: Tab = "explore";

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
  // Повтор обучения из настроек — поверх приложения, без выхода из него.
  const [обучение, setОбучение] = useState(false);
  // Обучение поверх настоящего интерфейса: после экранов с детьми и
  // при первом входе в приложение.
  const [живойТур, setЖивойТур] = useState(false);
  useEffect(() => {
    if (phase !== "app") return;
    let было = true;
    try {
      было = localStorage.getItem("uzup.liveTour") === "1";
    } catch {
      было = true;
    }
    if (было) return;
    const id = setTimeout(() => setЖивойТур(true), 1500);
    return () => clearTimeout(id);
  }, [phase]);
  useEffect(() => {
    const открыть = () => setОбучение(true);
    window.addEventListener("hellouz:tour", открыть);
    return () => window.removeEventListener("hellouz:tour", открыть);
  }, []);
  const [user, setUser] = useState<PublicUser | null>(null);
  /*
   * Пришёл по ссылке на место, отель или аудиогид — его ждёт конкретная
   * вещь, а не регистрация. Такого человека пускаем гостем сразу.
   * Решаем при первом кадре: разбор адреса ниже потом его чистит.
   */
  const [поСсылке] = useState(
    () =>
      typeof window !== "undefined" &&
      ПАРАМЕТРЫ_ССЫЛКИ.some((п) => new URLSearchParams(window.location.search).has(п)),
  );
  // Приложение открывается на HelloUZ — сетке разделов: за ней человек и
  // приходит (город, где поесть, где жить). Главная — на своей вкладке.
  const [tab, setTab] = useState<Tab>(СТАРТ);
  const [detail, setDetail] = useState<Detail | null>(null);
  /*
   * Код на табличке ведёт на «/?audio=<номер>». Большинство людей снимают
   * его обычной камерой телефона, а не сканером внутри приложения, и
   * попадают сюда по ссылке. Забираем номер и сразу же убираем его из
   * адреса: иначе при каждом обновлении страницы рассказ включался бы
   * заново, даже когда человек давно занят другим.
   */
  const [кодЗаписи, setКодЗаписи] = useState<string | null>(null);
  /*
   * Ссылка из уведомления, которую ещё не открыли: приложение могло
   * стартовать с неё раньше, чем человек вошёл, а данные пришли с сервера.
   */
  const [ссылкаЖдёт, setСсылкаЖдёт] = useState<string | null>(null);
  // План поездки из ссылки — ждёт данных, чтобы найти названия и фото.
  const [планЖдёт, setПланЖдёт] = useState<string | null>(null);
  const { PLACES, HOTELS, RESTAURANTS } = useAppContent();
  const данныеГотовы = useContentReady();
  const { t } = useT();
  const { pos } = useGeo();
  // Город у push-подписки освежаем при каждом открытии: кампании «по
  // городу» должны приходить туда, где человек сейчас.
  useГородПодписки(ближайшийГород(pos));

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // предзаполнение поиска (напр. клик по городу)
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPractical, setShowPractical] = useState(false);
  const [раскрытьПамятку, setРаскрытьПамятку] = useState<string | undefined>(undefined);
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

  // Заставка при запуске. Оверлей поверх всего; навигация и сессия под
  // ним работают как обычно, к моменту перехода приложение готово.
  //
  // Полный пролёт над городами — для новых людей. Кто уже входил, видит
  // короткую: светящийся знак на чёрном. Ответа сервера «кто вошёл» не
  // ждём — он приходит позже, чем начинается заставка, — а смотрим
  // отметку на устройстве. Решаем до первой отрисовки: до этого момента
  // на экране просто чёрный фон, с которого начинаются обе заставки.
  const [заставка, setЗаставка] = useState<"полная" | "короткая" | null>(null);
  const [introDone, setIntroDone] = useState(false);
  useLayoutEffect(() => {
    // Пролёт над городами — 9 секунд и несколько мегабайт видео. Тому, кто
    // пришёл по ссылке на место, и на слабой сети — короткая заставка.
    setЗаставка(входил() || поСсылке || лёгкийСейчас() ? "короткая" : "полная");
  }, []);
  // Отметка «уже входил» живёт, пока человек в аккаунте.
  useEffect(() => {
    if (user) запомнитьВход(true);
  }, [user]);
  // Счётчик переходов между экранами — по нему решается показ
  // полноэкранной рекламы. Растёт при открытии карточек.
  const [navCount, setNavCount] = useState(0);

  // Перемонтирует содержимое вкладки, чтобы въезд проигрывался заново.
  const [tabKey, setTabKey] = useState(0);
  // С какой стороны въезжает новая вкладка — по положению кнопок в меню.
  const [направление, setНаправление] = useState<"left" | "right" | undefined>(undefined);

  // Фото с «переливом» (.skel): как только загрузилось, перелив гасим.
  // Событие load не всплывает, поэтому ловим его на погружении.
  useEffect(() => {
    const загрузилось = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLImageElement && el.classList.contains("skel")) el.classList.add("loaded");
    };
    document.addEventListener("load", загрузилось, true);
    document.addEventListener("error", загрузилось, true);
    return () => {
      document.removeEventListener("load", загрузилось, true);
      document.removeEventListener("error", загрузилось, true);
    };
  }, []);

  // Сохранённую тему применяем сразу при запуске; по умолчанию она
  // следует за системой телефона.
  useEffect(() => {
    инитТему();
  }, []);

  // Кто вошёл. Сессия живёт три месяца и продлевается при каждом
  // запуске, поэтому постоянный пользователь пароль больше не вводит.
  // Без аккаунта: гость и пришедший по ссылке — сразу в приложение,
  // новичок — на выбор языка и знакомство.
  const безАккаунта = (): Phase => {
    if (поСсылке) статьГостем();
    return гость() ? "app" : первыйЭкран();
  };
  // Вход и регистрация по просьбе из брони, отзыва или профиля гостя.
  useEffect(() => {
    const открыть = (e: Event) =>
      setPhase((e as CustomEvent<string>).detail === "register" ? "register" : "login");
    window.addEventListener("hellouz:auth", открыть);
    return () => window.removeEventListener("hellouz:auth", открыть);
  }, []);
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
          setPhase(безАккаунта());
        }
      })
      .catch(() => {
        if (!cancelled) setPhase(безАккаунта());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  // Каждое открытие карточки — переход: считаем их для показа рекламы.
  const переход = () => setNavCount((n) => n + 1);

  /*
   * «Цифровой паспорт» — про настоящие поездки. Штамп места ставится,
   * только когда человек рядом с ним (до километра), город — когда он в
   * городе. Раньше хватало открыть карточку из дома, и паспорт
   * наполнялся штампами мест, где человек не был.
   */
  const вГороде = (город: string) =>
    Boolean(pos && ГОРОДА[город] && расстояниеТочноКм(pos, ГОРОДА[город]) < 40);

  const openPlace = (value: Place) => {
    const км = дистанцияКм(pos, value.nameRu ?? value.name, value.city);
    if (км != null && км <= 1) отметитьМесто(value.id);
    if (вГороде(value.city)) отметитьВизит(value.city);
    // Карточка ложится поверх текущей вкладки: раньше открытие места с
    // главной перекидывало на «HelloUZ», и «назад» вело не туда.
    setDetail({ kind: "place", value });
    переход();
  };

  const openRoute = (value: Route) => {
    setDetail({ kind: "route", value });
    setTab("map");
    переход();
  };
  // Экскурсия из «Исследовать» открывается поверх этой же вкладки: после
  // «назад» человек возвращается в список экскурсий, а не на карту.
  const openExcursion = (value: Route) => {
    setDetail({ kind: "route", value });
    переход();
  };

  const openHotel = (value: Hotel) => {
    if (вГороде(value.city)) отметитьВизит(value.city);
    setDetail({ kind: "hotel", value });
    переход();
  };
  const openRestaurant = (value: Restaurant) => {
    if (вГороде(value.city)) отметитьВизит(value.city);
    setDetail({ kind: "restaurant", value });
    переход();
  };
  const openПуть = (название: string, город: string) => setDetail({ kind: "путь", название, город });

  /*
   * Переход по ссылке кампании — из колокольчика или push. Запись могли
   * удалить после рассылки: тогда открываем её раздел, а не пустоту.
   */
  const openLink = (ссылка: string) => {
    const п = разобратьСсылку(ссылка);
    if (!п) return;
    switch (п.kind) {
      case "explore":
        return openExplore(п.раздел as РазделОбзора | undefined);
      case "map":
      case "profile":
        return switchTab(п.kind);
      case "place": {
        const место = PLACES.find((x) => x.id === п.id);
        if (!место) return openExplore("places");
        switchTab("explore");
        return openPlace(место);
      }
      case "hotel": {
        const отель = HOTELS.find((x) => x.id === п.id);
        if (!отель) return openExplore("hotels");
        switchTab("explore");
        return openHotel(отель);
      }
      case "restaurant": {
        const заведение = RESTAURANTS.find((x) => x.id === п.id);
        if (!заведение) return openExplore("restaurants");
        switchTab("explore");
        return openRestaurant(заведение);
      }
    }
  };
  /*
   * Карточка из чата ИИ-гида: запись ложится поверх чата, вкладку не
   * меняем — после «назад» человек возвращается к разговору.
   */
  const openFromChat = (ссылка: string) => {
    const п = разобратьСсылку(ссылка);
    if (!п || !("id" in п)) return;
    if (п.kind === "place") {
      const м = PLACES.find((x) => x.id === п.id);
      if (м) openPlace(м);
    } else if (п.kind === "hotel") {
      const о = HOTELS.find((x) => x.id === п.id);
      if (о) openHotel(о);
    } else {
      const р = RESTAURANTS.find((x) => x.id === п.id);
      if (р) openRestaurant(р);
    }
  };
  const openFromChatRef = useRef(openFromChat);
  openFromChatRef.current = openFromChat;
  useEffect(() => {
    const открыть = (e: Event) => {
      const ссылка = (e as CustomEvent<string>).detail;
      if (typeof ссылка === "string") openFromChatRef.current(ссылка);
    };
    window.addEventListener("hellouz:open", открыть);
    return () => window.removeEventListener("hellouz:open", открыть);
  }, []);
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
    // Нажатие на push-уведомление открывает «/?open=<ссылка кампании>».
    const открыть = п.get("open");
    if (открыть) {
      setСсылкаЖдёт(открыть);
      п.delete("open");
    }
    // Возврат с оплаты eSIM: «/?esim=<номер заказа>» — открываем «Связь».
    const есим = п.get("esim");
    if (есим) {
      запомнитьЗаказEsim(есим);
      setРаскрытьПамятку("internet");
      setShowPractical(true);
      п.delete("esim");
    }
    // Присланный план поездки: «/?trip=<код>».
    const план = п.get("trip");
    if (план) {
      setПланЖдёт(план);
      п.delete("trip");
    }
    // «Поделиться» ведёт на «/?place=<id>» (или hotel, restaurant).
    let запись = !!план || !!есим;
    for (const вид of ["place", "hotel", "restaurant"] as const) {
      const номер = п.get(вид);
      if (!номер) continue;
      setСсылкаЖдёт(`${вид}:${номер}`);
      п.delete(вид);
      запись = true;
    }

    if (id) {
      setКодЗаписи(id);
      setTab("audio");
      п.delete("audio");
    } else if (вкладка && (вкладки as string[]).includes(вкладка)) {
      setTab(вкладка as Tab);
    }
    if (!id && !вкладка && !открыть && !запись) return;

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
    const порядок: Tab[] = ["home", "map", "explore", "audio", "profile"];
    const откуда = порядок.indexOf(tab);
    const куда = порядок.indexOf(next);
    setНаправление(куда === откуда ? undefined : куда > откуда ? "right" : "left");
    setTab(next);
    setTabKey((k) => k + 1);
  };

  // Ссылку из уведомления открываем, когда человек уже в приложении и
  // данные пришли с сервера — иначе свежая запись из панели не нашлась бы.
  useEffect(() => {
    if (phase !== "app" || !ссылкаЖдёт || !данныеГотовы) return;
    openLink(ссылкаЖдёт);
    setСсылкаЖдёт(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ссылкаЖдёт, данныеГотовы]);

  // Присланный план: собираем точки из своих данных и, если свой план
  // уже есть, спрашиваем, заменить ли его.
  useEffect(() => {
    if (phase !== "app" || !планЖдёт || !данныеГотовы) return;
    setПланЖдёт(null);
    const точки = разобратьКод(планЖдёт).flatMap((т) => {
      const з =
        т.kind === "hotel"
          ? HOTELS.find((x) => x.id === т.id)
          : т.kind === "restaurant"
          ? RESTAURANTS.find((x) => x.id === т.id)
          : PLACES.find((x) => x.id === т.id);
      if (!з) return [];
      const имя = "nameRu" in з && з.nameRu ? з.nameRu : з.name;
      return [{ id: т.id, kind: т.kind, day: т.day, name: имя, city: з.city, img: з.img }];
    });
    if (!точки.length) return;
    if (текущийМаршрут().length && !window.confirm(t("trip_import"))) return;
    заменитьМаршрут(точки);
    setShowTrip(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, планЖдёт, данныеГотовы]);

  // Приложение уже открыто, и человек нажал на push: service worker не
  // открывает вторую вкладку, а присылает сюда, куда перейти.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const принять = (e: MessageEvent) => {
      const д = e.data as { type?: string; link?: unknown } | null;
      if (д?.type === "open" && typeof д.link === "string") setСсылкаЖдёт(д.link);
    };
    navigator.serviceWorker.addEventListener("message", принять);
    return () => navigator.serviceWorker.removeEventListener("message", принять);
  }, []);

  const openExplore = (раздел?: РазделОбзора) => {
    switchTab("explore");
    // После switchTab: он сбрасывает раздел, а нам нужен выбранный.
    setРазделОбзора(раздел);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(ВХОДИЛ);
    забытьГостя();
    setUser(null);
    setPhase("splash");
    setTab(СТАРТ);
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
    if (обучение) return setОбучение(false), true;
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
    if (phase === "register" || phase === "login") return setPhase(гость() ? "app" : "splash"), true;
    if (phase === "interests") return setPhase("app"), true;
    if (phase === "tour") return setPhase("lang"), true;
    // «Назад» на экране уведомлений — то же, что «Не сейчас».
    if (phase === "push") return setPhase("app"), true;
    if (phase === "app" && tab !== СТАРТ) return switchTab(СТАРТ), true;
    return false;
  }, [
    обучение,
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

  // Карточкам заведений: есть ли Premium и как открыть его окно.
  const турист = {
    имя: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    isPremium,
    premiumUntil: user?.premiumUntil ?? null,
    открытьPremium: () => setShowPremium(true),
  };

  return (
    <ТуристProvider value={турист}>
      <div className="device-shell">
        {!introDone && заставка === null && <div className="fixed inset-0 z-[100] bg-black" />}
        {!introDone && заставка === "полная" && <IntroCinematic onDone={() => setIntroDone(true)} />}
        {!introDone && заставка === "короткая" && <IntroLogo onDone={() => setIntroDone(true)} />}
        <NativeBack onBack={назадНаШаг} />
        <div className="device">
          {phase === "checking" && (
            <div className="phase-in absolute inset-0 z-40">
              <AuthSplash />
            </div>
          )}

          {phase === "splash" && (
            <div className="phase-in absolute inset-0 z-40">
              <SplashScreen
                onStart={() => {
                  // «Начать» — сразу в приложение, без формы: аккаунт
                  // попросим, только когда он понадобится.
                  статьГостем();
                  setPhase("app");
                }}
                onLogin={() => setPhase("login")}
              />
            </div>
          )}

          {phase === "register" && (
            <div className="phase-in absolute inset-0 z-40">
              <RegisterScreen
                onBack={() => setPhase(гость() ? "app" : "splash")}
                onDone={(u) => {
                  setUser(u);
                  // Сюда попадаем уже после подтверждения почты: сессия
                  // открыта. Новичку показываем язык и интересы.
                  setPhase("interests");
                }}
              />
            </div>
          )}

          {phase === "login" && (
            <div className="phase-in absolute inset-0 z-40">
              <LoginScreen
                onBack={() => setPhase(гость() ? "app" : "splash")}
                onRegister={() => setPhase("register")}
                onDone={(u) => {
                  setUser(u);
                  setPhase("push");
                }}
              />
            </div>
          )}

          {phase === "lang" && (
            <div className="overlay-screen device-safe-top absolute inset-0 z-40">
              <OnboardingLang onNext={() => setPhase(user ? "interests" : "tour")} />
            </div>
          )}

          <Слой открыт={обучение} className="overlay-screen device-safe-top absolute inset-0 z-50">
            <ОбучениеДети
              onDone={() => {
                setОбучение(false);
                // Экраны объяснили — теперь показываем на самом приложении.
                setDetail(null);
                setРазделОбзора(undefined);
                setЖивойТур(true);
              }}
            />
          </Слой>
          {phase === "tour" && (
            <div className="overlay-screen device-safe-top absolute inset-0 z-40">
              <ОбучениеДети onDone={() => setPhase("splash")} />
            </div>
          )}
          {phase === "interests" && (
            <div className="overlay-screen device-safe-top absolute inset-0 z-40">
              <OnboardingInterests onDone={() => setPhase("push")} />
            </div>
          )}

          {phase === "push" && (
            <div className="overlay-screen device-safe-top absolute inset-0 z-40">
              <ЭкранУведомлений onDone={() => setPhase("app")} />
            </div>
          )}

          {phase === "app" && (
            <>
              <Слой открыт={showSearch}>
                <SearchModal
                  initialQuery={searchQuery}
                  onClose={() => setShowSearch(false)}
                  onPlace={(p) => {
                    setShowSearch(false);
                    openPlace(p);
                  }}
                />
              </Слой>
              <Слой открыт={showNotifs}>
                <NotifsPanel
                  onLink={openLink}
                  onClose={() => setShowNotifs(false)}
                  onOpen={(раздел) => {
                    switchTab("profile");
                    // После switchTab: он сбрасывает раздел профиля.
                    setProfileView(раздел);
                  }}
                />
              </Слой>
              <Слой открыт={showPractical} className="overlay-screen absolute inset-0 z-40">
                <PracticalScreen
                  раскрыть={раскрытьПамятку}
                  onBack={() => {
                    setShowPractical(false);
                    setРаскрытьПамятку(undefined);
                  }}
                />
              </Слой>
              <Слой открыт={showTransport} className="overlay-screen device-safe-top absolute inset-0 z-40">
                <TransportScreen onBack={() => setShowTransport(false)} isPremium={isPremium} />
              </Слой>
              <Слой открыт={showTrip} className="overlay-screen device-safe-top absolute inset-0 z-40">
                <TripScreen
                  onBack={() => setShowTrip(false)}
                  onOpen={(ссылка) => {
                    setShowTrip(false);
                    openFromChat(ссылка);
                  }}
                />
              </Слой>
              <Слой открыт={showFavorites} className="overlay-screen device-safe-top absolute inset-0 z-40">
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
              </Слой>
              <Слой открыт={showMenu}>
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
              </Слой>
              <Слой открыт={showPremium}>
                <PremiumModal onClose={() => setShowPremium(false)} />
              </Слой>

              <div className="device-content flex-1 overflow-hidden">
                <div key={tabKey} className="app-page animate-fade-in h-full" data-dir={направление}>
                  <Screen
                    tab={tab}
                    detail={detail}
                    isPremium={isPremium}
                    onCloseDetail={closeDetail}
                    onPlace={openPlace}
                    onRoute={openRoute}
                    onExcursion={openExcursion}
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
              {живойТур && (
                <ЖивоеОбучение
                  onTab={(t) => {
                    setDetail(null);
                    setРазделОбзора(undefined);
                    setTab(t);
                  }}
                  onDone={() => {
                    setЖивойТур(false);
                    try {
                      localStorage.setItem("uzup.liveTour", "1");
                    } catch {
                      // приватный режим — покажем ещё раз, не беда
                    }
                  }}
                />
              )}
              {/* Предложение включить уведомления: само решает, пора ли. */}
              {!user ? null : <PushAsk />}
            </>
          )}
        </div>
      </div>
    </ТуристProvider>
  );
}

interface ScreenProps {
  tab: Tab;
  detail: Detail | null;
  isPremium: boolean;
  onCloseDetail: () => void;
  onPlace: (p: Place) => void;
  onRoute: (r: Route) => void;
  onExcursion: (r: Route) => void;
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
 * Вкладка и открытая поверх неё карточка.
 *
 * Карточка ложится сверху, а вкладка под ней остаётся на месте: раньше
 * карточка заменяла вкладку, и, вернувшись из ресторана, человек
 * оказывался в начале списка, который только что листал. Теперь список
 * ждёт с той же прокруткой, а карточка уходит плавно (см. Слой).
 */
function Screen(props: ScreenProps) {
  const { detail } = props;
  return (
    <div className="relative h-full">
      {/* Под открытой карточкой вкладку не рисуем (visibility — после того,
          как карточка въехала), но и не выгружаем: прокрутка цела. */}
      <div className={`h-full ${detail ? "under-detail" : ""}`} aria-hidden={detail ? true : undefined}>
        <ЭкранВкладки {...props} />
      </div>
      <Слой открыт={Boolean(detail)} className="absolute inset-0 z-30">
        {detail && <Карточка {...props} detail={detail} />}
      </Слой>
    </div>
  );
}

function Карточка({ detail, ...p }: ScreenProps & { detail: Detail }) {
  {
    switch (detail.kind) {
      case "place":
        return (
          <PlaceDetail place={detail.value} onBack={p.onCloseDetail} onToast={p.onToast} onПуть={p.onПуть} />
        );
      case "hotel":
        return <HotelDetail hotel={detail.value} onBack={p.onCloseDetail} onПуть={p.onПуть} />;
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
}

/** Экран самой вкладки. */
function ЭкранВкладки({ tab, ...p }: ScreenProps) {
  switch (tab) {
    case "home":
      return (
        <HomeScreen
          onPlace={p.onPlace}
          onSearch={p.onSearch}
          onHotel={p.onHotel}
          onNotifs={p.onNotifs}
          onRestaurant={p.onRestaurant}
          onMenu={p.onMenu}
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
          onRoute={p.onExcursion}
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
      return <AudioScreen isPremium={p.isPremium} сразуИграть={p.кодЗаписи} onPlace={p.onPlace} />;
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
