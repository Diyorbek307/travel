import { describe, expect, it } from "vitest";
import { чистыеПравки } from "./venue-edit";

describe("чистыеПравки", () => {
  it("пропускает только разрешённые поля своего вида", () => {
    const итог = чистыеПравки("restaurant", {
      desc: "  Лучший плов  ",
      open: "09:00–15:00",
      name: "Подменённое имя",
      status: "hidden",
      premiumDiscount: 50,
      rating: 5,
      roomTypes: [{ id: "x" }],
    });
    expect(итог).toEqual({ desc: "Лучший плов", open: "09:00–15:00" });
  });
  it("фото — только свои или https", () => {
    const итог = чистыеПравки("hotel", {
      img: "javascript:alert(1)",
      imgs: ["/api/media/abc-1", "http://x/y.jpg", "https://ok/y.jpg", 5],
    });
    expect(итог).toEqual({ imgs: ["/api/media/abc-1", "https://ok/y.jpg"] });
  });
  it("факты без пустых, связь — только известного вида", () => {
    const итог = чистыеПравки("hotel", {
      facts: [
        { label: "Заезд", value: "с 14:00" },
        { label: "", value: "x" },
      ],
      connection: { kind: "hack" },
    });
    expect(итог).toEqual({ facts: [{ id: "f-Заезд", label: "Заезд", value: "с 14:00" }] });
  });
  it("вложенные списки очищаются: ни функций, ни чужих ключей", () => {
    const итог = чистыеПравки("restaurant", {
      menu: [
        {
          id: "m1",
          name: "Плов",
          price: "45 000",
          "bad key!": 1,
          deep: { a: { b: { c: { d: { e: 1 } } } } },
        },
      ],
    });
    expect(итог?.menu).toEqual([{ id: "m1", name: "Плов", price: "45 000", deep: { a: { b: {} } } }]);
  });
  it("мусор — null", () => {
    expect(чистыеПравки("hotel", null)).toBeNull();
    expect(чистыеПравки("hotel", { name: "x" })).toBeNull();
  });
});
