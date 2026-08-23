import { cookies } from "next/headers";
import { LANGS, type Lang } from "./types";

export const LANG_COOKIE = "uz_lang";

/**
 * Язык интерфейса для серверных компонентов.
 * Турист выбирает язык один раз (п. 6 ТЗ), выбор хранится в cookie —
 * так серверный рендер сразу отдаёт страницу на нужном языке, без мигания.
 */
export async function currentLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLang(value) ? value : "ru";
}

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Язык из query-параметра запроса к API, с фолбэком на русский. */
export function langFromParam(value: string | null | undefined): Lang {
  return isLang(value) ? value : "ru";
}
