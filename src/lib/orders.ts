import {
  всеЗаказы as всеEsim,
  заказПоId as esimПоId,
  изменитьЗаказ as изменитьEsim,
  отметитьОплату as оплатаEsim,
  type ЗаказEsim,
} from "./esim-orders";
import {
  ПРЕФИКС_ПОДПИСКИ,
  всеЗаказыПодписки,
  заказПодпискиПоId,
  изменитьЗаказПодписки,
  отметитьОплатуПодписки,
  type ЗаказПодписки,
} from "./provider-orders";

/**
 * Все заказы, которые оплачиваются через Payme и Click: eSIM и подписки
 * водителей и гидов. Платёжные системы знают только номер заказа и сумму
 * — по префиксу номера мы понимаем, чей это заказ.
 */

export type Заказ = ЗаказEsim | ЗаказПодписки;

const подписка = (id: string) => id.startsWith(ПРЕФИКС_ПОДПИСКИ);

export async function всеЗаказы(): Promise<Заказ[]> {
  return [...(await всеEsim()), ...(await всеЗаказыПодписки())];
}

export async function заказПоId(id: string): Promise<Заказ | null> {
  return подписка(id) ? заказПодпискиПоId(id) : esimПоId(id);
}

export async function изменитьЗаказ<R>(id: string, правка: (з: Заказ) => [Заказ, R]): Promise<R | null> {
  return подписка(id)
    ? изменитьЗаказПодписки(id, (з) => правка(з) as [ЗаказПодписки, R])
    : изменитьEsim(id, (з) => правка(з) as [ЗаказEsim, R]);
}

export async function отметитьОплату(id: string, система: "payme" | "click" | "вручную"): Promise<boolean> {
  return подписка(id) ? отметитьОплатуПодписки(id, система) : оплатаEsim(id, система);
}

/**
 * Можно ли отменить проведённый платёж. eSIM — нет, если уже выдана
 * (Airalo списал деньги); подписку — нет, если срок уже продлён.
 */
export function нельзяОтменить(з: Заказ): boolean {
  if ("providerId" in з) return з.статус === "оплачен";
  return Boolean(з.esim);
}
