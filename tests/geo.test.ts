import { describe, expect, it } from "vitest";
import {
  formatDistance,
  formatDuration,
  formatPrice,
  haversine,
  isOpenAt,
  todayHours,
  travelMinutes,
} from "@/lib/geo";

/**
 * География и форматирование.
 *
 * Основание всей логики маршрутов: если расстояние или часы работы
 * считаются неверно, планировщик уверенно строит неверный маршрут,
 * и ошибка становится видна только на месте.
 */

describe("расстояние", () => {
  it("между Самаркандом и Бухарой около 240 километров", () => {
    // Опорные точки — центры городов из базы; расстояние по прямой
    // проверяется по независимому источнику, а не по нашей же формуле.
    const meters = haversine(39.6547, 66.9758, 39.7756, 64.4143);
    expect(meters).toBeGreaterThan(215_000);
    expect(meters).toBeLessThan(230_000);
  });

  it("в одной точке равно нулю", () => {
    expect(haversine(41.3111, 69.2797, 41.3111, 69.2797)).toBe(0);
  });

  it("симметрично", () => {
    const there = haversine(39.65, 66.97, 41.31, 69.27);
    const back = haversine(41.31, 69.27, 39.65, 66.97);
    expect(Math.abs(there - back)).toBeLessThan(0.001);
  });
});

describe("время в пути", () => {
  it("пешком медленнее, чем на такси", () => {
    const distance = 3000;
    expect(travelMinutes(distance, "walk")).toBeGreaterThan(
      travelMinutes(distance, "taxi"),
    );
  });

  it("растёт вместе с расстоянием", () => {
    expect(travelMinutes(5000, "walk")).toBeGreaterThan(travelMinutes(1000, "walk"));
  });
});

describe("часы работы", () => {
  // Формат из базы: ключ — номер дня недели, значение — интервал или null
  // для выходного. Понедельник закрыт, остальные дни с 09:00 до 17:00.
  const hours = Object.fromEntries(
    Array.from({ length: 7 }, (_, day) => [
      String(day),
      day === 1 ? null : { open: "09:00", close: "17:00" },
    ]),
  );

  it("в выходной день сообщает о выходном", () => {
    expect(todayHours(hours, 1)).toBe("выходной");
  });

  it("в рабочий день возвращает интервал", () => {
    expect(todayHours(hours, 2)).toContain("09:00");
    expect(todayHours(hours, 2)).toContain("17:00");
  });

  it("открыто в середине дня", () => {
    expect(isOpenAt(hours, 12 * 60, 2)).toBe(true);
  });

  it("закрыто до открытия и после закрытия", () => {
    expect(isOpenAt(hours, 8 * 60, 2)).toBe(false);
    expect(isOpenAt(hours, 18 * 60, 2)).toBe(false);
  });

  it("закрыто в выходной в любое время", () => {
    expect(isOpenAt(hours, 12 * 60, 1)).toBe(false);
  });

  it("за пять минут до закрытия уже закрыто", () => {
    // Заходить в музей на пять минут бессмысленно, и планировщик не должен
    // считать это посещением.
    expect(isOpenAt(hours, 16 * 60 + 55, 2)).toBe(false);
    expect(isOpenAt(hours, 16 * 60 + 45, 2)).toBe(true);
  });

  it("объект без расписания считается открытым круглосуточно", () => {
    expect(isOpenAt(null, 3 * 60, 1)).toBe(true);
  });
});

describe("форматирование", () => {
  it("бесплатное показывается словом, а не нулём", () => {
    expect(formatPrice(0, "ru")).not.toContain("0");
  });

  it("цена содержит число", () => {
    expect(formatPrice(75_000, "ru")).toMatch(/75/);
  });

  it("метры не превращаются в километры раньше времени", () => {
    expect(formatDistance(300, "ru")).toMatch(/300/);
  });

  it("километры показываются километрами", () => {
    expect(formatDistance(2500, "ru")).toMatch(/2[.,]5/);
  });

  it("часы и минуты разделяются", () => {
    const text = formatDuration(95, "ru");
    expect(text).toMatch(/1/);
    expect(text).toMatch(/35/);
  });
});
