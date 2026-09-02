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
