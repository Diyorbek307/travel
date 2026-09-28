import type { Connection, RoomCategory } from "./types";

/**
 * Наличие мест — в одном виде, откуда бы оно ни пришло.
 *
 * Приложению всё равно, кто сообщил, что свободно три стандартных
 * номера: администратор в панели или касса гостиницы через API. Поэтому
 * и ручной режим, и системы партнёров сводятся к этой форме, а карточки
 * заведений знают только её.
 */
export interface Наличие {
  источник: "manual" | "partner";
  /** Когда цифры актуальны (ISO). */
  обновлено: string;
  /** Гостиница: сколько свободно по категориям номеров. */
  номера?: { категория: RoomCategory; свободно: number; цена?: number }[];
  /** Ресторан: сколько столов свободно сейчас. */
  столов?: number;
  /** Ресторан: ближайшее время, когда освободится стол («19:30»). */
  ближайшее?: string;
}

export const КАТЕГОРИИ: RoomCategory[] = ["economy", "standard", "business", "lux", "family", "dorm"];

/**
 * Ручной режим: цифры, которые заведение отметило в панели. Старше
 * суток — не показываем: «свободно 3 номера» недельной давности хуже,
 * чем ничего, — турист поверит и придёт.
 */
export function ручноеНаличие(подключение: Connection | undefined, сейчас = Date.now()): Наличие | null {
  if (подключение?.kind !== "manual" || !подключение.manual || !подключение.manualUpdatedAt) return null;
  const когда = Date.parse(подключение.manualUpdatedAt);
  if (!Number.isFinite(когда) || сейчас - когда > 24 * 60 * 60 * 1000) return null;

  const номера = КАТЕГОРИИ.flatMap((категория) => {
    const n = подключение.manual?.[категория];
    return typeof n === "number" && n >= 0 ? [{ категория, свободно: Math.floor(n) }] : [];
  });
  const столов = подключение.manual.tables;
  return {
    источник: "manual",
    обновлено: подключение.manualUpdatedAt,
    ...(номера.length ? { номера } : {}),
    ...(typeof столов === "number" && столов >= 0 ? { столов: Math.floor(столов) } : {}),
  };
}

/**
 * Разбор ответа системы партнёра по HelloUZ Partner API (docs/partner-api.md).
 * Чужой сервер может прислать что угодно — берём только то, что прошло
 * проверку, и молча отбрасываем остальное.
 */
export function разобратьОтветПартнёра(данные: unknown, сейчас = new Date()): Наличие | null {
  if (typeof данные !== "object" || данные === null) return null;
  const d = данные as Record<string, unknown>;
  const итог: Наличие = { источник: "partner", обновлено: сейчас.toISOString() };

  if (Array.isArray(d.rooms)) {
    итог.номера = d.rooms.flatMap((x) => {
      if (typeof x !== "object" || x === null) return [];
      const r = x as Record<string, unknown>;
      const категория = r.category as RoomCategory;
      const свободно = Number(r.free);
      if (!КАТЕГОРИИ.includes(категория) || !Number.isFinite(свободно) || свободно < 0) return [];
      const цена = Number(r.price);
      return [
        {
          категория,
          свободно: Math.floor(свободно),
          ...(Number.isFinite(цена) && цена > 0 ? { цена } : {}),
        },
      ];
    });
  }
  const столов = Number(d.free_tables);
  if (Number.isFinite(столов) && столов >= 0) итог.столов = Math.floor(столов);
  if (typeof d.next_free_time === "string" && /^\d{1,2}:\d{2}$/.test(d.next_free_time)) {
    итог.ближайшее = d.next_free_time;
  }
  return итог.номера || итог.столов !== undefined || итог.ближайшее ? итог : null;
}
