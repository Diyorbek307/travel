import type { Metadata, Viewport } from "next";
import { Caveat, Oswald, Playfair_Display, Rubik } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import { ЯзыкProvider } from "@/lib/i18n";

// Rubik — как в приложении и на логотипе; антиква — для заголовков,
// рукописный — для подписей к наброскам, узкий — для названий городов.
const rubik = Rubik({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-serif" });
const caveat = Caveat({ subsets: ["latin", "cyrillic"], variable: "--font-hand" });
const oswald = Oswald({ subsets: ["latin", "cyrillic"], variable: "--font-condensed" });

export const metadata: Metadata = {
  title: "HelloUZ — Uzbekistan in one app",
  description:
    "Places, hotels, restaurants, a day-by-day plan and an AI guide for Uzbekistan in 10 languages. Free, works offline.",
  openGraph: {
    title: "HelloUZ — Uzbekistan in one app",
    description: "Places, hotels, restaurants, a day-by-day plan and an AI guide in your language.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${rubik.variable} ${playfair.variable} ${caveat.variable} ${oswald.variable}`}>
      <body>
        <SmoothScroll />
        <ЯзыкProvider>{children}</ЯзыкProvider>
      </body>
    </html>
  );
}
