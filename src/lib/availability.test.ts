import { describe, expect, it } from "vitest";
import { разобратьОтветПартнёра, ручноеНаличие } from "./availability";

describe("ответ системы партнёра", () => {
  it("гостиница: берёт только известные категории и неотрицательные числа", () => {
    const н = разобратьОтветПартнёра({
      rooms: [
        { category: "standard", free: 3, price: 55 },
        { category: "business", free: 0 },
        { category: "penthouse", free: 1 }, // не наша категория
        { category: "economy", free: -2 }, // мусор
        "мусор",
      ],
    });
    expect(н?.источник).toBe("partner");
    expect(н?.номера).toEqual([
      { категория: "standard", свободно: 3, цена: 55 },
      { категория: "business", свободно: 0 },
    ]);
  });

  it("ресторан: свободные столы и ближайшее время", () => {
    const н = разобратьОтветПартнёра({ free_tables: 4.7, next_free_time: "19:30" });
    expect(н?.столов).toBe(4);
    expect(н?.ближайшее).toBe("19:30");
  });

  it("ответ не по стандарту — null, а не пустое «ничего не свободно»", () => {
    expect(разобратьОтветПартнёра(null)).toBeNull();
    expect(разобратьОтветПартнёра("ok")).toBeNull();
    expect(разобратьОтветПартнёра({ hello: "world" })).toBeNull();
    expect(разобратьОтветПартнёра({ next_free_time: "скоро" })).toBeNull();
  });
});

describe("ручной режим", () => {
  const сейчас = Date.parse("2026-10-01T12:00:00Z");

  it("отдаёт цифры, отмеченные в панели", () => {
    const н = ручноеНаличие(
      { kind: "manual", manual: { standard: 2, tables: 5 }, manualUpdatedAt: "2026-10-01T09:00:00Z" },
      сейчас,
    );
    expect(н?.номера).toEqual([{ категория: "standard", свободно: 2 }]);
    expect(н?.столов).toBe(5);
  });

  it("цифры старше суток не показываем — турист поверил бы устаревшим", () => {
    expect(
      ручноеНаличие(
        { kind: "manual", manual: { tables: 5 }, manualUpdatedAt: "2026-09-29T09:00:00Z" },
        сейчас,
      ),
    ).toBeNull();
  });

  it("другой режим или нет даты обновления — ничего", () => {
    expect(ручноеНаличие({ kind: "partner", externalId: "1" }, сейчас)).toBeNull();
    expect(ручноеНаличие({ kind: "manual", manual: { tables: 5 } }, сейчас)).toBeNull();
    expect(ручноеНаличие(undefined, сейчас)).toBeNull();
  });
});
