import type { Metadata } from "next";
import { NextPage, PageIntro } from "@/components/page-parts";
import Features from "@/components/features";
import TourSection from "@/components/tour-section";
import InsideSection from "@/components/inside-section";
import CameraSection from "@/components/camera-section";

export const metadata: Metadata = { title: "The app — HelloUZ" };

export default function Page() {
  return (
    <main>
      <PageIntro путь="/app" />
      <Features />
      <TourSection />
      <CameraSection />
      <InsideSection />
      <NextPage путь="/app" />
    </main>
  );
}
