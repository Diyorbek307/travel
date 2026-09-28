import { randomBytes } from "node:crypto";
import path from "node:path";
import { создатьХранилище } from "./storage";
import type { RoomCategory } from "./types";

/**
 * Всё, что создают сами пользователи: переписка с поддержкой, брони и
 * отзывы.
 *
 * Лежит отдельно от содержимого платформы и от учётных записей. Причина
 * та же, что и везде: у этих данных своя судьба. Контент правит
 * редактор, записи — сам человек, а созданное им нельзя ни потерять при
 * обновлении справочника, ни выдать наружу вместе с ним.
 *
 * Записи всегда привязаны к идентификатору аккаунта, а не к имени: имя
 * человек может сменить, и переписка не должна от этого рассыпаться.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

function id(префикс: string): string {
  return `${префикс}-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
}

/* ------------------------------------------------------------------ */
/* Поддержка                                                          */
/* ------------------------------------------------------------------ */

export interface SupportMessage {
  id: string;
  author: "user" | "staff";
  text: string;
  createdAt: string;
}

export interface SupportThread {
  userId: string;
  messages: SupportMessage[];
  updatedAt: string;
  /** Сколько сообщений оператор ещё не открывал. */
  unreadForStaff: number;
}

const поддержка = создатьХранилище<SupportThread[]>(path.join(DATA_DIR, "support.json"), () => []);

export async function listThreads(): Promise<SupportThread[]> {
  return [...(await поддержка.read())].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getThread(userId: string): Promise<SupportThread | null> {
  return (await поддержка.read()).find((t) => t.userId === userId) ?? null;
}

export async function addSupportMessage(
  userId: string,
  author: "user" | "staff",
  text: string,
): Promise<SupportMessage> {
  const сообщение: SupportMessage = {
    id: id("m"),
    author,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  return поддержка.update<SupportMessage>((все) => {
    const i = все.findIndex((t) => t.userId === userId);
    const ветка: SupportThread =
      i === -1 ? { userId, messages: [], updatedAt: сообщение.createdAt, unreadForStaff: 0 } : все[i];

    const обновлённая: SupportThread = {
      ...ветка,
      messages: [...ветка.messages, сообщение],
      updatedAt: сообщение.createdAt,
      // Ответ оператора обнуляет счётчик: он только что всё прочитал.
      unreadForStaff: author === "user" ? ветка.unreadForStaff + 1 : 0,
    };

    const копия = [...все];
    if (i === -1) копия.push(обновлённая);
    else копия[i] = обновлённая;
    return [копия, сообщение];
  });
}

export async function markThreadRead(userId: string): Promise<void> {
  await поддержка.update((все) => {
    const i = все.findIndex((t) => t.userId === userId);
    if (i === -1) return [все, undefined];
    const копия = [...все];
    копия[i] = { ...копия[i], unreadForStaff: 0 };
    return [копия, undefined];
  });
}

/* ------------------------------------------------------------------ */
/* Брони                                                              */
/* ------------------------------------------------------------------ */

export type BookingKind = "hotel" | "restaurant" | "tour";
export type BookingStatus = "new" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  userId: string;
  kind: BookingKind;
  itemId: string;
  itemName: string;
  /** Дата поездки или визита — то, что выбрал человек. */
  date: string;
  guests: number;
  /** Сколько ночей — только у отеля. */
  nights?: number;
  /** Категория номера, если турист её выбрал. */
  roomCategory?: RoomCategory;
  /** Время визита в ресторан, HH:MM. */
  time?: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
  /**
   * Бронь в системе заведения — если оно подключено к HelloUZ Partner
   * API и приняло её. Без поля — обычная заявка для администратора.
   */
  external?: { id: string; status: "confirmed" | "pending" | "rejected" };
}

const брони = создатьХранилище<Booking[]>(path.join(DATA_DIR, "bookings.json"), () => []);

export async function listBookings(): Promise<Booking[]> {
  return [...(await брони.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listUserBookings(userId: string): Promise<Booking[]> {
  return (await listBookings()).filter((b) => b.userId === userId);
}

export async function createBooking(input: Omit<Booking, "id" | "status" | "createdAt">) {
  const бронь: Booking = {
    ...input,
    id: id("b"),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  await брони.update((все) => [[...все, бронь], undefined]);
  return бронь;
}

/** Записать ответ системы заведения на бронь. */
export async function setBookingExternal(
  bookingId: string,
  external: NonNullable<Booking["external"]>,
): Promise<void> {
  await брони.update((все) => {
    const i = все.findIndex((b) => b.id === bookingId);
    if (i === -1) return [все, undefined];
    const копия = [...все];
    // Заведение подтвердило само — заявка уже не «новая».
    const status: BookingStatus =
      external.status === "confirmed"
        ? "confirmed"
        : external.status === "rejected"
        ? "cancelled"
        : копия[i].status;
    копия[i] = { ...копия[i], external, status };
    return [копия, undefined];
  });
}

export async function setBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  await брони.update((все) => {
    const i = все.findIndex((b) => b.id === bookingId);
    if (i === -1) return [все, undefined];
    const копия = [...все];
    копия[i] = { ...копия[i], status };
    return [копия, undefined];
  });
}

/* ------------------------------------------------------------------ */
/* SOS — сигнал «Отправить геолокацию» из экстренной помощи            */
/* ------------------------------------------------------------------ */

export interface SosAlert {
  id: string;
  userId: string | null;
  userName: string;
  userInfo: string; // страна/телефон/язык — что известно о туристе
  lat: number;
  lon: number;
  status: "new" | "seen";
  createdAt: string;
}

const сигналы = создатьХранилище<SosAlert[]>(path.join(DATA_DIR, "sos.json"), () => []);

export async function listSos(): Promise<SosAlert[]> {
  return [...(await сигналы.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createSos(input: Omit<SosAlert, "id" | "status" | "createdAt">) {
  const s: SosAlert = { ...input, id: id("sos"), status: "new", createdAt: new Date().toISOString() };
  await сигналы.update((все) => [[...все, s], undefined]);
  return s;
}

/** Оператор взял сигнал в работу — он больше не горит как новый. */
export async function отметитьSos(sosId: string): Promise<void> {
  await сигналы.update((все) => {
    const i = все.findIndex((s) => s.id === sosId);
    if (i === -1) return [все, undefined];
    const копия = [...все];
    копия[i] = { ...копия[i], status: "seen" };
    return [копия, undefined];
  });
}

/* ------------------------------------------------------------------ */
/* Отзывы                                                             */
/* ------------------------------------------------------------------ */

export type ReviewStatus = "published" | "hidden";

export interface Review {
  id: string;
  userId: string;
  /** Имя автора для показа. Только имя: фамилия отзыву не нужна. */
  userName?: string;
  placeId: string;
  placeName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
}

const отзывы = создатьХранилище<Review[]>(path.join(DATA_DIR, "reviews.json"), () => []);

export async function listReviews(): Promise<Review[]> {
  return [...(await отзывы.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listPlaceReviews(placeId: string): Promise<Review[]> {
  // Наружу отдаём только опубликованные: скрытое видит лишь панель.
  return (await listReviews()).filter((r) => r.placeId === placeId && r.status === "published");
}

export async function createReview(input: Omit<Review, "id" | "status" | "createdAt">) {
  const отзыв: Review = {
    ...input,
    id: id("r"),
    // Публикуем сразу: премодерация каждого отзыва задержала бы их на
    // сутки и превратила раздел в кладбище. Скрыть можно в панели.
    status: "published",
    createdAt: new Date().toISOString(),
  };

  return отзывы.update<Review>((все) => {
    // Один человек — один отзыв на место. Повторный заменяет прежний,
    // иначе рейтинг накручивается с одного аккаунта.
    const прежний = все.find((r) => r.userId === input.userId && r.placeId === input.placeId);
    const без = все.filter((r) => r !== прежний);
    // Скрытый модератором отзыв остаётся скрытым и после правки: иначе
    // его обходили бы простой повторной отправкой.
    const итог = прежний?.status === "hidden" ? { ...отзыв, status: "hidden" as const } : отзыв;
    return [[...без, итог], итог];
  });
}

export async function setReviewStatus(reviewId: string, status: ReviewStatus): Promise<void> {
  await отзывы.update((все) => {
    const i = все.findIndex((r) => r.id === reviewId);
    if (i === -1) return [все, undefined];
    const копия = [...все];
    копия[i] = { ...копия[i], status };
    return [копия, undefined];
  });
}
