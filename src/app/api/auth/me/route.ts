import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  findById,
  makeSession,
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
