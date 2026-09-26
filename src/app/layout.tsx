import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import ServiceWorker from "@/components/service-worker";
import "./globals.css";

/*
 * Rubik подобран под буквы логотипа: плотный геометрический гротеск со
 * скруглёнными углами. В нём есть кириллица, поэтому латиница и русский
 * набираются одной гарнитурой — раньше латиница шла одним шрифтом, а
 * кириллица подменялась другим, и в строке «HelloUZ Premium активен»
 * буквы были из разных семейств. Шрифт переменный: все насыщенности
 * в одном файле.
 */
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  // База для абсолютных ссылок в og/twitter — иначе картинка шеринга
  // подставилась бы относительным путём, и превью в мессенджерах пустое.
  metadataBase: new URL("https://uzbekistan-travel.onrender.com"),
  title: "HelloUZ — открой Узбекистан",
  description: "Маршруты, аудиогиды, отели и рестораны Узбекистана в одном приложении.",
  manifest: "/manifest.webmanifest",
  applicationName: "HelloUZ",
  // Карточка, которую видят, когда ссылку кидают в Telegram/WhatsApp/соцсети.
  openGraph: {
    type: "website",
    siteName: "HelloUZ",
    locale: "ru_RU",
    title: "HelloUZ — открой красоту Узбекистана",
    description: "Маршруты, аудиогиды, AI-гид и всё об Узбекистане. 10 языков, работает офлайн.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "HelloUZ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HelloUZ — открой красоту Узбекистана",
    description: "Маршруты, аудиогиды, AI-гид и всё об Узбекистане. 10 языков, работает офлайн.",
    images: ["/og.jpg"],
  },
  /*
   * iOS не читает web-манифест: и значок на домашнем экране, и запуск без
   * адресной строки он берёт только отсюда. Без этих полей «установленное»
   * приложение открывалось бы обычной вкладкой Safari со скриншотом вместо
   * иконки.
   */
  appleWebApp: {
    capable: true,
    title: "HelloUZ",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    // Телефоны и даты в текстах — часть вёрстки. Автоссылки от iOS их
    // перекрашивают и ломают строку.
    telephone: false,
    date: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0fb3ac",
  width: "device-width",
  initialScale: 1,
  // Экран карты и колода карточек живут на жестах — двойной тап по ним
  // не должен зумить страницу.
  maximumScale: 1,
  // Во весь экран, включая области под чёлкой и полосой домой. Отступы
  // под них берём в CSS через env(safe-area-inset-*) — иначе нижняя
  // панель вкладок оказалась бы под полосой жеста на iPhone.
  viewportFit: "cover",
};

/** Та же логика, что в инитТему (lib/settings), но до загрузки React. */
const ТЕМА_ДО_ОТРИСОВКИ = `try{var s=JSON.parse(localStorage.getItem("uzup.settings")||"{}");var t=s.themeChosen?s.theme:"light";if(t==="system")document.documentElement.removeAttribute("data-theme");else if(t==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Светлая тема стоит в разметке сразу, а скрипт ниже до первой
    // отрисовки ставит выбранную человеком: без него тот, кто выбрал
    // тёмную, видел бы вспышку светлого экрана при каждом запуске.
    // suppressHydrationWarning — атрибут меняет этот скрипт, а не React.
    <html lang="ru" className={rubik.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ТЕМА_ДО_ОТРИСОВКИ }} />
      </head>
      <body
        style={{
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        }}
      >
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
