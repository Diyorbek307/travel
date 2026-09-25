import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { требуетсяСекрет, вПродакшене } from "./secrets";
import { можетДомен, рольСуществует, type AdminRole, type Домен } from "./admin-roles";
import { findAdminById } from "./admins";

/**
 * Доступ в админ-панель.
 *
 * Панель показывает геолокацию туристов, финансы и данные сотрудников —
 * открытой в интернет её оставлять нельзя. Барьер двойной:
 *
 *  1. Мастер-вход по общему паролю из переменной ADMIN_PASSWORD. Он даёт
 *     роль владельца (учётная запись `root`) и остаётся аварийным ключом:
 *     по нему всегда можно войти, даже если именных записей ещё нет или в
 *     них заблокировались.
 *  2. Именные учётные записи сотрудников (`lib/admins.ts`) с ролями. По
 *     ним видно, кто редактор, а кто поддержка, и вход закрывается
 *     конкретному человеку.
 *
 * В куке лежит подписанный токен: идентификатор, роль и срок. Секретного
 * внутри нет — подпись лишь не даёт его подделать.
 */

export const ADMIN_COOKIE = "uz_admin";

/** Сколько живёт сессия: рабочий день, дальше вход заново. */
const TTL_MS = 12 * 60 * 60 * 1000;

/** Идентификатор мастер-входа по переменной окружения. */
export const ROOT_ID = "root";

export interface AdminSession {
  id: string;
  role: AdminRole;
}

function secret(): string {
  return требуетсяСекрет("ADMIN_SECRET", process.env.ADMIN_SECRET, "uz-admin-dev-secret");
}

export function isDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function password(): string {
  return process.env.ADMIN_PASSWORD ?? "admin";
}

/**
 * Проверка мастер-пароля — за постоянное время: обычное `===` выдаёт
 * длину совпадения по скорости ответа.
 *
 * В бою пароль обязателен. Если его не задали, мастер-вход закрыт: пускать
 * по дефолтному «admin» на боевом стенде — это открытая дверь. На машине
 * разработчика (пароль не задан) по-прежнему пускает «admin».
 */
export function checkPassword(input: string): boolean {
  if (вПродакшене() && isDefaultPassword()) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Токен: идентификатор, роль, срок и подпись над ними. */
export function makeToken(id: string, role: AdminRole): string {
  const expires = String(Date.now() + TTL_MS);
  const payload = `${id}.${role}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

/** Кто вошёл, по куке. null — если не вошёл, срок вышел или подпись не та. */
export async function currentAdmin(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [id, role, expires, signature] = parts;

  if (!id || !rольOk(role) || !expires || !signature) return null;
  if (Number(expires) < Date.now()) return null;

  const expected = sign(`${id}.${role}.${expires}`);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  if (id === ROOT_ID) return role === "owner" ? { id, role } : null;

  // Именная запись: роль и блокировку берём из хранилища, а не из куки.
  // Токен подписан честно, но выдан до изменений — иначе заблокированный,
  // удалённый или пониженный сотрудник работал бы со старыми правами
  // до конца смены.
  const запись = await findAdminById(id);
  if (!запись || запись.disabled) return null;
  return { id, role: запись.role };
}

function rольOk(x: string): x is AdminRole {
  return рольСуществует(x);
}

/** Вошёл ли кто-нибудь. Оставлено булевым — им пользуются старые роуты. */
export async function isAuthenticated(): Promise<boolean> {
  return (await currentAdmin()) !== null;
}

/**
 * Разрешён ли домен вошедшему. Возвращает сессию при доступе, иначе null —
 * так роут одним вызовом и проверяет вход, и получает, кто именно вошёл.
 */
export async function разрешено(домен: Домен): Promise<AdminSession | null> {
  const admin = await currentAdmin();
  if (!admin) return null;
  return можетДомен(admin.role, домен) ? admin : null;
}

/**
 * Готовый отказ для API-роута: 401, если вообще не вошёл, 403 — если
 * вошёл, но роль не даёт домена. `null` — доступ есть, работаем дальше.
 * Так защита раздела — две строки в начале обработчика.
 */
export async function отказЕсли(домен: Домен): Promise<NextResponse | null> {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!можетДомен(admin.role, домен)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
