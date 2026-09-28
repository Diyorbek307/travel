import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { readContent } from "@/lib/store";
import {
  адресГодится,
  наличие,
  обновитьАдрес,
  сохранитьСекрет,
  списокПодключений,
  удалитьСекрет,
  type ВидЗаведения,
} from "@/lib/partners";

export const dynamic = "force-dynamic";

/**
 * Ключи доступа к системам заведений (OSHBOARD и любые другие).
 *
 * Управляет тот же, кто правит содержимое: он и включает заведению
 * режим «система партнёра». Ключ уходит сюда один раз и дальше
 * показывается только хвостом — прочитать его обратно нельзя.
 */

function разобрать(body: unknown): { вид: ВидЗаведения; id: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const вид = b.kind;
  const id = typeof b.id === "string" ? b.id.trim() : "";
  if ((вид !== "hotel" && вид !== "restaurant") || !id) return null;
  return { вид, id };
}

export async function GET() {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  return NextResponse.json(
    { подключения: await списокПодключений() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Сохранить адрес и ключ. Ключ можно не присылать — тогда остаётся прежний. */
export async function PUT(request: Request) {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const цель = разобрать(body);
  if (!цель || !body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : "";
  if (!адресГодится(baseUrl)) return NextResponse.json({ error: "url_invalid" }, { status: 400 });

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (key.length > 500) return NextResponse.json({ error: "key_invalid" }, { status: 400 });
  if (key) {
    await сохранитьСекрет(цель.вид, цель.id, { baseUrl, key });
  } else if (!(await обновитьАдрес(цель.вид, цель.id, baseUrl))) {
    // Ключ не прислали, а сохранённого нет — подключать нечем.
    return NextResponse.json({ error: "key_required" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  const цель = разобрать(await request.json().catch(() => null));
  if (!цель) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await удалитьСекрет(цель.вид, цель.id);
  return NextResponse.json({ ok: true });
}

/** «Проверить связь»: спрашиваем наличие на завтра и показываем, что пришло. */
export async function POST(request: Request) {
  const нет = await отказЕсли("content");
  if (нет) return нет;
  const цель = разобрать(await request.json().catch(() => null));
  if (!цель) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const content = await readContent();
  const запись =
    цель.вид === "hotel"
      ? content.hotels.find((h) => h.id === цель.id)
      : content.restaurants.find((r) => r.id === цель.id);
  if (!запись) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (запись.connection?.kind !== "partner" || !запись.connection.externalId) {
    return NextResponse.json({
      ok: false,
      причина: "Включите режим «Система партнёра» и укажите ID заведения.",
    });
  }

  const завтра = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const н = await наличие(цель.вид, запись, {
    checkin: завтра,
    nights: 1,
    date: завтра,
    time: "19:00",
    guests: 2,
  });
  return NextResponse.json(
    н
      ? { ok: true, наличие: н }
      : { ok: false, причина: "Система не ответила или ответила не по стандарту HelloUZ Partner API." },
  );
}
