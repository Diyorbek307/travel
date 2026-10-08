import { describe, expect, it } from "vitest";
import { видимые, задержкаОтвета, имяПомощника, печатает, разобратьОтвет } from "./support-desk";
import type { SupportMessage, SupportThread } from "./community";

const сейчас = Date.parse("2026-10-08T10:00:00Z");
const м = (id: string, author: SupportMessage["author"], showAt?: string): SupportMessage => ({
  id,
  author,
  text: id,
  createdAt: "2026-10-08T09:59:00Z",
  ...(showAt ? { showAt } : {}),
});

describe("поддержка с ИИ", () => {
  it("ответ ИИ прячется до своей минуты, а пока — «печатает»", () => {
    const сообщения = [м("a", "user"), м("b", "ai", "2026-10-08T10:00:20Z")];
    expect(видимые(сообщения, сейчас).map((x) => x.id)).toEqual(["a"]);
    expect(видимые(сообщения, сейчас + 30_000).map((x) => x.id)).toEqual(["a", "b"]);
    const ветка: SupportThread = { userId: "u", messages: сообщения, updatedAt: "", unreadForStaff: 0 };
    expect(печатает(ветка, сейчас)).toBe(true);
    expect(печатает(ветка, сейчас + 30_000)).toBe(false);
  });

  it("зависшее «думает» гаснет через две минуты", () => {
    const ветка: SupportThread = {
      userId: "u",
      messages: [],
      updatedAt: "",
      unreadForStaff: 0,
      aiPendingSince: "2026-10-08T09:59:30Z",
    };
    expect(печатает(ветка, сейчас)).toBe(true);
    expect(печатает(ветка, сейчас + 3 * 60_000)).toBe(false);
  });

  it("пауза перед ответом — от 5 до 30 секунд", () => {
    for (let i = 0; i < 200; i++) {
      const п = задержкаОтвета(i * 20);
      expect(п).toBeGreaterThanOrEqual(5_000);
      expect(п).toBeLessThanOrEqual(30_000);
    }
  });

  it("имя помощника на языке человека", () => {
    expect(имяПомощника("otabek", "ru")).toBe("Утабек");
    expect(имяПомощника("otabek", "uz")).toBe("Oʻtabek");
    expect(имяПомощника("otabek", "en")).toBe("Otabek");
    expect(имяПомощника(undefined, "ru")).toBe("Равшан");
  });

  it("разбор ответа модели", () => {
    expect(разобратьОтвет('```json\n{"reply":"Привет","handoff":true,"bug":null}\n```')).toEqual({
      reply: "Привет",
      handoff: true,
      bug: null,
    });
    expect(
      разобратьОтвет('{"reply":"Передал","handoff":false,"bug":{"title":"Не открывается карта","details":"Экран маршрута"}}')
        ?.bug,
    ).toEqual({ title: "Не открывается карта", details: "Экран маршрута" });
    // Не JSON — отдаём как текст; обрывок JSON туристу не показываем.
    expect(разобратьОтвет("Просто текст")?.reply).toBe("Просто текст");
    expect(разобратьОтвет('{"reply": "оборв')).toBeNull();
  });
});
