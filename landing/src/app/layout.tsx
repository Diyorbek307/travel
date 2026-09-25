import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

// Тот же шрифт, что в приложении и на логотипе.
const rubik = Rubik({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HelloUZ — Узбекистан в одном приложении",
  description:
    "Места, отели, рестораны, план дня и AI-гид по Узбекистану в одном приложении. 13 городов, 10 языков.",
  openGraph: {
    title: "HelloUZ — Узбекистан в одном приложении",
    description:
      "План дня под ваше время, отели и рестораны, AI-гид на вашем языке, офлайн-режим.",
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
    <html lang="ru" className={rubik.variable}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
