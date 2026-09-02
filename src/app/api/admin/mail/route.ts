import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { проверитьПочту, пробноеПисьмо } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Состояние почты: подключение и вход, без отправки писем. */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await проверитьПочту(), {
    headers: { "Cache-Control": "no-store" },
  });
}

/** Пробное письмо на указанный адрес. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  const ok = await пробноеПисьмо(to);
  return NextResponse.json({ ok });
}
