import type { Locale } from "./i18n";

export type ВидСтраницы = "place" | "hotel" | "restaurant";

/** Адрес страницы записи для поисковиков и «Поделиться». Английский — без ?lang. */
export const адресСтраницы = (вид: ВидСтраницы, id: string, язык?: Locale) =>
  `/${вид}/${encodeURIComponent(id)}${язык && язык !== "en" ? `?lang=${язык}` : ""}`;
