import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { РЕГИОНЫ_МЕСТА, РЕГИОНЫ_ПЕРЕВОДЫ } from "./index";
import { ТИПЫ_МЕСТ, UZ_CITIES } from "../content";

describe("места регионов", () => {
  it("id уникальны и не пересекаются с Самаркандом", () => {
    const ids = РЕГИОНЫ_МЕСТА.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z]{2}-[a-z0-9-]+$/.test(id))).toBe(true);
  });

  it("точки внутри Узбекистана, город — из списка городов", () => {
    for (const p of РЕГИОНЫ_МЕСТА) {
      expect(p.geo.lat, p.id).toBeGreaterThan(37);
      expect(p.geo.lat, p.id).toBeLessThan(46);
      expect(p.geo.lon, p.id).toBeGreaterThan(55.9);
      expect(p.geo.lon, p.id).toBeLessThan(73.2);
      expect(UZ_CITIES, p.id).toContain(p.city);
    }
  });

  it("тип места входит в группы плиток", () => {
    const все = new Set(Object.values(ТИПЫ_МЕСТ).flat());
    for (const p of РЕГИОНЫ_МЕСТА) expect(все.has(p.type), `${p.id}: ${p.type}`).toBe(true);
  });

  it("у каждого места есть текст на всех языках сайта", () => {
    const словарь = new Map(РЕГИОНЫ_ПЕРЕВОДЫ);
    for (const p of РЕГИОНЫ_МЕСТА) {
      for (const ключ of [p.name, p.desc]) {
        const п = словарь.get(ключ);
        for (const язык of ["en", "uz", "zh", "ko", "de", "fr", "ja", "tr", "ar"] as const)
          expect(п?.[язык], `${p.id} ${язык}`).toBeTruthy();
      }
      expect(p.desc.length, p.id).toBeGreaterThan(120);
    }
  });

  it("обложки лежат в public, галерея — миниатюры Commons", () => {
    for (const p of РЕГИОНЫ_МЕСТА) {
      expect(existsSync(path.join(process.cwd(), "public", p.img)), p.img).toBe(true);
      for (const u of p.imgs ?? []) expect(u, p.id).toMatch(/^https:\/\/(upload|thumb)\.wikimedia\.org\/[^?]+$/);
      if (p.imgs?.length) expect(p.credits, p.id).toMatch(/Wikimedia Commons/);
    }
  });
});
