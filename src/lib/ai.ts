import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { getCity, getPoi, listCities, listPois, listTours } from "./db";
import { formatPrice, todayHours } from "./geo";
import { planRoute } from "./planner";
import { conditionLabel, getForecast } from "./weather";
import { findCity } from "./city-names";
import { CATEGORIES, THEMES, type Category, type Lang, type Theme } from "./types";

/**
 * Языковая модель поверх нашей базы.
 *
 * Главное правило: модель понимает вопрос и формулирует ответ, но ни одного
 * факта не берёт из себя. Часы работы, цены, координаты и маршруты приходят
 * только из инструментов, которые читают базу платформы. Модель, выдумавшая
 * стоимость билета или время закрытия, отправит туриста к запертой двери —
 * и это тот вид ошибки, после которого приложением перестают пользоваться.
 *
 * Поэтому здесь нет «расскажи о Самарканде своими словами»: каждый ответ
 * собирается из выдачи инструментов, а чего в базе нет — того помощник
 * не знает и прямо об этом говорит.
 *
 * Если ключа нет или сервис недоступен, вызывающий код откатывается на
 * детерминированный разбор из assistant.ts. Офлайн-режим из ТЗ так и остаётся
 * рабочим: без интернета помощник продолжает отвечать, просто суше.
 */

/** Модель задаётся окружением: смена тарифа не должна требовать пересборки. */
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

/** Ответы короткие — это чат туриста, а не отчёт. */
const MAX_TOKENS = 2000;

/**
 * Потолок обращений к инструментам за один вопрос.
 *
 * Без него зациклившаяся модель может перебирать базу до бесконечности,
 * и счёт за один вопрос вырастет непредсказуемо.
 */
const MAX_ITERATIONS = 8;

export interface AiTurn {
  role: "user" | "assistant";
  content: string;
}

export function aiAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/* ─────────────────────────── Инструменты ─────────────────────────── */

/** Компактное описание объекта: только то, что нужно для ответа туристу. */
function describePoi(slug: string, lang: Lang) {
  const poi = getPoi(slug, lang);
  if (!poi) return null;

  const day = new Date().getDay();
  return {
    slug: poi.slug,
    name: poi.name,
    city: poi.city_slug,
    category: poi.category,
    themes: poi.themes,
    rating: poi.rating,
    price: formatPrice(poi.price_uzs, lang),
    is_free: Boolean(poi.is_free),
    hours_today: todayHours(poi.opening_hours, day) ?? "круглосуточно",
    visit_minutes: poi.avg_visit_min,
    short: poi.short_desc,
    lat: poi.lat,
    lon: poi.lon,
    has_audio_guide: true,
    qr_code: poi.qr_code ?? null,
  };
}

function buildTools(
  lang: Lang,
  hint: { city?: string; lat?: number; lon?: number },
  /** Инструменты отмечают здесь объекты, которые отдали модели. */
  seen: Set<string>,
) {
  const cities = listCities(lang);

  const listCitiesTool = betaTool({
    name: "list_cities",
    description:
      "Список городов и областей платформы с числом объектов в каждом. " +
      "Вызывай, когда нужно понять, о каком городе речь, или предложить выбор.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () =>
      JSON.stringify(
        cities.map((c) => ({
          slug: c.slug,
          name: c.name,
          objects: listPois({ city: c.slug, lang }).length,
        })),
      ),
  });

  const searchPlaces = betaTool({
    name: "search_places",
    description:
      "Поиск объектов в базе платформы. Возвращает только реально существующие " +
      "места с их ценами и часами работы. Это единственный источник фактов " +
      "об объектах — не описывай места по памяти.",
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "slug города, например samarkand. Необязательно.",
        },
        category: { type: "string", enum: [...CATEGORIES] },
        theme: { type: "string", enum: [...THEMES] },
        free_only: { type: "boolean", description: "Только бесплатные." },
        open_now: { type: "boolean", description: "Только открытые сейчас." },
        limit: { type: "number", description: "Сколько вернуть, по умолчанию 8." },
      },
      additionalProperties: false,
    },
    run: async (input) => {
      const args = input as {
        city?: string;
        category?: Category;
        theme?: Theme;
        free_only?: boolean;
        open_now?: boolean;
        limit?: number;
      };

      let found = listPois({ city: args.city, category: args.category, lang });
      if (args.theme) found = found.filter((p) => p.themes.includes(args.theme!));
      if (args.free_only) found = found.filter((p) => p.is_free);

      const day = new Date().getDay();
      if (args.open_now) {
        found = found.filter((p) => todayHours(p.opening_hours, day) !== null);
      }

      const limit = Math.min(20, Math.max(1, args.limit ?? 8));
      const page = found.slice(0, limit);
      page.forEach((p) => seen.add(p.slug));
      return JSON.stringify(page.map((p) => describePoi(p.slug, lang)));
    },
  });

  const placeDetails = betaTool({
    name: "place_details",
    description:
      "Подробности одного объекта, включая исторический очерк. " +
      "Пересказывай только то, что вернул этот инструмент.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
      additionalProperties: false,
    },
    run: async (input) => {
      const { slug } = input as { slug: string };
      const poi = getPoi(slug, lang);
      if (!poi) return JSON.stringify({ error: "объект не найден" });
      seen.add(slug);
      return JSON.stringify({ ...describePoi(slug, lang), story: poi.full_story });
    },
  });

  const buildRoute = betaTool({
    name: "plan_route",
    description:
      "Строит маршрут по городу детерминированным планировщиком платформы: " +
      "учитывает часы работы, дорогу между точками и бюджет. " +
      "Используй его для любой просьбы «что успеть за N часов».",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "slug города" },
        minutes: { type: "number", description: "Сколько времени есть." },
        themes: { type: "array", items: { type: "string", enum: [...THEMES] } },
        mode: { type: "string", enum: ["walk", "taxi", "car"] },
        start_hour: {
          type: "number",
          description:
            "Час начала, 0–23. Если не указан, берётся текущее время. " +
            "Вечером почти всё закрыто — тогда планируй на 9 утра.",
        },
      },
      required: ["city", "minutes"],
      additionalProperties: false,
    },
    run: async (input) => {
      const args = input as {
        city: string;
        minutes: number;
        themes?: Theme[];
        mode?: "walk" | "taxi" | "car";
        start_hour?: number;
      };

      const route = planRoute({
        city: args.city,
        minutes: args.minutes,
        themes: args.themes ?? [],
        budget: "medium",
        mode: args.mode ?? "walk",
        lang,
        startLat: hint.lat,
        startLon: hint.lon,
        startAtMin: args.start_hour != null ? args.start_hour * 60 : undefined,
      });

      if (!route) return JSON.stringify({ error: "маршрут не построен" });

      route.stops.forEach((s) => seen.add(s.poi.slug));
      return JSON.stringify({
        summary: route.summary,
        stops: route.stops.map((s, i) => ({
          order: i + 1,
          slug: s.poi.slug,
          name: s.poi.name,
          stay_minutes: s.stay_min,
          leg_meters: s.leg_meters,
          price: formatPrice(s.poi.price_uzs, lang),
        })),
        skipped: route.skipped.slice(0, 5),
      });
    },
  });

  const readyRoutes = betaTool({
    name: "ready_routes",
    description: "Готовые авторские маршруты платформы по городу.",
    inputSchema: {
      type: "object",
      properties: { city: { type: "string" } },
      additionalProperties: false,
    },
    run: async (input) => {
      const { city } = input as { city?: string };
      return JSON.stringify(
        listTours(lang, city).slice(0, 8).map((tour) => ({
          slug: tour.slug,
          title: tour.title,
          stops: tour.stop_count,
          minutes: tour.total_min,
        })),
      );
    },
  });

  const weather = betaTool({
    name: "weather",
    description:
      "Прогноз погоды по городу на неделю. Нужен, когда спрашивают, " +
      "что надеть, когда лучше ехать или жарко ли сейчас.",
    inputSchema: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"],
      additionalProperties: false,
    },
    run: async (input) => {
      const { city } = input as { city: string };
      const found = getCity(city, lang);
      if (!found) return JSON.stringify({ error: "город не найден" });

      const forecast = await getForecast(found.lat, found.lon);
      return JSON.stringify({
        city: found.name,
        now: forecast.now
          ? { ...forecast.now, condition: conditionLabel(forecast.now.code, lang) }
          : null,
        days: forecast.days.slice(0, 5).map((d) => ({
          date: d.date,
          max: d.max,
          min: d.min,
          condition: conditionLabel(d.code, lang),
        })),
      });
    },
  });

  return [listCitiesTool, searchPlaces, placeDetails, buildRoute, readyRoutes, weather];
}

/* ─────────────────────────── Запрос ─────────────────────────── */

const LANGUAGE_NAME: Partial<Record<Lang, string>> = {
  ru: "русском",
  uz: "узбекском",
  en: "английском",
};

/**
 * Постоянная часть подсказки.
 *
 * Вынесена отдельно ради кеширования: за неё и за описания инструментов
 * платится в десять раз меньше, если байты не меняются между запросами.
 * Всё, что зависит от конкретного вопроса, живёт в contextSystem и в кеш
 * не попадает — иначе любая мелочь обесценивала бы весь префикс.
 */
function stableSystem(lang: Lang): string {
  return [
    "Ты — помощник туристической платформы Узбекистана. Помогаешь туристу спланировать поездку.",
    "",
    "Жёсткое правило: все факты об объектах — названия, цены, часы работы, координаты, маршруты —",
    "берутся ТОЛЬКО из инструментов. Никогда не называй цену, время работы или адрес по памяти,",
    "даже если уверен. Турист поедет по твоему ответу; ошибка здесь стоит ему дня поездки.",
    "Если инструмент ничего не вернул — так и скажи и предложи, что можно сделать вместо этого.",
    "",
    "О чём не спрашивают платформу — визы, авиабилеты, бронирование отелей, обмен валюты —",
    "честно говори, что этого в платформе нет.",
    "",
    `Отвечай на ${LANGUAGE_NAME[lang] ?? "английском"} языке, если турист не пишет на другом.`,
    "Коротко: два–четыре предложения плюс список, если он уместен. Без вводных вроде «конечно».",
    "Не повторяй в тексте всё, что и так видно в карточках мест под ответом — назови главное.",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Переменная часть: зависит от вопроса и потому не кешируется. */
function contextSystem(hint: { city?: string; hasPosition: boolean }): string {
  return [
    hint.city ? `Турист сейчас смотрит город: ${hint.city}.` : "",
    hint.hasPosition
      ? "Координаты туриста известны — «что рядом» считается от них."
      : "Координаты неизвестны: если спрашивают «что рядом», попроси выбрать город.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Системная часть запроса двумя блоками.
 *
 * Порядок в запросе — инструменты, затем система, затем переписка. Отметка
 * кеша стоит в конце постоянного блока, поэтому под неё попадают и описания
 * инструментов, и неизменные правила: около двух с половиной тысяч токенов,
 * которые иначе оплачивались бы заново на каждом обращении к модели, а их
 * два-три на один вопрос.
 */
function systemBlocks(lang: Lang, hint: { city?: string; hasPosition: boolean }) {
  const context = contextSystem(hint);
  return [
    {
      type: "text" as const,
      text: stableSystem(lang),
      cache_control: { type: "ephemeral" as const },
    },
    ...(context ? [{ type: "text" as const, text: context }] : []),
  ];
}

export interface AiResult {
  message: string;
  /** Объекты, которые модель показывала через инструменты, — для карточек. */
  slugs: string[];
}

/**
 * Спрашивает модель, дав ей доступ к базе через инструменты.
 * Бросает исключение при любой ошибке — вызывающий код решает, чем ответить.
 */
export async function askAi(
  text: string,
  lang: Lang,
  history: AiTurn[],
  hint: { city?: string; lat?: number; lon?: number },
): Promise<AiResult> {
  const client = new Anthropic();

  // Город из фразы важнее города, который открыт на экране: человек мог
  // спросить про Бухару, стоя на странице Самарканда.
  const spoken = findCity(text, listCities(lang));
  const city = spoken ?? hint.city;

  const seen = new Set<string>();
  const tools = buildTools(lang, { city, lat: hint.lat, lon: hint.lon }, seen);

  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    // Ответы туристу простые, а задержка в чате заметна: глубокое
    // рассуждение здесь стоило бы секунд и денег без выигрыша в качестве.
    output_config: { effort: "low" },
    system: systemBlocks(lang, { city, hasPosition: hint.lat != null }),
    tools,
    messages: [
      ...history.map((turn) => ({ role: turn.role, content: turn.content })),
      { role: "user" as const, content: text },
    ],
    max_iterations: MAX_ITERATIONS,
  });

  const final = await runner;

  const message = final.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  /*
   * Карточки показываем для объектов, которые модель действительно доставала
   * из базы. Сначала я собирал их разбором переписки регулярным выражением —
   * хрупко и зависит от внутренностей SDK. Инструменты знают это сами,
   * поэтому отмечают выдачу по ходу дела.
   *
   * Порядок важен: сначала те, что модель упомянула в тексте — они и есть
   * ответ, остальные лишь попали в выборку.
   */
  const mentioned = [...seen].filter((slug) => {
    const poi = getPoi(slug, lang);
    return poi ? message.includes(poi.name) : false;
  });
  const rest = [...seen].filter((slug) => !mentioned.includes(slug));

  return { message, slugs: [...mentioned, ...rest].slice(0, 8) };
}

/**
 * То же, но с выдачей текста по мере генерации.
 *
 * Без этого чат молчит несколько секунд и выглядит зависшим: модель успевает
 * сходить в базу два-три раза, прежде чем скажет первое слово. Обращения к
 * инструментам наружу не выводятся — туристу незачем видеть, как помощник
 * листает базу, ему нужен ответ.
 */
export async function askAiStream(
  text: string,
  lang: Lang,
  history: AiTurn[],
  hint: { city?: string; lat?: number; lon?: number },
  onDelta: (chunk: string) => void,
): Promise<AiResult> {
  const client = new Anthropic();

  const spoken = findCity(text, listCities(lang));
  const city = spoken ?? hint.city;

  const seen = new Set<string>();
  const tools = buildTools(lang, { city, lat: hint.lat, lon: hint.lon }, seen);

  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    output_config: { effort: "low" },
    system: systemBlocks(lang, { city, hasPosition: hint.lat != null }),
    tools,
    messages: [
      ...history.map((turn) => ({ role: turn.role, content: turn.content })),
      { role: "user" as const, content: text },
    ],
    max_iterations: MAX_ITERATIONS,
    stream: true,
  });

  let message = "";

  // При stream: true каждая итерация раннера — это поток, а не готовое
  // сообщение. Промежуточные итерации содержат обращения к инструментам;
  // текст появляется в последней, и именно он идёт наружу.
  for await (const stream of runner) {
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta" &&
        event.delta.text
      ) {
        message += event.delta.text;
        onDelta(event.delta.text);
      }
    }
  }

  const mentioned = [...seen].filter((slug) => {
    const poi = getPoi(slug, lang);
    return poi ? message.includes(poi.name) : false;
  });
  const rest = [...seen].filter((slug) => !mentioned.includes(slug));

  return { message: message.trim(), slugs: [...mentioned, ...rest].slice(0, 8) };
}
