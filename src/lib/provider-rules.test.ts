import { describe, expect, it } from "vitest";
import {
  ТАРИФЫ_ПО_УМОЛЧАНИЮ,
  виденВКаталоге,
  порядокКаталога,
  продлить,
  публично,
  разобратьАнкету,
  разобратьТур,
  ценаПокупки,
  type Партнёр,
} from "./provider-rules";

const сейчас = Date.parse("2026-10-14T12:00:00Z");
const через = (дней: number) => new Date(сейчас + дней * 86_400_000).toISOString();

const база: Партнёр = {
  id: "drv_1",
  kind: "driver",
  userId: "u1",
  status: "active",
  verified: true,
  name: "Азиз",
  photo: "",
  phone: "+998901234567",
  city: "Самарканд",
  cities: [],
  languages: ["ru"],
  bio: "",
  experienceYears: 5,
  priceDay: 60,
  hoursPerDay: 10,
  includes: [],
  photos: [],
  car: {
    make: "Chevrolet",
    model: "Cobalt",
    year: 2022,
    color: "белый",
    seats: 4,
    class: "comfort",
    ac: true,
    plate: "30A123BC",
  },
  paidUntil: через(10),
  promotedUntil: null,
  promoPriority: 0,
  views: 0,
  requests: 0,
  createdAt: через(-5),
  updatedAt: через(-5),
};

describe("каталог партнёров", () => {
  it("виден только проверенный, активный и оплаченный", () => {
    expect(виденВКаталоге(база, сейчас)).toBe(true);
    expect(виденВКаталоге({ ...база, verified: false }, сейчас)).toBe(false);
    expect(виденВКаталоге({ ...база, status: "pending" }, сейчас)).toBe(false);
    expect(виденВКаталоге({ ...база, paidUntil: через(-1) }, сейчас)).toBe(false);
  });

  it("туристу не уходят госномер и служебные поля", () => {
    const п = публично(база, сейчас) as unknown as Record<string, unknown>;
    expect((п.car as Record<string, unknown>).plate).toBeUndefined();
    expect(п.paidUntil).toBeUndefined();
    expect(п.userId).toBeUndefined();
    expect(п.promoted).toBe(false);
  });

  it("«Рекомендуем» идут первыми и по приоритету", () => {
    const обычный = { ...база, id: "a", createdAt: через(-1) };
    const рек1 = { ...база, id: "b", promotedUntil: через(3), promoPriority: 1 };
    const рек5 = { ...база, id: "c", promotedUntil: через(3), promoPriority: 5 };
    const список = [обычный, рек1, рек5].sort((a, b) => порядокКаталога(a, b, сейчас));
    expect(список.map((x) => x.id)).toEqual(["c", "b", "a"]);
  });
});

describe("оплата", () => {
  it("продление идёт от конца действующего срока, а истёкший — от сегодня", () => {
    expect(продлить(через(10), 30, сейчас)).toBe(через(40));
    expect(продлить(через(-3), 30, сейчас)).toBe(через(30));
    expect(продлить(null, 7, сейчас)).toBe(через(7));
  });

  it("за 3 и 6 месяцев — скидка", () => {
    const т = ТАРИФЫ_ПО_УМОЛЧАНИЮ;
    expect(ценаПокупки("month1", "driver", т)).toEqual({
      сумма: т.driverMonth,
      дней: 30,
      продвижение: false,
    });
    expect(ценаПокупки("month3", "guide", т).сумма).toBeLessThan(т.guideMonth * 3);
    expect(ценаПокупки("promoWeek", "driver", т).продвижение).toBe(true);
  });
});

describe("анкета и туры", () => {
  const анкета = {
    name: "Азиз",
    phone: "+998 90 123 45 67",
    city: "Самарканд",
    languages: ["ru", "en"],
    priceDay: 60,
    car: { make: "Chevrolet", model: "Cobalt", year: 2022, seats: 4, class: "comfort" },
    photos: ["/api/media/abc", "https://evil.example/x.jpg"],
  };

  it("водителю нужна машина, чужие ссылки на фото отбрасываются", () => {
    const ок = разобратьАнкету("driver", анкета);
    expect(ок.ok).toBe(true);
    if (ок.ok) expect(ок.поля.photos).toEqual(["/api/media/abc"]);
    expect(разобратьАнкету("driver", { ...анкета, car: {} })).toEqual({ ok: false, ошибка: "car_required" });
    expect(разобратьАнкету("driver", { ...анкета, phone: "12" })).toEqual({
      ok: false,
      ошибка: "phone_invalid",
    });
  });

  it("тур на 5 дней требует программу на каждый день", () => {
    const тур = {
      title: "Самарканд и горы",
      days: 5,
      pricePerPerson: 450,
      maxGroup: 6,
      program: [1, 2, 3, 4, 5].map((д) => ({ title: `День ${д}`, text: "…" })),
    };
    expect(разобратьТур(тур).ok).toBe(true);
    expect(разобратьТур({ ...тур, program: тур.program.slice(0, 3) })).toEqual({
      ok: false,
      ошибка: "program_required",
    });
    expect(разобратьТур({ ...тур, days: 20 })).toEqual({ ok: false, ошибка: "days_invalid" });
  });
});
