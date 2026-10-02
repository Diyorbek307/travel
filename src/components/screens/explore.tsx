"use client";

import { useId, useState } from "react";
import type { Hotel, HotelKind, ManagedRoute, Place, Restaurant, Route, Tab } from "@/lib/types";
import {
  ACCENT_DEEP,
  ACCENT_FILL,
  ACCENT_SOFT,
  GLOW,
  BORDER,
  CREAM,
  GOLD,
  GREEN,
  MUTED,
  TEXT,
  WHITE,
  SURFACE,
  ON_GOLD,
} from "@/lib/theme";
import { ТИПЫ_МЕСТ } from "@/data/content";
import type { TKey } from "@/lib/i18n";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useДистанция } from "@/lib/distance";
import { useДеньги } from "@/lib/money";
import { useWeather } from "@/components/weather-provider";
import { useGeo } from "@/components/geo-provider";
import { дистанцияКм, ближайшийГород } from "@/data/geo";
import { Badge, LogoMark, StarRow, Wordmark } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import CityReel from "@/components/city-reel";
import { ВИДЕО, ФОН_ВИДЕО, кадрыГорода } from "@/data/city-reels";
import { AdInline } from "@/components/ads";
import AiGuide from "@/components/ai-guide";
import { ПереводчикФото, useФотоИИ } from "@/components/photo-translator";
import { СтатусОткрыто } from "@/components/open-status";
import { открытоСейчас } from "@/lib/open-now";
import Туризм, { ФлагУз } from "@/components/tourism";

/**
 * Раздел внутри «Исследовать». Без раздела экран — сетка плиток, как
 * витрина услуг: человек сначала выбирает, что ищет, и только потом
 * видит список.
 */
export type РазделОбзора =
  | "scenic"
  | "cities"
  | "places"
  | "museums"
  | "hotels"
  | "restaurants"
  | "bars"
  | "excursions"
  | "ai"
  | "tourism"
  | "translate"
  | "photo";

/*
 * Город — не отдельный мир, а фильтр над всеми разделами.
 *
 * Если бы плитка «Города» вела в город, а в нём снова были бы места,
 * отели и рестораны, получилось бы два пути к одному и тому же списку,
 * и в «Ресторанах» человек видел бы всё вперемешку без понятного
 * способа сузить. Поэтому город выбирают один раз — чипом вверху или
 * карточкой в «Городах» — и он действует везде: плитки показывают, сколько
 * всего в этом городе, а списки внутри сразу отфильтрованы. Сменить или
 * сбросить город можно прямо в списке, не возвращаясь назад.
 */

/** Подтипы мест: внутри «Мест» — чипами, а не отдельными плитками. */
const ТИПЫ: { значение: string; подпись: TKey }[] = [
  { значение: "Всё", подпись: "common_all" },
  { значение: "История", подпись: "f_history" },
  { значение: "Мечети", подпись: "f_mosques" },
  { значение: "Музеи", подпись: "f_museums" },
  { значение: "Природа", подпись: "f_nature" },
  { значение: "Базары", подпись: "f_bazaars" },
];

export function ExploreScreen({
  onPlace,
  onHotel,
  onRestaurant,
  onRoute,
  isPremium,
  раздел,
  onРаздел,
  город,
  onГород,
  onTab,
  onTransport,
  onPractical,
  onEsim,
}: {
  onPlace: (p: Place) => void;
  onHotel: (h: Hotel) => void;
  onRestaurant: (r: Restaurant) => void;
  onRoute: (r: Route) => void;
  isPremium: boolean;
  раздел?: РазделОбзора;
  onРаздел: (р?: РазделОбзора) => void;
  /** Русское название города (ключ в данных) или null — все города. */
  город: string | null;
  onГород: (г: string | null) => void;
  onTab: (t: Tab) => void;
  onTransport: () => void;
  onPractical: () => void;
  /** «Полезное», сразу раскрытое на «Связи» — там магазин eSIM. */
  onEsim: () => void;
}) {
  const { CITIES, HOTELS, PLACES, POPULAR_CITIES, RESTAURANTS, ROUTES } = useAppContent();
  const { t, трК, lang } = useT();
  const { pos } = useGeo();
  const фотоИИ = useФотоИИ();
  const рядом = ближайшийГород(pos);
  const выбран = город ? CITIES.find((c) => c.name === город) : undefined;

  /*
   * Фон шапки — живой, как на главной. Выбран город — его ролик, а если
   * своего видео у города нет, кадры его достопримечательностей с
   * наездом. Все города — общий ролик об Узбекистане: на главной уже
   * играет Самарканд, и здесь повторять его было бы скучно.
   */
  const фон: Фон = выбран
    ? { кадры: кадрыГорода(выбран.name, выбран.img, { PLACES }), видео: ВИДЕО[выбран.name], alt: выбран.name }
    : { кадры: POPULAR_CITIES.slice(0, 4).map((c) => c.img), видео: ФОН_ВИДЕО, alt: "Uzbekistan" };

  const вГороде = <T extends { city: string }>(список: T[]) =>
    город ? список.filter((x) => x.city === город) : список;
  const места = вГороде(PLACES);
  // Красивые места — природа и глубинка: горы, озёра, ущелья, кишлаки.
  // Новые (с галереей и авторами фото) — первыми.
  const красивые = места
    .filter((p) => (p.typeRu ?? p.type) === "Природа")
    .sort((a, b) => (b.imgs?.length ?? 0) - (a.imgs?.length ?? 0));
  const музеи = места.filter((p) => (ТИПЫ_МЕСТ["Музеи"] ?? []).includes(p.typeRu ?? p.type));
  const отели = вГороде(HOTELS);
  // Бары — те же заведения из раздела ресторанов, но с видом «bar»: их
  // ищут вечером и по другой причине, поэтому у них своя плитка, а в
  // «Ресторанах» их нет.
  const рестораны = вГороде(RESTAURANTS).filter((r) => r.kind !== "bar");
  const бары = вГороде(RESTAURANTS).filter((r) => r.kind === "bar");
  // У многодневного тура через всю страну города нет: при выбранном
  // городе он не показывается, иначе фильтр врал бы.
  const экскурсии = город ? ROUTES.filter((r) => r.city === город) : ROUTES;
  // Пустой список предлагает снять город — если он выбран.
  const сброс = город ? () => onГород(null) : undefined;

  /*
   * Чипы городов — только там, где есть что показать: город без единой
   * записи дал бы одни пустые списки. Выбранный город остаётся в ряду в
   * любом случае, иначе его нельзя было бы увидеть и снять. Ближайший к
   * человеку — первым.
   */
  const есть = (имя: string) =>
    PLACES.some((p) => p.city === имя) ||
    HOTELS.some((h) => h.city === имя) ||
    RESTAURANTS.some((r) => r.city === имя);
  const городаЧипы = CITIES.map((c) => c.name)
    .filter((имя) => имя === город || есть(имя))
    .sort((a, b) => Number(b === рядом) - Number(a === рядом));

  const чипыГородов = (
    <div className="flex gap-2 overflow-x-auto hide-scroll">
      {[null, ...городаЧипы].map((имя) => (
        <button
          key={имя ?? "*"}
          onClick={() => onГород(имя)}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={
            город === имя
              ? { background: SURFACE, color: GREEN }
              : {
                  background: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }
          }
        >
          {имя === null ? t("ex_all_cities") : `${имя === рядом ? "📍 " : ""}${трК(имя)}`}
        </button>
      ))}
    </div>
  );

  if (!раздел) {
    const число = (n: number) => ({ под: String(n), пусто: n === 0 });
    const плитки: ПлиткаДанные[] = [
      { ключ: "cities", заголовок: t("ex_cities"), под: String(CITIES.length), go: () => onРаздел("cities") },
      { ключ: "hotels", заголовок: t("ex_stay"), ...число(отели.length), go: () => onРаздел("hotels") },
      {
        ключ: "restaurants",
        заголовок: t("home_restaurants"),
        ...число(рестораны.length),
        go: () => onРаздел("restaurants"),
      },
      { ключ: "bars", заголовок: t("ex_bars"), ...число(бары.length), go: () => onРаздел("bars") },
      { ключ: "museums", заголовок: t("f_museums"), ...число(музеи.length), go: () => onРаздел("museums") },
      { ключ: "places", заголовок: t("ex_sights"), ...число(места.length), go: () => onРаздел("places") },
      { ключ: "transport", заголовок: t("home_transport"), под: t("home_transport_sub"), go: onTransport },
      {
        ключ: "excursions",
        заголовок: t("ex_excursions"),
        ...число(экскурсии.length),
        go: () => onРаздел("excursions"),
      },
      { ключ: "ai", заголовок: t("ex_ai"), под: t("ex_ai_sub"), go: () => onРаздел("ai") },
      { ключ: "routes", заголовок: t("home_routes"), под: t("ex_routes_sub"), go: () => onTab("map") },
      { ключ: "tips", заголовок: t("ex_tips"), под: t("home_practical_sub"), go: onPractical },
      // Магазин eSIM живёт в «Полезном» → «Связь». Отдельная плитка — потому
      // что внутри памятки его не находили.
      { ключ: "esim", заголовок: t("ex_esim"), под: t("ex_esim_sub"), go: onEsim },
      // Скачивание городов для офлайна живёт внизу «Аудио» — туда его и
      // не находили. Плитка ведёт прямо к списку городов.
      {
        ключ: "offline",
        заголовок: t("ex_offline"),
        под: t("ex_offline_sub"),
        go: () => {
          onTab("audio");
          setTimeout(
            () =>
              document
                .getElementById("offline-packs")
                ?.scrollIntoView({ behavior: "smooth", block: "start" }),
            450,
          );
        },
      },
      // Заглушка на будущее: настоящей 3D/VR-реконструкции городов ещё нет,
      // но место в конце сетки зарезервировано — когда она появится, здесь
      // достаточно будет заменить скоро на go с настоящим разделом.
      { ключ: "vr", заголовок: t("ex_vr"), под: t("ex_vr_sub"), скоро: true, go: () => {} },
      // Фото-гид и переводчик с камеры работают на Claude: пока на
      // сервере нет ключа, плитки честно помечены «скоро».
      {
        ключ: "photo",
        заголовок: t("ex_photo"),
        под: t("ex_photo_sub"),
        скоро: !фотоИИ,
        go: () => onРаздел("photo"),
      },
      {
        ключ: "translate",
        заголовок: t("ex_translate"),
        под: t("ex_translate_sub"),
        скоро: !фотоИИ,
        go: () => onРаздел("translate"),
      },
    ];
    const по = (ключ: string) => плитки.find((п) => п.ключ === ключ)!;
    // Сквозной номер для «лесенки» появления через все группы.
    let порядок = 0;
    const заголовокГруппы = (ключ: TKey, метка: string) => (
      <h2
        className="mb-2.5 flex items-center gap-2 text-base font-bold"
        style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
      >
        {/* Цветная метка группы — того же цвета, что свечение в её плитках. */}
        <span className="h-4 w-1 rounded-full" style={{ background: метка }} />
        {t(ключ)}
      </h2>
    );
    const группа = (г: (typeof ГРУППЫ)[number], номерГруппы: number) => (
      <section key={г.заголовок} className="mb-5" data-tour={номерГруппы === 0 ? "tiles" : undefined}>
        {заголовокГруппы(г.заголовок, г.метка)}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {г.ключи.map((ключ, i) => (
            <Плитка
              key={ключ}
              плитка={по(ключ)}
              номер={порядок++}
              lang={lang}
              // Нечётная последняя плитка на телефоне — во всю ширину,
              // иначе рядом с ней зияла бы дыра.
              широкая={г.ключи.length % 2 === 1 && i === г.ключи.length - 1}
              тон={г.тон}
            />
          ))}
        </div>
      </section>
    );
    return (
      <div className="flex flex-col h-full" style={{ background: CREAM }}>
        <Шапка
          кикер="HelloUZ"
          заголовок={выбран ? трК(выбран.name) : t("explore_title")}
          подзаголовок={выбран ? трК(выбран.sub) : undefined}
          фон={фон}
          высокая
          логотип
        >
          {чипыГородов}
        </Шапка>
        <div className="flex-1 overflow-y-auto hide-scroll p-4">
          {/*
            Порядок — по тому, что турист ищет чаще: сперва места — что
            посмотреть и лента красивых, — за ними ИИ-гид, дальше жильё и еда, потом
            дорога со связью, помощники с камерой. Справочное — о стране и о
            том, как пользоваться приложением, — ниже, а «скоро» — в самом
            конце: оно не должно отнимать место у работающего.

            Двенадцать одинаковых плиток подряд глаз не различает, поэтому
            они разложены по смыслу. Две колонки на телефоне и планшете,
            четыре — на широком экране. Раздел, где в выбранном городе
            пусто, приглушён, но нажимается — внутри можно сменить город.
          */}
          {группа(ГРУППЫ[0], 0)}
          <ЛентаКрасивых места={красивые} onPlace={onPlace} onВсе={() => onРаздел("scenic")} />
          <КарточкаИИ onClick={по("ai").go} />
          {ГРУППЫ.slice(1, 4).map((г, i) => группа(г, i + 1))}

          <section className="mb-5">
            {заголовокГруппы("ex_group_info", "var(--muted)")}
            <БаннерТуризм onClick={() => onРаздел("tourism")} />
            <КакПользоваться />
          </section>

          {группа(ГРУППЫ[4], 4)}

          <div className="mt-4">
            <AdInline isPremium={isPremium} cities={город ? [город] : рядом ? [рядом] : undefined} />
          </div>
        </div>
      </div>
    );
  }

  const заголовки: Record<РазделОбзора, TKey> = {
    scenic: "ex_scenic",
    cities: "ex_cities",
    places: "ex_sights",
    museums: "f_museums",
    hotels: "ex_stay",
    restaurants: "home_restaurants",
    bars: "ex_bars",
    excursions: "ex_excursions",
    ai: "ex_ai",
    tourism: "tour_title",
    translate: "ex_translate",
    photo: "ex_photo",
  };
  // У ИИ-помощников город ни при чём — чипы городов им не нужны.
  const безГородов =
    раздел === "cities" || раздел === "tourism" || раздел === "translate" || раздел === "photo";
  const назад = () => onРаздел(undefined);

  // Чат занимает экран целиком и прокручивается сам: общая прокрутка
  // раздела увела бы поле ввода за край.
  if (раздел === "ai") {
    return (
      <div className="flex flex-col h-full" style={{ background: CREAM }}>
        {/* Фон шапки — дети, что встречали при входе: показывают на
            телефон, как бы зовут спросить. Кадр держится за их лица. */}
        <Шапка
          кикер="HelloUZ"
          заголовок={t("ex_ai")}
          фон={{
            кадры: ["/videos/kids-hello.webp"],
            видео: "/videos/kids-phone.mp4",
            alt: "HelloUZ",
            позиция: "center 33%",
            светлый: true,
          }}
          onBack={назад}
        />
        <AiGuide />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: CREAM }}>
      <Шапка кикер="HelloUZ" заголовок={t(заголовки[раздел])} фон={фон} onBack={назад}>
        {!безГородов && чипыГородов}
      </Шапка>
      <div className="flex-1 overflow-y-auto hide-scroll p-4">
        {раздел === "cities" && (
          <СписокГородов
            рядом={рядом}
            onВыбор={(имя) => {
              onГород(имя);
              onРаздел(undefined);
            }}
          />
        )}
        {раздел === "places" && <СписокМест места={места} onPlace={onPlace} сброс={сброс} />}
        {раздел === "scenic" && <СписокМест места={красивые} onPlace={onPlace} сброс={сброс} безТипов />}
        {раздел === "museums" && <СписокМест места={музеи} onPlace={onPlace} сброс={сброс} безТипов />}
        {раздел === "hotels" && <СписокОтелей отели={отели} onHotel={onHotel} сброс={сброс} />}
        {раздел === "restaurants" && (
          <СписокРесторанов рестораны={рестораны} onRestaurant={onRestaurant} сброс={сброс} />
        )}
        {раздел === "bars" && <СписокРесторанов рестораны={бары} onRestaurant={onRestaurant} сброс={сброс} />}
        {раздел === "tourism" && <Туризм />}
        {раздел === "translate" && <ПереводчикФото />}
        {раздел === "photo" && <ПереводчикФото режим="guide" />}
        {раздел === "excursions" && <СписокЭкскурсий туры={экскурсии} onRoute={onRoute} сброс={сброс} />}
      </div>
    </div>
  );
}

/** Группы плиток на экране HelloUZ. ИИ-гид стоит отдельно, над ними. */
const ГРУППЫ: { заголовок: TKey; ключи: string[]; тон: string; метка: string }[] = [
  {
    заголовок: "ex_group_see",
    ключи: ["places", "museums", "excursions", "routes"],
    тон: "var(--accent-soft)",
    метка: "var(--accent)",
  },
  {
    заголовок: "ex_group_stay",
    ключи: ["hotels", "restaurants", "bars"],
    тон: "var(--accent-2-soft)",
    метка: "var(--accent-2)",
  },
  {
    заголовок: "ex_group_road",
    ключи: ["transport", "esim", "offline", "tips", "cities"],
    тон: "rgba(96, 165, 250, 0.14)",
    метка: "#60A5FA",
  },
  // Помощники на ИИ: фото-гид и переводчик с камеры.
  {
    заголовок: "ex_group_ai",
    ключи: ["photo", "translate"],
    тон: "rgba(233, 196, 106, 0.2)",
    метка: GOLD,
  },
  // Будущие разделы отдельной группой: их не спутать с работающими.
  {
    заголовок: "ex_group_soon",
    ключи: ["vr"],
    тон: "var(--accent-soft)",
    метка: "var(--accent)",
  },
];

/**
 * ИИ-гид — самая сильная функция приложения, поэтому он не плитка среди
 * прочих, а большая карточка над ними: в фирменном градиенте, с роботом
 * и кнопкой. Кнопка золотая, как главные кнопки приложения.
 */
function КарточкаИИ({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return (
    <button
      onClick={onClick}
      data-tour="ai"
      className="tile-in group relative mb-5 flex min-h-[140px] w-full items-center overflow-hidden rounded-[22px] p-4 text-left transition-transform duration-150 active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT_FILL})`,
        boxShadow: `0 12px 28px -14px ${GLOW}`,
      }}
    >
      <div className="relative z-10 max-w-[62%]">
        <p
          className="text-lg font-bold leading-tight text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("ex_ai_card_title")}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-white/75">{t("ex_ai_card_sub")}</p>
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{ background: GOLD, color: ON_GOLD }}
        >
          ✨ {t("ex_ai_card_cta")}
        </span>
      </div>
      {/* Робот живой: машет и листает карту. Видео снято на цвете карточки,
          края растворяются маской — прямоугольника кадра не видно. */}
      <video
        src="/videos/ai-robot.mp4"
        poster="/videos/ai-robot.webp"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="robot-live pointer-events-none absolute -bottom-[6%] right-0 w-[46%] max-w-[200px] select-none transition-transform duration-300 group-hover:scale-105"
        style={{
          maskImage: "radial-gradient(closest-side, #000 72%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(closest-side, #000 72%, transparent 100%)",
        }}
      />
      <img
        src="/tiles/ai.webp"
        alt=""
        draggable={false}
        className="robot-still pointer-events-none absolute -bottom-[12%] -right-[3%] w-[44%] max-w-[190px] select-none object-contain"
      />
    </button>
  );
}

/**
 * Вход в раздел «Туризм Узбекистана» — узкая полоса под карточкой
 * ИИ-гида: заметна, но не спорит с ним за внимание.
 */
function БаннерТуризм({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return (
    <button
      onClick={onClick}
      className="tile-in mb-5 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-transform duration-150 active:scale-[0.98]"
      style={{ background: SURFACE, borderColor: BORDER }}
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: ACCENT_SOFT }}
      >
        <ФлагУз ширина={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
          {t("tour_banner_title")}
        </span>
        <span className="block truncate text-[11px]" style={{ color: MUTED }}>
          {t("tour_banner_sub")}
        </span>
      </span>
      <svg
        className="rtl-flip flex-shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={GREEN}
        strokeWidth="2.5"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

/** «Как пользоваться» — те же дети, что встречали при входе, и их обучение. */
function КакПользоваться() {
  const { t } = useT();
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("hellouz:tour"))}
      className="tile-in mb-5 flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-0 text-left transition-transform duration-150 active:scale-[0.98]"
      style={{ background: SURFACE, borderColor: BORDER }}
    >
      <img
        src="/videos/kids-hello.webp"
        alt=""
        className="h-16 w-20 flex-shrink-0 object-cover"
        style={{ objectPosition: "center 42%" }}
      />
      <span className="min-w-0 flex-1 py-3">
        <span className="block text-sm font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
          🎓 {t("ex_howto_title")}
        </span>
        <span className="block truncate text-[11px]" style={{ color: MUTED }}>
          {t("ex_howto_sub")}
        </span>
      </span>
      <svg
        className="rtl-flip mr-3 flex-shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={GREEN}
        strokeWidth="2.5"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

/**
 * Лента «Красивые места»: крупные фото с прокруткой вбок — горы, озёра,
 * ущелья. Фото здесь важнее текста, поэтому карточки высокие.
 */
function ЛентаКрасивых({
  места,
  onPlace,
  onВсе,
}: {
  места: Place[];
  onPlace: (p: Place) => void;
  onВсе: () => void;
}) {
  const { t, трК } = useT();
  if (места.length === 0) return null;
  return (
    <section className="mb-5" data-tour="scenic">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <h2
            className="flex items-center gap-2 text-base font-bold"
            style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
          >
            <span className="h-4 w-1 rounded-full" style={{ background: "#3f9b52" }} />
            {t("ex_scenic")}
          </h2>
          <p className="ml-3 text-[11px]" style={{ color: MUTED }}>
            {t("ex_scenic_sub")}
          </p>
        </div>
        <button onClick={onВсе} className="rounded-full px-3 py-1 text-xs font-bold" style={{ color: GREEN }}>
          {t("ex_all")} · {места.length}
        </button>
      </div>
      <div className="hide-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {места.slice(0, 12).map((p) => (
          <button
            key={p.id}
            onClick={() => onPlace(p)}
            className="lazy-card relative h-56 w-44 flex-shrink-0 overflow-hidden rounded-2xl text-left shadow-sm transition-transform duration-150 active:scale-[0.98]"
          >
            <img src={p.img} alt={p.name} loading="lazy" className="skel h-full w-full object-cover" />
            <span
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 55%)" }}
            />
            <span className="absolute bottom-0 left-0 right-0 p-3">
              <span className="block text-sm font-bold leading-tight text-white">{p.name}</span>
              <span className="mt-0.5 block text-[10px] text-white/75">📍 {трК(p.city)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

type ПлиткаДанные = {
  ключ: string;
  заголовок: string;
  под: string;
  пусто?: boolean;
  /** Раздела ещё нет — плитка неактивна и помечена «В разработке». */
  скоро?: boolean;
  go: () => void;
};

/**
 * Плитка раздела: название слева сверху, иллюстрация в правом нижнем
 * углу. Картинка чуть выходит за край и обрезается скруглением — так она
 * выглядит частью карточки, а не наклейкой. Фон у иллюстраций прозрачный,
 * поэтому в тёмной теме плитка просто темнеет.
 *
 * Длинные слова («Достопримечательности») переносит браузер по правилам
 * языка: для этого у текста стоит lang. Словаря переносов нет у части
 * браузеров (Chromium на Linux, некоторые Android) — там слово резалось
 * где попало, поэтому в самых длинных подписях словаря стоят мягкие
 * переносы (\u00AD) по слогам.
 */
function Плитка({
  плитка,
  номер,
  lang,
  широкая = false,
  тон,
}: {
  плитка: ПлиткаДанные;
  номер: number;
  lang: string;
  /** Цвет мягкого свечения за иллюстрацией — свой у каждой группы. */
  тон?: string;
  /** Во всю ширину в две колонки — для нечётной последней плитки группы. */
  широкая?: boolean;
}) {
  const { t } = useT();
  return (
    <button
      onClick={плитка.скоро ? undefined : плитка.go}
      // aria-disabled, а не disabled: карточка остаётся видна и читаема
      // экранным диктором как «скоро», а не пропадает из фокуса совсем.
      aria-disabled={плитка.скоро}
      className={`tile-in group relative flex h-[130px] flex-col sm:h-[160px] items-start justify-start overflow-hidden rounded-[20px] border p-3.5 text-left transition-transform duration-150 active:scale-[0.97] ${
        широкая ? "col-span-2 lg:col-span-1" : ""
      }`}
      style={{
        // Будущий раздел чуть подкрашен фирменной бирюзой в углу: видно,
        // что он особенный, но не кричит поверх соседних плиток.
        // Мягкое пятно света за иллюстрацией: плитка кажется объёмной, а
        // у каждой группы свой оттенок. Будущий раздел — ещё и с бирюзой
        // по диагонали: видно, что он особенный.
        background: плитка.скоро
          ? `radial-gradient(circle at 88% 82%, ${
              тон ?? ACCENT_SOFT
            }, transparent 58%), linear-gradient(150deg, ${SURFACE} 55%, ${ACCENT_SOFT})`
          : `radial-gradient(circle at 88% 82%, ${тон ?? ACCENT_SOFT}, transparent 58%), ${SURFACE}`,
        borderColor: BORDER,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        opacity: плитка.пусто ? 0.6 : 1,
        cursor: плитка.скоро ? "default" : "pointer",
        animationDelay: `${номер * 45}ms`,
      }}
    >
      <p
        lang={lang}
        className="relative z-10 text-[15px] font-bold leading-tight"
        style={{
          color: TEXT,
          fontFamily: "var(--font-heading)",
          hyphens: "auto",
        }}
      >
        {плитка.заголовок}
      </p>
      <p
        lang={lang}
        className={`relative z-10 mt-1 text-[10px] leading-snug ${
          плитка.скоро ? "line-clamp-3 max-w-[62%]" : "line-clamp-2 max-w-[55%]"
        }`}
        style={{ color: MUTED, hyphens: "auto" }}
      >
        {плитка.под}
      </p>
      {плитка.скоро && (
        // Мягкая метка в цветах бренда вместо яркой жёлтой плашки в углу:
        // читается как «готовим», а не как предупреждение. Прижата к низу
        // слева — так её не перекрывает иллюстрация справа.
        <span
          className="absolute bottom-3 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: ACCENT_SOFT, color: GREEN }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: GREEN }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
          </span>
          {t("ex_soon_badge")}
        </span>
      )}
      {/* У ИИ-помощников своя рисованная иллюстрация — и пока они «скоро»,
          и когда уже работают. */}
      {плитка.скоро || РИСОВАННЫЕ.has(плитка.ключ) ? (
        <ИллюстрацияСкоро ключ={плитка.ключ} широкая={широкая} />
      ) : (
        <>
          <img
            src={`/tiles/${плитка.ключ}.webp`}
            alt=""
            loading="lazy"
            draggable={false}
            className={`pointer-events-none absolute -bottom-[10%] -right-[8%] aspect-square select-none object-contain transition-transform duration-300 group-hover:scale-105 ${
              широкая ? "w-[34%] sm:w-[24%] lg:w-[60%]" : "w-[60%] sm:w-[46%] lg:w-[60%]"
            } ${ЖИВЫЕ_ПЛИТКИ.has(плитка.ключ) ? "tile-still" : ""}`}
          />
          {/* Живая версия: снята на белом, «умножение» растворяет белый в
              подсветке плитки. В тёмной теме белый так не растворить —
              там остаётся картинка (см. .tile-live в globals.css). */}
          {ЖИВЫЕ_ПЛИТКИ.has(плитка.ключ) && (
            <video
              src={`/videos/tiles/${плитка.ключ}.mp4`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              className={`tile-live pointer-events-none absolute -bottom-[10%] -right-[8%] aspect-square select-none object-contain transition-transform duration-300 group-hover:scale-105 ${
                широкая ? "w-[34%] sm:w-[24%] lg:w-[60%]" : "w-[60%] sm:w-[46%] lg:w-[60%]"
              }`}
              style={{ mixBlendMode: "multiply" }}
            />
          )}
        </>
      )}
    </button>
  );
}

/**
 * Иллюстрация к плитке «VR города»: очки в фирменной бирюзе, а в стёклах —
 * купол и минарет на закатном небе, то есть «город внутри очков». Рисуем
 * SVG, а не берём картинку: так она одинаково чёткая на любом экране и сама
 * по себе объясняет раздел. Угол тот же, что у иллюстраций соседних
 * плиток, но она чуть меньше и приподнята: под ней метка «Скоро».
 *
 * id градиентов уникальны на экземпляр (useId): одинаковые id в SVG на
 * одной странице перебивают друг друга.
 */
function ИллюстрацияVR({ широкая }: { широкая: boolean }) {
  const id = useId().replace(/:/g, "");
  const линза = (cx: number) => (
    <g>
      <circle cx={cx} cy="60" r="15" fill={`url(#${id}sky)`} />
      <g clipPath={`url(#${id}c${cx})`}>
        {/* Солнце, а под ним силуэт: мечеть с куполом и тонкий минарет. */}
        <circle cx={cx - 7} cy="53" r="3" fill="#FFF4D6" />
        <g fill="#0B4F49">
          <rect x={cx - 15} y="70" width="30" height="6" />
          <rect x={cx - 9} y="63" width="12" height="8" />
          <path d={`M${cx - 8} 63.5 a5 5 0 0 1 10 0 Z`} />
          <rect x={cx - 3.5} y="55.5" width="1" height="3.5" />
          <rect x={cx + 6} y="55" width="3" height="16" />
          <path d={`M${cx + 5.5} 55 l2 -3.5 l2 3.5 Z`} />
        </g>
      </g>
      <circle cx={cx} cy="60" r="15" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.5" />
      <path
        d={`M${cx - 9} 52 a11 11 0 0 1 8 -5`}
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
  return (
    <svg
      aria-hidden
      viewBox="0 6 120 86"
      className={`pointer-events-none absolute bottom-[22%] right-[3%] select-none transition-transform duration-300 group-hover:scale-105 ${ширинаСкоро(
        широкая,
      )}`}
      style={{ filter: "drop-shadow(0 6px 8px rgba(7,104,95,0.25))", transform: "rotate(-8deg)" }}
    >
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FD0C6" />
          <stop offset="0.55" stopColor="#0FB3AC" />
          <stop offset="1" stopColor="#07685F" />
        </linearGradient>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6D58A" />
          <stop offset="1" stopColor="#E9955A" />
        </linearGradient>
        <clipPath id={`${id}c40`}>
          <circle cx="40" cy="60" r="15" />
        </clipPath>
        <clipPath id={`${id}c80`}>
          <circle cx="80" cy="60" r="15" />
        </clipPath>
      </defs>
      {/* Ремешок за корпусом. */}
      <rect x="2" y="52" width="116" height="14" rx="7" fill="#0b4f49" />
      {/* Корпус очков. */}
      <rect x="14" y="36" width="92" height="48" rx="20" fill={`url(#${id}body)`} />
      <path
        d="M26 40 h68 a14 14 0 0 1 8 3"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Переносица. */}
      <path d="M51 84 q9 -11 18 0 Z" fill="#07685F" />
      {линза(40)}
      {линза(80)}
      {/* Искры — «что-то новое». */}
      <path d="M100 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill={GOLD} />
      <path d="M86 12 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill={GOLD} opacity="0.8" />
    </svg>
  );
}

/** Иллюстрация будущего раздела — по ключу плитки. */
/** Плитки, у которых есть живая версия — видео в public/videos/tiles. */
const ЖИВЫЕ_ПЛИТКИ = new Set(["museums", "places", "restaurants", "bars", "routes", "excursions", "hotels"]);
/** Плитки с иллюстрацией-SVG вместо картинки из public/tiles. */
const РИСОВАННЫЕ = new Set(["photo", "translate", "vr", "esim", "offline"]);

function ИллюстрацияСкоро({ ключ, широкая }: { ключ: string; широкая: boolean }) {
  if (ключ === "photo") return <ИллюстрацияФото широкая={широкая} />;
  if (ключ === "translate") return <ИллюстрацияПереводчик широкая={широкая} />;
  if (ключ === "esim") return <ИллюстрацияEsim широкая={широкая} />;
  if (ключ === "offline") return <ИллюстрацияОфлайн широкая={широкая} />;
  return <ИллюстрацияVR широкая={широкая} />;
}

/** Общая рамка иллюстраций «скоро»: тот же угол и размер, что у VR. */
/** Ширина иллюстрации «скоро»: на широкой плитке — меньше, иначе она обрезается. */
const ширинаСкоро = (широкая: boolean) => (широкая ? "w-[32%] sm:w-[24%] lg:w-[50%]" : "w-[50%]");

function СвгСкоро({ children, широкая }: { children: React.ReactNode; широкая: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 6 120 86"
      className={`pointer-events-none absolute bottom-[22%] right-[3%] select-none transition-transform duration-300 group-hover:scale-105 ${ширинаСкоро(
        широкая,
      )}`}
      style={{ filter: "drop-shadow(0 6px 8px rgba(7,104,95,0.25))", transform: "rotate(-8deg)" }}
    >
      {children}
    </svg>
  );
}

/**
 * Фото-гид: камера смотрит на купол и минарет, а справа — звуковые волны:
 * ИИ рассказывает о снятом вслух.
 */
function ИллюстрацияФото({ широкая }: { широкая: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <СвгСкоро широкая={широкая}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FD0C6" />
          <stop offset="0.55" stopColor="#0FB3AC" />
          <stop offset="1" stopColor="#07685F" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6D58A" />
          <stop offset="1" stopColor="#E9955A" />
        </linearGradient>
        <clipPath id={`${id}l`}>
          <circle cx="48" cy="58" r="16" />
        </clipPath>
      </defs>
      {/* Корпус камеры и видоискатель. */}
      <rect x="30" y="28" width="22" height="10" rx="4" fill="#07685F" />
      <rect x="12" y="34" width="72" height="50" rx="14" fill={`url(#${id}b)`} />
      <path d="M22 40 h52" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {/* Объектив, а в нём — купол и минарет на закате. */}
      <circle cx="48" cy="58" r="19" fill="#0b4f49" />
      <circle cx="48" cy="58" r="16" fill={`url(#${id}s)`} />
      <g clipPath={`url(#${id}l)`} fill="#0B4F49">
        <rect x="32" y="66" width="32" height="8" />
        <rect x="40" y="59" width="13" height="8" />
        <path d="M40.5 59.5 a6 6 0 0 1 12 0 Z" />
        <rect x="56" y="50" width="3.5" height="18" />
        <path d="M55.5 50 l2.2 -4 l2.2 4 Z" />
      </g>
      <circle cx="48" cy="58" r="16" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.5" />
      {/* Вспышка. */}
      <rect x="68" y="40" width="9" height="5" rx="2" fill={GOLD} />
      {/* Звук: ИИ рассказывает о снятом. */}
      <g fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round">
        <path d="M92 50 a10 10 0 0 1 0 16" />
        <path d="M99 44 a18 18 0 0 1 0 28" opacity="0.7" />
        <path d="M106 38 a26 26 0 0 1 0 40" opacity="0.45" />
      </g>
    </СвгСкоро>
  );
}

/**
 * eSIM: бирюзовая сим-карта с золотым чипом, над ней — волны сигнала.
 */
function ИллюстрацияEsim({ широкая }: { широкая: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <СвгСкоро широкая={широкая}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FD0C6" />
          <stop offset="0.55" stopColor="#0FB3AC" />
          <stop offset="1" stopColor="#07685F" />
        </linearGradient>
      </defs>
      {/* Карта со срезанным углом, как у настоящей SIM. */}
      <path
        d="M20 30 h38 l14 14 v42 a6 6 0 0 1 -6 6 h-46 a6 6 0 0 1 -6 -6 v-50 a6 6 0 0 1 6 -6 Z"
        fill={`url(#${id}c)`}
      />
      <path d="M26 38 h28" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {/* Чип. */}
      <rect x="28" y="52" width="30" height="24" rx="5" fill={GOLD} />
      <g stroke="#B8892F" strokeWidth="1.6">
        <path d="M43 52 v24" />
        <path d="M28 60 h30" />
        <path d="M28 68 h30" />
      </g>
      {/* Сигнал. */}
      <g fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round">
        <path d="M84 52 a10 10 0 0 1 14 0" />
        <path d="M78 45 a19 19 0 0 1 26 0" opacity="0.7" />
        <path d="M72 38 a28 28 0 0 1 38 0" opacity="0.45" />
      </g>
      <circle cx="91" cy="59" r="3.5" fill={GOLD} />
    </СвгСкоро>
  );
}

/**
 * Без интернета: телефон, в который «падает» город — золотая стрелка
 * вниз, на экране купол, рядом зачёркнутый сигнал.
 */
function ИллюстрацияОфлайн({ широкая }: { широкая: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <СвгСкоро широкая={широкая}>
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FD0C6" />
          <stop offset="0.55" stopColor="#0FB3AC" />
          <stop offset="1" stopColor="#07685F" />
        </linearGradient>
      </defs>
      {/* Телефон. */}
      <rect x="22" y="24" width="44" height="70" rx="9" fill={`url(#${id}p)`} />
      <rect x="27" y="31" width="34" height="50" rx="4" fill="#0B4F49" />
      <rect x="38" y="27" width="12" height="2.5" rx="1.2" fill="#ffffff" fillOpacity="0.5" />
      {/* На экране — купол, город уже внутри. */}
      <g fill={GOLD}>
        <rect x="33" y="64" width="22" height="9" />
        <path d="M36 64 a8 8 0 0 1 16 0 Z" />
        <rect x="56" y="54" width="3" height="19" opacity="0.85" />
      </g>
      {/* Стрелка вниз: скачать. */}
      <g stroke={GOLD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M44 36 v14" />
        <path d="M38 45 l6 6 l6 -6" />
      </g>
      {/* Сигнал перечёркнут: связь не нужна. */}
      <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
        <path d="M80 56 a10 10 0 0 1 14 0" />
        <path d="M74 49 a19 19 0 0 1 26 0" opacity="0.7" />
      </g>
      <circle cx="87" cy="63" r="3" fill="#ffffff" />
      <path d="M72 70 L102 40" stroke={GOLD} strokeWidth="3.5" strokeLinecap="round" />
    </СвгСкоро>
  );
}

/**
 * Переводчик: узбекское слово на бирюзовом облачке переходит в перевод на
 * белом — как меню, которое вдруг стало понятным.
 */
function ИллюстрацияПереводчик({ широкая }: { широкая: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <СвгСкоро широкая={широкая}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FD0C6" />
          <stop offset="0.55" stopColor="#0FB3AC" />
          <stop offset="1" stopColor="#07685F" />
        </linearGradient>
      </defs>
      {/* Облачко с узбекским словом. */}
      <path
        d="M10 22 h56 a10 10 0 0 1 10 10 v22 a10 10 0 0 1 -10 10 h-34 l-12 10 v-10 h-10 a10 10 0 0 1 -10 -10 v-22 a10 10 0 0 1 10 -10 Z"
        fill={`url(#${id}b)`}
      />
      <text
        x="38"
        y="50"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="var(--font-heading), sans-serif"
      >
        Oʻ
      </text>
      {/* Облачко перевода. */}
      <path
        d="M54 44 h54 a10 10 0 0 1 10 10 v22 a10 10 0 0 1 -10 10 h-10 v10 l-12 -10 h-32 a10 10 0 0 1 -10 -10 v-22 a10 10 0 0 1 10 -10 Z"
        fill="#ffffff"
        stroke="#0FB3AC"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <text
        x="81"
        y="72"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="#07685F"
        fontFamily="var(--font-heading), sans-serif"
      >
        Aa
      </text>
      {/* Искры — «перевод случился». */}
      <path d="M104 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill={GOLD} />
      <path d="M92 16 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill={GOLD} opacity="0.8" />
    </СвгСкоро>
  );
}

type Фон = {
  кадры: string[];
  видео?: string;
  alt: string;
  позиция?: string;
  /** Светлый фон (дети на бежевом): затемняем только низ под надписью. */
  светлый?: boolean;
};

/**
 * Шапка экрана: живой фон (ролик или кадры города), подпись, заголовок и
 * ряд чипов. На плитках она выше — там фон и есть украшение экрана; в
 * списке ниже, чтобы не отнимать место у карточек. Пока ролик грузится
 * (или кадров нет вовсе), под ним фирменная бирюза.
 */
function Шапка({
  кикер,
  заголовок,
  подзаголовок,
  фон,
  высокая = false,
  логотип = false,
  onBack,
  children,
}: {
  кикер: string;
  заголовок: string;
  подзаголовок?: string;
  фон: Фон;
  высокая?: boolean;
  /** Знак HelloUZ над заголовком — на главном экране раздела. */
  логотип?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}) {
  const { t } = useT();
  const естьФон = фон.кадры.length > 0 || Boolean(фон.видео);
  return (
    <div
      className={`relative overflow-hidden border-b ${
        фон.светлый ? "pt-44 pb-4" : высокая ? "pt-28 pb-4" : "pt-14 pb-3"
      }`}
      style={{ borderColor: BORDER, background: ACCENT_FILL }}
    >
      {естьФон ? (
        <>
          {/* key — чтобы при смене города ролик или кадры начинались с первого кадра. */}
          <CityReel key={фон.alt} кадры={фон.кадры} видео={фон.видео} alt={фон.alt} позиция={фон.позиция} />
          <div
            className="absolute inset-0"
            style={{
              background: фон.светлый
                ? "linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.55) 100%)"
                : "linear-gradient(to bottom,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.65) 100%)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 opacity-20">
          <AnimatedBg />
        </div>
      )}
      <div className="relative z-10 px-4">
        <div className="mb-3 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              aria-label={t("common_back")}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl active:scale-95"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" }}
            >
              <svg
                className="rtl-flip"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            {логотип ? (
              <div className="mb-1.5 flex items-center gap-1.5">
                <LogoMark size={20} tone="#ffffff" />
                <Wordmark size={13} light />
              </div>
            ) : (
              <p
                className="text-[9px] font-bold mb-0.5 uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {кикер}
              </p>
            )}
            <h1
              className="truncate text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {заголовок}
            </h1>
            {подзаголовок && <p className="truncate text-[11px] text-white/75">{подзаголовок}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Пустой раздел. Чаще всего пусто не вообще, а в выбранном городе —
 * поэтому рядом сразу кнопка снять город, а не только грустная надпись.
 */
function Пусто({ сброс }: { сброс?: () => void }) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center sm:col-span-2 xl:col-span-3">
      <p className="text-sm" style={{ color: MUTED }}>
        {t("ex_soon")}
      </p>
      {сброс && (
        <button
          onClick={сброс}
          className="rounded-full px-4 py-2 text-xs font-semibold"
          style={{ background: SURFACE, color: GREEN, border: `1px solid ${BORDER}` }}
        >
          {t("ex_all_cities")} →
        </button>
      )}
    </div>
  );
}

/** Ряд чипов-фильтров внутри раздела: подтипы мест, виды гостиниц. */
function Чипы<T extends string>({
  варианты,
  выбран,
  onВыбор,
  перед,
}: {
  варианты: { значение: T; подпись: TKey }[];
  выбран: T;
  onВыбор: (v: T) => void;
  /** Что поставить в начало ряда — например, выбор сортировки. */
  перед?: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="-mx-4 mb-3 flex items-center gap-2 overflow-x-auto px-4 hide-scroll">
      {перед}
      {варианты.map((в) => (
        <button
          key={в.значение}
          onClick={() => onВыбор(в.значение)}
          className="flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
          style={
            выбран === в.значение
              ? { background: ACCENT_FILL, color: WHITE, borderColor: "transparent" }
              : { background: SURFACE, color: MUTED, borderColor: BORDER }
          }
        >
          {t(в.подпись)}
        </button>
      ))}
    </div>
  );
}

/** Карточки городов: выбор города возвращает к плиткам, уже отфильтрованным. */
function СписокГородов({ рядом, onВыбор }: { рядом: string | null; onВыбор: (имя: string) => void }) {
  const { CITIES, HOTELS, PLACES, RESTAURANTS } = useAppContent();
  const { t, трК } = useT();
  const города = [...CITIES].sort((a, b) => Number(b.name === рядом) - Number(a.name === рядом));
  if (города.length === 0) return <Пусто />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {города.map((c) => {
        const счёт = [
          ["🏛️", PLACES.filter((p) => p.city === c.name).length],
          ["🏨", HOTELS.filter((h) => h.city === c.name).length],
          ["🍽️", RESTAURANTS.filter((r) => r.city === c.name).length],
        ] as const;
        return (
          <button
            key={c.id}
            onClick={() => onВыбор(c.name)}
            className="relative h-32 w-full overflow-hidden rounded-2xl text-left shadow-sm active:scale-[0.98] transition-all"
          >
            <img src={c.img} alt={трК(c.name)} className="skel h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 65%)" }}
            />
            {c.name === рядом && (
              <span
                className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ background: GOLD, color: ON_GOLD }}
              >
                📍 {t("ex_near")}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  {трК(c.name)}
                </p>
                <p className="truncate text-[10px] text-white/70">{трК(c.sub)}</p>
              </div>
              <div className="flex flex-shrink-0 gap-1.5">
                {счёт.map(([эмодзи, n]) => (
                  <span
                    key={эмодзи}
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
                  >
                    {эмодзи} {n}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function СписокМест({
  места,
  onPlace,
  сброс,
  безТипов = false,
}: {
  места: Place[];
  onPlace: (p: Place) => void;
  сброс?: () => void;
  /** В «Музеях» подтип уже выбран плиткой — чипы там лишние. */
  безТипов?: boolean;
}) {
  const { t, трК } = useT();
  const погода = useWeather(); // настоящая погода города (Open-Meteo)
  const { pos } = useGeo(); // живое местоположение для расстояний
  const дист = useДистанция(); // км или мили — как выбрано в настройках
  const дг = useДеньги();
  // Значение типа остаётся русским: по нему сверяется тип места в
  // данных. Переводится только подпись на чипе.
  const [тип, setТип] = useState("Всё");
  const список = места.filter((p) => тип === "Всё" || (ТИПЫ_МЕСТ[тип] ?? []).includes(p.typeRu ?? p.type));
  // Первое место крупной карточкой — только в общем списке, не в подтипе.
  const главное = тип === "Всё" ? список[0] : undefined;
  const остальные = главное ? список.slice(1) : список;

  return (
    <>
      {!безТипов && <Чипы варианты={ТИПЫ} выбран={тип} onВыбор={setТип} />}
      {/*
        Сетка вместо столбца. На телефоне это по-прежнему один столбец,
        а на широком экране карточки встают рядом: иначе каждая
        растягивается через весь стол, и от неё остаётся полоска с
        картинкой в углу.
      */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {список.length === 0 && <Пусто сброс={сброс} />}
        {главное && (
          <button
            onClick={() => onPlace(главное)}
            className="w-full relative rounded-2xl overflow-hidden shadow-sm text-left active:scale-[0.98] sm:col-span-2 xl:col-span-3"
            style={{ height: 180 }}
          >
            <img src={главное.img} alt={главное.name} className="skel w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)" }}
            />
            <div className="absolute top-3 left-3">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: GOLD, color: ON_GOLD }}
              >
                ⭐ {t("feat_badge")}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>
                {главное.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <StarRow rating={главное.rating} onPhoto />
                <span className="text-white/70 text-xs">{трК(главное.city)}</span>
                <span className="text-white/70 text-xs">{дг.цена(главное.entry)}</span>
                {главное.audio && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: ACCENT_FILL, color: WHITE }}
                  >
                    🎧
                  </span>
                )}
                {(() => {
                  const w = погода.get(главное.city);
                  return w ? (
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(8px)",
                        color: WHITE,
                      }}
                    >
                      {w.icon} {w.temp}°C
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          </button>
        )}
        {остальные.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onPlace(p)}
            style={{ borderColor: BORDER, animationDelay: `${Math.min(i, 10) * 40}ms` }}
            className="tile-in w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]"
          >
            <div className="w-24 flex-shrink-0 bg-gray-100">
              <img
                src={p.img}
                alt={p.name}
                className="skel w-full h-full object-cover"
                style={{ height: 96 }}
              />
            </div>
            <div className="flex-1 py-3 pr-3 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge text={p.type} color={GREEN} />
                {p.audio && <Badge text="🎧" color={MUTED} />}
              </div>
              <p className="font-bold text-sm leading-tight" style={{ color: TEXT }}>
                {p.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                {трК(p.city)} ·{" "}
                {(() => {
                  const к = дистанцияКм(pos, p.nameRu ?? p.name, p.city);
                  return к != null ? дист.формат(к) : дист.изДанных(p.distance);
                })()}
              </p>
              <div className="flex items-center justify-between mt-2">
                <StarRow rating={p.rating} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: GREEN }}>
                    {дг.цена(p.entry)}
                  </span>
                  {(() => {
                    const w = погода.get(p.city);
                    return w ? (
                      <span className="text-[9px] font-semibold" style={{ color: MUTED }}>
                        {w.icon}
                        {w.temp}°
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

/** Виды гостиниц — чипами внутри раздела, а не отдельными плитками. */
const ВИДЫ_ГОСТИНИЦ: { значение: HotelKind | "all"; подпись: TKey }[] = [
  { значение: "all", подпись: "common_all" },
  { значение: "hotel", подпись: "hk_hotels" },
  { значение: "motel", подпись: "hk_motels" },
  { значение: "hostel", подпись: "hk_hostels" },
];

type Порядок = "рек" | "дешевле" | "дороже" | "рейтинг";

const ПОРЯДКИ: { значение: Порядок; подпись: TKey }[] = [
  { значение: "рек", подпись: "sort_recommended" },
  { значение: "дешевле", подпись: "sort_cheaper" },
  { значение: "дороже", подпись: "sort_pricier" },
  { значение: "рейтинг", подпись: "sort_rating" },
];

/** Цена из строки карточки: «$89» → 89, «$5–15» → 5. Нет цифр — null. */
function числоЦены(цена: string): number | null {
  const м = /\d+(?:[.,]\d+)?/.exec(цена.replace(/\s/g, ""));
  return м ? parseFloat(м[0].replace(",", ".")) : null;
}

/** Сортировка списка. Без цены — в конце: не делаем вид, что это дёшево. */
function упорядочить<T extends { price: string; rating: number }>(список: T[], порядок: Порядок): T[] {
  if (порядок === "рек") return список;
  const копия = [...список];
  if (порядок === "рейтинг") return копия.sort((a, b) => b.rating - a.rating);
  const знак = порядок === "дешевле" ? 1 : -1;
  return копия.sort((a, b) => {
    const ца = числоЦены(a.price);
    const цб = числоЦены(b.price);
    if (ца === null) return цб === null ? 0 : 1;
    if (цб === null) return -1;
    return (ца - цб) * знак;
  });
}

/** Выпадающий список «Сначала …» — компактно, рядом с чипами. */
function ВыборПорядка({ порядок, onПорядок }: { порядок: Порядок; onПорядок: (п: Порядок) => void }) {
  const { t } = useT();
  return (
    <label className="flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold" style={{ color: MUTED }}>
      ↕
      <select
        value={порядок}
        onChange={(e) => onПорядок(e.target.value as Порядок)}
        aria-label={t("sort_label")}
        className="rounded-full border px-2.5 py-1.5 text-xs font-semibold outline-none"
        style={{ background: SURFACE, color: TEXT, borderColor: BORDER }}
      >
        {ПОРЯДКИ.map((п) => (
          <option key={п.значение} value={п.значение}>
            {t(п.подпись)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Бюджет за ночь в долларах: цены в карточках гостиниц — в $. */
const БЮДЖЕТЫ: { значение: string; подпись: TKey; до: number }[] = [
  { значение: "any", подпись: "budget_any", до: Infinity },
  { значение: "50", подпись: "budget_50", до: 50 },
  { значение: "100", подпись: "budget_100", до: 100 },
];

function СписокОтелей({
  отели,
  onHotel,
  сброс,
}: {
  отели: Hotel[];
  onHotel: (h: Hotel) => void;
  сброс?: () => void;
}) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const [вид, setВид] = useState<HotelKind | "all">("all");
  const [порядок, setПорядок] = useState<Порядок>("рек");
  const [бюджет, setБюджет] = useState("any");
  const потолок = БЮДЖЕТЫ.find((б) => б.значение === бюджет)?.до ?? Infinity;
  // Без поля «вид» — обычный отель: так записи, заведённые до появления
  // видов, не пропадают из фильтра «Отели».
  const список = упорядочить(
    отели
      .filter((h) => вид === "all" || (h.kind ?? "hotel") === вид)
      .filter((h) => потолок === Infinity || (числоЦены(h.price) ?? Infinity) <= потолок),
    порядок,
  );
  return (
    <>
      <Чипы варианты={ВИДЫ_ГОСТИНИЦ} выбран={вид} onВыбор={setВид} />
      <Чипы
        варианты={БЮДЖЕТЫ}
        выбран={бюджет}
        onВыбор={setБюджет}
        перед={<ВыборПорядка порядок={порядок} onПорядок={setПорядок} />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {список.length === 0 && <Пусто сброс={сброс} />}
        {список.map((h, i) => (
          <button
            key={h.id}
            onClick={() => onHotel(h)}
            style={{ borderColor: BORDER, animationDelay: `${Math.min(i, 10) * 40}ms` }}
            className="tile-in w-full bg-white rounded-2xl overflow-hidden shadow-sm border text-left active:scale-[0.98] transition-all"
          >
            <div className="relative h-40">
              <img src={h.img} alt={h.name} className="skel w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)" }}
              />
              <div className="absolute top-3 left-3">
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: GOLD, color: ON_GOLD }}
                >
                  {h.tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                  {h.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRow rating={h.rating} onPhoto />
                  <span className="text-white/70 text-xs">{трК(h.city)}</span>
                </div>
              </div>
            </div>
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {h.facilities.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: CREAM, color: MUTED }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-base" style={{ color: GREEN }}>
                  {дг.цена(h.price)}
                </p>
                <p className="text-[9px]" style={{ color: MUTED }}>
                  {t("home_per_night")}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function СписокРесторанов({
  рестораны,
  onRestaurant,
  сброс,
}: {
  рестораны: Restaurant[];
  onRestaurant: (r: Restaurant) => void;
  сброс?: () => void;
}) {
  const { трК } = useT();
  const дг = useДеньги();
  const [толькоОткрытые, setТолькоОткрытые] = useState<"all" | "open">("all");
  const [порядок, setПорядок] = useState<Порядок>("рек");
  const список = упорядочить(
    толькоОткрытые === "open" ? рестораны.filter((r) => открытоСейчас(r.open)?.открыто) : рестораны,
    порядок,
  );
  return (
    <>
      <Чипы
        варианты={[
          { значение: "all" as const, подпись: "common_all" },
          { значение: "open" as const, подпись: "open_now" },
        ]}
        выбран={толькоОткрытые}
        onВыбор={setТолькоОткрытые}
        перед={<ВыборПорядка порядок={порядок} onПорядок={setПорядок} />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {список.length === 0 && <Пусто сброс={сброс} />}
        {список.map((r, i) => (
          <button
            key={r.id}
            onClick={() => onRestaurant(r)}
            style={{ borderColor: BORDER, animationDelay: `${Math.min(i, 10) * 40}ms` }}
            className="tile-in w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]"
          >
            <div className="w-24 flex-shrink-0 bg-gray-100">
              <img
                src={r.img}
                alt={r.name}
                className="skel w-full h-full object-cover"
                style={{ height: 96 }}
              />
            </div>
            <div className="flex-1 py-3 pr-3 min-w-0">
              <Badge text={r.cuisine} color={"#C1603A"} />
              <p className="font-bold text-sm leading-tight mt-1" style={{ color: TEXT }}>
                {r.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                {трК(r.city)} · {r.open}
              </p>
              <СтатусОткрыто часы={r.open} />
              <div className="flex items-center justify-between mt-2">
                <StarRow rating={r.rating} />
                <span className="text-xs font-bold" style={{ color: "#C1603A" }}>
                  {дг.цена(r.price)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * Экскурсии — туры с ценой, гидом и длительностью. Нажатие открывает
 * карточку маршрута со всеми остановками.
 */
function СписокЭкскурсий({
  туры,
  onRoute,
  сброс,
}: {
  туры: ManagedRoute[];
  onRoute: (r: Route) => void;
  сброс?: () => void;
}) {
  const { t, трК } = useT();
  const дг = useДеньги();
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {туры.length === 0 && <Пусто сброс={сброс} />}
      {туры.map((r, i) => (
        <button
          key={r.id}
          onClick={() => onRoute(r)}
          style={{ borderColor: BORDER, animationDelay: `${Math.min(i, 10) * 40}ms` }}
          className="tile-in w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]"
        >
          <div
            className="w-24 flex-shrink-0 flex items-center justify-center text-3xl"
            style={{ background: r.color, minHeight: 104 }}
          >
            {r.img ? <img src={r.img} alt={r.title} className="skel h-full w-full object-cover" /> : r.icon}
          </div>
          <div className="flex-1 py-3 pr-3 min-w-0">
            <Badge text={трК(r.badge)} color={GREEN} />
            <p className="font-bold text-sm leading-tight mt-1" style={{ color: TEXT }}>
              {трК(r.title)}
            </p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: MUTED }}>
              {[r.city && трК(r.city), трК(r.duration), r.guide && `${t("ex_guide")}: ${r.guide}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="flex items-center justify-between mt-2">
              {r.rating > 0 ? <StarRow rating={r.rating} /> : <span />}
              {r.price > 0 && (
                <span className="text-xs font-bold" style={{ color: GREEN }}>
                  {дг.цена(`$${r.price}`)}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ExploreScreen;
