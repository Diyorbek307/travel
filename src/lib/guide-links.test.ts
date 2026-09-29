import { describe, expect, it } from "vitest";
import { карточкиОтвета } from "./guide-links";
import type { Content } from "./types";

const c = {
  places: [
    { id: "1-reg", status: "active" },
    { id: "скрыто", status: "hidden" },
  ],
  hotels: [{ id: "2-h2", status: "active" }],
  restaurants: [{ id: "6-rs6", status: "active" }],
} as unknown as Content;

describe("карточкиОтвета", () => {
  it("отрезает строку ссылок и оставляет только видимые записи", () => {
    const r = карточкиОтвета("Сходите на Регистан.\n[[place:1-reg, hotel:2-h2, place:скрыто, place:нет]]", c);
    expect(r.текст).toBe("Сходите на Регистан.");
    expect(r.ссылки).toEqual(["place:1-reg", "hotel:2-h2"]);
  });
  it("убирает метки внутри текста и повторы", () => {
    const r = карточкиОтвета("Плов в [restaurant:6-rs6] хорош.\n[[restaurant:6-rs6, restaurant:6-rs6]]", c);
    expect(r.текст).toBe("Плов в хорош.");
    expect(r.ссылки).toEqual(["restaurant:6-rs6"]);
  });
  it("без ссылок — текст как есть", () => {
    expect(карточкиОтвета("Привет!", c)).toEqual({ текст: "Привет!", ссылки: [] });
  });
});
