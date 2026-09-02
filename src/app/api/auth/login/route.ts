import { NextResponse } from "next/server";
import { sendMail, письмоСКодом } from "@/lib/mail";
import {
  findByEmail,
  makeSession,
  publicUser,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  touchUser,
  verifyPassword,
  createVerification,
} from "@/lib/users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const user = await findByEmail(email);
  // Один ответ и на неизвестный адрес, и на неверный пароль: иначе форма
  // превращается в справочник о том, кто у нас зарегистрирован.
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  // Почта не подтверждена — сессию не открываем, шлём новый код.
  // Иначе аккаунт на чужой адрес работал бы как обычный.
  if (!user.emailVerified) {
    const code = await createVerification(user.email);
    void sendMail({ to: user.email, ...письмоСКодом(code) }).catch(() => undefined);
    return NextResponse.json({ error: "not_verified", email: user.email }, { status: 403 });
  }

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
