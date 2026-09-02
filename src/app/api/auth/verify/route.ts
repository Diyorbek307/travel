import { NextResponse } from "next/server";
import {
  applyVerification,
  findByEmail,
  makeSession,
  publicUser,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  touchUser,
} from "@/lib/users";

export const dynamic = "force-dynamic";

const ОТВЕТЫ: Record<string, { error: string; status: number }> = {
  wrong: { error: "code_wrong", status: 400 },
  expired: { error: "code_expired", status: 400 },
  none: { error: "code_none", status: 400 },
};

/** Подтверждение почты кодом. Успех сразу открывает сессию. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code : "";

  const итог = await applyVerification(email, code);
  if (итог !== "ok") {
    const { error, status } = ОТВЕТЫ[итог];
    return NextResponse.json({ error }, { status });
  }

  const user = await findByEmail(email);
  if (!user) return NextResponse.json({ error: "code_none" }, { status: 400 });

  await touchUser(user.id);

  const res = NextResponse.json({ ok: true, user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
