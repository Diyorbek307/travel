import { NextResponse } from "next/server";
import { createReview, listPlaceReviews } from "@/lib/community";
import { currentUser } from "@/lib/session";

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
  const placeName = typeof body.placeName === "string" ? body.placeName.trim() : "";
  if (!placeId || !placeName) return NextResponse.json({ error: "place_required" }, { status: 400 });

  const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) : "";

  const отзыв = await createReview({
    userId: user.id,
    placeId,
    placeName,
    rating,
    text,
  });

  return NextResponse.json({ ok: true, review: отзыв });
}
