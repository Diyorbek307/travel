import { describe, expect, it } from "vitest";
import {
  САМАРКАНД_НОВЫЕ,
  САМАРКАНД_ОБНОВЛЕНИЯ,
  САМАРКАНД_КООРДИНАТЫ,
  обновитьМестаСамарканда,
} from "./samarkand";
import { PLACES } from "./content";
import { вУзбекистане } from "@/lib/geo-parse";
import { вСловаре } from "@/lib/content-i18n";
import { LOCALES } from "@/lib/i18n";

const ЯЗЫКИ = LOCALES.filter((l) => l !== "ru");

describe("Самарканд из базы владельца", () => {
  it("id новых мест уникальны и не совпадают с прежними", () => {
    const все = PLACES.map((p) => p.id);
    expect(new Set(все).size).toBe(все.length);
  });

  it("у каждого места точка в Узбекистане", () => {
    for (const [имя, geo] of Object.entries(САМАРКАНД_КООРДИНАТЫ)) {
      expect(вУзбекистане(geo), имя).toBe(true);
    }
  });

  it("новые места честные: без выдуманных оценок и билетов", () => {
    for (const p of САМАРКАНД_НОВЫЕ) {
      expect(p.rating, p.id).toBe(0);
      expect(p.reviews, p.id).toBe(0);
      expect(p.tickets, p.id).toEqual([]);
      expect(p.img, p.id).toMatch(/^\/places\/samarkand\//);
    }
  });

  it("названия, типы и описания переведены на все языки", () => {
    const места = [...САМАРКАНД_НОВЫЕ, ...PLACES.filter((p) => p.id in САМАРКАНД_ОБНОВЛЕНИЯ)];
    for (const p of места) {
      for (const l of ЯЗЫКИ) {
        expect(вСловаре(p.name, l), `${p.id} name ${l}`).toBe(true);
        expect(вСловаре(p.type, l), `${p.id} type ${l}`).toBe(true);
        expect(вСловаре(p.desc, l), `${p.id} desc ${l}`).toBe(true);
        for (const f of p.facts ?? []) {
          expect(вСловаре(f.label, l), `${p.id} ${f.label} ${l}`).toBe(true);
          if (!/^\+?\d/.test(f.value)) expect(вСловаре(f.value, l), `${p.id} ${f.value} ${l}`).toBe(true);
        }
      }
    }
  });

  it("сохранённая на сайте карточка обновляется, только если её не правили", () => {
    const нетронутая = {
      id: "1-reg",
      desc: "Сердце древнего Самарканда — три великолепных медресе, украшенных лучшей мозаичной плиткой в мире. Объект Всемирного наследия ЮНЕСКО.",
    };
    const правленая = { id: "1-reg", desc: "Своё описание редактора" };
    const [а, б] = обновитьМестаСамарканда([нетронутая, правленая]);
    expect(а.id).toBe("1-reg");
    expect(а.desc).not.toBe(нетронутая.desc);
    expect(б).toBe(правленая);
  });
});

describe("подробные рассказы", () => {
  it("есть у каждого места, переводы en/uz на каждый раздел", async () => {
    const { РАССКАЗЫ } = await import("./samarkand-stories");
    const { РАССКАЗЫ_ПЕРЕВОД } = await import("@/lib/content-i18n-samarkand-story");
    const { РАССКАЗЫ_ПО_ЯЗЫКАМ } = await import("@/lib/story-i18n");
    for (const p of PLACES.filter((x) => x.city === "Самарканд" && x.id !== "navruz")) {
      const р = РАССКАЗЫ[p.id];
      expect(р?.length, p.id).toBeGreaterThan(0);
      expect(РАССКАЗЫ_ПЕРЕВОД[p.id]?.en.length, p.id).toBe(р.length);
      expect(РАССКАЗЫ_ПЕРЕВОД[p.id]?.uz.length, p.id).toBe(р.length);
      for (const [язык, все] of Object.entries(РАССКАЗЫ_ПО_ЯЗЫКАМ))
        expect(все?.[p.id]?.length, `${p.id} ${язык}`).toBe(р.length);
    }
  });
});
