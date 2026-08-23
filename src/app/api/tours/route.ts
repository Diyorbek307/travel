import { NextResponse } from "next/server";
import { listTours } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lang = langFromParam(params.get("lang"));
  const city = params.get("city") ?? undefined;
  return NextResponse.json({ tours: listTours(lang, city) });
}
