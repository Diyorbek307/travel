import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Доступ в админ-панель.
 *
 * Панель показывает геолокацию туристов, финансы и данные сотрудников —
 * открытой в интернет её оставлять нельзя, а в макете экрана входа нет.
 * Поэтому здесь минимальный, но настоящий барьер: общий пароль и
 * подписанная кука.
 *
 * Это защита от посторонних, а не система учётных записей: у всех
 * редакторов один пароль, и кто что изменил — не видно. Для рабочей
 * эксплуатации нужны отдельные входы, роли и журнал.
 */

export const ADMIN_COOKIE = "uz_admin";

/** Сколько живёт сессия: рабочий день, дальше вход заново. */
const TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  return process.env.ADMIN_SECRET ?? "uz-admin-dev-secret";
}

export function isDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function password(): string {
  return process.env.ADMIN_PASSWORD ?? "admin";
}

/** Сравнение за постоянное время: обычное `===` выдаёт длину совпадения. */
export function checkPassword(input: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeToken(): string {
  const expires = String(Date.now() + TTL_MS);
  return `${expires}.${sign(expires)}`;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;

  const expected = sign(expires);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
