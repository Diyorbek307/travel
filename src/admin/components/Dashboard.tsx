import { useState } from "react";
import { StatCard, PageHeader, Badge, Card, SectionTitle } from "./shared";

const recentBookings = [
  { name: "Alisher Nazarov", tour: "Silk Road Classic", date: "Sep 1", amount: "$890", status: "confirmed", avatar: "A" },
  { name: "Maria Chen", tour: "Registan Sunrise", date: "Sep 1", amount: "$450", status: "pending", avatar: "M" },
  { name: "James Walker", tour: "Fergana Valley", date: "Aug 31", amount: "$1,240", status: "confirmed", avatar: "J" },
  { name: "Fatima Al-Hassan", tour: "Bukhara Heritage", date: "Aug 31", amount: "$670", status: "confirmed", avatar: "F" },
  { name: "Dmitri Volkov", tour: "Khiva Night Tour", date: "Aug 30", amount: "$320", status: "cancelled", avatar: "D" },
  { name: "Yuki Tanaka", tour: "Nurata Trek", date: "Aug 30", amount: "$1,860", status: "confirmed", avatar: "Y" },
];

const topDestinations = [
  { name: "Samarkand", visits: 4820, change: "+8%", img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=80&h=80&fit=crop&auto=format" },
  { name: "Bukhara", visits: 3640, change: "+5%", img: "https://images.unsplash.com/photo-1662468752704-f256cf5c6784?w=80&h=80&fit=crop&auto=format" },
  { name: "Khiva", visits: 2910, change: "+12%", img: "https://images.unsplash.com/photo-1557841621-d9f6673405ed?w=80&h=80&fit=crop&auto=format" },
  { name: "Tashkent", visits: 2100, change: "+3%", img: "https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=80&h=80&fit=crop&auto=format" },
  { name: "Fergana", visits: 1840, change: "+18%", img: "https://images.unsplash.com/photo-1677156811762-842312963ecd?w=80&h=80&fit=crop&auto=format" },
];

const REVENUE_DATA = [
  { month: "Мар", val: 28400 },
  { month: "Апр", val: 42100 },
  { month: "Май", val: 55300 },
  { month: "Июн", val: 61800 },
  { month: "Июл", val: 78200 },
  { month: "Авг", val: 84600 },
  { month: "Сен", val: 91240 },
];

const BOOKING_TYPES = [
  { label: "Культурные туры", pct: 42, color: "var(--color-amber)" },
  { label: "Приключения", pct: 24, color: "var(--color-teal)" },
  { label: "Только отели", pct: 18, color: "#7a5fd4" },
  { label: "Ремёсла и еда", pct: 10, color: "var(--color-rose)" },
  { label: "Прочее", pct: 6, color: "var(--color-dim)" },
];

const HEATMAP = [
  [3, 5, 4, 8, 9, 7, 6],
  [2, 4, 6, 9, 8, 5, 3],
  [4, 7, 9, 10, 7, 6, 4],
  [5, 8, 10, 9, 8, 7, 5],
  [3, 6, 8, 7, 5, 4, 2],
];
const HEATMAP_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HEATMAP_WEEKS = ["Н1", "Н2", "Н3", "Н4", "Н5"];

export default function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const maxRev = Math.max(...REVENUE_DATA.map(d => d.val));

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Обзор"
        subtitle={`${new Date().toLocaleDateString("ru", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} — активные операции`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="ВСЕГО БРОНИРОВАНИЙ" value="2,847" change="12.4%" positive sub="к прошлому месяцу" />
        <StatCard label="АКТИВНЫХ ТУРОВ" value="34" change="3" positive sub="новых за неделю" />
        <StatCard label="ВЫРУЧКА ЗА МЕСЯЦ" value="$91,240" change="8.1%" positive sub="к авг 2026" />
        <StatCard label="ЗАРЕГИСТРИРОВАННЫХ" value="18,562" change="2.3%" positive sub="темп роста" />
      </div>

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
        {/* Revenue chart */}
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <SectionTitle>Выручка — 2026</SectionTitle>
            <div className="text-xs font-semibold" style={{ color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>
              +8.1% ↑
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-1.5" style={{ height: "120px" }}>
            {REVENUE_DATA.map((d, i) => {
              const pct = (d.val / maxRev) * 100;
              const isHovered = hoveredBar === i;
              const isCurrent = i === REVENUE_DATA.length - 1;
              return (
                <div
                  key={d.month}
                  className="min-w-0 flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {isHovered && (
                    <div
                      className="text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-mono)", fontSize: "10px" }}
                    >
                      ${(d.val / 1000).toFixed(1)}k
                    </div>
                  )}
                  {!isHovered && <div style={{ height: "20px" }} />}
                  <div className="w-full flex items-end" style={{ height: "80px" }}>
                    <div
                      className="w-full rounded-t transition-all duration-200"
                      style={{
                        height: `${pct}%`,
                        background: isCurrent
                          ? "var(--color-amber)"
                          : isHovered
                            ? "var(--color-teal)"
                            : "var(--color-dim)",
                        minHeight: "4px",
                        opacity: hoveredBar !== null && !isHovered && !isCurrent ? 0.5 : 1,
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Booking types donut-style */}
        <Card className="p-5">
          <SectionTitle>Структура бронирований</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {BOOKING_TYPES.map(t => (
              <div key={t.label} className="flex items-center gap-3 flex-wrap">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                <div className="min-w-0 flex-1 text-sm" style={{ color: "var(--color-muted)" }}>{t.label}</div>
                <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full sm:w-28" style={{ background: "var(--color-dim)" }}>
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
                <div className="text-xs w-7 text-right shrink-0" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{t.pct}%</div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-4 flex items-center justify-between text-xs"
            style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
          >
            <span>Всего бронирований: 2,847</span>
            <span style={{ color: "var(--color-teal)" }}>Сен 2026</span>
          </div>
        </Card>
      </div>

      {/* Booking heatmap */}
      <Card className="p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <SectionTitle>Тепловая карта — этот месяц</SectionTitle>
          <div
            className="flex flex-wrap shrink-0 items-center gap-1.5 text-xs sm:gap-2"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
          >
            {/* На узком экране подписи прячем: шкала цветом читается и без них. */}
            <span className="hidden sm:inline">Низко</span>
            {[0.2, 0.4, 0.6, 0.8, 1].map(o => (
              <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(212,135,42,${o})` }} />
            ))}
            <span className="hidden sm:inline">Высоко</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1.5 justify-around pt-6">
            {HEATMAP_WEEKS.map(w => (
              <div key={w} className="text-xs h-5 flex items-center" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)", width: "20px" }}>{w}</div>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {HEATMAP_DAYS.map(d => (
                <div key={d} className="min-w-0 flex-1 text-center text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{d}</div>
              ))}
            </div>
            {HEATMAP.map((week, wi) => (
              <div key={wi} className="flex flex-wrap gap-1.5 mb-1.5">
                {week.map((val, di) => (
                  <div
                    key={di}
                    className="min-w-0 flex-1 h-5 rounded-sm cursor-default transition-transform hover:scale-110"
                    title={`${val} бронирований`}
                    style={{ background: `rgba(212,135,42,${val / 10})` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))" }}>
        {/* Recent bookings */}
        <Card>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <SectionTitle>Последние бронирования</SectionTitle>
            <button
              onClick={() => onNavigate("bookings")}
              className="text-xs cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}
            >
              Все →
            </button>
          </div>
          {recentBookings.map((b, i) => (
            <div
              key={i}
              className="px-5 py-3 flex flex-wrap items-center gap-3 transition-colors cursor-pointer"
              style={{ borderTop: "1px solid var(--color-border)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
              >
                {b.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{b.name}</div>
                <div className="text-xs truncate" style={{ color: "var(--color-muted)" }}>{b.tour}</div>
              </div>
              <div className="text-xs shrink-0" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{b.date}</div>
              <div className="text-sm font-medium shrink-0" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{b.amount}</div>
              <Badge label={b.status} color={b.status === "confirmed" ? "teal" : b.status === "pending" ? "amber" : "rose"} />
            </div>
          ))}
        </Card>

        {/* Right: destinations + live pulse */}
        <div className="flex flex-col gap-5">
          {/* Top destinations */}
          <Card className="p-5">
            <SectionTitle>Топ направлений</SectionTitle>
            <div className="flex flex-col gap-3">
              {topDestinations.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 flex-wrap">
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-8 h-8 rounded object-cover shrink-0"
                    style={{ background: "var(--color-dim)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{d.name}</span>
                      <span className="text-xs" style={{ color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>{d.change}</span>
                    </div>
                    <div className="w-full rounded-full mt-1.5 overflow-hidden" style={{ height: "3px", background: "var(--color-dim)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.visits / topDestinations[0].visits) * 100}%`,
                          background: i === 0 ? "var(--color-amber)" : "var(--color-teal)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    {(d.visits / 1000).toFixed(1)}k
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Live activity pulse */}
          <Card className="p-5">
            <SectionTitle>Активность</SectionTitle>
            <div className="flex flex-col gap-2">
              {[
                { icon: "◫", text: "Новое бронирование — Ахмед Халил", time: "2м", color: "var(--color-teal)" },
                { icon: "◈", text: "Юки Танака написал сообщение", time: "2ч", color: "var(--color-amber)" },
                { icon: "◇", text: "Оценка 5★ за тур к Аральскому морю", time: "3ч", color: "var(--color-amber)" },
                { icon: "▣", text: "Отель Малика заполнен на 92%", time: "4ч", color: "var(--color-rose)" },
                { icon: "◉", text: "Рейс QX-88 задержан на 45 мин", time: "4ч", color: "var(--color-rose)" },
              ].map((a, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2.5 text-xs py-1.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ color: a.color, fontSize: "10px" }}>{a.icon}</span>
                  <span className="min-w-0 flex-1 truncate" style={{ color: "var(--color-muted)" }}>{a.text}</span>
                  <span style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>{a.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
