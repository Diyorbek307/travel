import { NextResponse } from "next/server";
import { readPhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";

/**
 * Фотография профиля.
 *
 * Отдаётся отдельным запросом, а не внутри списка пользователей: так
 * браузер кэширует её сам, а ответы API остаются лёгкими.
 *
 * Снимок не секретный — он и так виден рядом с отзывом, — но и
 * перебирать чужие идентификаторы незачем: они случайные.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dataUrl = await readPhoto(id);
  if (!dataUrl) return new NextResponse(null, { status: 404 });

  const [заголовок, данные] = dataUrl.split(",");
  const тип = заголовок.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";

  return new NextResponse(Buffer.from(данные ?? "", "base64"), {
    headers: {
      "Content-Type": тип,
      // Снимок меняется только вместе с профилем, а адрес при этом тот
      // же — поэтому недолго, но кэшируем.
      "Cache-Control": "private, max-age=3600",
    },
  });
}
