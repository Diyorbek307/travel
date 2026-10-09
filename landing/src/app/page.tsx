import Hero, { type Цифры } from "@/components/hero";
import Marquee from "@/components/marquee";
import Manifesto from "@/components/manifesto";
import StartSection from "@/components/start-section";
import { SiteSections } from "@/components/page-parts";
import { APP_URL } from "@/lib/i18n";

// Цифры берём из живого приложения раз в час — никаких «500+» с потолка.
export const revalidate = 3600;

async function цифры(): Promise<Цифры> {
  try {
    const r = await fetch(`${APP_URL}/api/content`, { next: { revalidate: 3600 } });
    const c = (await r.json()) as Record<string, { status?: string }[]>;
    const видно = (список?: { status?: string }[]) =>
      (список ?? []).filter((x) => !x.status || ["active", "seasonal"].includes(x.status)).length;
    return {
      cities: видно(c.cities),
      places: видно(c.places),
      venues: видно(c.hotels) + видно(c.restaurants),
    };
  } catch {
    // Приложение спит (бесплатный хостинг) — показываем последнее известное.
    return { cities: 13, places: 60, venues: 66 };
  }
}

/**
 * Главная — коротко: первый экран, о чём HelloUZ, вход в разделы и как
 * начать. Всё подробное — на страницах разделов (lib/pages.ts).
 */
export default async function Home() {
  return (
    <main>
      <Hero цифры={await цифры()} />
      <Marquee />
      <Manifesto />
      <SiteSections />
      <StartSection />
    </main>
  );
}
