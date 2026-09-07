import { afterEach, describe, expect, it, vi } from "vitest";
import { требуетсяСекрет, вПродакшене } from "./secrets";

/**
 * Правило одно и оно важное: в бою секрет обязателен, а в разработке
 * подставляется запасной. Ошибка здесь тихо открывает вход в админку и
 * подделку сессий, поэтому обе ветки проверяем явно. Режим подменяем
 * через vi.stubEnv, а после каждого теста возвращаем как было.
 */
describe("требуетсяСекрет", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("возвращает заданное значение как есть", () => {
    expect(требуетсяСекрет("ANY", "настоящий-ключ", "запас")).toBe("настоящий-ключ");
  });

  it("в разработке без значения берёт запасной", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(требуетсяСекрет("ANY", undefined, "запас")).toBe("запас");
    expect(требуетсяСекрет("ANY", "", "запас")).toBe("запас");
  });

  it("в бою без значения падает, а не открывается настежь", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => требуетсяСекрет("ADMIN_SECRET", undefined, "запас")).toThrow(/ADMIN_SECRET/);
  });

  it("в бою с заданным значением не падает", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(требуетсяСекрет("ADMIN_SECRET", "боевой-ключ", "запас")).toBe("боевой-ключ");
  });

  it("вПродакшене отражает NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(вПродакшене()).toBe(true);
    vi.stubEnv("NODE_ENV", "development");
    expect(вПродакшене()).toBe(false);
  });
});
