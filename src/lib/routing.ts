import type { Geo } from "@/lib/types";

/**
 * Настоящий маршрут по дорогам.
 *
 * Прямая линия между двумя точками — честно, но бесполезно: по ней нельзя
 * ни свернуть, ни посчитать время. Настоящий маршрут умеет считать только
 * тот, у кого есть дорожный граф, то есть все улицы страны с их
 * направлениями, запретами поворотов и скоростями. Своего такого графа у
 * нас нет и быть не может: это отдельный продукт размером с сам проект.
 *
 * Поэтому маршрут спрашиваем у чужого движка. Их два вида:
 *
 *  - OpenRouteService — чужой сервер, свободный ключ, потолок запросов в
 *    сутки. Подключается за минуту, годится, пока людей немного.
 *  - OSRM или Valhalla своим сервером — тот же движок, но на нашей машине
 *    и на данных OpenStreetMap по Узбекистану. Без потолка и без чужого
 *    согласия, но нужен работающий сервер с парой гигабайт памяти.
 *
 * Обе говорят на разных языках, поэтому здесь они сведены к одному ответу.
 * Если ни одна не настроена, возвращаем null — и экран рисует прямую и
 * прямо об этом пишет. Молча подсовывать прямую вместо дороги нельзя:
 * человек по ней рассчитает время выезда.
 *
 * Ключи живут только на сервере. Отданный в браузер ключ выберут за день.
 */

export type Способ = "авто" | "пешком";

export interface Маршрут {
  /** Линия дороги: то, что рисуется на карте. */
  точки: Geo[];
  метры: number;
  секунды: number;
  /** Кто посчитал — показываем человеку, чтобы он знал, чему верит. */
  источник: string;
}

/** Дальше этого не спрашиваем: чужой сервер отвечает, а человек ждёт. */
const ЖДЁМ_МС = 8000;

/** Своего сервера может не быть, чужой может лежать — держим оба варианта. */
function настройка(способ: Способ) {
  /*
   * У OSRM способ передвижения зашит в сам сервер при сборке данных:
   * один сервер считает только на машине, другой только пешком. Адрес в
   * запросе на это не влияет — сервер молча ответит своим профилем.
   * Проверено на публичном демо-сервере: на пеший запрос он вернул
   * автомобильный маршрут, и «пешком 12 минут» на семи километрах было бы
   * прямой ложью. Поэтому пеший OSRM — только отдельным адресом.
   */
  const свой = способ === "пешком" ? process.env.OSRM_FOOT_URL : process.env.OSRM_URL;
  const адрес = свой?.replace(/\/+$/, "");
  if (адрес) return { вид: "osrm" as const, адрес };

  // OpenRouteService различает профили сам, ему достаточно одного ключа.
  const ключ = process.env.ORS_API_KEY;
  if (ключ) return { вид: "ors" as const, ключ };

  return null;
}

/** Способы, которые мы действительно умеем считать. */
export function доступныеСпособы(): Способ[] {
  return (["авто", "пешком"] as const).filter((с) => настройка(с) !== null);
}

export function маршрутыДоступны(): boolean {
  return доступныеСпособы().length > 0;
}

/**
 * Кэш. Одни и те же две точки спрашивают снова и снова: человек уходит с
 * экрана и возвращается. У свободного ключа запросы считаные, тратить их
 * на повтор нельзя.
 */
const кэш = new Map<string, { маршрут: Маршрут | null; до: number }>();
const ЖИВЁТ_МС = 30 * 60 * 1000;
const ПОМНИМ = 500;

function ключКэша(a: Geo, b: Geo, способ: Способ) {
  // Округление до пяти знаков — это метр. Точнее кэшировать нечего.
  const т = (г: Geo) => `${г.lat.toFixed(5)},${г.lon.toFixed(5)}`;
  return `${способ}|${т(a)}|${т(b)}`;
}

async function запрос(url: string, init: RequestInit): Promise<unknown | null> {
  const стоп = AbortSignal.timeout(ЖДЁМ_МС);
  try {
    const ответ = await fetch(url, { ...init, signal: стоп });
    if (!ответ.ok) return null;
    return await ответ.json();
  } catch {
    return null;
  }
}

/** OSRM и Valhalla отдают GeoJSON: долгота первой, широта второй. */
function изGeoJson(координаты: unknown): Geo[] | null {
  if (!Array.isArray(координаты)) return null;
  const точки: Geo[] = [];
  for (const пара of координаты) {
    if (!Array.isArray(пара) || пара.length < 2) continue;
    const [lon, lat] = пара;
    if (typeof lon !== "number" || typeof lat !== "number") continue;
    точки.push({ lat, lon });
  }
  return точки.length >= 2 ? точки : null;
}

async function черезOsrm(адрес: string, откуда: Geo, куда: Geo): Promise<Маршрут | null> {
  // Профиль задан самим сервером, в адресе он ничего не значит.
  const профиль = "driving";
  const пары = `${откуда.lon},${откуда.lat};${куда.lon},${куда.lat}`;
  const url = `${адрес}/route/v1/${профиль}/${пары}?overview=full&geometries=geojson`;

  const ответ = (await запрос(url, { method: "GET" })) as
    | { routes?: { distance?: number; duration?: number; geometry?: { coordinates?: unknown } }[] }
    | null;

  const первый = ответ?.routes?.[0];
  if (!первый) return null;

  const точки = изGeoJson(первый.geometry?.coordinates);
  if (!точки) return null;

  return {
    точки,
    метры: Math.round(первый.distance ?? 0),
    секунды: Math.round(первый.duration ?? 0),
    источник: "OSRM",
  };
}

async function черезOrs(ключ: string, откуда: Geo, куда: Geo, способ: Способ): Promise<Маршрут | null> {
  const профиль = способ === "пешком" ? "foot-walking" : "driving-car";
  const url = `https://api.openrouteservice.org/v2/directions/${профиль}/geojson`;

  const ответ = (await запрос(url, {
    method: "POST",
    headers: { Authorization: ключ, "Content-Type": "application/json" },
    body: JSON.stringify({
      coordinates: [
        [откуда.lon, откуда.lat],
        [куда.lon, куда.lat],
      ],
    }),
  })) as
    | {
        features?: {
          geometry?: { coordinates?: unknown };
          properties?: { summary?: { distance?: number; duration?: number } };
        }[];
      }
    | null;

  const первый = ответ?.features?.[0];
  if (!первый) return null;

  const точки = изGeoJson(первый.geometry?.coordinates);
  if (!точки) return null;

  const итог = первый.properties?.summary;
  return {
    точки,
    метры: Math.round(итог?.distance ?? 0),
    секунды: Math.round(итог?.duration ?? 0),
    источник: "OpenRouteService",
  };
}

export async function построитьМаршрут(
  откуда: Geo,
  куда: Geo,
  способ: Способ = "авто",
): Promise<Маршрут | null> {
  const н = настройка(способ);
  if (!н) return null;

  const к = ключКэша(откуда, куда, способ);
  const было = кэш.get(к);
  if (было && было.до > Date.now()) return было.маршрут;

  const маршрут =
    н.вид === "osrm"
      ? await черезOsrm(н.адрес, откуда, куда)
      : await черезOrs(н.ключ, откуда, куда, способ);

  // Неудачу тоже помним, но недолго: иначе при лежащем сервере каждый
  // повторный заход снова упирается в восьмисекундное ожидание.
  кэш.set(к, { маршрут, до: Date.now() + (маршрут ? ЖИВЁТ_МС : 60_000) });
  if (кэш.size > ПОМНИМ) {
    const первый = кэш.keys().next().value;
    if (первый !== undefined) кэш.delete(первый);
  }

  return маршрут;
}
