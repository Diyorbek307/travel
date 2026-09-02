import { useState } from "react";
import { PageHeader, Badge, Btn, SectionTitle } from "./shared";

type NotifItem = {
  id: number;
  title: string;
  body: string;
  type: "booking" | "review" | "system" | "payment" | "alert" | "chat";
  time: string;
  read: boolean;
  user?: string;
  action?: string;
};

const SEED: NotifItem[] = [
  { id: 1, title: "Новое бронирование подтверждено", body: "Ахмед Халил забронировал тур «Шёлковый путь» (3 чел.) — $2,430", type: "booking", time: "2 мин назад", read: false, user: "Ахмед Халил", action: "Просмотр" },
  { id: 2, title: "Получена оценка 5 звёзд", body: "Мария Чен оставила отзыв на тур «Самарканд за день»", type: "review", time: "14 мин назад", read: false, user: "Мария Чен", action: "Отзыв" },
  { id: 3, title: "Ошибка оплаты", body: "Карта отклонена для Софи Бернхард — тур «Бухара 3 дня» ($1,260)", type: "payment", time: "1 ч назад", read: false, user: "Софи Бернхард", action: "Связаться" },
  { id: 4, title: "Заявка гида на рассмотрении", body: "Амир Ахмедов подал документы для сертификации гида", type: "system", time: "2 ч назад", read: false, action: "Проверить" },
  { id: 5, title: "Мало мест", body: "Лагерь «Закат в пустыне» (2–5 сен) — остался 1 слот", type: "alert", time: "3 ч назад", read: true, action: "Тур" },
  { id: 6, title: "Новое сообщение в поддержку", body: "Юки Танака: «Письмо с подтверждением отеля не пришло...»", type: "chat", time: "4 ч назад", read: true, user: "Юки Танака", action: "Ответить" },
  { id: 7, title: "Срок промокода истекает", body: "SILKROAD20 истекает через 3 дня — осталось 376 использований", type: "system", time: "5 ч назад", read: true, action: "Продлить" },
  { id: 8, title: "Рекламная кампания завершена", body: "Баннер Uzbekistan Airways — 12 400 показов", type: "payment", time: "1 д назад", read: true, action: "Отчёт" },
  { id: 9, title: "Новый пользователь", body: "Джеймс Уокер (Великобритания) зарегистрировался и сделал первое бронирование", type: "booking", time: "1 д назад", read: true, user: "Джеймс Уокер" },
  { id: 10, title: "Резервное копирование завершено", body: "Ежедневный бэкап выполнен — 2.4 ГБ, всё в норме", type: "system", time: "2 д назад", read: true },
  { id: 11, title: "Отмена бронирования", body: "Дмитрий Волков отменил тур «Хива» — возврат $320", type: "payment", time: "2 д назад", read: true, user: "Дмитрий Волков" },
  { id: 12, title: "Отмечен негативный отзыв", body: "Оценка 1★ для Hotel Malika Bukhara требует модерации", type: "alert", time: "3 д назад", read: true, action: "Модерация" },
];

const TYPE_COLORS: Record<string, string> = {
  booking: "var(--color-teal)",
  review: "var(--color-amber)",
  payment: "var(--color-rose)",
  system: "var(--color-muted)",
  alert: "var(--color-rose)",
  chat: "#7a8fff",
};

const TYPE_ICONS: Record<string, string> = {
  booking: "◫",
  review: "◇",
  payment: "▣",
  system: "⬡",
  alert: "◉",
  chat: "◈",
};

const ACTION_NAV: Record<string, string> = {
  "Просмотр": "bookings", "Отзыв": "reviews", "Связаться": "chat",
  "Проверить": "guides", "Тур": "tours", "Ответить": "chat",
  "Продлить": "promos", "Отчёт": "finance", "Модерация": "reviews",
};

export default function NotifCenter({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [notifs, setNotifs] = useState<NotifItem[]>(SEED);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<NotifItem | null>(null);

  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: number) => { setNotifs(p => p.filter(n => n.id !== id)); if (selected?.id === id) setSelected(null); };

  const filtered = filter === "all" ? notifs : filter === "unread" ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Уведомления"
        subtitle={`${unreadCount} непрочитанных`}
        action={<Btn variant="ghost" onClick={markAllRead}>Прочитать все</Btn>}
      />

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {(["all", "unread", "booking", "review", "payment", "alert", "chat", "system"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
            style={{
              background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
              color: filter === f ? "#0d0c0a" : "var(--color-muted)",
              border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)",
            }}
          >
            {{"all":"Все","unread":"Непрочит.","booking":"Бронирования","review":"Отзывы","payment":"Платежи","alert":"Предупреждения","chat":"Чат","system":"Система"}[f]}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* List */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: "var(--color-muted)" }}>Уведомлений нет</div>
          )}
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => { setSelected(n); markRead(n.id); }}
              className="rounded-xl p-4 flex flex-wrap gap-3 cursor-pointer transition-all"
              style={{
                background: selected?.id === n.id ? "var(--color-panel)" : n.read ? "transparent" : "rgba(212,135,42,0.04)",
                border: `1px solid ${selected?.id === n.id ? "var(--color-amber)" : n.read ? "var(--color-border)" : "rgba(212,135,42,0.2)"}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                style={{ background: TYPE_COLORS[n.type] + "22", color: TYPE_COLORS[n.type] }}
              >
                {TYPE_ICONS[n.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-sm font-medium" style={{ color: n.read ? "var(--color-muted)" : "var(--color-text)" }}>{n.title}</span>
                  <span className="text-xs shrink-0" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>{n.time}</span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-muted)" }}>{n.body}</p>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "var(--color-amber)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="w-full shrink-0 lg:w-72">
            <div className="rounded-2xl p-5 sticky top-0" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4"
                style={{ background: TYPE_COLORS[selected.type] + "22", color: TYPE_COLORS[selected.type] }}
              >
                {TYPE_ICONS[selected.type]}
              </div>

              <Badge label={selected.type} color={selected.type === "booking" || selected.type === "review" ? "teal" : selected.type === "payment" || selected.type === "alert" ? "rose" : "dim"} />

              <h3 className="font-semibold text-base mt-3 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{selected.title}</h3>
              <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>{selected.body}</p>

              <div className="flex flex-col gap-2 text-xs mb-5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                <div>Время: {selected.time}</div>
                {selected.user && <div>Пользователь: {selected.user}</div>}
              </div>

              <div className="flex flex-col gap-2">
                {selected.action && (
                  <Btn onClick={() => {
                    const page = ACTION_NAV[selected.action!];
                    if (page && onNavigate) onNavigate(page);
                  }}>{selected.action}</Btn>
                )}
                <Btn variant="danger" onClick={() => deleteNotif(selected.id)}>Удалить</Btn>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full shrink-0 rounded-2xl lg:w-72 flex items-center justify-center text-center p-8" style={{ border: "1px dashed var(--color-border)" }}>
            <p className="text-sm" style={{ color: "var(--color-dim)" }}>Выберите уведомление для просмотра</p>
          </div>
        )}
      </div>
    </div>
  );
}
