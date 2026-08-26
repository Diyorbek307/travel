import { describe, expect, it } from "vitest";
import { planRoute } from "@/lib/planner";
import { isOpenAt } from "@/lib/geo";
import { listPois } from "@/lib/db";
import type { PlannerRequest } from "@/lib/types";

/**
 * Планировщик маршрутов.
 *
 * Самый сложный алгоритм платформы и единственный, чья ошибка видна туристу
 * только на месте: маршрут выглядит правдоподобно, а музей закрыт или день
 * не помещается. За время разработки здесь нашлось шесть ошибок, и каждая
 * ловилась вручную. Проверки ниже закрепляют именно те инварианты, которые
 * тогда нарушались.
 *
 * Тесты читают заполненную базу: перед запуском нужен `npm run seed`.
 */

const MORNING = 9 * 60;

function ask(extra: Partial<PlannerRequest> = {}) {
  return planRoute({
    city: "samarkand",
    minutes: 240,
    themes: [],
    budget: "medium",
    mode: "walk",
    lang: "ru",
    startAtMin: MORNING,
    ...extra,
  });
}

describe("маршрут по Самарканду на четыре часа", () => {
  it("строится", () => {
    const route = ask();
    expect(route).not.toBeNull();
    expect(route!.stops.length).toBeGreaterThan(1);
  });

  it("укладывается в отпущенное время", () => {
    const route = ask()!;
    // total_min — осмотр плюс дорога, как его считает сам планировщик.
    expect(route.total_min).toBeLessThanOrEqual(240);
  });

  it("включает Регистан", () => {
    /*
     * Регистан — главный объект города и самый долгий для осмотра. Ранняя
     * версия отбирала точки по отношению «польза к затратам», и длинный
     * осмотр проигрывал трём коротким: маршрут по Самарканду получался
     * без Регистана. Это чинилось дважды — весом длительности и отдельным
     * проходом по опорным объектам.
     */
    const route = ask()!;
    expect(route.stops.map((s) => s.poi.slug)).toContain("registan");
  });

  it("состоит только из объектов этого города", () => {
    const route = ask()!;
    const inCity = new Set(listPois({ city: "samarkand", lang: "ru" }).map((p) => p.slug));
    for (const stop of route.stops) {
      expect(inCity.has(stop.poi.slug)).toBe(true);
    }
  });

  it("не ведёт в закрытые объекты", () => {
    const route = ask()!;
    const day = new Date().getDay();
    let clock = MORNING;
    for (const stop of route.stops) {
      clock += stop.leg_min;
      expect(isOpenAt(stop.poi.opening_hours, clock, day)).toBe(true);
      clock += stop.stay_min;
    }
  });

  it("не показывает один объект одновременно в маршруте и в пропущенных", () => {
    /*
     * Настоящая ошибка: список включённых объектов брался из служебного
     * множества, которое подменялось при пересчёте маршрута. Мечеть Минор
     * оказывалась и в маршруте, и в списке «не вошло» — сразу.
     *
     * В пропущенных лежит имя, а не slug, поэтому сравниваем по именам.
     */
    const route = ask()!;
    const inRoute = new Set(route.stops.map((s) => s.poi.name));
    for (const skipped of route.skipped) {
      expect(inRoute.has(skipped.name)).toBe(false);
    }
  });

  it("даёт один и тот же ответ на один и тот же запрос", () => {
    // Планировщик детерминирован: иначе два одинаковых вопроса помощнику
    // дадут разные маршруты, и доверять ему нельзя.
    const a = ask()!;
    const b = ask()!;
    expect(a.stops.map((s) => s.poi.slug)).toEqual(b.stops.map((s) => s.poi.slug));
  });
});

describe("время", () => {
  it("на большем запасе не становится меньше остановок", () => {
    const short = ask({ minutes: 180 })!;
    const long = ask({ minutes: 420 })!;
    expect(long.stops.length).toBeGreaterThanOrEqual(short.stops.length);
  });

  it("на очень коротком запасе либо укладывается, либо честно отказывает", () => {
    const route = ask({ minutes: 30 });
    if (route) expect(route.total_min).toBeLessThanOrEqual(30);
  });

  it("поздним вечером всё закрыто и маршрут пуст", () => {
    const route = ask({ startAtMin: 23 * 60 });
    expect(route === null || route.stops.length === 0).toBe(true);
  });
});

describe("пожелания туриста", () => {
  it("бюджетный режим не тащит в маршрут дорогие объекты", () => {
    const cheap = ask({ budget: "low" })!;
    const average =
      cheap.stops.reduce((sum, s) => sum + s.poi.price_uzs, 0) /
      Math.max(1, cheap.stops.length);
    expect(average).toBeLessThan(60_000);
  });

  it("с просьбой поесть в маршруте появляется еда", () => {
    /*
     * Обед вставляется только если на него остались деньги: при среднем
     * бюджете дорогие памятники съедают весь запас, и это верно — лучше
     * не звать в кафе, на которое не хватит. Поэтому проверяем с высоким.
     */
    const withMeal = ask({ minutes: 420, budget: "high", includeMeals: true })!;
    const kinds = withMeal.stops.map((s) => s.poi.category);
    expect(kinds.some((k) => k === "restaurant" || k === "cafe")).toBe(true);
  });

  it("на такси успевает не меньше, чем пешком", () => {
    const onFoot = ask({ mode: "walk" })!;
    const byTaxi = ask({ mode: "taxi" })!;
    expect(byTaxi.stops.length).toBeGreaterThanOrEqual(onFoot.stops.length);
  });

  it("выбранная тема отражается в подборе", () => {
    const museums = ask({ minutes: 360, themes: ["museums"] })!;
    expect(museums.stops.some((s) => s.poi.themes.includes("museums"))).toBe(true);
  });
});

describe("другие города", () => {
  for (const city of ["bukhara", "khiva", "tashkent"]) {
    it(`${city}: маршрут строится и укладывается в срок`, () => {
      const route = ask({ city, minutes: 300 });
      expect(route).not.toBeNull();
      expect(route!.stops.length).toBeGreaterThan(0);

      expect(route!.total_min).toBeLessThanOrEqual(300);
    });
  }

  it("несуществующий город не роняет планировщик", () => {
    const route = ask({ city: "atlantis" });
    expect(route === null || route.stops.length === 0).toBe(true);
  });
});
