import { useState } from "react";

type Screen = "home" | "destination" | "tour" | "restaurant" | "transport" | "profile";

const SCREENS: Array<{ id: Screen; label: string; icon: string }> = [
  { id: "home", label: "Главная", icon: "⬡" },
  { id: "destination", label: "Направление", icon: "◉" },
  { id: "tour", label: "Тур", icon: "◎" },
  { id: "restaurant", label: "Ресторан", icon: "◇" },
  { id: "transport", label: "Транспорт", icon: "◈" },
  { id: "profile", label: "Профиль", icon: "▣" },
];

function HomeScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: "linear-gradient(135deg, #0d0c0a 0%, #1c1a15 100%)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs opacity-60" style={{ color: "#f0ebe0" }}>Доброе утро,</div>
            <div className="text-base font-semibold" style={{ color: "#f0ebe0", fontFamily: "var(--font-display)" }}>Откройте Узбекистан</div>
          </div>
          <div className="w-8 h-8 rounded-full" style={{ background: "var(--color-amber)" }} />
        </div>
        {/* Search bar */}
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.08)" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>⌕</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Поиск городов, туров, отелей…</span>
        </div>
      </div>

      {/* Featured banner */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative" style={{ height: "140px", background: "#2a261e" }}>
        <img src="https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=400&h=280&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,12,10,0.85) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="text-xs font-medium" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ FEATURED</div>
          <div className="text-sm font-semibold mt-0.5" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>Samarkand</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Silk Road Classic — from $450</div>
        </div>
        <div className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--color-amber)", color: "#0d0c0a", fontFamily: "var(--font-mono)" }}>New</div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-4">
        <div className="text-xs font-medium mb-3" style={{ color: "var(--color-text)" }}>Категории</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Туры", "Отели", "Еда", "События", "Транспорт", "Карты"].map((c, i) => (
            <div key={c} className="shrink-0 rounded-xl px-3 py-2 text-center" style={{ background: i === 0 ? "var(--color-amber)" : "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div className="text-xs font-medium" style={{ color: i === 0 ? "#0d0c0a" : "var(--color-text)" }}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promoted restaurants */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs font-medium" style={{ color: "var(--color-text)" }}>Топ рестораны</div>
          <div className="text-xs" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>Все</div>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {[
            { name: "Плов Центр", rating: "4.9", tag: "★ Top", img: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=120&h=120&fit=crop&auto=format" },
            { name: "Samarkand Coffee", rating: "4.7", tag: "New", img: "https://images.unsplash.com/photo-1662468752704-f256cf5c6784?w=120&h=120&fit=crop&auto=format" },
            { name: "Bukhara Pilaf", rating: "4.8", tag: "", img: "https://images.unsplash.com/photo-1557841621-d9f6673405ed?w=120&h=120&fit=crop&auto=format" },
          ].map(r => (
            <div key={r.name} className="shrink-0 rounded-xl overflow-hidden" style={{ width: "110px", background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div className="relative h-16">
                <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
                {r.tag && <div className="absolute top-1 right-1 rounded px-1 text-xs font-bold" style={{ background: "var(--color-amber)", color: "#0d0c0a", fontSize: "8px" }}>{r.tag}</div>}
              </div>
              <div className="p-2">
                <div className="text-xs font-medium truncate" style={{ color: "var(--color-text)", fontSize: "10px" }}>{r.name}</div>
                <div className="text-xs" style={{ color: "var(--color-amber)", fontSize: "9px", fontFamily: "var(--font-mono)" }}>★ {r.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="px-4 mt-4 mb-4">
        <div className="text-xs font-medium mb-2.5" style={{ color: "var(--color-text)" }}>Предстоящие события</div>
        {[
          { name: "Ярмарка «Шёлк и специи»", date: "15–17 сен", city: "Самарканд" },
          { name: "Ферганский марафон", date: "5 ноя", city: "Фергана" },
        ].map(e => (
          <div key={e.name} className="flex gap-3 rounded-xl p-3 mb-2" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ background: "var(--color-amber)" }}>
              <div className="text-xs font-bold" style={{ color: "#0d0c0a", fontFamily: "var(--font-mono)", fontSize: "10px" }}>SEP</div>
              <div className="text-sm font-bold" style={{ color: "#0d0c0a", fontFamily: "var(--font-display)" }}>15</div>
            </div>
            <div>
              <div className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{e.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>📍 {e.city} · {e.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 flex items-center justify-around px-4 py-3 mt-auto" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        {["Главная", "Обзор", "Избранное", "Поездки", "Профиль"].map((item, i) => (
          <div key={item} className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 rounded-full" style={{ background: i === 0 ? "var(--color-amber)" : "var(--color-dim)" }} />
            <div className="text-xs" style={{ color: i === 0 ? "var(--color-amber)" : "var(--color-muted)", fontSize: "8px" }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DestinationScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative h-56 shrink-0" style={{ background: "var(--color-dim)" }}>
        <img src="https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=400&h=340&fit=crop&auto=format" alt="Samarkand" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,12,10,1) 0%, transparent 50%)" }} />
        <div className="absolute top-12 left-4 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <span style={{ color: "#fff", fontSize: "10px" }}>←</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xl font-semibold" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>Samarkand</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs" style={{ color: "var(--color-amber)" }}>★ 4.9</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>4,820 visitors</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4">
        <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>
          Один из древнейших постоянно обитаемых городов мира. Жемчужина Шёлкового пути.
        </p>

        <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
          {["Обзор", "Туры", "Отели", "Еда", "Карта"].map((t, i) => (
            <div key={t} className="shrink-0 rounded-full px-3 py-1 text-xs" style={{ background: i === 0 ? "var(--color-amber)" : "var(--color-panel)", border: "1px solid var(--color-border)", color: i === 0 ? "#0d0c0a" : "var(--color-muted)" }}>
              {t}
            </div>
          ))}
        </div>

        <div className="text-xs font-medium mb-2" style={{ color: "var(--color-text)" }}>Лучшие туры</div>
        {["Рассвет над Регистаном — $450", "Шёлковый путь — $890", "Прогулка по Шахи-Зинде — $120"].map(t => (
          <div key={t} className="rounded-xl px-3 py-2.5 mb-2 flex items-center justify-between" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs" style={{ color: "var(--color-text)" }}>{t.split(" — ")[0]}</div>
            <div className="text-xs font-medium" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>{t.split(" — ")[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransportScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-12 pb-4" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Транспорт</div>
        <div className="text-xs" style={{ color: "var(--color-muted)" }}>Рейсы, поезда, автобусы и такси</div>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { icon: "✈", label: "Рейсы", color: "var(--color-teal)" },
            { icon: "🚄", label: "Поезда", color: "var(--color-amber)" },
            { icon: "🚌", label: "Автобусы", color: "var(--color-rose)" },
            { icon: "🚕", label: "Такси", color: "#FC3F1D" },
          ].map(t => (
            <div key={t.label} className="rounded-xl p-4 flex flex-col items-center gap-2" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div className="text-2xl">{t.icon}</div>
              <div className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div className="text-xs font-medium mb-2.5" style={{ color: "var(--color-text)" }}>Ближайшие отправления</div>
        {[
          { type: "✈", from: "ТАШ", to: "СМД", dep: "14:00", price: "$45", status: "Вовремя" },
          { type: "🚄", from: "Ташкент", to: "Самарканд", dep: "15:30", price: "$18", status: "Вовремя" },
          { type: "🚌", from: "Ташкент", to: "Бухара", dep: "16:00", price: "$8", status: "Задержан" },
        ].map((r, i) => (
          <div key={i} className="rounded-xl p-3 mb-2 flex items-center gap-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <span>{r.type}</span>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{r.from} → {r.to}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{r.dep}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>{r.price}</div>
              <div className="text-xs" style={{ color: r.status === "Вовремя" ? "var(--color-teal)" : "var(--color-rose)" }}>{r.status}</div>
            </div>
          </div>
        ))}

        {/* Yandex Taxi */}
        <div className="rounded-xl p-4 mt-2" style={{ background: "#FC3F1D10", border: "1px solid #FC3F1D30" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-sm font-bold" style={{ background: "#FC3F1D" }}>Y</div>
            <div className="text-xs font-medium" style={{ color: "var(--color-text)" }}>Яндекс Такси</div>
            <div className="ml-auto text-xs" style={{ color: "#FC3F1D", fontFamily: "var(--font-mono)" }}>Подключено</div>
          </div>
          <div className="rounded-lg px-3 py-2.5 text-center text-xs font-medium" style={{ background: "#FC3F1D", color: "#fff" }}>
            Заказать такси
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericScreen({ title, subtitle, img }: { title: string; subtitle: string; img: string }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative h-52 shrink-0" style={{ background: "var(--color-dim)" }}>
        <img src={img} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,12,10,0.9) 0%, transparent 60%)" }} />
        <div className="absolute bottom-4 left-4">
          <div className="text-xl font-semibold" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{subtitle}</div>
        </div>
      </div>
      <div className="px-4 pt-4 flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl p-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="h-2.5 rounded mb-2" style={{ background: "var(--color-dim)", width: `${60 + i * 15}%` }} />
            <div className="h-2 rounded mb-1.5" style={{ background: "var(--color-dim)", width: "90%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dim)", width: "70%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppPreview() {
  const [screen, setScreen] = useState<Screen>("home");

  const renderScreen = () => {
    if (screen === "home") return <HomeScreen />;
    if (screen === "destination") return <DestinationScreen />;
    if (screen === "transport") return <TransportScreen />;
    if (screen === "tour") return <GenericScreen title="Шёлковый путь" subtitle="10 дней · от $1,890" img="https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=400&h=300&fit=crop&auto=format" />;
    if (screen === "restaurant") return <GenericScreen title="Плов Центр Тошкент" subtitle="Узбекская кухня · ★ 4.9" img="https://images.unsplash.com/photo-1662468752704-f256cf5c6784?w=400&h=300&fit=crop&auto=format" />;
    return <GenericScreen title="Профиль" subtitle="Ваши поездки и настройки" img="https://images.unsplash.com/photo-1557841621-d9f6673405ed?w=400&h=300&fit=crop&auto=format" />;
  };

  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Превью приложения</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>Живой предпросмотр отображения контента в мобильном приложении Uzbekistan Travel</p>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Screen selector */}
        <div className="flex flex-col gap-1.5 w-44 shrink-0">
          <div className="text-xs mb-2 tracking-widest uppercase font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            Экраны
          </div>
          {SCREENS.map(s => (
            <button key={s.id} onClick={() => setScreen(s.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-left cursor-pointer transition-all"
              style={{
                background: screen === s.id ? "var(--color-panel)" : "transparent",
                color: screen === s.id ? "var(--color-amber)" : "var(--color-muted)",
                borderLeft: screen === s.id ? "2px solid var(--color-amber)" : "2px solid transparent",
                border: "1px solid " + (screen === s.id ? "var(--color-border)" : "transparent"),
                borderLeftColor: screen === s.id ? "var(--color-amber)" : "transparent",
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}

          <div className="mt-4 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Изменения контента в админ-панели обновляются здесь в реальном времени.
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex flex-col items-center">
          {/* Phone frame */}
          <div
            className="relative rounded-[44px] overflow-hidden shadow-2xl"
            style={{
              width: "320px",
              height: "640px",
              background: "var(--color-bg)",
              border: "6px solid #1a1814",
              boxShadow: "0 0 0 1px #2a261e, 0 32px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* Notch */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-10 rounded-b-2xl"
              style={{ width: "100px", height: "28px", background: "#1a1814" }}
            />
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-2 z-10" style={{ height: "44px" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-px">
                  {[3, 4, 5, 6].map(h => <div key={h} className="w-0.5 rounded-sm" style={{ background: "var(--color-text)", height: `${h}px` }} />)}
                </div>
                <div className="w-3.5 h-2.5 rounded-sm border" style={{ borderColor: "var(--color-text)" }}>
                  <div className="h-full rounded-sm" style={{ background: "var(--color-text)", width: "80%" }} />
                </div>
              </div>
            </div>

            {/* Screen content */}
            <div className="absolute inset-0 overflow-hidden" style={{ paddingTop: "0px" }}>
              {renderScreen()}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full" style={{ width: "100px", height: "4px", background: "var(--color-dim)" }} />
          </div>

          <div className="mt-4 text-xs text-center" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            iPhone 15 Pro · экран {screen}
          </div>
        </div>

        {/* Notes panel */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-lg p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              Заметки к экрану
            </div>
            {screen === "home" && (
              <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
                <div className="flex gap-2"><span style={{ color: "var(--color-amber)" }}>★</span> Главный баннер — направления с featured=true</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-teal)" }}>↑</span> Продвигаемые рестораны отображаются первыми (платное продвижение)</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-teal)" }}>↑</span> Предстоящие события из панели «События»</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-amber)" }}>◈</span> Строка поиска подключена к глобальному поиск API</div>
              </div>
            )}
            {screen === "transport" && (
              <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
                <div className="flex gap-2"><span style={{ color: "#FC3F1D" }}>Y</span> Виджет Яндекс Такси активен при подключённом аккаунте</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-teal)" }}>✈</span> Данные рейсов из панели «Транспорт»</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-amber)" }}>🚄</span> Расписание поездов синхронизировано с API Узбекских железных дорог</div>
              </div>
            )}
            {screen === "destination" && (
              <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
                <div className="flex gap-2"><span style={{ color: "var(--color-amber)" }}>◈</span> Главное фото — из обложки в панели «Направления»</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-teal)" }}>↑</span> Туры отфильтрованы по текущему направлению</div>
                <div className="flex gap-2"><span style={{ color: "var(--color-amber)" }}>★</span> Рейтинг агрегирован из панели «Отзывы»</div>
              </div>
            )}
            {!["home", "transport", "destination"].includes(screen) && (
              <div className="text-xs" style={{ color: "var(--color-muted)" }}>Контент этого экрана управляется в соответствующей панели.</div>
            )}
          </div>

          <div className="rounded-lg p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              Статистика приложения
            </div>
            {[
              { label: "Загрузки приложения", val: "48 200" },
              { label: "Активных пользователей в месяц", val: "12 840" },
              { label: "Средняя сессия", val: "6 мин 22 с" },
              { label: "Без сбоев", val: "99.7%" },
              { label: "Рейтинг App Store", val: "★ 4.8 (1 240 отзывов)" },
              { label: "Рейтинг Play Store", val: "★ 4.7 (890 отзывов)" },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-xs py-1.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-muted)" }}>{s.label}</span>
                <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
