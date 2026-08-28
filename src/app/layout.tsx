import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStateProvider } from "@/components/app-state";
import BottomNav from "@/components/bottom-nav";
import ServiceWorkerRegistrar from "@/components/service-worker";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const metadata: Metadata = {
  title: "Uzbekistan Travel — ваш персональный гид",
  description:
    "Маршруты, аудиогиды, музеи и достопримечательности Узбекистана в одном приложении. Работает офлайн.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Uzbekistan Travel" },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#1f6f8b" },
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
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        {/* Фоновая анимация на весь сайт — см. .ambient-bg в globals.css.
            Дуга маршрута и самолёт — образ путешествия, а не абстракция. */}
        <div className="ambient-bg" aria-hidden>
          <div className="ambient-bg-mid" />
          <svg className="ambient-route" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 6 90 Q 50 58 94 12" />
            <circle className="ambient-route-dot" cx="6" cy="90" r="1.3" />
            <circle className="ambient-route-dot ambient-route-dot--end" cx="94" cy="12" r="1.3" />
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
