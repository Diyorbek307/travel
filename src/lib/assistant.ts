import { getCity, listCities, listPois } from "./db";
import {
  formatDistance,
  formatDuration,
  formatPrice,
  haversine,
  isOpenAt,
  todayHours,
  travelMinutes,
} from "./geo";
import { closedReasonText, planRoute } from "./planner";
import type { Budget, Lang, Poi, Theme, TransportMode } from "./types";

/**
 * AI-ассистент туриста (п. 4 ТЗ).
 *
 * Принцип: разбор запроса и формулировка ответа — языковой слой, но сам маршрут,
 * цены и часы работы всегда берутся из базы и детерминированного планировщика.
 * Модель не выдумывает объекты. Поэтому базовый режим работает полностью офлайн
 * и без ключей API; LLM подключается как улучшение формулировок, а не как источник фактов.
 */

export type Intent =
  | "plan_route"
  | "nearby"
  | "story"
  | "food"
  | "free"
  | "evening"
  | "directions"
  | "unknown";

export interface AssistantRequest {
  text: string;
  lang: Lang;
  city?: string;
  lat?: number;
  lon?: number;
}

export interface AssistantReply {
  intent: Intent;
  /** Текст ответа туристу. */
  message: string;
  /** Объекты, о которых идёт речь — рендерятся карточками. */
  pois: Poi[];
  /** Готовый маршрут, если запрос это подразумевал. */
  route?: ReturnType<typeof planRoute>;
  /** Что распознано из фразы — показывается как «понял так». */
  parsed?: {
    city?: string;
    minutes?: number;
    themes: Theme[];
    budget: Budget;
    mode: TransportMode;
  };
}

/* ------------------------------------------------------------------ */
/* Разбор фразы                                                       */
/* ------------------------------------------------------------------ */

const THEME_KEYWORDS: Record<Theme, string[]> = {
  history: ["истор", "tarix", "history", "древн", "старин", "ancient"],
  architecture: ["архитектур", "me'morchilik", "memorchilik", "architect", "зодчеств", "медресе", "madrasa"],
  museums: ["музе", "muzey", "museum"],
  islamic: ["ислам", "islom", "islamic", "мечет", "masjid", "mosque", "мавзоле", "maqbara", "суфи", "sufi"],
  nature: ["природ", "tabiat", "nature", "гор", "tog'", "mountain", "озер", "ko'l", "lake", "парк", "park"],
  food: ["еда", "кухн", "поесть", "плов", "palov", "osh", "ovqat", "food", "eat", "cuisine", "ресторан", "restoran", "restaurant", "кафе", "cafe", "гастроном", "шашлык", "самса", "somsa", "лагман", "lagman"],
  entertainment: ["развлеч", "ko'ngilochar", "entertainment", "шоу", "show", "вечер", "kecha", "night"],
  family: ["семь", "дет", "oila", "bola", "family", "kids", "children"],
  crafts: ["ремесл", "hunarmand", "craft", "сувенир", "sovg'a", "souvenir", "керамик", "ceramic", "ковр", "gilam", "carpet", "шёлк", "ipak", "silk"],
  shopping: ["шопинг", "xarid", "shopping", "базар", "bozor", "bazaar", "рынок", "market", "купить", "sotib olish", "buy"],
  free: ["бесплатн", "bepul", "free", "без денег", "no money", "даром"],
};

const MODE_KEYWORDS: Record<TransportMode, string[]> = {
  walk: ["пешк", "пеший", "piyoda", "walk", "on foot", "гулят", "прогул"],
  taxi: ["такси", "taksi", "taxi", "яндекс", "yandex"],
  car: ["машин", "авто", "mashina", "car", "drive", "аренд"],
};

const BUDGET_KEYWORDS: Record<Budget, string[]> = {
  low: ["дешев", "эконом", "arzon", "cheap", "budget", "недорог", "бесплатн", "bepul", "free"],
  medium: ["средн", "o'rta", "orta", "medium", "обычн"],
  high: ["дорог", "премиум", "qimmat", "luxury", "premium", "expensive", "vip"],
};

/** Извлекает доступное время в минутах: «4 часа», «2 soat», «90 минут», «на день». */
export function parseMinutes(text: string): number | undefined {
  const s = text.toLowerCase();

  const dayMatch = /(\d+)\s*(дн|дня|дней|день|kun|day)/.exec(s);
  if (dayMatch) return Math.min(7, Number(dayMatch[1])) * 8 * 60;
  if (/\b(на день|весь день|butun kun|full day|all day)\b/.test(s)) return 8 * 60;
  if (/\b(полдня|yarim kun|half day)\b/.test(s)) return 4 * 60;

  const hourMatch = /(\d+)\s*(час|часа|часов|соат|soat|hour|hours|h\b)/.exec(s);
  if (hourMatch) return Math.min(12, Number(hourMatch[1])) * 60;

  const minMatch = /(\d+)\s*(минут|мин|daqiqa|daq|minute|min)\b/.exec(s);
  if (minMatch) return Math.min(720, Number(minMatch[1]));

  return undefined;
}

function parseThemes(text: string): Theme[] {
  const s = text.toLowerCase();
  const found: Theme[] = [];
  for (const [theme, words] of Object.entries(THEME_KEYWORDS) as [Theme, string[]][]) {
    if (words.some((w) => s.includes(w))) found.push(theme);
  }
  return found;
}

function parseMode(text: string): TransportMode {
  const s = text.toLowerCase();
  for (const [mode, words] of Object.entries(MODE_KEYWORDS) as [TransportMode, string[]][]) {
    if (words.some((w) => s.includes(w))) return mode;
  }
  return "walk";
}

function parseBudget(text: string): Budget {
  const s = text.toLowerCase();
  for (const [budget, words] of Object.entries(BUDGET_KEYWORDS) as [Budget, string[]][]) {
    if (words.some((w) => s.includes(w))) return budget;
  }
  return "medium";
}

/** Находит упомянутый город по названию на любом из языков или по slug. */
function parseCity(text: string, lang: Lang): string | undefined {
  const s = text.toLowerCase();
  for (const l of ["ru", "uz", "en"] as Lang[]) {
    for (const c of listCities(l)) {
      const name = c.name.toLowerCase();
      // Отсекаем окончания: «в Бухаре» → «бухар»
      const stem = name.length > 5 ? name.slice(0, name.length - 1) : name;
      if (s.includes(stem) || s.includes(c.slug)) return c.slug;
    }
  }
  void lang;
  return undefined;
}

/**
 * Определение намерения. Порядок проверок важен: фразы туристов почти всегда
 * содержат сразу несколько сигналов, и побеждать должен самый специфичный.
 *
 * Ключевой случай — пример из п. 4 ТЗ: «У меня 4 часа в Бухаре, люблю историю
 * и хочу попробовать плов». Здесь есть и «истор», и «плов», но человек просит
 * маршрут, а еда и история — это его интересы. Поэтому указание на запас
 * времени проверяется раньше еды, а рассказ об объекте требует явной просьбы
 * рассказать, а не любого упоминания истории.
 */
function detectIntent(text: string): Intent {
  const s = text.toLowerCase();

  if (/(как добраться|как дойти|как доехать|qanday borish|how (do i )?get|directions|маршрут до)/.test(s))
    return "directions";

  // Именно просьба рассказать, а не любое слово «история»:
  // «люблю историю» — это интерес, а не запрос рассказа.
  if (/(расскажи|расскажите|что такое|нима гап|tarixini ayt|tell me|what is|history of|story of)/.test(s))
    return "story";

  if (/(вечер|ночь|kecha|evening|night|закат)/.test(s)) return "evening";
  if (/(бесплатн|bepul|free|без денег)/.test(s)) return "free";

  // Указан запас времени — человек планирует день, а не ищет одно место.
  if (parseMinutes(s) !== undefined) return "plan_route";

  if (/(поесть|ресторан|кафе|плов|еда|ovqat|restoran|eat|food|lunch|dinner|обед|ужин)/.test(s))
    return "food";

  if (/(маршрут|marshrut|route|itinerary|что посмотреть|nima ko'rish|what to see|посоветуй)/.test(s))
    return "plan_route";

  if (/(рядом|поблизости|yaqin|near me|nearby|около меня|вокруг)/.test(s)) return "nearby";

  return "unknown";
}

/* ------------------------------------------------------------------ */
/* Формулировки ответов                                               */
/* ------------------------------------------------------------------ */

const SAY: Partial<Record<Lang, Record<string, string>>> = {
  ru: {
    no_city: "Сначала выберите город — тогда я смогу подсказать конкретные места.",
    nearby_head: "Вот что рядом с вами:",
    no_gps: "Чтобы найти места рядом, нужен доступ к геолокации. Разрешите его — или выберите город.",
    no_results: "По этому запросу ничего не нашлось. Попробуйте выбрать другой город или тему.",
    route_head: "Собрал для вас маршрут:",
    route_fail: "Не получилось составить маршрут: слишком мало времени или все подходящие объекты закрыты.",
    food_head: "Где можно поесть:",
    free_head: "Эти места можно посетить бесплатно:",
    evening_head: "Вечером стоит посмотреть:",
    story_head: "Вот что я знаю:",
    unknown:
      "Могу составить маршрут, показать что рядом, найти где поесть, рассказать историю объекта или подсказать бесплатные места. Например: «У меня 4 часа в Самарканде, люблю историю».",
    directions_head: "Маршрут до объекта:",
    closed_note: "Сейчас закрыто: ${names}. Спланируйте на утро — в форме планировщика можно выбрать время начала.",
    free_entry: "вход свободный",
    open_now: "открыто сейчас",
    closed_now: "сейчас закрыто",
    from_you: "от вас",
    on_foot: "пешком",
    open_map: "откройте карту, чтобы проложить маршрут",
  },
  uz: {
    no_city: "Avval shaharni tanlang — shunda aniq joylarni tavsiya qila olaman.",
    nearby_head: "Yaqiningizda quyidagilar bor:",
    no_gps: "Yaqin joylarni topish uchun geolokatsiya kerak. Ruxsat bering yoki shaharni tanlang.",
    no_results: "Bu so'rov bo'yicha hech narsa topilmadi. Boshqa shahar yoki mavzuni tanlang.",
    route_head: "Sizga marshrut tuzdim:",
    route_fail: "Marshrut tuzilmadi: vaqt juda kam yoki mos obyektlar yopiq.",
    food_head: "Qayerda ovqatlanish mumkin:",
    free_head: "Bu joylarga bepul kirish mumkin:",
    evening_head: "Kechqurun ko'rishga arziydi:",
    story_head: "Mana bilganlarim:",
    unknown:
      "Marshrut tuzishim, yaqin joylarni ko'rsatishim, ovqatlanish joyini topishim, obyekt tarixini aytishim yoki bepul joylarni tavsiya qilishim mumkin.",
    directions_head: "Obyektgacha yo'l:",
    closed_note: "Hozir yopiq: ${names}. Ertalabga rejalashtiring — rejalashtiruvchida boshlanish vaqtini tanlash mumkin.",
    free_entry: "kirish bepul",
    open_now: "hozir ochiq",
    closed_now: "hozir yopiq",
    from_you: "sizdan",
    on_foot: "piyoda",
    open_map: "marshrut uchun xaritani oching",
  },
  en: {
    no_city: "Pick a city first — then I can suggest specific places.",
    nearby_head: "Here is what is near you:",
    no_gps: "I need location access to find places near you. Allow it, or pick a city.",
    no_results: "Nothing matched that. Try another city or topic.",
    route_head: "Here is your route:",
    route_fail: "Could not build a route: too little time, or all matching sites are closed.",
    food_head: "Places to eat:",
    free_head: "These places are free to visit:",
    evening_head: "Worth seeing in the evening:",
    story_head: "Here is what I know:",
    unknown:
      "I can build a route, show what is nearby, find a place to eat, tell a site's story, or suggest free places. For example: \"I have 4 hours in Samarkand and I love history\".",
    directions_head: "Directions to the site:",
    closed_note: "Closed right now: ${names}. Plan for the morning — the planner lets you pick a start time.",
    free_entry: "free entry",
    open_now: "open now",
    closed_now: "closed now",
    from_you: "from you",
    on_foot: "on foot",
    open_map: "open the map to get directions",
  },
};

function say(lang: Lang, key: string): string {
  return SAY[lang]?.[key] ?? SAY.en?.[key] ?? key;
}

/** Короткое слово или оборот на языке ответа — для подстановки в предложения. */
function word(lang: Lang, key: string): string {
  return say(lang, key);
}

/* ------------------------------------------------------------------ */
/* Основной обработчик                                                */
/* ------------------------------------------------------------------ */

export function ask(req: AssistantRequest): AssistantReply {
  const { text, lang } = req;
  const intent = detectIntent(text);
  const city = parseCity(text, lang) ?? req.city;
  const themes = parseThemes(text);
  const minutes = parseMinutes(text);
  const mode = parseMode(text);
  const budget = parseBudget(text);
  const parsed = { city, minutes, themes, budget, mode };

  const day = new Date().getDay();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  switch (intent) {
    case "nearby": {
      if (req.lat == null || req.lon == null) {
        return { intent, message: say(lang, "no_gps"), pois: [], parsed };
      }
      const pool = listPois({ city, lang });
      const near = pool
        .map((p) => ({ p, d: haversine(req.lat!, req.lon!, p.lat, p.lon) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 6);
      if (near.length === 0) {
        return { intent, message: say(lang, "no_results"), pois: [], parsed };
      }
      const lines = near.map(
        ({ p, d }) => `• ${p.name} — ${formatDistance(d, lang)}${p.is_free ? `, ${word(lang, "free_entry")}` : ""}`,
      );
      return {
        intent,
        message: `${say(lang, "nearby_head")}\n${lines.join("\n")}`,
        pois: near.map((n) => n.p),
        parsed,
      };
    }

    case "food": {
      if (!city) return { intent, message: say(lang, "no_city"), pois: [], parsed };
      let pool = listPois({ city, lang }).filter(
        (p) => p.category === "restaurant" || p.category === "cafe",
      );
      if (req.lat != null && req.lon != null) {
        pool = pool.sort(
          (a, b) =>
            haversine(req.lat!, req.lon!, a.lat, a.lon) - haversine(req.lat!, req.lon!, b.lat, b.lon),
        );
      }
      const top = pool.slice(0, 6);
      if (top.length === 0) return { intent, message: say(lang, "no_results"), pois: [], parsed };
      const lines = top.map((p) => {
        const open = word(lang, isOpenAt(p.opening_hours, nowMin, day) ? "open_now" : "closed_now");
        return `• ${p.name} — ★ ${p.rating.toFixed(1)}, ${open}`;
      });
      return {
        intent,
        message: `${say(lang, "food_head")}\n${lines.join("\n")}`,
        pois: top,
        parsed,
      };
    }

    case "free": {
      if (!city) return { intent, message: say(lang, "no_city"), pois: [], parsed };
      const top = listPois({ city, lang })
        .filter((p) => p.is_free === 1 && !["toilet", "transport"].includes(p.category))
        .slice(0, 8);
      if (top.length === 0) return { intent, message: say(lang, "no_results"), pois: [], parsed };
      return {
        intent,
        message: `${say(lang, "free_head")}\n${top.map((p) => `• ${p.name}`).join("\n")}`,
        pois: top,
        parsed,
      };
    }

    case "evening": {
      if (!city) return { intent, message: say(lang, "no_city"), pois: [], parsed };
      const top = listPois({ city, lang })
        .filter((p) => isOpenAt(p.opening_hours, 20 * 60, day))
        .filter((p) => !["toilet", "transport", "station", "airport"].includes(p.category))
        .slice(0, 8);
      if (top.length === 0) return { intent, message: say(lang, "no_results"), pois: [], parsed };
      const lines = top.map((p) => {
        const h = todayHours(p.opening_hours, day);
        return `• ${p.name}${h ? ` — ${h}` : ""}`;
      });
      return {
        intent,
        message: `${say(lang, "evening_head")}\n${lines.join("\n")}`,
        pois: top,
        parsed,
      };
    }

    case "story":
    case "directions": {
      const pool = listPois({ city, lang });
      const match = findPoiByName(text, pool);
      if (!match) return { intent, message: say(lang, "no_results"), pois: [], parsed };
      if (intent === "directions") {
        const from = req.lat != null && req.lon != null
          ? haversine(req.lat, req.lon, match.lat, match.lon)
          : null;
        const msg =
          from == null
            ? `${match.name}: ${match.lat.toFixed(5)}, ${match.lon.toFixed(5)} — ${word(lang, "open_map")}`
            : `${match.name} — ${formatDistance(from, lang)} ${word(lang, "from_you")}, ~ ` +
              `${formatDuration(travelMinutes(from, "walk"), lang)} ${word(lang, "on_foot")}.`;
        return { intent, message: `${say(lang, "directions_head")}\n${msg}`, pois: [match], parsed };
      }
      const story = match.full_story ?? match.short_desc ?? "";
      return {
        intent,
        message: `${say(lang, "story_head")}\n\n**${match.name}**\n\n${story}`,
        pois: [match],
        parsed,
      };
    }

    case "plan_route":
    default: {
      if (!city) {
        return {
          intent: intent === "unknown" ? "unknown" : intent,
          message: intent === "unknown" ? say(lang, "unknown") : say(lang, "no_city"),
          pois: [],
          parsed,
        };
      }
      const route = planRoute({
        city,
        minutes: minutes ?? 240,
        themes,
        budget,
        mode,
        lang,
        startLat: req.lat,
        startLon: req.lon,
        includeMeals: themes.includes("food"),
      });
      if (!route) {
        return { intent: "plan_route", message: say(lang, "route_fail"), pois: [], parsed };
      }
      const lines = route.stops.map((s, i) => {
        const price = formatPrice(s.poi.price_uzs, lang);
        return `${i + 1}. ${s.poi.name} — ${formatDuration(s.stay_min, lang)}, ${price}${
          s.leg_meters > 0 ? ` (+${formatDistance(s.leg_meters, lang)})` : ""
        }`;
      });
      // Вечером почти всё закрыто, и короткий маршрут выглядит как сбой.
      // Объясняем причину прямо в ответе, а не прячем её в списке пропущенных.
      const closed = route.skipped.filter((s) => s.reason === closedReasonText(lang));
      const closedNote = closed.length
        ? "\n\n" +
          say(lang, "closed_note").replace(
            "${names}",
            closed.slice(0, 3).map((s) => s.name).join(", "),
          )
        : "";

      return {
        intent: "plan_route",
        message:
          `${say(lang, "route_head")}\n\n${lines.join("\n")}\n\n${route.summary}` + closedNote,
        pois: route.stops.map((s) => s.poi),
        route,
        parsed,
      };
    }
  }
}

/** Поиск объекта по упоминанию названия во фразе (частичное совпадение основы). */
function findPoiByName(text: string, pool: Poi[]): Poi | null {
  const s = text.toLowerCase();
  let best: Poi | null = null;
  let bestLen = 0;
  for (const p of pool) {
    const name = p.name.toLowerCase();
    const stem = name.length > 6 ? name.slice(0, name.length - 2) : name;
    if ((s.includes(stem) || s.includes(p.slug)) && stem.length > bestLen) {
      best = p;
      bestLen = stem.length;
    }
  }
  return best;
}

/** Проверка города — используется страницей ассистента для подсказок. */
export function cityExists(slug: string, lang: Lang): boolean {
  return getCity(slug, lang) !== null;
}
