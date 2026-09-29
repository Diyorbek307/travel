import { NextResponse } from "next/server";
import { createReview, listPlaceReviews } from "@/lib/community";
import { currentUser } from "@/lib/session";
import { подЛимитом } from "@/lib/rate-limit";
import { записьПоId } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Отзывы места — открыто, их читают и не вошедшие. */
export async function GET(request: Request) {
  const placeId = new URL(request.url).searchParams.get("placeId") ?? "";
  if (!placeId) return NextResponse.json({ error: "place_required" }, { status: 400 });
  return NextResponse.json(
    { reviews: await listPlaceReviews(placeId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Живой человек пишет отзыв в минуту-две, а не десятки.
  if (!подЛимитом(`review:${user.id}`, 10, 60_000))
    return NextResponse.json({ error: "too_many" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating_invalid" }, { status: 400 });
  }

  const placeId = typeof body.placeId === "string" ? body.placeId : "";
  if (!placeId) return NextResponse.json({ error: "place_required" }, { status: 400 });
  // Отзыв — только о том, что есть в приложении; название — из данных.
  const место = await записьПоId(placeId, ["places", "hotels", "restaurants"]);
  if (!место) return NextResponse.json({ error: "place_not_found" }, { status: 404 });
  const placeName = место.name ?? placeId;

  const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) : "";

  const отзыв = await createReview({
    userId: user.id,
    // Имя сохраняем при создании: отзыв без автора читается как
    // безликий, а тянуть имя при каждом чтении — лишний запрос.
    userName: user.firstName,
    placeId,
    placeName,
    rating,
    text,
  });

  return NextResponse.json({ ok: true, review: отзыв });
}
