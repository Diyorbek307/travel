import { ФОТО, выбрать } from "./demo-photos";
import type { RoomType } from "./types";

/**
 * Типовые категории номеров от цены «от» — заготовка, которую редактор
 * правит под настоящие номера. Самая дешёвая категория и есть цена «от».
 *
 * Номера разные по вместимости — на одного, двоих, троих, семью из пяти:
 * путешествуют и в одиночку, и компанией, и каждому нужен свой.
 * Люкс и президентский — только там, где цена говорит о таком уровне.
 *
 * id строится из id гостиницы и категории: при повторном вызове он тот
 * же, и выбранный в карточке номер не «теряется» после перезагрузки.
 */
export function типовыеНомера(гостиница: string, ценаОт: number, хостел: boolean): RoomType[] {
  const p = Math.max(1, Math.round(ценаОт));
  const id = (к: string) => `${гостиница}-${к}`;
  // У каждого номера своя пара снимков: спальня и ванная.
  const фото = (к: string, спальня = ФОТО.номер) => [
    ...выбрать(спальня, гостиница + к, 2),
    ...выбрать(ФОТО.ванная, гостиница + к, 1),
  ];

  if (хостел) {
    return сОбложкой([
      {
        id: id("dorm"),
        category: "dorm",
        name: "Место в общем номере на 6",
        price: p,
        guests: 1,
        beds: "1 кровать на двухъярусной",
        area: 24,
        amenities: ["Wi-Fi", "Шкафчик с замком", "Розетка и лампа у кровати", "Постельное бельё"],
        imgs: [...выбрать(ФОТО.хостел, гостиница + "dorm", 2)],
      },
      {
        id: id("economy"),
        category: "economy",
        name: "Одноместный",
        price: Math.round(p * 1.8),
        guests: 1,
        beds: "1 односпальная",
        area: 9,
        amenities: ["Wi-Fi", "Кондиционер", "Общая ванная"],
        imgs: фото("economy"),
      },
      {
        id: id("standard"),
        category: "standard",
        name: "Двухместный",
        price: Math.round(p * 2.5),
        guests: 2,
        beds: "1 двуспальная или 2 односпальные",
        area: 14,
        amenities: ["Wi-Fi", "Кондиционер", "Своя ванная"],
        imgs: фото("standard"),
      },
      {
        id: id("family"),
        category: "family",
        name: "Семейный на 4",
        price: Math.round(p * 4),
        guests: 4,
        beds: "1 двуспальная и 2 односпальные",
        area: 22,
        amenities: ["Wi-Fi", "Кондиционер", "Своя ванная", "Чайник"],
        imgs: фото("family"),
      },
    ]);
  }

  const номера: RoomType[] = [
    {
      id: id("economy"),
      category: "economy",
      name: "Одноместный эконом",
      price: p,
      guests: 1,
      beds: "1 односпальная",
      area: 14,
      amenities: ["Wi-Fi", "Кондиционер", "Душ"],
      imgs: фото("economy"),
    },
    {
      id: id("standard"),
      category: "standard",
      name: "Стандарт на двоих",
      price: Math.round(p * 1.3),
      guests: 2,
      beds: "1 двуспальная или 2 односпальные",
      area: 22,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак", "Телевизор", "Фен"],
      imgs: фото("standard"),
    },
    {
      id: id("comfort"),
      category: "comfort",
      name: "Комфорт на троих",
      price: Math.round(p * 1.6),
      guests: 3,
      beds: "1 двуспальная и 1 односпальная",
      area: 28,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак", "Мини-холодильник", "Чайник"],
      imgs: фото("comfort"),
    },
    {
      id: id("family"),
      category: "family",
      name: "Семейный на пятерых",
      price: Math.round(p * 2.2),
      guests: 5,
      beds: "2 двуспальные и 1 односпальная, 2 комнаты",
      area: 42,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак", "Детская кроватка по запросу", "Две ванные"],
      imgs: фото("family"),
    },
    {
      id: id("business"),
      category: "business",
      name: "Бизнес",
      price: Math.round(p * 1.9),
      guests: 2,
      beds: "1 большая двуспальная",
      area: 32,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак", "Рабочий стол", "Вид на город", "Кофемашина"],
      imgs: [...выбрать(ФОТО.гостиная, гостиница, 1), ...фото("business")],
    },
  ];
  if (p >= 60) {
    номера.push({
      id: id("lux"),
      category: "lux",
      name: "Люкс с гостиной",
      price: Math.round(p * 2.8),
      guests: 2,
      beds: "1 кровать king-size",
      area: 55,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак", "Гостиная", "Ванна", "Халаты", "Мини-бар"],
      imgs: [...выбрать(ФОТО.гостиная, гостиница + "lux", 2), ...фото("lux")],
    });
  }
  if (p >= 100) {
    номера.push({
      id: id("presidential"),
      category: "presidential",
      name: "Президентский люкс",
      price: Math.round(p * 5),
      guests: 4,
      beds: "Спальня с king-size и гостевая спальня",
      area: 120,
      amenities: [
        "Wi-Fi",
        "Трансфер",
        "Завтрак в номер",
        "Кабинет",
        "Ванна с джакузи",
        "Панорамный вид",
        "Дворецкий",
      ],
      imgs: [...выбрать(ФОТО.гостиная, гостиница + "pres", 2), ...фото("presidential")],
    });
  }
  return сОбложкой(номера);
}

/** Первое фото номера — его обложка в списках. */
const сОбложкой = (номера: RoomType[]) => номера.map((н) => ({ ...н, img: н.imgs?.[0] }));
