import {
  ADS,
  EVENTS,
  HOTELS,
  PLACES,
  POPULAR_CITIES,
  RESTAURANTS,
  ROUTES,
  UZ_CITIES,
} from "./content";
import { GREEN } from "@/lib/theme";
import type {
  Content,
  ManagedCity,
  ManagedAd,
  ManagedEvent,
  ManagedHotel,
  ManagedPlace,
  ManagedRestaurant,
  ManagedRoute,
} from "@/lib/types";

/**
 * Начальное содержимое платформы.
 *
 * Витринные поля берутся из макета как есть, управленческие
 * достраиваются здесь. Значения выводятся из уже имеющихся — рейтинга,
 * цены, числа отзывов, — а не задаются случайно: иначе номерной фонд
 * менялся бы при каждой пересборке, и отчёты в панели не сходились бы
 * сами с собой.
 *
 * Это именно семена: после первой правки в панели источником становится
 * сохранённое содержимое, а сюда больше не заглядывают.
 */

/** Числа из строки цены: "$5–15" → 5, "$89" → 89, "Бесплатно" → 0. */
function priceNumber(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

/** Устойчивый идентификатор из названия — чтобы не зависеть от порядка. */
function slug(value: string, index: number): string {
  return `${index + 1}-${value.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").slice(0, 32)}`;
}

const cities: ManagedCity[] = UZ_CITIES.map((name, i) => {
  const popular = POPULAR_CITIES.find((c) => c.name === name);
  return {
    id: slug(name, i),
    name,
    sub: popular?.sub ?? "Узбекистан",
    region: name === "Чарвак" ? "Ташкентская область" : `${name}ская область`,
    img: popular?.img ?? POPULAR_CITIES[i % POPULAR_CITIES.length].img,
    rating: popular?.rating ?? 4.5,
    // Числа демонстрационные: настоящие подставит редактор в панели.
    population: 0,
    tourists: 0,
    highlights: [],
    description: popular?.sub ?? "",
    featured: Boolean(popular),
    status: "active",
  };
});

const places: ManagedPlace[] = PLACES.map((p, i) => ({
  ...p,
  id: slug(p.id, i),
  region: p.city,
  // Отзывы — единственный честный след посещаемости, который у нас есть.
  visits: p.reviews * 3,
  tours: ROUTES.filter((r) => r.stops.some((s) => s.name === p.name)).length,
  status: "active",
}));

const hotels: ManagedHotel[] = HOTELS.map((h, i) => {
  const priceFrom = priceNumber(h.price);
  // Звёзды по цене: дешёвые — три, дороже сотни — пять.
  const stars = priceFrom >= 110 ? 5 : priceFrom >= 70 ? 4 : 3;
  const rooms = 20 + stars * 24;
  return {
    ...h,
    id: slug(h.id, i),
    stars,
    rooms,
    // Занятость привязана к рейтингу: у сильного отеля номера разбирают.
    occupied: Math.round(rooms * (h.rating / 5) * 0.92),
    priceFrom,
    status: "active",
  };
});

const restaurants: ManagedRestaurant[] = RESTAURANTS.map((r, i) => {
  const from = priceNumber(r.price);
  return {
    ...r,
    id: slug(r.id, i),
    priceRange: from >= 10 ? "$$$" : from >= 5 ? "$$" : "$",
    seats: 40 + (i % 5) * 20,
    status: "active",
    promoted: false,
    monthlyViews: r.reviews,
    phone: "",
    address: "",
  };
});

const routes: ManagedRoute[] = ROUTES.map((r, i) => ({
  ...r,
  id: slug(r.id, i),
  // Цена маршрута — из подписи вида «5 мест · 12 км · ~$26».
  price: priceNumber(r.sub.split("·").pop() ?? "0"),
  difficulty: r.stops.length > 12 ? "Сложный" : r.stops.length > 6 ? "Средний" : "Лёгкий",
  category: r.badge,
  bookings: 0,
  maxGroup: 16,
  guide: "",
  nextDep: "",
  rating: 4.7,
  status: "active",
}));

const events: ManagedEvent[] = EVENTS.map((e, i) => ({
  id: slug(e.name, i),
  name: e.name,
  city: e.city,
  date: e.date,
  endDate: e.date,
  venue: e.city,
  category: "Фестиваль",
  capacity: 0,
  ticketsSold: 0,
  emoji: e.emoji,
  color: e.color ?? GREEN,
  desc: e.desc,
  img: POPULAR_CITIES[i % POPULAR_CITIES.length].img,
  price: 0,
  featured: i === 0,
  status: "active",
}));

const ads: ManagedAd[] = ADS.map((a, i) => ({
  ...a,
  advertiser: a.title,
  type: "banner",
  target: "Все города",
  // Кампании заводит рекламодатель — здесь только сам креатив.
  budget: 0,
  spent: 0,
  clicks: 0,
  impressions: 0,
  status: "active",
  startDate: "",
  endDate: "",
  bid: 0,
}));

export const SEED: Content = { cities, places, hotels, restaurants, routes, events, ads };
