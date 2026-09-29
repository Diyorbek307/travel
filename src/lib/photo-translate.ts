/** Ответ переводчика по фото (/api/translate-photo). */
export interface СтрокаПеревода {
  original: string;
  translation: string;
  note?: string;
  price?: string;
}
export interface ПереводФото {
  kind: "menu" | "sign" | "other";
  title?: string;
  items: СтрокаПеревода[];
  summary?: string;
}
