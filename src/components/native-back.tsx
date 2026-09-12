"use client";

import { useEffect, useRef } from "react";

/**
 * Аппаратная кнопка «Назад» в нативной оболочке.
 *
 * Навигация приложения держится на состоянии, а не на адресах, поэтому у
 * webview нет истории, которую могла бы отмотать системная кнопка. Без
 * этого «Назад» с любого экрана сразу закрывала бы приложение — на
 * карточке места человек ждёт возврата к списку, а не выхода.
 *
 * Здесь кнопка привязана к тому же «назад по одному уровню», что и
 * стрелки на экранах: `onBack` закрывает верхний открытый слой и
 * возвращает `true`; если закрывать нечего (мы на главной), сворачиваем
 * приложение — как принято на Android, а не убиваем его.
 *
 * В обычном браузере компонент ничего не делает: там системной кнопки
 * телефона нет, работает история браузера.
 */
export default function NativeBack({ onBack }: { onBack: () => boolean }) {
  // Слушатель ставим один раз, а вызываем всегда свежий onBack: иначе
  // при каждой смене состояния пришлось бы переподписываться.
  const свежий = useRef(onBack);
  свежий.current = onBack;

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;

    let снять: (() => void) | undefined;
    let живо = true;

    import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("backButton", () => {
          if (!свежий.current()) App.exitApp();
        }),
      )
      .then((handle) => {
        // Компонент могли размонтировать, пока грузился плагин.
        if (живо) снять = () => handle.remove();
        else handle.remove();
      })
      .catch(() => undefined);

    return () => {
      живо = false;
      снять?.();
    };
  }, []);

  return null;
}
