"use client";

import { useState } from "react";
import { BORDER, GOLD, GREEN, MUTED, TEXT, SURFACE, ON_GOLD } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import { датаСловами } from "@/lib/i18n";
import type { BookingKind } from "@/lib/types";

/**
 * Заявка на бронь.
 *
 * Именно заявка, а не подтверждённая бронь: интеграции с системами
 * отелей и ресторанов нет, и обещать место мы не можем. Администратор
 * видит заявку в панели и подтверждает её сам. Формулировки об этом
 * говорят прямо — «заявка отправлена», а не «столик ваш».
 *
 * У отеля ночи и гостей человек уже выбрал в карточке — форма берёт их
 * оттуда, а не спрашивает второй раз своими полями.
 */
export default function BookingForm({
  kind,
  itemId,
  itemName,
  ночей,
  гостей,
}: {
  kind: BookingKind;
  itemId: string;
  itemName: string;
  ночей?: number;
  гостей?: number;
}) {
  const { t, lang } = useT();
  const [открыта, setОткрыта] = useState(false);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [итог, setИтог] = useState<"нет" | "ок" | "нужен-вход" | "ошибка">("нет");
  const [идёт, setИдёт] = useState(false);

  const изКарточки = гостей !== undefined;
  const сколькоГостей = гостей ?? guests;

  const подпись =
    kind === "hotel" ? t("bk_hotel") : kind === "restaurant" ? t("bk_rest") : t("bk_tour");

  /** Дата выезда по дате заезда и числу ночей — чтобы человек видел, на что просит. */
  function выезд(): string | null {
    if (!date || !ночей) return null;
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + ночей);
    return датаСловами(d, lang, "short");
  }

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setИдёт(true);
    setИтог("нет");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, itemName, date, guests: сколькоГостей, nights: ночей, note }),
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
      <div id="заявка" className="mb-3 rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <p className="text-sm font-semibold" style={{ color: GREEN }}>
          {t("bk_sent_title")}
        </p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
          {t("bk_sent_note")}
        </p>
      </div>
    );
  }

  if (!открыта) {
    return (
      <div id="заявка" className="mb-3">
        <button
          onClick={() => setОткрыта(true)}
          className="w-full rounded-2xl py-3.5 text-sm font-bold"
          style={{ background: GOLD, color: ON_GOLD }}
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
  const датаВыезда = выезд();

  return (
    <form
      id="заявка"
      onSubmit={отправить}
      className="mb-3 flex flex-col gap-2.5 rounded-2xl p-4"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
    >
      <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "var(--font-heading)" }}>
        {подпись}
      </p>

      <label className="text-xs" style={{ color: MUTED }}>
        {kind === "hotel" ? t("bk_checkin_date") : t("bk_date")}
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

      {изКарточки ? (
        <p className="text-xs" style={{ color: MUTED }}>
          {ночей ? `${t("d_nights")}: ${ночей} · ` : ""}
          {t("d_guests")}: {сколькоГостей}
          {датаВыезда ? ` · ${t("d_checkout")}: ${датаВыезда}` : ""}
        </p>
      ) : (
        <label className="text-xs" style={{ color: MUTED }}>
          {t("bk_guests")}
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
      )}

      <label className="text-xs" style={{ color: MUTED }}>
        {t("bk_note")}
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
          {t("bk_need_login")}
        </p>
      )}
      {итог === "ошибка" && (
        <p className="text-xs" style={{ color: "#c1603a" }}>
          {t("bk_error")}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setОткрыта(false)}
          className="rounded-xl px-4 py-2.5 text-sm"
          style={{ color: MUTED, border: `1px solid ${BORDER}` }}
        >
          {t("bk_cancel")}
        </button>
        <button
          type="submit"
          disabled={идёт}
          className="min-w-0 flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
          style={{ background: GOLD, color: ON_GOLD }}
        >
          {идёт ? t("rev_sending") : t("bk_send")}
        </button>
      </div>
    </form>
  );
}
