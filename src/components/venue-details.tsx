"use client";

import { useEffect, useState } from "react";
import { ACCENT_FILL, ACCENT_SOFT, BORDER, CREAM, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import { useДеньги } from "@/lib/money";
import type { Наличие } from "@/lib/availability";
import type { TKey } from "@/lib/i18n";
import type { Hotel, Place, Restaurant, RoomCategory, RoomType } from "@/lib/types";

/**
 * Подробности заведений: номера гостиницы, залы ресторана, билеты места —
 * и живое наличие мест, если заведение о нём сообщает (вручную из панели
 * или из своей системы по HelloUZ Partner API).
 */

export const КАТЕГОРИЯ_НОМЕРА: Record<RoomCategory, TKey> = {
  economy: "room_cat_economy",
  standard: "room_cat_standard",
  business: "room_cat_business",
  lux: "room_cat_lux",
  family: "room_cat_family",
  dorm: "room_cat_dorm",
};

/**
 * Наличие мест с сервера. Заведение без подключения даже не спрашиваем:
 * ответ заранее известен, а лишний запрос — лишняя задержка карточки.
 */
export function useНаличие(
  вид: "hotel" | "restaurant",
  запись: { id: string; connection?: { kind: string } },
  параметры: Record<string, string | number | undefined>,
): Наличие | null {
  const [н, setН] = useState<Наличие | null>(null);
  const подключено = запись.connection?.kind === "manual" || запись.connection?.kind === "partner";
  const q = new URLSearchParams({ kind: вид, id: запись.id });
  for (const [k, v] of Object.entries(параметры)) if (v !== undefined && v !== "") q.set(k, String(v));
  const адрес = `/api/availability?${q}`;

  useEffect(() => {
    if (!подключено) {
      setН(null);
      return;
    }
    let отменено = false;
    fetch(адрес)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { наличие?: Наличие | null } | null) => {
        if (!отменено) setН(d?.наличие ?? null);
      })
      .catch(() => {});
    return () => {
      отменено = true;
    };
  }, [адрес, подключено]);
  return н;
}

/** Бейдж «Онлайн · свободно 3» или «Мест нет». */
function БейджНаличия({ свободно, живое }: { свободно: number; живое: boolean }) {
  const { t } = useT();
  const есть = свободно > 0;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={
        есть
          ? { background: ACCENT_SOFT, color: GREEN }
          : { background: "rgba(193,96,58,0.12)", color: "#c1603a" }
      }
    >
      {живое && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: есть ? GREEN : "#c1603a" }} />
      )}
      {есть ? `${t("av_free")}: ${свободно}` : t("av_none")}
    </span>
  );
}

/**
 * Номера гостиницы по категориям. Турист выбирает номер — итог брони и
 * заявка считаются уже по его цене и категории.
 */
export function НомераОтеля({
  hotel,
  ночей,
  гостей,
  выбран,
  onВыбор,
}: {
  hotel: Hotel;
  ночей: number;
  гостей: number;
  выбран: string | null;
  onВыбор: (номер: RoomType) => void;
}) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const сегодня = new Date().toISOString().slice(0, 10);
  const наличие = useНаличие("hotel", hotel, { checkin: сегодня, nights: ночей, guests: гостей });
  const номера = hotel.roomTypes ?? [];
  if (номера.length === 0) return null;

  return (
    <div className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: TEXT }}>
          {t("d_rooms")}
        </p>
        {наличие && (
          <span className="text-[10px]" style={{ color: MUTED }}>
            {наличие.источник === "partner" ? `● ${t("av_live")} · ` : ""}
            {t("av_tonight")}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {номера.map((н) => {
          const есть = наличие?.номера?.find((x) => x.категория === н.category);
          // Цена на эти даты от партнёра точнее цены из карточки.
          const цена = есть?.цена ?? н.price;
          const активен = выбран === н.id;
          const занят = есть !== undefined && есть.свободно === 0;
          return (
            <div
              key={н.id}
              className="flex gap-3 rounded-xl border p-2.5"
              style={{
                borderColor: активен ? ACCENT_FILL : BORDER,
                background: активен ? ACCENT_SOFT : CREAM,
                opacity: занят ? 0.6 : 1,
              }}
            >
              {н.img && (
                <img
                  src={н.img}
                  alt=""
                  loading="lazy"
                  className="skel h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold" style={{ color: TEXT }}>
                    {н.name || t(КАТЕГОРИЯ_НОМЕРА[н.category])}
                  </p>
                  {есть && <БейджНаличия свободно={есть.свободно} живое={наличие?.источник === "partner"} />}
                </div>
                <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
                  👤 {н.guests} {t("d_up_to_guests")} · 🛏 {трК(н.beds)}
                  {н.area ? ` · ${н.area} м²` : ""}
                </p>
                {н.amenities.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {н.amenities.slice(0, 5).map((a) => (
                      <span
                        key={a}
                        className="rounded-md px-1.5 py-0.5 text-[10px]"
                        style={{ background: "var(--surface)", color: MUTED, border: `1px solid ${BORDER}` }}
                      >
                        {трК(a)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p
                    className="text-base font-bold"
                    style={{ color: GREEN, fontFamily: "var(--font-heading)" }}
                  >
                    {дг.одна(цена)}
                    <span className="text-[10px] font-normal" style={{ color: MUTED }}>
                      {t("d_per_night")}
                    </span>
                  </p>
                  <button
                    disabled={занят}
                    onClick={() => onВыбор(н)}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                    style={
                      активен
                        ? { background: ACCENT_FILL, color: WHITE }
                        : { background: "var(--surface)", color: GREEN, border: `1px solid ${ACCENT_FILL}` }
                    }
                  >
                    {активен ? `✓ ${t("d_chosen")}` : t("d_choose")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Залы ресторана, средний чек и — если известно — свободные столы. */
export function ЗалыРесторана({ r }: { r: Restaurant }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const сейчас = new Date();
  const наличие = useНаличие("restaurant", r, {
    date: сейчас.toISOString().slice(0, 10),
    time: `${String(сейчас.getHours()).padStart(2, "0")}:00`,
    guests: 2,
  });
  const зоны = r.zones ?? [];
  if (зоны.length === 0 && !r.avgCheck && !наличие) return null;

  return (
    <div className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      {наличие?.столов !== undefined && (
        <div
          className="mb-3 flex items-center justify-between gap-2 rounded-xl p-2.5"
          style={{ background: CREAM }}
        >
          <span className="text-xs font-semibold" style={{ color: TEXT }}>
            {t("av_tables")}
          </span>
          <БейджНаличия свободно={наличие.столов} живое={наличие.источник === "partner"} />
        </div>
      )}
      {наличие?.столов === 0 && наличие.ближайшее && (
        <p className="-mt-1 mb-3 text-[11px]" style={{ color: MUTED }}>
          {t("av_next")}: <b style={{ color: TEXT }}>{наличие.ближайшее}</b>
        </p>
      )}
      {зоны.length > 0 && (
        <>
          <p className="mb-2 text-sm font-bold" style={{ color: TEXT }}>
            {t("d_zones")}
          </p>
          <div className="flex flex-wrap gap-2">
            {зоны.map((з) => (
              <span
                key={з.id}
                className="rounded-xl border px-3 py-1.5 text-xs"
                style={{ background: CREAM, borderColor: BORDER, color: TEXT }}
              >
                {трК(з.name)} · {з.seats} {t("d_seats")}
              </span>
            ))}
          </div>
        </>
      )}
      {r.avgCheck && (
        <p className="mt-3 text-xs" style={{ color: MUTED }}>
          {t("d_avg_check")}: <b style={{ color: TEXT }}>{дг.цена(r.avgCheck)}</b>
        </p>
      )}
    </div>
  );
}

/** Билеты места: взрослый, детский, льготный… */
export function БилетыМеста({ place }: { place: Place }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const билеты = place.tickets ?? [];
  if (билеты.length === 0) return null;
  return (
    <div className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="mb-2 text-sm font-bold" style={{ color: TEXT }}>
        🎫 {t("d_tickets")}
      </p>
      <div className="flex flex-col divide-y" style={{ borderColor: BORDER }}>
        {билеты.map((б) => (
          <div key={б.id} className="flex items-center justify-between py-2 text-sm">
            <span style={{ color: TEXT }}>{трК(б.name)}</span>
            <b style={{ color: GREEN }}>{дг.цена(б.price)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
