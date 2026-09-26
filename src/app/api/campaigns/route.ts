import { NextResponse } from "next/server";
import { campaignsFor } from "@/lib/campaigns";
import { картинкаКампании } from "@/lib/campaign-rules";
import { readContent } from "@/lib/store";
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
  const [campaigns, content] = await Promise.all([
    campaignsFor({ premium: user ? premiumАктивен(user) : false, city }),
    readContent(),
  ]);
  return NextResponse.json(
    {
      campaigns: campaigns.map((к) => ({
        id: к.id,
        title: к.title,
        body: к.body,
        emoji: к.emoji,
        link: к.link,
        from: к.from,
        createdAt: к.createdAt,
        image: картинкаКампании(к, content) ?? null,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
