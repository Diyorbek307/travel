import { NextResponse } from "next/server";
import { getMuseumByPoi, getPoi, getPoiMedia, listExhibits } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = langFromParam(new URL(request.url).searchParams.get("lang"));

  const poi = getPoi(slug, lang);
  if (!poi) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const museum = getMuseumByPoi(poi.id);
  return NextResponse.json({
    poi,
    media: getPoiMedia(poi.id),
    exhibits: museum ? listExhibits(museum.id, lang) : [],
  });
}
