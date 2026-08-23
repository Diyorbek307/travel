import { NextResponse } from "next/server";
import { listPois } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";
import { CATEGORIES, type Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lang = langFromParam(params.get("lang"));
  const city = params.get("city") ?? undefined;

  const rawCategory = params.get("category");
  const category =
    rawCategory && (CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as Category)
      : undefined;

  const pois = listPois({ city, category, lang });
  return NextResponse.json({ pois, count: pois.length });
}
