import { NextResponse } from "next/server";
import {
  адресВхода,
  адресСайта,
  настроен,
  новоеСостояние,
  упаковать,
  КУКА_СОСТОЯНИЯ,
  type Провайдер,
} from "@/lib/oauth";
import { подЛимитом, ipЗапроса } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Начало входа: запомнить state и nonce в куке и отправить к провайдеру. */
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const сайт = адресСайта(request);
  if ((provider !== "google" && provider !== "apple") || !настроен(provider as Провайдер))
    return NextResponse.redirect(`${сайт}/?auth=login&oauth_error=unavailable`);
  if (!подЛимитом(`oauth:${ipЗапроса(request)}`, 20, 60_000))
    return NextResponse.redirect(`${сайт}/?auth=login&oauth_error=too_many`);

  const п = new URL(request.url).searchParams;
  const с = новоеСостояние(provider as Провайдер, п.get("next") ?? "/", п.get("app") === "1");
  const res = NextResponse.redirect(адресВхода(с, сайт));
  // SameSite=None: Apple возвращает POST-формой со своего домена,
  // и кука с Lax до нас бы не дошла.
  res.cookies.set(КУКА_СОСТОЯНИЯ, упаковать(с), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/api/auth/oauth",
    maxAge: 600,
  });
  return res;
}
