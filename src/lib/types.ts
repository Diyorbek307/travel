export type Tab = "home" | "explore" | "map" | "audio" | "profile";

export interface Place {
  id: string;
  name: string;
  city: string;
  type: string;
  rating: number;
  reviews: number;
  distance: string;
  entry: string;
  hours: string;
  img: string;
  desc: string;
  audio: boolean;
  qr: boolean;
}

export interface RouteStop {
  time: string;
  name: string;
  dur: string;
  note: string;
  entry: string;
}

export interface Route {
  id: string;
  title: string;
  sub: string;
  duration: string;
  icon: string;
  color: string;
  badge: string;
  stops: RouteStop[];
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  price: string;
  tag: string;
  img: string;
  desc: string;
  facilities: string[];
  imgs: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine: string;
  rating: number;
  reviews: number;
  price: string;
  open: string;
  img: string;
  desc: string;
}

/** Карточка в колоде на главной — одна форма и для городов, и для мест. */
export interface DeckItem {
  img: string;
  title: string;
  sub: string;
  badge: string;
  badgeColor: string;
  stat1: string;
  stat1l: string;
  stat2: string;
  stat2l: string;
  stat3: string;
  stat3l: string;
  price: string;
  pricel: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  time: string;
}

/* ------------------------------------------------------------------ */
/* Общие записи                                                       */
/* ------------------------------------------------------------------ */

/**
 * Витрина и управление — одна запись.
 *
 * У приложения и админки разный интерес к одному отелю: турист смотрит
 * фотографии, описание и удобства, администратор — номерной фонд,
 * занятость и статус. Держать это двумя списками значит однажды
 * разойтись, поэтому поля лежат вместе, а каждая сторона берёт своё.
 */

export type EntityStatus = "active" | "draft" | "suspended";

export interface ManagedHotel extends Hotel {
  stars: number;
  rooms: number;
  occupied: number;
  /** Цена числом — для сортировок и отчётов; витрине идёт `price`. */
  priceFrom: number;
  status: EntityStatus | "maintenance";
}

export interface ManagedRestaurant extends Restaurant {
  priceRange: "$" | "$$" | "$$$";
  seats: number;
  status: EntityStatus | "pending";
  /** Платное размещение поднимает заведение в списках приложения. */
  promoted: boolean;
  monthlyViews: number;
  phone: string;
  address: string;
}

export interface ManagedPlace extends Place {
  region: string;
  visits: number;
  /** Сколько маршрутов ведут сюда. */
  tours: number;
  status: EntityStatus | "seasonal";
}

export interface ManagedRoute extends Route {
  price: number;
  difficulty: string;
  category: string;
  bookings: number;
  maxGroup: number;
  guide: string;
  /** Ближайший выход группы. */
  nextDep: string;
  rating: number;
  status: EntityStatus | "paused";
}

export interface ManagedCity {
  id: string;
  name: string;
  sub: string;
  region: string;
  img: string;
  rating: number;
  population: number;
  tourists: number;
  highlights: string[];
  description: string;
  featured: boolean;
  status: EntityStatus;
}

export interface ManagedEvent {
  id: string;
  name: string;
  city: string;
  date: string;
  endDate: string;
  venue: string;
  category: string;
  capacity: number;
  ticketsSold: number;
  emoji: string;
  color: string;
  desc: string;
  img: string;
  price: number;
  featured: boolean;
  status: EntityStatus | "upcoming" | "cancelled" | "past";
}

/**
 * Рекламное объявление.
 *
 * Креатив (что видит турист) и кампания (бюджет, показы, ставка) — одна
 * запись: иначе остановленная в панели кампания продолжала бы крутить
 * баннер в приложении.
 */
export interface ManagedAd {
  id: string;
  advertiser: string;
  type: "banner" | "spotlight" | "top_listing" | "push";
  target: string;
  budget: number;
  spent: number;
  clicks: number;
  impressions: number;
  status: "active" | "paused" | "ended" | "pending";
  startDate: string;
  endDate: string;
  bid: number;
  /* Креатив для приложения. */
  emoji: string;
  label: string;
  title: string;
  sub: string;
  cta: string;
  color: string;
}

/** Всё содержимое платформы одним объектом — его отдаёт и принимает API. */
export interface Content {
  cities: ManagedCity[];
  places: ManagedPlace[];
  hotels: ManagedHotel[];
  restaurants: ManagedRestaurant[];
  routes: ManagedRoute[];
  events: ManagedEvent[];
  ads: ManagedAd[];
}

export type ContentKey = keyof Content;

/** Турист без секретов — то, что отдаёт сервер и показывает приложение. */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  country: string;
  phone: string;
  createdAt: string;
  lastSeenAt: string;
}

export type BookingKind = "hotel" | "restaurant" | "tour";
