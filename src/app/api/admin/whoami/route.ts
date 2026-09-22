import { NextResponse } from "next/server";
import { currentAdmin, ROOT_ID } from "@/lib/admin-auth";
import { findAdminById } from "@/lib/admins";

export const dynamic = "force-dynamic";

/**
 * Кто вошёл в панель: идентификатор, роль и имя. По роли клиент решает,
 * какие разделы показать в меню. Проверка прав всё равно живёт на
 * сервере в каждом роуте — это лишь чтобы не рисовать заведомо закрытое.
 */
export async function GET() {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Мастер-вход по переменной окружения именной записи не имеет.
  const name =
    admin.id === ROOT_ID
      ? "Владелец"
      : (await findAdminById(admin.id))?.name ?? "Сотрудник";

  return NextResponse.json(
    { id: admin.id, role: admin.role, name },
    { headers: { "Cache-Control": "no-store" } },
  );
}
