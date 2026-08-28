import { describe, expect, it } from "vitest";
import { listPois } from "@/lib/db";

/**
 * Рестораны, кафе и зоны отдыха с платным топом.
 *
 * Тесты читают заполненную базу: перед запуском нужен `npm run seed`.
 * bibikhanum-teahouse (scripts/content/samarkand.mjs) намеренно ниже по
 * рейтингу и значимости, чем platan-restaurant, но с sponsoredPriority —
 * так проверка ловит именно перестановку порядка, а не совпадение.
 */

describe("платное размещение ресторанов/кафе", () => {
  it("поднимает заведение с sponsored_priority выше рейтинга и значимости", () => {
    const dining = listPois({
      city: "samarkand",
      categories: ["restaurant", "cafe", "rest_zone"],
      lang: "ru",
    });

    const sponsoredIndex = dining.findIndex((p) => p.slug === "bibikhanum-teahouse");
    const organicIndex = dining.findIndex((p) => p.slug === "platan-restaurant");

    expect(sponsoredIndex).toBeGreaterThanOrEqual(0);
    expect(organicIndex).toBeGreaterThanOrEqual(0);
    expect(sponsoredIndex).toBeLessThan(organicIndex);
  });

  it("не трогает сортировку обычных объектов без sponsored_priority", () => {
    const landmarks = listPois({ city: "samarkand", category: "landmark", lang: "ru" });
    for (const p of landmarks) expect(p.sponsored_priority ?? 0).toBe(0);
    // Порядок остаётся прежним: по значимости, затем по рейтингу (лексикографически).
    for (let i = 1; i < landmarks.length; i++) {
      const prev = landmarks[i - 1];
      const cur = landmarks[i];
      const popOk = prev.popularity > cur.popularity + 1e-9;
      const popTie = Math.abs(prev.popularity - cur.popularity) <= 1e-9;
      expect(popOk || (popTie && prev.rating >= cur.rating - 1e-9)).toBe(true);
    }
  });

  it("categories фильтрует сразу по нескольким категориям", () => {
    const dining = listPois({
      city: "samarkand",
      categories: ["restaurant", "cafe"],
      lang: "ru",
    });
    expect(dining.length).toBeGreaterThan(0);
    for (const p of dining) expect(["restaurant", "cafe"]).toContain(p.category);
  });
});
