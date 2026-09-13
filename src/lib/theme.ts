import type { CSSProperties } from "react";

/**
 * Палитра макета.
 *
 * Те же значения продублированы в globals.css как CSS-переменные — здесь
 * они нужны там, где цвет вычисляется в JS (градиенты по маршрутам,
 * инлайновые стили карточек), а переменная не подойдёт.
 */
export const GREEN = "#2E7D5A";
export const GREEN_LIGHT = "#3A9E70";
/** Тёмный лес — плитка логотипа и подложка бренда. */
export const GREEN_DARK = "#164A30";
export const GOLD = "#E9C46A";

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
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.95)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

/** Затемнённое стекло для панелей поверх карты и фотографий. */
export const glassDark: CSSProperties = {
  background: "rgba(0,0,0,0.22)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.18)",
};
