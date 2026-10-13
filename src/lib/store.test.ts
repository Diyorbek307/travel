import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SEED, УБРАННЫЕ_СЕМЕНА, ПОЗДНИЕ_СЕМЕНА } from "@/data/seed";

/**
 * Поздние семена: записи, добавленные в код после того, как редактор
 * уже сохранял раздел в панели. Они должны появиться на сайте, но не
 * воскресать после того, как редактор их удалил.
 */

let папка: string;
let store: typeof import("./store");
const убранныйОтель = [...(УБРАННЫЕ_СЕМЕНА.hotels ?? [])][0];

beforeAll(async () => {
  папка = await mkdtemp(path.join(tmpdir(), "store-test-"));
  // Хранилище читает путь при импорте — задаём его до загрузки модуля.
  process.env.DATA_DIR = папка;
  delete process.env.DATABASE_URL;
  // Раздел мест сохранён «до» появления новых мест Самарканда.
  const поздние = new Set(ПОЗДНИЕ_СЕМЕНА.places);
  const старые = SEED.places.filter((p) => !поздние.has(p.id));
  // В сохранённых гостиницах — убранная демо-гостиница и заведённая в панели.
  const гостиницы = [
    { id: убранныйОтель, name: "Демо" },
    { id: "свой-отель", name: "Свой" },
  ];
  await writeFile(path.join(папка, "content.json"), JSON.stringify({ places: старые, hotels: гостиницы }));
  store = await import("./store");
});

afterAll(async () => {
  await rm(папка, { recursive: true, force: true });
});

describe("поздние семена", () => {
  it("досыпаются к сохранённому разделу", async () => {
    const { places } = await store.readContent();
    const ids = places.map((p) => p.id);
    expect(ПОЗДНИЕ_СЕМЕНА.places?.length).toBeGreaterThan(1);
    for (const id of ПОЗДНИЕ_СЕМЕНА.places ?? []) expect(ids).toContain(id);
  });

  it("удалённая в панели запись не возвращается", async () => {
    const { places } = await store.readContent();
    const [удалить, другая] = ПОЗДНИЕ_СЕМЕНА.places ?? [];
    // Панель сохраняет раздел без удалённой записи.
    await store.patchContent({ places: places.filter((p) => p.id !== удалить) });
    const после = await store.readContent();
    expect(после.places.map((p) => p.id)).not.toContain(удалить);
    // Остальные поздние записи на месте — они уже лежат в разделе.
    expect(после.places.map((p) => p.id)).toContain(другая);
  });

  it("служебный список не утекает в ответ", async () => {
    const content = await store.readContent();
    expect("учтённыеСемена" in content).toBe(false);
  });
});

describe("убранные демо-записи", () => {
  it("в семенах нет гостиниц, ресторанов, экскурсий и событий", () => {
    expect(SEED.hotels).toEqual([]);
    expect(SEED.restaurants).toEqual([]);
    expect(SEED.routes).toEqual([]);
    expect(SEED.events).toEqual([]);
    expect(SEED.places.every((p) => p.city === "Самарканд")).toBe(true);
  });

  it("из сохранённого убираются, заведённое в панели остаётся", async () => {
    const { hotels } = await store.readContent();
    expect(убранныйОтель).toBeTruthy();
    expect(hotels.map((h) => h.id)).toEqual(["свой-отель"]);
  });
});

describe("исправитьФото", () => {
  const минарет =
    "https://images.unsplash.com/photo-1728281711729-a3b3424e6c1e?w=700&h=480&fit=crop&auto=format";
  const база = {
    cities: [],
    places: [],
    hotels: [],
    restaurants: [],
    routes: [],
    events: [],
    ads: [],
    audio: [],
  };

  it("меняет снимок Хивы у Чарвака и Ахсикента, Ахсикенту — с подписью автора", () => {
    const итог = store.исправитьФото({
      ...база,
      places: [
        { id: "7-chrvk", name: "Чарвакское водохранилище", img: минарет, imgs: [минарет, "/x.webp"] },
        { id: "34-xakhs", name: "Городище Ахсикент", img: минарет },
      ],
      cities: [{ id: "13-чарвак", name: "Чарвак", img: минарет }],
    } as never) as unknown as Record<string, Record<string, unknown>[]>;
    expect(итог.places[0].img).toBe("/scenic/charvak-1.webp");
    expect(итог.places[0].imgs).toEqual(["/scenic/charvak-1.webp", "/x.webp"]);
    expect(итог.places[1].credits).toMatch(/CC BY-SA/);
    expect(итог.cities[0].img).toBe("/scenic/charvak-2.webp");
  });

  it("фото, выбранное в панели, и Хиву не трогает", () => {
    const итог = store.исправитьФото({
      ...база,
      places: [{ id: "7-chrvk", name: "Чарвак", img: "/api/media/своё" }],
      cities: [{ id: "4-хива", name: "Хива", img: минарет }],
    } as never) as unknown as Record<string, Record<string, unknown>[]>;
    expect(итог.places[0].img).toBe("/api/media/своё");
    expect(итог.cities[0].img).toBe(минарет);
  });
});

describe("фото городов", () => {
  const регистан =
    "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=500&h=380&fit=crop&auto=format";
  const база = {
    cities: [],
    places: [],
    hotels: [],
    restaurants: [],
    routes: [],
    events: [],
    ads: [],
    audio: [],
  };

  it("город со снимком другого города получает своё фото, а у Самарканда Регистан остаётся", () => {
    const итог = store.исправитьФото({
      ...база,
      cities: [
        { id: "1-ташкент", name: "Ташкент", img: регистан },
        { id: "2-самарканд", name: "Самарканд", img: регистан },
      ],
    } as never) as unknown as Record<string, Record<string, unknown>[]>;
    expect(итог.cities[0].img).toBe("/scenic/tashkent-1.webp");
    expect(итог.cities[1].img).toBe(регистан);
  });
});
