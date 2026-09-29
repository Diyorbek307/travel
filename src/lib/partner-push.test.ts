import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/** Режим «система присылает сама»: ключ, приём наличия, свежесть. */

let папка: string;
let push: typeof import("./partner-push");

beforeAll(async () => {
  папка = await mkdtemp(path.join(tmpdir(), "push-test-"));
  process.env.DATA_DIR = папка;
  delete process.env.DATABASE_URL;
  push = await import("./partner-push");
});

afterAll(async () => {
  await rm(папка, { recursive: true, force: true });
});

describe("ключ приёма", () => {
  it("ключ узнаёт своё заведение, чужой — нет", async () => {
    const ключ = await push.выдатьКлючПриёма("hotel", "h-1");
    expect(ключ.startsWith("hz_")).toBe(true);
    expect(await push.заведениеПоКлючу(ключ)).toMatchObject({ вид: "hotel", id: "h-1" });
    expect(await push.заведениеПоКлючу("hz_" + "x".repeat(32))).toBeNull();
    expect(await push.заведениеПоКлючу("")).toBeNull();
  });

  it("новый ключ отменяет старый; отозванный не работает", async () => {
    const старый = await push.выдатьКлючПриёма("restaurant", "r-1");
    const новый = await push.выдатьКлючПриёма("restaurant", "r-1");
    expect(await push.заведениеПоКлючу(старый)).toBeNull();
    expect(await push.заведениеПоКлючу(новый)).not.toBeNull();
    await push.отозватьКлючПриёма("restaurant", "r-1");
    expect(await push.заведениеПоКлючу(новый)).toBeNull();
  });
});

describe("присланное наличие", () => {
  it("свежее отдаётся, старше шести часов — нет", async () => {
    const сейчас = Date.now();
    await push.сохранитьПрисланное("restaurant", "r-2", {
      источник: "partner",
      обновлено: new Date(сейчас).toISOString(),
      столов: 4,
    });
    expect((await push.присланноеНаличие("restaurant", "r-2", сейчас))?.столов).toBe(4);
    expect(await push.присланноеНаличие("restaurant", "r-2", сейчас + 7 * 3600_000)).toBeNull();
    expect(await push.присланноеНаличие("restaurant", "нет-такого", сейчас)).toBeNull();
  });
});
