import { прочитатьФото } from "@/lib/media";

export const dynamic = "force-dynamic";

/**
 * Фото, загруженное в панели. Ссылка у каждого снимка своя и не меняется,
 * поэтому браузер может держать его в кеше сколько угодно.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const фото = await прочитатьФото(id);
  if (!фото) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(фото.данные), {
    headers: {
      "Content-Type": фото.тип,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Не угадывать тип по содержимому: отдаём ровно картинку.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
