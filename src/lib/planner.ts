import { getCity, listPois } from "./db";
import {
  formatDistance,
  formatDuration,
  formatPrice,
  haversine,
  isOpenAt,
  travelMinutes,
} from "./geo";
import type {
  TransportMode,
  Budget,
  Lang,
  Category,
  Poi,
  PlannerRequest,
  OpeningHours,
  Theme,
  Tour,
  TourStop,
} from "./types";

/**
 * Построение туристического маршрута (п. 3 ТЗ).
 *
 * Алгоритм детерминированный: жадный подбор по отношению «ценность / стоимость»
 * с проверкой часов работы, затем улучшение 2-opt, затем вставка остановок на еду.
 * Он не обращается ни к каким внешним сервисам — значит, работает офлайн
 * и его результат воспроизводим (важно для тестов и для доверия к AI-ответам).
 */

/** Верхняя граница расходов на объекты, сум. */
const BUDGET_CAP: Record<Budget, number> = {
  low: 50_000,
  medium: 200_000,
  high: 1_000_000,
};

/** Категории, которые не ставим как самостоятельные точки интереса. */
const UTILITY: Category[] = ["toilet", "station", "airport", "transport", "hotel"];

const MEAL_WINDOWS: [number, number][] = [
  [12 * 60, 14 * 60],
  [18 * 60, 20 * 60],
];

/**
 * Вес времени осмотра при выборе следующего объекта.
 * 1.0 — чистое отношение «ценность / затраченное время», при котором
 * побеждают короткие проходные точки; 0 — выбор только по дороге.
 * 0.35 подобрано так, чтобы главные объекты города попадали в маршрут.
 */
const STAY_WEIGHT = 0.35;

/** Сколько минут резервируем на обед, если маршрут попадает в окно приёма пищи. */
const MEAL_RESERVE_MIN = 45;

/**
 * Порог популярности, начиная с которого объект считается якорным —
 * тем, ради чего турист приехал в город. Такие объекты ставятся в маршрут
 * в первую очередь, до подбора по эффективности.
 */
const ANCHOR_POPULARITY = 0.85;

interface Candidate {
  poi: Poi;
  score: number;
}

interface FillContext {
  stops: TourStop[];
  used: Set<number>;
  curLat: number;
  curLon: number;
  elapsed: number;
  spent: number;
  limitMin: number;
  budgetCap: number;
  startAt: number;
  day: number;
  mode: TransportMode;
}

/**
 * Жадное добавление объектов из пула, пока они помещаются.
 *
 * `strategy` задаёт, что считать лучшим следующим объектом:
 *   anchor — сначала самый значимый (среди тех, что ещё влезают);
 *   ratio  — лучшее отношение ценности к затраченному времени.
 */
function fill(ctx: FillContext, pool: Candidate[], strategy: "anchor" | "ratio"): void {
  while (ctx.elapsed < ctx.limitMin) {
    let best: { poi: Poi; cost: number; legM: number; legMin: number; value: number } | null = null;

    for (const c of pool) {
      if (ctx.used.has(c.poi.id)) continue;

      const legM = haversine(ctx.curLat, ctx.curLon, c.poi.lat, c.poi.lon);
      const legMin = travelMinutes(legM, ctx.mode);
      const stay = c.poi.avg_visit_min;
      const cost = legMin + stay;

      if (ctx.elapsed + cost > ctx.limitMin) continue;
      if (ctx.spent + c.poi.price_uzs > ctx.budgetCap) continue;
      if (!isOpenAt(c.poi.opening_hours, ctx.startAt + ctx.elapsed + legMin, ctx.day)) continue;

      // Для якорей время осмотра не штрафуем совсем — важна только значимость,
      // а лишние метры до объекта потом сгладит перестановка 2-opt.
      const value =
        strategy === "anchor"
          ? c.score
          : c.score / Math.max(1, legMin + STAY_WEIGHT * stay);

      if (!best || value > best.value) {
        best = { poi: c.poi, cost, legM, legMin, value };
      }
    }

    if (!best) break;

    ctx.used.add(best.poi.id);
    ctx.spent += best.poi.price_uzs;
    ctx.stops.push({
      poi: best.poi,
      order_index: ctx.stops.length,
      arrive_min: ctx.elapsed + best.legMin,
      stay_min: best.poi.avg_visit_min,
      leg_meters: best.legM,
      leg_min: best.legMin,
    });
    ctx.elapsed += best.cost;
    ctx.curLat = best.poi.lat;
    ctx.curLon = best.poi.lon;
  }
}

/**
 * Приводит контекст в соответствие с фактическим содержимым маршрута.
 * Нужен после перестановок и вставок: `fill` продолжает добавлять объекты
 * от последней точки, а её координаты и накопленные время с расходами
 * после этих операций уже другие.
 */
function syncContext(
  ctx: FillContext,
  stops: TourStop[],
  startLat: number,
  startLon: number,
  mode: TransportMode,
): void {
  recompute(stops, startLat, startLon, mode);
  const last = stops.at(-1);
  ctx.stops = stops;
  ctx.used = new Set(stops.map((s) => s.poi.id));
  ctx.spent = stops.reduce((sum, s) => sum + s.poi.price_uzs, 0);
  ctx.elapsed = last ? last.arrive_min + last.stay_min : 0;
  ctx.curLat = last ? last.poi.lat : startLat;
  ctx.curLon = last ? last.poi.lon : startLon;
}

function skipWord(lang: Lang, key: "budget" | "time" | "closed"): string {
  return (SKIP_REASON[lang] ?? SKIP_REASON.en!)[key];
}

/**
 * Текст причины «закрыто» на нужном языке. Ассистенту он нужен, чтобы
 * отличить закрытые объекты в списке пропущенных и объяснить это туристу.
 */
export function closedReasonText(lang: Lang): string {
  return skipWord(lang, "closed");
}

function scoreOf(poi: Poi, themes: Theme[]): number {
  const ratingNorm = Math.max(0, Math.min(1, (poi.rating - 3) / 2));
  const matched = themes.length
    ? poi.themes.filter((t) => themes.includes(t)).length / themes.length
    : 0.5;
  return 0.45 * ratingNorm + 0.35 * poi.popularity + 0.2 * Math.min(1, matched);
}

/** Пересекается ли отрезок [startAt, startAt + minutes] с окном приёма пищи. */
function crossesMealWindow(startAt: number, minutes: number): boolean {
  const end = startAt + minutes;
  return MEAL_WINDOWS.some(([from, to]) => end >= from && startAt <= to);
}

/** Соответствует ли объект хотя бы одной выбранной теме. */
function matchesThemes(poi: Poi, themes: Theme[]): boolean {
  if (themes.length === 0) return true;
  if (themes.includes("free") && poi.is_free === 1) return true;
  return poi.themes.some((t) => themes.includes(t));
}

export interface PlanResult extends Tour {
  /** Пояснение на человеческом языке — используется AI-ассистентом. */
  summary: string;
  /** Что не поместилось и почему. */
  skipped: { name: string; reason: string }[];
}

export function planRoute(req: PlannerRequest): PlanResult | null {
  const city = getCity(req.city, req.lang);
  if (!city) return null;

  const all = listPois({ city: req.city, lang: req.lang });
  const now = new Date();
  const day = now.getDay();
  const startAt = req.startAtMin ?? now.getHours() * 60 + now.getMinutes();
  const budgetCap = BUDGET_CAP[req.budget];

  const startLat = req.startLat ?? city.lat;
  const startLon = req.startLon ?? city.lon;

  // Время на еду резервируем до подбора объектов. Если добавлять обед потом,
  // он выталкивает маршрут за лимит, и подгонка срезает последнюю остановку —
  // а ей вполне может оказаться Регистан. Турист скорее пропустит чайхану,
  // чем главный памятник города.
  const wantsMeal = req.includeMeals !== false;
  const mealReserve =
    wantsMeal && crossesMealWindow(startAt, req.minutes) ? MEAL_RESERVE_MIN : 0;
  const searchMinutes = Math.max(30, req.minutes - mealReserve);

  // 1. Отбор кандидатов -------------------------------------------------
  const skipped: { name: string; reason: string }[] = [];
  const candidates = all
    .filter((p) => {
      if (UTILITY.includes(p.category)) return false;
      if (p.category === "restaurant" || p.category === "cafe") return false;
      if (!matchesThemes(p, req.themes)) return false;
      if (p.price_uzs > budgetCap) {
        skipped.push({ name: p.name, reason: skipWord(req.lang, "budget") });
        return false;
      }
      return true;
    })
    .map((p) => ({ poi: p, score: scoreOf(p, req.themes) }))
    .sort((a, b) => b.score - a.score);

  // 2. Сборка маршрута в две фазы ----------------------------------------
  //
  // Сначала ставим якорные объекты — то, ради чего в город и едут. Отношение
  // «ценность / затраченное время» само по себе их выбрасывает: у Регистана
  // 90 минут осмотра, и по этой метрике он проигрывает мечети на 40 минут
  // буквально сотые доли. Маршрут по Самарканду без Регистана бессмысленен,
  // сколь бы хорош ни был показатель эффективности.
  //
  // Затем оставшееся время заполняем обычным жадным подбором.
  const ctx: FillContext = {
    stops: [],
    used: new Set<number>(),
    curLat: startLat,
    curLon: startLon,
    elapsed: 0,
    spent: 0,
    limitMin: searchMinutes,
    budgetCap,
    startAt,
    day,
    mode: req.mode,
  };

  const anchors = candidates.filter((c) => c.poi.popularity >= ANCHOR_POPULARITY);
  fill(ctx, anchors, "anchor");
  fill(ctx, candidates, "ratio");

  const { stops } = ctx;
  if (stops.length === 0) return null;

  // 3. Улучшение 2-opt --------------------------------------------------
  twoOpt(stops, startLat, startLon);
  // Перестановка сдвинула тайминги — пересчитываем до вставки еды,
  // иначе окно приёма пищи будет искаться по устаревшему времени прибытия.
  recompute(stops, startLat, startLon, req.mode);

  // 4. Вставка остановок на еду -----------------------------------------
  if (wantsMeal) {
    insertMeals(stops, all, req, startAt, day, budgetCap - ctx.spent);
    recompute(stops, startLat, startLon, req.mode);
  }

  // 5. Догоняющий проход --------------------------------------------------
  // Перестановка 2-opt сокращает дорогу, а резерв на обед мог остаться
  // неиспользованным (не нашлось заведения по бюджету). Освободившееся время
  // заполняем — иначе турист получает маршрут на 4,5 часа вместо шести.
  syncContext(ctx, stops, startLat, startLon, req.mode);
  ctx.limitMin = req.minutes;
  fill(ctx, candidates, "ratio");
  twoOpt(stops, startLat, startLon);
  recompute(stops, startLat, startLon, req.mode);

  // 6. Подгонка под лимит времени ----------------------------------------
  trimToBudget(stops, req.minutes, req.themes, startLat, startLon, req.mode);

  const totalMeters = stops.reduce((s, x) => s + x.leg_meters, 0);
  const totalMin =
    stops.length === 0
      ? 0
      : stops[stops.length - 1].arrive_min + stops[stops.length - 1].stay_min;
  const totalCost = stops.reduce((s, x) => s + x.poi.price_uzs, 0);

  // Состав маршрута берём из готового списка остановок, а не из ctx.used:
  // syncContext заменяет там сам объект Set, поэтому любая ссылка, взятая
  // до догоняющего прохода, устаревает — и объект попадал одновременно
  // и в маршрут, и в список «не вошло».
  const included = new Set(stops.map((s) => s.poi.id));

  for (const c of candidates) {
    if (included.has(c.poi.id) || skipped.length >= 6) continue;
    const closed = !opensDuring(c.poi.opening_hours, startAt, req.minutes, day);
    skipped.push({
      name: c.poi.name,
      reason: skipWord(req.lang, closed ? "closed" : "time"),
    });
  }

  return {
    id: null,
    slug: `generated-${city.slug}-${req.minutes}`,
    kind: "generated",
    city_id: city.id,
    city_slug: city.slug,
    title: `${city.name}: маршрут на ${Math.round(req.minutes / 60)} ч`,
    description: null,
    cover: stops[0]?.poi.cover ?? null,
    total_min: totalMin,
    total_meters: totalMeters,
    total_cost_uzs: totalCost,
    mode: req.mode,
    stops,
    summary: buildSummary(city.name, stops, totalMin, totalMeters, totalCost, req),
    skipped: skipped.slice(0, 6),
  };
}

/** Перестановка пар остановок, пока это сокращает общую длину маршрута. */
function twoOpt(stops: TourStop[], startLat: number, startLon: number): void {
  if (stops.length < 4) return;

  const pathLength = (order: TourStop[]) => {
    let total = 0;
    let lat = startLat;
    let lon = startLon;
    for (const s of order) {
      total += haversine(lat, lon, s.poi.lat, s.poi.lon);
      lat = s.poi.lat;
      lon = s.poi.lon;
    }
    return total;
  };

  let current = [...stops];
  let currentLength = pathLength(current);
  let improved = true;
  let guard = 0;

  while (improved && guard++ < 50) {
    improved = false;
    for (let i = 0; i < current.length - 1 && !improved; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const trial = [
          ...current.slice(0, i),
          ...current.slice(i, j + 1).reverse(),
          ...current.slice(j + 1),
        ];
        const trialLength = pathLength(trial);
        // Порог в 1 метр защищает от бесконечного цикла на равных вариантах.
        if (trialLength < currentLength - 1) {
          current = trial;
          currentLength = trialLength;
          improved = true;
          break;
        }
      }
    }
  }

  stops.splice(0, stops.length, ...current);
}

/**
 * Если маршрут пересекает обеденное или вечернее окно — вставляем ближайшее
 * подходящее по бюджету заведение сразу после текущей остановки.
 */
function insertMeals(
  stops: TourStop[],
  all: Poi[],
  req: PlannerRequest,
  startAt: number,
  day: number,
  budgetLeft: number,
): void {
  const eateries = all.filter(
    (p) => (p.category === "restaurant" || p.category === "cafe") && p.price_uzs <= Math.max(0, budgetLeft),
  );
  if (eateries.length === 0) return;

  for (const [from, to] of MEAL_WINDOWS) {
    const routeStart = startAt;
    const routeEnd = startAt + (stops.at(-1)?.arrive_min ?? 0) + (stops.at(-1)?.stay_min ?? 0);
    if (routeEnd < from || routeStart > to) continue;
    if (stops.some((s) => s.poi.category === "restaurant" || s.poi.category === "cafe")) continue;

    // Остановка, после которой турист попадает в окно приёма пищи.
    let idx = stops.findIndex((s) => startAt + s.arrive_min + s.stay_min >= from);
    if (idx === -1) idx = stops.length - 1;
    const anchor = stops[idx];

    let best: Poi | null = null;
    let bestD = Infinity;
    for (const e of eateries) {
      if (!isOpenAt(e.opening_hours, from + 30, day)) continue;
      const d = haversine(anchor.poi.lat, anchor.poi.lon, e.lat, e.lon);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (!best) continue;

    stops.splice(idx + 1, 0, {
      poi: best,
      order_index: idx + 1,
      arrive_min: 0,
      stay_min: best.avg_visit_min,
      leg_meters: 0,
      leg_min: 0,
      note: "остановка на обед",
    });
  }
}

/**
 * Подгоняет маршрут под отведённое время — страховка на случай, если после
 * 2-opt и вставки обеда он всё же не уложился.
 *
 * Убираем не последнюю остановку, а наименее ценную: иначе под нож попадает
 * то, что оказалось в конце после геометрической перестановки, и турист
 * теряет главный объект города ради проходного.
 */
function trimToBudget(
  stops: TourStop[],
  minutes: number,
  themes: Theme[],
  startLat: number,
  startLon: number,
  mode: PlannerRequest["mode"],
): void {
  const total = () => {
    const last = stops.at(-1);
    return last ? last.arrive_min + last.stay_min : 0;
  };

  while (stops.length > 1 && total() > minutes) {
    let worstIndex = -1;
    let worstScore = Infinity;
    stops.forEach((s, i) => {
      // Остановку на еду убираем в первую очередь — она добавочная.
      const score = s.note ? -1 : scoreOf(s.poi, themes);
      if (score < worstScore) {
        worstScore = score;
        worstIndex = i;
      }
    });
    stops.splice(worstIndex, 1);
    recompute(stops, startLat, startLon, mode);
  }
}

/** Пересчёт порядка, расстояний и таймингов после всех модификаций. */
function recompute(
  stops: TourStop[],
  startLat: number,
  startLon: number,
  mode: PlannerRequest["mode"],
): void {
  let lat = startLat;
  let lon = startLon;
  let elapsed = 0;
  stops.forEach((s, i) => {
    const legM = haversine(lat, lon, s.poi.lat, s.poi.lon);
    const legMin = travelMinutes(legM, mode);
    s.order_index = i;
    s.leg_meters = legM;
    s.leg_min = legMin;
    s.arrive_min = elapsed + legMin;
    elapsed = s.arrive_min + s.stay_min;
    lat = s.poi.lat;
    lon = s.poi.lon;
  });
}

/** Способ передвижения словами — для человекочитаемой сводки маршрута. */
const MODE_WORD: Partial<Record<Lang, Record<TransportMode, string>>> = {
  ru: { walk: "пешком", taxi: "на такси", car: "на машине" },
  uz: { walk: "piyoda", taxi: "taksida", car: "mashinada" },
  en: { walk: "on foot", taxi: "by taxi", car: "by car" },
};

interface SummaryParts {
  cityName: string;
  time: string;
  modeWord: string;
  names: string;
  distance: string;
  cost: string;
}

/**
 * Сводка маршрута одной фразой. Каждый язык собирает предложение по своим
 * правилам порядка слов, поэтому это функции, а не шаблон с подстановкой.
 */
/** Причины, по которым объект не попал в маршрут — показываются туристу. */
const SKIP_REASON: Partial<Record<Lang, { budget: string; time: string; closed: string }>> = {
  ru: {
    budget: "не проходит по бюджету",
    time: "не хватило времени",
    closed: "закрыт в это время",
  },
  uz: {
    budget: "byudjetga sig'maydi",
    time: "vaqt yetmadi",
    closed: "bu vaqtda yopiq",
  },
  en: {
    budget: "over budget",
    time: "not enough time",
    closed: "closed at this time",
  },
};

/**
 * Открыт ли объект хотя бы в какой-то момент внутри окна поездки.
 * Нужно, чтобы отличить «не поместилось по времени» от «закрыто»: вечером
 * первая причина звучит абсурдно — турист видит пустой маршрут и не понимает,
 * что дело просто в часах работы.
 */
function opensDuring(
  hours: OpeningHours | null,
  startAt: number,
  minutes: number,
  day: number,
): boolean {
  if (!hours) return true;
  for (let t = 0; t <= minutes; t += 30) {
    if (isOpenAt(hours, startAt + t, day)) return true;
  }
  return isOpenAt(hours, startAt + minutes, day);
}

const SUMMARY: Partial<Record<Lang, (p: SummaryParts) => string>> = {
  ru: (p) =>
    `${p.cityName}, ${p.time} ${p.modeWord}: ${p.names}. ` +
    `Всего ${p.distance}, вход — ${p.cost}.`,
  uz: (p) =>
    `${p.cityName}, ${p.time} ${p.modeWord}: ${p.names}. ` +
    `Jami ${p.distance}, kirish — ${p.cost}.`,
  en: (p) =>
    `${p.cityName}, ${p.time} ${p.modeWord}: ${p.names}. ` +
    `${p.distance} in total, entry — ${p.cost}.`,
};

function buildSummary(
  cityName: string,
  stops: TourStop[],
  totalMin: number,
  totalMeters: number,
  totalCost: number,
  req: PlannerRequest,
): string {
  const modeWord = (MODE_WORD[req.lang] ?? MODE_WORD.en!)[req.mode];
  const names = stops.map((s) => s.poi.name).join(" → ");
  const time = formatDuration(totalMin, req.lang);
  const distance = formatDistance(totalMeters, req.lang);
  const cost = formatPrice(totalCost, req.lang);

  const build = SUMMARY[req.lang] ?? SUMMARY.en!;
  return build({ cityName, time, modeWord, names, distance, cost });
}
