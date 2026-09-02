import { useState } from "react";
import { PageHeader, Btn, Card, SectionTitle } from "./shared";
import { useTheme } from "../context/ThemeContext";

export default function Settings({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { theme, isDark, toggleMode } = useTheme();
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState({
    name: "Администратор",
    email: "admin@uztravel.uz",
    phone: "+998 71 000-00-00",
    role: "Суперадмин",
    timezone: "Asia/Tashkent (UTC+5)",
    language: "Русский",
    twoFactor: true,
    emailNotifs: true,
    pushNotifs: false,
    chatAlerts: true,
    weeklyReport: true,
  });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Настройки"
        subtitle="Аккаунт, уведомления и системные параметры"
        action={<Btn onClick={save}>{saved ? "✓ Сохранено" : "Сохранить"}</Btn>}
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr", maxWidth: "900px" }}>
        {/* Профиль */}
        <Card className="p-5">
          <SectionTitle>Профиль</SectionTitle>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: "var(--color-amber)", color: "#0d0c0a" }}>
              АД
            </div>
            <div>
              <div className="font-semibold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{profile.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{profile.role}</div>
            </div>
          </div>

          {[
            { label: "Полное имя", key: "name" },
            { label: "Email", key: "email" },
            { label: "Телефон", key: "phone" },
          ].map(f => (
            <div key={f.key} className="mb-3">
              <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                {f.label.toUpperCase()}
              </label>
              <input type="text" value={(profile as any)[f.key]}
                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full rounded px-3 py-2 text-sm outline-none"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ЧАСОВОЙ ПОЯС</label>
            <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
              className="w-full rounded px-3 py-2 text-sm outline-none"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
            >
              <option>Asia/Tashkent (UTC+5)</option>
              <option>Europe/Moscow (UTC+3)</option>
              <option>Europe/London (UTC+0)</option>
              <option>America/New_York (UTC-5)</option>
            </select>
          </div>
        </Card>

        {/* Безопасность */}
        <Card className="p-5">
          <SectionTitle>Безопасность и уведомления</SectionTitle>
          <div className="flex flex-col gap-4 mb-5">
            {[
              { key: "twoFactor", label: "Двухфакторная аутентификация", desc: "OTP при каждом входе" },
              { key: "emailNotifs", label: "Email-уведомления", desc: "Получать оповещения по почте" },
              { key: "pushNotifs", label: "Push-уведомления", desc: "Уведомления в браузере" },
              { key: "chatAlerts", label: "Оповещения из чата", desc: "Сигнал при новом сообщении" },
              { key: "weeklyReport", label: "Еженедельный отчёт", desc: "Сводка каждый понедельник" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{item.label}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{item.desc}</div>
                </div>
                <button onClick={() => setProfile(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}
                  className="w-11 h-6 rounded-full relative transition-all cursor-pointer shrink-0"
                  style={{ background: (profile as any)[item.key] ? "var(--color-amber)" : "var(--color-dim)" }}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                    style={{ background: "#fff", left: (profile as any)[item.key] ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                  />
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
            <div className="text-xs mb-3" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>СМЕНА ПАРОЛЯ</div>
            {["Текущий пароль", "Новый пароль", "Подтвердите пароль"].map(ph => (
              <input key={ph} type="password" placeholder={ph}
                className="w-full rounded px-3 py-2 text-sm outline-none mb-2"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
              />
            ))}
            <Btn variant="ghost" onClick={() => { setPwSaved(true); setTimeout(() => setPwSaved(false), 2500); }}>
              {pwSaved ? "✓ Пароль обновлён" : "Обновить пароль"}
            </Btn>
          </div>
        </Card>

        {/* Тема оформления */}
        <Card className="p-5">
          <SectionTitle>Тема оформления</SectionTitle>

          {/* Dark/Light toggle */}
          <div className="flex items-center justify-between gap-2 mb-4 p-3 rounded-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {isDark ? "Тёмная тема" : "Светлая тема"}
              </div>
              <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                {isDark ? "Текущая: тёмная — тёплые янтарные тона" : "Текущая: светлая — тёплая слоновая кость"}
              </div>
            </div>
            <button onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all font-medium text-sm"
              style={{ background: "var(--color-amber)", color: "#0d0c0a", fontFamily: "var(--font-body)" }}
            >
              {isDark ? "☀ Светлая" : "☾ Тёмная"}
            </button>
          </div>

          {/* Palette presets */}
          <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ЦВЕТОВЫЕ ПАЛИТРЫ</div>
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { name: "Янтарь", bg: theme.colorBg, accent: "#d4872a" },
              { name: "Бирюза", bg: theme.colorBg, accent: "#2a8d7a" },
              { name: "Малина", bg: theme.colorBg, accent: "#c45a42" },
              { name: "Синий", bg: theme.colorBg, accent: "#7a8fff" },
              { name: "Аметист", bg: theme.colorBg, accent: "#c47ae8" },
            ].map(p => (
              <div key={p.name} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg border-2 transition-all" style={{ background: p.accent, borderColor: theme.colorAmber === p.accent ? "var(--color-text)" : "transparent" }} />
                <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "9px" }}>{p.name}</div>
              </div>
            ))}
          </div>

          {/* Active swatches */}
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { label: "Фон", val: theme.colorBg },
              { label: "Акцент", val: theme.colorAmber },
              { label: "Успех", val: theme.colorTeal },
              { label: "Опасность", val: theme.colorRose },
              { label: "Текст", val: theme.colorText },
            ].map(c => (
              <div key={c.label} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded" style={{ background: c.val, border: "1px solid var(--color-border)" }} />
                <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "9px" }}>{c.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            Заголовок: {theme.fontDisplay.split(",")[0].replace(/'/g, "").trim()}<br />
            Текст: {theme.fontBody.split(",")[0].replace(/'/g, "").trim()}<br />
            Скругление: {theme.radiusCard}
          </div>
          <Btn variant="ghost" onClick={() => onNavigate?.("theme")}>Открыть визуальный редактор →</Btn>
        </Card>

        {/* Системная информация */}
        <Card className="p-5">
          <SectionTitle>Системная информация</SectionTitle>
          <div className="flex flex-col gap-2">
            {[
              { label: "Версия панели", val: "2.1.0" },
              { label: "Последний деплой", val: "1 сен 2026 — 03:42 UTC" },
              { label: "База данных", val: "PostgreSQL 16 — 12.4 GB" },
              { label: "CDN", val: "Cloudflare — Ташкент PoP" },
              { label: "Статус API", val: "✓ Все системы работают" },
              { label: "Яндекс Такси", val: "Подключён" },
              { label: "SMS-шлюз", val: "Eskiz.uz — активен" },
              { label: "Аналитика", val: "Google Analytics 4" },
            ].map(s => (
              <div key={s.label} className="flex justify-between gap-2 text-sm py-1.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-muted)" }}>{s.label}</span>
                <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{s.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Опасная зона */}
        <div className="col-span-2">
          <Card className="p-5" style={{ border: "1px solid rgba(196,90,66,0.3)" } as React.CSSProperties}>
            <SectionTitle>Опасная зона</SectionTitle>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-60">
                <div className="text-sm font-medium mb-0.5" style={{ color: "var(--color-text)" }}>Очистить кэш</div>
                <div className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>Принудительное обновление всех кэшированных страниц и CDN</div>
                <Btn variant="ghost">Очистить кэш</Btn>
              </div>
              <div className="flex-1 min-w-60">
                <div className="text-sm font-medium mb-0.5" style={{ color: "var(--color-text)" }}>Экспорт данных</div>
                <div className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>Скачать полный дамп базы данных в ZIP-архиве</div>
                <Btn variant="ghost">Экспортировать</Btn>
              </div>
              <div className="flex-1 min-w-60">
                <div className="text-sm font-medium mb-0.5" style={{ color: "var(--color-rose)" }}>Удалить аккаунт</div>
                <div className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>Навсегда удалить этот администраторский аккаунт</div>
                <Btn variant="danger" onClick={() => setShowDeleteConfirm(true)}>Удалить аккаунт</Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="rounded-2xl w-full max-w-sm p-6" style={{ background: "var(--color-panel)", border: "1px solid rgba(196,90,66,0.4)" }} onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4 text-center">⚠</div>
            <h3 className="text-lg font-semibold mb-2 text-center" style={{ fontFamily: "var(--font-display)", color: "var(--color-rose)" }}>Удалить аккаунт?</h3>
            <p className="text-sm mb-5 text-center" style={{ color: "var(--color-muted)" }}>
              Это действие необратимо. Все данные аккаунта будут удалены навсегда. Напишите <strong style={{ color: "var(--color-text)" }}>УДАЛИТЬ</strong> для подтверждения.
            </p>
            <input type="text" placeholder="УДАЛИТЬ"
              className="w-full rounded px-3 py-2 text-sm outline-none mb-4 text-center"
              style={{ background: "var(--color-surface)", border: "1px solid rgba(196,90,66,0.4)", color: "var(--color-text)", fontFamily: "var(--font-mono)" }}
              id="delete-confirm-input"
            />
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Отмена</Btn>
              <Btn variant="danger" onClick={() => {
                const val = (document.getElementById("delete-confirm-input") as HTMLInputElement)?.value;
                if (val === "УДАЛИТЬ") { setShowDeleteConfirm(false); }
              }}>Удалить навсегда</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
