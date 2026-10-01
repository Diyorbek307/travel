/**
 * Проверка API на живом сервере: права, отказы, лимиты, путь пользователя.
 *
 * Модульные тесты (npm test) проверяют функции по отдельности. Здесь —
 * то, что видит злоумышленник или клиент снаружи: закрытые маршруты не
 * пускают без входа, кривые данные отклоняются, лимиты держат, подписи
 * платёжных систем проверяются, заголовки на месте.
 *
 *   npm run test:api                         — против http://localhost:3000
 *   BASE=http://localhost:3005 npm run test:api
 *   BASE=https://uzbekistan-travel.onrender.com npm run test:api
 *
 * Против чужого адреса (не localhost) идут только проверки, ничего не
 * меняющие: без регистрации тестового аккаунта и без упора в лимиты —
 * на боевом стенде не заводим мусор и не запираем себе вход.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const ЛОКАЛЬНО = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE);
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

let пройдено = 0;
const провалы = [];

/** Каждой группе — свой «адрес» клиента: лимиты одной не мешают другой. */
let счётчикАдресов = 1;
const новыйАдрес = () => `198.51.100.${счётчикАдресов++ % 250}`;

async function запрос(метод, путь, { тело, заголовки = {}, кука, сырое } = {}) {
  // У GET и HEAD тела не бывает — fetch его не примет.
  if (метод === "GET" || метод === "HEAD") {
    тело = undefined;
    сырое = undefined;
  }
  // Свой «адрес» клиента — только локально. Cloudflare перед боевым
  // стендом отвечает 403 на запрос, где клиент сам прислал cf-connecting-ip:
  // этот заголовок ставит только он (заодно видно, что подделать его нельзя).
  const h = ЛОКАЛЬНО ? { "cf-connecting-ip": заголовки["cf-connecting-ip"] ?? новыйАдрес(), ...заголовки } : { ...заголовки };
  if (!ЛОКАЛЬНО) delete h["cf-connecting-ip"];
  if (тело !== undefined && !сырое) h["content-type"] = "application/json";
  if (кука) h.cookie = кука;
  const r = await fetch(BASE + путь, {
    method: метод,
    headers: h,
    body: сырое ?? (тело === undefined ? undefined : JSON.stringify(тело)),
    redirect: "manual",
  });
  const текст = await r.text();
  let json = null;
  try {
    json = JSON.parse(текст);
  } catch {
    // не JSON — страница или файл
  }
  return { статус: r.status, json, текст, заголовки: r.headers };
}

function проверить(название, условие, подробно = "") {
  if (условие) пройдено++;
  else провалы.push(`${название}${подробно ? ` — ${подробно}` : ""}`);
}

const группа = (имя) => console.log(`\n▸ ${имя}`);
const итогГруппы = (до) => {
  const новых = провалы.length - до;
  console.log(новых ? `  ✗ провалов: ${новых}` : "  ✓");
};

// ─── Публичное ───────────────────────────────────────────────────────

async function публичное() {
  группа("Публичные страницы и API отвечают");
  const до = провалы.length;
  for (const путь of [
    "/",
    "/admin",
    "/reset",
    "/sitemap.xml",
    "/robots.txt",
    "/manifest.webmanifest",
    "/sw.js",
    "/api/health",
    "/api/content",
    "/api/weather",
    "/api/translations",
    "/api/site-config",
    "/api/ad-policy",
    "/api/campaigns",
    "/api/esim",
    "/api/pay",
    "/api/translate-photo",
  ]) {
    const r = await запрос("GET", путь);
    проверить(`GET ${путь} → 200`, r.статус === 200, `пришло ${r.статус}`);
  }
  const me = await запрос("GET", "/api/auth/me");
  проверить("гость: /api/auth/me → user: null", me.json?.user === null);

  const контент = (await запрос("GET", "/api/content")).json;
  const место = контент?.places?.[0]?.id;
  if (место) {
    const seo = await запрос("GET", `/place/${encodeURIComponent(место)}`);
    проверить("SEO-страница места → 200", seo.статус === 200, `пришло ${seo.статус}`);
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(seo.текст)?.[1] ?? "";
    проверить("ld+json без «<» внутри (XSS)", ld.length > 0 && !ld.includes("<"));
  }
  for (const путь of ["/api/media/net-takogo", "/api/photo/net-takogo", "/api/ad-media/net-takogo", "/api/esim/es000000000000000000000000", "/api/esim/../../etc"]) {
    const r = await запрос("GET", путь);
    проверить(`GET ${путь} → 404`, r.статус === 404, `пришло ${r.статус}`);
  }
  итогГруппы(до);
}

// ─── Закрытое без входа ──────────────────────────────────────────────

const АДМИНКА = [
  ["POST", "/api/ad-media"],
  ["PUT", "/api/ad-policy"],
  ["GET", "/api/admin/bookings"],
  ["POST", "/api/admin/bookings"],
  ["GET", "/api/admin/campaigns"],
  ["POST", "/api/admin/campaigns"],
  ["PUT", "/api/admin/campaigns"],
  ["DELETE", "/api/admin/campaigns"],
  ["GET", "/api/admin/esim"],
  ["POST", "/api/admin/esim"],
  ["GET", "/api/admin/mail"],
  ["POST", "/api/admin/mail"],
  ["POST", "/api/admin/media"],
  ["GET", "/api/admin/partners"],
  ["PATCH", "/api/admin/partners"],
  ["PUT", "/api/admin/partners"],
  ["DELETE", "/api/admin/partners"],
  ["POST", "/api/admin/partners"],
  ["GET", "/api/admin/resets"],
  ["GET", "/api/admin/reviews"],
  ["POST", "/api/admin/reviews"],
  ["GET", "/api/admin/staff"],
  ["POST", "/api/admin/staff"],
  ["DELETE", "/api/admin/staff"],
  ["GET", "/api/admin/stats"],
  ["GET", "/api/admin/support"],
  ["POST", "/api/admin/support"],
  ["GET", "/api/admin/translations"],
  ["POST", "/api/admin/translations"],
  ["PATCH", "/api/admin/translations"],
  ["GET", "/api/admin/users"],
  ["POST", "/api/admin/users"],
  ["DELETE", "/api/admin/users"],
  ["GET", "/api/admin/whoami"],
  ["PUT", "/api/content"],
  ["PUT", "/api/site-config"],
  ["GET", "/api/sos"],
  ["PATCH", "/api/sos"],
];

const ТУРИСТ = [
  ["GET", "/api/bookings"],
  ["POST", "/api/bookings"],
  ["POST", "/api/campaigns/read"],
  ["POST", "/api/push"],
  ["DELETE", "/api/push"],
  ["GET", "/api/support"],
  ["POST", "/api/support"],
  ["POST", "/api/reviews"],
  ["PATCH", "/api/auth/me"],
  ["DELETE", "/api/auth/me"],
];

const ЗАВЕДЕНИЕ = [
  ["GET", "/api/venue"],
  ["PATCH", "/api/venue"],
  ["POST", "/api/venue/bookings/b1"],
  ["POST", "/api/venue/reviews/r1"],
];

async function закрытое() {
  группа(`Админка без входа: ${АДМИНКА.length} маршрутов → 401/403`);
  let до = провалы.length;
  for (const [метод, путь] of АДМИНКА) {
    const r = await запрос(метод, путь, { тело: {} });
    проверить(`${метод} ${путь} без входа`, r.статус === 401 || r.статус === 403, `пришло ${r.статус}`);
  }
  итогГруппы(до);

  группа(`Кабинет туриста без входа: ${ТУРИСТ.length} маршрутов → 401`);
  до = провалы.length;
  for (const [метод, путь] of ТУРИСТ) {
    const r = await запрос(метод, путь, { тело: {} });
    проверить(`${метод} ${путь} без входа`, r.статус === 401, `пришло ${r.статус}`);
  }
  итогГруппы(до);

  группа(`Кабинет заведения без входа: ${ЗАВЕДЕНИЕ.length} маршрута → 401/403`);
  до = провалы.length;
  for (const [метод, путь] of ЗАВЕДЕНИЕ) {
    const r = await запрос(метод, путь, { тело: { status: "confirmed", text: "x" } });
    проверить(`${метод} ${путь} без входа`, r.статус === 401 || r.статус === 403, `пришло ${r.статус}`);
  }
  итогГруппы(до);

  группа("API касс заведений: без ключа и с чужим ключом → 401");
  до = провалы.length;
  for (const ключ of [null, "hz_" + "x".repeat(32), "garbage-key"]) {
    const заголовки = ключ ? { authorization: `Bearer ${ключ}` } : {};
    for (const [метод, путь] of [
      ["GET", "/api/partner/v1/reservations"],
      ["POST", "/api/partner/v1/availability"],
      ["POST", "/api/partner/v1/reservations/r1"],
    ]) {
      const r = await запрос(метод, путь, { тело: {}, заголовки });
      проверить(`${метод} ${путь} ключ=${ключ ? "чужой" : "нет"}`, r.статус === 401, `пришло ${r.статус}`);
    }
  }
  итогГруппы(до);

  группа("Поддельная кука сессии не проходит");
  до = провалы.length;
  for (const кука of ["uz_session=u-1.9999999999999.0000", "uz_session=garbage", "uz_admin=root.owner.9999999999999.abcd"]) {
    const me = await запрос("GET", "/api/auth/me", { кука });
    проверить(`${кука.split("=")[0]} подделка → не вход`, me.json?.user === null || me.статус === 401);
    const adm = await запрос("GET", "/api/admin/whoami", { кука });
    проверить(`${кука.split("=")[0]} подделка → не админ`, adm.статус === 401);
  }
  итогГруппы(до);
}

// ─── Платёжные системы ───────────────────────────────────────────────

async function платежи() {
  группа("Payme и Click: без подписи — отказ");
  const до = провалы.length;
  const битый = await запрос("POST", "/api/payme", { сырое: "{не json", заголовки: { "content-type": "application/json" } });
  проверить("Payme: битый JSON → -32700", битый.json?.error?.code === -32700, JSON.stringify(битый.json));
  const безКлюча = await запрос("POST", "/api/payme", { тело: { id: 1, method: "CheckPerformTransaction", params: {} } });
  проверить("Payme: без ключа → -32504", безКлюча.json?.error?.code === -32504, JSON.stringify(безКлюча.json));
  const чужойКлюч = await запрос("POST", "/api/payme", {
    тело: { id: 1, method: "CheckPerformTransaction", params: {} },
    заголовки: { authorization: "Basic " + Buffer.from("Paycom:подделка").toString("base64") },
  });
  проверить("Payme: чужой ключ → -32504", чужойКлюч.json?.error?.code === -32504, JSON.stringify(чужойКлюч.json));

  const форма = new URLSearchParams({
    click_trans_id: "1",
    service_id: "1",
    merchant_trans_id: "es000000000000000000000000",
    amount: "1000",
    action: "0",
    sign_time: "2026-01-01 00:00:00",
    sign_string: "0".repeat(32),
  });
  for (const путь of ["/api/click/prepare", "/api/click/complete"]) {
    const r = await запрос("POST", путь, {
      сырое: форма.toString(),
      заголовки: { "content-type": "application/x-www-form-urlencoded" },
    });
    const код = Number(r.json?.error);
    проверить(`Click ${путь}: поддельная подпись → ошибка`, код < 0, JSON.stringify(r.json));
  }
  итогГруппы(до);
}

// ─── Проверка входных данных ─────────────────────────────────────────

async function данные() {
  группа("Кривые данные отклоняются");
  const до = провалы.length;
  const случаи = [
    ["POST", "/api/auth/login", "кривой JSON", { сырое: "x" }, 400],
    ["POST", "/api/auth/login", "неверный пароль", { тело: { email: "net@takogo.uz", password: "неверный1" } }, 401],
    ["POST", "/api/auth/register", "кривая почта", { тело: { email: "не-почта", password: "Пароль123!", firstName: "А", lastName: "Б" } }, 400],
    ["POST", "/api/auth/register", "короткий пароль", { тело: { email: `x${Date.now()}@test.uz`, password: "123", firstName: "А", lastName: "Б" } }, 400],
    ["POST", "/api/auth/reset", "мёртвый токен", { тело: { token: "0".repeat(48), password: "НовыйПароль1!" } }, 400],
    ["GET", "/api/reviews", "отзывы без места", {}, 400],
    ["POST", "/api/route", "маршрут без точек", { тело: {} }, 400],
    ["POST", "/api/taxi", "такси без точек", { тело: {} }, 400],
    ["POST", "/api/sos", "SOS без координат", { тело: {} }, 400],
  ];
  for (const [метод, путь, что, опции, ждём] of случаи) {
    const r = await запрос(метод, путь, { ...опции, заголовки: опции.сырое ? { "content-type": "application/json" } : {} });
    проверить(`${что}: ${метод} ${путь} → ${ждём}`, r.статус === ждём, `пришло ${r.статус}`);
  }
  // Сумма Premium приходит не из браузера — тарифа «constructor» нет.
  const план = await запрос("POST", "/api/pay", { тело: { plan: "constructor", amount: 1000 } });
  проверить(
    "оплата: выдуманный тариф не даёт ссылку",
    !план.json?.url,
    JSON.stringify(план.json),
  );
  итогГруппы(до);
}

// ─── Заголовки и потолок размера ─────────────────────────────────────

async function заголовки() {
  группа("Заголовки безопасности и потолок размера тела");
  const до = провалы.length;
  const r = await запрос("GET", "/");
  const h = r.заголовки;
  проверить("CSP: frame-ancestors, object-src, base-uri", /frame-ancestors/.test(h.get("content-security-policy") ?? "") && /object-src 'none'/.test(h.get("content-security-policy") ?? "") && /base-uri 'self'/.test(h.get("content-security-policy") ?? ""));
  проверить("X-Content-Type-Options: nosniff", h.get("x-content-type-options") === "nosniff");
  проверить("X-Frame-Options", Boolean(h.get("x-frame-options")));
  проверить("Strict-Transport-Security", /max-age=/.test(h.get("strict-transport-security") ?? ""));
  проверить("нет X-Powered-By", !h.get("x-powered-by"));
  const админка = await запрос("GET", "/admin");
  проверить("админка: X-Robots-Tag noindex", /noindex/.test(админка.заголовки.get("x-robots-tag") ?? ""));

  const большое = "a".repeat(2 * 1024 * 1024);
  const r413 = await запрос("POST", "/api/auth/login", { сырое: большое, заголовки: { "content-type": "application/json" } });
  проверить("2 МБ на обычный маршрут → 413", r413.статус === 413, `пришло ${r413.статус}`);
  const контент = await запрос("PUT", "/api/content", { сырое: "a".repeat(3 * 1024 * 1024), заголовки: { "content-type": "application/json" } });
  проверить("3 МБ на /api/content проходят потолок (дальше — 401)", контент.статус === 401, `пришло ${контент.статус}`);
  итогГруппы(до);
}

// ─── Лимиты (только локально) ────────────────────────────────────────

async function лимиты() {
  группа("Лимиты: перебор пароля упирается в стену, подмена X-Forwarded-For не помогает");
  const до = провалы.length;
  const адрес = новыйАдрес();
  const статусы = [];
  for (let i = 0; i < 11; i++) {
    const r = await запрос("POST", "/api/auth/login", {
      сырое: "x",
      // каждый раз «новый» X-Forwarded-For — раньше этим обходили лимит
      заголовки: { "content-type": "application/json", "cf-connecting-ip": адрес, "x-forwarded-for": `10.0.0.${i}` },
    });
    статусы.push(r.статус);
  }
  проверить("11-я попытка входа → 429", статусы[10] === 429, статусы.join(" "));
  проверить("первые 10 не заперты", статусы.slice(0, 10).every((с) => с !== 429), статусы.join(" "));
  итогГруппы(до);
}

// ─── Путь пользователя (только локально) ────────────────────────────

const кукаИз = (r) => (r.заголовки.get("set-cookie") ?? "").split(";")[0];

async function путьПользователя() {
  группа("Путь туриста: регистрация → профиль → сброс пароля → отзыв старой сессии → удаление");
  const до = провалы.length;
  const адрес = новыйАдрес();
  const почта = `api-check-${Date.now()}@test.uz`;
  const пароль = `Проверка-${Date.now()}!`;
  const з = { "cf-connecting-ip": адрес };

  const рег = await запрос("POST", "/api/auth/register", {
    тело: { email: почта, password: пароль, firstName: "Тест", lastName: "Проверка", country: "UZ" },
    заголовки: з,
  });
  if (рег.json?.needsVerification) {
    console.log("  · почта настроена — шаги после регистрации пропущены (нужен код из письма)");
    итогГруппы(до);
    return;
  }
  проверить("регистрация → 200", рег.статус === 200, `пришло ${рег.статус} ${JSON.stringify(рег.json)}`);
  const кука = кукаИз(рег);
  проверить("регистрация выдала куку сессии", кука.startsWith("uz_session="));
  проверить("кука httpOnly", /httponly/i.test(рег.заголовки.get("set-cookie") ?? ""));

  const повтор = await запрос("POST", "/api/auth/register", {
    тело: { email: почта, password: пароль, firstName: "Тест", lastName: "Проверка" },
    заголовки: з,
  });
  проверить("повторная регистрация той же почты → 409", повтор.статус === 409, `пришло ${повтор.статус}`);

  const me = await запрос("GET", "/api/auth/me", { кука, заголовки: з });
  проверить("с кукой /api/auth/me видит пользователя", me.json?.user?.email === почта);
  проверить("в ответе нет хеша пароля", !JSON.stringify(me.json).includes("passwordHash"));

  const правка = await запрос("PATCH", "/api/auth/me", { кука, тело: { firstName: "x".repeat(500) }, заголовки: з });
  проверить("длинное имя обрезается до 60", правка.json?.user?.firstName?.length === 60, `длина ${правка.json?.user?.firstName?.length}`);
  const svg = await запрос("PATCH", "/api/auth/me", {
    кука,
    тело: { photo: "data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PjwvU2NyaXB0Pjwvc3ZnPg==" },
    заголовки: з,
  });
  проверить("SVG вместо фото профиля отклоняется", svg.статус === 400, `пришло ${svg.статус}`);

  const брони = await запрос("GET", "/api/bookings", { кука, заголовки: з });
  проверить("свои брони → 200", брони.статус === 200, `пришло ${брони.статус}`);

  const чужаяАдминка = await запрос("GET", "/api/admin/stats", { кука, заголовки: з });
  проверить("турист не видит статистику админки", чужаяАдминка.статус === 401, `пришло ${чужаяАдминка.статус}`);

  const вход = await запрос("POST", "/api/auth/login", { тело: { email: почта, password: пароль }, заголовки: з });
  проверить("вход с верным паролем → 200", вход.статус === 200, `пришло ${вход.статус}`);

  // Сброс пароля: токен берём из локального хранилища — письма локально не ходят.
  await запрос("POST", "/api/auth/forgot", { тело: { email: почта }, заголовки: з });
  let токен = null;
  try {
    const сбросы = JSON.parse(await readFile(path.join(DATA_DIR, "resets.json"), "utf8"));
    токен = сбросы.find((с) => с.email === почта)?.token ?? null;
  } catch {
    // хранилище в базе, а не в файлах — шаг пропустим
  }
  if (токен) {
    await new Promise((r) => setTimeout(r, 20));
    const сброс = await запрос("POST", "/api/auth/reset", { тело: { token: токен, password: пароль + "2" }, заголовки: з });
    проверить("сброс пароля по токену → 200", сброс.статус === 200, `пришло ${сброс.статус}`);
    const второй = await запрос("POST", "/api/auth/reset", { тело: { token: токен, password: пароль + "3" }, заголовки: з });
    проверить("тот же токен второй раз не работает", второй.статус === 400, `пришло ${второй.статус}`);
    const старая = await запрос("GET", "/api/auth/me", { кука, заголовки: з });
    проверить("старая сессия после смены пароля мертва", старая.json?.user === null, JSON.stringify(старая.json));
    const старыйПароль = await запрос("POST", "/api/auth/login", { тело: { email: почта, password: пароль }, заголовки: з });
    проверить("старый пароль больше не подходит", старыйПароль.статус === 401, `пришло ${старыйПароль.статус}`);
  } else {
    console.log("  · токен сброса не найден в data/resets.json — шаг сброса пропущен");
  }

  const новыйВход = await запрос("POST", "/api/auth/login", {
    тело: { email: почта, password: токен ? пароль + "2" : пароль },
    заголовки: з,
  });
  проверить("вход с новым паролем → 200", новыйВход.статус === 200, `пришло ${новыйВход.статус}`);
  const свежая = кукаИз(новыйВход);

  const удаление = await запрос("DELETE", "/api/auth/me", { кука: свежая, заголовки: з });
  проверить("удаление своего аккаунта → 200", удаление.статус === 200, `пришло ${удаление.статус}`);
  const после = await запрос("GET", "/api/auth/me", { кука: свежая, заголовки: з });
  проверить("после удаления сессия не работает", после.json?.user === null);
  итогГруппы(до);
}

// ─── Запуск ──────────────────────────────────────────────────────────

const начало = Date.now();
console.log(`Проверка API: ${BASE}${ЛОКАЛЬНО ? "" : "  (только проверки без изменений)"}`);
try {
  await публичное();
  await закрытое();
  await платежи();
  await данные();
  await заголовки();
  if (ЛОКАЛЬНО) {
    await лимиты();
    await путьПользователя();
  }
} catch (e) {
  провалы.push(`скрипт упал: ${e instanceof Error ? e.message : e}`);
}

const секунд = ((Date.now() - начало) / 1000).toFixed(1);
console.log(`\nИтого: ${пройдено} проверок прошло, ${провалы.length} провалено (${секунд} с)`);
if (провалы.length) {
  console.log("\nПровалы:");
  for (const п of провалы) console.log(`  ✗ ${п}`);
  process.exit(1);
}
