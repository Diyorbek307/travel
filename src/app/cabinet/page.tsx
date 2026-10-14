import type { Metadata } from "next";
import КабинетПартнёра from "@/components/cabinet/cabinet-app";

export const metadata: Metadata = {
  title: "Кабинет партнёра — HelloUZ",
  description: "Водители и гиды: анкета, туры, заявки туристов и оплата размещения.",
  robots: { index: false },
};

export default function Page() {
  return <КабинетПартнёра />;
}
