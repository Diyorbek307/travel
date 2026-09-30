import { NextResponse } from "next/server";
import { отказЕслиНи } from "@/lib/admin-auth";
import { сохранитьФото } from "@/lib/media";

export const dynamic = "force-dynamic";

/**
 * Загрузка фотографии из панели. Может тот, кто правит содержимое, и
 * кабинет заведения — для фото своей карточки.
 * Принимает data-URL картинки, возвращает короткую ссылку на неё.
 */
export async function POST(request: Request) {
  const нет = await отказЕслиНи("content", "venue");
  if (нет) return нет;

  const body = (await request.json().catch(() => null)) as { dataUrl?: unknown } | null;
  const итог = await сохранитьФото(String(body?.dataUrl ?? ""));
  if (!итог.ok) {
    return NextResponse.json({ error: итог.причина }, { status: итог.причина === "too_big" ? 413 : 400 });
  }
  return NextResponse.json({ ok: true, url: `/api/media/${итог.id}` });
}
