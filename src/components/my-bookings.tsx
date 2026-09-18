"use client";

import { useEffect, useState } from "react";
import { BORDER, GREEN, MUTED, TEXT, WHITE, SURFACE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";

/**
 * Заявки, оставленные туристом.
 *
 * Именно заявки: подтверждает их администратор вручную, поэтому статус
 * показывается словами, а не галочкой. «Новая» значит «ждёт ответа», и
 * человек не должен принимать её за готовую бронь.
 */

interface Booking {
  id: string;
  kind: "hotel" | "restaurant" | "tour";
  itemName: string;
  date: string;
  guests: number;
  status: "new" | "confirmed" | "cancelled";
  createdAt: string;
}

// Подписи переводятся на месте показа: словарь ключей, а не готовых слов.
const ВИД: Record<Booking["kind"], { значок: string; ключ: TKey }> = {
  hotel: { значок: "🏨", ключ: "bk_kind_hotel" },
  restaurant: { значок: "🍽️", ключ: "bk_kind_restaurant" },
  tour: { значок: "🗺️", ключ: "bk_kind_tour" },
};

const СТАТУС: Record<Booking["status"], { ключ: TKey; цвет: string }> = {
  new: { ключ: "bk_new", цвет: "#c1802f" },
  confirmed: { ключ: "bk_confirmed", цвет: GREEN },
  cancelled: { ключ: "bk_cancelled", цвет: "#c1603a" },
};

export default function MyBookings() {
  const { t } = useT();
  const [брони, setБрони] = useState<Booking[]>([]);
  const [загрузка, setЗагрузка] = useState(true);
  const [нуженВход, setНуженВход] = useState(false);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => {
        if (r.status === 401) {
          setНуженВход(true);
          return { bookings: [] };
        }
        return r.json();
      })
      .then((d: { bookings: Booking[] }) => setБрони(d.bookings ?? []))
      .catch(() => setБрони([]))
      .finally(() => setЗагрузка(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {загрузка && (
        <p className="py-10 text-center text-sm" style={{ color: MUTED }}>
          Загружаем…
        </p>
      )}

      {!загрузка && нуженВход && (
        <p className="py-10 text-center text-sm" style={{ color: MUTED }}>
          Войдите в аккаунт, чтобы видеть свои заявки.
        </p>
      )}

      {!загрузка && !нуженВход && брони.length === 0 && (
        <p className="py-10 text-center text-sm leading-relaxed" style={{ color: MUTED }}>
          {t("bk_empty")}
          <br />
          {t("bk_empty_hint")}
        </p>
      )}

      <ul className="grid gap-2.5">
        {брони.map((b) => (
          <li key={b.id} className="rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px]" style={{ color: MUTED }}>
                {ВИД[b.kind].значок} {t(ВИД[b.kind].ключ)}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: СТАТУС[b.status].цвет }}>
                {t(СТАТУС[b.status].ключ)}
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
              {b.itemName}
            </p>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              {b.date} · {b.guests} {b.guests === 1 ? "гость" : "гостей"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
