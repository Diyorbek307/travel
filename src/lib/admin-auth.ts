import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Защита админ-панели.
 *
 * Простой пароль и подписанная cookie — этого достаточно для MVP и внутренней
 * демонстрации, но НЕ для продакшена: там нужны учётные записи редакторов,
 * роли (администратор / контент-менеджер / музей) и журнал изменений.
 * Панель редактирует контент всей платформы, поэтому оставлять её открытой
 * нельзя даже на демостенде.
 */

export const ADMIN_COOKIE = "uz_admin";

function password(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

function secret(): string {
  return process.env.ADMIN_SECRET || `dev-secret:${password()}`;
}

/** Токен = HMAC от пароля. Пароль в cookie не попадает. */
export function makeToken(): string {
  return createHmac("sha256", secret()).update("admin-session").digest("hex");
}

export function checkPassword(input: string): boolean {
  const expected = Buffer.from(password());
  const given = Buffer.from(input);
  // Длины сравниваем отдельно: timingSafeEqual требует одинакового размера.
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = makeToken();
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/** Используется ли пароль по умолчанию — панель об этом предупреждает. */
export function isDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}
