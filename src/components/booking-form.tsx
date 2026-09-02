"use client";

import { useState } from "react";
import { BORDER, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import type { BookingKind } from "@/lib/types";

/**
 * Заявка на бронь.
 *
 * Именно заявка, а не подтверждённая бронь: интеграции с системами
 * отелей и ресторанов нет, и обещать место мы не можем. Администратор
 * видит заявку в панели и подтверждает её сам. Формулировки об этом
 * говорят прямо — «заявка отправлена», а не «столик ваш».
 */
export default function BookingForm({
  kind,
  itemId,
  itemName,
}: {
  kind: BookingKind;
  itemId: string;
  itemName: string;
}) {
  const [открыта, setОткрыта] = useState(false);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [итог, setИтог] = useState<"нет" | "ок" | "нужен-вход" | "ошибка">("нет");
  const [идёт, setИдёт] = useState(false);

  const подпись =
    kind === "hotel" ? "Забронировать номер" : kind === "restaurant" ? "Забронировать столик" : "Записаться на тур";

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setИдёт(true);
    setИтог("нет");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, itemName, date, guests, note }),
      });
      if (res.status === 401) {
        setИтог("нужен-вход");
        return;
      }
      setИтог(res.ok ? "ок" : "ошибка");
    } catch {
      setИтог("ошибка");
    } finally {
      setИдёт(false);
    }
  }

  if (итог === "ок") {
    return (
      <div className="mx-4 mb-3 rounded-2xl p-4" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
        <p className="text-sm font-semibold" style={{ color: GREEN }}>
          Заявка отправлена
        </p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
          Это ещё не подтверждённая бронь: мы свяжемся и подтвердим место. Следить за заявкой можно
          в профиле.
        </p>
      </div>
    );
  }

  if (!открыта) {
    return (
      <div className="mx-4 mb-3">
        <button
          onClick={() => setОткрыта(true)}
          className="w-full rounded-2xl py-3.5 text-sm font-bold"
          style={{ background: GOLD, color: TEXT }}
        >
          {подпись}
        </button>
      </div>
    );
  }

  const поле: React.CSSProperties = {
    background: "var(--cream)",
    border: `1px solid ${BORDER}`,
    color: TEXT,
  };

  return (
    <form
      onSubmit={отправить}
      className="mx-4 mb-3 flex flex-col gap-2.5 rounded-2xl p-4"
      style={{ background: WHITE, border: `1px solid ${BORDER}` }}
    >
      <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
        {подпись}
      </p>

      <label className="text-xs" style={{ color: MUTED }}>
        Дата
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={поле}
        />
      </label>

      <label className="text-xs" style={{ color: MUTED }}>
        Гостей
        <input
          required
          type="number"
          min={1}
          max={30}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={поле}
        />
      </label>

      <label className="text-xs" style={{ color: MUTED }}>
        Пожелания — необязательно
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={поле}
        />
      </label>

      {итог === "нужен-вход" && (
        <p className="text-xs" style={{ color: "#c1603a" }}>
          Чтобы оставить заявку, войдите в аккаунт.
        </p>
      )}
      {итог === "ошибка" && (
        <p className="text-xs" style={{ color: "#c1603a" }}>
          Не получилось отправить. Проверьте дату и попробуйте снова.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setОткрыта(false)}
          className="rounded-xl px-4 py-2.5 text-sm"
          style={{ color: MUTED, border: `1px solid ${BORDER}` }}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={идёт}
          className="min-w-0 flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? "Отправляем…" : "Отправить заявку"}
        </button>
      </div>
    </form>
  );
}
