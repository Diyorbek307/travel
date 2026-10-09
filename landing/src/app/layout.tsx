import type { Metadata, Viewport } from "next";
import { Caveat, Inter_Tight, Oswald, Playfair_Display, Rubik } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import { ЯзыкProvider } from "@/lib/i18n";
import { Заставка, Курсор, Прогресс } from "@/components/effects";
import Nav from "@/components/nav";
import Finale from "@/components/finale";

// Rubik — как в приложении и на логотипе; антиква — для заголовков,
// рукописный — для подписей к наброскам, узкий — для названий городов.
const rubik = Rubik({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-serif" });
const caveat = Caveat({ subsets: ["latin", "cyrillic"], variable: "--font-hand" });
const oswald = Oswald({ subsets: ["latin", "cyrillic"], variable: "--font-condensed" });
// Плотный гротеск для «кинематографичных» блоков: огромный знак на первом экране, панели, маршрут.
const tight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-tight",
});

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
  themeColor: "#f4f7f7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.variable} ${playfair.variable} ${caveat.variable} ${oswald.variable} ${tight.variable}`}
    >
      <head>
        {/* Первый вход за сессию — заставка; до её конца анимации первого экрана ждут. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!sessionStorage.getItem("hz.seen"))document.documentElement.classList.add("intro-wait")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <Курсор />
        <Прогресс />
        <ЯзыкProvider>
          <Заставка />
          {/* Меню и подвал общие для всех страниц. */}
          <Nav />
          {children}
          <Finale />
        </ЯзыкProvider>
      </body>
    </html>
  );
}
