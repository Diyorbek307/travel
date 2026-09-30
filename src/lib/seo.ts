import type { Metadata } from "next";
import { readContent } from "./store";
import { живыеПереводы } from "./content-translations";
import { переведиКонтент } from "./content-i18n";
import { LOCALES, type Locale } from "./i18n";
import type { Content, Fact } from "./types";

/**
 * Страницы мест, отелей и ресторанов для поисковиков и превью ссылок.
 *
 * Само приложение — одна страница, где экраны меняются внутри «телефона».
 * Поисковик в такой видит только главную: ни Регистана, ни плов-центра.
 * Поэтому у каждой записи есть ещё простая страница /place/<id> (и
 * /hotel, /restaurant) — с настоящим заголовком, описанием, фото и
 * разметкой schema.org, на 10 языках. Кнопка на ней открывает ту же
 * запись уже в приложении.
 *
 * Рейтинги в разметку не кладём: часть оценок в демо-данных не от
 * настоящих отзывов, а выдавать их поисковику за отзывы нельзя.
 */

export const САЙТ = process.env.SITE_URL ?? "https://uzbekistan-travel.onrender.com";

import { адресСтраницы, type ВидСтраницы } from "./seo-links";
export type { ВидСтраницы };

const видно = (s: string) => s === "active" || s === "seasonal";

export interface Страница {
  вид: ВидСтраницы;
  id: string;
  /** Исходное (русское) название — по нему ищутся координаты. */
  имяRu: string;
  имя: string;
  город: string;
  описание: string;
  фото: string[];
  строки: { подпись: string; значение: string }[];
  факты: Fact[];
  язык: Locale;
}

export function языкИз(значение: string | string[] | undefined): Locale {
  const v = Array.isArray(значение) ? значение[0] : значение;
  return (LOCALES as readonly string[]).includes(v ?? "") ? (v as Locale) : "en";
}

/** Подписи строк на странице — коротко, на всех языках. */
const ПОДПИСИ: Record<string, Record<Locale, string>> = {
  hours: {
    en: "Hours",
    ru: "Часы работы",
    uz: "Ish vaqti",
    zh: "营业时间",
    ko: "운영 시간",
    de: "Öffnungszeiten",
    fr: "Horaires",
    ja: "営業時間",
    tr: "Çalışma saatleri",
    ar: "ساعات العمل",
  },
  entry: {
    en: "Entry",
    ru: "Вход",
    uz: "Kirish",
    zh: "门票",
    ko: "입장료",
    de: "Eintritt",
    fr: "Entrée",
    ja: "入場料",
    tr: "Giriş",
    ar: "الدخول",
  },
  price: {
    en: "Price",
    ru: "Цена",
    uz: "Narx",
    zh: "价格",
    ko: "가격",
    de: "Preis",
    fr: "Prix",
    ja: "料金",
    tr: "Fiyat",
    ar: "السعر",
  },
  cuisine: {
    en: "Cuisine",
    ru: "Кухня",
    uz: "Oshxona",
    zh: "菜系",
    ko: "요리",
    de: "Küche",
    fr: "Cuisine",
    ja: "料理",
    tr: "Mutfak",
    ar: "المطبخ",
  },
  city: {
    en: "City",
    ru: "Город",
    uz: "Shahar",
    zh: "城市",
    ko: "도시",
    de: "Stadt",
    fr: "Ville",
    ja: "都市",
    tr: "Şehir",
    ar: "المدينة",
  },
};

export const ТЕКСТЫ: Record<"open" | "map" | "more" | "home", Record<Locale, string>> = {
  open: {
    en: "Open in HelloUZ",
    ru: "Открыть в HelloUZ",
    uz: "HelloUZ da ochish",
    zh: "在 HelloUZ 中打开",
    ko: "HelloUZ에서 열기",
    de: "In HelloUZ öffnen",
    fr: "Ouvrir dans HelloUZ",
    ja: "HelloUZで開く",
    tr: "HelloUZ'da aç",
    ar: "افتح في HelloUZ",
  },
  map: {
    en: "On the map",
    ru: "На карте",
    uz: "Xaritada",
    zh: "在地图上",
    ko: "지도에서",
    de: "Auf der Karte",
    fr: "Sur la carte",
    ja: "地図で見る",
    tr: "Haritada",
    ar: "على الخريطة",
  },
  more: {
    en: "Audio guides, routes, AI guide and bookings — in the HelloUZ app, free.",
    ru: "Аудиогиды, маршруты, ИИ-гид и бронь — в приложении HelloUZ, бесплатно.",
    uz: "Audio yoʻriqchilar, marshrutlar, AI-gid va bron — HelloUZ ilovasida, bepul.",
    zh: "语音导览、路线、AI 导游和预订——尽在 HelloUZ，免费。",
    ko: "오디오 가이드, 경로, AI 가이드, 예약까지 — HelloUZ에서 무료로.",
    de: "Audioguides, Routen, KI-Guide und Buchung — kostenlos in der HelloUZ-App.",
    fr: "Audioguides, itinéraires, guide IA et réservations — gratuits dans l'appli HelloUZ.",
    ja: "音声ガイド、ルート、AIガイド、予約 — HelloUZで無料。",
    tr: "Sesli rehberler, rotalar, yapay zekâ rehberi ve rezervasyon — HelloUZ'da ücretsiz.",
    ar: "أدلة صوتية ومسارات ومرشد ذكي وحجوزات — في تطبيق HelloUZ مجانًا.",
  },
  home: {
    en: "Uzbekistan travel guide",
    ru: "Путеводитель по Узбекистану",
    uz: "Oʻzbekiston boʻylab yoʻlboshchi",
    zh: "乌兹别克斯坦旅行指南",
    ko: "우즈베키스탄 여행 가이드",
    de: "Reiseführer Usbekistan",
    fr: "Guide de voyage Ouzbékistan",
    ja: "ウズベキスタン旅行ガイド",
    tr: "Özbekistan seyahat rehberi",
    ar: "دليل السفر إلى أوزبكستان",
  },
};

export async function страница(вид: ВидСтраницы, id: string, язык: Locale): Promise<Страница | null> {
  const [c, живые] = await Promise.all([readContent(), живыеПереводы()]);
  const тр = (s: string | undefined) => (s ? переведиКонтент(s, язык, живые) : "");
  const п = ПОДПИСИ;

  if (вид === "place") {
    const м = c.places.find((x) => x.id === id && видно(x.status));
    if (!м) return null;
    return {
      вид,
      id,
      имяRu: м.name,
      имя: тр(м.name),
      город: тр(м.city),
      описание: тр(м.desc),
      фото: [м.img, ...(м.imgs ?? [])].filter(Boolean).slice(0, 5),
      строки: [
        { подпись: п.hours[язык], значение: тр(м.hours) },
        { подпись: п.entry[язык], значение: тр(м.entry) },
      ].filter((с) => с.значение),
      факты: (м.facts ?? []).map((ф) => ({ ...ф, label: тр(ф.label), value: тр(ф.value) })),
      язык,
    };
  }
  if (вид === "hotel") {
    const h = c.hotels.find((x) => x.id === id && видно(x.status));
    if (!h) return null;
    return {
      вид,
      id,
      имяRu: h.name,
      имя: тр(h.name),
      город: тр(h.city),
      описание: тр(h.desc),
      фото: [h.img, ...(h.imgs ?? [])].filter(Boolean).slice(0, 5),
      строки: [{ подпись: п.price[язык], значение: h.price }].filter((с) => с.значение),
      факты: (h.facts ?? []).map((ф) => ({ ...ф, label: тр(ф.label), value: тр(ф.value) })),
      язык,
    };
  }
  const r = c.restaurants.find((x) => x.id === id && видно(x.status));
  if (!r) return null;
  return {
    вид,
    id,
    имяRu: r.name,
    имя: тр(r.name),
    город: тр(r.city),
    описание: тр(r.desc),
    фото: [r.img, ...(r.imgs ?? [])].filter(Boolean).slice(0, 5),
    строки: [
      { подпись: п.hours[язык], значение: r.open },
      { подпись: п.cuisine[язык], значение: тр(r.cuisine) },
      { подпись: п.price[язык], значение: r.price },
    ].filter((с) => с.значение),
    факты: (r.facts ?? []).map((ф) => ({ ...ф, label: тр(ф.label), value: тр(ф.value) })),
    язык,
  };
}

export { адресСтраницы } from "./seo-links";

/** Заголовок, описание, превью для мессенджеров и ссылки на другие языки. */
export function метаданные(с: Страница): Metadata {
  const заголовок = `${с.имя} — ${с.город} | HelloUZ`;
  const описание = с.описание.length > 160 ? `${с.описание.slice(0, 157)}…` : с.описание;
  return {
    title: заголовок,
    description: описание,
    alternates: {
      canonical: адресСтраницы(с.вид, с.id, с.язык),
      languages: Object.fromEntries(LOCALES.map((l) => [l, адресСтраницы(с.вид, с.id, l)])),
    },
    openGraph: {
      type: "website",
      siteName: "HelloUZ",
      title: заголовок,
      description: описание,
      url: адресСтраницы(с.вид, с.id, с.язык),
      images: с.фото.slice(0, 1).map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: заголовок,
      description: описание,
      images: с.фото.slice(0, 1),
    },
  };
}

/** Разметка schema.org — без оценок (см. выше). */
export function разметка(с: Страница, гео: { lat: number; lon: number } | null) {
  const тип = с.вид === "hotel" ? "Hotel" : с.вид === "restaurant" ? "Restaurant" : "TouristAttraction";
  return {
    "@context": "https://schema.org",
    "@type": тип,
    name: с.имя,
    description: с.описание,
    image: с.фото,
    url: `${САЙТ}${адресСтраницы(с.вид, с.id, с.язык)}`,
    address: { "@type": "PostalAddress", addressLocality: с.город, addressCountry: "UZ" },
    ...(гео ? { geo: { "@type": "GeoCoordinates", latitude: гео.lat, longitude: гео.lon } } : {}),
  };
}

/** Все страницы для sitemap.xml. */
export function всеСтраницы(c: Content): { вид: ВидСтраницы; id: string }[] {
  return [
    ...c.places.filter((x) => видно(x.status)).map((x) => ({ вид: "place" as const, id: x.id })),
    ...c.hotels.filter((x) => видно(x.status)).map((x) => ({ вид: "hotel" as const, id: x.id })),
    ...c.restaurants.filter((x) => видно(x.status)).map((x) => ({ вид: "restaurant" as const, id: x.id })),
  ];
}

/**
 * JSON для <script type="application/ld+json">. JSON.stringify не
 * экранирует «<», и строка «</script><script>…» в описании закрыла бы
 * блок и выполнилась у каждого посетителя. Описание своей карточки
 * правит сотрудник заведения — человек со стороны, поэтому экранируем
 * всё, что браузер может принять за разметку.
 */
export function вСкрипт(данные: unknown): string {
  return JSON.stringify(данные).replace(ОПАСНЫЕ, (с) => ОБРАТНЫЙ_СЛЭШ + "u" + с.charCodeAt(0).toString(16).padStart(4, "0"));
}

// Собраны из кодов символов, а не литералами: U+2028 и U+2029 в исходнике
// выглядят как переводы строки и легко ломаются при правке.
const ОБРАТНЫЙ_СЛЭШ = String.fromCharCode(92);
const ОПАСНЫЕ = new RegExp("[<>&" + String.fromCharCode(0x2028, 0x2029) + "]", "g");
