"use client";

import { useEffect, useState } from "react";

/**
 * Узкий экран — до 900 пикселей.
 *
 * Панель рисовалась под широкий монитор: боковая колонка, список рядом
 * с деталью, две панели чата. На телефоне это не помещается, и такие
 * места складываются в одну колонку.
 */
export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return narrow;
}
