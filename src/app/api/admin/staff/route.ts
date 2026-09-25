import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  setAdminPassword,
  updateAdmin,
} from "@/lib/admins";
import { рольСуществует } from "@/lib/admin-roles";

export const dynamic = "force-dynamic";

/** Пароль сотрудника — не короче восьми знаков, как у туристов: прав у него больше. */
const МИН_ПАРОЛЬ = 8;

/** Список учётных записей сотрудников. Только владелец (домен staff). */
export async function GET() {
  const нет = await отказЕсли("staff");
  if (нет) return нет;
  return NextResponse.json(
    { admins: await listAdmins() },
    { headers: { "Cache-Control": "no-store" } },
  );
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
    const итог = await createAdmin({ username, name, password, role });
    if (!итог.ok) return NextResponse.json({ error: итог.error }, { status: 400 });
    return NextResponse.json({ ok: true, admin: итог.admin });
  }

  if (action === "update") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const fields: { name?: string; role?: "owner" | "editor" | "support"; disabled?: boolean } = {};
    if (typeof body.name === "string") fields.name = body.name;
    if (typeof body.role === "string") {
      if (!рольСуществует(body.role)) {
        return NextResponse.json({ error: "bad_role" }, { status: 400 });
      }
      fields.role = body.role;
    }
    if (typeof body.disabled === "boolean") fields.disabled = body.disabled;
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
