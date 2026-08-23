import { NextResponse } from "next/server";
import { ask } from "@/lib/assistant";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** AI-помощник туриста (п. 4 ТЗ). */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });
  if (text.length > 500) {
    return NextResponse.json({ error: "text_too_long" }, { status: 400 });
  }

  const reply = ask({
    text,
    lang: langFromParam(typeof body.lang === "string" ? body.lang : null),
    city: typeof body.city === "string" ? body.city : undefined,
    lat: typeof body.lat === "number" ? body.lat : undefined,
    lon: typeof body.lon === "number" ? body.lon : undefined,
  });

  return NextResponse.json(reply);
}
