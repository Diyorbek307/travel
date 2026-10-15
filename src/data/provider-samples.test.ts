import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { ПРИМЕРЫ_ПАРТНЁРОВ, ПРИМЕРЫ_ТУРОВ } from "./provider-samples";
import { публично } from "@/lib/provider-rules";

describe("примеры водителей и гидов", () => {
  it("помечены как пример и без телефона — с ними нельзя связаться", () => {
    for (const п of ПРИМЕРЫ_ПАРТНЁРОВ) {
      expect(п.sample).toBe(true);
      expect(п.phone).toBe("");
      expect(п.telegram ?? "").toBe("");
      expect(п.whatsapp ?? "").toBe("");
      const пуб = публично(п);
      expect(пуб.sample).toBe(true);
      expect(пуб.phone).toBe("");
    }
  });

  it("у каждого тура есть гид-пример, дней в программе столько же, сколько в туре", () => {
    const гиды = new Set(ПРИМЕРЫ_ПАРТНЁРОВ.filter((п) => п.kind === "guide").map((п) => п.id));
    for (const т of ПРИМЕРЫ_ТУРОВ) {
      expect(гиды.has(т.providerId)).toBe(true);
      expect(т.program).toHaveLength(т.days);
      expect(т.sample).toBe(true);
    }
  });

  it("id не пересекаются и все локальные фото на месте", () => {
    const ids = [...ПРИМЕРЫ_ПАРТНЁРОВ, ...ПРИМЕРЫ_ТУРОВ].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    const фото = [...ПРИМЕРЫ_ПАРТНЁРОВ.flatMap((п) => п.photos), ...ПРИМЕРЫ_ТУРОВ.flatMap((т) => т.photos)];
    for (const ф of фото.filter((x) => x.startsWith("/"))) {
      expect(existsSync(path.join(process.cwd(), "public", ф)), ф).toBe(true);
    }
  });

  it("у водителей есть машина, у примеров со снимками Commons — подпись автора", () => {
    for (const п of ПРИМЕРЫ_ПАРТНЁРОВ.filter((x) => x.kind === "driver")) {
      expect(п.car).toBeTruthy();
      expect(п.photoCredit).toMatch(/Wikimedia Commons/);
    }
  });
});
