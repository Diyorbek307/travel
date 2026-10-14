import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  адресСайта,
  обменятьКод,
  распаковать,
  выдатьБилет,
  КУКА_СОСТОЯНИЯ,
  type Состояние,
} from "@/lib/oauth";
import { makeSession, SESSION_COOKIE, SESSION_TTL_MS, touchUser, войтиЧерезПровайдера } from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Возврат от Google (GET) или Apple (POST-форма).
 *
 * Сайт: открываем сессию и ведём туда, откуда начинали. Приложение: вход
 * шёл в системном браузере, поэтому отдаём разовый билет через hellouz://
 * — приложение само обменяет его на сессию в своём WebView.
 */
async function обработать(request: Request, provider: string, поля: URLSearchParams) {
  const сайт = адресСайта(request);
  const банка = await cookies();
  const с = распаковать(банка.get(КУКА_СОСТОЯНИЯ)?.value);
  const ошибка = (код: string, сост: Состояние | null) => вернуть(сайт, сост, { error: код });

  if (!с || с.провайдер !== provider) return ошибка("state", с);
  if (поля.get("state") !== с.state) return ошибка("state", с);
  if (поля.get("error"))
    return ошибка(
      поля.get("error") === "access_denied" || поля.get("error") === "user_cancelled_authorize"
        ? "cancelled"
        : "provider",
      с,
    );
  const код = поля.get("code");
  if (!код) return ошибка("provider", с);

  const личность = await обменятьКод(с, код, сайт, поля.get("user") ?? undefined).catch(() => null);
  if (!личность) return ошибка("provider", с);
  const user = await войтиЧерезПровайдера(личность);
  if (typeof user === "string") return ошибка(user, с);
  await touchUser(user.id);

  if (с.приложение) return вернуть(сайт, с, { ticket: выдатьБилет(user.id) });

  const res = NextResponse.redirect(`${сайт}${с.дальше}`, 303);
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  res.cookies.delete({ name: КУКА_СОСТОЯНИЯ, path: "/api/auth/oauth" });
  return res;
}

function вернуть(сайт: string, с: Состояние | null, что: { error?: string; ticket?: string }) {
  if (с?.приложение) {
    const ссылка = `hellouz://auth?${new URLSearchParams({ ...что, next: с.дальше })}`;
    // Страница, а не голый редирект: браузер может не открыть чужую схему
    // без нажатия — тогда человек нажмёт кнопку сам.
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HelloUZ</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#071011;color:#fff;font-family:system-ui,sans-serif;text-align:center}a{display:inline-block;margin-top:18px;padding:14px 26px;border-radius:16px;background:linear-gradient(120deg,#E9C46A,#2ec4b6);color:#05100f;font-weight:700;text-decoration:none}</style></head>
<body><div><p>${что.ticket ? "✓" : "×"}</p><a href="${ссылка.replace(/&/g, "&amp;")}">HelloUZ →</a></div>
<script>location.href=${JSON.stringify(ссылка)}</script></body></html>`;
    const res = new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
    res.cookies.delete({ name: КУКА_СОСТОЯНИЯ, path: "/api/auth/oauth" });
    return res;
  }
  const res = NextResponse.redirect(
    `${сайт}/?auth=login&oauth_error=${encodeURIComponent(что.error ?? "provider")}`,
    303,
  );
  res.cookies.delete({ name: КУКА_СОСТОЯНИЯ, path: "/api/auth/oauth" });
  return res;
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return обработать(request, provider, new URL(request.url).searchParams);
}

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const форма = await request.formData().catch(() => null);
  const поля = new URLSearchParams();
  форма?.forEach((v, k) => typeof v === "string" && поля.set(k, v));
  return обработать(request, provider, поля);
}
