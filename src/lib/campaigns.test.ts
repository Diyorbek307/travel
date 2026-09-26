import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  идётСегодня,
  ошибкаКампании,
  подходит,
  разобратьСсылку,
  сегодняВТашкенте,
  type Кампания,
} from "./campaign-rules";

/**
 * Кампании уведомлений: кому и когда показывать, как считаются прочтения
 * и кому уходит push. Хранилище — во временной папке, настоящие службы
 * push подменены.
 */

const база: Кампания = {
  id: "c1",
  title: "Скидка",
  body: "Текст",
  emoji: "🔔",
  link: "explore:hotels",
  audience: { kind: "all" },
  from: "2026-09-20",
  to: "2026-09-30",
  active: true,
  createdAt: "2026-09-20T00:00:00Z",
  updatedAt: "2026-09-20T00:00:00Z",
};

describe("правила кампаний", () => {
  it("идёт только в свой срок и только включённая", () => {
    expect(идётСегодня(база, "2026-09-25")).toBe(true);
    expect(идётСегодня(база, "2026-09-20")).toBe(true);
    expect(идётСегодня(база, "2026-09-30")).toBe(true);
    expect(идётСегодня(база, "2026-10-01")).toBe(false);
    expect(идётСегодня({ ...база, active: false }, "2026-09-25")).toBe(false);
  });

  it("сегодняшняя дата — по Ташкенту, а не по серверу", () => {
    // 20:30 по Гринвичу 30 сентября — в Ташкенте уже 1 октября.
    expect(сегодняВТашкенте(new Date("2026-09-30T20:30:00Z"))).toBe("2026-10-01");
  });

  it("аудитория: все, Premium, город", () => {
    const кто = { premium: false, city: "Бухара" };
    expect(подходит(база, кто)).toBe(true);
    expect(подходит({ ...база, audience: { kind: "premium" } }, кто)).toBe(false);
    expect(подходит({ ...база, audience: { kind: "premium" } }, { ...кто, premium: true })).toBe(true);
    expect(подходит({ ...база, audience: { kind: "city", city: "Бухара" } }, кто)).toBe(true);
    expect(подходит({ ...база, audience: { kind: "city", city: "Хива" } }, кто)).toBe(false);
    expect(подходит({ ...база, audience: { kind: "city", city: "Хива" } }, { ...кто, city: null })).toBe(
      false,
    );
  });

  it("ссылки разбираются, чужое отвергается", () => {
    expect(разобратьСсылку("explore:hotels")).toEqual({ kind: "explore", раздел: "hotels" });
    expect(разобратьСсылку("explore")).toEqual({ kind: "explore" });
    expect(разобратьСсылку("place:12-reg")).toEqual({ kind: "place", id: "12-reg" });
    expect(разобратьСсылку("map")).toEqual({ kind: "map" });
    expect(разобратьСсылку("hotel:")).toBeNull();
    expect(разобратьСсылку("javascript:alert(1)")).toBeNull();
  });

  it("проверка формы ловит пустое и перепутанный срок", () => {
    expect(ошибкаКампании(база)).toBeNull();
    expect(ошибкаКампании({ ...база, title: " " })).toMatch(/заголовок/i);
    expect(ошибкаКампании({ ...база, from: "2026-10-01" })).toMatch(/позже/);
    expect(ошибкаКампании({ ...база, audience: { kind: "city", city: "" } })).toMatch(/город/i);
    expect(ошибкаКампании({ ...база, link: "evil:x" })).toMatch(/ссылка/i);
  });
});

let папка: string;
let campaigns: typeof import("./campaigns");
let push: typeof import("./push");
let users: typeof import("./users");

beforeAll(async () => {
  папка = await mkdtemp(path.join(tmpdir(), "campaigns-test-"));
  // Хранилища читают путь при импорте — задаём его до загрузки модулей.
  process.env.DATA_DIR = папка;
  delete process.env.DATABASE_URL;
  campaigns = await import("./campaigns");
  push = await import("./push");
  users = await import("./users");
});

afterAll(async () => {
  push.подменитьОтправщик(null);
  await rm(папка, { recursive: true, force: true });
});

const сегодня = () => сегодняВТашкенте();

describe("хранение и прочтения", () => {
  it("создать, изменить, выключить, удалить", async () => {
    const к = await campaigns.createCampaign({ ...база, from: сегодня(), to: сегодня() });
    expect((await campaigns.listCampaigns()).map((x) => x.id)).toContain(к.id);

    await campaigns.updateCampaign(к.id, { title: "Новая" });
    expect((await campaigns.getCampaign(к.id))?.title).toBe("Новая");

    await campaigns.updateCampaign(к.id, { active: false });
    expect(await campaigns.campaignsFor({ premium: false, city: null })).toHaveLength(0);

    expect(await campaigns.deleteCampaign(к.id)).toBe(true);
    expect(await campaigns.getCampaign(к.id)).toBeNull();
  });

  it("прочтение считается по аккаунту один раз", async () => {
    const к = await campaigns.createCampaign({ ...база, from: сегодня(), to: сегодня() });
    await campaigns.markRead([к.id], "u1");
    await campaigns.markRead([к.id], "u1");
    await campaigns.markRead([к.id, "нет-такой"], "u2");
    const запись = (await campaigns.listCampaigns()).find((x) => x.id === к.id);
    expect(запись?.reads).toBe(2);
    await campaigns.deleteCampaign(к.id);
  });
});

describe("рассылка push", () => {
  it("уходит подходящим, мёртвые подписки удаляются", async () => {
    const а = await users.createUser({
      email: "a@test.uz",
      password: "Пароль123!",
      firstName: "А",
      lastName: "",
      photo: null,
      country: "",
      phone: "",
    });
    const б = await users.createUser({
      email: "b@test.uz",
      password: "Пароль123!",
      firstName: "Б",
      lastName: "",
      photo: null,
      country: "",
      phone: "",
    });
    if (а === "email_taken" || б === "email_taken") throw new Error("почта занята");
    const ключи = { p256dh: "p", auth: "a" };
    await push.subscribe(а.id, { endpoint: "https://push.test/a", keys: ключи }, "Бухара");
    await push.subscribe(б.id, { endpoint: "https://push.test/b", keys: ключи }, "Хива");
    await push.subscribe(б.id, { endpoint: "https://push.test/gone", keys: ключи }, "Бухара");
    // Повторная подписка того же адреса не множит записи.
    await push.subscribe(а.id, { endpoint: "https://push.test/a", keys: ключи }, "Бухара");
    expect(await push.countSubscriptions()).toBe(3);

    const ушло: string[] = [];
    push.подменитьОтправщик(async (sub) => {
      if (sub.endpoint.endsWith("/gone")) throw Object.assign(new Error("gone"), { statusCode: 410 });
      ушло.push(sub.endpoint);
    });

    const вБухару: Кампания = { ...база, audience: { kind: "city", city: "Бухара" } };
    expect(await push.sendCampaign(вБухару)).toBe(1);
    expect(ушло).toEqual(["https://push.test/a"]);
    // Подписка, на которую служба ответила 410, удалена.
    expect(await push.countSubscriptions()).toBe(2);

    ушло.length = 0;
    expect(await push.sendCampaign(база)).toBe(2);
    expect(ушло.sort()).toEqual(["https://push.test/a", "https://push.test/b"]);
  });
});
