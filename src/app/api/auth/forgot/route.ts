import { NextResponse } from "next/server";
import { createReset, findByEmail } from "@/lib/users";

export const dynamic = "force-dynamic";

/**
 * Заявка на смену пароля.
 *
 * Ответ всегда одинаковый — иначе форма превращается в справочник о том,
 * какие адреса у нас зарегистрированы: достаточно перебрать почты и
 * смотреть, где ответ другой.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const user = email ? await findByEmail(email) : null;
  if (user) await createReset(user);

  return NextResponse.json({ ok: true });
}
