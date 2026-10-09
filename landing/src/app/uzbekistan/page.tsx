import type { Metadata } from "next";
import { NextPage, PageIntro } from "@/components/page-parts";
import OpenCountry from "@/components/open-country";
import Destinations from "@/components/destinations";
import GlobeSection from "@/components/globe-section";

export const metadata: Metadata = { title: "Uzbekistan — HelloUZ" };

export default function Page() {
  return (
    <main>
      <PageIntro путь="/uzbekistan" />
      <Destinations />
      <GlobeSection />
      <OpenCountry />
      <NextPage путь="/uzbekistan" />
    </main>
  );
}
