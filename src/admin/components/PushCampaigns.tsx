import { useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle } from "./shared";

type Campaign = {
  id: number;
  title: string;
  body: string;
  segment: string;
  sent: number;
  opened: number;
  clicked: number;
  status: "sent" | "scheduled" | "draft" | "failed";
  date: string;
  emoji: string;
};

const CAMPAIGNS: Campaign[] = [
  { id: 1, title: "Сентябрьская скидка — туры -20%!", body: "Забронируйте тур мечты в Узбекистан в сентябре и сэкономьте 20%.", segment: "Все пользователи", sent: 8420, opened: 3210, clicked: 842, status: "sent", date: "1 сен 2026", emoji: "🌟" },
  { id: 2, title: "Ваш тур в Самарканд начинается завтра!", body: "Готовьтесь к незабываемому путешествию. Проверьте маршрут.", segment: "Самарканд", sent: 64, opened: 61, clicked: 58, status: "sent", date: "1 сен 2026", emoji: "🕌" },
  { id: 3, title: "Новинка: экспедиция на Аральское море", body: "Исследуйте древнее морское дно — мест мало. Успейте до 7 сен.", segment: "Искатели приключений", sent: 1840, opened: 620, clicked: 188, status: "sent", date: "30 авг 2026", emoji: "🏜️" },
  { id: 4, title: "Мы скучаем — возвращайтесь!", body: "Вы не бронировали 60 дней. Дарим скидку 10% на следующий тур.", segment: "Неактивные 60д", sent: 1220, opened: 341, clicked: 89, status: "sent", date: "28 авг 2026", emoji: "💛" },
  { id: 5, title: "Осень в Бухаре — новые даты", body: "Октябрьские туры в Бухару открыты. Ранняя цена скоро заканчивается.", segment: "Вишлист Бухара", sent: 0, opened: 0, clicked: 0, status: "scheduled", date: "10 сен 2026", emoji: "🍂" },
  { id: 6, title: "Флэш-распродажа — только 48 часов!", body: "Скидка 40% на все транспортные бронирования только в эти выходные.", segment: "Все пользователи", sent: 0, opened: 0, clicked: 0, status: "draft", date: "—", emoji: "⚡" },
];

const SEGMENTS = [
  { name: "Все пользователи", count: 8420, desc: "Все зарегистрированные пользователи" },
  { name: "Искатели приключений", count: 1840, desc: "Бронировали приключенческие туры" },
  { name: "Неактивные 60д", count: 1220, desc: "Нет активности более 60 дней" },
  { name: "Вишлист Бухара", count: 640, desc: "Добавили Бухару в избранное" },
  { name: "Самарканд", count: 310, desc: "Бронировали туры в Самарканд" },
  { name: "VIP-путешественники", count: 84, desc: "Потратили $1 000+ за всё время" },
  { name: "Новые 7 дней", count: 224, desc: "Зарегистрировались за последние 7 дней" },
];

export default function PushCampaigns() {
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);
  const [tab, setTab] = useState<"campaigns" | "compose" | "segments">("campaigns");
  const [filter, setFilter] = useState("all");
  const [compose, setCompose] = useState({ title: "", body: "", emoji: "🌟", segment: "Все пользователи", schedule: "now" });

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  const totalSent = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + c.opened, 0);
  const totalClicked = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + c.clicked, 0);

  return (
    <div className="p-7">
      <PageHeader
        title="Push-уведомления"
        subtitle="Мобильные кампании, сегменты и аналитика доставки"
        action={<Btn onClick={() => setTab("compose")}>+ Новая кампания</Btn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: "ВСЕГО ОТПРАВЛЕНО", val: totalSent.toLocaleString(), color: "var(--color-text)" },
          { label: "ОТКРЫТО", val: `${Math.round(totalOpened / totalSent * 100)}%`, color: "var(--color-amber)" },
          { label: "КЛИКОВ", val: `${Math.round(totalClicked / totalSent * 100)}%`, color: "var(--color-teal)" },
          { label: "ПОДПИСЧИКОВ", val: "6 284", color: "var(--color-text)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {([["campaigns", "Кампании"], ["compose", "Создать"], ["segments", "Сегменты"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{ background: tab === id ? "var(--color-amber)" : "var(--color-panel)", color: tab === id ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}
          >{label}</button>
        ))}
      </div>

      {tab === "campaigns" && (
        <div>
          <div className="flex gap-1.5 mb-4">
            {["all", "sent", "scheduled", "draft"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded text-xs cursor-pointer"
                style={{ background: filter === f ? "var(--color-amber)" : "var(--color-panel)", color: filter === f ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
              >{{ all:"Все", sent:"Отправлено", scheduled:"Запланировано", draft:"Черновик" }[f]}</button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map(c => (
              <div key={c.id} className="rounded-xl p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0 leading-none mt-0.5">{c.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{c.title}</span>
                      <Badge
                        label={c.status}
                        color={c.status === "sent" ? "teal" : c.status === "scheduled" ? "amber" : c.status === "failed" ? "rose" : "dim"}
                      />
                    </div>
                    <p className="text-xs mb-2 truncate" style={{ color: "var(--color-muted)" }}>{c.body}</p>
                    <div className="text-xs flex gap-4" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                      <span>Сегмент: {c.segment}</span>
                      <span>{c.status === "scheduled" ? "Запланировано: " : "Отправлено: "}{c.date}</span>
                    </div>
                  </div>

                  {c.status === "sent" && (
                    <div className="flex gap-4 shrink-0 text-right text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      <div>
                        <div style={{ color: "var(--color-text)" }}>{c.sent.toLocaleString()}</div>
                        <div style={{ color: "var(--color-muted)" }}>отправлено</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-amber)" }}>{Math.round(c.opened / c.sent * 100)}%</div>
                        <div style={{ color: "var(--color-muted)" }}>открыто</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-teal)" }}>{Math.round(c.clicked / c.sent * 100)}%</div>
                        <div style={{ color: "var(--color-muted)" }}>клики</div>
                      </div>
                    </div>
                  )}

                  {c.status !== "sent" && (
                    <div className="flex gap-2 shrink-0">
                      {c.status === "draft" && <Btn small onClick={() => setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: "sent" as const, sent: SEGMENTS.find(s => s.name === x.segment)?.count ?? 0, date: new Date().toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" }) } : x))}>Отправить</Btn>}
                      {c.status === "scheduled" && <Btn variant="ghost" small>Изменить</Btn>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "compose" && (
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
          <Card className="p-5">
            <SectionTitle>Создать уведомление</SectionTitle>
            <div className="flex flex-col gap-4">
              {/* Emoji picker */}
              <div>
                <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>EMOJI</label>
                <div className="flex gap-2 flex-wrap">
                  {["🌟", "🕌", "🏜️", "💛", "🍂", "⚡", "🎉", "✈️", "🚆", "🗺️"].map(e => (
                    <button key={e} onClick={() => setCompose(p => ({ ...p, emoji: e }))}
                      className="w-9 h-9 rounded-lg text-xl flex items-center justify-center cursor-pointer"
                      style={{ background: compose.emoji === e ? "var(--color-amber)" : "var(--color-surface)", border: "1px solid var(--color-border)" }}
                    >{e}</button>
                  ))}
                </div>
              </div>

              {[
                { key: "title", label: "ЗАГОЛОВОК", ph: "Ваш тур в Самарканд начинается завтра!", multiline: false },
                { key: "body", label: "ТЕКСТ", ph: "Готовьтесь к незабываемому путешествию...", multiline: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs block mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{f.label}</label>
                  {f.multiline ? (
                    <textarea rows={3} placeholder={f.ph} value={(compose as any)[f.key]}
                      onChange={e => setCompose(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full rounded px-3 py-2 text-sm outline-none resize-none"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                    />
                  ) : (
                    <input type="text" placeholder={f.ph} value={(compose as any)[f.key]}
                      onChange={e => setCompose(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full rounded px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>СЕГМЕНТ</label>
                <select value={compose.segment} onChange={e => setCompose(p => ({ ...p, segment: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none cursor-pointer"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                >
                  {SEGMENTS.map(s => <option key={s.name} value={s.name}>{s.name} ({s.count.toLocaleString()})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ДОСТАВКА</label>
                <div className="flex gap-2">
                  {["now", "schedule"].map(s => (
                    <button key={s} onClick={() => setCompose(p => ({ ...p, schedule: s }))}
                      className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize"
                      style={{ background: compose.schedule === s ? "var(--color-amber)" : "var(--color-surface)", color: compose.schedule === s ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)" }}
                    >{s === "now" ? "Отправить сейчас" : "Запланировать"}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Btn onClick={() => {
                  if (!compose.title) return;
                  const seg = SEGMENTS.find(s => s.name === compose.segment);
                  const sentCount = seg?.count ?? 0;
                  setCampaigns(prev => [...prev, {
                    id: prev.length + 1, title: compose.title, body: compose.body,
                    segment: compose.segment, emoji: compose.emoji,
                    sent: compose.schedule === "now" ? sentCount : 0,
                    opened: 0, clicked: 0,
                    status: compose.schedule === "now" ? "sent" as const : "scheduled" as const,
                    date: new Date().toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" }),
                  }]);
                  setCompose({ title: "", body: "", emoji: "🌟", segment: "Все пользователи", schedule: "now" });
                  setTab("campaigns");
                }}>Запустить кампанию</Btn>
                <Btn variant="ghost" onClick={() => {
                  if (!compose.title) return;
                  setCampaigns(prev => [...prev, { id: prev.length + 1, title: compose.title, body: compose.body, segment: compose.segment, emoji: compose.emoji, sent: 0, opened: 0, clicked: 0, status: "draft" as const, date: "—" }]);
                  setCompose({ title: "", body: "", emoji: "🌟", segment: "Все пользователи", schedule: "now" });
                  setTab("campaigns");
                }}>Сохранить черновик</Btn>
              </div>
            </div>
          </Card>

          {/* Live preview */}
          <div>
            <SectionTitle>Превью</SectionTitle>
            <div className="rounded-2xl p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div className="text-xs mb-3 font-medium text-center" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>Экран блокировки iOS</div>
              <div className="rounded-2xl p-4 mb-4" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {/* Notification bubble */}
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background: "var(--color-amber)", color: "#0d0c0a" }}>UZ</div>
                    <span className="text-xs font-medium text-white">Uzbekistan Travel</span>
                    <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>сейчас</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xl leading-none">{compose.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-white mb-0.5">{compose.title || "Заголовок уведомления"}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{compose.body || "Текст уведомления появится здесь..."}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-center" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                Получатели: {SEGMENTS.find(s => s.name === compose.segment)?.count.toLocaleString()} польз.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "segments" && (
        <div className="flex flex-col gap-3">
          {SEGMENTS.map(s => (
            <div key={s.name} className="rounded-xl p-4 flex items-center gap-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div className="flex-1">
                <div className="font-medium text-sm mb-0.5" style={{ color: "var(--color-text)" }}>{s.name}</div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>{s.desc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}>{s.count.toLocaleString()}</div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>польз.</div>
              </div>
              <Btn variant="ghost" small onClick={() => { setCompose(p => ({ ...p, segment: s.name })); setTab("compose"); }}>Отправить</Btn>
            </div>
          ))}
          <div className="mt-2">
            <Btn variant="ghost">+ Создать сегмент</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
