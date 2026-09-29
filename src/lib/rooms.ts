import type { RoomType } from "./types";

/**
 * Типовые категории номеров от цены «от» — заготовка, которую редактор
 * правит под настоящие номера. Самая дешёвая категория и есть цена «от».
 *
 * id строится из id гостиницы и категории: при повторном вызове он тот
 * же, и выбранный в карточке номер не «теряется» после перезагрузки.
 */
export function типовыеНомера(гостиница: string, ценаОт: number, хостел: boolean): RoomType[] {
  const p = Math.max(1, Math.round(ценаОт));
  const id = (к: string) => `${гостиница}-${к}`;
  if (хостел) {
    return [
      {
        id: id("dorm"),
        category: "dorm",
        price: p,
        guests: 1,
        beds: "1 кровать в общем номере",
        area: 20,
        amenities: ["Wi-Fi", "Шкафчик"],
      },
      {
        id: id("standard"),
        category: "standard",
        price: Math.round(p * 2.5),
        guests: 2,
        beds: "1 двуспальная",
        area: 14,
        amenities: ["Wi-Fi", "Кондиционер"],
      },
    ];
  }
  return [
    {
      id: id("economy"),
      category: "economy",
      price: p,
      guests: 2,
      beds: "1 двуспальная",
      area: 16,
      amenities: ["Wi-Fi", "Кондиционер"],
    },
    {
      id: id("standard"),
      category: "standard",
      price: Math.round(p * 1.3),
      guests: 2,
      beds: "1 двуспальная или 2 односпальные",
      area: 22,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак"],
    },
    {
      id: id("business"),
      category: "business",
      price: Math.round(p * 1.9),
      guests: 2,
      beds: "1 большая двуспальная",
      area: 32,
      amenities: ["Wi-Fi", "Кондиционер", "Завтрак", "Рабочий стол", "Вид на город"],
    },
  ];
}
