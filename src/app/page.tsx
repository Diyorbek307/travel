import Link from "next/link";
import Icon, { type IconName } from "@/components/icon";
import LangSwitcher from "@/components/lang-switcher";
import { listCities, listPois, listTours } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

const QUICK: { href: string; icon: IconName; key: string }[] = [
  { href: "/map", icon: "landmark", key: "landmarks_short" },
  { href: "/explore", icon: "explore", key: "explore_short" },
  { href: "/planner", icon: "sparkle", key: "planner" },
  { href: "/scan", icon: "qr", key: "scan" },
  { href: "/sos", icon: "sos", key: "sos_short" },
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
  const totalPois = listPois({ lang }).length;

  return (
    <>
      {/* ---------------- Шапка ---------------- */}
      <header
        className="wave-bottom relative px-4 pb-10 pt-4"
        style={{ background: "var(--primary)", color: "var(--on-primary)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)]"
              style={{ background: "rgb(255 255 255 / 0.16)" }}
            >
              <Icon name="landmark" size={22} />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-tight">
                {t(lang, "app_name")}
              </span>
              <span className="block text-xs opacity-80">Открой Узбекистан</span>
            </span>
          </div>
          <LangSwitcher current={lang} onDark />
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <h1 className="text-[1.75rem] font-semibold leading-tight">
            Путешествуй.
            <br />
            Открывай. Вдохновляйся.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">
            Маршруты, достопримечательности и история Узбекистана в одном приложении
          </p>

          <Link
            href="/planner"
            className="pressable mt-5 inline-flex items-center gap-2 rounded-[var(--radius-full)] px-5 py-3 text-sm font-medium"
            style={{ background: "var(--surface)", color: "var(--primary)" }}
          >
            <Icon name="search" size={18} />
            {t(lang, "build_route")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {/* ---------------- Поиск ---------------- */}
        <div className="-mt-6 mb-6">
          <Link
            href="/map"
            className="pressable flex items-center gap-3 px-4 py-3.5 card-raised"
            style={{ color: "var(--text-faint)" }}
          >
            <Icon name="search" size={20} />
            <span className="flex-1 text-sm">Куда вы хотите поехать?</span>
            <Icon name="chevron-right" size={18} />
          </Link>
        </div>

        {/* ---------------- Быстрые действия ---------------- */}
        <nav className="no-scrollbar -mx-4 mb-8 flex gap-3 overflow-x-auto px-4">
          {QUICK.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="pressable flex w-[5.5rem] shrink-0 flex-col items-center gap-2 px-2 py-3 card"
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
            {cities.map((city) => (
              <li key={city.slug}>
                <Link href={`/city/${city.slug}`} className="pressable block overflow-hidden card">
                  <div
                    className="photo-placeholder grid h-28 place-items-center"
                    style={{ color: "var(--primary-text)" }}
                  >
                    <Icon name="landmark" size={34} />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold">{city.name}</h3>
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

        {/* ---------------- Готовые маршруты ---------------- */}
        {tours.length > 0 && (
          <section className="mb-8">
            <SectionHead title={t(lang, "ready_routes")} href="/routes" lang={lang} />
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {tours.slice(0, 6).map((tour) => (
                <li key={tour.slug} className="w-64 shrink-0">
                  <Link href={`/routes/${tour.slug}`} className="pressable block h-full overflow-hidden card">
                    <div
                      className="photo-placeholder grid h-24 place-items-center"
                      style={{ color: "var(--primary-text)" }}
                    >
                      <Icon name="explore" size={30} />
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
    </>
  );
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
