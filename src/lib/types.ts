/** Доменные типы платформы. Общие для сервера, клиента и будущих мобильных приложений. */

/** Языки интерфейса и аудиогидов. MVP запускается на первых трёх (п. 19 ТЗ). */
export const LANGS = ["ru", "uz", "en", "zh", "ko", "tr", "fr", "de", "ja", "ar"] as const;
export type Lang = (typeof LANGS)[number];
export const MVP_LANGS: Lang[] = ["ru", "uz", "en"];

/**
 * Категории объектов — ровно список слоёв карты из п. 2.1 ТЗ.
 * Один тип сущности = один слой карты = один фильтр.
 */
export const CATEGORIES = [
  "landmark",
  "museum",
  "religious",
  "nature",
  "restaurant",
  "cafe",
  "rest_zone",
  "hotel",
  "bazaar",
  "craft",
  "toilet",
  "station",
  "airport",
  "transport",
] as const;
export type Category = (typeof CATEGORIES)[number];


/** Тематические фильтры карты (п. 9 ТЗ) — надстройка над категориями. */
export const THEMES = [
  "history",
  "architecture",
  "museums",
  "islamic",
  "nature",
  "food",
  "entertainment",
  "family",
  "crafts",
  "shopping",
  "free",
] as const;
export type Theme = (typeof THEMES)[number];

export type TransportMode = "walk" | "taxi" | "car";
export type Budget = "low" | "medium" | "high";

/** Часы работы: по дню недели (0 = воскресенье). null = выходной. */
export type OpeningHours = {
  [day: string]: { open: string; close: string } | null;
};

export interface City {
  id: number;
  slug: string;
  lat: number;
  lon: number;
  zoom: number;
  cover: string | null;
  is_active: number;
  name: string;
  description: string | null;
}

export interface Poi {
  id: number;
  city_id: number;
  city_slug?: string;
  slug: string;
  category: Category;
  themes: Theme[];
  lat: number;
  lon: number;
  price_uzs: number;
  is_free: number;
  opening_hours: OpeningHours | null;
  avg_visit_min: number;
  rating: number;
  popularity: number;
  cover: string | null;
  phone: string | null;
  website: string | null;
  is_active: number;
  /** Поля из poi_translations, подставленные для запрошенного языка. */
  name: string;
  short_desc: string | null;
  full_story: string | null;
  /** Аудиогид на запрошенном языке, если записан. */
  audio_url?: string | null;
  audio_duration_sec?: number | null;
  qr_code?: string | null;
  /**
   * Платное размещение в топе (только рестораны/кафе/зоны отдыха, из
   * venue_details). 0 у всех остальных категорий — влияет на сортировку
   * везде, где вызывается listPois, без отдельной логики ранжирования.
   */
  sponsored_priority?: number;
}

/** Заявка на столик — не подтверждённая бронь, администратор перезванивает сам. */
export interface Reservation {
  id: number;
  poi_id: number;
  name: string;
  phone: string;
  party_size: number;
  requested_at: string;
  note: string | null;
  status: "new" | "confirmed" | "declined";
  created_at: string;
}

export interface Museum {
  id: number;
  poi_id: number;
  name: string;
  exhibit_count: number;
}

export interface Exhibit {
  id: number;
  museum_id: number;
  number: string;
  period: string | null;
  origin: string | null;
  cover: string | null;
  name: string;
  short_desc: string | null;
  full_story: string | null;
  audio_url?: string | null;
  audio_duration_sec?: number | null;
  qr_code?: string | null;
}

export interface TourStop {
  poi: Poi;
  order_index: number;
  /** Минут от старта до прибытия на объект. */
  arrive_min: number;
  /** Сколько минут провести на объекте. */
  stay_min: number;
  /** Расстояние от предыдущей точки, метров. */
  leg_meters: number;
  /** Время в пути от предыдущей точки, минут. */
  leg_min: number;
  /** Пояснение, почему объект попал в маршрут (для AI-ответа). */
  note?: string;
}

export interface Tour {
  id: number | null;
  slug: string;
  kind: "curated" | "generated" | "user";
  city_id: number;
  city_slug?: string;
  title: string;
  description: string | null;
  cover: string | null;
  total_min: number;
  total_meters: number;
  total_cost_uzs: number;
  mode: TransportMode;
  stops: TourStop[];
}

export interface PlannerRequest {
  city: string;
  /** Доступное время в минутах. */
  minutes: number;
  themes: Theme[];
  budget: Budget;
  mode: TransportMode;
  lang: Lang;
  /** Стартовая точка — позиция туриста; если нет, берётся центр города. */
  startLat?: number;
  startLon?: number;
  /** Время старта в минутах от полуночи; по умолчанию — текущее. */
  startAtMin?: number;
  /** Включать ли остановки на еду. */
  includeMeals?: boolean;
}

/** Событие обезличенной аналитики (п. 17 ТЗ). */
export type EventType =
  | "city_open"
  | "poi_open"
  | "qr_scan"
  | "audio_start"
  | "audio_complete"
  | "route_generated"
  | "tour_open"
  | "favorite_add"
  | "gps_nearby_shown"
  | "offline_download"
  | "reservation_request";
