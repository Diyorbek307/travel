import { randomBytes } from "node:crypto";
import path from "node:path";
import { создатьХранилище } from "./storage";

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

const поддержка = создатьХранилище<SupportThread[]>(
  path.join(DATA_DIR, "support.json"),
  () => [],
);

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
      i === -1
        ? { userId, messages: [], updatedAt: сообщение.createdAt, unreadForStaff: 0 }
        : все[i];

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
  note: string;
  status: BookingStatus;
  createdAt: string;
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
/* Отзывы                                                             */
/* ------------------------------------------------------------------ */

export type ReviewStatus = "published" | "hidden";

export interface Review {
  id: string;
  userId: string;
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
    const без = все.filter((r) => !(r.userId === input.userId && r.placeId === input.placeId));
    return [[...без, отзыв], отзыв];
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
