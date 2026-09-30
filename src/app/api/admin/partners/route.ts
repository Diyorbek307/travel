import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin-auth";
import { можетДомен } from "@/lib/admin-roles";
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
import { выдатьКлючПриёма, отозватьКлючПриёма, состояниеПриёма } from "@/lib/partner-push";

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

/**
 * Кто может трогать подключение этого заведения: редактор содержимого —
 * любого, кабинет заведения — только своего. Возвращает отказ или null.
 */
async function отказДля(цель: { вид: ВидЗаведения; id: string } | null): Promise<NextResponse | null> {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (можетДомен(admin.role, "content")) return null;
  const своё =
    admin.role === "venue" && цель && admin.заведение?.вид === цель.вид && admin.заведение.id === цель.id;
  return своё ? null : NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function GET(request: Request) {
  // С ?kind=&id= — ещё и состояние приёма «система присылает сама».
  const q = new URL(request.url).searchParams;
  const цель = разобрать({ kind: q.get("kind"), id: q.get("id") });
  const нет = await отказДля(цель);
  if (нет) return нет;
  // Список всех подключений — только панели; кабинету — лишь его приём.
  const admin = await currentAdmin();
  const всё = admin ? можетДомен(admin.role, "content") : false;
  return NextResponse.json(
    {
      ...(всё ? { подключения: await списокПодключений() } : {}),
      ...(цель ? { приём: await состояниеПриёма(цель.вид, цель.id) } : {}),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Ключ приёма для режима «система присылает сама»: выдать новый (прежний
 * перестаёт работать) или отозвать. Ключ целиком показывается один раз —
 * в этом ответе.
 */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const цель = разобрать(body);
  const нет = await отказДля(цель);
  if (нет) return нет;
  if (!цель || !body) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (body.action === "revoke") {
    await отозватьКлючПриёма(цель.вид, цель.id);
    return NextResponse.json({ ok: true });
  }
  if (body.action !== "issue") return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const ключ = await выдатьКлючПриёма(цель.вид, цель.id);
  return NextResponse.json({ ok: true, ключ });
}

/** Сохранить адрес и ключ. Ключ можно не присылать — тогда остаётся прежний. */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const цель = разобрать(body);
  const нет = await отказДля(цель);
  if (нет) return нет;
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
  const цель = разобрать(await request.json().catch(() => null));
  const нет = await отказДля(цель);
  if (нет) return нет;
  if (!цель) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await удалитьСекрет(цель.вид, цель.id);
  return NextResponse.json({ ok: true });
}

/** «Проверить связь»: спрашиваем наличие на завтра и показываем, что пришло. */
export async function POST(request: Request) {
  const цель = разобрать(await request.json().catch(() => null));
  const нет = await отказДля(цель);
  if (нет) return нет;
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
