"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, checkPassword, makeToken } from "@/lib/admin-auth";

export interface LoginResult {
  ok: boolean;
  message: string;
}

export async function login(_prev: LoginResult | null, formData: FormData): Promise<LoginResult> {
  const input = String(formData.get("password") ?? "");
  if (!checkPassword(input)) {
    return { ok: false, message: "Неверный пароль" };
  }

  (await cookies()).set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 12 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/admin");
  return { ok: true, message: "Вход выполнен" };
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}
