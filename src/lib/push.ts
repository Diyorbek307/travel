import path from "node:path";
import webpush from "web-push";
import { создатьХранилище } from "./storage";
import { findById, premiumАктивен } from "./users";
import { подходит, type Кампания } from "./campaign-rules";

/**
 * Web Push: подписки устройств и рассылка.
 *
 * Работает на ключах VAPID из окружения (VAPID_PUBLIC_KEY,
 * VAPID_PRIVATE_KEY, VAPID_SUBJECT). Пока их нет, push выключен целиком:
 * приложение не показывает кнопку «Включить уведомления», а панель — галочку
 * «Отправить push». Колокольчик в приложении работает и без них.
 *
 * Подписка — это адрес почтового ящика устройства у службы браузера
 * (Google, Mozilla, Apple). Храним её на сервере с привязкой к аккаунту:
 * по аккаунту решается, Premium ли человек, а по городу из подписки — где
 * он был, когда включал уведомления или последний раз открывал приложение.
 */

export interface Подписка {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId: string;
  /** Ближайший город при последнем открытии приложения; null — неизвестно. */
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const подписки = создатьХранилище<Подписка[]>(path.join(DATA_DIR, "push-subs.json"), () => []);

function ключи() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  // Subject — как с нами связаться службе браузера, если рассылка ей
  // мешает: адрес mailto: или сайт. Без него службы отказывают.
  const subject = process.env.VAPID_SUBJECT;
  return publicKey && privateKey && subject ? { publicKey, privateKey, subject } : null;
}

/** Настроен ли push: все три ключа на месте. */
export function pushГотов(): boolean {
  return ключи() !== null;
}

/** Открытый ключ для браузера; null — push не настроен. */
export function публичныйКлюч(): string | null {
  return ключи()?.publicKey ?? null;
}

/** Похоже ли присланное на подписку браузера. */
export function этоПодписка(x: unknown): x is Pick<Подписка, "endpoint" | "keys"> {
  if (typeof x !== "object" || x === null) return false;
  const п = x as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return (
    typeof п.endpoint === "string" &&
    п.endpoint.startsWith("https://") &&
    typeof п.keys?.p256dh === "string" &&
    typeof п.keys?.auth === "string"
  );
}

/**
 * Сохранить подписку. Один адрес — одна запись: повторная подписка того
 * же браузера (или вход другим аккаунтом на нём) обновляет её, а не
 * множит — иначе человек получал бы одно уведомление дважды.
 */
export async function subscribe(
  userId: string,
  sub: Pick<Подписка, "endpoint" | "keys">,
  city: string | null,
): Promise<void> {
  const сейчас = new Date().toISOString();
  await подписки.update((все) => {
    const было = все.find((п) => п.endpoint === sub.endpoint);
    const запись: Подписка = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      userId,
      city,
      createdAt: было?.createdAt ?? сейчас,
      updatedAt: сейчас,
    };
    return [[...все.filter((п) => п.endpoint !== sub.endpoint), запись], undefined];
  });
}

/** Удалить подписку. userId — чтобы чужой аккаунт не отписал это устройство. */
export async function unsubscribe(endpoint: string, userId?: string): Promise<void> {
  await подписки.update((все) => [
    все.filter((п) => !(п.endpoint === endpoint && (!userId || п.userId === userId))),
    undefined,
  ]);
}

export async function countSubscriptions(): Promise<number> {
  return (await подписки.read()).length;
}

/** Что уходит в уведомление; читает public/sw.js. */
export interface ПолезнаяНагрузка {
  title: string;
  body: string;
  /** Куда открыть приложение по нажатию: «/?open=<ссылка кампании>». */
  url: string;
  tag: string;
  /** Большое фото под текстом — только Android; iPhone его не покажет. */
  image?: string;
}

type Отправщик = (sub: Pick<Подписка, "endpoint" | "keys">, данные: string) => Promise<void>;

/** Настоящая отправка через службу браузера. */
const отправитьЧерезСлужбу: Отправщик = async (sub, данные) => {
  const к = ключи();
  if (!к) throw new Error("push не настроен");
  await webpush.sendNotification(sub, данные, {
    vapidDetails: { subject: к.subject, publicKey: к.publicKey, privateKey: к.privateKey },
    // Сутки: уведомление о скидке, дошедшее через неделю, уже вредно.
    TTL: 24 * 60 * 60,
  });
};

let отправщик: Отправщик = отправитьЧерезСлужбу;

/** Подменить отправку. Нужно только проверке: настоящие службы в тесте не позвать. */
export function подменитьОтправщик(свой: Отправщик | null): void {
  отправщик = свой ?? отправитьЧерезСлужбу;
}

/** Код ответа службы из ошибки web-push. */
function кодОтвета(e: unknown): number | undefined {
  return typeof e === "object" && e !== null && "statusCode" in e
    ? Number((e as { statusCode: unknown }).statusCode)
    : undefined;
}

/**
 * Разослать кампанию подходящим подписчикам. Возвращает, скольким ушло.
 *
 * Служба отвечает 404 или 410, когда подписки больше нет: человек снял
 * разрешение или удалил браузер. Такие адреса удаляем сразу — стучаться
 * в пустой ящик при каждой рассылке бессмысленно.
 */
export async function sendCampaign(к: Кампания, картинка?: string): Promise<number> {
  if (!pushГотов() && отправщик === отправитьЧерезСлужбу) return 0;

  const все = await подписки.read();
  // Premium по аккаунту: null — аккаунта больше нет, такой подписке не шлём.
  const premium = new Map<string, boolean | null>();
  const получатели: Подписка[] = [];
  for (const п of все) {
    if (!premium.has(п.userId)) {
      const u = await findById(п.userId);
      premium.set(п.userId, u ? premiumАктивен(u) : null);
    }
    const естьPremium = premium.get(п.userId);
    if (естьPremium === null || естьPremium === undefined) continue;
    if (подходит(к, { premium: естьPremium, city: п.city })) получатели.push(п);
  }

  const данные = JSON.stringify({
    title: `${к.emoji} ${к.title}`.trim(),
    body: к.body,
    url: к.link ? `/?open=${encodeURIComponent(к.link)}` : "/",
    tag: к.id,
    image: картинка,
  } satisfies ПолезнаяНагрузка);

  const мёртвые: string[] = [];
  let ушло = 0;
  // По одной: подписчиков сотни, а пачка одновременных запросов к одной
  // службе упирается в её ограничения.
  for (const п of получатели) {
    try {
      await отправщик(п, данные);
      ушло++;
    } catch (e) {
      const код = кодОтвета(e);
      if (код === 404 || код === 410) мёртвые.push(п.endpoint);
    }
  }
  if (мёртвые.length) {
    await подписки.update((список) => [список.filter((п) => !мёртвые.includes(п.endpoint)), undefined]);
  }
  return ушло;
}
