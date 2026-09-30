import { describe, expect, it } from "vitest";
import { разобратьПакеты } from "./airalo";

describe("разобратьПакеты", () => {
  it("берёт пакеты eSIM из ответа /v2/packages, без пополнений, по цене", () => {
    const ответ = {
      data: [
        {
          country_code: "UZ",
          operators: [
            {
              title: "Uzbek Mobile",
              packages: [
                {
                  id: "uz-30d-10gb",
                  type: "sim",
                  price: 20,
                  net_price: 12,
                  day: 30,
                  title: "10 GB - 30 days",
                  data: "10 GB",
                  prices: { recommended_retail_price: { USD: 19 }, net_price: { USD: 11 } },
                },
                { id: "uz-topup", type: "topup", price: 5, net_price: 3, day: 7 },
                {
                  id: "uz-7d-1gb",
                  type: "sim",
                  price: 4.5,
                  net_price: 2,
                  day: 7,
                  title: "1 GB - 7 days",
                  data: "1 GB",
                },
              ],
            },
          ],
        },
      ],
    };
    const пакеты = разобратьПакеты(ответ);
    expect(пакеты.map((п) => п.id)).toEqual(["uz-7d-1gb", "uz-30d-10gb"]);
    expect(пакеты[1]).toMatchObject({ retailUsd: 19, netUsd: 11, operator: "Uzbek Mobile", day: 30 });
  });
  it("мусор — пусто", () => {
    expect(разобратьПакеты(null)).toEqual([]);
    expect(разобратьПакеты({ data: "x" })).toEqual([]);
  });
});
