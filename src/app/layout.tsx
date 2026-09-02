import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Outfit } from "next/font/google";
import ServiceWorker from "@/components/service-worker";
import "./globals.css";

/*
 * Outfit — шрифт макета, но кириллицы в нём нет. Без пары браузер
 * подставил бы под русский текст системный шрифт, и половина интерфейса
 * поехала бы по начертанию. Manrope стоит следующим в стеке: близкий
 * геометрический гротеск, который кириллицу умеет.
 */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-cyrillic",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "UzUp — открой Узбекистан",
  description:
    "Маршруты, аудиогиды, отели и рестораны Узбекистана в одном приложении.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2E7D5A",
  width: "device-width",
  initialScale: 1,
  // Экран карты и колода карточек живут на жестах — двойной тап по ним
  // не должен зумить страницу.
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${outfit.variable} ${manrope.variable} ${fraunces.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-sans), var(--font-sans-cyrillic), system-ui, sans-serif",
        }}
      >
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
