import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { createAdmin, deleteAdmin, listAdmins, setAdminPassword, updateAdmin } from "@/lib/admins";
import { рольСуществует, type AdminRole } from "@/lib/admin-roles";
import type { ЗаведениеСотрудника } from "@/lib/admins";
import { readContent } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Заведение для роли «Заведение» — только настоящее: отель или ресторан,
 * который правда есть в содержимом. null — нет или не нашлось.
 */
async function заведениеИз(x: unknown): Promise<ЗаведениеСотрудника | null> {
  if (typeof x !== "object" || x === null) return null;
  const { вид, id } = x as Record<string, unknown>;
  if ((вид !== "hotel" && вид !== "restaurant") || typeof id !== "string" || !id) return null;
  const c = await readContent();
  const список = вид === "hotel" ? c.hotels : c.restaurants;
  return список.some((з) => з.id === id) ? { вид, id } : null;
}

/** Пароль сотрудника — не короче восьми знаков, как у туристов: прав у него больше. */
const МИН_ПАРОЛЬ = 8;

/** Список учётных записей сотрудников. Только владелец (домен staff). */
export async function GET() {
  const нет = await отказЕсли("staff");
  if (нет) return нет;
  return NextResponse.json({ admins: await listAdmins() }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Создание записи, правка (имя/роль/блокировка) и смена пароля — одним
 * роутом, действие выбирается полем `action`. Так UI сотрудников
 * обходится одним адресом.
 */
export async function POST(request: Request) {
  const нет = await отказЕсли("staff");
  if (нет) return нет;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const action = String(body.action ?? "");

  if (action === "create") {
    const username = String(body.username ?? "");
    const name = String(body.name ?? "");
    const password = String(body.password ?? "");
    const role = String(body.role ?? "");
    if (!рольСуществует(role)) {
      return NextResponse.json({ error: "bad_role" }, { status: 400 });
    }
    if (password.length < МИН_ПАРОЛЬ) {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    }
    const заведение = role === "venue" ? await заведениеИз(body.заведение) : null;
    if (role === "venue" && !заведение) {
      return NextResponse.json({ error: "venue_required" }, { status: 400 });
    }
    const итог = await createAdmin({ username, name, password, role, ...(заведение ? { заведение } : {}) });
    if (!итог.ok) return NextResponse.json({ error: итог.error }, { status: 400 });
    return NextResponse.json({ ok: true, admin: итог.admin });
  }

  if (action === "update") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const fields: { name?: string; role?: AdminRole; disabled?: boolean; заведение?: ЗаведениеСотрудника } =
      {};
    if (typeof body.name === "string") fields.name = body.name;
    if (typeof body.role === "string") {
      if (!рольСуществует(body.role)) {
        return NextResponse.json({ error: "bad_role" }, { status: 400 });
      }
      fields.role = body.role;
    }
    if (typeof body.disabled === "boolean") fields.disabled = body.disabled;
    if (body.заведение !== undefined) {
      const заведение = await заведениеИз(body.заведение);
      if (!заведение) return NextResponse.json({ error: "venue_required" }, { status: 400 });
      fields.заведение = заведение;
    }
    const admin = await updateAdmin(id, fields);
    if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, admin });
  }

  if (action === "password") {
    const id = String(body.id ?? "");
    const password = String(body.password ?? "");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    if (password.length < МИН_ПАРОЛЬ) {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    }
    const ok = await setAdminPassword(id, password);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const нет = await отказЕсли("staff");
  if (нет) return нет;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await deleteAdmin(id);
  return NextResponse.json({ ok: true });
}
