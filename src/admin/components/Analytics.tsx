import { useState } from "react";
import { PageHeader, Card, SectionTitle } from "./shared";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен"];

const USERS_DATA   = [820, 1040, 1380, 1720, 2100, 2640, 3180, 3850, 4420];
const REVENUE_DATA = [18200, 24600, 31400, 38800, 51200, 63700, 74900, 84600, 91240];
const SESSIONS_DATA= [3400, 4100, 5600, 7200, 9800, 12400, 15600, 18900, 21400];
const BOOKINGS_DATA= [124, 187, 246, 312, 398, 487, 561, 634, 712];

const DEVICES = [
  { label: "iOS", pct: 52, color: "#7a8fff" },
  { label: "Android", pct: 35, color: "var(--color-teal)" },
  { label: "Web", pct: 13, color: "var(--color-amber)" },
];

const GEO = [
  { country: "Uzbekistan", flag: "🇺🇿", users: 4820, pct: 26 },
  { country: "Russia", flag: "🇷🇺", users: 3640, pct: 20 },
  { country: "Kazakhstan", flag: "🇰🇿", users: 2910, pct: 16 },
  { country: "China", flag: "🇨🇳", users: 2100, pct: 11 },
  { country: "Germany", flag: "🇩🇪", users: 1480, pct: 8 },
  { country: "UAE", flag: "🇦🇪", users: 1200, pct: 7 },
  { country: "UK", flag: "🇬🇧", users: 980, pct: 5 },
  { country: "Прочие", flag: "🌐", users: 1372, pct: 7 },
];

const FUNNEL = [
  { label: "Открытия приложения", val: 21400, pct: 100 },
  { label: "Поиск / просмотр", val: 14800, pct: 69 },
  { label: "Просмотр направления", val: 9200, pct: 43 },
  { label: "Открыт тур", val: 5600, pct: 26 },
  { label: "Начало бронирования", val: 2100, pct: 10 },
  { label: "Оплата завершена", val: 1480, pct: 7 },
];

const TOP_PAGES = [
  { page: "Samarkand destination", views: 18400, bounce: "28%", avg: "4m 12s" },
  { page: "Silk Road Classic tour", views: 14200, bounce: "22%", avg: "5m 48s" },
  { page: "Registan Sunrise tour", views: 11800, bounce: "31%", avg: "3m 55s" },
  { page: "Bukhara destination", views: 9600, bounce: "35%", avg: "3m 20s" },
  { page: "Transport Hub", views: 8200, bounce: "42%", avg: "2m 10s" },
  { page: "Hotels — Samarkand", views: 7100, bounce: "38%", avg: "2m 45s" },
];

const RETENTION = [
  [100, 42, 31, 24, 18, 15, 13, 12],
  [100, 44, 33, 25, 20, 16, 14, 0],
  [100, 46, 35, 27, 21, 17, 0, 0],
  [100, 48, 37, 28, 22, 0, 0, 0],
  [100, 50, 38, 29, 0, 0, 0, 0],
  [100, 51, 39, 0, 0, 0, 0, 0],
  [100, 53, 0, 0, 0, 0, 0, 0],
  [100, 0, 0, 0, 0, 0, 0, 0],
];

type Metric = "users" | "revenue" | "sessions" | "bookings";

const METRIC_CONFIG: Record<Metric, { label: string; data: number[]; color: string; format: (v: number) => string }> = {
  users:    { label: "Новые польз.",  data: USERS_DATA,    color: "var(--color-teal)",  format: v => v.toLocaleString() },
  revenue:  { label: "Выручка",       data: REVENUE_DATA,  color: "var(--color-amber)", format: v => "$" + (v / 1000).toFixed(1) + "k" },
  sessions: { label: "Сессии",        data: SESSIONS_DATA, color: "#7a8fff",            format: v => v.toLocaleString() },
  bookings: { label: "Бронирования",  data: BOOKINGS_DATA, color: "var(--color-rose)",  format: v => v.toLocaleString() },
};

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 48, w = 160;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${h} ` + pts + ` ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, "")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min + 1)) * h;
        return i === data.length - 1 ? <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="var(--color-panel)" strokeWidth="2" /> : null;
      })}
    </svg>
  );
}

function LineChart({ data, color, height = 120 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 600;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / (max - min + 1)) * (height - 8);
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${height} ` + pts + ` ${w},${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lcgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1="0" y1={height * f} x2={w} y2={height * f}
          stroke="var(--color-border)" strokeWidth="0.5" />
      ))}
      <polygon points={area} fill="url(#lcgrad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = height - ((v - min) / (max - min + 1)) * (height - 8);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="var(--color-panel)" strokeWidth="2" />;
      })}
    </svg>
  );
}

export default function Analytics() {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [period, setPeriod] = useState("9M");
  const cfg = METRIC_CONFIG[metric];
  const current = cfg.data[cfg.data.length - 1];
  const prev = cfg.data[cfg.data.length - 2];
  const change = (((current - prev) / prev) * 100).toFixed(1);

  return (
    <div className="p-7">
      <PageHeader
        title="Аналитика"
        subtitle="Привлечение, удержание, выручка и вовлечённость"
      />

      {/* KPI sparklines */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {(Object.entries(METRIC_CONFIG) as Array<[Metric, typeof cfg]>).map(([key, c]) => {
          const cur = c.data[c.data.length - 1];
          const prv = c.data[c.data.length - 2];
          const chg = (((cur - prv) / prv) * 100).toFixed(1);
          return (
            <div
              key={key}
              onClick={() => setMetric(key)}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                background: "var(--color-panel)",
                border: `1px solid ${metric === key ? c.color : "var(--color-border)"}`,
                boxShadow: metric === key ? `0 0 0 1px ${c.color}33` : "none",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{c.label.toUpperCase()}</div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: metric === key ? c.color : "var(--color-text)" }}>
                    {c.format(cur)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>
                    ↑ {chg}% vs пред. месяц
                  </div>
                </div>
              </div>
              <SparkLine data={c.data} color={c.color} />
            </div>
          );
        })}
      </div>

      {/* Main trend chart */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <SectionTitle>{cfg.label} — динамика</SectionTitle>
            <div className="flex items-baseline gap-2 -mt-2">
              <span className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: cfg.color }}>
                {cfg.format(current)}
              </span>
              <span className="text-sm" style={{ color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>
                +{change}% в этом месяце
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {["3M", "6M", "9M", "1Y"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
                style={{
                  background: period === p ? cfg.color : "var(--color-surface)",
                  color: period === p ? "#0d0c0a" : "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-mono)",
                }}
              >{p}</button>
            ))}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <LineChart data={cfg.data} color={cfg.color} height={140} />
          <div className="flex justify-between mt-2 px-1">
            {MONTHS.map(m => (
              <span key={m} className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{m}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Middle row */}
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Conversion funnel */}
        <Card className="p-5">
          <SectionTitle>Воронка конверсии</SectionTitle>
          <div className="flex flex-col gap-2">
            {FUNNEL.map((step, i) => (
              <div key={step.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--color-muted)" }}>{step.label}</span>
                  <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
                    {step.val.toLocaleString()} <span style={{ color: "var(--color-muted)" }}>({step.pct}%)</span>
                  </span>
                </div>
                <div className="h-5 rounded overflow-hidden relative" style={{ background: "var(--color-surface)" }}>
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${step.pct}%`,
                      background: i === 0
                        ? "var(--color-dim)"
                        : i === FUNNEL.length - 1
                          ? "var(--color-teal)"
                          : `rgba(212,135,42,${0.15 + (i / FUNNEL.length) * 0.6})`,
                    }}
                  />
                  {i > 0 && (
                    <span
                      className="absolute right-2 top-0 bottom-0 flex items-center text-xs"
                      style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}
                    >
                      {i > 0 ? `${Math.round((step.val / FUNNEL[i-1].val) * 100)}%` : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Device breakdown */}
        <Card className="p-5">
          <SectionTitle>Устройства</SectionTitle>
          <div className="flex flex-col items-center mb-4">
            {/* Simple donut using conic-gradient */}
            <div
              className="w-32 h-32 rounded-full mb-4"
              style={{
                background: `conic-gradient(
                  #7a8fff 0% ${DEVICES[0].pct}%,
                  var(--color-teal) ${DEVICES[0].pct}% ${DEVICES[0].pct + DEVICES[1].pct}%,
                  var(--color-amber) ${DEVICES[0].pct + DEVICES[1].pct}% 100%
                )`,
                mask: "radial-gradient(circle at center, transparent 44px, black 44px)",
                WebkitMask: "radial-gradient(circle at center, transparent 44px, black 44px)",
              }}
            />
            <div className="flex flex-col gap-2 w-full">
              {DEVICES.map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                  <span className="flex-1 text-sm" style={{ color: "var(--color-muted)" }}>{d.label}</span>
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Geography */}
        <Card className="p-5">
          <SectionTitle>Пользователи по странам</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {GEO.map(g => (
              <div key={g.country} className="flex items-center gap-2.5">
                <span className="text-base shrink-0">{g.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--color-muted)" }}>{g.country}</span>
                    <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{g.users.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                    <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: "var(--color-amber)", opacity: 0.5 + g.pct * 0.02 }} />
                  </div>
                </div>
                <span className="text-xs w-7 text-right shrink-0" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Retention heatmap */}
        <Card className="p-5">
          <SectionTitle>Когорты удержания</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3 font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>Когорта</th>
                  {["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7"].map(w => (
                    <th key={w} className="py-1 px-1 font-medium text-center" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RETENTION.map((row, ri) => (
                  <tr key={ri}>
                    <td className="py-1 pr-3 whitespace-nowrap" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                      {MONTHS[ri]}
                    </td>
                    {row.map((val, ci) => (
                      <td key={ci} className="py-1 px-1">
                        {val > 0 ? (
                          <div
                            className="rounded text-center py-0.5 px-1"
                            style={{
                              background: val === 100
                                ? "var(--color-dim)"
                                : `rgba(212,135,42,${val / 100})`,
                              color: val > 40 ? "var(--color-text)" : "var(--color-muted)",
                              fontFamily: "var(--font-mono)",
                              fontSize: "10px",
                              minWidth: "28px",
                            }}
                          >
                            {val}%
                          </div>
                        ) : (
                          <div className="rounded py-0.5 px-1 text-center" style={{ color: "var(--color-dim)", fontSize: "10px" }}>—</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top pages */}
        <Card className="p-5">
          <SectionTitle>Топ страниц</SectionTitle>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Страница", "Просмотры", "Отказы", "Ср. время"].map(h => (
                  <th key={h} className="text-left pb-2 font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PAGES.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td className="py-2 pr-2">
                    <div className="truncate max-w-[140px]" style={{ color: "var(--color-text)" }}>{p.page}</div>
                  </td>
                  <td className="py-2 pr-2" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>{p.views.toLocaleString()}</td>
                  <td className="py-2 pr-2" style={{ fontFamily: "var(--font-mono)", color: parseInt(p.bounce) < 30 ? "var(--color-teal)" : "var(--color-muted)" }}>{p.bounce}</td>
                  <td className="py-2" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>{p.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
