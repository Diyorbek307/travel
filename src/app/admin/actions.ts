"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, ROOT_ID, checkPassword, makeToken } from "@/lib/admin-auth";
import { authenticateAdmin, touchAdmin, нормЛогин, ЛОГИН_ВЛАДЕЛЬЦА } from "@/lib/admins";
import { подЛимитом } from "@/lib/rate-limit";

export interface LoginResult {
  ok: boolean;
  message: string;
}

export async function login(_prev: LoginResult | null, formData: FormData): Promise<LoginResult> {
  // Тормоз против перебора: вход ограничиваем жёстче обычного — восемь
  // попыток в минуту с адреса.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!подЛимитом(`admin-login:${ip}`, 8, 60_000)) {
    return { ok: false, message: "Слишком много попыток. Подождите минуту." };
  }

  const password = String(formData.get("password") ?? "");
  // Логин можно не вводить: пустое поле — мастер-вход владельца.
  const username = нормЛогин(String(formData.get("username") ?? "") || ЛОГИН_ВЛАДЕЛЬЦА);

  let token: string | null = null;

  if (username === ЛОГИН_ВЛАДЕЛЬЦА) {
    // Мастер-ключ по переменной окружения — всегда владелец.
    if (checkPassword(password)) token = makeToken(ROOT_ID, "owner");
  } else {
    // Именная запись сотрудника с его ролью.
    const admin = await authenticateAdmin(username, password);
    if (admin) {
      token = makeToken(admin.id, admin.role);
      await touchAdmin(admin.id);
    }
  }

  if (!token) {
    return { ok: false, message: "Неверный логин или пароль" };
  }

  (await cookies()).set(ADMIN_COOKIE, token, {
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
