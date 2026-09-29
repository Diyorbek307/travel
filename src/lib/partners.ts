import path from "node:path";
import { создатьХранилище } from "./storage";
import { разобратьОтветПартнёра, ручноеНаличие, type Наличие } from "./availability";
import type { Connection, RoomCategory } from "./types";
import { присланноеНаличие } from "./partner-push";

/**
 * Связь с системами заведений: OSHBOARD, iiko, R-Keeper, системы
 * гостиниц — любая, что реализует HelloUZ Partner API (docs/partner-api.md).
 *
 * Мы не пишем отдельный код под каждую кассу. Наоборот: описываем один
 * простой стандарт, и любая система, которая его отдаёт, подключается к
 * HelloUZ одной строкой в панели — адресом и ключом. Не у всех заведений
 * будет OSHBOARD, и приложение не должно от этого зависеть.
 *
 * Ключи доступа лежат здесь, в закрытом хранилище, а не в записи
 * заведения: содержимое заведений отдаётся всем по /api/content.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

export type ВидЗаведения = "hotel" | "restaurant";

export interface Секрет {
  /** Адрес API партнёра, например https://api.oshboard.uz/helloUZ. */
  baseUrl: string;
  key: string;
}

const секреты = создатьХранилище<Record<string, Секрет>>(path.join(DATA_DIR, "partners.json"), () => ({}));

const ключСекрета = (вид: ВидЗаведения, id: string) => `${вид}:${id}`;

/** Адрес партнёра: только https (на своём компьютере разработчика — и http://localhost). */
export function адресГодится(адрес: string): boolean {
  try {
    const u = new URL(адрес);
    if (u.protocol === "https:") return true;
    return (
      process.env.NODE_ENV !== "production" &&
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export async function сохранитьСекрет(вид: ВидЗаведения, id: string, секрет: Секрет): Promise<void> {
  await секреты.update((все) => [{ ...все, [ключСекрета(вид, id)]: секрет }, undefined]);
  кеш.clear();
}

/** Сменить только адрес, оставив сохранённый ключ. false — ключа ещё нет. */
export async function обновитьАдрес(вид: ВидЗаведения, id: string, baseUrl: string): Promise<boolean> {
  const ok = await секреты.update((все) => {
    const был = все[ключСекрета(вид, id)];
    if (!был) return [все, false];
    return [{ ...все, [ключСекрета(вид, id)]: { ...был, baseUrl } }, true];
  });
  кеш.clear();
  return ok;
}

export async function удалитьСекрет(вид: ВидЗаведения, id: string): Promise<void> {
  await секреты.update((все) => {
    const копия = { ...все };
    delete копия[ключСекрета(вид, id)];
    return [копия, undefined];
  });
  кеш.clear();
}

/** Для панели: какие подключения настроены. Ключ целиком не отдаём никогда. */
export async function списокПодключений(): Promise<
  { вид: ВидЗаведения; id: string; baseUrl: string; ключ: string }[]
> {
  const все = await секреты.read();
  return Object.entries(все).map(([k, v]) => {
    const [вид, ...хвост] = k.split(":");
    return {
      вид: вид as ВидЗаведения,
      id: хвост.join(":"),
      baseUrl: v.baseUrl,
      ключ: v.key ? `••••${v.key.slice(-4)}` : "",
    };
  });
}

export interface ПараметрыНаличия {
  /** Гостиница: заезд YYYY-MM-DD и ночей. */
  checkin?: string;
  nights?: number;
  /** Ресторан: дата YYYY-MM-DD и время HH:MM. */
  date?: string;
  time?: string;
  guests?: number;
}

/*
 * Ответы партнёров держим минуту. Турист листает карточки, и без кеша
 * каждый его шаг бил бы в кассу заведения — а она нужна им для работы.
 */
const КЕШ_МС = 60_000;
const кеш = new Map<string, { до: number; значение: Наличие | null }>();

async function спроситьПартнёра(
  вид: ВидЗаведения,
  id: string,
  внешнийId: string,
  п: ПараметрыНаличия,
): Promise<Наличие | null> {
  const секрет = (await секреты.read())[ключСекрета(вид, id)];
  if (!секрет || !адресГодится(секрет.baseUrl)) return null;

  const q = new URLSearchParams({ external_id: внешнийId });
  if (п.checkin) q.set("checkin", п.checkin);
  if (п.nights) q.set("nights", String(п.nights));
  if (п.date) q.set("date", п.date);
  if (п.time) q.set("time", п.time);
  if (п.guests) q.set("guests", String(п.guests));
  const адрес = `${секрет.baseUrl.replace(/\/$/, "")}/v1/availability/${вид}?${q}`;

  const ключКеша = `${вид}:${id}:${q}`;
  const есть = кеш.get(ключКеша);
  if (есть && есть.до > Date.now()) return есть.значение;

  let значение: Наличие | null = null;
  try {
    // Касса заведения может не ответить — ждать её дольше пары секунд
    // нельзя: турист смотрит на карточку прямо сейчас.
    const res = await fetch(адрес, {
      headers: { Authorization: `Bearer ${секрет.key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) значение = разобратьОтветПартнёра(await res.json());
  } catch {
    // Нет связи — просто не показываем наличие, карточка работает как раньше.
  }
  кеш.set(ключКеша, { до: Date.now() + КЕШ_МС, значение });
  return значение;
}

/** Наличие мест у заведения — из ручных цифр или от системы партнёра. */
export async function наличие(
  вид: ВидЗаведения,
  запись: { id: string; connection?: Connection },
  п: ПараметрыНаличия,
): Promise<Наличие | null> {
  const с = запись.connection;
  if (!с || с.kind === "none") return null;
  if (с.kind === "manual") return ручноеНаличие(с);
  if (с.kind === "partner" && с.externalId) return спроситьПартнёра(вид, запись.id, с.externalId, п);
  // Система присылает сама: отдаём последнее присланное, если оно свежее.
  if (с.kind === "push") return присланноеНаличие(вид, запись.id);
  return null;
}

export interface БроньПартнёру {
  helloUzId: string;
  date: string;
  time?: string;
  nights?: number;
  guests: number;
  roomCategory?: RoomCategory;
  name: string;
  phone?: string;
  email?: string;
  note: string;
}

export type ОтветНаБронь = { id: string; status: "confirmed" | "pending" | "rejected" };

/**
 * Отправить бронь в систему заведения. Не вышло (нет связи, отказ,
 * странный ответ) — null: бронь останется заявкой, как без интеграции,
 * и администратор HelloUZ увидит её в панели.
 */
export async function отправитьБронь(
  вид: ВидЗаведения,
  запись: { id: string; connection?: Connection },
  бронь: БроньПартнёру,
): Promise<ОтветНаБронь | null> {
  const с = запись.connection;
  if (с?.kind !== "partner" || !с.externalId) return null;
  const секрет = (await секреты.read())[ключСекрета(вид, запись.id)];
  if (!секрет || !адресГодится(секрет.baseUrl)) return null;
  try {
    const res = await fetch(`${секрет.baseUrl.replace(/\/$/, "")}/v1/reservations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${секрет.key}`,
        "Content-Type": "application/json",
        // Повтор того же запроса (обрыв связи) не должен создать вторую бронь.
        "Idempotency-Key": бронь.helloUzId,
      },
      body: JSON.stringify({
        external_id: с.externalId,
        type: вид,
        hellouz_booking_id: бронь.helloUzId,
        date: бронь.date,
        time: бронь.time,
        nights: бронь.nights,
        guests: бронь.guests,
        room_category: бронь.roomCategory,
        guest: { name: бронь.name, phone: бронь.phone, email: бронь.email },
        note: бронь.note,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as Record<string, unknown>;
    const status = d.status;
    if (
      typeof d.id !== "string" ||
      (status !== "confirmed" && status !== "pending" && status !== "rejected")
    ) {
      return null;
    }
    кеш.clear(); // места изменились
    return { id: d.id, status };
  } catch {
    return null;
  }
}
