import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { подЛимитом } from "@/lib/rate-limit";
import { партнёрыПользователя, сохранитьТур, удалитьТур } from "@/lib/providers";
import { разобратьТур } from "@/lib/provider-rules";

export const dynamic = "force-dynamic";

/** Туры гида: создать (POST), поправить (PATCH), удалить (DELETE). Только свои. */
async function мойГид(тело: Record<string, unknown>) {
  const user = await currentUser();
  if (!user) return { ошибка: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (!подЛимитом(`cab-tour:${user.id}`, 30, 60_000))
    return { ошибка: NextResponse.json({ error: "too_many" }, { status: 429 }) };
  const id = typeof тело.providerId === "string" ? тело.providerId : "";
  const гид = (await партнёрыПользователя(user.id)).find((п) => п.id === id && п.kind === "guide");
  if (!гид) return { ошибка: NextResponse.json({ error: "not_found" }, { status: 404 }) };
  return { гид };
}

async function сохранить(request: Request, правка: boolean) {
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const { гид, ошибка } = await мойГид(тело);
  if (ошибка) return ошибка;
  const разбор = разобратьТур(тело);
  if (!разбор.ok) return NextResponse.json({ error: разбор.ошибка }, { status: 400 });
  const тур = await сохранитьТур(гид!.id, разбор.поля, правка ? String(тело.id ?? "") : undefined);
  if (!тур) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, tour: тур });
}

export const POST = (r: Request) => сохранить(r, false);
export const PATCH = (r: Request) => сохранить(r, true);

export async function DELETE(request: Request) {
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const { гид, ошибка } = await мойГид(тело);
  if (ошибка) return ошибка;
  const ok = await удалитьТур(гид!.id, String(тело.id ?? ""));
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
