import { NextResponse } from "next/server";
import { createUser, createVerification, findByEmail, publicUser, ждатьДоОтправки } from "@/lib/users";
import { mailConfigured, sendMail, письмоСКодом } from "@/lib/mail";
import { savePhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";

/** Простая проверка формы адреса — доставку она не гарантирует. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Фотография хранится прямо в записи, поэтому ограничена по объёму. */
const MAX_PHOTO_BYTES = 400_000;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const email = str("email").toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = str("firstName");
  const lastName = str("lastName");

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "password_short" }, { status: 400 });
  if (!firstName) return NextResponse.json({ error: "first_name_required" }, { status: 400 });
  if (!lastName) return NextResponse.json({ error: "last_name_required" }, { status: 400 });

  const photo = typeof body.photo === "string" ? body.photo : null;
  if (photo && photo.length > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "photo_too_large" }, { status: 400 });
  }

  if (await findByEmail(email)) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const user = await createUser({
    email,
    password,
    firstName,
    lastName,
    photo,
    country: str("country"),
    phone: str("phone"),
  });

  // Снимок кладём отдельным файлом: в учётной записи остаётся только
  // отметка, что он есть.
  // Занятость адреса окончательно решается внутри хранилища: проверка
  // выше отсекает большинство случаев, но при двух одновременных
  // запросах на один адрес оба прошли бы её.
  if (user === "email_taken") {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  // Сессию не выдаём: сперва пусть подтвердит почту кодом из письма.
  // Иначе на чужой адрес можно завести аккаунт и пользоваться им.
  if (photo) await savePhoto(user.id, photo);

  const code = await createVerification(user.email);
  const отправлено = await sendMail({ to: user.email, ...письмоСКодом(code) });

  return NextResponse.json({
    ok: true,
    needsVerification: true,
    user: publicUser(user),
    // Честно говорим приложению, ушло ли письмо: если почта не
    // настроена, экран подскажет обратиться в поддержку.
    mailSent: отправлено,
    mailConfigured: mailConfigured(),
    waitSeconds: await ждатьДоОтправки(user.email),
  });
}
