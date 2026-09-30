import { NextResponse, type NextRequest } from "next/server";

/**
 * Потолок размера тела для API.
 *
 * Маршруты читают тело целиком (request.json()), и без потолка один
 * запрос на несколько сотен мегабайт кладёт процесс: на бесплатном
 * тарифе Render у него 512 МБ. Проверяем заявленную длину до того, как
 * тело начнут читать. Большие тела нужны лишь загрузкам — у них свой
 * потолок, чуть выше их собственных проверок (base64 толще файла на треть).
 */
const ПОТОЛКИ: [RegExp, number][] = [
  [/^\/api\/ad-media$/, 22 * 1024 * 1024],
  [/^\/api\/(admin\/media|translate-photo|content)$/, 6 * 1024 * 1024],
];
const ОБЫЧНЫЙ = 1024 * 1024;

export function proxy(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") return NextResponse.next();

  const длина = Number(request.headers.get("content-length") ?? 0);
  const путь = request.nextUrl.pathname;
  const потолок = ПОТОЛКИ.find(([шаблон]) => шаблон.test(путь))?.[1] ?? ОБЫЧНЫЙ;
  if (длина > потолок) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
