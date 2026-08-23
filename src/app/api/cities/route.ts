import { NextResponse } from "next/server";
import { listCities } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const lang = langFromParam(new URL(request.url).searchParams.get("lang"));
  return NextResponse.json({ cities: listCities(lang) });
}
