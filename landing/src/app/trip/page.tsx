import type { Metadata } from "next";
import { NextPage, PageIntro } from "@/components/page-parts";
import Essentials from "@/components/essentials";
import RouteSection from "@/components/route-section";
import Quiz from "@/components/quiz";

export const metadata: Metadata = { title: "Plan your trip — HelloUZ" };

export default function Page() {
  return (
    <main>
      <PageIntro путь="/trip" />
      <Essentials />
      <RouteSection />
      <Quiz />
      <NextPage путь="/trip" />
    </main>
  );
}
