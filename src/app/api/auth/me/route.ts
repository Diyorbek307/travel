import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  deleteUser,
  findById,
  makeSession,
  updateUser,
  publicUser,
  readSession,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  touchUser,
} from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Кто сейчас в приложении.
 *
 * Срок сессии продлевается при каждом обращении. Поэтому тот, кто
 * пользуется приложением, не вводит пароль никогда, а тот, кто пропал на
 * три месяца, входит заново — отсчёт идёт от последнего появления, а не
 * от даты регистрации.
 */
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = readSession(token);
  if (!userId) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });

  const user = await findById(userId);
  if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });

  await touchUser(user.id);

  const res = NextResponse.json({ user: publicUser(user) }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

/** Правка своего профиля: имя, фамилия, страна, телефон. */
export async function PATCH(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = readSession(token);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const обновлён = await updateUser(userId, {
    firstName: typeof body.firstName === "string" ? body.firstName : undefined,
    lastName: typeof body.lastName === "string" ? body.lastName : undefined,
    country: typeof body.country === "string" ? body.country : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
  });
  if (!обновлён) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ user: publicUser(обновлён) }, { headers: { "Cache-Control": "no-store" } });
}

/** Удаление своего аккаунта. Заодно гасим сессию. */
export async function DELETE() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = readSession(token);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await deleteUser(userId);
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
