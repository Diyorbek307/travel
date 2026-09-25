"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/admin-roles";

export interface Меня {
  id: string;
  role: AdminRole;
  name: string;
}

/**
 * Кто вошёл в панель. Оболочка спрашивает сервер один раз, а разделы
 * берут ответ отсюда — например, чтобы не рисовать кнопки, которые роли
 * всё равно не разрешены (проверка прав при этом остаётся на сервере).
 */
export const МеняКонтекст = createContext<Меня | null>(null);

export function useМеня(): Меня | null {
  return useContext(МеняКонтекст);
}
