import { randomBytes } from "node:crypto";
import path from "node:path";
import { создатьХранилище } from "./storage";
import { hashPassword, verifyPassword } from "./users";
import type { AdminRole } from "./admin-roles";

/**
 * Учётные записи сотрудников панели.
 *
 * Раньше вход был один на всех: общий пароль в переменной окружения. Он
 * остаётся — но теперь как мастер-ключ владельца, а рядом живут именные
 * записи с ролями. По ним видно, кто редактор, а кто поддержка, и вход
 * можно закрыть конкретному человеку, не меняя пароль всем.
 *
 * Хранятся тем же способом, что и туристы (Postgres в бою, файл на
 * машине разработчика), но в отдельном документе: у сотрудников другие
 * права доступа и другая цена ошибки, мешать их с гостями нельзя.
 *
 * Пароль — только в виде scrypt-хеша `соль:ключ`, как у туристов.
 * Открытого пароля здесь нет никогда, включая выдачу наружу.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "admins.json");

/** Логин `admin` закреплён за мастер-входом по переменной окружения. */
export const ЛОГИН_ВЛАДЕЛЬЦА = "admin";

export interface AdminAccount {
  id: string;
  /** Логин: латиница в нижнем регистре, по нему входят. */
  username: string;
  /** Как показывать в панели. */
  name: string;
  passwordHash: string;
  role: AdminRole;
  /** Заблокирован: запись есть, но войти нельзя. */
  disabled: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

/** Наружу — без хеша пароля. */
export type PublicAdmin = Omit<AdminAccount, "passwordHash">;

export function publicAdmin(a: AdminAccount): PublicAdmin {
  const { passwordHash: _hidden, ...rest } = a;
  return rest;
}

const хранилище = создатьХранилище<AdminAccount[]>(FILE, () => []);

export function нормЛогин(x: string): string {
  return x.trim().toLowerCase();
}

/** Логин годен: латиница, цифры, точка/подчёркивание/дефис, 3–32 знака. */
export function логинГоден(x: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(x);
}

export async function listAdmins(): Promise<PublicAdmin[]> {
  return (await хранилище.read()).map(publicAdmin).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function findAdminByUsername(username: string): Promise<AdminAccount | null> {
  const needle = нормЛогин(username);
  return (await хранилище.read()).find((a) => a.username === needle) ?? null;
}

export async function findAdminById(id: string): Promise<AdminAccount | null> {
  return (await хранилище.read()).find((a) => a.id === id) ?? null;
}

export type CreateResult =
  | { ok: true; admin: PublicAdmin }
  | { ok: false; error: "username_taken" | "username_reserved" | "bad_username" };

export async function createAdmin(input: {
  username: string;
  name: string;
  password: string;
  role: AdminRole;
}): Promise<CreateResult> {
  const username = нормЛогин(input.username);
  if (!логинГоден(username)) return { ok: false, error: "bad_username" };
  // Логин владельца занят мастер-входом: завести вторую запись с тем же
  // именем — значит спутать её с ключом по переменной окружения.
  if (username === ЛОГИН_ВЛАДЕЛЬЦА) return { ok: false, error: "username_reserved" };

  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();

  return хранилище.update<CreateResult>((список) => {
    if (список.some((a) => a.username === username)) {
      return [список, { ok: false, error: "username_taken" }];
    }
    const admin: AdminAccount = {
      id: `a-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`,
      username,
      name: input.name.trim().slice(0, 60) || username,
      passwordHash,
      role: input.role,
      disabled: false,
      createdAt: now,
      lastSeenAt: null,
    };
    return [[...список, admin], { ok: true, admin: publicAdmin(admin) }];
  });
}

/** Меняет имя, роль и блокировку. Пароль — отдельным путём. */
export async function updateAdmin(
  id: string,
  fields: Partial<Pick<AdminAccount, "name" | "role" | "disabled">>,
): Promise<PublicAdmin | null> {
  return хранилище.update<PublicAdmin | null>((список) => {
    const i = список.findIndex((a) => a.id === id);
    if (i === -1) return [список, null];
    const копия = [...список];
    const чистые: typeof fields = {};
    if (typeof fields.name === "string") чистые.name = fields.name.trim().slice(0, 60) || копия[i].name;
    if (fields.role) чистые.role = fields.role;
    if (typeof fields.disabled === "boolean") чистые.disabled = fields.disabled;
    копия[i] = { ...копия[i], ...чистые };
    return [копия, publicAdmin(копия[i])];
  });
}

export async function setAdminPassword(id: string, password: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return хранилище.update<boolean>((список) => {
    const i = список.findIndex((a) => a.id === id);
    if (i === -1) return [список, false];
    const копия = [...список];
    копия[i] = { ...копия[i], passwordHash };
    return [копия, true];
  });
}

export async function deleteAdmin(id: string): Promise<void> {
  await хранилище.update((список) => [список.filter((a) => a.id !== id), undefined]);
}

/**
 * Проверка входа по логину и паролю. Заблокированные не проходят.
 * Возвращает запись при успехе, иначе null. Сравнение пароля —
 * постоянного времени внутри verifyPassword.
 */
export async function authenticateAdmin(username: string, password: string): Promise<AdminAccount | null> {
  const admin = await findAdminByUsername(username);
  if (!admin || admin.disabled) return null;
  const ok = await verifyPassword(password, admin.passwordHash);
  return ok ? admin : null;
}

const ОТМЕТКА_НЕ_ЧАЩЕ_МС = 5 * 60 * 1000;

/** Отмечает вход — не чаще раза в пять минут, чтобы не переписывать зря. */
export async function touchAdmin(id: string): Promise<void> {
  await хранилище.update((список) => {
    const i = список.findIndex((a) => a.id === id);
    if (i === -1) return [список, undefined];
    const прошлая = список[i].lastSeenAt;
    if (прошлая && Date.now() - new Date(прошлая).getTime() < ОТМЕТКА_НЕ_ЧАЩЕ_МС) {
      return [список, undefined];
    }
    const копия = [...список];
    копия[i] = { ...копия[i], lastSeenAt: new Date().toISOString() };
    return [копия, undefined];
  });
}
