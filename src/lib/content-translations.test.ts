import { describe, expect, it } from "vitest";
import { строкиКонтента } from "./content-translations";
import { jsonИзОтвета } from "./ai";
import { переведиКонтент } from "./content-i18n";
import type { Content } from "./types";

describe("строкиКонтента", () => {
  it("берёт русские тексты и пропускает ссылки, id и латиницу", () => {
    const c = {
      places: [
        {
          id: "новое-место",
          name: "Озеро Айдаркуль",
          img: "https://x/Картинка.jpg",
          desc: "Озеро в пустыне",
          facts: [{ id: "f1", label: "Вход", value: "Бесплатно" }],
          entry: "$5",
        },
      ],
      hotels: [{ id: "h", name: "Hyatt Regency", desc: "Озеро в пустыне", status: "active" }],
    } as unknown as Content;
    expect(строкиКонтента(c).sort()).toEqual(
      ["Бесплатно", "Вход", "Озеро Айдаркуль", "Озеро в пустыне"].sort(),
    );
  });
});

describe("jsonИзОтвета", () => {
  it("снимает обёртку ```json и лишний текст", () => {
    expect(jsonИзОтвета('Вот:\n```json\n{"1": {"en": "Lake"}}\n```')).toEqual({ "1": { en: "Lake" } });
  });
  it("мусор — null", () => {
    expect(jsonИзОтвета("не json")).toBeNull();
  });
});

describe("переведиКонтент с живыми переводами", () => {
  it("живой перевод главнее словаря, пустой — не считается", () => {
    const живые = { "Озеро Выдуманное": { en: "Made-up Lake", de: "" } };
    expect(переведиКонтент("Озеро Выдуманное", "en", живые)).toBe("Made-up Lake");
    // Немецкого нет — показываем английский, узбекскому читателю — русский.
    expect(переведиКонтент("Озеро Выдуманное", "de", живые)).toBe("Made-up Lake");
    expect(переведиКонтент("Озеро Выдуманное", "uz", живые)).toBe("Озеро Выдуманное");
    expect(переведиКонтент("Озеро Выдуманное", "ru", живые)).toBe("Озеро Выдуманное");
  });
});
