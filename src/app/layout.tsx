import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/components/app-state";
import BottomNav from "@/components/bottom-nav";
import AmbientGrid from "@/components/ambient-grid";
import Onboarding from "@/components/onboarding";
import ServiceWorkerRegistrar from "@/components/service-worker";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import { cityCovers, listPois } from "@/lib/db";
import { MVP_LANGS } from "@/lib/types";

/*
 * Manrope, а не Outfit из макета: у Outfit нет кириллицы — только латиница.
 * То есть в самом макете русские подписи рисовал не Outfit, а запасной
 * системный шрифт, и копировать его сюда значило бы получить ту же кашу:
 * латиница одним шрифтом, кириллица другим. Manrope держит тот же
 * геометрический характер и закрывает русский и узбекский целиком.
 *
 * Берём через next/font, а не ссылкой на Google Fonts: файлы скачиваются
 * при сборке и отдаются с нашего домена, иначе офлайн-режим ломался бы на
 * внешнем запросе. display: swap — текст виден сразу, без «мигания пустотой».
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

/*
 * Второй шрифт макета: им набраны заголовки и логотип. Кириллицы у
 * Fraunces нет, поэтому русские заголовки останутся на Manrope — как и в
 * самом макете, где их рисовал запасной шрифт. Смысл всё равно есть:
 * латинское «UzUp» и цифры получают тот самый характер, ради которого
 * шрифт и выбирали.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "UzUp — ваш персональный гид по Узбекистану",
  description:
    "Маршруты, аудиогиды, музеи и достопримечательности Узбекистана в одном приложении. Работает офлайн.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "UzUp" },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#2d7b57" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await currentLang();

  // Данные для заставки: снимок страны и настоящие цифры платформы.
  const covers = cityCovers();
  const splashCover = covers.samarkand ?? Object.values(covers)[0] ?? null;
  const totalPlaces = listPois({ lang }).length;

  // Порядок важен: центральный пункт приподнят, туда ставим карту —
  // главный экран платформы.
  const nav = [
    { href: "/", icon: "home" as const, label: t(lang, "cities") },
    { href: "/explore", icon: "explore" as const, label: "Исследовать" },
    { href: "/map", icon: "map" as const, label: t(lang, "map") },
    { href: "/audio", icon: "headphones" as const, label: t(lang, "audio_title") },
    { href: "/profile", icon: "user" as const, label: t(lang, "profile") },
  ];

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${manrope.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Фоновая анимация на весь сайт — см. .ambient-bg в globals.css.
            Дуга маршрута и самолёт — образ путешествия, а не абстракция. */}
        <div className="ambient-bg" aria-hidden>
          <div className="ambient-bg-mid" />
          <AmbientGrid />
        </div>
        <AppStateProvider>
          {children}
          <BottomNav items={nav} />
          <Onboarding
            lang={lang}
            cover={splashCover}
            totalPlaces={totalPlaces}
            langCount={MVP_LANGS.length}
          />
          <ServiceWorkerRegistrar />
        </AppStateProvider>
      </body>
    </html>
  );
}
