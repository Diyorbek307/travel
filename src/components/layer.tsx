"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Слой поверх приложения, который уходит плавно.
 *
 * Обычное `{открыт && <Экран/>}` убирает экран в тот же кадр, что нажали
 * «назад»: появлялось всё мягко, а исчезало обрывом. Слой держит экран
 * ещё УХОД мс с классом .layer-out и только потом снимает его. Пока экран
 * уходит, показывается последнее его содержимое — данные, которые его
 * закрыли (например, сброшенная карточка), ему уже не нужны.
 */
const УХОД = 220;

export function Слой({
  открыт,
  className,
  children,
}: {
  открыт: boolean;
  /** Классы самого слоя. Без них — обёртка, которая только гаснет. */
  className?: string;
  children: React.ReactNode;
}) {
  const [виден, setВиден] = useState(открыт);
  const [уходит, setУходит] = useState(false);
  const последнее = useRef<React.ReactNode>(children);
  if (открыт) последнее.current = children;

  useEffect(() => {
    if (открыт) {
      setВиден(true);
      setУходит(false);
      return;
    }
    if (!виден) return;
    setУходит(true);
    const id = setTimeout(() => {
      setВиден(false);
      setУходит(false);
    }, УХОД);
    return () => clearTimeout(id);
    // виден в зависимостях не нужен: реагируем только на открытие и закрытие.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [открыт]);

  if (!открыт && !виден) return null;
  return (
    <div className={`${className ?? ""} ${уходит ? "layer-out" : ""}`} aria-hidden={уходит || undefined}>
      {открыт ? children : последнее.current}
    </div>
  );
}
