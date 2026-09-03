/**
 * Оплата: Payme и Click.
 *
 * Задача была простая на словах: чтобы владелец вставил один ключ — и
 * оплата заработала. Так и сделано. Обе системы Узбекистана принимают
 * платёж через страницу оплаты, куда покупателя отправляют по ссылке с
 * идентификатором продавца и суммой. Больше для приёма денег ничего не
 * нужно: логин, ввод карты и подтверждение происходят на стороне Payme
 * или Click, где это и должно быть.
 *
 * Что мы НЕ делаем и почему. Карту покупателя приложение не трогает —
 * это прямо запрещено и не нужно: реквизиты вводятся только на защищённой
 * странице банка. И мы пока не проверяем автоматически, что платёж
 * прошёл: для этого нужен второй, секретный ключ и заранее объявленный
 * банку адрес для оповещений. Без такой проверки нельзя выдавать
 * premium автоматически — иначе его включит любой, кто просто откроет
 * ссылку. Поэтому подписку отмечает администратор, увидев поступление,
 * пока не заведён приём оповещений. Обещать «мгновенный premium» без
 * проверки оплаты было бы обманом.
 *
 * Идентификаторы читаются только на сервере: в адрес они попадают уже
 * готовой ссылкой, а ключи для проверки платежей в браузер не уходят
 * вовсе.
 */

export type Система = "payme" | "click";

/** Сумма приходит в сумах; обе системы считают в тийинах — это ×100. */
function вТийины(сум: number): number {
  return Math.round(сум * 100);
}

export function paymeНастроен(): boolean {
  return Boolean(process.env.PAYME_MERCHANT_ID);
}

export function clickНастроен(): boolean {
  return Boolean(process.env.CLICK_MERCHANT_ID && process.env.CLICK_SERVICE_ID);
}

export function какиеСистемы(): Система[] {
  const с: Система[] = [];
  if (paymeНастроен()) с.push("payme");
  if (clickНастроен()) с.push("click");
  return с;
}

/**
 * Ссылка на страницу оплаты Payme.
 *
 * Payme принимает параметры одной строкой в base64: продавец, сумма и
 * произвольные поля заказа. Поле order доедет обратно, когда подключим
 * проверку платежей, — по нему станет ясно, чей это платёж.
 */
export function paymeСсылка(сумма: number, order: string): string | null {
  const merchant = process.env.PAYME_MERCHANT_ID;
  if (!merchant) return null;

  const части = [`m=${merchant}`, `ac.order=${order}`, `a=${вТийины(сумма)}`, "c=" + возврат()];
  const строка = части.join(";");
  // Base64 без переносов: Payme читает её как единый хвост адреса.
  const код = Buffer.from(строка, "utf8").toString("base64");
  return `https://checkout.paycom.uz/${код}`;
}

/**
 * Ссылка на страницу оплаты Click.
 *
 * У Click параметры идут обычной строкой запроса. Нужны идентификаторы
 * продавца и услуги — их выдают в кабинете вместе с договором.
 */
export function clickСсылка(сумма: number, order: string): string | null {
  const merchant = process.env.CLICK_MERCHANT_ID;
  const service = process.env.CLICK_SERVICE_ID;
  if (!merchant || !service) return null;

  const п = new URLSearchParams({
    service_id: service,
    merchant_id: merchant,
    amount: String(сумма),
    transaction_param: order,
    return_url: возврат(),
  });
  return `https://my.click.uz/services/pay?${п.toString()}`;
}

/** Куда вернуть человека после оплаты — на сам сайт. */
function возврат(): string {
  return process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || "https://uzbekistan-travel.onrender.com";
}

export function ссылкаОплаты(система: Система, сумма: number, order: string): string | null {
  return система === "payme" ? paymeСсылка(сумма, order) : clickСсылка(сумма, order);
}
