"use client";

/**
 * Напоминание о событии — файлом календаря.
 *
 * Кнопка «Напомнить» раньше не делала ничего. Слать push мы не умеем, а
 * писать «напомним» и не напомнить — хуже, чем не обещать. Поэтому
 * отдаём .ics: его понимает календарь на любом телефоне, и напоминание
 * ставит уже он.
 *
 * Дата в данных — человеческая строка вроде «21 марта» или «12–15 июня».
 * Берём первое число и месяц; если в этом году день уже прошёл, ставим
 * на следующий — фестивали ежегодные.
 */

const МЕСЯЦЫ = [
  "январ", "феврал", "март", "апрел", "ма", "июн",
  "июл", "август", "сентябр", "октябр", "ноябр", "декабр",
];

export function разобратьДату(строка: string, сегодня = new Date()): Date | null {
  const s = строка.toLowerCase();
  const день = s.match(/\d{1,2}/);
  if (!день) return null;
  const месяц = МЕСЯЦЫ.findIndex((м) => s.includes(м));
  if (месяц < 0) return null;
  const d = new Date(сегодня.getFullYear(), месяц, Number(день[0]));
  if (d < new Date(сегодня.getFullYear(), сегодня.getMonth(), сегодня.getDate())) {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

function деньICS(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

/** Экранирование по RFC 5545: запятые и точки с запятой ломают строку. */
function эк(текст: string): string {
  return текст.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/**
 * Скачать файл календаря для события. Возвращает false, если дату
 * разобрать не вышло — тогда врать про напоминание не нужно.
 */
export function напомнитьОСобытии(событие: {
  name: string;
  date: string;
  city: string;
  desc?: string;
}): boolean {
  const начало = разобратьДату(событие.date);
  if (!начало) return false;
  const конец = new Date(начало);
  конец.setDate(конец.getDate() + 1); // у всенадневного события DTEND — следующий день

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HelloUZ//RU",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@hellouz`,
    `DTSTAMP:${деньICS(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${деньICS(начало)}`,
    `DTEND;VALUE=DATE:${деньICS(конец)}`,
    `SUMMARY:${эк(событие.name)}`,
    `LOCATION:${эк(событие.city)}`,
    ...(событие.desc ? [`DESCRIPTION:${эк(событие.desc)}`] : []),
    // Напоминание за сутки — столько нужно, чтобы успеть доехать.
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${эк(событие.name)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const ссылка = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = ссылка;
  a.download = `${событие.name.replace(/[\\/:*?"<>|]/g, "")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Отпускаем ссылку не сразу: Safari успевает открыть файл только после клика.
  setTimeout(() => URL.revokeObjectURL(ссылка), 4000);
  return true;
}
