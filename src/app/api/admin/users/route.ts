import { NextResponse } from "next/server";
import { отказЕсли } from "@/lib/admin-auth";
import { deleteUser, listUsers } from "@/lib/users";
import { deletePhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";

/** Список туристов для панели. Хешей паролей здесь нет. */
export async function GET() {
  const нет = await отказЕсли("users");
  if (нет) return нет;
  return NextResponse.json(
    { users: await listUsers() },
    { headers: { "Cache-Control": "no-store" } },
  );
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
