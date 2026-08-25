import type { Category, Lang, Theme } from "./types";

/**
 * Словари интерфейса. Архитектура рассчитана на 10 языков из п. 6 ТЗ,
 * MVP запускается на трёх (п. 19). Добавление языка = добавление объекта сюда
 * плюс переводы контента через админ-панель.
 */

/**
 * Число с существительным в правильной форме.
 *
 * «4 объектов» в интерфейсе выглядит как недоделка. В русском три формы,
 * в узбекском счётное существительное не меняется, в английском две.
 * Для остальных языков остаётся словарная форма — она нейтральна.
 */
export function objectsCount(lang: Lang, n: number): string {
  if (lang === "ru") {
    const ten = n % 10;
    const hundred = n % 100;
    const form =
      ten === 1 && hundred !== 11
        ? "объект"
        : ten >= 2 && ten <= 4 && (hundred < 12 || hundred > 14)
          ? "объекта"
          : "объектов";
    return `${n} ${form}`;
  }
  if (lang === "uz") return `${n} obyekt`;
  if (lang === "en") return `${n} ${n === 1 ? "place" : "places"}`;
  return `${n} ${t(lang, "objects")}`;
}

/** Маршруты по тем же правилам, что и объекты. */
export function routesCount(lang: Lang, n: number): string {
  if (lang === "ru") {
    const ten = n % 10;
    const hundred = n % 100;
    const form =
      ten === 1 && hundred !== 11
        ? "маршрут"
        : ten >= 2 && ten <= 4 && (hundred < 12 || hundred > 14)
          ? "маршрута"
          : "маршрутов";
    return `${n} ${form}`;
  }
  if (lang === "uz") return `${n} marshrut`;
  if (lang === "en") return `${n} ${n === 1 ? "route" : "routes"}`;
  return `${n} ${t(lang, "map_stat_routes")}`;
}

export const LANG_LABEL: Record<Lang, string> = {
  ru: "Русский",
  uz: "O'zbekcha",
  en: "English",
  zh: "中文",
  ko: "한국어",
  tr: "Türkçe",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ar: "العربية",
};

export const LANG_FLAG: Record<Lang, string> = {
  ru: "🇷🇺",
  uz: "🇺🇿",
  en: "🇬🇧",
  zh: "🇨🇳",
  ko: "🇰🇷",
  tr: "🇹🇷",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
  ar: "🇸🇦",
};

type Dict = Record<string, string>;

const ru: Dict = {
  app_name: "Uzbekistan Travel",
  tagline: "Узбекистан без гида — ваш персональный гид всегда с вами",
  choose_city: "Выберите город",
  cities: "Города",
  map: "Карта",
  scan: "Сканировать",
  routes: "Маршруты",
  profile: "Профиль",
  planner: "Планировщик",
  assistant: "AI-помощник",
  nearby: "Рядом с вами",
  listen: "Слушать историю",
  read: "Читать",
  show_on_map: "Посмотреть на карте",
  photos: "Фотографии",
  favorite: "В избранное",
  favorited: "В избранном",
  want_to_visit: "Хочу посетить",
  visited: "Посещено",
  free: "Бесплатно",
  price: "Вход",
  hours: "Часы работы",
  duration: "Продолжительность",
  distance: "Расстояние",
  on_foot: "Пешком",
  by_taxi: "На такси",
  by_car: "На машине",
  build_route: "Построить маршрут",
  my_routes: "Мои маршруты",
  ready_routes: "Готовые маршруты",
  objects: "объектов",
  stops: "остановок",
  sos: "SOS / Помощь",
  offline: "Офлайн-режим",
  download_city: "Скачать город",
  downloaded: "Загружено",
  passport: "Туристический паспорт",
  stamps: "штампов",
  achievements: "Достижения",
  places_visited: "Посещено мест",
  cities_visited: "Городов",
  km_walked: "Пройдено",
  stories_heard: "Прослушано историй",
  language: "Язык",
  all_categories: "Все категории",
  time_available: "Сколько у вас времени",
  interests: "Интересы",
  budget: "Бюджет",
  transport: "Передвижение",
  generate: "Составить маршрут",
  ask_placeholder: "У меня 4 часа в Бухаре, люблю историю и хочу попробовать плов",
  exhibits: "Экспонаты",
  exhibit: "Экспонат",
  period: "Период",
  origin: "Происхождение",
  scan_hint: "Наведите камеру на QR-код рядом с объектом",
  not_found: "Ничего не найдено",
  back: "Назад",
  minutes: "мин",
  hours_short: "ч",
  landmarks_short: "Места",
  sos_short: "SOS",
  explore_short: "Карта 3D",
  map_hint: "Цвет и высота региона показывают, сколько в нём объектов на платформе.",
  map_less: "меньше",
  map_more: "больше",
  map_silk_road: "Великий шёлковый путь",
  map_drag: "Тяните, чтобы повернуть",
  map_regions: "Регионы страны",
  country: "Узбекистан",
  top_places: "Главное в городе",
  photo_by: "фото",
  map_stat_cities: "городов и областей",
  map_stat_objects: "объектов",
  map_stat_routes: "маршрутов",
  map_intro: "Вся страна на одной карте: рельеф показывает, где больше мест, золотая нить — Великий шёлковый путь.",
  map_open: "нажмите, чтобы открыть",
  map_no_webgl: "Браузер не поддерживает трёхмерную графику — регионы доступны списком ниже.",
  see_all: "Все",
  draft_notice: "Черновой текст, требует проверки историком",
};

const uz: Dict = {
  app_name: "Uzbekistan Travel",
  tagline: "Gidsiz O'zbekiston — shaxsiy gidingiz doim yoningizda",
  choose_city: "Shaharni tanlang",
  cities: "Shaharlar",
  map: "Xarita",
  scan: "Skanerlash",
  routes: "Marshrutlar",
  profile: "Profil",
  planner: "Rejalashtiruvchi",
  assistant: "AI-yordamchi",
  nearby: "Yaqiningizda",
  listen: "Tarixni tinglash",
  read: "O'qish",
  show_on_map: "Xaritada ko'rish",
  photos: "Suratlar",
  favorite: "Saralanganga",
  favorited: "Saralanganda",
  want_to_visit: "Bormoqchiman",
  visited: "Tashrif buyurilgan",
  free: "Bepul",
  price: "Kirish",
  hours: "Ish vaqti",
  duration: "Davomiyligi",
  distance: "Masofa",
  on_foot: "Piyoda",
  by_taxi: "Taksida",
  by_car: "Mashinada",
  build_route: "Marshrut tuzish",
  my_routes: "Mening marshrutlarim",
  ready_routes: "Tayyor marshrutlar",
  objects: "obyekt",
  stops: "to'xtash",
  sos: "SOS / Yordam",
  offline: "Oflayn rejim",
  download_city: "Shaharni yuklab olish",
  downloaded: "Yuklandi",
  passport: "Sayohat pasporti",
  stamps: "shtamp",
  achievements: "Yutuqlar",
  places_visited: "Ko'rilgan joylar",
  cities_visited: "Shaharlar",
  km_walked: "Bosib o'tilgan",
  stories_heard: "Tinglangan tarixlar",
  language: "Til",
  all_categories: "Barcha toifalar",
  time_available: "Qancha vaqtingiz bor",
  interests: "Qiziqishlar",
  budget: "Byudjet",
  transport: "Harakatlanish",
  generate: "Marshrut tuzish",
  ask_placeholder: "Buxoroda 4 soatim bor, tarixni yaxshi ko'raman va palov yemoqchiman",
  exhibits: "Eksponatlar",
  exhibit: "Eksponat",
  period: "Davr",
  origin: "Kelib chiqishi",
  scan_hint: "Kamerani obyekt yonidagi QR-kodga qarating",
  not_found: "Hech narsa topilmadi",
  back: "Orqaga",
  minutes: "daq",
  hours_short: "soat",
  landmarks_short: "Joylar",
  sos_short: "SOS",
  explore_short: "3D xarita",
  map_hint: "Viloyat rangi va balandligi undagi obyektlar sonini ko'rsatadi.",
  map_less: "kamroq",
  map_more: "ko'proq",
  map_silk_road: "Buyuk Ipak yo'li",
  map_drag: "Aylantirish uchun torting",
  map_regions: "Mamlakat viloyatlari",
  country: "O'zbekiston",
  top_places: "Shahardagi asosiy joylar",
  photo_by: "surat",
  map_stat_cities: "shahar va viloyat",
  map_stat_objects: "obyekt",
  map_stat_routes: "marshrut",
  map_intro: "Butun mamlakat bitta xaritada: relyef qayerda ko'proq joy borligini, oltin ip esa Buyuk Ipak yo'lini ko'rsatadi.",
  map_open: "ochish uchun bosing",
  map_no_webgl: "Brauzer uch o'lchamli grafikani qo'llamaydi — viloyatlar quyidagi ro'yxatda.",
  see_all: "Barchasi",
  draft_notice: "Qoralama matn, tarixchi tekshiruvi zarur",
};

const en: Dict = {
  app_name: "Uzbekistan Travel",
  tagline: "Uzbekistan without a guide — your personal guide is always with you",
  choose_city: "Choose a city",
  cities: "Cities",
  map: "Map",
  scan: "Scan",
  routes: "Routes",
  profile: "Profile",
  planner: "Planner",
  assistant: "AI assistant",
  nearby: "Near you",
  listen: "Listen to the story",
  read: "Read",
  show_on_map: "Show on map",
  photos: "Photos",
  favorite: "Add to favorites",
  favorited: "In favorites",
  want_to_visit: "Want to visit",
  visited: "Visited",
  free: "Free",
  price: "Entry",
  hours: "Opening hours",
  duration: "Duration",
  distance: "Distance",
  on_foot: "On foot",
  by_taxi: "By taxi",
  by_car: "By car",
  build_route: "Build a route",
  my_routes: "My routes",
  ready_routes: "Curated routes",
  objects: "places",
  stops: "stops",
  sos: "SOS / Help",
  offline: "Offline mode",
  download_city: "Download city",
  downloaded: "Downloaded",
  passport: "Travel Passport",
  stamps: "stamps",
  achievements: "Achievements",
  places_visited: "Places visited",
  cities_visited: "Cities",
  km_walked: "Distance walked",
  stories_heard: "Stories heard",
  language: "Language",
  all_categories: "All categories",
  time_available: "How much time do you have",
  interests: "Interests",
  budget: "Budget",
  transport: "Getting around",
  generate: "Generate route",
  ask_placeholder: "I have 4 hours in Bukhara, I love history and want to try plov",
  exhibits: "Exhibits",
  exhibit: "Exhibit",
  period: "Period",
  origin: "Origin",
  scan_hint: "Point your camera at the QR code next to the site",
  not_found: "Nothing found",
  back: "Back",
  minutes: "min",
  hours_short: "h",
  landmarks_short: "Places",
  sos_short: "SOS",
  explore_short: "3D map",
  map_hint: "A region's colour and height show how many places it holds.",
  map_less: "fewer",
  map_more: "more",
  map_silk_road: "The Great Silk Road",
  map_drag: "Drag to rotate",
  map_regions: "Regions of the country",
  country: "Uzbekistan",
  top_places: "Top places",
  photo_by: "photo",
  map_stat_cities: "cities and regions",
  map_stat_objects: "places",
  map_stat_routes: "routes",
  map_intro: "The whole country on one map: relief shows where the places are, the golden thread is the Great Silk Road.",
  map_open: "tap to open",
  map_no_webgl: "This browser has no 3D graphics — the regions are listed below.",
  see_all: "See all",
  draft_notice: "Draft text, pending review by a historian",
};

const DICTS: Partial<Record<Lang, Dict>> = { ru, uz, en };

export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS.en?.[key] ?? key;
}

export function tt(lang: Lang) {
  return (key: string) => t(lang, key);
}

export const CATEGORY_LABEL: Partial<Record<Lang, Record<Category, string>>> = {
  ru: {
    landmark: "Достопримечательности",
    museum: "Музеи",
    religious: "Религиозные объекты",
    nature: "Природа",
    restaurant: "Рестораны",
    cafe: "Кафе",
    hotel: "Гостиницы",
    bazaar: "Базары",
    craft: "Ремёсла и сувениры",
    toilet: "Туалеты",
    station: "Вокзалы",
    airport: "Аэропорты",
    transport: "Транспорт",
  },
  uz: {
    landmark: "Diqqatga sazovor joylar",
    museum: "Muzeylar",
    religious: "Diniy obyektlar",
    nature: "Tabiat",
    restaurant: "Restoranlar",
    cafe: "Kafelar",
    hotel: "Mehmonxonalar",
    bazaar: "Bozorlar",
    craft: "Hunarmandchilik va sovg'alar",
    toilet: "Hojatxonalar",
    station: "Vokzallar",
    airport: "Aeroportlar",
    transport: "Transport",
  },
  en: {
    landmark: "Landmarks",
    museum: "Museums",
    religious: "Religious sites",
    nature: "Nature",
    restaurant: "Restaurants",
    cafe: "Cafés",
    hotel: "Hotels",
    bazaar: "Bazaars",
    craft: "Crafts & souvenirs",
    toilet: "Restrooms",
    station: "Train stations",
    airport: "Airports",
    transport: "Transport",
  },
};

export const THEME_LABEL: Partial<Record<Lang, Record<Theme, string>>> = {
  ru: {
    history: "История",
    architecture: "Архитектура",
    museums: "Музеи",
    islamic: "Исламское наследие",
    nature: "Природа",
    food: "Гастрономия",
    entertainment: "Развлечения",
    family: "Семейный отдых",
    crafts: "Ремёсла",
    shopping: "Шопинг",
    free: "Бесплатно",
  },
  uz: {
    history: "Tarix",
    architecture: "Me'morchilik",
    museums: "Muzeylar",
    islamic: "Islom merosi",
    nature: "Tabiat",
    food: "Gastronomiya",
    entertainment: "Ko'ngilochar",
    family: "Oilaviy dam olish",
    crafts: "Hunarmandchilik",
    shopping: "Xarid",
    free: "Bepul",
  },
  en: {
    history: "History",
    architecture: "Architecture",
    museums: "Museums",
    islamic: "Islamic heritage",
    nature: "Nature",
    food: "Food",
    entertainment: "Entertainment",
    family: "Family",
    crafts: "Crafts",
    shopping: "Shopping",
    free: "Free",
  },
};

export function categoryLabel(lang: Lang, c: Category): string {
  return CATEGORY_LABEL[lang]?.[c] ?? CATEGORY_LABEL.en?.[c] ?? c;
}

export function themeLabel(lang: Lang, th: Theme): string {
  return THEME_LABEL[lang]?.[th] ?? THEME_LABEL.en?.[th] ?? th;
}
