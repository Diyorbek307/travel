"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/lang-provider";
import { датаСловами } from "./i18n";
import { useПрочитанные } from "./notifs-read";

/**
 * Уведомления туриста — из того, что правда произошло.
 *
 * Здесь раньше было пять вшитых заготовок: «Вы рядом с Регистаном» — где
 * бы человек ни находился, «Световое шоу сегодня» — каждый день, скидка
 * по коду, который нигде не работает. Точка на колокольчике горела у
 * всех.
 *
 * Теперь уведомление — это ответ поддержки или решение по заявке на
 * бронь, плюс одно приветствие. Опрашиваем сервер раз в минуту: срочного
 * здесь нет, а поддержка всё равно отвечает не мгновенно.
 */

export interface Уведомление {
  id: string;
  emoji: string;
  /** Куда ведёт нажатие: раздел профиля. */
  раздел: "bookings" | "support" | null;
  title: string;
  body: string;
  /** Когда случилось — для подписи «5 минут назад». */
  время: string | null;
  unread: boolean;
}

interface Бронь {
  id: string;
  itemName: string;
  date: string;
  status: "new" | "confirmed" | "cancelled";
}

interface Сообщение {
  id: string;
  author: "user" | "staff";
  text: string;
  createdAt: string;
}

const ОПРОС_МС = 60_000;

export function useУведомления(): Уведомление[] {
  const { t, lang } = useT();
  const прочитанные = useПрочитанные();
  const [брони, setБрони] = useState<Бронь[]>([]);
  const [ответы, setОтветы] = useState<Сообщение[]>([]);

  useEffect(() => {
    let живо = true;
    const подтянуть = () => {
      fetch("/api/bookings")
        .then((r) => (r.ok ? r.json() : { bookings: [] }))
        .then((d: { bookings?: Бронь[] }) => живо && setБрони(d.bookings ?? []))
        .catch(() => undefined);
      fetch("/api/support")
        .then((r) => (r.ok ? r.json() : { messages: [] }))
        .then(
          (d: { messages?: Сообщение[] }) =>
            живо && setОтветы((d.messages ?? []).filter((m) => m.author === "staff")),
        )
        .catch(() => undefined);
    };
    подтянуть();
    const таймер = setInterval(подтянуть, ОПРОС_МС);
    return () => {
      живо = false;
      clearInterval(таймер);
    };
  }, []);

  const список: Omit<Уведомление, "unread">[] = [
    ...ответы
      .slice()
      .reverse()
      .map((m) => ({
        id: `sup:${m.id}`,
        emoji: "💬",
        раздел: "support" as const,
        title: t("notif_support_reply"),
        body: m.text.length > 140 ? `${m.text.slice(0, 140)}…` : m.text,
        время: m.createdAt,
      })),
    ...брони
      .filter((b) => b.status !== "new")
      .map((b) => ({
        // Статус в ключе: отклонённая после подтверждения — это новость.
        id: `bk:${b.id}:${b.status}`,
        emoji: b.status === "confirmed" ? "✅" : "✕",
        раздел: "bookings" as const,
        title: b.status === "confirmed" ? t("notif_bk_confirmed") : t("notif_bk_cancelled"),
        body: `${b.itemName} · ${датаСловами(new Date(`${b.date}T12:00:00`), lang, "short")}`,
        время: null,
      })),
    {
      id: "welcome",
      emoji: "👋",
      раздел: null,
      title: t("notif_welcome_title"),
      body: t("notif_welcome_body"),
      время: null,
    },
  ];

  return список.map((n) => ({ ...n, unread: !прочитанные.includes(n.id) }));
}

/** «5 минут назад», «вчера» — на языке интерфейса. */
export function когда(iso: string, lang: string): string {
  const секунд = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const fmt = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const шаги: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [единица, в] of шаги) {
    if (Math.abs(секунд) >= в) return fmt.format(Math.round(секунд / в), единица);
  }
  return fmt.format(0, "minute");
}
