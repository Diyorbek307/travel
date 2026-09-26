"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/lang-provider";
import { датаСловами } from "./i18n";
import { useПрочитанные } from "./notifs-read";
import { useGeo } from "@/components/geo-provider";
import { ближайшийГород } from "@/data/geo";

/**
 * Уведомления туриста — из того, что правда произошло.
 *
 * Здесь раньше было пять вшитых заготовок: «Вы рядом с Регистаном» — где
 * бы человек ни находился, «Световое шоу сегодня» — каждый день, скидка
 * по коду, который нигде не работает. Точка на колокольчике горела у
 * всех.
 *
 * Теперь уведомление — это ответ поддержки, решение по заявке на бронь,
 * кампания из панели (раздел «Уведомления») и одно приветствие. Опрашиваем сервер раз в минуту: срочного
 * здесь нет, а поддержка всё равно отвечает не мгновенно.
 */

export interface Уведомление {
  id: string;
  emoji: string;
  /** Куда ведёт нажатие: раздел профиля. */
  раздел: "bookings" | "support" | null;
  /** Ссылка кампании из панели: «explore:hotels», «place:<id>»… (см. lib/campaign-rules). */
  ссылка?: string;
  /** Фото кампании — крупно под текстом. */
  картинка?: string;
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

interface КампанияТуриста {
  id: string;
  title: string;
  body: string;
  emoji: string;
  link: string;
  from: string;
  createdAt: string;
  image: string | null;
}

/** У кампаний в id приставка — по ней панель уведомлений узнаёт, что отметить на сервере. */
export const ПРИСТАВКА_КАМПАНИИ = "cmp:";

/**
 * Отметить кампании прочитанными на сервере — для счётчика в панели.
 * На устройстве отметка ставится отдельно (notifs-read); без входа
 * сервер отказывает, и это нормально.
 */
export function отметитьКампании(ids: string[]) {
  const свои = ids
    .filter((id) => id.startsWith(ПРИСТАВКА_КАМПАНИИ))
    .map((id) => id.slice(ПРИСТАВКА_КАМПАНИИ.length));
  if (свои.length === 0) return;
  fetch("/api/campaigns/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: свои }),
  }).catch(() => undefined);
}

const ОПРОС_МС = 60_000;

export function useУведомления(): Уведомление[] {
  const { t, lang } = useT();
  const прочитанные = useПрочитанные();
  const [брони, setБрони] = useState<Бронь[]>([]);
  const [ответы, setОтветы] = useState<Сообщение[]>([]);
  const [кампании, setКампании] = useState<КампанияТуриста[]>([]);
  // Кампании «по городу» — для тех, кто сейчас в этом городе.
  const { pos } = useGeo();
  const город = ближайшийГород(pos);

  useEffect(() => {
    let живо = true;
    const подтянуть = () => {
      fetch(`/api/campaigns${город ? `?city=${encodeURIComponent(город)}` : ""}`)
        .then((r) => (r.ok ? r.json() : { campaigns: [] }))
        .then((d: { campaigns?: КампанияТуриста[] }) => живо && setКампании(d.campaigns ?? []))
        .catch(() => undefined);
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
  }, [город]);

  const список: Omit<Уведомление, "unread">[] = [
    ...кампании.map((к) => ({
      id: `${ПРИСТАВКА_КАМПАНИИ}${к.id}`,
      emoji: к.emoji || "🔔",
      раздел: null,
      ссылка: к.link || undefined,
      картинка: к.image ?? undefined,
      title: к.title,
      body: к.body,
      // «Когда пришло» — начало показа, но не раньше создания: кампания,
      // заведённая днём на сегодня, не должна выглядеть утренней.
      время: new Date(
        Math.max(Date.parse(`${к.from}T00:00:00+05:00`), Date.parse(к.createdAt)),
      ).toISOString(),
    })),
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
