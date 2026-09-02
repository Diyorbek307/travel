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
export const GOLD = "#E9C46A";
export const CREAM = "#F5F1E6";
export const WHITE = "#FFFFFF";
export const TEXT = "#2B2B2B";
export const MUTED = "#7A6E5F";
export const BORDER = "#EDE8DC";

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
