import { describe, expect, it } from "vitest";
import { cacheKey, checkRate, clientIp, readCache, writeCache } from "@/lib/ai-guard";
import type { Poi } from "@/lib/types";

/**
 * Защиты вокруг платных вызовов.
 *
 * Каждый вопрос к языковой модели — это деньги владельца платформы.
 * Ошибка здесь не ломает экран, а тихо выставляет счёт, поэтому проверяется
 * отдельно от всего остального.
 */

const fakePoi = { id: 1, slug: "registan", name: "Регистан" } as unknown as Poi;

describe("потолок частоты", () => {
  it("пропускает первые вопросы и считает остаток", () => {
    const ip = `test-${Math.random()}`;
    const first = checkRate(ip);
    expect(first.allowed).toBe(true);

    const second = checkRate(ip);
    expect(second.allowed).toBe(true);
    expect(second.left).toBeLessThan(first.left);
  });

  it("закрывает доступ, когда лимит исчерпан", () => {
    const ip = `flood-${Math.random()}`;
    let last = checkRate(ip);
    // Бьём заведомо больше потолка: точное число — деталь реализации.
    for (let i = 0; i < 40 && last.allowed; i++) last = checkRate(ip);

    expect(last.allowed).toBe(false);
    expect(last.retryAfter).toBeGreaterThan(0);
  });

  it("считает адреса по отдельности", () => {
    const noisy = `noisy-${Math.random()}`;
    let verdict = checkRate(noisy);
    for (let i = 0; i < 40 && verdict.allowed; i++) verdict = checkRate(noisy);
    expect(verdict.allowed).toBe(false);

    // Сосед не должен страдать из-за чужого потока.
    expect(checkRate(`quiet-${Math.random()}`).allowed).toBe(true);
  });
});

describe("адрес обратившегося", () => {
  it("берётся из заголовка прокси", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    // За прокси Render настоящий адрес идёт первым в списке.
    expect(clientIp(request)).toBe("203.0.113.7");
  });

  it("без заголовков не роняет запрос", () => {
    expect(clientIp(new Request("https://example.com"))).toBe("unknown");
  });
});

describe("кеш ответов", () => {
  it("одинаковые вопросы дают один ключ", () => {
    const a = cacheKey("Что посмотреть в Самарканде?", "ru", "samarkand", false);
    const b = cacheKey("что   посмотреть в самарканде", "ru", "samarkand", false);
    expect(a).not.toBeNull();
    expect(a).toBe(b);
  });

  it("разные языки и города разделены", () => {
    const ru = cacheKey("что посмотреть", "ru", "samarkand", false);
    const en = cacheKey("что посмотреть", "en", "samarkand", false);
    const other = cacheKey("что посмотреть", "ru", "bukhara", false);
    expect(ru).not.toBe(en);
    expect(ru).not.toBe(other);
  });

  it("личные вопросы не кешируются", () => {
    /*
     * «Что рядом» у каждого своё, а продолжение разговора зависит от
     * сказанного раньше. Общий ответ был бы просто неверным.
     */
    expect(cacheKey("что рядом", "ru", undefined, true)).toBeNull();
  });

  it("пустой вопрос ключа не даёт", () => {
    expect(cacheKey("   ", "ru", undefined, false)).toBeNull();
  });

  it("записанное читается обратно", () => {
    const key = cacheKey(`вопрос-${Math.random()}`, "ru", "khiva", false);
    expect(readCache(key)).toBeNull();

    writeCache(key, { message: "ответ", pois: [fakePoi] });
    expect(readCache(key)?.message).toBe("ответ");
    expect(readCache(key)?.pois).toHaveLength(1);
  });

  it("пустой ответ не запоминается", () => {
    // Иначе неудачный запрос закрепится на сутки.
    const key = cacheKey(`пусто-${Math.random()}`, "ru", undefined, false);
    writeCache(key, { message: "", pois: [] });
    expect(readCache(key)).toBeNull();
  });

  it("по нулевому ключу ничего не читается и не пишется", () => {
    expect(readCache(null)).toBeNull();
    expect(() => writeCache(null, { message: "ответ", pois: [] })).not.toThrow();
  });
});
