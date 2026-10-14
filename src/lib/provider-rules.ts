/**
 * Водители и гиды — правила без сервера: типы, проверка полей, кто виден
 * в каталоге. Модуль читают и сервер, и клиент (кабинет показывает те же
 * ошибки, что вернул бы сервер), поэтому здесь нет ни Node, ни базы.
 *
 * Как устроено:
 *  - Водитель или гид — это анкета, привязанная к обычному аккаунту
 *    HelloUZ (почта, Google или Apple). Отдельных паролей у партнёров нет.
 *  - Анкету можно подать самому из приложения («Стать партнёром») или её
 *    заводит менеджер в панели. В обоих случаях в каталог она попадает
 *    только после проверки: менеджер смотрит документы и ставит «Проверен».
 *  - В каталоге видны только проверенные анкеты с оплаченной подпиской.
 *    После одобрения даётся бесплатный пробный период (настраивается).
 *  - «Рекомендуем» — платное продвижение: карточка идёт первой и с меткой.
 */

export type ВидПартнёра = "driver" | "guide";
export type СтатусПартнёра = "pending" | "active" | "rejected" | "suspended";
export type КлассМашины = "economy" | "comfort" | "business" | "minivan" | "bus";

export const КЛАССЫ_МАШИН: КлассМашины[] = ["economy", "comfort", "business", "minivan", "bus"];

/** Языки, на которых говорят партнёры: коды как у интерфейса, плюс таджикский. */
export const ЯЗЫКИ_ПАРТНЁРОВ = [
  "uz",
  "ru",
  "en",
  "tr",
  "de",
  "fr",
  "zh",
  "ko",
  "ja",
  "ar",
  "es",
  "it",
  "tg",
] as const;

export interface Машина {
  make: string;
  model: string;
  year: number;
  color: string;
  seats: number;
  class: КлассМашины;
  ac: boolean;
  /** Госномер — видят только менеджер и сам водитель. */
  plate?: string;
}

/** Анкета партнёра так, как её видит турист. */
export interface ПартнёрПубличный {
  id: string;
  kind: ВидПартнёра;
  name: string;
  photo: string;
  city: string;
  /** Где ещё работает: города и регионы. */
  cities: string[];
  languages: string[];
  bio: string;
  experienceYears: number;
  /** Цена за день, доллары. */
  priceDay: number;
  /** Цена за час — по желанию. */
  priceHour?: number;
  /** Сколько часов входит в день. */
  hoursPerDay: number;
  /** Что входит в цену: топливо, ожидание, вода… */
  includes: string[];
  photos: string[];
  car?: Omit<Машина, "plate">;
  /** Гид: темы, о которых рассказывает. */
  specialties?: string[];
  /** Гид: есть лицензия гида. */
  licensed?: boolean;
  verified: boolean;
  /** Сейчас идёт оплаченное продвижение «Рекомендуем». */
  promoted: boolean;
  /** Связь — показываем в карточке: турист пишет напрямую. */
  phone: string;
  telegram?: string;
  whatsapp?: string;
}

/** Полная анкета — у сервера, менеджера и самого партнёра. */
export interface Партнёр extends Omit<ПартнёрПубличный, "promoted" | "car"> {
  userId: string | null;
  status: СтатусПартнёра;
  car?: Машина;
  /** До какого момента оплачено размещение (ISO). */
  paidUntil: string | null;
  /** До какого момента идёт продвижение «Рекомендуем» (ISO). */
  promotedUntil: string | null;
  /** Порядок среди рекомендованных: больше — выше. */
  promoPriority: number;
  /** Причина отказа или приостановки — партнёр видит её в кабинете. */
  statusNote?: string;
  /** Заметка менеджера — партнёр её не видит. */
  adminNote?: string;
  views: number;
  requests: number;
  createdAt: string;
  updatedAt: string;
}

export interface ДеньТура {
  title: string;
  text: string;
}

export interface ТурПартнёра {
  id: string;
  providerId: string;
  title: string;
  city: string;
  days: number;
  /** Цена на человека, доллары. */
  pricePerPerson: number;
  /** Цена за всю группу — по желанию (индивидуальный тур). */
  priceGroup?: number;
  maxGroup: number;
  languages: string[];
  summary: string;
  program: ДеньТура[];
  includes: string[];
  excludes: string[];
  photos: string[];
  meetingPoint: string;
  status: "active" | "hidden";
  createdAt: string;
  updatedAt: string;
}

/** Тарифы — в суммах. Меняет владелец в панели. */
export interface Тарифы {
  /** Месяц размещения водителя. */
  driverMonth: number;
  /** Месяц размещения гида. */
  guideMonth: number;
  /** Неделя «Рекомендуем». */
  promoWeek: number;
  /** Месяц «Рекомендуем». */
  promoMonth: number;
  /** Бесплатных дней после одобрения анкеты. */
  trialDays: number;
}

export const ТАРИФЫ_ПО_УМОЛЧАНИЮ: Тарифы = {
  driverMonth: 150_000,
  guideMonth: 150_000,
  promoWeek: 100_000,
  promoMonth: 300_000,
  trialDays: 30,
};

/** Что можно купить в кабинете. */
export type Покупка = "month1" | "month3" | "month6" | "promoWeek" | "promoMonth";
export const ПОКУПКИ: Покупка[] = ["month1", "month3", "month6", "promoWeek", "promoMonth"];

/** Сколько стоит и на сколько дней продлевает. Скидка за 3 и 6 месяцев. */
export function ценаПокупки(
  п: Покупка,
  вид: ВидПартнёра,
  т: Тарифы,
): { сумма: number; дней: number; продвижение: boolean } {
  const месяц = вид === "driver" ? т.driverMonth : т.guideMonth;
  switch (п) {
    case "month1":
      return { сумма: месяц, дней: 30, продвижение: false };
    case "month3":
      return { сумма: округлитьТысячи(месяц * 3 * 0.9), дней: 90, продвижение: false };
    case "month6":
      return { сумма: округлитьТысячи(месяц * 6 * 0.8), дней: 180, продвижение: false };
    case "promoWeek":
      return { сумма: т.promoWeek, дней: 7, продвижение: true };
    case "promoMonth":
      return { сумма: т.promoMonth, дней: 30, продвижение: true };
  }
}

const округлитьТысячи = (n: number) => Math.round(n / 1000) * 1000;

/** Продлить срок: от сегодня, если старый истёк, иначе от его конца. */
export function продлить(до: string | null, дней: number, сейчас = Date.now()): string {
  const старт = до && new Date(до).getTime() > сейчас ? new Date(до).getTime() : сейчас;
  return new Date(старт + дней * 86_400_000).toISOString();
}

export function действует(до: string | null | undefined, сейчас = Date.now()): boolean {
  return Boolean(до && new Date(до).getTime() > сейчас);
}

/** Виден ли партнёр туристам. */
export function виденВКаталоге(п: Партнёр, сейчас = Date.now()): boolean {
  return п.status === "active" && п.verified && действует(п.paidUntil, сейчас);
}

/** Что показать туристу — без служебных полей и госномера. */
export function публично(п: Партнёр, сейчас = Date.now()): ПартнёрПубличный {
  const { car, ...остальное } = п;
  const чистая = car ? (({ plate: _p, ...c }) => c)(car) : undefined;
  return {
    id: остальное.id,
    kind: остальное.kind,
    name: остальное.name,
    photo: остальное.photo,
    city: остальное.city,
    cities: остальное.cities,
    languages: остальное.languages,
    bio: остальное.bio,
    experienceYears: остальное.experienceYears,
    priceDay: остальное.priceDay,
    priceHour: остальное.priceHour,
    hoursPerDay: остальное.hoursPerDay,
    includes: остальное.includes,
    photos: остальное.photos,
    specialties: остальное.specialties,
    licensed: остальное.licensed,
    verified: остальное.verified,
    phone: остальное.phone,
    telegram: остальное.telegram,
    whatsapp: остальное.whatsapp,
    car: чистая,
    promoted: действует(п.promotedUntil, сейчас),
  };
}

/** Порядок в каталоге: «Рекомендуем» сверху (по приоритету), дальше новые. */
export function порядокКаталога(a: Партнёр, b: Партнёр, сейчас = Date.now()): number {
  const pa = действует(a.promotedUntil, сейчас) ? 1 : 0;
  const pb = действует(b.promotedUntil, сейчас) ? 1 : 0;
  if (pa !== pb) return pb - pa;
  if (pa && a.promoPriority !== b.promoPriority) return b.promoPriority - a.promoPriority;
  return b.createdAt.localeCompare(a.createdAt);
}

/* ── Проверка анкеты ──────────────────────────────────────────────────── */

export type ОшибкаАнкеты =
  | "name_required"
  | "phone_invalid"
  | "city_required"
  | "languages_required"
  | "price_invalid"
  | "car_required"
  | "car_invalid"
  | "bio_long";

const строка = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");
const список = (x: unknown, max: number, длина = 60) =>
  Array.isArray(x)
    ? x
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim().slice(0, длина))
        .filter(Boolean)
        .slice(0, max)
    : [];
const число = (x: unknown) => (typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN);
/** Фото — только наши ссылки на загруженные файлы, а не чужие адреса. */
const фото = (x: unknown) => список(x, 12, 200).filter((u) => /^\/api\/media\/[\w-]+$/.test(u));

/** Телефон: плюс и 9–15 цифр, пробелы и скобки не мешают. */
export function телефонГоден(x: string): boolean {
  const цифры = x.replace(/[\s()-]/g, "");
  return /^\+?\d{9,15}$/.test(цифры);
}

/**
 * Поля, которые партнёр правит сам. Статус, проверку, оплату и
 * продвижение отсюда не поменять — это делает только менеджер.
 */
export function разобратьАнкету(
  вид: ВидПартнёра,
  тело: Record<string, unknown>,
): { ok: true; поля: Partial<Партнёр> } | { ok: false; ошибка: ОшибкаАнкеты } {
  const name = строка(тело.name, 80);
  const phone = строка(тело.phone, 30);
  const city = строка(тело.city, 60);
  const languages = список(тело.languages, 12, 8);
  const bio = typeof тело.bio === "string" ? тело.bio.trim() : "";
  const priceDay = число(тело.priceDay);
  const priceHour = тело.priceHour === undefined || тело.priceHour === "" ? undefined : число(тело.priceHour);

  if (!name) return { ok: false, ошибка: "name_required" };
  if (!телефонГоден(phone)) return { ok: false, ошибка: "phone_invalid" };
  if (!city) return { ok: false, ошибка: "city_required" };
  if (!languages.length) return { ok: false, ошибка: "languages_required" };
  if (bio.length > 1500) return { ok: false, ошибка: "bio_long" };
  if (!Number.isFinite(priceDay) || priceDay < 5 || priceDay > 5000)
    return { ok: false, ошибка: "price_invalid" };
  if (priceHour !== undefined && (!Number.isFinite(priceHour) || priceHour < 1 || priceHour > 1000))
    return { ok: false, ошибка: "price_invalid" };

  const поля: Partial<Партнёр> = {
    name,
    phone,
    city,
    languages,
    bio,
    priceDay: Math.round(priceDay),
    priceHour: priceHour === undefined ? undefined : Math.round(priceHour),
    cities: список(тело.cities, 20),
    experienceYears: Math.max(0, Math.min(60, Math.round(число(тело.experienceYears) || 0))),
    hoursPerDay: Math.max(1, Math.min(24, Math.round(число(тело.hoursPerDay) || 10))),
    includes: список(тело.includes, 12, 80),
    photos: фото(тело.photos),
    photo: фото([тело.photo])[0] ?? "",
    telegram: строка(тело.telegram, 40) || undefined,
    whatsapp: строка(тело.whatsapp, 30) || undefined,
  };

  if (вид === "driver") {
    const c = (тело.car ?? {}) as Record<string, unknown>;
    const make = строка(c.make, 40);
    const model = строка(c.model, 40);
    if (!make || !model) return { ok: false, ошибка: "car_required" };
    const year = Math.round(число(c.year));
    const seats = Math.round(число(c.seats));
    const класс = КЛАССЫ_МАШИН.includes(c.class as КлассМашины) ? (c.class as КлассМашины) : null;
    if (!класс || !(year >= 1980 && year <= new Date().getFullYear() + 1) || !(seats >= 1 && seats <= 60))
      return { ok: false, ошибка: "car_invalid" };
    поля.car = {
      make,
      model,
      year,
      seats,
      class: класс,
      color: строка(c.color, 30),
      ac: c.ac !== false,
      plate: строка(c.plate, 15) || undefined,
    };
  } else {
    поля.specialties = список(тело.specialties, 10, 60);
    поля.licensed = тело.licensed === true;
  }
  return { ok: true, поля };
}

export type ОшибкаТура =
  | "title_required"
  | "days_invalid"
  | "price_invalid"
  | "program_required"
  | "group_invalid";

/** Тур гида: от 1 до 14 дней, программа — по дню на каждый. */
export function разобратьТур(
  тело: Record<string, unknown>,
):
  | { ok: true; поля: Omit<ТурПартнёра, "id" | "providerId" | "createdAt" | "updatedAt"> }
  | { ok: false; ошибка: ОшибкаТура } {
  const title = строка(тело.title, 100);
  const days = Math.round(число(тело.days));
  const pricePerPerson = число(тело.pricePerPerson);
  const priceGroup =
    тело.priceGroup === undefined || тело.priceGroup === "" ? undefined : число(тело.priceGroup);
  const maxGroup = Math.round(число(тело.maxGroup));
  if (!title) return { ok: false, ошибка: "title_required" };
  if (!(days >= 1 && days <= 14)) return { ok: false, ошибка: "days_invalid" };
  if (!Number.isFinite(pricePerPerson) || pricePerPerson < 1 || pricePerPerson > 20000)
    return { ok: false, ошибка: "price_invalid" };
  if (priceGroup !== undefined && (!Number.isFinite(priceGroup) || priceGroup < 1 || priceGroup > 100000))
    return { ok: false, ошибка: "price_invalid" };
  if (!(maxGroup >= 1 && maxGroup <= 60)) return { ok: false, ошибка: "group_invalid" };
  const программа = Array.isArray(тело.program)
    ? (тело.program as unknown[]).slice(0, days).map((д) => {
        const r = (д ?? {}) as Record<string, unknown>;
        return { title: строка(r.title, 100), text: строка(r.text, 1500) };
      })
    : [];
  if (программа.length < days || программа.some((д) => !д.title))
    return { ok: false, ошибка: "program_required" };
  return {
    ok: true,
    поля: {
      title,
      days,
      pricePerPerson: Math.round(pricePerPerson),
      priceGroup: priceGroup === undefined ? undefined : Math.round(priceGroup),
      maxGroup,
      city: строка(тело.city, 60),
      languages: список(тело.languages, 12, 8),
      summary: строка(тело.summary, 600),
      program: программа,
      includes: список(тело.includes, 15, 100),
      excludes: список(тело.excludes, 15, 100),
      photos: фото(тело.photos),
      meetingPoint: строка(тело.meetingPoint, 160),
      status: тело.status === "hidden" ? "hidden" : "active",
    },
  };
}
