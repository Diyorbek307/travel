import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { listReviews, setReviewStatus, type ReviewStatus } from "@/lib/community";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function GET() {
  const нет = await отказЕсли("operations");
  if (нет) return нет;

  const [все, users] = await Promise.all([listReviews(), listUsers()]);
  const поИд = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json(
    {
      reviews: все.map((r) => {
        const u = поИд.get(r.userId);
        return {
          ...r,
          name: u ? `${u.firstName} ${u.lastName}`.trim() : "Аккаунт удалён",
          photoUrl: u?.hasPhoto ? `/api/photo/${u.id}` : null,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Скрыть или вернуть отзыв. Удаления нет: скрытый можно вернуть. */
export async function POST(request: Request) {
  const нет = await отказЕсли("operations");
  if (нет) return нет;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as ReviewStatus;
  if (!id || !["published", "hidden"].includes(status)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await setReviewStatus(id, status);
  return NextResponse.json({ ok: true });
}
