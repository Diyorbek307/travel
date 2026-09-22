import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { readAdPolicy, writeAdPolicy } from "@/lib/ad-policy";
import type { AdPolicy } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Правило показа рекламы — читает приложение, поэтому открыто без входа. */
export async function GET() {
  return NextResponse.json(await readAdPolicy(), {
    headers: { "Cache-Control": "no-store" },
  });
}

/** Менять частоту может только владелец (домен money). */
export async function PUT(request: Request) {
  const нет = await отказЕсли("money");
  if (нет) return нет;

  let body: Partial<AdPolicy>;
  try {
    body = (await request.json()) as Partial<AdPolicy>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const текущая = await readAdPolicy();
  await writeAdPolicy({ ...текущая, ...body });
  return NextResponse.json({ ok: true, policy: await readAdPolicy() });
}
