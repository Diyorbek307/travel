import type { Metadata } from "next";
import КабинетПартнёра from "@/components/cabinet/cabinet-app";

export const metadata: Metadata = {
  title: "Кабинет партнёра — HelloUZ",
  description: "Водители и гиды: анкета, туры, заявки туристов и оплата размещения.",
  robots: { index: false },
  // Своё приложение на телефоне: «Установить» отсюда ставит кабинет
  // отдельной иконкой, которая открывается сразу в /cabinet.
  manifest: "/cabinet.webmanifest",
  appleWebApp: { capable: true, title: "HelloUZ Партнёр", statusBarStyle: "default" },
};

export default function Page() {
  return <КабинетПартнёра />;
}
