import { NextResponse } from "next/server";
import { campaignsFor } from "@/lib/campaigns";
import { currentUser } from "@/lib/session";
import { premiumАктивен } from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Кампании для колокольчика: идут сегодня и подходят этому человеку.
 *
 * Город приходит из приложения (?city=): где человек сейчас, знает только
 * его телефон. Premium — из аккаунта, а не из запроса: иначе любой
 * получил бы предложения для платных подписчиков, дописав параметр.
 */
export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim() || null;
  const user = await currentUser();
  const campaigns = await campaignsFor({ premium: user ? premiumАктивен(user) : false, city });
  return NextResponse.json(
    {
      campaigns: campaigns.map(({ id, title, body, emoji, link, from, createdAt }) => ({
        id,
        title,
        body,
        emoji,
        link,
        from,
        createdAt,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
