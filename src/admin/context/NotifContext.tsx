"use client";

import { useCallback, useEffect, useState } from "react";
import { можетДомен } from "@/lib/admin-roles";
import { useМеня } from "./MeContext";

export type Notif = {
  id: "sos" | "booking" | "chat";
  title: string;
  body: string;
  /** Раздел панели, куда ведёт уведомление. */
  action: string;
  read: boolean;
};

type Счётчики = Record<Notif["id"], number>;

/**
 * Уведомления панели — из живых данных: свежие SOS, новые брони и
 * сообщения без ответа. Раньше здесь лежал десяток выдуманных событий на
 * английском, и колокольчик каждый раз горел «4 непрочитанных».
 *
 * «Прочитано» означает «это число я уже видел»: когда придёт ещё одна
 * бронь или сообщение, уведомление загорится снова. Операции видят
 * поддержка и владелец — редактору эти уведомления ни к чему.
 */
export function useУведомления() {
  const меня = useМеня();
  const операции = меня ? можетДомен(меня.role, "operations") : false;
  const [счёт, setСчёт] = useState<Счётчики>({ sos: 0, booking: 0, chat: 0 });
  const [видел, setВидел] = useState<Partial<Счётчики>>({});

  const обновить = useCallback(async () => {
    if (!операции) return;
    try {
      const [стат, sos] = await Promise.all([
        fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/sos").then((r) => (r.ok ? r.json() : null)),
      ]);
      setСчёт({
        sos: (sos?.alerts ?? []).filter((a: { status: string }) => a.status === "new").length,
        booking: стат?.брони?.новые ?? 0,
        chat: стат?.поддержка?.непрочитанных ?? 0,
      });
    } catch {
      // Сеть моргнула — оставляем прежние числа до следующего опроса.
    }
  }, [операции]);

  useEffect(() => {
    обновить();
    const t = setInterval(обновить, 30_000);
    return () => clearInterval(t);
  }, [обновить]);

  const notifs: Notif[] = [];
  const добавить = (id: Notif["id"], title: string, body: string, action: string) => {
    if (счёт[id] > 0) notifs.push({ id, title, body, action, read: видел[id] === счёт[id] });
  };
  добавить("sos", "SOS-сигналы", `Новых сигналов: ${счёт.sos} — турист ждёт помощи`, "sos");
  добавить("booking", "Новые брони", `Ждут подтверждения: ${счёт.booking}`, "bookings");
  добавить("chat", "Поддержка", `Сообщений без ответа: ${счёт.chat}`, "chat");

  const markRead = (id: Notif["id"]) => setВидел((p) => ({ ...p, [id]: счёт[id] }));
  const markAllRead = () => setВидел({ ...счёт });
  const unreadCount = notifs.filter((n) => !n.read).length;

  return { notifs, markRead, markAllRead, unreadCount };
}
