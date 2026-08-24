import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

export const metadata: Metadata = {
  title: "Uzbekistan Travel — цифровая туристическая платформа",
  description:
    "Маршруты, QR-аудиогиды, музеи и достопримечательности Узбекистана в одном приложении. Работающая платформа: 4 города, 48 объектов, 11 маршрутов.",
  openGraph: {
    title: "Uzbekistan Travel — цифровая туристическая платформа",
    description:
      "Узбекистан без гида: маршруты под ваше время, QR-аудиогиды на объектах, офлайн-режим.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04080b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
