import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./fonts-vars.css";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import { ЯзыкProvider } from "@/lib/i18n";
import { Заставка, Курсор, Прогресс } from "@/components/effects";
import Nav from "@/components/nav";
import Finale from "@/components/finale";

// Шрифты — файлами из репозитория (public/fonts, fonts.css): next/font/google
// качал их во время сборки, и без доступа к Google Fonts выкладка падала.
// Rubik — как в приложении; антиква — заголовки; рукописный — подписи к
// наброскам; узкий — названия городов; плотный гротеск — «кино»-блоки.

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
