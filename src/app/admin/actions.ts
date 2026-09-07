"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, checkPassword, makeToken } from "@/lib/admin-auth";
import { подЛимитом } from "@/lib/rate-limit";

export interface LoginResult {
  ok: boolean;
  message: string;
}

export async function login(_prev: LoginResult | null, formData: FormData): Promise<LoginResult> {
  // Тормоз против перебора: у панели один общий пароль, поэтому вход
  // ограничиваем жёстче обычного — восемь попыток в минуту с адреса.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!подЛимитом(`admin-login:${ip}`, 8, 60_000)) {
    return { ok: false, message: "Слишком много попыток. Подождите минуту." };
  }

  const input = String(formData.get("password") ?? "");
  if (!checkPassword(input)) {
    return { ok: false, message: "Неверный пароль" };
  }

  (await cookies()).set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    // Область действия — весь сайт, а не /admin: панель сохраняет
    // содержимое через /api/content, и с узкой областью браузер просто
    // не приложил бы куку к этому запросу.
    path: "/",
    maxAge: 12 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/admin");
  return { ok: true, message: "Вход выполнен" };
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/" });
  revalidatePath("/admin");
}
