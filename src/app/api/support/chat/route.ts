import { NextResponse } from "next/server";
import {
  addSupportMessage,
  listSupportMessages,
  touchSupportChat,
} from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/**
 * Чат поддержки со стороны туриста.
 *
 * Собеседник опознаётся по номеру паспорта из localStorage. Это не
 * секрет и не пароль: номер лежит на устройстве и никого не
 * аутентифицирует — он лишь склеивает сообщения одного человека в одну
 * ветку. Поэтому в чате нет ничего, что нельзя показать: переписка с
 * поддержкой, а не личный кабинет.
 */

/** Формат номера — тот же, что выдаёт приложение: UZT-2026-123456. */
const ID_RE = /^UZT-\d{4}-\d{6}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!ID_RE.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const after = Number(url.searchParams.get("after") ?? 0);
  return NextResponse.json({
    messages: listSupportMessages(id, Number.isFinite(after) ? after : 0),
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = typeof body.travellerId === "string" ? body.travellerId : "";
  if (!ID_RE.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 1 || text.length > 2000) {
    return NextResponse.json({ error: "text_invalid" }, { status: 400 });
  }

  const lat = typeof body.lat === "number" ? body.lat : null;
  const lon = typeof body.lon === "number" ? body.lon : null;
  const hasPoint =
    lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

  touchSupportChat({
    travellerId: id,
    name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : null,
    lang: langFromParam(typeof body.lang === "string" ? body.lang : null),
  });

  const messageId = addSupportMessage({
    travellerId: id,
    author: "user",
    text,
    lat: hasPoint ? lat : null,
    lon: hasPoint ? lon : null,
  });

  return NextResponse.json({ ok: true, id: messageId });
}
