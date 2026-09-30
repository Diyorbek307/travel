import { createHash, timingSafeEqual } from "node:crypto";
import { заказПоId, изменитьЗаказ, отметитьОплату } from "./esim-orders";

/**
 * Click SHOP API — Click сам сообщает нам о платеже, в два шага.
 *
 * В кабинете Click указываются адреса:
 *   Prepare  https://<сайт>/api/click/prepare
 *   Complete https://<сайт>/api/click/complete
 * и выдаётся секретный ключ — CLICK_SECRET. Каждый запрос подписан
 * md5 от полей и ключа; без верной подписи отвечаем -1 и ничего не делаем.
 *
 * merchant_trans_id — номер нашего заказа, amount — в сумах.
 */

export interface ОтветClick {
  click_trans_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: number;
  merchant_confirm_id?: number;
  error: number;
  error_note: string;
}

/** Секретный ключ Click (CLICK_SECRET; старое имя CLICK_SECRET_KEY тоже понимаем). */
export const секретClick = () => process.env.CLICK_SECRET || process.env.CLICK_SECRET_KEY || "";

const md5 = (s: string) => createHash("md5").update(s).digest("hex");

function подписьВерна(ожидаем: string, пришло: unknown): boolean {
  if (typeof пришло !== "string" || пришло.length !== ожидаем.length) return false;
  return timingSafeEqual(Buffer.from(пришло.toLowerCase()), Buffer.from(ожидаем));
}

const поле = (п: Record<string, string>, к: string) => п[к] ?? "";

function ответ(п: Record<string, string>, error: number, error_note: string, доп: Partial<ОтветClick> = {}) {
  return {
    click_trans_id: поле(п, "click_trans_id"),
    merchant_trans_id: поле(п, "merchant_trans_id"),
    ...доп,
    error,
    error_note,
  } satisfies ОтветClick;
}

/** Суммы Click присылает строкой с копейками: «15000.00». */
const суммаСовпала = (пришла: string, наша: number) => Math.abs(Number(пришла) - наша) < 0.01;

export async function prepare(п: Record<string, string>, ключ = секретClick()): Promise<ОтветClick> {
  if (!ключ || поле(п, "service_id") !== (process.env.CLICK_SERVICE_ID ?? ""))
    return ответ(п, -8, "Error in request from click");
  const ожидаем = md5(
    поле(п, "click_trans_id") +
      поле(п, "service_id") +
      ключ +
      поле(п, "merchant_trans_id") +
      поле(п, "amount") +
      поле(п, "action") +
      поле(п, "sign_time"),
  );
  if (!подписьВерна(ожидаем, п.sign_string)) return ответ(п, -1, "SIGN CHECK FAILED!");
  if (поле(п, "action") !== "0") return ответ(п, -3, "Action not found");

  const з = await заказПоId(поле(п, "merchant_trans_id"));
  if (!з) return ответ(п, -5, "Order does not exist");
  if (з.статус === "отменён") return ответ(п, -9, "Transaction cancelled");
  if (з.статус !== "ждёт_оплаты") return ответ(п, -4, "Already paid");
  if (!суммаСовпала(поле(п, "amount"), з.сумма)) return ответ(п, -2, "Incorrect parameter amount");

  const prepareId = Date.now();
  await изменитьЗаказ(з.id, (x) => [
    { ...x, click: { transId: поле(п, "click_trans_id"), prepareId } },
    null,
  ]);
  return ответ(п, 0, "Success", { merchant_prepare_id: prepareId });
}

export async function complete(п: Record<string, string>, ключ = секретClick()): Promise<ОтветClick> {
  if (!ключ || поле(п, "service_id") !== (process.env.CLICK_SERVICE_ID ?? ""))
    return ответ(п, -8, "Error in request from click");
  const ожидаем = md5(
    поле(п, "click_trans_id") +
      поле(п, "service_id") +
      ключ +
      поле(п, "merchant_trans_id") +
      поле(п, "merchant_prepare_id") +
      поле(п, "amount") +
      поле(п, "action") +
      поле(п, "sign_time"),
  );
  if (!подписьВерна(ожидаем, п.sign_string)) return ответ(п, -1, "SIGN CHECK FAILED!");
  if (поле(п, "action") !== "1") return ответ(п, -3, "Action not found");

  const з = await заказПоId(поле(п, "merchant_trans_id"));
  if (!з) return ответ(п, -5, "Order does not exist");
  if (!з.click || String(з.click.prepareId) !== поле(п, "merchant_prepare_id"))
    return ответ(п, -6, "Transaction does not exist");
  if (з.статус === "отменён") return ответ(п, -9, "Transaction cancelled");
  if (з.статус !== "ждёт_оплаты")
    return ответ(п, -4, "Already paid", { merchant_confirm_id: з.click.prepareId });
  if (!суммаСовпала(поле(п, "amount"), з.сумма)) return ответ(п, -2, "Incorrect parameter amount");

  // Click сообщает, что платёж у него не прошёл, — отменяем заказ.
  if (Number(поле(п, "error")) < 0) {
    await изменитьЗаказ(з.id, (x) => [{ ...x, статус: "отменён" }, null]);
    return ответ(п, -9, "Transaction cancelled");
  }

  await отметитьОплату(з.id, "click");
  return ответ(п, 0, "Success", { merchant_confirm_id: з.click.prepareId });
}
