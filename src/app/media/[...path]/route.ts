import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { mediaDir } from "@/lib/paths.js";

export const dynamic = "force-dynamic";

/**
 * Раздача загруженных медиафайлов (аудиогиды, фотографии).
 *
 * Статику Next.js отдаёт только из `public/`, а этот каталог лежит внутри
 * образа приложения и на хостинге пропадает при каждом перезапуске.
 * Поэтому загруженные файлы хранятся в каталоге данных и раздаются здесь.
 *
 * Поддержан заголовок Range: без него браузер не даёт перематывать аудиогид,
 * а рассказ об объекте — это несколько минут записи.
 */

const CONTENT_TYPE: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  const root = mediaDir();
  const target = path.resolve(root, ...segments);

  // Защита от выхода за пределы каталога данных через «..» в пути.
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  let info;
  try {
    info = await stat(target);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!info.isFile()) return new Response("Not found", { status: 404 });

  const type = CONTENT_TYPE[path.extname(target).toLowerCase()] ?? "application/octet-stream";
  const headers: Record<string, string> = {
    "content-type": type,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=3600",
  };

  const range = request.headers.get("range");
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : info.size - 1;

      if (start >= info.size || end >= info.size || start > end) {
        return new Response("Range not satisfiable", {
          status: 416,
          headers: { "content-range": `bytes */${info.size}` },
        });
      }

      const stream = createReadStream(target, { start, end });
      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          ...headers,
          "content-range": `bytes ${start}-${end}/${info.size}`,
          "content-length": String(end - start + 1),
        },
      });
    }
  }

  const stream = createReadStream(target);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: { ...headers, "content-length": String(info.size) },
  });
}
