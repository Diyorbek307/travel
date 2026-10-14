import { describe, expect, it } from "vitest";
import {
  безопасныйПуть,
  новоеСостояние,
  погаситьБилет,
  проверитьТокен,
  распаковать,
  упаковать,
  выдатьБилет,
} from "./oauth";

const через = (сек: number) => Math.floor(Date.now() / 1000) + сек;

describe("вход через Google и Apple", () => {
  it("принимает честный токен Google", () => {
    const л = проверитьТокен(
      {
        iss: "https://accounts.google.com",
        aud: "cid",
        exp: через(300),
        nonce: "n1",
        sub: "123",
        email: "A@Gmail.com",
        email_verified: true,
      },
      { провайдер: "google", clientId: "cid", nonce: "n1" },
    );
    expect(л).toEqual({ провайдер: "google", sub: "123", email: "a@gmail.com", почтаПодтверждена: true });
  });

  it("отклоняет чужого получателя, издателя, просроченный токен и чужой nonce", () => {
    const база = { iss: "https://appleid.apple.com", aud: "svc", exp: через(300), nonce: "n", sub: "s" };
    const ждём = { провайдер: "apple" as const, clientId: "svc", nonce: "n" };
    expect(проверитьТокен({ ...база, aud: "other" }, ждём)).toBeNull();
    expect(проверитьТокен({ ...база, iss: "https://accounts.google.com" }, ждём)).toBeNull();
    expect(проверитьТокен({ ...база, exp: через(-10) }, ждём)).toBeNull();
    expect(проверитьТокен({ ...база, nonce: "x" }, ждём)).toBeNull();
    expect(проверитьТокен(база, ждём)).not.toBeNull();
  });

  it("Apple присылает email_verified строкой", () => {
    const л = проверитьТокен(
      {
        iss: "https://appleid.apple.com",
        aud: "svc",
        exp: через(60),
        nonce: "n",
        sub: "s",
        email: "x@privaterelay.appleid.com",
        email_verified: "true",
      },
      { провайдер: "apple", clientId: "svc", nonce: "n" },
    );
    expect(л?.почтаПодтверждена).toBe(true);
  });

  it("состояние подписано: подделку не принимаем", () => {
    const с = новоеСостояние("google", "/cabinet", true);
    expect(распаковать(упаковать(с))).toEqual(с);
    const [данные, sig] = упаковать(с).split(".");
    const чужие = Buffer.from(JSON.stringify({ ...с, дальше: "/x" })).toString("base64url");
    expect(распаковать(`${чужие}.${sig}`)).toBeNull();
    expect(распаковать(`${данные}.bad`)).toBeNull();
  });

  it("возврат только на свой сайт", () => {
    expect(безопасныйПуть("/cabinet")).toBe("/cabinet");
    expect(безопасныйПуть("//evil.com")).toBe("/");
    expect(безопасныйПуть("https://evil.com")).toBe("/");
    expect(безопасныйПуть("/" + String.fromCharCode(92) + "evil.com")).toBe("/");
  });

  it("билет приложения одноразовый", () => {
    const б = выдатьБилет("u-1");
    expect(погаситьБилет(б)).toBe("u-1");
    expect(погаситьБилет(б)).toBeNull();
    expect(погаситьБилет(б.replace(/^u-1/, "u-2"))).toBeNull();
  });
});
