"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Клиентская обёртка над 3D-сценой.
 *
 * Нужна по двум причинам.
 *
 * Первая: `ssr: false` у next/dynamic допустим только в клиентских компонентах —
 * в серверном Next выбрасывает ошибку сборки.
 *
 * Вторая тоньше. React Three Fiber измеряет свой контейнер сам и не рендерит
 * содержимое холста, пока измеренный размер равен нулю. Сцена подгружается
 * динамически и монтируется в том же кадре, когда контейнер только получает
 * разметку, — измерение возвращает ноль, холст остаётся 300×150 и пустым,
 * а повторно измерять нечего: размеры контейнера больше не меняются.
 * Поэтому сначала дожидаемся ненулевого размера и только потом монтируем сцену.
 */
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/** Пока сцена не смонтирована, вместо пустоты — тёмный градиент. */
function Placeholder() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #0d2b2e 0%, #04080b 70%)",
      }}
    />
  );
}

export default function HeroCanvas() {
  const holder = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;

    const check = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width > 0 && height > 0) setMeasured(true);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holder} className="relative h-full w-full">
      {measured ? <HeroScene /> : <Placeholder />}
    </div>
  );
}
