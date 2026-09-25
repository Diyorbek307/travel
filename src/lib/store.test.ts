import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SEED, ПОЗДНИЕ_СЕМЕНА } from "@/data/seed";

/**
 * Поздние семена: записи, добавленные в код после того, как редактор
 * уже сохранял раздел в панели. Они должны появиться на сайте, но не
 * воскресать после того, как редактор их удалил.
 */

let папка: string;
let store: typeof import("./store");

beforeAll(async () => {
  папка = await mkdtemp(path.join(tmpdir(), "store-test-"));
  // Хранилище читает путь при импорте — задаём его до загрузки модуля.
  process.env.DATA_DIR = папка;
  delete process.env.DATABASE_URL;
  // Раздел гостиниц сохранён «до» появления хостелов: одни старые записи.
  const поздние = new Set(ПОЗДНИЕ_СЕМЕНА.hotels);
  const старые = SEED.hotels.filter((h) => !поздние.has(h.id));
  await writeFile(path.join(папка, "content.json"), JSON.stringify({ hotels: старые }));
  store = await import("./store");
});

afterAll(async () => {
  await rm(папка, { recursive: true, force: true });
});

describe("поздние семена", () => {
  it("досыпаются к сохранённому разделу", async () => {
    const { hotels } = await store.readContent();
    const ids = hotels.map((h) => h.id);
    for (const id of ПОЗДНИЕ_СЕМЕНА.hotels ?? []) expect(ids).toContain(id);
    expect(hotels.some((h) => h.kind === "hostel")).toBe(true);
  });

  it("удалённая в панели запись не возвращается", async () => {
    const { hotels } = await store.readContent();
    const удалить = (ПОЗДНИЕ_СЕМЕНА.hotels ?? [])[0];
    // Панель сохраняет раздел без удалённой записи.
    await store.patchContent({ hotels: hotels.filter((h) => h.id !== удалить) });
    const после = await store.readContent();
    expect(после.hotels.map((h) => h.id)).not.toContain(удалить);
    // Остальные поздние записи на месте — они уже лежат в разделе.
    expect(после.hotels.some((h) => h.kind === "hostel" || h.kind === "motel")).toBe(true);
  });

  it("служебный список не утекает в ответ", async () => {
    const content = await store.readContent();
    expect("учтённыеСемена" in content).toBe(false);
  });
});
