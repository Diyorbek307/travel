import Image from "next/image";
import Link from "next/link";
import Icon, { type IconName } from "@/components/icon";
import LangSwitcher from "@/components/lang-switcher";
import PoiCard from "@/components/poi-card";
import { listCities, listFestivals, listPois, listTours, cityCovers, tourCovers } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getCurrentBatch, getForecast, weatherIcon } from "@/lib/weather";
import { currentLang } from "@/lib/server-lang";
import type { Category, Festival, Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

const QUICK: { href: string; icon: IconName; key: string }[] = [
  { href: "/map", icon: "landmark", key: "landmarks_short" },
  { href: "/explore", icon: "explore", key: "explore_short" },
  { href: "/assistant", icon: "sparkle", key: "assistant_title" },
  { href: "/planner", icon: "explore", key: "planner" },
  { href: "/scan", icon: "qr", key: "scan" },
  { href: "/sos", icon: "sos", key: "sos_short" },
];

/** Категории «где поесть» — те же, что в витрине города. */
const DINING: Category[] = ["restaurant", "cafe", "rest_zone"];

/**
 * Практическая информация из макета. Ключи, а не готовый текст: экран
 * трёхъязычный. Курса валюты здесь намеренно нет — в макете стояло
 * «$1 = 12 740 сум», а такая цифра устаревает за недели и врёт туристу.
 * Экстренные номера тоже не дублируются: они живут на экране SOS, и два
 * списка телефонов однажды разойдутся.
 */
const TIPS: { icon: IconName; key: string; href?: string }[] = [
  { icon: "ticket", key: "currency" },
  { icon: "sun", key: "climate" },
  { icon: "transport", key: "transport" },
  { icon: "restaurant", key: "food" },
  { icon: "qr", key: "sim" },
  { icon: "religious", key: "etiquette" },
  { icon: "sos", key: "sos", href: "/sos" },
];

const WHY: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "Надёжно", text: "Проверенные данные об объектах" },
  { icon: "headphones", title: "Удобно", text: "Аудиогид на вашем языке" },
  { icon: "download", title: "Офлайн", text: "Работает без интернета" },
  { icon: "heart", title: "С душой", text: "Сделано в Узбекистане" },
];

/** Главный экран: выбор города (п. 2.1 ТЗ) и быстрые действия. */
export default async function HomePage() {
  const lang = await currentLang();
  const cities = listCities(lang);
  const tours = listTours(lang).filter((x) => x.kind === "curated");
  const festivals = listFestivals(lang, 8);
  const allPois = listPois({ lang });
  const totalPois = allPois.length;

  // Плитки со счётчиками из макета. Числа считаются по базе, а не
  // вписаны руками: в прототипе стояло «500+ мест» при реальных 108,
  // и такая приписка — обещание, которого платформа не выполняет.
  const countByCategories = (cats: Category[]) =>
    allPois.filter((p) => cats.includes(p.category)).length;

  // Витрины из макета: главные объекты страны и места, где поесть.
  // Берём только со снимками — карточка-витрина без фотографии теряет смысл.
  const topPois = allPois.filter((p) => p.cover).slice(0, 10);
  const topDining = allPois
    .filter((p) => DINING.includes(p.category))
    .slice(0, 10);
  const stats: { href: string; icon: IconName; key: string; value: number }[] = [
    { href: "/map", icon: "landmark", key: "stat_places", value: totalPois },
    { href: "/routes", icon: "explore", key: "stat_routes", value: tours.length },
    {
      href: "/map?category=restaurant",
      icon: "restaurant",
      key: "stat_dining",
      value: countByCategories(["restaurant", "cafe", "rest_zone"]),
    },
    {
      href: "/map?category=hotel",
      icon: "hotel",
      key: "stat_stays",
      value: countByCategories(["hotel"]),
    },
  ];

  // Обложки берутся у главного объекта города и первой остановки маршрута:
  // отдельных снимков у них нет.
  const covers = cityCovers();
  const tourCover = tourCovers();

  // Погода для приветствия. Столица выбрана не произвольно: через Ташкент
  // прилетает большинство туристов, и подпись города рядом с цифрой
  // не даёт принять её за «погоду у вас».
  const capital = cities.find((c) => c.slug === "tashkent") ?? cities[0];
  const capitalWeather = capital
    ? await getForecast(capital.lat, capital.lon)
    : { days: [], now: null };

  // Погода по всем городам — одним запросом, а не четырнадцатью.
  const cityWeather = await getCurrentBatch(
    cities.map((c) => ({ lat: c.lat, lon: c.lon })),
  );

  // Сцена первого экрана. Отдельной фотографии страны у нас нет, поэтому
  // берётся снимок главного объекта Самарканда — Регистан узнаваем и им
  // Узбекистан представляют на любой обложке.
  const stage = covers.samarkand ?? Object.values(covers)[0] ?? null;

  return (
    <>
      {/*
        Композиция из макетов: сцена во весь первый экран, поверх которой
        снизу наезжает лист с содержимым. Фотография закреплена, поэтому
        при прокрутке лист уходит по ней вверх — это и создаёт ощущение
        глубины, ради которого приём выбран.
      */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[58vh] overflow-hidden"
        aria-hidden
      >
        {stage && (
          // Кадр смещён вниз: снимки памятников сняты с запасом неба сверху,
          // и при обрезке по центру в кадр попадает пустое небо, а само
          // здание уходит за нижний край. overflow-hidden на обёртке нужен
          // из-за kenburns — без него зум съезжал бы за пределы шапки.
          <Image
            src={stage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="kenburns object-cover"
            style={{ objectPosition: "center 78%" }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(12,18,15,0.62) 0%, rgba(12,18,15,0.18) 34%, rgba(12,18,15,0.55) 100%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <header className="mx-auto max-w-3xl px-4 pt-4 text-white">
          <div className="flex items-start justify-between gap-3">
            {/* Логотип из макета: знак приложения в стеклянной плашке
                поверх снимка. Имя платформы должно быть на первом экране —
                иначе турист не запомнит, куда он вернулся. */}
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.26)",
                }}
              >
                <Icon name="landmark" size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold leading-tight">
                  {t(lang, "app_name")}
                </span>
                <span className="block text-xs opacity-80">{t(lang, "tagline_short")}</span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Погода в столице: через Ташкент прилетает большинство
                  туристов, и город подписан — иначе цифра ни о чём не говорит. */}
              {capitalWeather.now && capital && (
                <Link
                  href={`/city/${capital.slug}`}
                  className="pressable flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3"
                  style={{
                    background: "rgba(255,255,255,0.16)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.24)",
                  }}
                >
                  <Icon name={weatherIcon(capitalWeather.now.code)} size={20} />
                  <span className="leading-none">
                    <span className="block text-[10px] opacity-80">{capital.name}</span>
                    <span className="mt-0.5 block text-sm font-semibold">
                      {capitalWeather.now.temp}°
                    </span>
                  </span>
                </Link>
              )}
              <LangSwitcher current={lang} onDark />
            </div>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.22em] opacity-75">
            {t(lang, "country")}
          </p>
          <h1 className="display mt-1.5">
            {t(lang, "hero_line_1")}
            <br />
            {t(lang, "hero_line_2")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">
            {t(lang, "hero_lead")}
          </p>
        </header>

        {/* Лист. Отступ сверху оставляет сцену открытой примерно на треть
            экрана — столько, чтобы фотография читалась, но первый блок
            содержимого уже подсказывал: ниже есть что листать. */}
        <div
          className="relative mt-[7vh] rounded-t-[2.5rem]"
          style={{
            background: "var(--bg)",
            boxShadow: "0 -20px 44px rgba(12,18,15,0.3)",
          }}
        >
          <div
            aria-hidden
            className="mx-auto mt-3 h-1 w-10 rounded-full"
            style={{ background: "var(--border)" }}
          />

          <main className="mx-auto max-w-3xl px-4 pt-4">
            <div className="mb-6">
              <Link
                href="/map"
                className="pressable flex items-center gap-3 rounded-full px-5 py-3.5 card-raised"
                style={{ color: "var(--text-faint)" }}
              >
                <Icon name="search" size={20} />
                <span className="flex-1 text-sm">{t(lang, "search_placeholder")}</span>
                {/* Золотая кнопка из макета: на белом листе она заметнее
                    зелёной, а зелёный в интерфейсе уже занят навигацией. */}
                <span
                  className="rounded-full px-4 py-2 text-xs font-semibold"
                  style={{ background: "var(--accent)", color: "#2b2b2b" }}
                >
                  {t(lang, "search_action")}
                </span>
              </Link>
            </div>

            {/* Плитки со счётчиками — из макета. Число сверху, подпись под
                ним: сначала видно масштаб платформы, потом что это. */}
            <nav className="mb-8 grid grid-cols-4 gap-2">
              {stats.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  className="pressable grid place-items-center gap-1 p-3 text-center card hover:shadow-[var(--shadow-2)]"
                >
                  <span style={{ color: "var(--primary-text)" }}>
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className="text-base font-semibold leading-none">{s.value}</span>
                  <span className="text-[0.65rem] leading-tight faint">{t(lang, s.key)}</span>
                </Link>
              ))}
            </nav>


        {/* ---------------- Быстрые действия ---------------- */}
        <nav className="no-scrollbar -mx-4 mb-8 flex gap-3 overflow-x-auto px-4">
          {QUICK.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="pressable flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 card"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)]"
                style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
              >
                <Icon name={item.icon} size={22} />
              </span>
              <span className="text-center text-[0.7rem] font-medium leading-tight">
                {t(lang, item.key)}
              </span>
            </Link>
          ))}
        </nav>

        {/* ---------------- Города ---------------- */}
        <section className="mb-8">
          <SectionHead
            title={t(lang, "choose_city")}
            hint={`${cities.length} · ${totalPois} ${t(lang, "objects")}`}
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {cities.map((city, index) => (
              <li key={city.slug}>
                <Link href={`/city/${city.slug}`} className="pressable block overflow-hidden card">
                  <div className="relative h-32 overflow-hidden">
                    {covers[city.slug] ? (
                      <Image
                        src={covers[city.slug]}
                        alt={city.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 360px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="photo-placeholder grid h-full place-items-center"
                        style={{ color: "var(--primary-text)" }}
                      >
                        <Icon name="landmark" size={34} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 flex-1 font-semibold">{city.name}</h3>
                      {cityWeather[index] && (
                        <span
                          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs"
                          style={{
                            background: "var(--primary-tint)",
                            color: "var(--primary-text)",
                          }}
                        >
                          <Icon name={weatherIcon(cityWeather[index]!.code)} size={15} />
                          {cityWeather[index]!.temp}°
                        </span>
                      )}
                    </div>
                    {city.description && (
                      <p className="mt-1 line-clamp-2 text-sm leading-snug soft">
                        {city.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- Топ достопримечательностей ---------------- */}
        {topPois.length > 2 && (
          <section className="mb-8">
            <SectionHead title={t(lang, "top_sights")} href="/map" lang={lang} />
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {topPois.map((poi, i) => (
                <li
                  key={poi.id}
                  className="w-44 shrink-0"
                  style={{ "--tilt-delay": `${i * 70}ms` } as React.CSSProperties}
                >
                  <PoiCard poi={poi} lang={lang} variant="feature" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------------- Где поесть ---------------- */}
        {topDining.length > 0 && (
          <section className="mb-8">
            <SectionHead title={t(lang, "dining_title")} href="/map?category=restaurant" lang={lang} />
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {topDining.map((poi, i) => (
                <li
                  key={poi.id}
                  className="w-44 shrink-0"
                  style={{ "--tilt-delay": `${i * 70}ms` } as React.CSSProperties}
                >
                  <PoiCard poi={poi} lang={lang} variant="feature" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------------- Готовые маршруты ---------------- */}
        {tours.length > 0 && (
          <section className="mb-8">
            <SectionHead title={t(lang, "ready_routes")} href="/routes" lang={lang} />
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {tours.slice(0, 6).map((tour) => (
                <li key={tour.slug} className="w-64 shrink-0">
                  <Link href={`/routes/${tour.slug}`} className="pressable block h-full overflow-hidden card">
                    <div className="relative h-28 overflow-hidden">
                      {tourCover[tour.slug] ? (
                        <Image
                          src={tourCover[tour.slug]}
                          alt={tour.title}
                          fill
                          sizes="256px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="photo-placeholder grid h-full place-items-center"
                          style={{ color: "var(--primary-text)" }}
                        >
                          <Icon name="explore" size={30} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                        {tour.title}
                      </h3>
                      <p className="mt-1.5 flex items-center gap-1 text-xs faint">
                        <Icon name="clock" size={12} />
                        {Math.round(tour.total_min / 60)} {t(lang, "hours_short")} ·{" "}
                        {tour.stop_count} {t(lang, "stops")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------------- События и фестивали ---------------- */}
        {festivals.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-base font-semibold">{t(lang, "festivals_title")}</h2>
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {festivals.map((f) => (
                <li key={f.id} className="w-64 shrink-0">
                  <article className="flex h-full flex-col p-4 card">
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: "var(--accent)", color: "#2b2b2b" }}
                    >
                      <Icon name="clock" size={13} />
                      {formatFestivalDate(f, lang)}
                    </span>
                    <h3 className="mt-2.5 font-semibold leading-snug">{f.name}</h3>
                    {f.city_name && (
                      <p className="mt-0.5 text-xs faint">{f.city_name}</p>
                    )}
                    {f.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed soft">
                        {f.description}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------------- Полезно знать ---------------- */}
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold">{t(lang, "practical_title")}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {TIPS.map((tip) => {
              const body = (
                <>
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                    style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
                  >
                    <Icon name={tip.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{t(lang, `tip_${tip.key}_t`)}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed soft">
                      {t(lang, `tip_${tip.key}_d`)}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={tip.key}>
                  {tip.href ? (
                    <Link
                      href={tip.href}
                      className="pressable flex items-start gap-3 p-3 card hover:shadow-[var(--shadow-2)]"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 p-3 card">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------- Почему мы ---------------- */}
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold">Почему это работает</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {WHY.map((item) => (
              <li key={item.title} className="p-3 card">
                <span style={{ color: "var(--primary-text)" }}>
                  <Icon name={item.icon} size={22} />
                </span>
                <p className="mt-2 text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs leading-snug faint">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer
          className="mb-4 rounded-[var(--radius-md)] p-4 text-xs leading-relaxed"
          style={{ background: "var(--surface-alt)", color: "var(--text-soft)" }}
        >
          Демонстрационная версия. Тексты об объектах — черновые, составлены по
          общедоступным сведениям и требуют проверки историком. Цены и часы работы
          нужно подтвердить у дирекций объектов перед публичным запуском.
          <Link
            href="/admin"
            className="ml-1 font-medium underline"
            style={{ color: "var(--primary-text)" }}
          >
            Админ-панель
          </Link>
        </footer>
          </main>
        </div>
      </div>
    </>
  );
}

/**
 * Дата события словами. У ежегодных праздников год не показываем — он
 * не задан в базе намеренно, иначе каждый январь пришлось бы править
 * все записи руками. У события без дня остаётся только месяц.
 */
function formatFestivalDate(f: Festival, lang: Lang): string {
  const locale = lang === "uz" ? "uz-UZ" : lang === "en" ? "en-GB" : "ru-RU";
  const month = new Date(2000, f.month - 1, 1).toLocaleDateString(locale, { month: "long" });
  if (f.day == null) return f.year ? `${month} ${f.year}` : month;
  const day = new Date(2000, f.month - 1, f.day).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });
  return f.year ? `${day} ${f.year}` : day;
}

function SectionHead({
  title,
  hint,
  href,
  lang,
}: {
  title: string;
  hint?: string;
  href?: string;
  lang?: Lang;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {href && lang ? (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-sm font-medium"
          style={{ color: "var(--primary-text)" }}
        >
          {t(lang, "see_all")}
          <Icon name="chevron-right" size={14} />
        </Link>
      ) : (
        hint && <span className="text-xs faint">{hint}</span>
      )}
    </div>
  );
}
