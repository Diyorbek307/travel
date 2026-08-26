import { describe, expect, it } from "vitest";
import { ask, parseMinutes } from "@/lib/assistant";
import { findCity, stem } from "@/lib/city-names";
import { listCities } from "@/lib/db";

/**
 * Разбор запроса помощника.
 *
 * Этот слой работает всегда: он же отвечает, когда нет ключа языковой модели
 * или связи. Если он путает намерения, помощник отвечает не на тот вопрос —
 * и туристу это дороже, чем сухая формулировка.
 */

describe("сколько времени у туриста", () => {
  it("часы", () => {
    expect(parseMinutes("маршрут на 4 часа")).toBe(240);
    expect(parseMinutes("у меня 2 часа")).toBe(120);
  });

  it("минуты", () => {
    expect(parseMinutes("успею за 90 минут?")).toBe(90);
  });

  it("день и полдня", () => {
    expect(parseMinutes("на день")).toBe(480);
    expect(parseMinutes("полдня")).toBe(240);
  });

  it("узбекский и английский", () => {
    expect(parseMinutes("3 soat")).toBe(180);
    expect(parseMinutes("4 hours")).toBe(240);
  });

  it("без указания времени — ничего", () => {
    expect(parseMinutes("что посмотреть в Бухаре")).toBeUndefined();
  });

  it("не верит завышенным числам", () => {
    // «100 часов» — опечатка или шутка; сутки на маршрут и так предел.
    expect(parseMinutes("100 часов")).toBeLessThanOrEqual(12 * 60);
  });
});

describe("город из фразы", () => {
  const cities = listCities("ru");

  it("узнаёт падежи", () => {
    // Ошибка, которую поймала проверка вопросами: разбор срезал одну букву
    // и только у длинных названий, поэтому «по Хиве» проходило мимо «Хива».
    expect(findCity("маршрут на день по Хиве", cities)).toBe("khiva");
    expect(findCity("в Бухаре что посмотреть", cities)).toBe("bukhara");
    expect(findCity("4 часа в Самарканде", cities)).toBe("samarkand");
    expect(findCity("куда сходить в Фергане", cities)).toBe("fergana");
    expect(findCity("что интересного в Термезе", cities)).toBe("termez");
  });

  it("узнаёт по slug", () => {
    expect(findCity("tashkent", cities)).toBe("tashkent");
  });

  it("не выдумывает город там, где его нет", () => {
    expect(findCity("хочу поесть плов", cities)).toBeUndefined();
  });

  it("основа слова отбрасывает окончание", () => {
    expect(stem("Хива")).toBe(stem("Хиве"));
    expect(stem("Бухара")).toBe(stem("Бухаре"));
  });
});

describe("намерения", () => {
  const say = (text: string) => ask({ text, lang: "ru" });

  it("просьба о маршруте", () => {
    expect(say("маршрут на 4 часа по Самарканду").intent).toBe("plan_route");
  });

  it("запас времени сам по себе означает маршрут", () => {
    /*
     * Случай из ТЗ: «У меня 4 часа в Бухаре, люблю историю и хочу плов».
     * Здесь есть и «истор», и «плов», но человек просит маршрут, а еда
     * и история — это его интересы. Указание времени должно побеждать.
     */
    const reply = say("у меня 4 часа в Бухаре, люблю историю и хочу попробовать плов");
    expect(reply.intent).toBe("plan_route");
    expect(reply.parsed?.city).toBe("bukhara");
    expect(reply.parsed?.minutes).toBe(240);
  });

  it("просьба рассказать — это рассказ, а не маршрут", () => {
    expect(say("расскажи про Регистан").intent).toBe("story");
  });

  it("упоминание истории без просьбы рассказать маршрутом не становится", () => {
    expect(say("расскажи про Регистан").pois.length).toBeGreaterThan(0);
  });

  it("еда", () => {
    expect(say("где поесть плов в Самарканде").intent).toBe("food");
  });

  it("бесплатное", () => {
    expect(say("что посмотреть бесплатно в Бухаре").intent).toBe("free");
  });

  it("вечер", () => {
    expect(say("куда сходить вечером в Ташкенте").intent).toBe("evening");
  });

  it("непонятный вопрос честно признаётся непонятым", () => {
    const reply = say("сколько стоит билет на Луну");
    expect(reply.intent).toBe("unknown");
    expect(reply.message.length).toBeGreaterThan(0);
  });
});

describe("ответы", () => {
  it("бесплатная подборка содержит только бесплатное", () => {
    const reply = ask({ text: "что бесплатно в Бухаре", lang: "ru" });
    expect(reply.pois.length).toBeGreaterThan(0);
    for (const poi of reply.pois) expect(poi.is_free).toBeTruthy();
  });

  it("маршрут вечером составляется на утро, а не отказывает", () => {
    /*
     * Ошибка, найденная проверкой вопросами: в одиннадцать вечера всё
     * закрыто, планировщик честно возвращал пустоту, и помощник отвечал
     * отказом. Но человек, спрашивающий ночью, планирует завтрашний день.
     */
    const reply = ask({ text: "маршрут на 4 часа по Самарканду", lang: "ru" });
    expect(reply.route?.stops.length ?? 0).toBeGreaterThan(0);
  });

  it("никогда не возвращает пустое сообщение", () => {
    for (const text of ["привет", "маршрут", "?", "что рядом", "музеи"]) {
      expect(ask({ text, lang: "ru" }).message.trim().length).toBeGreaterThan(0);
    }
  });
});
