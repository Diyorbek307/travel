import Nav from "@/components/nav";
import Hero, { type Цифры } from "@/components/hero";
import Marquee from "@/components/marquee";
import Destinations from "@/components/destinations";
import Features from "@/components/features";
import Showcase from "@/components/showcase";
import Quiz from "@/components/quiz";
import Finale from "@/components/finale";
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

export default async function Home() {
  return (
    <main>
      <Nav />
      <Hero цифры={await цифры()} />
      <Marquee />
      <Destinations />
      <Features />
      <Showcase />
      <Quiz />
      <Finale />
    </main>
  );
}
