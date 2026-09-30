import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ipИзЗаголовков } from "./rate-limit";

/**
 * Защиты, найденные при аудите: их легко сломать незаметно, поэтому
 * держим тестом.
 */

describe("адрес клиента для лимитов", () => {
  it("верит адресу от Cloudflare, а не присланному клиентом", () => {
    const h = new Headers({ "x-forwarded-for": "6.6.6.6", "cf-connecting-ip": "5.5.5.5" });
    expect(ipИзЗаголовков(h)).toBe("5.5.5.5");
  });

  it("без Cloudflare — адрес Render", () => {
    const h = new Headers({ "x-forwarded-for": "6.6.6.6", "true-client-ip": "4.4.4.4" });
    expect(ipИзЗаголовков(h)).toBe("4.4.4.4");
  });

  it("совсем без заголовков — общий ключ, а не ошибка", () => {
    expect(ipИзЗаголовков(new Headers())).toBe("unknown");
  });
});

let папка: string;
let users: typeof import("./users");

beforeAll(async () => {
  папка = await mkdtemp(path.join(tmpdir(), "hz-security-"));
  process.env.DATA_DIR = папка;
  users = await import("./users");
});

afterAll(async () => {
  await rm(папка, { recursive: true, force: true });
});

const пауза = (мс: number) => new Promise((r) => setTimeout(r, мс));

describe("отзыв сессий сменой пароля", () => {
  it("старая сессия после сброса пароля не работает, новая — работает", async () => {
    const создан = await users.createUser({
      email: "sec@test.uz",
      password: "Пароль123!",
      firstName: "Тест",
      lastName: "",
      photo: null,
      country: "",
      phone: "",
    });
    if (создан === "email_taken") throw new Error("почта уже занята");
    const u = создан;
    const старая = users.makeSession(u.id);
    expect((await users.userBySession(старая))?.id).toBe(u.id);

    await пауза(5);
    const заявка = await users.createReset(u);
    expect(await users.applyReset(заявка.token, "НовыйПароль1!")).toBe(true);

    // Подпись у старой куки по-прежнему честная — но она выдана до смены.
    expect(users.readSession(старая)).toBe(u.id);
    expect(await users.userBySession(старая)).toBeNull();

    await пауза(5);
    const новая = users.makeSession(u.id);
    expect((await users.userBySession(новая))?.id).toBe(u.id);
  });
});
