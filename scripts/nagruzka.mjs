/**
 * Тысяча человек в приложении.
 *
 * Как запускать:
 *   1. поднять приложение: npm run build && npx next start -p 4400
 *   2. node scripts/nagruzka.mjs
 * Настройки: БАЗА (адрес), СКОЛЬКО (людей).
 *
 * Ходит только по сетевым адресам, лишних пакетов не требует. Боевой
 * сайт им проверять нельзя: он заведёт тысячу настоящих учётных записей.
 *
 * Проверяем не «отвечает ли сервер», а то, что каждый получает своё:
 * свой аккаунт, свою бронь, свой отзыв, свою переписку с поддержкой — и
 * никогда чужое. Имена нарочно в трёх письменностях: приложение для
 * иностранцев, и китайское имя должно доехать до базы целым.
 */

import { createHmac } from "node:crypto";

const БАЗА = process.env.БАЗА ?? "http://127.0.0.1:4400";
const СКОЛЬКО = Number(process.env.СКОЛЬКО ?? 1000);
/** Одновременных запросов. Столько же людей нажимает кнопку в одну секунду. */
const РАЗОМ = 25;

const ИМЕНА = [
  ["Диёрбек", "Мустафаев", "Узбекистан"],
  ["Гулнора", "Каримова", "Узбекистан"],
  ["Oybek", "Toʻxtayev", "Oʻzbekiston"],
  ["Shahnoza", "Gʻaniyeva", "Oʻzbekiston"],
  ["James", "Whitfield", "United Kingdom"],
  ["Marie", "Dubois", "France"],
  ["李", "伟", "中国"],
  ["김", "민준", "대한민국"],
  ["Ahmet", "Yılmaz", "Türkiye"],
  ["Олег", "Петров", "Россия"],
];

const ПАРОЛЬ = "Sayohat2026!";

function человек(i) {
  const [имя, фамилия, страна] = ИМЕНА[i % ИМЕНА.length];
  return {
    email: `gost${i}@proverka.uz`,
    password: ПАРОЛЬ,
    firstName: `${имя}${i}`,
    lastName: фамилия,
    country: страна,
  };
}

const времена = [];
let ошибок = 0;
const примерыОшибок = [];

async function запрос(путь, настройки = {}) {
  const начало = Date.now();
  const r = await fetch(`${БАЗА}${путь}`, настройки);
  const мс = Date.now() - начало;
  let тело = null;
  try {
    тело = await r.json();
  } catch {
    тело = null;
  }
  return { статус: r.status, тело, мс, куки: r.headers.get("set-cookie") };
}

function записать(метка, мс) {
  времена.push([метка, мс]);
}

function сводка(метка) {
  const свои = времена.filter(([м]) => м === метка).map(([, мс]) => мс).sort((a, b) => a - b);
  if (!свои.length) return null;
  const сумма = свои.reduce((s, x) => s + x, 0);
  return {
    метка,
    сколько: свои.length,
    среднее: Math.round(сумма / свои.length),
    середина: свои[Math.floor(свои.length / 2)],
    девяносто: свои[Math.floor(свои.length * 0.9)],
    худшее: свои[свои.length - 1],
  };
}

function сбой(что, подробности) {
  ошибок++;
  if (примерыОшибок.length < 8) примерыОшибок.push(`${что}: ${подробности}`);
}

/** Пропускает пачками, чтобы нагрузка была как у живой толпы. */
async function пачками(список, размер, дело) {
  const итог = [];
  for (let i = 0; i < список.length; i += размер) {
    итог.push(...(await Promise.all(список.slice(i, i + размер).map(дело))));
  }
  return итог;
}

console.log(`Проверка на ${СКОЛЬКО} человек, по ${РАЗОМ} одновременно.\n`);

// ── 1. Регистрация ───────────────────────────────────────────────────
const начало1 = Date.now();
const сессии = await пачками(
  Array.from({ length: СКОЛЬКО }, (_, i) => i),
  РАЗОМ,
  async (i) => {
    const ч = человек(i);
    const о = await запрос("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ч),
    });
    записать("регистрация", о.мс);
    if (о.статус !== 200 || !о.тело?.ok) {
      сбой("регистрация", `${ч.email} → ${о.статус} ${JSON.stringify(о.тело)?.slice(0, 80)}`);
      return null;
    }
    if (о.тело.user.firstName !== ч.firstName || о.тело.user.country !== ч.country) {
      сбой("имя испорчено", `${ч.firstName}/${ч.country} → ${о.тело.user.firstName}/${о.тело.user.country}`);
    }
    const куки = (о.куки ?? "").split(";")[0];
    return { i, ч, куки, id: о.тело.user.id };
  },
);
const сек1 = ((Date.now() - начало1) / 1000).toFixed(1);

// Как время регистрации растёт с числом уже заведённых людей. Список
// хранится одним документом и переписывается целиком, поэтому рост
// ожидаем — вопрос лишь, насколько он крут.
const порядок = времена.filter(([м]) => м === "регистрация").map(([, мс]) => мс);
const сотнями = [];
for (let i = 0; i + 100 <= порядок.length; i += 100) {
  const кусок = порядок.slice(i, i + 100);
  сотнями.push(`${i}–${i + 100}: ${Math.round(кусок.reduce((s, x) => s + x, 0) / кусок.length)} мс`);
}
const живые = сессии.filter(Boolean);
console.log(`1. Регистрация: ${живые.length} из ${СКОЛЬКО} за ${сек1} с`);
console.log(`   как растёт: ${сотнями.join(" · ")}`);

// ── 2. Все ли на месте ───────────────────────────────────────────────
const вход0 = await запрос("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "gost0@proverka.uz", password: ПАРОЛЬ }),
});
// Админский пропуск подписываем тем же секретом, что и приложение:
// вход в админку сделан серверным действием, а не отдельным адресом.
const срок = String(Date.now() + 3600_000);
const подпись = createHmac("sha256", process.env.ADMIN_SECRET ?? "uz-admin-dev-secret")
  .update(срок)
  .digest("hex");
const адмКуки = `uz_admin=${срок}.${подпись}`;
console.log(`2. Первый зарегистрированный входит: ${вход0.статус === 200 ? "да" : "НЕТ"}`);

// ── 3. Вход каждого ──────────────────────────────────────────────────
const начало3 = Date.now();
const входы = await пачками(живые, РАЗОМ, async (с) => {
  const о = await запрос("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: с.ч.email, password: ПАРОЛЬ }),
  });
  записать("вход", о.мс);
  if (о.статус !== 200) {
    сбой("вход", `${с.ч.email} → ${о.статус}`);
    return null;
  }
  if (о.тело?.user?.id !== с.id) сбой("вошёл не тот", `${с.ч.email}: ${о.тело?.user?.id} вместо ${с.id}`);
  return { ...с, куки: (о.куки ?? "").split(";")[0] };
});
console.log(
  `3. Вход: ${входы.filter(Boolean).length} из ${живые.length} за ${((Date.now() - начало3) / 1000).toFixed(1)} с`,
);

// ── 4. Неверный пароль не пускает ────────────────────────────────────
const плохой = await запрос("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "gost5@proverka.uz", password: "ne-tot-parol" }),
});
console.log(`4. Чужой пароль отвергнут: ${плохой.статус !== 200 ? "да" : "НЕТ"} (${плохой.статус})`);

// ── 5. Повторная почта не создаёт двойника ───────────────────────────
const двойник = await запрос("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(человек(7)),
});
console.log(
  `5. Повторная регистрация отклонена: ${двойник.статус !== 200 || !двойник.тело?.ok ? "да" : "НЕТ"}`,
);

// ── 6. Кто я ─────────────────────────────────────────────────────────
const рабочие = входы.filter(Boolean);
const проба = рабочие.slice(0, 200);
await пачками(проба, РАЗОМ, async (с) => {
  const о = await запрос("/api/auth/me", { headers: { Cookie: с.куки } });
  записать("кто я", о.мс);
  if (о.тело?.user?.email !== с.ч.email) сбой("кто я", `${с.ч.email} → ${о.тело?.user?.email}`);
});
console.log(`6. «Кто я» вернул своё для ${проба.length} человек`);

// ── 7. Брони ─────────────────────────────────────────────────────────
const бронисты = рабочие.slice(0, 300);
await пачками(бронисты, РАЗОМ, async (с) => {
  const о = await запрос("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: с.куки },
    body: JSON.stringify({
      kind: ["hotel", "restaurant", "tour"][с.i % 3],
      itemId: `obj-${с.i % 20}`,
      itemName: `Заявка ${с.i}`,
      date: "2026-10-01",
      guests: (с.i % 4) + 1,
    }),
  });
  записать("бронь", о.мс);
  if (о.статус !== 200) сбой("бронь", `${с.ч.email} → ${о.статус} ${JSON.stringify(о.тело)?.slice(0, 60)}`);
});
console.log(`7. Заявок на бронь отправлено: ${бронисты.length}`);

// ── 8. Отзывы ────────────────────────────────────────────────────────
const отзывисты = рабочие.slice(0, 300);
await пачками(отзывисты, РАЗОМ, async (с) => {
  const о = await запрос("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: с.куки },
    body: JSON.stringify({
      placeId: "1-reg",
      placeName: "Площадь Регистан",
      rating: (с.i % 5) + 1,
      text: `Отзыв номер ${с.i}. Всё понравилось.`,
    }),
  });
  записать("отзыв", о.мс);
  if (о.статус !== 200) сбой("отзыв", `${с.ч.email} → ${о.статус}`);
});
console.log(`8. Отзывов оставлено: ${отзывисты.length}`);

// ── 9. Поддержка ─────────────────────────────────────────────────────
const пишущие = рабочие.slice(0, 300);
await пачками(пишущие, РАЗОМ, async (с) => {
  const о = await запрос("/api/support", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: с.куки },
    body: JSON.stringify({ text: `Здравствуйте, это ${с.ч.firstName}. Вопрос номер ${с.i}.` }),
  });
  записать("поддержка", о.мс);
  if (о.статус !== 200) сбой("поддержка", `${с.ч.email} → ${о.статус}`);
});
console.log(`9. Обращений в поддержку: ${пишущие.length}`);

// ── 10. Никто не видит чужого ────────────────────────────────────────
let чужое = 0;
await пачками(рабочие.slice(0, 150), РАЗОМ, async (с) => {
  const б = await запрос("/api/bookings", { headers: { Cookie: с.куки } });
  const п = await запрос("/api/support", { headers: { Cookie: с.куки } });
  записать("свои данные", б.мс);
  const мои = Array.isArray(б.тело?.bookings) ? б.тело.bookings : [];
  if (мои.some((з) => з.itemName && з.itemName !== `Заявка ${с.i}`)) чужое++;
  const сообщения = п.тело?.thread?.messages ?? [];
  if (сообщения.some((м) => м.text?.includes("Вопрос номер") && !м.text.includes(`Вопрос номер ${с.i}`)))
    чужое++;
});
console.log(`10. Утечек чужих данных: ${чужое}`);

// ── 11. Админка ──────────────────────────────────────────────────────
const адм = { Cookie: адмКуки };
const люди = await запрос("/api/admin/users", { headers: адм });
записать("админ: люди", люди.мс);
const сводкаА = await запрос("/api/admin/stats", { headers: адм });
записать("админ: сводка", сводкаА.мс);
const чаты = await запрос("/api/admin/support", { headers: адм });
записать("админ: чаты", чаты.мс);

const всегоЛюдей = люди.тело?.users?.length ?? люди.тело?.length ?? null;
const s = сводкаА.тело;
console.log(`11. Админка:`);
console.log(`    людей в списке: ${всегоЛюдей}`);
if (s?.пользователи) {
  console.log(`    сводка: ${s.пользователи.всего} человек, ${s.брони.всего} заявок, ${s.отзывы.всего} отзывов, ${s.поддержка.веток} обращений`);
  console.log(`    стран в разбивке: ${s.страны?.length ?? 0}`);
}
const веток = чаты.тело?.threads?.length ?? чаты.тело?.length ?? null;
console.log(`    веток переписки: ${веток}`);

// ── 12. Имена не испортились ─────────────────────────────────────────
const списокЛюдей = люди.тело?.users ?? люди.тело ?? [];
const китаец = списокЛюдей.find((ч) => ч.email === "gost6@proverka.uz");
const узбек = списокЛюдей.find((ч) => ч.email === "gost2@proverka.uz");
console.log(`12. Имена в базе:`);
console.log(`    китайское: ${китаец ? `${китаец.firstName} ${китаец.lastName} (${китаец.country})` : "не найден"}`);
console.log(`    узбекская латиница: ${узбек ? `${узбек.firstName} ${узбек.lastName} (${узбек.country})` : "не найден"}`);
if (китаец && !китаец.firstName.startsWith("李")) сбой("имя", "китайское имя испортилось");
if (узбек && !узбек.lastName.includes("ʻ")) сбой("имя", "узбекская латиница испортилась");

// ── Итог ─────────────────────────────────────────────────────────────
console.log("\nСкорость, миллисекунды:");
console.log("  что            сколько  среднее  середина  90%   худшее");
for (const м of ["регистрация", "вход", "кто я", "бронь", "отзыв", "поддержка", "свои данные", "админ: люди", "админ: сводка", "админ: чаты"]) {
  const с = сводка(м);
  if (!с) continue;
  console.log(
    `  ${с.метка.padEnd(14)} ${String(с.сколько).padStart(6)} ${String(с.среднее).padStart(8)} ${String(с.середина).padStart(9)} ${String(с.девяносто).padStart(5)} ${String(с.худшее).padStart(8)}`,
  );
}

console.log(`\nОшибок: ${ошибок}`);
for (const о of примерыОшибок) console.log(`  ${о}`);
process.exit(ошибок > 0 ? 1 : 0);
