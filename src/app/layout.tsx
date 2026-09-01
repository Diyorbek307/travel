import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/components/app-state";
import BottomNav from "@/components/bottom-nav";
import ServiceWorkerRegistrar from "@/components/service-worker";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

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

  // Порядок важен: центральный пункт приподнят, туда ставим карту —
  // главный экран платформы.
  const nav = [
    { href: "/", icon: "home" as const, label: t(lang, "cities") },
    { href: "/explore", icon: "explore" as const, label: "Исследовать" },
    { href: "/map", icon: "map" as const, label: t(lang, "map") },
    { href: "/scan", icon: "qr" as const, label: t(lang, "scan") },
    { href: "/profile", icon: "user" as const, label: t(lang, "profile") },
  ];

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={manrope.variable}
      suppressHydrationWarning
    >
      <body>
        {/* Фоновая анимация на весь сайт — см. .ambient-bg в globals.css.
            Дуга маршрута и самолёт — образ путешествия, а не абстракция. */}
        <div className="ambient-bg" aria-hidden>
          <div className="ambient-bg-mid" />
          <svg className="ambient-route" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 6 90 Q 50 58 94 12" />
          </svg>
          <div className="ambient-pin-ring" />
          <svg className="ambient-pin" viewBox="0 0 24 24">
            <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2Zm0,9.5A2.5,2.5,0,1,1,14.5,9,2.5,2.5,0,0,1,12,11.5Z" />
          </svg>
          <svg className="ambient-plane" viewBox="0 0 24 24">
            <path d="M21,16V14L13,9V3.5C13,2.67,12.33,2,11.5,2C10.67,2,10,2.67,10,3.5V9L2,14V16L10,13.5V19L7.5,20.5V22L11.5,21L15.5,22V20.5L13,19V13.5L21,16Z" />
          </svg>
        </div>
        <AppStateProvider>
          {children}
          <BottomNav items={nav} />
          <ServiceWorkerRegistrar />
        </AppStateProvider>
      </body>
    </html>
  );
}
