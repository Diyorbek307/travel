import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import path from "node:path";

/**
 * Учётные записи туристов.
 *
 * Лежат отдельно от содержимого платформы: это персональные данные, и
 * мешать их с городами и отелями нельзя — у них разный срок хранения,
 * разные права доступа и разная цена ошибки.
 *
 * Паспортных данных здесь нет намеренно. Приложение ими не пользуется, а
 * хранить документы значит взять на себя обязательства, которых можно
 * избежать, просто не собирая их.
 */

const scryptAsync = promisify(scrypt);

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "users.json");

/** Сколько живёт сессия без единого входа — три месяца. */
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE = "uz_session";

export interface User {
  id: string;
  email: string;
  /** Хеш пароля в виде `соль:ключ`. Открытого пароля здесь нет никогда. */
  passwordHash: string;
  firstName: string;
  lastName: string;
  /** Фотография как data-URL. Паспорт и документы не хранятся. */
  photo: string | null;
  country: string;
  phone: string;
  /** Почта подтверждена кодом из письма. */
  emailVerified: boolean;
  createdAt: string;
  lastSeenAt: string;
}

/** Что можно отдавать наружу: без хеша пароля. */
export type { PublicUser } from "./types";

export function publicUser(u: User): Omit<User, "passwordHash"> {
  const { passwordHash: _hidden, ...rest } = u;
  return rest;
}

let cache: User[] | null = null;

async function readAll(): Promise<User[]> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(FILE, "utf8")) as User[];
  } catch {
    cache = [];
  }
  return cache;
}

async function writeAll(users: User[]): Promise<void> {
  cache = users;
  await mkdir(DATA_DIR, { recursive: true });
  // Через временный файл: падение на середине записи не должно оставить
  // обрезанный список учётных записей.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(users, null, 2), "utf8");
  await rename(tmp, FILE);
}

/* ------------------------------------------------------------------ */
/* Пароли                                                             */
/* ------------------------------------------------------------------ */

/**
 * scrypt со случайной солью на каждого.
 *
 * Обычный SHA здесь не годится: он считается слишком быстро, и подбор по
 * словарю на видеокарте занимает часы. scrypt намеренно медленный и
 * требует памяти.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const attempt = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  // Сравнение за постоянное время: обычное === выдаёт длину совпадения.
  return attempt.length === expected.length && timingSafeEqual(attempt, expected);
}

/* ------------------------------------------------------------------ */
/* Сессии                                                             */
/* ------------------------------------------------------------------ */

function secret(): string {
  return process.env.SESSION_SECRET ?? process.env.ADMIN_SECRET ?? "uz-session-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Токен: идентификатор, срок и подпись. Ничего секретного внутри нет. */
export function makeSession(userId: string): string {
  const expires = String(Date.now() + SESSION_TTL_MS);
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function readSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expires, signature] = parts;
  if (Number(expires) < Date.now()) return null;

  const expected = sign(`${userId}.${expires}`);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  return userId;
}

/* ------------------------------------------------------------------ */
/* Операции                                                           */
/* ------------------------------------------------------------------ */

export async function findByEmail(email: string): Promise<User | null> {
  const users = await readAll();
  const needle = email.trim().toLowerCase();
  return users.find((u) => u.email === needle) ?? null;
}

export async function findById(id: string): Promise<User | null> {
  return (await readAll()).find((u) => u.id === id) ?? null;
}

export async function listUsers(): Promise<Omit<User, "passwordHash">[]> {
  return (await readAll()).map(publicUser);
}

export async function createUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  country: string;
  phone: string;
}): Promise<User> {
  const users = await readAll();
  const now = new Date().toISOString();

  const user: User = {
    id: `u-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`,
    email: input.email.trim().toLowerCase(),
    passwordHash: await hashPassword(input.password),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    photo: input.photo,
    country: input.country.trim(),
    phone: input.phone.trim(),
    emailVerified: false,
    createdAt: now,
    lastSeenAt: now,
  };

  await writeAll([...users, user]);
  return user;
}

/**
 * Отмечает вход.
 *
 * Дата нужна не для отчётов, а для правила «не заходил три месяца —
 * входи заново»: срок отсчитывается от последнего появления, поэтому
 * постоянный пользователь не выпадает никогда.
 */
export async function touchUser(id: string): Promise<void> {
  const users = await readAll();
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return;
  users[i] = { ...users[i], lastSeenAt: new Date().toISOString() };
  await writeAll(users);
}

export async function deleteUser(id: string): Promise<void> {
  await writeAll((await readAll()).filter((u) => u.id !== id));
}

/* ------------------------------------------------------------------ */
/* Подтверждение почты                                                */
/* ------------------------------------------------------------------ */

/**
 * Код из письма, а не ссылка.
 *
 * Приложение ставится как PWA, и ссылка из письма открылась бы в
 * браузере по умолчанию — это другая сессия, и человек вернулся бы не
 * туда, откуда уходил. Шесть цифр он вводит, не покидая приложение.
 */
interface Verification {
  email: string;
  code: string;
  expiresAt: string;
  /** Сколько раз ошиблись: перебор из миллиона вариантов недопустим. */
  attempts: number;
  /** Когда письмо ушло в прошлый раз — от этого считается пауза. */
  sentAt: string;
  /** Сколько раз просили прислать заново: пауза растёт с каждым разом. */
  resends: number;
}

/**
 * Пауза между письмами: полминуты, минута, две, пять.
 *
 * Растущая, а не постоянная. Человек, у которого письмо задержалось,
 * ждёт всего тридцать секунд, а тот, кто долбит кнопку, упирается в
 * минуты — и чужой ящик не завалит, и наш адрес не попадёт в спам-листы.
 */
const ПАУЗЫ_СЕК = [30, 60, 120, 300];

export function паузаПослеОтправок(resends: number): number {
  return ПАУЗЫ_СЕК[Math.min(resends, ПАУЗЫ_СЕК.length - 1)];
}

const VERIFY_FILE = path.join(DATA_DIR, "verifications.json");

/** Пятнадцать минут: успеть открыть почту, но не оставлять код жить. */
export const VERIFY_TTL_MS = 15 * 60 * 1000;

/** Больше пяти попыток — код сгорает, нужен новый. */
const MAX_ATTEMPTS = 5;

async function readVerifications(): Promise<Verification[]> {
  try {
    return JSON.parse(await readFile(VERIFY_FILE, "utf8")) as Verification[];
  } catch {
    return [];
  }
}

async function writeVerifications(list: Verification[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${VERIFY_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await rename(tmp, VERIFY_FILE);
}

export async function createVerification(email: string): Promise<string> {
  // Код из crypto, а не из Math.random: тот предсказуем по предыдущим
  // значениям, и коды подтверждения им генерировать нельзя.
  const code = String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
  const все = await readVerifications();
  const прошлая = все.find((v) => v.email === email);
  const прочие = все.filter((v) => v.email !== email);

  await writeVerifications([
    ...прочие,
    {
      email,
      code,
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS).toISOString(),
      attempts: 0,
      sentAt: new Date().toISOString(),
      // Счётчик переживает выдачу нового кода: иначе пауза сбрасывалась
      // бы каждой отправкой и не росла никогда.
      resends: прошлая ? прошлая.resends + 1 : 0,
    },
  ]);
  return code;
}

/**
 * Сколько ещё ждать до следующего письма.
 *
 * Ноль означает «можно отправлять». Проверка на сервере, а не только в
 * интерфейсе: кнопку с обратным отсчётом обходят одним запросом.
 */
export async function ждатьДоОтправки(email: string): Promise<number> {
  const v = (await readVerifications()).find((x) => x.email === email);
  if (!v) return 0;
  const прошло = (Date.now() - new Date(v.sentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(паузаПослеОтправок(v.resends) - прошло));
}

export type VerifyResult = "ok" | "wrong" | "expired" | "none";

export async function applyVerification(email: string, code: string): Promise<VerifyResult> {
  const list = await readVerifications();
  const i = list.findIndex((v) => v.email === email);
  if (i === -1) return "none";

  const v = list[i];
  if (new Date(v.expiresAt).getTime() < Date.now() || v.attempts >= MAX_ATTEMPTS) {
    await writeVerifications(list.filter((_, k) => k !== i));
    return "expired";
  }

  if (v.code !== code.trim()) {
    list[i] = { ...v, attempts: v.attempts + 1 };
    await writeVerifications(list);
    return "wrong";
  }

  const users = await readAll();
  const ui = users.findIndex((u) => u.email === email);
  if (ui === -1) return "none";
  users[ui] = { ...users[ui], emailVerified: true };
  await writeAll(users);

  await writeVerifications(list.filter((_, k) => k !== i));
  return "ok";
}

/** Действующие коды — оператору, пока почта не подключена. */
export async function listVerifications(): Promise<Verification[]> {
  const now = Date.now();
  return (await readVerifications()).filter((v) => new Date(v.expiresAt).getTime() > now);
}

/* ------------------------------------------------------------------ */
/* Восстановление пароля                                              */
/* ------------------------------------------------------------------ */

/**
 * Заявка на сброс пароля.
 *
 * Почтового сервиса в проекте нет, поэтому ссылку не отправить письмом —
 * она появляется в панели, и оператор передаёт её человеку. Механизм при
 * этом настоящий: одноразовый токен с коротким сроком. Подключение
 * почты сведётся к одной отправке в /api/auth/forgot.
 */
export interface ResetRequest {
  token: string;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

const RESETS_FILE = path.join(DATA_DIR, "resets.json");

/** Час: ссылка на смену пароля не должна жить дольше нужного. */
export const RESET_TTL_MS = 60 * 60 * 1000;

async function readResets(): Promise<ResetRequest[]> {
  try {
    return JSON.parse(await readFile(RESETS_FILE, "utf8")) as ResetRequest[];
  } catch {
    return [];
  }
}

async function writeResets(list: ResetRequest[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${RESETS_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await rename(tmp, RESETS_FILE);
}

export async function createReset(user: User): Promise<ResetRequest> {
  const now = Date.now();
  const заявка: ResetRequest = {
    token: randomBytes(24).toString("hex"),
    userId: user.id,
    email: user.email,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + RESET_TTL_MS).toISOString(),
    usedAt: null,
  };
  // Прошлые заявки этого же человека гасим: иначе старая ссылка осталась
  // бы рабочей после запроса новой.
  const прочие = (await readResets()).filter((r) => r.userId !== user.id);
  await writeResets([...прочие, заявка]);
  return заявка;
}

export async function listResets(): Promise<ResetRequest[]> {
  const now = Date.now();
  return (await readResets())
    .filter((r) => !r.usedAt && new Date(r.expiresAt).getTime() > now)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Меняет пароль по одноразовой ссылке. Токен после этого мёртв. */
export async function applyReset(token: string, password: string): Promise<boolean> {
  const заявки = await readResets();
  const i = заявки.findIndex((r) => r.token === token);
  if (i === -1) return false;

  const заявка = заявки[i];
  if (заявка.usedAt) return false;
  if (new Date(заявка.expiresAt).getTime() < Date.now()) return false;

  const users = await readAll();
  const ui = users.findIndex((u) => u.id === заявка.userId);
  if (ui === -1) return false;

  users[ui] = { ...users[ui], passwordHash: await hashPassword(password) };
  await writeAll(users);

  заявки[i] = { ...заявка, usedAt: new Date().toISOString() };
  await writeResets(заявки);
  return true;
}
