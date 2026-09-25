import type { CSSProperties } from "react";

/**
 * Палитра макета.
 *
 * Те же значения продублированы в globals.css как CSS-переменные — здесь
 * они нужны там, где цвет вычисляется в JS (градиенты по маршрутам,
 * инлайновые стили карточек), а переменная не подойдёт.
 */
/*
 * Акцент приложения — бирюза логотипа. Это переменная темы: на тёмном
 * она светлее, на светлом глубже. Имя GREEN осталось от первой палитры
 * и встречается в сотне с лишним мест — цвет задаёт тема, не имя.
 */
export const GREEN = "var(--accent)";
/** Заливка кнопок и плашек, на которой лежит белый текст (см. globals.css). */
export const ACCENT_FILL = "var(--accent-fill)";
/** Полупрозрачные подложки акцента: раньше склеивались как GREEN + "15",
 *  с переменной так нельзя — держим отдельными токенами. */
export const ACCENT_SOFT = "var(--accent-soft)";
export const ACCENT_BORDER = "var(--accent-border)";
/** Мягкое свечение акцентом под кнопками. */
export const GLOW = "var(--glow)";
/** Второй акцент — золото логотипа, точечно: чтобы что-то выделялось из ряда. */
export const ACCENT_2 = "var(--accent-2)";
/** Тёмный конец акцентных градиентов. */
export const ACCENT_DEEP = "var(--accent-deep)";

/* Знак бренда остаётся своим цветом в любой теме. */
export const GREEN_LIGHT = "var(--accent-light)";
/** Тёмный лес — плитка логотипа и подложка бренда. */
export const GREEN_DARK = "var(--accent-deep)";
export const GOLD = "#E9C46A";
/** Текст и значки на золоте. Всегда тёмные: TEXT в тёмной теме светлеет,
 *  и светлые буквы на золоте не читаются. */
export const ON_GOLD = "#1c1606";

/*
 * Нейтрали ссылаются на CSS-переменные — так они переключаются вместе с
 * темой (светлая/тёмная) без правки компонентов. Бренд (зелёный, золото)
 * не темизируем. WHITE оставлен литералом: это белый текст/иконки поверх
 * фотографий и зелёных шапок, он белый в любой теме. Фон карточек —
 * SURFACE (он и темнеет в тёмной теме).
 */
export const CREAM = "var(--cream)";
export const SURFACE = "var(--surface)";
export const WHITE = "#FFFFFF";
export const TEXT = "var(--text)";
export const MUTED = "var(--muted)";
export const BORDER = "var(--border)";

/** Стекло поверх фотографии — на тёмной подложке. */
export const glass: CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.3)",
};

/** Стекло на светлом фоне: почти непрозрачное, чтобы текст читался. */
export const glassLight: CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(20px)",
  border: "1px solid var(--glass-border)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
};

/** Затемнённое стекло для панелей поверх карты и фотографий. */
export const glassDark: CSSProperties = {
  background: "rgba(0,0,0,0.22)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.18)",
};

/**
 * Цвет текста, читаемый на заданной подложке.
 *
 * Карточки событий красятся цветом из данных, и на светлых (например,
 * золотом Навруза) белый текст сливался. Считаем яркость по sRGB;
 * если подложка — CSS-переменная, её значение здесь неизвестно, и мы
 * исходим из того, что акцент тёмный настолько, чтобы держать белый.
 */
export function контрастныйТекст(фон: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(фон.trim());
  if (!m) return WHITE;
  const n = parseInt(m[1], 16);
  const яркость = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return яркость > 0.62 ? "#14201d" : WHITE;
}

/**
 * Тот же цвет, но еле заметный — для подложек под значок или бейдж.
 *
 * Раньше писали `color + "18"`, и это работало только с шестизначным
 * hex: на CSS-переменной получалось `var(--accent)18`, то есть ничего.
 */
export function мягко(цвет: string, процент = 14): string {
  return `color-mix(in srgb, ${цвет} ${процент}%, transparent)`;
}
