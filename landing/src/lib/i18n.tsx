"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Два языка лендинга: русский (для партнёров и жителей) и английский (для
 * туристов). Выбор запоминается; по умолчанию — язык браузера.
 */

export type Язык = "ru" | "en";

export const APP_URL = "https://uzbekistan-travel.onrender.com";

const T = {
  nav_cities: { ru: "Города", en: "Cities" },
  nav_features: { ru: "Возможности", en: "Features" },
  nav_demo: { ru: "Приложение", en: "The app" },
  nav_quiz: { ru: "Маршрут", en: "Route" },
  open_app: { ru: "Открыть HelloUZ", en: "Open HelloUZ" },

  hero_kicker: { ru: "Путеводитель по Узбекистану", en: "Your guide to Uzbekistan" },
  hero_title_1: { ru: "Узбекистан,", en: "Uzbekistan," },
  hero_title_2: { ru: "который хочется", en: "the way you want" },
  hero_title_3: { ru: "прожить", en: "to live it" },
  hero_sub: {
    ru: "Места, отели, рестораны, план поездки по дням и ИИ-гид на вашем языке. Бесплатно, в браузере телефона, даже без интернета.",
    en: "Places, hotels, restaurants, a day-by-day trip plan and an AI guide in your language. Free, right in your phone's browser — even offline.",
  },
  hero_cta: { ru: "Начать путешествие", en: "Start your journey" },
  hero_watch: { ru: "Смотреть, как работает", en: "See how it works" },
  trust_free: { ru: "Бесплатно", en: "Free" },
  trust_free_sub: { ru: "без регистрации", en: "no sign-up needed" },
  trust_langs: { ru: "10 языков", en: "10 languages" },
  trust_langs_sub: { ru: "от узбекского до японского", en: "Uzbek to Japanese" },
  trust_offline: { ru: "Офлайн", en: "Offline" },
  trust_offline_sub: { ru: "город в кармане", en: "a city in your pocket" },
  trust_ai: { ru: "ИИ-гид", en: "AI guide" },
  trust_ai_sub: { ru: "ответит на всё", en: "answers anything" },
  pass_title: { ru: "SILK ROAD PASS", en: "SILK ROAD PASS" },
  pass_sub: { ru: "Весь Узбекистан в одном приложении", en: "All of Uzbekistan in one app" },
  pass_valid: { ru: "ДЕЙСТВУЕТ ВСЮ ПОЕЗДКУ", en: "VALID FOR THE WHOLE TRIP" },
  kids_hello: { ru: "Салом! Покажем всё 👋", en: "Salom! Let us show you 👋" },
  stat_cities: { ru: "городов", en: "cities" },
  stat_places: { ru: "мест", en: "places" },
  stat_venues: { ru: "отелей и ресторанов", en: "hotels & restaurants" },
  stat_langs: { ru: "языков", en: "languages" },

  cities_kicker: { ru: "Куда поехать", en: "Where to go" },
  cities_open: { ru: "Смотреть в приложении", en: "Explore in the app" },

  feat_kicker: { ru: "Что умеет HelloUZ", en: "What HelloUZ does" },
  feat_title: { ru: "Всё для поездки — в одном кармане", en: "Everything for the trip — in one pocket" },
  feat_text: {
    ru: "Мы собрали то, на чём спотыкаются туристы в Узбекистане: регистрацию, поезда, наличные, такси и связь. И то, ради чего сюда едут: города, еду и истории.",
    en: "We gathered what trips travellers up in Uzbekistan — registration, trains, cash, taxis, connectivity — and what they come for: cities, food and stories.",
  },
  card1_t: { ru: "ИИ-гид", en: "AI guide" },
  card1_s: {
    ru: "Спросите «где лучший плов?» — ответит и покажет карточки заведений.",
    en: "Ask “where's the best plov?” — get an answer with the places to go.",
  },
  card2_t: { ru: "Аудиогиды", en: "Audio guides" },
  card2_s: {
    ru: "Телефон рассказывает историю места, пока вы стоите перед ним.",
    en: "Your phone tells the story of the place while you stand in front of it.",
  },
  card3_t: { ru: "План по дням", en: "Day-by-day plan" },
  card3_s: {
    ru: "Места, отели и рестораны по дням, расстояния и «Маршрут дня» на карте.",
    en: "Places, hotels and restaurants by day, distances and a “day route” on the map.",
  },
  try_it: { ru: "Попробовать", en: "Try it" },

  demo_kicker: { ru: "Настоящее приложение", en: "The real app" },
  demo_title: { ru: "Открывается в браузере. Ставится в одно касание.", en: "Opens in the browser. Installs in one tap." },
  demo_text: {
    ru: "Никаких магазинов приложений: откройте ссылку, добавьте на домашний экран — и HelloUZ работает как обычное приложение, даже без сети.",
    en: "No app stores: open the link, add it to your home screen — and HelloUZ works like a regular app, even without a connection.",
  },
  demo_must: { ru: "Обязательно посмотреть", en: "Must-see places" },
  demo_chat: { ru: "Плов лучше брать до обеда — к вечеру его уже нет 🍚", en: "Get plov before lunch — it's gone by evening 🍚" },

  quiz_title: { ru: "Какая поездка вам подходит?", en: "Which trip is right for you?" },
  quiz_sub: {
    ru: "Три вопроса — и готовый маршрут по дням откроется прямо в приложении.",
    en: "Three questions — and a ready day-by-day route opens right in the app.",
  },
  quiz_q1: { ru: "Что вам ближе?", en: "What do you love?" },
  quiz_q2: { ru: "Сколько дней?", en: "How many days?" },
  quiz_q3: { ru: "Откуда начинаете?", en: "Where do you start?" },
  q_history: { ru: "история и архитектура", en: "history & architecture" },
  q_nature: { ru: "горы и природа", en: "mountains & nature" },
  q_food: { ru: "еда и базары", en: "food & bazaars" },
  q_short: { ru: "1–2 дня", en: "1–2 days" },
  q_mid: { ru: "3–4 дня", en: "3–4 days" },
  q_long: { ru: "5 и больше", en: "5 or more" },
  quiz_go: { ru: "Собрать маршрут", en: "Build my route" },
  quiz_day: { ru: "День", en: "Day" },
  quiz_open: { ru: "Открыть маршрут в HelloUZ", en: "Open this route in HelloUZ" },

  fin_title: { ru: "Хорошие места — яркие дни", en: "Good places, brighter days" },
  fin_script: { ru: "Salom, O‘zbekiston!", en: "Salom, O‘zbekiston!" },
  fin_badge: { ru: "HELLOUZ • SAFAR • ПУТЕШЕСТВИЕ • ", en: "HELLOUZ • SAFAR • TRAVEL • JOURNEY • " },
  fin_partners: { ru: "Для отелей и ресторанов", en: "For hotels & restaurants" },
  fin_partners_sub: {
    ru: "Свой кабинет: карточка, брони, ответы на отзывы, подключение кассы.",
    en: "Your own dashboard: listing, bookings, review replies, POS connection.",
  },
  fin_credits: {
    ru: "Фото: Unsplash. Данные о местах — из приложения HelloUZ, обновляются вживую.",
    en: "Photos: Unsplash. Place data comes live from the HelloUZ app.",
  },
} as const;

export type Ключ = keyof typeof T;

const Контекст = createContext<{ язык: Язык; setЯзык: (я: Язык) => void; t: (к: Ключ) => string }>({
  язык: "ru",
  setЯзык: () => undefined,
  t: (к) => T[к].ru,
});

export function ЯзыкProvider({ children }: { children: React.ReactNode }) {
  const [язык, setЯзыкState] = useState<Язык>("ru");
  useEffect(() => {
    let сохранён: string | null = null;
    try {
      сохранён = localStorage.getItem("hz.landing.lang");
    } catch {
      // приватный режим
    }
    const выбор = сохранён === "ru" || сохранён === "en" ? сохранён : navigator.language.startsWith("ru") ? "ru" : "en";
    setЯзыкState(выбор);
  }, []);
  useEffect(() => {
    document.documentElement.lang = язык;
  }, [язык]);
  const setЯзык = (я: Язык) => {
    setЯзыкState(я);
    try {
      localStorage.setItem("hz.landing.lang", я);
    } catch {
      // не страшно
    }
  };
  return (
    <Контекст.Provider value={{ язык, setЯзык, t: (к) => T[к][язык] }}>{children}</Контекст.Provider>
  );
}

export const useЯзык = () => useContext(Контекст);
