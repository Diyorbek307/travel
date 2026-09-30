import { NextResponse } from "next/server";
import { currentAdmin } from "./admin-auth";
import type { ЗаведениеСотрудника } from "./admins";

/**
 * Кабинет заведения: кто вошёл и какое заведение ему принадлежит.
 *
 * Заведение берётся из учётной записи на сервере, а не из запроса: что
 * бы ни прислал браузер, править можно только своё.
 */
export async function моёЗаведение(): Promise<ЗаведениеСотрудника | NextResponse> {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (admin.role !== "venue" || !admin.заведение) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return admin.заведение;
}
