import { describe, expect, it } from "vitest";
import { кодСтраны, названиеСтраны, списокСтран } from "./countries";

describe("страны", () => {
  it("одна страна, как её ни напиши, — один код", () => {
    expect(кодСтраны("Germany")).toBe("DE");
    expect(кодСтраны("Deutschland")).toBe("DE");
    expect(кодСтраны("Германия")).toBe("DE");
    expect(кодСтраны("uz")).toBe("UZ");
    expect(кодСтраны("Узбекистан")).toBe("UZ");
    expect(кодСтраны("  Uzbekistan ")).toBe("UZ");
  });

  it("непонятное не превращается в чужую страну", () => {
    expect(кодСтраны("Нарния")).toBeNull();
    expect(кодСтраны("")).toBeNull();
    expect(кодСтраны(undefined)).toBeNull();
  });

  it("название — на языке того, кто смотрит; неизвестное — как было", () => {
    expect(названиеСтраны("DE", "ru")).toBe("Германия");
    expect(названиеСтраны("Deutschland", "en")).toBe("Germany");
    expect(названиеСтраны("Нарния", "ru")).toBe("Нарния");
  });

  it("список — без повторов и по алфавиту", () => {
    const с = списокСтран("ru");
    expect(new Set(с.map((x) => x.код)).size).toBe(с.length);
    expect(с.find((x) => x.код === "UZ")?.имя).toBe("Узбекистан");
  });
});
