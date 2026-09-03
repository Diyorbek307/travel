import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { readContent, writeContent } from "@/lib/store";
import type { Content, ContentKey } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Разделы, которые разрешено менять — чтобы запрос не завёл лишних. */
const KEYS: ContentKey[] = ["cities", "places", "hotels", "restaurants", "routes", "events", "ads", "audio"];

export async function GET() {
  const content = await readContent();
  return NextResponse.json(content, {
    // Приложение должно видеть правки сразу после сохранения в панели.
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const incoming = body as Partial<Record<ContentKey, unknown>>;
  const current = await readContent();
  const next = { ...current } as Content;

  for (const key of KEYS) {
    const value = incoming[key];
    if (value === undefined) continue;
    if (!Array.isArray(value)) {
      return NextResponse.json({ error: `${key}_not_array` }, { status: 400 });
    }
    // Состав раздела проверяет вызывающая сторона; здесь важно лишь,
    // что пришёл массив под известным ключом.
    (next[key] as unknown[]) = value;
  }

  await writeContent(next);
  return NextResponse.json({ ok: true });
}
