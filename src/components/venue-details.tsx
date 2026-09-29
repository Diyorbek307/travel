"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCENT_FILL, ACCENT_SOFT, BORDER, CREAM, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import { useДеньги } from "@/lib/money";
import type { Наличие } from "@/lib/availability";
import type { TKey } from "@/lib/i18n";
import { РазделительМеню, РисунокМеню, рисунокРаздела } from "./menu-art";
import type { Fact, Hotel, MenuItem, Place, Restaurant, RoomCategory, RoomType } from "@/lib/types";

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
  comfort: "room_cat_comfort",
  presidential: "room_cat_presidential",
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
              {(н.imgs?.[0] ?? н.img) && (
                <ФотоСПросмотром
                  фото={н.imgs?.length ? н.imgs : [н.img as string]}
                  className="h-20 w-20 flex-shrink-0 rounded-lg"
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
                  👤 {t("d_up_to_guests")} {н.guests} · 🛏 {трК(н.beds)}
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
  const столы = (r.tables ?? []).filter((с) => с.count > 0).sort((a, b) => a.seats - b.seats);
  if (зоны.length === 0 && столы.length === 0 && !r.avgCheck && !наличие) return null;

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
      {столы.length > 0 && (
        <>
          <p className="mb-2 mt-3 text-sm font-bold" style={{ color: TEXT }}>
            {t("d_tables")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {столы.map((с) => (
              <div
                key={с.id}
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ background: CREAM, borderColor: BORDER }}
              >
                <ЗначокСтола мест={с.seats} />
                <div className="leading-tight">
                  <p className="text-xs font-semibold" style={{ color: TEXT }}>
                    {t("d_table_seats").replace("{n}", String(с.seats))}
                  </p>
                  <p className="text-[10px]" style={{ color: MUTED }}>
                    × {с.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Есть меню — чек уже написан внизу меню, второй раз не повторяем. */}
      {r.avgCheck && !r.menu?.length && (
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
      <div className="flex flex-col">
        {билеты.map((б, i) => (
          <div
            key={б.id}
            className="flex items-center justify-between py-2 text-sm"
            style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}
          >
            <span style={{ color: TEXT }}>{трК(б.name)}</span>
            <b style={{ color: GREEN }}>{дг.цена(б.price)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Фото во весь экран: листать пальцем, закрыть крестиком или «назад».
 * Открывается с того снимка, на который нажали.
 *
 * Рисуется прямо в body: у экрана есть анимация появления (transform), и
 * fixed внутри неё прилипал бы к экрану, а не к окну — нижнее меню
 * оставалось бы поверх фото.
 */
export function ПросмотрФото({ фото, с, onClose }: { фото: string[]; с: number; onClose: () => void }) {
  const лента = useRef<HTMLDivElement>(null);
  const [номер, setНомер] = useState(с);

  useEffect(() => {
    const el = лента.current;
    if (el) el.scrollLeft = с * el.clientWidth;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [с, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal>
      <div className="flex items-center justify-between px-4 pb-2 pt-12 text-sm text-white/80">
        <span>
          {номер + 1} / {фото.length}
        </span>
        <button
          onClick={onClose}
          aria-label="close"
          className="h-9 w-9 rounded-xl text-xl text-white"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          ×
        </button>
      </div>
      <div
        ref={лента}
        onScroll={(e) => setНомер(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="hide-scroll flex flex-1 snap-x snap-mandatory overflow-x-auto"
      >
        {фото.map((src, i) => (
          <div
            key={src + i}
            className="flex h-full w-full flex-shrink-0 snap-center items-center justify-center"
          >
            <img src={src} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}

/** Картинка, которая по нажатию открывает весь набор фото. */
function ФотоСПросмотром({ фото, className, с = 0 }: { фото: string[]; className: string; с?: number }) {
  const [открыто, setОткрыто] = useState(false);
  return (
    <>
      <button onClick={() => setОткрыто(true)} className={`relative overflow-hidden ${className}`}>
        <img src={фото[с]} alt="" loading="lazy" className="skel h-full w-full object-cover" />
        {фото.length > 1 && (
          <span className="absolute bottom-1 right-1 rounded-md bg-black/55 px-1 text-[9px] font-bold text-white">
            {фото.length}
          </span>
        )}
      </button>
      {открыто && <ПросмотрФото фото={фото} с={с} onClose={() => setОткрыто(false)} />}
    </>
  );
}

/** Лента фото заведения; по нажатию — во весь экран. */
export function ГалереяЗаведения({ фото, подпись }: { фото: string[]; подпись?: string }) {
  const { t } = useT();
  const [с, setС] = useState<number | null>(null);
  if (фото.length < 2) return null;
  return (
    <div className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="mb-2 text-sm font-bold" style={{ color: TEXT }}>
        📷 {подпись ?? t("d_photos")} · {фото.length}
      </p>
      <div className="hide-scroll -mx-1 flex gap-2 overflow-x-auto px-1">
        {фото.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setС(i)}
            className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl"
          >
            <img src={src} alt="" loading="lazy" className="skel h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {с !== null && <ПросмотрФото фото={фото} с={с} onClose={() => setС(null)} />}
    </div>
  );
}

/*
 * Меню ресторана — как бумажная карта на столе: тёплая бумага в рамке
 * из бирюзы и золота, разделы с рисунками посуды, цена через точки.
 * Фото блюд не показываем: рисунок украшает, а снимок «плова вообще»
 * обещал бы гостю не то, что принесут. Содержимое у каждого заведения
 * своё — из панели, раздел за разделом.
 */
const ПОКАЗАТЬ_СРАЗУ = 8;
const ШРИФТ_МЕНЮ = "var(--font-menu), Georgia, serif";

/** Раздел в рамке, как «From our oven» на печатных меню. */
const ФИРМЕННЫЙ = /тандыр|фирмен|от шефа|выпечк|oven|signature|chef/i;

export function МенюРесторана({ меню, название, чек }: { меню: MenuItem[]; название: string; чек?: string }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const [раздел, setРаздел] = useState<string | null>(null);
  const [целиком, setЦеликом] = useState(false);
  if (меню.length === 0) return null;

  const разделы = [...new Set(меню.map((б) => б.section || "—"))];
  const выбранные = раздел ? [раздел] : разделы;
  // Длинное меню сворачиваем по целым разделам: обрезанный посередине
  // раздел выглядел бы как ошибка.
  let набрано = 0;
  const видимые = выбранные.filter((р) => {
    if (раздел || целиком) return true;
    const было = набрано;
    набрано += меню.filter((б) => (б.section || "—") === р).length;
    return было < ПОКАЗАТЬ_СРАЗУ;
  });
  const скрыто = выбранные.length > видимые.length;

  return (
    <div
      className="mb-3 rounded-[22px] p-[1.5px] shadow-sm"
      style={{
        background: "linear-gradient(145deg, var(--accent), var(--accent-2) 55%, var(--accent-deep))",
      }}
    >
      <div
        className="relative overflow-hidden rounded-[21px] px-5 pb-5 pt-6"
        style={{
          background: "radial-gradient(120% 70% at 50% 0%, var(--menu-paper), var(--menu-paper-2))",
          color: "var(--menu-ink)",
        }}
      >
        {/* Тонкая внутренняя рамка — след тиснения на обложке. */}
        <div
          className="pointer-events-none absolute inset-2 rounded-2xl"
          style={{ border: "1px solid var(--menu-line)" }}
          aria-hidden
        />

        <header className="relative text-center">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.4em]"
            style={{ color: "var(--menu-gold)" }}
          >
            {t("d_menu")}
          </p>
          <h3 className="mt-1 text-[22px] leading-tight" style={{ fontFamily: ШРИФТ_МЕНЮ, fontWeight: 600 }}>
            {трК(название)}
          </h3>
          <div className="mt-2">
            <РазделительМеню />
          </div>
        </header>

        {разделы.length > 2 && (
          <nav className="hide-scroll relative -mx-1 mt-4 flex gap-1 overflow-x-auto px-1">
            {[null, ...разделы].map((р) => (
              <button
                key={р ?? "*"}
                onClick={() => setРаздел(р)}
                className="flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                style={
                  раздел === р
                    ? { background: "var(--menu-gold)", color: "var(--menu-paper)" }
                    : { color: "var(--menu-muted)", border: "1px solid var(--menu-line)" }
                }
              >
                {р === null ? t("d_menu_all") : трК(р)}
              </button>
            ))}
          </nav>
        )}

        <div className="relative mt-2">
          {видимые.map((р) => {
            const блюда = меню.filter((б) => (б.section || "—") === р);
            const фирменный = ФИРМЕННЫЙ.test(р);
            return (
              <section
                key={р}
                className={фирменный ? "mt-5 rounded-xl px-3 pb-2 pt-3" : "mt-5"}
                style={фирменный ? { border: "1px solid var(--menu-gold)" } : undefined}
              >
                <div className="mb-2 flex flex-col items-center" style={{ color: "var(--menu-gold)" }}>
                  <РисунокМеню вид={рисунокРаздела(р, разделы.indexOf(р))} size={34} />
                  <div className="mt-1 flex w-full items-center gap-3">
                    <span className="h-px flex-1" style={{ background: "var(--menu-line)" }} />
                    <h4
                      className="text-center text-[15px] uppercase tracking-[0.18em]"
                      style={{ fontFamily: ШРИФТ_МЕНЮ, color: "var(--menu-ink)", fontWeight: 600 }}
                    >
                      {трК(р)}
                    </h4>
                    <span className="h-px flex-1" style={{ background: "var(--menu-line)" }} />
                  </div>
                </div>
                {блюда.map((б) => (
                  <div key={б.id} className="py-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[14px] font-semibold" style={{ fontFamily: ШРИФТ_МЕНЮ }}>
                        {трК(б.name)}
                      </span>
                      {/* Точки до цены — глаз ведёт по строке, как в печатном меню. */}
                      <span
                        className="min-w-4 flex-1 -translate-y-[3px]"
                        style={{ borderBottom: "1.5px dotted var(--menu-line)" }}
                        aria-hidden
                      />
                      <span
                        className="flex-shrink-0 text-[13px] font-bold"
                        style={{ color: "var(--menu-gold)" }}
                      >
                        {дг.цена(б.price)}
                      </span>
                    </div>
                    {б.desc && (
                      <p
                        className="mt-0.5 pr-10 text-[12px] italic leading-snug"
                        style={{ color: "var(--menu-muted)", fontFamily: ШРИФТ_МЕНЮ }}
                      >
                        {трК(б.desc)}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            );
          })}
        </div>

        {!раздел && (скрыто || целиком) && (
          <div className="relative mt-4 text-center">
            <button
              onClick={() => setЦеликом(!целиком)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ border: "1px solid var(--menu-gold)", color: "var(--menu-gold)" }}
            >
              {целиком ? t("d_menu_less") : `${t("d_menu_full")} · ${меню.length} ${t("d_menu_dishes")}`}
            </button>
          </div>
        )}

        <footer className="relative mt-5 flex flex-col items-center gap-1.5 text-center">
          <div style={{ color: "var(--menu-gold)" }}>
            <РисунокМеню вид="ваза" size={30} />
          </div>
          {чек && (
            <p className="text-xs" style={{ fontFamily: ШРИФТ_МЕНЮ }}>
              {t("d_avg_check")}: <b style={{ color: "var(--menu-gold)" }}>{дг.цена(чек)}</b>
            </p>
          )}
          <p className="text-[10px]" style={{ color: "var(--menu-muted)" }}>
            {t("d_menu_note")}
          </p>
        </footer>
      </div>
    </div>
  );
}

/** Стол сверху: круг и стулья вокруг — сколько мест, столько точек. */
function ЗначокСтола({ мест }: { мест: number }) {
  const n = Math.min(мест, 10);
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden className="flex-shrink-0">
      <circle cx="15" cy="15" r="6.5" fill="none" stroke={GREEN} strokeWidth="1.5" />
      {Array.from({ length: n }, (_, i) => {
        const у = (i / n) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={15 + Math.cos(у) * 11} cy={15 + Math.sin(у) * 11} r="2" fill={GREEN} />;
      })}
    </svg>
  );
}

/** «Полезно знать»: короткие строки, которые редактор ведёт в панели. */
export function ПолезноЗнать({ факты }: { факты: Fact[] }) {
  const { t, трК } = useT();
  const видно = факты.filter((ф) => ф.label.trim() && ф.value.trim());
  if (видно.length === 0) return null;
  return (
    <div className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="mb-1 text-sm font-bold" style={{ color: TEXT }}>
        💡 {t("d_useful")}
      </p>
      {видно.map((ф, i) => (
        <div
          key={ф.id}
          className="flex gap-3 py-2 text-xs"
          style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}
        >
          <span className="w-[38%] flex-shrink-0" style={{ color: MUTED }}>
            {трК(ф.label)}
          </span>
          <span className="font-medium" style={{ color: TEXT }}>
            {трК(ф.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/*
 * Аудиогид голосом телефона — для мест, где записи диктора ещё нет.
 * Читает рассказ о месте на языке интерфейса встроенным синтезом речи:
 * без файлов и без сети, а когда редактор загрузит настоящую запись,
 * карточка покажет её вместо этого блока.
 */
const ГОЛОС: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
  zh: "zh-CN",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  ja: "ja-JP",
  tr: "tr-TR",
  ar: "ar-SA",
};

export function АудиогидГолосом({ заголовок, текст }: { заголовок: string; текст: string }) {
  const { t, lang } = useT();
  const [играет, setИграет] = useState(false);
  const [нет, setНет] = useState(false);

  // Ушёл с карточки — рассказ замолкает, а не продолжает на фоне.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function переключить() {
    const синтез = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!синтез) {
      setНет(true);
      return;
    }
    if (играет) {
      синтез.cancel();
      setИграет(false);
      return;
    }
    const речь = new SpeechSynthesisUtterance(`${заголовок}. ${текст}`);
    речь.lang = ГОЛОС[lang] ?? "en-US";
    // Голос нужного языка, если он есть в системе; нет — браузер выберет сам.
    const голос = синтез.getVoices().find((г) => г.lang.startsWith(lang));
    if (голос) речь.voice = голос;
    речь.rate = 0.95;
    речь.onend = () => setИграет(false);
    речь.onerror = () => setИграет(false);
    синтез.cancel();
    синтез.speak(речь);
    setИграет(true);
  }

  return (
    <div
      className="mb-3 flex items-center gap-3 rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, var(--accent-fill), var(--accent-deep))" }}
    >
      <button
        onClick={переключить}
        aria-label={играет ? t("d_pause") : t("d_listen")}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: "var(--accent-2)" }}
      >
        {играет ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1c1606">
            <rect x="5" y="4" width="5" height="16" rx="1" />
            <rect x="14" y="4" width="5" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1c1606">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">🎧 {t("d_audioguide")}</p>
        <p className="text-[11px] text-white/70">{нет ? t("d_audio_no_voice") : t("d_audio_voice")}</p>
      </div>
      {играет && (
        <span className="flex h-5 items-end gap-0.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="eq-bar w-1 rounded-full bg-white/80"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
