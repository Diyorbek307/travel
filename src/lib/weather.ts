import type { IconName } from "./icon-paths";
import type { Lang } from "./types";

/**
 * Прогноз погоды по городу.
 *
 * Источник — Open-Meteo: без ключа, без регистрации, с готовым почасовым
 * прогнозом на неделю. Данные модели, а не наблюдений, поэтому в интерфейсе
 * это «прогноз», а не «погода сейчас».
 *
 * Лицензия: свободное использование в некоммерческих проектах с указанием
 * источника; для коммерческого запуска нужен их платный тариф. Пока платформа
 * не зарабатывает, это допустимо, но перед монетизацией придётся вернуться
 * к этому вопросу — см. раздел про нетехнические решения в ARCHITECTURE.md.
 */

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

/** Погода — приятное дополнение: её отказ не должен ронять страницу города. */
const EMPTY: Forecast = { days: [], now: null };

/** Прогноз обновляется раз в полчаса: чаще модель всё равно не считает. */
const CACHE_SECONDS = 1800;

/*
 * Сколько ждём ответа сервиса погоды.
 *
 * Без ограничения зависший внешний запрос держал всю страницу: главный
 * экран ждёт погоду перед отрисовкой, и один медленный ответ Open-Meteo
 * превращался в тридцать секунд белого экрана. Погода — приятное
 * дополнение, а не содержимое платформы: лучше показать город без
 * градусов, чем не показать ничего.
 */
const TIMEOUT_MS = 2500;

export interface WeatherHour {
  /** Местное время в часах, 0–23. */
  hour: number;
  temp: number;
  icon: IconName;
}

export interface WeatherDay {
  /** Дата в формате YYYY-MM-DD по местному времени города. */
  date: string;
  max: number;
  min: number;
  icon: IconName;
  code: number;
  hours: WeatherHour[];
}

/**
 * Коды погоды ВМО сведены к шести состояниям.
 *
 * Различать морось и слабый дождь в путеводителе незачем: турист решает,
 * брать ли зонт, а не изучает синоптику.
 */
function describe(code: number): { icon: IconName; key: string } {
  if (code === 0) return { icon: "sun", key: "clear" };
  if (code <= 2) return { icon: "cloud-sun", key: "partly" };
  if (code === 3) return { icon: "cloud", key: "cloudy" };
  if (code <= 48) return { icon: "fog", key: "fog" };
  if (code <= 67) return { icon: "rain", key: "rain" };
  if (code <= 77) return { icon: "snow", key: "snow" };
  if (code <= 82) return { icon: "rain", key: "rain" };
  if (code <= 86) return { icon: "snow", key: "snow" };
  return { icon: "storm", key: "storm" };
}

const CONDITION: Record<string, Partial<Record<Lang, string>>> = {
  clear: { ru: "Ясно", uz: "Ochiq", en: "Clear" },
  partly: { ru: "Переменная облачность", uz: "Bulutli ochiq", en: "Partly cloudy" },
  cloudy: { ru: "Облачно", uz: "Bulutli", en: "Cloudy" },
  fog: { ru: "Туман", uz: "Tuman", en: "Fog" },
  rain: { ru: "Дождь", uz: "Yomg'ir", en: "Rain" },
  snow: { ru: "Снег", uz: "Qor", en: "Snow" },
  storm: { ru: "Гроза", uz: "Momaqaldiroq", en: "Thunderstorm" },
};

export function conditionLabel(code: number, lang: Lang): string {
  const { key } = describe(code);
  return CONDITION[key][lang] ?? CONDITION[key].en!;
}

export function weatherIcon(code: number): IconName {
  return describe(code).icon;
}

export interface Forecast {
  days: WeatherDay[];
  /** Текущий час по местному времени города и погода в нём. */
  now: { hour: number; temp: number; code: number } | null;
}

interface OpenMeteoResponse {
  utc_offset_seconds?: number;
  hourly?: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

/**
 * Прогноз на неделю вперёд с разбивкой по часам.
 *
 * Возвращает пустой массив, если сервис недоступен: погода — приятное
 * дополнение, и её отсутствие не должно ронять страницу города.
 */
export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const url =
    `${ENDPOINT}?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
    "&hourly=temperature_2m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=auto&forecast_days=7";

  try {
    const response = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return EMPTY;

    const data = (await response.json()) as OpenMeteoResponse;
    const daily = data.daily;
    const hourly = data.hourly;
    if (!daily?.time?.length) return EMPTY;

    // Часы разложены сплошным рядом на всю неделю — раскладываем по датам.
    const byDate = new Map<string, WeatherHour[]>();
    if (hourly?.time) {
      hourly.time.forEach((stamp, i) => {
        const [date, time] = stamp.split("T");
        const list = byDate.get(date) ?? [];
        list.push({
          hour: Number(time.slice(0, 2)),
          temp: Math.round(hourly.temperature_2m[i]),
          icon: weatherIcon(hourly.weather_code[i]),
        });
        byDate.set(date, list);
      });
    }

    const days = daily.time.map((date, i) => ({
      date,
      max: Math.round(daily.temperature_2m_max[i]),
      min: Math.round(daily.temperature_2m_min[i]),
      code: daily.weather_code[i],
      icon: weatherIcon(daily.weather_code[i]),
      hours: byDate.get(date) ?? [],
    }));

    // Местное время города, а не браузера: турист смотрит погоду там,
    // куда едет, и часовой пояс у него может быть другой.
    let now: Forecast["now"] = null;
    if (hourly?.time) {
      const offset = (data.utc_offset_seconds ?? 0) * 1000;
      const local = new Date(Date.now() + offset).toISOString().slice(0, 13);
      const index = hourly.time.findIndex((stamp) => stamp.slice(0, 13) === local);
      if (index >= 0) {
        now = {
          hour: Number(local.slice(11, 13)),
          temp: Math.round(hourly.temperature_2m[index]),
          code: hourly.weather_code[index],
        };
      }
    }

    return { days, now };
  } catch {
    return EMPTY;
  }
}

const WEEKDAY: Record<Lang, string[]> = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  uz: ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
} as Record<Lang, string[]>;

/** Короткое имя дня недели; сегодняшний день подписывается отдельно. */
export function dayLabel(date: string, lang: Lang, today: string): string {
  if (date === today) {
    return { ru: "Сегодня", uz: "Bugun", en: "Today" }[lang as "ru"] ?? "Today";
  }
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return (WEEKDAY[lang] ?? WEEKDAY.en)[weekday];
}

export interface CurrentWeather {
  temp: number;
  code: number;
}

/**
 * Погода сразу для нескольких точек одним запросом.
 *
 * Open-Meteo принимает списки координат и возвращает массив ответов.
 * Четырнадцать отдельных запросов на список городов были бы и медленно,
 * и невежливо по отношению к бесплатному сервису.
 *
 * Порядок ответов соответствует порядку точек; на любую ошибку возвращается
 * массив из null — карточки просто останутся без температуры.
 */
export async function getCurrentBatch(
  points: { lat: number; lon: number }[],
): Promise<(CurrentWeather | null)[]> {
  if (!points.length) return [];

  const url =
    `${ENDPOINT}?latitude=${points.map((p) => p.lat.toFixed(3)).join(",")}` +
    `&longitude=${points.map((p) => p.lon.toFixed(3)).join(",")}` +
    "&current=temperature_2m,weather_code&timezone=auto";

  try {
    const response = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return points.map(() => null);

    const data = await response.json();
    // Для одной точки сервис отдаёт объект, для нескольких — массив.
    const list = Array.isArray(data) ? data : [data];

    return points.map((_, i) => {
      const current = list[i]?.current;
      if (!current || typeof current.temperature_2m !== "number") return null;
      return {
        temp: Math.round(current.temperature_2m),
        code: Number(current.weather_code ?? 0),
      };
    });
  } catch {
    return points.map(() => null);
  }
}
