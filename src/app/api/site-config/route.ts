import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { readSiteConfig, writeSiteConfig } from "@/lib/site-config";
import type { SiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

/** Цифры витрины — читает стартовый экран, поэтому открыто без входа. */
export async function GET() {
  return NextResponse.json(await readSiteConfig(), {
    headers: { "Cache-Control": "no-store" },
  });
}

/** Менять может редактор или владелец (домен content). */
export async function PUT(request: Request) {
  const нет = await отказЕсли("content");
  if (нет) return нет;

  let body: Partial<SiteConfig>;
  try {
    body = (await request.json()) as Partial<SiteConfig>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const текущее = await readSiteConfig();
  await writeSiteConfig({ ...текущее, ...body });
  return NextResponse.json({ ok: true, config: await readSiteConfig() });
}
