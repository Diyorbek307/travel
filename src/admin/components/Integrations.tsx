import { useState } from "react";
import { PageHeader, Badge, Btn, SectionTitle, Card } from "./shared";

type ApiKey = {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  requests: number;
  status: "active" | "revoked";
};

const KEYS: ApiKey[] = [
  { id: 1, name: "Mobile App (iOS)", key: "uztravel_live_ios_k3f9...a2c1", created: "Jan 15, 2026", lastUsed: "2 min ago", permissions: ["bookings:read", "users:read", "tours:read"], requests: 142840, status: "active" },
  { id: 2, name: "Mobile App (Android)", key: "uztravel_live_and_m7b4...f5e8", created: "Jan 15, 2026", lastUsed: "4 min ago", permissions: ["bookings:read", "users:read", "tours:read"], requests: 118620, status: "active" },
  { id: 3, name: "Partner Portal", key: "uztravel_live_prt_n2q1...d9k3", created: "Mar 3, 2026", lastUsed: "1h ago", permissions: ["tours:read", "bookings:write", "hotels:read"], requests: 28410, status: "active" },
  { id: 4, name: "Analytics Webhook", key: "uztravel_live_wbh_x8t5...z3p7", created: "Apr 10, 2026", lastUsed: "30 min ago", permissions: ["analytics:read"], requests: 9320, status: "active" },
  { id: 5, name: "Old CMS (deprecated)", key: "uztravel_live_cms_r1w6...q4n2", created: "Jun 1, 2025", lastUsed: "45d ago", permissions: ["*"], requests: 0, status: "revoked" },
];

type Integration = {
  name: string;
  logo: string;
  desc: string;
  status: "connected" | "disconnected" | "error";
  category: string;
  docs?: string;
};

const INTEGRATIONS: Integration[] = [
  { name: "Яндекс Такси", logo: "🚕", desc: "Такси для трансферов из аэропорта и по городу", status: "connected", category: "Транспорт" },
  { name: "Google Maps", logo: "🗺️", desc: "Карты, маршруты и данные мест для страниц направлений", status: "connected", category: "Карты" },
  { name: "Stripe", logo: "💳", desc: "Обработка платежей за туры и подписки", status: "connected", category: "Платежи" },
  { name: "Firebase", logo: "🔔", desc: "Push-уведомления для iOS и Android приложений", status: "connected", category: "Уведомления" },
  { name: "Twilio", logo: "📱", desc: "SMS-подтверждения и двухфакторная аутентификация", status: "connected", category: "Сообщения" },
  { name: "Mailchimp", logo: "📧", desc: "Email-кампании и письма-подтверждения бронирований", status: "error", category: "Email" },
  { name: "Uzbekistan Airways API", logo: "✈️", desc: "Живые данные о рейсах, поиск и бронирование", status: "connected", category: "Транспорт" },
  { name: "O'zbekiston Temir Yo'llari", logo: "🚆", desc: "Расписание поездов и продажа билетов", status: "connected", category: "Транспорт" },
  { name: "OpenWeather", logo: "🌤️", desc: "Погодные прогнозы для страниц направлений", status: "disconnected", category: "Данные" },
  { name: "Sentry", logo: "🐛", desc: "Отслеживание ошибок и мониторинг производительности", status: "connected", category: "DevOps" },
  { name: "Slack", logo: "💬", desc: "Оповещения и критические уведомления для администраторов", status: "disconnected", category: "Сообщения" },
  { name: "S3 / Cloudflare R2", logo: "☁️", desc: "Хранение фотографий направлений и ресурсов туров", status: "connected", category: "Хранилище" },
];

const PERMS = ["bookings:read", "bookings:write", "users:read", "users:write", "tours:read", "tours:write", "analytics:read", "hotels:read", "hotels:write", "*"];

export default function Integrations() {
  const [tab, setTab] = useState<"keys" | "integrations" | "webhooks">("keys");
  const [keys, setKeys] = useState<ApiKey[]>(KEYS);
  const [showNew, setShowNew] = useState(false);
  const [reveal, setReveal] = useState<number | null>(null);
  const [newKey, setNewKey] = useState({ name: "", perms: [] as string[] });
  const [catFilter, setCatFilter] = useState("Все");

  const revoke = (id: number) => setKeys(p => p.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));

  const categories = ["Все", ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];
  const filteredIntegrations = catFilter === "Все" ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === catFilter);

  return (
    <div className="p-7">
      <PageHeader
        title="API и интеграции"
        subtitle="API-ключи, сторонние сервисы и вебхуки"
        action={tab === "keys" ? <Btn onClick={() => setShowNew(true)}>+ Новый API-ключ</Btn> : undefined}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {([["keys", "API-ключи"], ["integrations", "Сервисы"], ["webhooks", "Вебхуки"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{ background: tab === id ? "var(--color-amber)" : "var(--color-panel)", color: tab === id ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}
          >{label}</button>
        ))}
      </div>

      {tab === "keys" && (
        <div className="flex flex-col gap-3">
          {keys.map(k => (
            <div key={k.id} className="rounded-xl p-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", opacity: k.status === "revoked" ? 0.5 : 1 }}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{k.name}</span>
                    <Badge label={k.status} color={k.status === "active" ? "teal" : "rose"} />
                  </div>

                  {/* Key display */}
                  <div
                    className="flex items-center gap-2 rounded px-3 py-2 mb-2 cursor-pointer"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", maxWidth: "400px" }}
                    onClick={() => setReveal(reveal === k.id ? null : k.id)}
                  >
                    <span className="font-mono text-xs flex-1 truncate" style={{ color: reveal === k.id ? "var(--color-amber)" : "var(--color-muted)" }}>
                      {reveal === k.id ? k.key.replace("...", "••••••••••••") : k.key}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "var(--color-dim)" }}>{reveal === k.id ? "скрыть" : "показать"}</span>
                  </div>

                  <div className="flex gap-4 text-xs flex-wrap" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>Создан: {k.created}</span>
                    <span>Последний запрос: {k.lastUsed}</span>
                    <span style={{ color: "var(--color-teal)" }}>{k.requests.toLocaleString()} запросов</span>
                  </div>

                  {/* Permissions */}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {k.permissions.map(p => (
                      <span key={p} className="text-xs rounded px-2 py-0.5" style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{p}</span>
                    ))}
                  </div>
                </div>

                {k.status === "active" && (
                  <div className="flex gap-2 shrink-0">
                    <Btn variant="ghost" small>Копировать</Btn>
                    <Btn variant="danger" small onClick={() => revoke(k.id)}>Отозвать</Btn>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "integrations" && (
        <div>
          <div className="flex gap-1.5 mb-5 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className="px-3 py-1.5 rounded text-xs cursor-pointer"
                style={{ background: catFilter === c ? "var(--color-amber)" : "var(--color-panel)", color: catFilter === c ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
              >{c}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredIntegrations.map(intg => (
              <div key={intg.name} className="rounded-xl p-4 flex items-start gap-3" style={{ background: "var(--color-panel)", border: `1px solid ${intg.status === "error" ? "rgba(196,90,66,0.3)" : "var(--color-border)"}` }}>
                <div className="text-2xl leading-none shrink-0 mt-0.5">{intg.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{intg.name}</span>
                    <Badge
                      label={intg.status}
                      color={intg.status === "connected" ? "teal" : intg.status === "error" ? "rose" : "dim"}
                    />
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>{intg.desc}</p>
                  <div className="text-xs" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>{intg.category}</div>
                </div>
                <div className="shrink-0">
                  {intg.status === "connected" ? (
                    <Btn variant="ghost" small>Настроить</Btn>
                  ) : intg.status === "error" ? (
                    <Btn variant="danger" small>Исправить</Btn>
                  ) : (
                    <Btn small>Подключить</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="flex flex-col gap-3">
          {[
            { url: "https://analytics.uztravel.uz/hooks/booking", events: ["booking.created", "booking.cancelled"], lastDelivery: "2 min ago", success: true },
            { url: "https://erp.uztravel.uz/incoming/payment", events: ["payment.succeeded", "payment.failed", "refund.issued"], lastDelivery: "1h ago", success: true },
            { url: "https://slack-proxy.uztravel.uz/alerts", events: ["review.flagged", "guide.application", "booking.cancelled"], lastDelivery: "3h ago", success: false },
          ].map((wh, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "var(--color-panel)", border: `1px solid ${wh.success ? "var(--color-border)" : "rgba(196,90,66,0.3)"}` }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{wh.url}</span>
                    <Badge label={wh.success ? "работает" : "ошибка"} color={wh.success ? "teal" : "rose"} />
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {wh.events.map(e => (
                      <span key={e} className="text-xs rounded px-2 py-0.5" style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{e}</span>
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>Последняя доставка: {wh.lastDelivery}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Btn variant="ghost" small>Логи</Btn>
                  {!wh.success && <Btn small>Повторить</Btn>}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2">
            <Btn variant="ghost">+ Добавить вебхук</Btn>
          </div>
        </div>
      )}

      {/* New API key modal */}
      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowNew(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Новый API-ключ</h3>
            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>НАЗВАНИЕ КЛЮЧА</label>
                <input type="text" placeholder="Например: Mobile App v2" value={newKey.name}
                  onChange={e => setNewKey(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
              <div>
                <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ПРАВА ДОСТУПА</label>
                <div className="flex flex-wrap gap-2">
                  {PERMS.map(p => (
                    <button key={p} onClick={() => setNewKey(prev => ({ ...prev, perms: prev.perms.includes(p) ? prev.perms.filter(x => x !== p) : [...prev.perms, p] }))}
                      className="px-2.5 py-1 rounded text-xs cursor-pointer transition-all"
                      style={{ background: newKey.perms.includes(p) ? "var(--color-amber)" : "var(--color-surface)", color: newKey.perms.includes(p) ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowNew(false)}>Отмена</Btn>
              <Btn onClick={() => setShowNew(false)}>Создать ключ</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
