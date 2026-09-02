import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { listResets, listVerifications } from "@/lib/users";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * Действующие заявки на смену пароля и коды подтверждения.
 *
 * Нужны, только пока не подключён почтовый сервис: тогда оператор
 * передаёт ссылку или код сам. С настроенной почтой всё уходит письмом,
 * и заглядывать сюда незачем.
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    {
      resets: await listResets(),
      verifications: await listVerifications(),
      mailConfigured: mailConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
