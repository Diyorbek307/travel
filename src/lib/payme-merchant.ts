import { timingSafeEqual } from "node:crypto";
import { всеЗаказы, заказПоId, изменитьЗаказ, отметитьОплату, type ТранзакцияPayme } from "./esim-orders";

/**
 * Payme Merchant API — Payme сам сообщает нам о платеже.
 *
 * В кабинете Payme Business указывается адрес https://<сайт>/api/payme и
 * выдаётся секретный ключ — он кладётся в PAYME_KEY. Payme присылает
 * JSON-RPC запросы с заголовком Basic «Paycom:<ключ>»; без верного ключа
 * отвечаем ошибкой -32504 и ничего не делаем.
 *
 * Поле счёта — `order` (номер нашего заказа), сумма — в тийинах.
 * Методы: CheckPerformTransaction, CreateTransaction, PerformTransaction,
 * CancelTransaction, CheckTransaction, GetStatement.
 */

type Сообщение = { ru: string; uz: string; en: string };
const м = (ru: string, uz: string, en: string): Сообщение => ({ ru, uz, en });

export class ОшибкаPayme extends Error {
  constructor(public code: number, public msg: Сообщение, public data?: string) {
    super(msg.en);
  }
}

const НЕТ_ЗАКАЗА = () =>
  new ОшибкаPayme(-31050, м("Заказ не найден", "Buyurtma topilmadi", "Order not found"), "order");
const ЗАНЯТ = () =>
  new ОшибкаPayme(
    -31051,
    м("Заказ уже оплачивается или оплачен", "Buyurtma band", "Order is busy or paid"),
    "order",
  );
const НЕ_ТА_СУММА = () => new ОшибкаPayme(-31001, м("Неверная сумма", "Notoʻgʻri summa", "Incorrect amount"));
const НЕТ_ТРАНЗАКЦИИ = () =>
  new ОшибкаPayme(-31003, м("Транзакция не найдена", "Tranzaksiya topilmadi", "Transaction not found"));
const НЕЛЬЗЯ_ПРОВЕСТИ = () =>
  new ОшибкаPayme(-31008, м("Операцию нельзя выполнить", "Amalni bajarib boʻlmaydi", "Unable to perform"));
const НЕЛЬЗЯ_ОТМЕНИТЬ = () =>
  new ОшибкаPayme(-31007, м("eSIM уже выдана, отмена невозможна", "eSIM berilgan", "eSIM already issued"));

/** Транзакция, не проведённая за 12 часов, по правилам Payme отменяется. */
const СРОК_МС = 12 * 60 * 60 * 1000;

export function ключВерен(заголовок: string | null, ключ = process.env.PAYME_KEY): boolean {
  if (!ключ || !заголовок?.startsWith("Basic ")) return false;
  const ожидаем = Buffer.from(`Paycom:${ключ}`).toString("base64");
  const пришло = заголовок.slice(6).trim();
  return пришло.length === ожидаем.length && timingSafeEqual(Buffer.from(пришло), Buffer.from(ожидаем));
}

type Параметры = Record<string, unknown>;

async function заказИзСчёта(п: Параметры) {
  const номер = (п.account as { order?: unknown } | undefined)?.order;
  if (typeof номер !== "string") throw НЕТ_ЗАКАЗА();
  const з = await заказПоId(номер);
  if (!з) throw НЕТ_ЗАКАЗА();
  return з;
}

async function заказПоТранзакции(id: unknown) {
  if (typeof id !== "string") throw НЕТ_ТРАНЗАКЦИИ();
  const з = (await всеЗаказы()).find((x) => x.payme?.id === id);
  if (!з || !з.payme) throw НЕТ_ТРАНЗАКЦИИ();
  return з;
}

const вид = (т: ТранзакцияPayme) => ({
  create_time: т.create_time,
  perform_time: т.perform_time,
  cancel_time: т.cancel_time,
  transaction: т.id,
  state: т.state,
  reason: т.reason,
});

export async function выполнить(метод: string, п: Параметры): Promise<unknown> {
  switch (метод) {
    case "CheckPerformTransaction": {
      const з = await заказИзСчёта(п);
      if (Number(п.amount) !== з.сумма * 100) throw НЕ_ТА_СУММА();
      if (з.статус !== "ждёт_оплаты" || (з.payme && з.payme.state === 1)) throw ЗАНЯТ();
      return { allow: true };
    }

    case "CreateTransaction": {
      const id = String(п.id ?? "");
      const уже = (await всеЗаказы()).find((x) => x.payme?.id === id);
      if (уже?.payme) {
        // Повтор того же запроса: отвечаем тем же, пока транзакция жива.
        if (уже.payme.state !== 1) throw НЕЛЬЗЯ_ПРОВЕСТИ();
        if (Date.now() - уже.payme.create_time > СРОК_МС) {
          await отменить(уже.id, 4);
          throw НЕЛЬЗЯ_ПРОВЕСТИ();
        }
        return { create_time: уже.payme.create_time, transaction: id, state: 1 };
      }
      const з = await заказИзСчёта(п);
      if (Number(п.amount) !== з.сумма * 100) throw НЕ_ТА_СУММА();
      if (з.статус !== "ждёт_оплаты" || (з.payme && з.payme.state === 1)) throw ЗАНЯТ();
      const т: ТранзакцияPayme = {
        id,
        time: Number(п.time) || Date.now(),
        create_time: Date.now(),
        perform_time: 0,
        cancel_time: 0,
        state: 1,
        reason: null,
      };
      await изменитьЗаказ(з.id, (x) => [{ ...x, payme: т }, null]);
      return { create_time: т.create_time, transaction: id, state: 1 };
    }

    case "PerformTransaction": {
      const з = await заказПоТранзакции(п.id);
      const т = з.payme!;
      if (т.state === 2) return { transaction: т.id, perform_time: т.perform_time, state: 2 };
      if (т.state !== 1) throw НЕЛЬЗЯ_ПРОВЕСТИ();
      if (Date.now() - т.create_time > СРОК_МС) {
        await отменить(з.id, 4);
        throw НЕЛЬЗЯ_ПРОВЕСТИ();
      }
      const perform_time = Date.now();
      await изменитьЗаказ(з.id, (x) => [{ ...x, payme: { ...т, state: 2, perform_time } }, null]);
      await отметитьОплату(з.id, "payme");
      return { transaction: т.id, perform_time, state: 2 };
    }

    case "CancelTransaction": {
      const з = await заказПоТранзакции(п.id);
      const т = з.payme!;
      if (т.state < 0) return { transaction: т.id, cancel_time: т.cancel_time, state: т.state };
      // Оплаченную, но ещё не выданную eSIM отменить можно; выданную — нет:
      // Airalo уже списал за неё деньги.
      if (т.state === 2 && з.esim) throw НЕЛЬЗЯ_ОТМЕНИТЬ();
      const итог = await отменить(з.id, Number(п.reason) || null);
      return { transaction: т.id, cancel_time: итог.cancel_time, state: итог.state };
    }

    case "CheckTransaction": {
      const з = await заказПоТранзакции(п.id);
      return вид(з.payme!);
    }

    case "GetStatement": {
      const с = Number(п.from) || 0;
      const по = Number(п.to) || Date.now();
      const транзакции = (await всеЗаказы())
        .filter((з) => з.payme && з.payme.time >= с && з.payme.time <= по)
        .map((з) => ({
          id: з.payme!.id,
          time: з.payme!.time,
          amount: з.сумма * 100,
          account: { order: з.id },
          ...вид(з.payme!),
        }));
      return { transactions: транзакции };
    }

    default:
      throw new ОшибкаPayme(-32601, м("Метод не найден", "Metod topilmadi", "Method not found"));
  }
}

/** Отмена транзакции: -1 до проведения, -2 после. Заказ — отменён. */
async function отменить(заказId: string, причина: number | null) {
  const итог = await изменитьЗаказ(заказId, (з) => {
    const т = з.payme!;
    const state: -1 | -2 = т.state === 2 ? -2 : -1;
    const cancel_time = Date.now();
    return [
      { ...з, статус: "отменён", payme: { ...т, state, cancel_time, reason: причина } },
      { state, cancel_time },
    ];
  });
  return итог ?? { state: -1 as const, cancel_time: Date.now() };
}
