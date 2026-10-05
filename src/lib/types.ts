export type Tab = "home" | "explore" | "map" | "audio" | "profile";

export interface Place {
  id: string;
  name: string;
  /** Исходное русское название — ключ для координат места (МЕСТА в geo). */
  nameRu?: string;
  /** Тип как в данных, без перевода: по нему сверяется код. */
  typeRu?: string;
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
  /** Виды билетов: взрослый, детский, для граждан Узбекистана… */
  tickets?: Ticket[];
  /** Галерея: фото места, кроме главного. */
  imgs?: string[];
  /** «Полезно знать»: сколько времени нужно, дресс-код, лучшее время… */
  facts?: Fact[];
  /** Авторы и лицензия фото — подпись под галереей (CC BY-SA требует). */
  credits?: string;
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
  /**
   * Город экскурсии — по нему работает общий фильтр «Исследовать».
   * У многодневных туров через всю страну города нет: они видны только
   * при «Все города».
   */
  city?: string;
  /** Фото для карточки экскурсии; без него — цветная плашка со значком. */
  img?: string;
}

/** Вид гостиницы. Без поля — обычный отель: так записи из базы не ломаются. */
export type HotelKind = "hotel" | "motel" | "hostel" | "guesthouse";

/** Ресторан или бар. Без поля — ресторан. */
export type RestaurantKind = "restaurant" | "bar";

/**
 * Категория номера. Общий словарь для всех гостиниц и для систем
 * партнёров: по нему совпадают наши номера и их наличие у партнёра.
 */
export type RoomCategory =
  | "dorm"
  | "economy"
  | "standard"
  | "comfort"
  | "business"
  | "lux"
  | "presidential"
  | "family";

/** Тип номера в гостинице — то, что турист выбирает перед бронью. */
export interface RoomType {
  id: string;
  category: RoomCategory;
  /** Своё название, если категории мало: «Стандарт с видом на Регистан». */
  name?: string;
  /** Цена за ночь, в долларах. */
  price: number;
  /** Сколько гостей помещается. */
  guests: number;
  /** Кровати словами: «1 двуспальная», «2 односпальные». */
  beds: string;
  /** Площадь, м². */
  area?: number;
  amenities: string[];
  /** Первое фото номера — старое поле, остаётся для совместимости. */
  img?: string;
  /** Все фото номера: спальня, ванная, вид из окна… */
  imgs?: string[];
}

/** Блюдо в меню ресторана. */
export interface MenuItem {
  id: string;
  /** Раздел меню: «Супы», «Горячее», «Напитки»… */
  section: string;
  name: string;
  /** Цена строкой, как в меню: «$6», «45 000 сум». */
  price: string;
  desc?: string;
  img?: string;
}

/** Зал или зона ресторана: основной зал, терраса, VIP. */
export interface Zone {
  id: string;
  name: string;
  seats: number;
}

/** Вид билета в музей или к достопримечательности. */
export interface Ticket {
  id: string;
  name: string;
  /** Цена строкой, как на кассе: «$5», «20 000 сум», «Бесплатно». */
  price: string;
}

/**
 * Откуда приложение знает, есть ли свободные места.
 *   none    — не знает: бронь уходит заявкой, как раньше;
 *   manual  — заведение само отмечает в панели, сколько свободно;
 *   partner — живые данные из системы заведения (OSHBOARD или любой
 *             другой, реализовавшей HelloUZ Partner API).
 */
export type ConnectionKind = "none" | "manual" | "partner" | "push";

export interface Connection {
  kind: ConnectionKind;
  /**
   * Номер заведения в системе партнёра. Сам ключ доступа хранится не
   * здесь, а в закрытом хранилище: содержимое отдаётся всем подряд.
   */
  externalId?: string;
  /** Ручной режим: сколько свободно — по категории номера или "tables". */
  manual?: Partial<Record<RoomCategory | "tables", number>>;
  /** Когда ручные цифры обновили — туристу видно, насколько они свежие. */
  manualUpdatedAt?: string;
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
  kind?: HotelKind;
  /** Категории номеров: эконом, стандарт, бизнес… */
  roomTypes?: RoomType[];
  connection?: Connection;
  /** «Полезно знать»: заезд и выезд, завтрак, дети, трансфер… */
  facts?: Fact[];
  /** Скидка для Premium, % (0 — нет). */
  premiumDiscount?: number;
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
  kind?: RestaurantKind;
  zones?: Zone[];
  /** Средний чек на человека строкой: «$10–15», «80 000 сум». */
  avgCheck?: string;
  connection?: Connection;
  menu?: MenuItem[];
  /** Галерея: зал, терраса, блюда… */
  imgs?: string[];
  /** Столы по числу мест: на двоих, на компанию… */
  tables?: TableType[];
  /** «Полезно знать»: оплата, халяль, музыка, дети… */
  facts?: Fact[];
  /** Скидка для Premium, % (0 — нет). */
  premiumDiscount?: number;
}

/** Карточка в колоде на главной — одна форма и для городов, и для мест. */
export interface DeckItem {
  img: string;
  title: string;
  sub: string;
  badge: string;
  badgeColor: string;
  /** Цвет текста бейджа. По умолчанию тёмный — читается на светлом (золотом)
   *  фоне; на тёмном (зелёном) бейдже передаём белый. */
  badgeTextColor?: string;
  /** Погода в правом верхнем углу — как на карточках отелей: значок + °.
   *  Если нет данных о погоде, чип не рисуем. */
  temp?: string;
  tempIcon?: string;
  stat1: string;
  stat1l: string;
  stat2: string;
  stat2l: string;
  stat3: string;
  stat3l: string;
  price: string;
  pricel: string;
  /** Кадры короткого ролика о месте/городе. Если их больше одного,
   *  карточка не стоит фотографией, а «оживает». */
  кадры?: string[];
  /** Настоящий ролик, если он появится: тогда кадры — только постер. */
  видео?: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  time: string;
  /** Записи, которые советует гид: «place:ID», «hotel:ID», «restaurant:ID». */
  links?: string[];
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

/**
 * Точка на карте.
 *
 * Нужна для такси: маршрут в Яндекс Go строится по координатам, а не по
 * названию — «Регистан» приложение такси не поймёт.
 *
 * Поле необязательное: у части записей координат нет, и тогда берётся
 * центр города. Выдумывать точные координаты нельзя — по ним поедет
 * машина.
 */
export interface Geo {
  lat: number;
  lon: number;
}

export interface ManagedHotel extends Hotel {
  geo?: Geo;
  stars: number;
  rooms: number;
  occupied: number;
  /** Цена числом — для сортировок и отчётов; витрине идёт `price`. */
  priceFrom: number;
  status: EntityStatus | "maintenance";
}

export interface ManagedRestaurant extends Restaurant {
  geo?: Geo;
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
  geo?: Geo;
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
  geo?: Geo;
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
  type: "banner" | "spotlight" | "top_listing" | "push" | "interstitial";
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
  /** Город показа: реклама всплывает, когда пользователь в этом городе или
   *  строит в него маршрут. Пусто — показываем везде (товары: Coca-Cola и т.п.). */
  city?: string;
  /** Куда ведёт клик — сайт рекламодателя. */
  url?: string;
  /**
   * Фото товара рекламодателя. Показывается в блоках вместо эмодзи —
   * настоящая картинка продаёт лучше значка. Ссылка на изображение.
   */
  imageUrl?: string;
  /**
   * Ролик рекламодателя для полноэкранного показа. Путь к файлу в
   * public/videos или внешняя ссылка на mp4. Есть ссылка — объявление
   * может показываться на весь экран (interstitial); нет — обычный блок.
   */
  videoUrl?: string;
  /** Через сколько секунд появляется кнопка «Пропустить». По умолчанию 5. */
  skipAfter?: number;
}

/**
 * Как часто показывать полноэкранную видео-рекламу. Настраивается в
 * панели (раздел «Реклама»), приложение читает и решает по этим числам.
 * Хранится отдельно от содержимого: это правило показа, а не запись.
 */
export interface AdPolicy {
  /** Показывать ли полноэкранную рекламу вообще. */
  fullscreen: boolean;
  /** Не чаще одного показа в это число минут. 0 — без паузы по времени. */
  everyMinutes: number;
  /** Показ на каждый N-й переход между экранами. */
  everyNav: number;
}

/** Всё содержимое платформы одним объектом — его отдаёт и принимает API. */
/**
 * Аудиогид: запись, которую человек слушает у объекта.
 *
 * Файл не храним у себя, а ссылаемся на него. Звук весит мегабайты, а
 * постоянного диска у приложения нет — класть его в базу рядом с
 * учётными записями значит раздуть её до неподъёмного за десяток
 * экскурсий. Ссылка работает уже сегодня и ничего не стоит; когда
 * появится файловое хранилище, добавится и загрузка.
 */
export interface ManagedAudio {
  id: string;
  /** К какому месту относится: по нему гид находится при сканировании кода. */
  placeId: string;
  placeName: string;
  city: string;
  /** Язык записи — у одного места их бывает несколько. */
  lang: string;
  title: string;
  /** Прямая ссылка на звуковой файл. */
  url: string;
  /** Длительность в секундах; 0 — пока не измерена. */
  seconds: number;
  active: boolean;
}

export interface Content {
  cities: ManagedCity[];
  places: ManagedPlace[];
  hotels: ManagedHotel[];
  restaurants: ManagedRestaurant[];
  routes: ManagedRoute[];
  events: ManagedEvent[];
  ads: ManagedAd[];
  audio: ManagedAudio[];
}

export type ContentKey = keyof Content;

/** Турист без секретов — то, что отдаёт сервер и показывает приложение. */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Снимок отдаётся отдельно, по /api/photo/<id>. */
  hasPhoto: boolean;
  country: string;
  phone: string;
  /** До какого момента оплачен Premium; null или нет поля — не оплачен. */
  premiumUntil?: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export type BookingKind = "hotel" | "restaurant" | "tour";

/** Строка «Полезно знать» в карточке: подпись и значение, как их вписал редактор. */
export interface Fact {
  id: string;
  label: string;
  value: string;
}

/** Столы ресторана одного размера: «на 4 места — 6 столов». */
export interface TableType {
  id: string;
  seats: number;
  count: number;
}
