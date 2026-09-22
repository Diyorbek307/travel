import { NextResponse } from "next/server";
import { readAdVideo, разобрать } from "@/lib/ad-media";

export const dynamic = "force-dynamic";

/**
 * Отдаёт рекламный ролик. Публично: его и так видят все.
 *
 * С поддержкой Range (частичной отдачи): без неё Safari на iPhone не
 * проигрывает видео вовсе. Файл небольшой, поэтому держим его в памяти
 * целиком и нарезаем нужный кусок.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dataUrl = await readAdVideo(id);
  if (!dataUrl) return new NextResponse(null, { status: 404 });

  const разбор = разобрать(dataUrl);
  if (!разбор) return new NextResponse(null, { status: 404 });
  const { тип, данные } = разбор;
  const всего = данные.length;

  const range = request.headers.get("range");
  const m = range?.match(/bytes=(\d+)-(\d*)/);
  if (m) {
    const начало = Number(m[1]);
    const конец = m[2] ? Math.min(Number(m[2]), всего - 1) : всего - 1;
    if (начало >= всего || начало > конец) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${всего}` } });
    }
    const кусок = данные.subarray(начало, конец + 1);
    return new NextResponse(new Uint8Array(кусок), {
      status: 206,
      headers: {
        "Content-Type": тип,
        "Content-Range": `bytes ${начало}-${конец}/${всего}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(кусок.length),
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return new NextResponse(new Uint8Array(данные), {
    headers: {
      "Content-Type": тип,
      "Accept-Ranges": "bytes",
      "Content-Length": String(всего),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
