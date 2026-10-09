import type { Metadata } from "next";
import { NextPage, PageIntro } from "@/components/page-parts";
import EsimSection from "@/components/esim-section";

export const metadata: Metadata = { title: "eSIM — HelloUZ" };

export default function Page() {
  return (
    <main>
      <PageIntro путь="/esim" />
      <EsimSection />
      <NextPage путь="/esim" />
    </main>
  );
}
