import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { listResets } from "@/lib/users";

export const dynamic = "force-dynamic";

/** Действующие заявки на смену пароля — оператор передаёт ссылку сам. */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ resets: await listResets() }, { headers: { "Cache-Control": "no-store" } });
}
