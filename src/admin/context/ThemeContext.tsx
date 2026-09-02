"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeVars = {
  colorBg: string;
  colorSurface: string;
  colorPanel: string;
  colorBorder: string;
  colorAmber: string;
  colorTeal: string;
  colorRose: string;
  colorText: string;
  colorMuted: string;
  colorDim: string;
  radiusCard: string;
  radiusBtn: string;
  fontDisplay: string;
  fontBody: string;
  sidebarWidth: string;
  headerHeight: string;
  spacingBase: string;
};

export const DARK_THEME: ThemeVars = {
  colorBg: "#09080a",
  colorSurface: "#110f14",
  colorPanel: "#181520",
  colorBorder: "#26223a",
  colorAmber: "#e8a030",
  colorTeal: "#18b89a",
  colorRose: "#e05a42",
  colorText: "#f4eefc",
  colorMuted: "#8070a0",
  colorDim: "#382e50",
  radiusCard: "10px",
  radiusBtn: "8px",
  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
  sidebarWidth: "224px",
  headerHeight: "56px",
  spacingBase: "28px",
};

export const LIGHT_THEME: ThemeVars = {
  colorBg: "#f7f4fc",
  colorSurface: "#eeeaf6",
  colorPanel: "#e4dfef",
  colorBorder: "#ccc6de",
  colorAmber: "#c07010",
  colorTeal: "#0e8a72",
  colorRose: "#c03828",
  colorText: "#150f22",
  colorMuted: "#6a5a88",
  colorDim: "#c0b8d4",
  radiusCard: "8px",
  radiusBtn: "6px",
  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
  sidebarWidth: "224px",
  headerHeight: "56px",
  spacingBase: "28px",
};

const DEFAULTS = DARK_THEME;

type ThemeContextType = {
  theme: ThemeVars;
  isDark: boolean;
  setVar: (key: keyof ThemeVars, val: string) => void;
  resetTheme: () => void;
  toggleMode: () => void;
  history: Array<{ key: keyof ThemeVars; from: string; to: string; ts: number }>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULTS,
  isDark: true,
  setVar: () => {},
  resetTheme: () => {},
  toggleMode: () => {},
  history: [],
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("uz-admin-mode") !== "light"; } catch { return true; }
  });

  const [theme, setTheme] = useState<ThemeVars>(() => {
    try {
      const saved = localStorage.getItem("uz-admin-theme");
      const base = isDark ? DARK_THEME : LIGHT_THEME;
      return saved ? { ...base, ...JSON.parse(saved) } : base;
    } catch {
      return DEFAULTS;
    }
  });
  const [history, setHistory] = useState<ThemeContextType["history"]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-bg", theme.colorBg);
    root.style.setProperty("--color-surface", theme.colorSurface);
    root.style.setProperty("--color-panel", theme.colorPanel);
    root.style.setProperty("--color-border", theme.colorBorder);
    root.style.setProperty("--color-amber", theme.colorAmber);
    root.style.setProperty("--color-teal", theme.colorTeal);
    root.style.setProperty("--color-rose", theme.colorRose);
    root.style.setProperty("--color-text", theme.colorText);
    root.style.setProperty("--color-muted", theme.colorMuted);
    root.style.setProperty("--color-dim", theme.colorDim);
    root.style.setProperty("--radius-card", theme.radiusCard);
    root.style.setProperty("--radius-btn", theme.radiusBtn);
    root.style.setProperty("--font-display", theme.fontDisplay);
    root.style.setProperty("--font-body", theme.fontBody);
    root.style.setProperty("--sidebar-width", theme.sidebarWidth);
    try { localStorage.setItem("uz-admin-theme", JSON.stringify(theme)); } catch {}
  }, [theme]);

  const toggleMode = () => {
    const next = !isDark;
    setIsDark(next);
    setTheme(next ? DARK_THEME : LIGHT_THEME);
    try { localStorage.setItem("uz-admin-mode", next ? "dark" : "light"); } catch {}
  };

  const setVar = (key: keyof ThemeVars, val: string) => {
    setTheme((prev) => {
      const entry = { key, from: prev[key], to: val, ts: Date.now() };
      setHistory((h) => [entry, ...h].slice(0, 50));
      return { ...prev, [key]: val };
    });
  };

  const resetTheme = () => {
    setTheme(isDark ? DARK_THEME : LIGHT_THEME);
    setHistory([]);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setVar, resetTheme, toggleMode, history }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { DEFAULTS };
