import { describe, expect, it } from "vitest";
import { вУзбекистане, разобратьКоординаты } from "./geo-parse";

describe("разобратьКоординаты", () => {
  it("два числа", () => {
    expect(разобратьКоординаты("41.3111, 69.2797")).toEqual({ lat: 41.3111, lon: 69.2797 });
    expect(разобратьКоординаты("39.6547 66.9758")).toEqual({ lat: 39.6547, lon: 66.9758 });
  });
  it("ссылки Google Maps", () => {
    expect(разобратьКоординаты("https://www.google.com/maps/@39.6547,66.9758,17z")).toEqual({
      lat: 39.6547,
      lon: 66.9758,
    });
    expect(
      разобратьКоординаты(
        "https://www.google.com/maps/place/Registan/@39.65,66.97,17z/data=!3d39.6547!4d66.9758",
      ),
    ).toEqual({ lat: 39.6547, lon: 66.9758 });
    expect(разобратьКоординаты("https://maps.google.com/?q=41.31,69.27")).toEqual({ lat: 41.31, lon: 69.27 });
  });
  it("ссылки Яндекс Карт — долгота первой", () => {
    expect(разобратьКоординаты("https://yandex.uz/maps/?ll=69.2797%2C41.3111&z=16")).toEqual({
      lat: 41.3111,
      lon: 69.2797,
    });
    expect(разобратьКоординаты("https://yandex.ru/maps/?pt=66.9758,39.6547")).toEqual({
      lat: 39.6547,
      lon: 66.9758,
    });
  });
  it("мусор и точки вне Земли — null", () => {
    expect(разобратьКоординаты("Ташкент")).toBeNull();
    expect(разобратьКоординаты("")).toBeNull();
    expect(разобратьКоординаты("200, 300")).toBeNull();
  });
  it("проверка на Узбекистан", () => {
    expect(вУзбекистане({ lat: 41.31, lon: 69.27 })).toBe(true);
    expect(вУзбекистане({ lat: 69.27, lon: 41.31 })).toBe(false);
  });
});
