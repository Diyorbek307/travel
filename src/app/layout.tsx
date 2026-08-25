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
    { color: "#2e7d5a" },
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
    { href: "/routes", icon: "explore" as const, label: t(lang, "routes") },
    { href: "/map", icon: "map" as const, label: t(lang, "map") },
    { href: "/scan", icon: "qr" as const, label: t(lang, "scan") },
    { href: "/profile", icon: "user" as const, label: t(lang, "profile") },
  ];

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <AppStateProvider>
          {children}
          <BottomNav items={nav} />
          <ServiceWorkerRegistrar />
        </AppStateProvider>
      </body>
    </html>
  );
}
