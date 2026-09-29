import { describe, expect, it } from "vitest";
import { SEED } from "./seed";

/*
 * id семени зависит от номера записи в списке. Вставка нового места в
 * начало сдвинула бы id всех прежних — и сохранённая база, отзывы, брони
 * и штампы паспорта потеряли бы свои места, а список задвоился бы.
 * Новые записи — только в конец.
 */
describe("id семян", () => {
  it("у давних мест id не меняются", () => {
    const id = (имя: string) => SEED.places.find((p) => p.name === имя)?.id;
    expect(id("Площадь Регистан")).toBe("1-reg");
    expect(id("Шахи-Зинда")).toBe("2-shah");
  });

  it("в каждом разделе нет повторов ни по id, ни по названию", () => {
    for (const раздел of [SEED.places, SEED.hotels, SEED.restaurants]) {
      const ids = раздел.map((x) => x.id);
      const имена = раздел.map((x) => x.name);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(имена).size).toBe(имена.length);
    }
  });
});
