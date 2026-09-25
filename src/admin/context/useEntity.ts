"use client";

import { useCallback } from "react";
import { useContent } from "./ContentContext";
import type { Content, ContentKey } from "@/lib/types";

/**
 * Раздел содержимого как обычная пара состояния.
 *
 * Экраны панели писались под `useState`, поэтому и здесь возвращается
 * `[items, setItems]` с поддержкой функции-обновителя. Функция получает
 * самый свежий раздел, а не тот, что был при отрисовке: две правки
 * подряд не теряют первую.
 */
export function useEntity<K extends ContentKey>(key: K) {
  const { content, update } = useContent();
  const items = content[key];

  const setItems = useCallback(
    (next: Content[K] | ((prev: Content[K]) => Content[K])) => update(key, next),
    [key, update],
  );

  return [items, setItems] as const;
}
