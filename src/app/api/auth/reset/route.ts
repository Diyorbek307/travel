import { NextResponse } from "next/server";
import { applyReset } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return NextResponse.json({ error: "password_short" }, { status: 400 });
  }

  if (!(await applyReset(token, password))) {
    return NextResponse.json({ error: "token_invalid" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
