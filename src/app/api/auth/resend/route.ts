import { NextResponse } from "next/server";
import { createVerification, findByEmail, ждатьДоОтправки } from "@/lib/users";
import { sendMail, письмоСКодом } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Новый код взамен потерянного. Прежний перестаёт работать. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const user = email ? await findByEmail(email) : null;

  // Пауза проверяется на сервере: кнопку с отсчётом обходят одним
  // запросом, и без этой проверки ограничение было бы декоративным.
  const ждать = email ? await ждатьДоОтправки(email) : 0;
  if (ждать > 0) {
    return NextResponse.json({ error: "too_soon", waitSeconds: ждать }, { status: 429 });
  }

  // Ответ один на любой адрес: иначе форма показывает, кто у нас есть.
  if (user && !user.emailVerified) {
    const code = await createVerification(user.email);
    await sendMail({ to: user.email, ...письмоСКодом(code) });
  }

  const пауза = email ? await ждатьДоОтправки(email) : 0;
  return NextResponse.json({ ok: true, waitSeconds: пауза });
}
