import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { deleteUser, listUsers, publicUser, продлитьPremium, type User } from "@/lib/users";
import { deletePhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";

/** Запись для панели: без хеша пароля, со ссылкой на снимок. */
function дляПанели(u: Omit<User, "passwordHash">) {
  return { ...u, photoUrl: u.hasPhoto ? `/api/photo/${u.id}` : null };
}

/** Список туристов для панели. Хешей паролей здесь нет. */
export async function GET() {
  const нет = await отказЕсли("users");
  if (нет) return нет;
  return NextResponse.json(
    { users: (await listUsers()).map(дляПанели) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Premium: продлить на месяц или год, либо снять.
 *
 * Это выдача оплаченной услуги, поэтому только владелец (домен money):
 * поддержка видит пользователей, но деньги не её зона.
 */
export async function POST(request: Request) {
  const нет = await отказЕсли("money");
  if (нет) return нет;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const месяцев = Number(body.months);
  if (!id || ![0, 1, 12].includes(месяцев)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const user = await продлитьPremium(id, месяцев);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, user: дляПанели(publicUser(user)) });
}

export async function DELETE(request: Request) {
  const нет = await отказЕсли("users");
  if (нет) return нет;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  // Снимок удаляем вместе с записью: осиротевший файл никому не нужен,
  // а хранить чужое фото после удаления аккаунта тем более нельзя.
  await Promise.all([deleteUser(id), deletePhoto(id)]);
  return NextResponse.json({ ok: true });
}
