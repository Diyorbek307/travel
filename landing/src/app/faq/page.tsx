import type { Metadata } from "next";
import { NextPage, PageIntro } from "@/components/page-parts";
import FaqSection from "@/components/faq-section";
import FreeSection from "@/components/free-section";

export const metadata: Metadata = { title: "FAQ — HelloUZ" };

export default function Page() {
  return (
    <main>
      <PageIntro путь="/faq" />
      <FreeSection />
      <FaqSection />
      <NextPage путь="/faq" />
    </main>
  );
}
