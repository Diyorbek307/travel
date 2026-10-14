import path from "node:path";
import { randomBytes } from "node:crypto";
import { создатьХранилище } from "./storage";
import { зачестьОплату } from "./providers";
import type { ТранзакцияPayme } from "./esim-orders";
import type { Покупка } from "./provider-rules";

/**
 * Оплата размещения и продвижения водителей и гидов.
 *
 * Тот же порядок, что у eSIM: заказ с суммой → страница Payme или Click →
 * платёжная система сама сообщает об оплате по секретному ключу (или
 * менеджер отмечает оплату вручную, увидев её) → срок продлевается.
 * Открыть ссылку оплаты недостаточно.
 *
 * Номер заказа начинается с «sub_» — по нему Payme и Click отличают эти
 * заказы от заказов eSIM (см. lib/orders.ts).
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

export type СтатусПодписки = "ждёт_оплаты" | "оплачен" | "отменён";

export interface ЗаказПодписки {
  id: string;
  providerId: string;
  providerName: string;
  userId: string | null;
  покупка: Покупка;
  дней: number;
  продвижение: boolean;
  /** Сумма, сум. */
  сумма: number;
  статус: СтатусПодписки;
  createdAt: string;
  оплачен?: { система: "payme" | "click" | "вручную"; когда: string };
  payme?: ТранзакцияPayme;
  click?: { transId: string; prepareId: number };
}

const заказы = создатьХранилище<ЗаказПодписки[]>(path.join(DATA_DIR, "provider-orders.json"), () => []);

export const ПРЕФИКС_ПОДПИСКИ = "sub_";

export async function всеЗаказыПодписки(): Promise<ЗаказПодписки[]> {
  return [...(await заказы.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function заказПодпискиПоId(id: string): Promise<ЗаказПодписки | null> {
  return (await заказы.read()).find((з) => з.id === id) ?? null;
}

export async function изменитьЗаказПодписки<R>(
  id: string,
  правка: (з: ЗаказПодписки) => [ЗаказПодписки, R],
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

export async function создатьЗаказПодписки(
  поля: Omit<ЗаказПодписки, "id" | "статус" | "createdAt">,
): Promise<ЗаказПодписки> {
  const заказ: ЗаказПодписки = {
    ...поля,
    id: ПРЕФИКС_ПОДПИСКИ + randomBytes(9).toString("hex"),
    статус: "ждёт_оплаты",
    createdAt: new Date().toISOString(),
  };
  await заказы.update((все) => [[...все, заказ], undefined]);
  return заказ;
}

/** Оплата подтверждена: отмечаем и продлеваем срок. Повтор безопасен. */
export async function отметитьОплатуПодписки(
  id: string,
  система: "payme" | "click" | "вручную",
): Promise<boolean> {
  const заказ = await изменитьЗаказПодписки(id, (з) => {
    if (з.статус !== "ждёт_оплаты") return [з, null];
    return [{ ...з, статус: "оплачен", оплачен: { система, когда: new Date().toISOString() } }, з];
  });
  if (!заказ) return false;
  await зачестьОплату(заказ.providerId, заказ.дней, заказ.продвижение);
  return true;
}
