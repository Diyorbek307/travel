"use client";

import { useEffect } from "react";

/** Обложка с орнаментом — та же, что у мест без свободного фото. */
const ЗАГЛУШКА = "/places/samarkand/no-photo.svg";

/**
 * Битые картинки.
 *
 * Без сети снимок, который человек ещё не открывал, не загрузится, и
 * браузер рисует на его месте значок и подпись из alt — карточки отелей
 * выглядели сломанными. Ловим ошибку загрузки любой картинки на странице
 * (событие error не всплывает, поэтому слушаем на погружении) и ставим
 * нашу обложку. Сеть вернётся — при следующем открытии экрана придёт
 * настоящее фото: адрес меняем только у этого элемента.
 */
export default function ImageFallback() {
  useEffect(() => {
    const заменить = (e: Event) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      // Сама заглушка не загрузилась — не крутимся по кругу.
      if (img.dataset.заглушка || img.src.endsWith(ЗАГЛУШКА)) return;
      img.dataset.заглушка = "1";
      img.srcset = "";
      img.src = ЗАГЛУШКА;
      img.style.objectFit = "cover";
    };
    document.addEventListener("error", заменить, true);
    return () => document.removeEventListener("error", заменить, true);
  }, []);
  return null;
}
