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
    { media: "(prefers-color-scheme: light)", color: "#158488" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1115" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await currentLang();

  const nav = [
    { href: "/", icon: "🏠", label: t(lang, "cities") },
    { href: "/map", icon: "🗺", label: t(lang, "map") },
    { href: "/scan", icon: "📷", label: t(lang, "scan") },
    { href: "/routes", icon: "🧭", label: t(lang, "routes") },
    { href: "/profile", icon: "👤", label: t(lang, "profile") },
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
