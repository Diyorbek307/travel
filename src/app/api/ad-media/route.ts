import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { saveAdVideo, разобрать, МАКС_БАЙТ } from "@/lib/ad-media";

export const dynamic = "force-dynamic";

/**
 * Загрузка рекламного ролика. Только владелец/редактор (домен money).
 * Принимает data-URL видео, возвращает короткую ссылку на него.
 */
export async function POST(request: Request) {
  const нет = await отказЕсли("money");
  if (нет) return нет;

  let body: { dataUrl?: string };
  try {
    body = (await request.json()) as { dataUrl?: string };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const dataUrl = String(body.dataUrl ?? "");
  const разбор = разобрать(dataUrl);
  if (!разбор || !разбор.тип.startsWith("video/")) {
    return NextResponse.json({ error: "not_video" }, { status: 400 });
  }
  if (разбор.данные.length > МАКС_БАЙТ) {
    return NextResponse.json({ error: "too_big" }, { status: 413 });
  }

  const id = await saveAdVideo(dataUrl);
  return NextResponse.json({ ok: true, url: `/api/ad-media/${id}` });
}
