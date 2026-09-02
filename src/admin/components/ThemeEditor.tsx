import { useState } from "react";
import { useTheme, ThemeVars, DEFAULTS } from "../context/ThemeContext";
import { PageHeader, Btn, Card, SectionTitle } from "./shared";

type PropDef = {
  key: keyof ThemeVars;
  label: string;
  type: "color" | "px" | "select" | "text";
  options?: string[];
};

const GROUPS: Array<{ title: string; props: PropDef[] }> = [
  {
    title: "Цвета",
    props: [
      { key: "colorBg", label: "Фон", type: "color" },
      { key: "colorSurface", label: "Поверхность", type: "color" },
      { key: "colorPanel", label: "Панель", type: "color" },
      { key: "colorBorder", label: "Граница", type: "color" },
      { key: "colorText", label: "Текст", type: "color" },
      { key: "colorMuted", label: "Приглушённый", type: "color" },
      { key: "colorDim", label: "Затемнённый", type: "color" },
      { key: "colorAmber", label: "Основной акцент", type: "color" },
      { key: "colorTeal", label: "Успех / активный", type: "color" },
      { key: "colorRose", label: "Опасность / ошибка", type: "color" },
    ],
  },
  {
    title: "Форма и отступы",
    props: [
      { key: "radiusCard", label: "Радиус карточки", type: "select", options: ["4px", "6px", "8px", "12px", "16px", "20px", "24px"] },
      { key: "radiusBtn", label: "Радиус кнопки", type: "select", options: ["0px", "4px", "6px", "8px", "12px", "9999px"] },
      { key: "spacingBase", label: "Отступ страницы", type: "select", options: ["16px", "20px", "24px", "28px", "32px", "40px"] },
      { key: "sidebarWidth", label: "Ширина сайдбара", type: "select", options: ["192px", "208px", "224px", "240px", "256px"] },
    ],
  },
  {
    title: "Типографика",
    props: [
      {
        key: "fontDisplay", label: "Шрифт заголовков", type: "select",
        options: ["'Fraunces', Georgia, serif", "'Playfair Display', Georgia, serif", "'DM Serif Display', Georgia, serif", "'Lora', Georgia, serif", "'DM Sans', system-ui, sans-serif"],
      },
      {
        key: "fontBody", label: "Шрифт текста", type: "select",
        options: ["'DM Sans', system-ui, sans-serif", "'Inter', system-ui, sans-serif", "'Outfit', system-ui, sans-serif", "'Poppins', system-ui, sans-serif", "'Work Sans', system-ui, sans-serif"],
      },
    ],
  },
];

const PRESETS: Array<{ name: string; theme: Partial<ThemeVars> }> = [
  {
    name: "Шёлковый путь (тёмная)",
    theme: {
      colorBg: "#09080a", colorSurface: "#110f14", colorPanel: "#181520",
      colorBorder: "#26223a", colorAmber: "#e8a030", colorTeal: "#18b89a",
      colorRose: "#e05a42", colorText: "#f4eefc", colorMuted: "#8070a0",
      colorDim: "#382e50", radiusCard: "10px", radiusBtn: "8px",
    },
  },
  {
    name: "Ночной синий",
    theme: {
      colorBg: "#080c14", colorSurface: "#0e1520", colorPanel: "#131d2a",
      colorBorder: "#1e2d3d", colorAmber: "#3b82f6", colorTeal: "#10b981",
      colorRose: "#ef4444", colorText: "#e8f0fe", colorMuted: "#6b8cae",
      colorDim: "#1e3a5f", radiusCard: "10px", radiusBtn: "8px",
    },
  },
  {
    name: "Тёплая слоновая кость",
    theme: {
      colorBg: "#faf8f4", colorSurface: "#f0ece4", colorPanel: "#e8e2d8",
      colorBorder: "#d4cec4", colorAmber: "#b5703a", colorTeal: "#2a7a6a",
      colorRose: "#c44444", colorText: "#1a1510", colorMuted: "#6a5a4a",
      colorDim: "#c8c2b8", radiusCard: "8px", radiusBtn: "6px",
    },
  },
  {
    name: "Изумрудный лес",
    theme: {
      colorBg: "#071210", colorSurface: "#0e1e1a", colorPanel: "#132820",
      colorBorder: "#1a3830", colorAmber: "#4ade80", colorTeal: "#34d399",
      colorRose: "#f87171", colorText: "#e0f0ec", colorMuted: "#6aaa94",
      colorDim: "#1a3828", radiusCard: "12px", radiusBtn: "8px",
    },
  },
  {
    name: "Пурпурный дворец",
    theme: {
      colorBg: "#120810", colorSurface: "#1e0e18", colorPanel: "#281420",
      colorBorder: "#3a1e2e", colorAmber: "#e83c8c", colorTeal: "#0fc2c0",
      colorRose: "#ff6b4a", colorText: "#f8e8f4", colorMuted: "#9a6a88",
      colorDim: "#3a1e30", radiusCard: "16px", radiusBtn: "9999px",
    },
  },
];

export default function ThemeEditor() {
  const { theme, setVar, resetTheme, history } = useTheme();
  const [selected, setSelected] = useState<keyof ThemeVars | null>(null);
  const [activeGroup, setActiveGroup] = useState("Цвета");
  const [tab, setTab] = useState<"editor" | "presets" | "history">("editor");

  const currentGroup = GROUPS.find(g => g.title === activeGroup)!;

  const applyPreset = (preset: typeof PRESETS[0]) => {
    Object.entries(preset.theme).forEach(([k, v]) => {
      setVar(k as keyof ThemeVars, v as string);
    });
  };

  const fontDisplayLabel = (val: string) => val.split(",")[0].replace(/'/g, "").trim();

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Визуальный редактор"
        subtitle="Нажмите на любое свойство для изменения — изменения применяются мгновенно"
        action={
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={resetTheme}>Сбросить</Btn>
            <Btn onClick={() => {
              const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "uztravel-theme.json"; a.click();
              URL.revokeObjectURL(url);
            }}>Экспорт темы</Btn>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-7">
        {([["editor", "Редактор"], ["presets", "Пресеты"], ["history", `История (${history.length})`]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{ background: tab === id ? "var(--color-amber)" : "var(--color-panel)", color: tab === id ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}
          >{label}</button>
        ))}
      </div>

      {tab === "editor" && (
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
          {/* Left: property panel */}
          <div className="flex flex-col gap-4">
            {/* Group tabs */}
            <div className="flex flex-col gap-0.5">
              {GROUPS.map(g => (
                <button key={g.title} onClick={() => setActiveGroup(g.title)}
                  className="text-left px-3 py-2 rounded text-sm cursor-pointer transition-all"
                  style={{
                    background: activeGroup === g.title ? "var(--color-panel)" : "transparent",
                    color: activeGroup === g.title ? "var(--color-amber)" : "var(--color-muted)",
                    borderLeft: activeGroup === g.title ? "2px solid var(--color-amber)" : "2px solid transparent",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {g.title}
                </button>
              ))}
            </div>

            {/* Property list */}
            <Card className="p-4">
              <SectionTitle>{activeGroup}</SectionTitle>
              <div className="flex flex-col gap-2">
                {currentGroup.props.map(prop => (
                  <div
                    key={prop.key}
                    className="flex flex-wrap items-center gap-2 rounded p-2 cursor-pointer transition-all"
                    style={{
                      background: selected === prop.key ? "var(--color-surface)" : "transparent",
                      border: `1px solid ${selected === prop.key ? "var(--color-amber)" : "transparent"}`,
                    }}
                    onClick={() => setSelected(selected === prop.key ? null : prop.key)}
                  >
                    {prop.type === "color" && (
                      <div
                        className="w-6 h-6 rounded border shrink-0"
                        style={{ background: theme[prop.key], border: "1px solid var(--color-border)" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{prop.label}</div>
                      <div className="text-xs truncate" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                        {prop.type === "select" && prop.options?.includes(theme[prop.key])
                          ? theme[prop.key]
                          : prop.type === "color"
                            ? theme[prop.key]
                            : fontDisplayLabel(theme[prop.key])}
                      </div>
                    </div>
                    <span style={{ color: "var(--color-dim)", fontSize: "12px" }}>{selected === prop.key ? "▾" : "▸"}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: editor + live preview */}
          <div className="flex flex-col gap-5">
            {/* Editor for selected prop */}
            {selected && (() => {
              const prop = GROUPS.flatMap(g => g.props).find(p => p.key === selected)!;
              if (!prop) return null;
              return (
                <Card className="p-5">
                  <SectionTitle>Изменить: {prop.label}</SectionTitle>
                  {prop.type === "color" && (
                    <div className="flex flex-wrap items-start gap-4">
                      <input
                        type="color"
                        value={theme[selected]}
                        onChange={e => setVar(selected, e.target.value)}
                        className="w-16 h-16 rounded cursor-pointer border-none outline-none"
                        style={{ background: "transparent", border: "none" }}
                      />
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={theme[selected]}
                          onChange={e => {
                            if (/^#[0-9a-fA-F]{0,8}$/.test(e.target.value)) {
                              setVar(selected, e.target.value);
                            }
                          }}
                          className="w-full rounded px-3 py-2 text-sm outline-none mb-2"
                          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-mono)" }}
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {["#d4872a", "#2a8d7a", "#c45a42", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#ffffff", "#000000"].map(c => (
                            <button key={c} onClick={() => setVar(selected, c)}
                              className="w-5 h-5 rounded cursor-pointer hover:scale-110 transition-transform border"
                              style={{ background: c, border: theme[selected] === c ? "2px solid var(--color-text)" : "1px solid var(--color-border)" }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {prop.type === "select" && (
                    <div className="flex flex-wrap gap-2">
                      {prop.options?.map(opt => (
                        <button key={opt} onClick={() => setVar(selected, opt)}
                          className="px-3 py-2 rounded text-xs cursor-pointer transition-all"
                          style={{
                            background: theme[selected] === opt ? "var(--color-amber)" : "var(--color-surface)",
                            color: theme[selected] === opt ? "#0d0c0a" : "var(--color-muted)",
                            border: "1px solid var(--color-border)",
                            fontFamily: prop.key.includes("font") ? opt.split(",")[0].replace(/'/g, "").trim() : "var(--font-mono)",
                          }}
                        >
                          {prop.key.includes("font") ? opt.split(",")[0].replace(/'/g, "").trim() : opt}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn variant="ghost" small onClick={() => setVar(selected, (DEFAULTS as ThemeVars)[selected])}>
                      Сбросить
                    </Btn>
                    <Btn variant="ghost" small onClick={() => setSelected(null)}>Готово</Btn>
                  </div>
                </Card>
              );
            })()}

            {/* Live component preview */}
            <Card className="p-6">
              <SectionTitle>Предпросмотр</SectionTitle>
              <div className="flex flex-col gap-5">
                {/* Buttons */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>КНОПКИ</div>
                  <div className="flex gap-3 flex-wrap">
                    <button className="px-4 py-2 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "var(--color-amber)", color: "#0d0c0a", borderRadius: "var(--radius-btn)", border: "none", fontFamily: "var(--font-body)" }}>
                      Основной
                    </button>
                    <button className="px-4 py-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "transparent", color: "var(--color-muted)", borderRadius: "var(--radius-btn)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}>
                      Вторичный
                    </button>
                    <button className="px-4 py-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "rgba(196,90,66,0.15)", color: "var(--color-rose)", borderRadius: "var(--radius-btn)", border: "1px solid rgba(196,90,66,0.3)", fontFamily: "var(--font-body)" }}>
                      Опасность
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>КАРТОЧКА</div>
                  <div className="rounded p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)" }}>
                    <div className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                      Samarkand — Registan Square
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                      The Registan was the ancient heart of the Silk Road city of Samarkand, now in Uzbekistan.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(212,135,42,0.15)", color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>active</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(42,141,122,0.15)", color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>featured</span>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ТИПОГРАФИКА</div>
                  <div className="space-y-1">
                    <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Заголовок</div>
                    <div className="text-base" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>Основной текст — читабелен в любом размере</div>
                    <div className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>MONO LABEL — BK-2640 — $890.00</div>
                  </div>
                </div>

                {/* Color palette */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ПАЛИТРА</div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "Фон", val: theme.colorBg },
                      { label: "Поверхность", val: theme.colorSurface },
                      { label: "Панель", val: theme.colorPanel },
                      { label: "Граница", val: theme.colorBorder },
                      { label: "Текст", val: theme.colorText },
                      { label: "Приглушённый", val: theme.colorMuted },
                      { label: "Затемнённый", val: theme.colorDim },
                      { label: "Основной", val: theme.colorAmber },
                      { label: "Успех", val: theme.colorTeal },
                      { label: "Опасность", val: theme.colorRose },
                    ].map(c => (
                      <div key={c.label} className="flex flex-col items-center gap-1">
                        <div
                          className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform"
                          style={{ background: c.val, border: "1px solid rgba(255,255,255,0.1)" }}
                          onClick={() => {
                            const propKey = Object.entries(theme).find(([, v]) => v === c.val)?.[0] as keyof ThemeVars;
                            if (propKey) setSelected(propKey);
                          }}
                        />
                        <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "9px" }}>{c.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "presets" && (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
          {PRESETS.map(preset => (
            <div key={preset.name}
              className="rounded-xl overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{ border: "1px solid var(--color-border)" }}
            >
              {/* Color preview */}
              <div className="h-28 relative" style={{ background: preset.theme.colorBg ?? "#0d0c0a" }}>
                {/* Mock sidebar */}
                <div className="absolute left-0 top-0 bottom-0 w-16" style={{ background: preset.theme.colorSurface ?? "#151410", borderRight: `1px solid ${preset.theme.colorBorder ?? "#2a261e"}` }}>
                  <div className="mt-3 mx-2 flex flex-col gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-1.5 rounded-full" style={{ background: i === 1 ? (preset.theme.colorAmber ?? "#d4872a") : (preset.theme.colorDim ?? "#4a4237"), width: i === 1 ? "80%" : `${50 + i * 8}%` }} />
                    ))}
                  </div>
                </div>
                {/* Mock content */}
                <div className="absolute left-20 top-3 right-3">
                  <div className="h-3 w-24 rounded mb-2" style={{ background: preset.theme.colorText ?? "#f0ebe0", opacity: 0.9 }} />
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[preset.theme.colorAmber, preset.theme.colorTeal, preset.theme.colorRose].map((c, i) => (
                      <div key={i} className="h-10 min-w-0 flex-1 rounded" style={{ background: preset.theme.colorPanel ?? "#1c1a15", border: `1px solid ${preset.theme.colorBorder ?? "#2a261e"}` }}>
                        <div className="h-1 mt-3 mx-2 rounded" style={{ background: c ?? "#d4872a", opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4" style={{ background: "var(--color-panel)" }}>
                <div className="font-medium text-sm mb-1" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>{preset.name}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[preset.theme.colorAmber, preset.theme.colorTeal, preset.theme.colorRose, preset.theme.colorPanel, preset.theme.colorBg].map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c ?? "#000" }} />
                  ))}
                </div>
                <Btn small onClick={() => applyPreset(preset)}>Применить</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <Card className="p-5 max-w-2xl">
          <SectionTitle>История изменений</SectionTitle>
          {history.length === 0 ? (
            <div className="text-sm text-center py-8" style={{ color: "var(--color-muted)" }}>История пуста — начните редактировать</div>
          ) : (
            <div className="flex flex-col gap-0">
              {history.map((h, i) => {
                const prop = GROUPS.flatMap(g => g.props).find(p => p.key === h.key);
                const isColor = prop?.type === "color";
                return (
                  <div key={i} className="flex flex-wrap items-center gap-3 py-2.5 text-sm" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div
                      className="text-xs rounded px-2 py-0.5 shrink-0"
                      style={{ background: "var(--color-surface)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      {new Date(h.ts).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ color: "var(--color-text)" }}>{prop?.label ?? h.key}</span>
                      <span className="mx-2" style={{ color: "var(--color-muted)" }}>изменено</span>
                    </div>
                    {isColor ? (
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <div className="w-4 h-4 rounded-sm border" style={{ background: h.from, border: "1px solid var(--color-border)" }} />
                        <span style={{ color: "var(--color-dim)" }}>→</span>
                        <div className="w-4 h-4 rounded-sm border" style={{ background: h.to, border: "1px solid var(--color-border)" }} />
                      </div>
                    ) : (
                      <div className="text-xs flex flex-wrap gap-1.5 items-center shrink-0" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                        <span>{h.from}</span>
                        <span style={{ color: "var(--color-dim)" }}>→</span>
                        <span style={{ color: "var(--color-amber)" }}>{h.to}</span>
                      </div>
                    )}
                    <button
                      className="text-xs cursor-pointer hover:opacity-70 shrink-0"
                      style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}
                      onClick={() => setVar(h.key, h.from)}
                    >
                      отменить
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
