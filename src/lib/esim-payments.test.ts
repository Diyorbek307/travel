import { beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Заказы — во временной папке, Airalo и почта — подменены.
process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "esim-"));
process.env.ESIM_USD_UZS = "12000";
process.env.PAYME_KEY = "test-payme-key";
process.env.CLICK_SECRET = "test-click-key";
process.env.CLICK_SERVICE_ID = "777";
delete process.env.DATABASE_URL;

const заказано = vi.fn();
vi.mock("./airalo", () => ({
  airaloНастроен: () => true,
  пакетыУзбекистана: async () => [
    {
      id: "uz-7d-1gb",
      title: "1 GB - 7 days",
      data: "1 GB",
      day: 7,
      unlimited: false,
      retailUsd: 4.5,
      netUsd: 2,
      operator: "Test",
      voice: null,
      text: null,
    },
  ],
  заказатьEsim: async (id: string) => {
    заказано(id);
    return {
      iccid: "8900",
      lpa: "lpa.test",
      matchingId: "M1",
      qrcode: "LPA:1$lpa.test$M1",
      qrcodeUrl: "https://q/1.png",
      appleUrl: null,
      apn: null,
      airaloOrderId: 1,
      инструкция: null,
    };
  },
}));
vi.mock("./mail", () => ({ sendMail: async () => true }));

type М = typeof import("./esim-orders");
let з: М;
let payme: typeof import("./payme-merchant");
let click: typeof import("./click-shop");
beforeAll(async () => {
  з = await import("./esim-orders");
  payme = await import("./payme-merchant");
  click = await import("./click-shop");
});

const ждать = () => new Promise((r) => setTimeout(r, 30));
const ошибка = async (p: Promise<unknown>) => {
  try {
    await p;
    return null;
  } catch (e) {
    return (e as { code?: number }).code ?? "?";
  }
};

describe("цена в сумах", () => {
  it("рекомендованная цена × курс × наценка, вверх до тысячи", () => {
    expect(з.ценаВСумах(4.5, 12000, 0)).toBe(54000);
    expect(з.ценаВСумах(4.5, 12000, 10)).toBe(60000); // 59 400 → 60 000
    expect(з.ценаВСумах(0.01, 12000, 0)).toBe(1000);
  });
});

describe("Payme", () => {
  it("ключ: только Basic Paycom:<ключ>", () => {
    const верный = "Basic " + Buffer.from("Paycom:test-payme-key").toString("base64");
    expect(payme.ключВерен(верный)).toBe(true);
    expect(payme.ключВерен("Basic " + Buffer.from("Paycom:wrong").toString("base64"))).toBe(false);
    expect(payme.ключВерен(null)).toBe(false);
  });

  it("проверка → создание → проведение → eSIM выдана; отменить уже нельзя", async () => {
    const заказ = (await з.создатьЗаказ("uz-7d-1gb", {}))!;
    expect(заказ.сумма).toBe(54000);
    const счёт = { order: заказ.id };

    expect(await ошибка(payme.выполнить("CheckPerformTransaction", { amount: 100, account: счёт }))).toBe(
      -31001,
    );
    expect(
      await ошибка(
        payme.выполнить("CheckPerformTransaction", { amount: 5400000, account: { order: "нет" } }),
      ),
    ).toBe(-31050);
    expect(await payme.выполнить("CheckPerformTransaction", { amount: 5400000, account: счёт })).toEqual({
      allow: true,
    });

    const создана = (await payme.выполнить("CreateTransaction", {
      id: "t1",
      time: Date.now(),
      amount: 5400000,
      account: счёт,
    })) as { state: number };
    expect(создана.state).toBe(1);
    // Повтор того же — тот же ответ; чужая транзакция на тот же заказ — занято.
    expect(
      (
        (await payme.выполнить("CreateTransaction", {
          id: "t1",
          time: Date.now(),
          amount: 5400000,
          account: счёт,
        })) as { state: number }
      ).state,
    ).toBe(1);
    expect(
      await ошибка(
        payme.выполнить("CreateTransaction", { id: "t2", time: Date.now(), amount: 5400000, account: счёт }),
      ),
    ).toBe(-31051);

    const проведена = (await payme.выполнить("PerformTransaction", { id: "t1" })) as { state: number };
    expect(проведена.state).toBe(2);
    await ждать();
    const после = (await з.заказПоId(заказ.id))!;
    expect(после.статус).toBe("выдан");
    expect(после.esim?.qrcode).toBe("LPA:1$lpa.test$M1");
    expect(заказано).toHaveBeenCalledTimes(1);

    // Повторное проведение — без второй eSIM.
    await payme.выполнить("PerformTransaction", { id: "t1" });
    await ждать();
    expect(заказано).toHaveBeenCalledTimes(1);

    expect(await ошибка(payme.выполнить("CancelTransaction", { id: "t1", reason: 5 }))).toBe(-31007);
    expect(((await payme.выполнить("CheckTransaction", { id: "t1" })) as { state: number }).state).toBe(2);
    expect(await ошибка(payme.выполнить("CheckTransaction", { id: "нет" }))).toBe(-31003);
  });

  it("отмена до проведения: заказ отменён, провести уже нельзя", async () => {
    const заказ = (await з.создатьЗаказ("uz-7d-1gb", {}))!;
    await payme.выполнить("CreateTransaction", {
      id: "t3",
      time: Date.now(),
      amount: 5400000,
      account: { order: заказ.id },
    });
    const отмена = (await payme.выполнить("CancelTransaction", { id: "t3", reason: 3 })) as { state: number };
    expect(отмена.state).toBe(-1);
    expect(await ошибка(payme.выполнить("PerformTransaction", { id: "t3" }))).toBe(-31008);
    expect((await з.заказПоId(заказ.id))!.статус).toBe("отменён");
  });
});

describe("Click", () => {
  const md5 = (s: string) => createHash("md5").update(s).digest("hex");

  it("prepare → complete с верной подписью выдаёт eSIM; подделка и чужая сумма — отказ", async () => {
    const заказ = (await з.создатьЗаказ("uz-7d-1gb", {}))!;
    const база = {
      click_trans_id: "c1",
      service_id: "777",
      click_paydoc_id: "p1",
      merchant_trans_id: заказ.id,
      amount: "54000.00",
      sign_time: "2026-09-30 12:00:00",
      error: "0",
    };
    const подпись0 = md5(`c1777test-click-key${заказ.id}54000.000${база.sign_time}`);

    expect((await click.prepare({ ...база, action: "0", sign_string: "0".repeat(32) })).error).toBe(-1);
    const плохаяСумма = md5(`c1777test-click-key${заказ.id}1.000${база.sign_time}`);
    expect(
      (await click.prepare({ ...база, amount: "1.00", action: "0", sign_string: плохаяСумма })).error,
    ).toBe(-2);

    const п = await click.prepare({ ...база, action: "0", sign_string: подпись0 });
    expect(п.error).toBe(0);
    const prepareId = String(п.merchant_prepare_id);

    const подпись1 = md5(`c1777test-click-key${заказ.id}${prepareId}54000.001${база.sign_time}`);
    const к = await click.complete({
      ...база,
      action: "1",
      merchant_prepare_id: prepareId,
      sign_string: подпись1,
    });
    expect(к.error).toBe(0);
    await ждать();
    expect((await з.заказПоId(заказ.id))!.статус).toBe("выдан");

    // Повтор — «уже оплачен», без второй eSIM.
    const до = заказано.mock.calls.length;
    expect(
      (await click.complete({ ...база, action: "1", merchant_prepare_id: prepareId, sign_string: подпись1 }))
        .error,
    ).toBe(-4);
    await ждать();
    expect(заказано.mock.calls.length).toBe(до);
  });
});
