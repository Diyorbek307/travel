import { describe, expect, it } from "vitest";
import { ссылкаИзКода } from "./qr-scanner";
import { найтиВРассказе } from "./place-guide";

describe("ссылкаИзКода", () => {
  it("понимает ссылки приложения, страницы мест и схему hellouz://", () => {
    expect(ссылкаИзКода("https://uzbekistan-travel.onrender.com/?place=1-reg")).toBe("place:1-reg");
    expect(ссылкаИзКода("https://uzbekistan-travel.onrender.com/place/12-smaksr")).toBe("place:12-smaksr");
    expect(ссылкаИзКода("hellouz://place/3-gur")).toBe("place:3-gur");
    expect(ссылкаИзКода("https://x.uz/?audio=a7")).toBe("audio:a7");
    expect(ссылкаИзКода("place:5-bibi")).toBe("place:5-bibi");
  });
  it("чужой код — null", () => {
    expect(ссылкаИзКода("https://example.com/menu")).toBeNull();
    expect(ссылкаИзКода("просто текст")).toBeNull();
  });
});

describe("найтиВРассказе", () => {
  it("находит предложение по словам вопроса", () => {
    const т = ["Медресе построили в 1417 году. Шердор возвёл Ялангтуш Бахадур. Купол бирюзовый."];
    expect(найтиВРассказе("кто построил Шердор?", т)).toContain("Ялангтуш");
    expect(найтиВРассказе("где парковка", т)).toBeNull();
  });
});
