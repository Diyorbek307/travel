import path from "node:path";
import { randomBytes } from "node:crypto";
import { создатьХранилище } from "./storage";
import { заказатьEsim, пакетыУзбекистана, type ВыданнаяEsim, type ПакетEsim } from "./airalo";
import { sendMail } from "./mail";

/**
 * Заказы eSIM: от выбора пакета до QR-кода.
 *
 * Порядок железный: сначала деньги, потом eSIM. Airalo списывает стоимость
 * с нашего партнёрского баланса в момент заказа, поэтому заказываем только
 * когда платёжная система (Payme или Click) сама подтвердила оплату по
 * своему секретному ключу — или администратор отметил оплату вручную,
 * увидев её в кабинете. Открыть ссылку оплаты недостаточно.
 *
 * Номер заказа длинный и случайный: он же служит пропуском к своему
 * заказу — турист без аккаунта видит QR-код по нему, а чужой номер
 * угадать нельзя.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

export type СтатусЗаказа = "ждёт_оплаты" | "оплачен" | "выдан" | "ошибка" | "отменён";

export interface ТранзакцияPayme {
  id: string;
  time: number;
  create_time: number;
  perform_time: number;
  cancel_time: number;
  state: 1 | 2 | -1 | -2;
  reason: number | null;
}

export interface ЗаказEsim {
  id: string;
  userId?: string;
  email?: string;
  пакет: Pick<ПакетEsim, "id" | "title" | "data" | "day" | "unlimited" | "operator" | "retailUsd" | "netUsd">;
  /** Сумма к оплате, сум. Сверяется с тем, что пришло от Payme/Click. */
  сумма: number;
  статус: СтатусЗаказа;
  createdAt: string;
  оплачен?: { система: "payme" | "click" | "вручную"; когда: string };
  payme?: ТранзакцияPayme;
  click?: { transId: string; prepareId: number };
  esim?: ВыданнаяEsim & { выдана: string };
  ошибка?: string;
}

const заказы = создатьХранилище<ЗаказEsim[]>(path.join(DATA_DIR, "esim-orders.json"), () => []);

export async function всеЗаказы(): Promise<ЗаказEsim[]> {
  return [...(await заказы.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function заказПоId(id: string): Promise<ЗаказEsim | null> {
  return (await заказы.read()).find((з) => з.id === id) ?? null;
}

/** Правка одного заказа внутри очереди хранилища. */
export async function изменитьЗаказ<R>(
  id: string,
  правка: (з: ЗаказEsim) => [ЗаказEsim, R],
): Promise<R | null> {
  return заказы.update<R | null>((все) => {
    const i = все.findIndex((з) => з.id === id);
    if (i < 0) return [все, null];
    const [новый, итог] = правка(все[i]);
    const копия = [...все];
    копия[i] = новый;
    return [копия, итог];
  });
}

/* ── Цена ─────────────────────────────────────────────────────────────── */

let курс: { значение: number; до: number } | null = null;

/** Сколько сумов за доллар: тот же открытый источник, что у конвертера. */
async function сумовЗаДоллар(): Promise<number> {
  const ручной = Number(process.env.ESIM_USD_UZS);
  if (ручной > 0) return ручной;
  if (курс && курс.до > Date.now()) return курс.значение;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    const d = (await r.json()) as { rates?: { UZS?: number } };
    if (d.rates?.UZS && d.rates.UZS > 1000) {
      курс = { значение: d.rates.UZS, до: Date.now() + 6 * 60 * 60 * 1000 };
      return курс.значение;
    }
  } catch {
    // сеть подвела — ниже запасной курс
  }
  return курс?.значение ?? 12_700;
}

/**
 * Цена для туриста в сумах: рекомендованная цена Airalo плюс наша наценка
 * (ESIM_MARKUP_PERCENT, по умолчанию 0), округлённо до тысячи вверх.
 */
export function ценаВСумах(retailUsd: number, курсСума: number, наценка: number): number {
  const сум = retailUsd * (1 + Math.max(0, наценка) / 100) * курсСума;
  return Math.max(1000, Math.ceil(сум / 1000) * 1000);
}

export async function пакетыСЦенами(): Promise<(ПакетEsim & { сумма: number })[]> {
  const [пакеты, к] = await Promise.all([пакетыУзбекистана(), сумовЗаДоллар()]);
  const наценка = Number(process.env.ESIM_MARKUP_PERCENT) || 0;
  return пакеты.map((п) => ({ ...п, сумма: ценаВСумах(п.retailUsd, к, наценка) }));
}

/* ── Заказ ────────────────────────────────────────────────────────────── */

export async function создатьЗаказ(packageId: string, кто: { userId?: string; email?: string }) {
  const пакет = (await пакетыСЦенами()).find((п) => п.id === packageId);
  if (!пакет) return null;
  const заказ: ЗаказEsim = {
    id: `es${randomBytes(12).toString("hex")}`,
    ...(кто.userId ? { userId: кто.userId } : {}),
    ...(кто.email ? { email: кто.email } : {}),
    пакет: {
      id: пакет.id,
      title: пакет.title,
      data: пакет.data,
      day: пакет.day,
      unlimited: пакет.unlimited,
      operator: пакет.operator,
      retailUsd: пакет.retailUsd,
      netUsd: пакет.netUsd,
    },
    сумма: пакет.сумма,
    статус: "ждёт_оплаты",
    createdAt: new Date().toISOString(),
  };
  await заказы.update((все) => [[...все, заказ], undefined]);
  return заказ;
}

/**
 * Оплата подтверждена — отмечаем и выдаём eSIM. Повторный вызов ничего
 * не ломает: оплаченный заказ второй раз не оплачивается и не выдаётся.
 */
export async function отметитьОплату(id: string, система: "payme" | "click" | "вручную"): Promise<boolean> {
  const стало = await изменитьЗаказ(id, (з) => {
    if (з.статус !== "ждёт_оплаты") return [з, false];
    return [{ ...з, статус: "оплачен", оплачен: { система, когда: new Date().toISOString() } }, true];
  });
  if (стало) void выдать(id);
  return Boolean(стало);
}

/** Заказать eSIM у Airalo для оплаченного заказа (или повторить после сбоя). */
export async function выдать(id: string): Promise<ЗаказEsim | null> {
  const заказ = await заказПоId(id);
  if (!заказ || (заказ.статус !== "оплачен" && заказ.статус !== "ошибка") || заказ.esim) return заказ;
  try {
    const esim = await заказатьEsim(заказ.пакет.id, `HelloUZ ${заказ.id}`);
    const итог = await изменитьЗаказ(id, (з) => {
      const новый: ЗаказEsim = { ...з, статус: "выдан", esim: { ...esim, выдана: new Date().toISOString() } };
      delete новый.ошибка;
      return [новый, новый];
    });
    if (итог?.email) void письмоСEsim(итог);
    return итог;
  } catch (e) {
    const текст = e instanceof Error ? e.message : String(e);
    console.error("[esim]", id, текст);
    return изменитьЗаказ(id, (з) => {
      const новый: ЗаказEsim = { ...з, статус: "ошибка", ошибка: текст.slice(0, 300) };
      return [новый, новый];
    });
  }
}

async function письмоСEsim(з: ЗаказEsim) {
  if (!з.email || !з.esim) return;
  const адрес =
    process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || "https://uzbekistan-travel.onrender.com";
  const ссылка = `${адрес}/?esim=${з.id}`;
  await sendMail({
    to: з.email,
    subject: "Your HelloUZ eSIM for Uzbekistan",
    text: `Your eSIM is ready: ${з.пакет.title}.\n\nInstall: ${ссылка}\nActivation code (LPA): ${
      з.esim.qrcode
    }\n${з.esim.appleUrl ? `iPhone one-tap install: ${з.esim.appleUrl}\n` : ""}\nICCID: ${з.esim.iccid}`,
    html: `<p>Your eSIM is ready: <b>${з.пакет.title}</b>.</p>${
      з.esim.qrcodeUrl ? `<p><img src="${з.esim.qrcodeUrl}" alt="QR" width="220" height="220"></p>` : ""
    }<p>Scan the QR code in Settings → Mobile data → Add eSIM.</p>${
      з.esim.appleUrl ? `<p><a href="${з.esim.appleUrl}">Install on iPhone in one tap</a></p>` : ""
    }<p>Activation code: <code>${з.esim.qrcode}</code><br>ICCID: ${
      з.esim.iccid
    }</p><p><a href="${ссылка}">Open in HelloUZ</a></p>`,
  });
}

/** Что показать туристу: без закупочной цены и служебных полей. */
export function дляТуриста(з: ЗаказEsim) {
  return {
    id: з.id,
    статус: з.статус,
    сумма: з.сумма,
    пакет: { title: з.пакет.title, data: з.пакет.data, day: з.пакет.day, unlimited: з.пакет.unlimited },
    createdAt: з.createdAt,
    esim: з.esim
      ? {
          qrcode: з.esim.qrcode,
          qrcodeUrl: з.esim.qrcodeUrl,
          appleUrl: з.esim.appleUrl,
          iccid: з.esim.iccid,
          apn: з.esim.apn,
        }
      : null,
  };
}
