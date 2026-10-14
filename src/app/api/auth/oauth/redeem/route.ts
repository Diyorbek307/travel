import { NextResponse } from "next/server";
import { адресСайта, безопасныйПуть, погаситьБилет } from "@/lib/oauth";
import { findById, makeSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/users";

export const dynamic = "force-dynamic";

/** Приложение меняет разовый билет на сессию в своём WebView. */
export async function GET(request: Request) {
  const сайт = адресСайта(request);
  const п = new URL(request.url).searchParams;
  const userId = погаситьБилет(п.get("ticket") ?? "");
  const user = userId ? await findById(userId) : null;
  if (!user) return NextResponse.redirect(`${сайт}/?auth=login&oauth_error=state`);
  const res = NextResponse.redirect(`${сайт}${безопасныйПуть(п.get("next"))}`);
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
