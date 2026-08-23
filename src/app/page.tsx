import Link from "next/link";
import Header from "@/components/header";
import { listCities, listTours } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Главный экран: выбор города (п. 2.1 ТЗ) и быстрые действия. */
export default async function HomePage() {
  const lang = await currentLang();
  const cities = listCities(lang);
  const featured = listTours(lang).filter((x) => x.kind === "curated").slice(0, 3);

  const actions = [
    { href: "/planner", icon: "🧭", label: t(lang, "build_route"), hint: t(lang, "assistant") },
    { href: "/scan", icon: "📷", label: t(lang, "scan"), hint: "QR-аудиогид" },
    { href: "/map", icon: "🗺", label: t(lang, "map"), hint: t(lang, "nearby") },
    { href: "/sos", icon: "🆘", label: t(lang, "sos"), hint: "112 · 103 · 101" },
  ];

  return (
    <>
      <Header lang={lang} title={t(lang, "app_name")} subtitle={t(lang, "tagline")} />

      <main className="mx-auto max-w-3xl px-4 py-5">
        <section aria-label={t(lang, "planner")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-xl p-3 transition-colors surface hover:bg-soft"
              >
                <div className="text-2xl">{a.icon}</div>
                <div className="mt-1.5 text-sm font-medium leading-tight">{a.label}</div>
                <div className="truncate text-xs soft">{a.hint}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="mb-3 text-base font-semibold">{t(lang, "choose_city")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/city/${city.slug}`}
                  className="block h-full rounded-xl p-4 transition-colors surface hover:bg-soft"
                >
                  <h3 className="font-semibold">{city.name}</h3>
                  {city.description && (
                    <p className="mt-1 line-clamp-3 text-sm soft">{city.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs soft">
            В первой версии открыты четыре города MVP. Остальные регионы Узбекистана
            добавляются через админ-панель по мере наполнения контентом.
          </p>
        </section>

        {featured.length > 0 && (
          <section className="mt-7">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold">{t(lang, "ready_routes")}</h2>
              <Link href="/routes" className="text-sm" style={{ color: "var(--accent)" }}>
                все →
              </Link>
            </div>
            <ul className="grid gap-3">
              {featured.map((tour) => (
                <li key={tour.slug}>
                  <Link
                    href={`/routes/${tour.slug}`}
                    className="block rounded-xl p-4 transition-colors surface hover:bg-soft"
                  >
                    <h3 className="font-medium">{tour.title}</h3>
                    {tour.description && (
                      <p className="mt-1 line-clamp-2 text-sm soft">{tour.description}</p>
                    )}
                    <p className="mt-2 text-xs soft">
                      {tour.stop_count} {t(lang, "stops")} · {Math.round(tour.total_min / 60)}{" "}
                      {t(lang, "hours_short")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-8 rounded-xl p-4 text-xs leading-relaxed soft bg-soft">
          Демонстрационная версия платформы. Тексты об объектах — черновые, составлены по
          общедоступным сведениям и требуют проверки историком. Цены и часы работы нужно
          подтвердить у дирекций объектов перед публичным запуском.
          <Link href="/admin" className="ml-1 underline" style={{ color: "var(--accent)" }}>
            Админ-панель
          </Link>
        </footer>
      </main>
    </>
  );
}
