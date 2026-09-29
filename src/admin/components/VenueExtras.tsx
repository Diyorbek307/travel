"use client";

import { useEffect, useState } from "react";
import { Btn } from "./shared";
import { ГалереяФото } from "./PhotoField";
import { КАТЕГОРИИ } from "@/lib/availability";
import { типовыеНомера } from "@/lib/rooms";
import {
  типовоеМеню,
  типовыеБилеты,
  типовыеСтолы,
  фактыГостиницы,
  фактыМеста,
  фактыРесторана,
} from "@/lib/venue-demo";
import type {
  Connection,
  ConnectionKind,
  Fact,
  Hotel,
  MenuItem,
  Place,
  Restaurant,
  RoomCategory,
  RoomType,
  TableType,
  Ticket,
  Zone,
} from "@/lib/types";

/**
 * Подробности заведения и наличие мест.
 *
 *   у всех     — фотографии и «Полезно знать»;
 *   гостиница — категории номеров со своими фото;
 *   ресторан  — меню, залы, столы и средний чек;
 *   место     — виды билетов;
 *
 * и у гостиниц с ресторанами — откуда приложение знает о свободных местах:
 * ниоткуда (заявка), вручную из этой панели или из системы заведения по
 * HelloUZ Partner API (docs/partner-api.md). Ключ системы сохраняется
 * отдельно, в закрытом хранилище, и обратно в панель не приходит.
 *
 * Своя кнопка «Сохранить»: окно правит только эти поля, а основные
 * (название, город, описание) остаются в обычном окне редактирования.
 * Первое фото галереи становится обложкой — и главным фото записи.
 */

export type Вид = "hotel" | "restaurant" | "place";

export interface Подробности {
  img?: string;
  /** Гостиница: метка на фото («Лучшая цена») и удобства. */
  tag?: string;
  facilities?: string[];
  /** Ресторан: диапазон цен в шапке карточки («$5–15»). */
  price?: string;
  imgs?: string[];
  menu?: MenuItem[];
  roomTypes?: RoomType[];
  zones?: Zone[];
  avgCheck?: string;
  tickets?: Ticket[];
  /** Место: авторы и лицензия фото (CC BY-SA требует подписи). */
  credits?: string;
  /** Гостиница и ресторан: скидка для Premium, %. */
  premiumDiscount?: number;
  tables?: TableType[];
  facts?: Fact[];
  connection?: Connection;
}

const НАЗВАНИЕ_КАТЕГОРИИ: Record<RoomCategory, string> = {
  economy: "Эконом",
  standard: "Стандарт",
  business: "Бизнес",
  lux: "Люкс",
  family: "Семейный",
  dorm: "Место в общем номере",
  comfort: "Комфорт",
  presidential: "Президентский люкс",
};

const РЕЖИМ: Record<ConnectionKind, string> = {
  none: "Нет — бронь уходит заявкой",
  manual: "Вручную — отмечаю свободные места здесь",
  partner: "Система заведения — мы опрашиваем её API (OSHBOARD и др.)",
  push: "Система присылает сама — любая касса или система гостиницы",
};

const новыйId = (префикс: string) =>
  `${префикс}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const поле: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
};
const подпись: React.CSSProperties = { color: "var(--color-muted)", fontFamily: "var(--font-mono)" };

function Поле({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <label className={`text-[10px] ${className}`} style={подпись}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded px-2 py-1.5 text-xs outline-none"
        style={поле}
      />
    </label>
  );
}

function Заголовок({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 mt-5 text-sm font-semibold first:mt-0" style={{ color: "var(--color-text)" }}>
      {children}
    </h4>
  );
}

export default function VenueExtras({
  вид,
  запись,
  onSave,
  onClose,
}: {
  вид: Вид;
  запись: Подробности & {
    id: string;
    name: string;
    img?: string;
    priceFrom?: number;
    kind?: string;
    city?: string;
    cuisine?: string;
    type?: string;
    entry?: string;
  };
  onSave: (изменения: Подробности) => void;
  onClose: () => void;
}) {
  // Галерея: обложка и остальные фото вместе, без повторов.
  const [фото, setФото] = useState<string[]>(() => [
    ...new Set([запись.img, ...(запись.imgs ?? [])].filter((x): x is string => Boolean(x))),
  ]);
  const [меню, setМеню] = useState<MenuItem[]>(запись.menu ?? []);
  const [метка, setМетка] = useState(запись.tag ?? "");
  const [удобства, setУдобства] = useState((запись.facilities ?? []).join(", "));
  const [цены, setЦены] = useState(запись.price ?? "");
  const [номера, setНомера] = useState<RoomType[]>(запись.roomTypes ?? []);
  const [залы, setЗалы] = useState<Zone[]>(запись.zones ?? []);
  const [чек, setЧек] = useState(запись.avgCheck ?? "");
  const [билеты, setБилеты] = useState<Ticket[]>(запись.tickets ?? []);
  const [авторы, setАвторы] = useState(запись.credits ?? "");
  const [скидка, setСкидка] = useState<number | "">(запись.premiumDiscount ?? "");
  const [столы, setСтолы] = useState<TableType[]>(запись.tables ?? []);
  const [факты, setФакты] = useState<Fact[]>(запись.facts ?? []);
  const [связь, setСвязь] = useState<Connection>(запись.connection ?? { kind: "none" });

  const естьНаличие = вид === "hotel" || вид === "restaurant";

  // Запись в том виде, какой ждут генераторы заготовок.
  const какРесторан = (): Restaurant =>
    ({
      ...запись,
      city: запись.city ?? "",
      cuisine: запись.cuisine ?? "",
      price: цены || запись.price || "$5–10",
    } as Restaurant);
  const заготовкаФактов = (): Fact[] =>
    вид === "hotel"
      ? фактыГостиницы({ ...запись, facilities: удобства.split(",").map((x) => x.trim()) } as Hotel)
      : вид === "restaurant"
      ? фактыРесторана(какРесторан())
      : фактыМеста({ ...запись, type: запись.type ?? "", entry: запись.entry ?? "" } as Place);

  function сохранить() {
    const изменения: Подробности = {
      imgs: фото,
      facts: факты.filter((ф) => ф.label.trim() && ф.value.trim()),
    };
    // Без фото обложку не трогаем: пустая карточка хуже старого снимка.
    if (фото[0]) изменения.img = фото[0];
    if (вид === "hotel") {
      изменения.tag = метка.trim();
      изменения.facilities = удобства
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      изменения.roomTypes = номера
        .filter((н) => н.price > 0)
        .map((н) => ({ ...н, img: н.imgs?.[0] ?? н.img }));
    }
    if (вид === "restaurant") {
      изменения.menu = меню.filter((б) => б.name.trim() && б.price.trim());
      изменения.zones = залы.filter((з) => з.name.trim());
      изменения.avgCheck = чек.trim() || undefined;
      изменения.tables = столы.filter((с) => с.seats > 0 && с.count > 0);
      // Пустой диапазон не сохраняем: без него шапка карточки осталась бы с дырой.
      if (цены.trim()) изменения.price = цены.trim();
    }
    if (вид !== "place") {
      // Скидка — 0…50 %: больше похоже на опечатку, чем на щедрость.
      const n = Number(скидка);
      изменения.premiumDiscount = скидка === "" || !Number.isFinite(n) ? 0 : Math.max(0, Math.min(50, Math.round(n)));
    }
    if (вид === "place") {
      изменения.tickets = билеты.filter((б) => б.name.trim() && б.price.trim());
      изменения.credits = авторы.trim() || undefined;
    }
    if (естьНаличие) {
      // Ручные цифры — с отметкой времени: туристу они видны сутки.
      изменения.connection =
        связь.kind === "manual" ? { ...связь, manualUpdatedAt: new Date().toISOString() } : связь;
    }
    onSave(изменения);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
        style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {вид === "hotel"
              ? "Фото, номера и наличие"
              : вид === "restaurant"
              ? "Фото, меню, залы и наличие"
              : "Фото и билеты"}{" "}
            — {запись.name}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-xl opacity-50 hover:opacity-100"
            style={{ color: "var(--color-text)" }}
          >
            ×
          </button>
        </div>

        <Заголовок>Фотографии</Заголовок>

        <ГалереяФото label="ПЕРВОЕ ФОТО — ОБЛОЖКА В СПИСКАХ И КАРТОЧКЕ" values={фото} onChange={setФото} />
        {вид !== "place" && (
          <>
            <Заголовок>Скидка для Premium</Заголовок>
            <div className="max-w-xs">
              <Поле
                label="СКИДКА, % (0 — НЕТ, МАКСИМУМ 50)"
                type="number"
                value={скидка}
                onChange={(v) => setСкидка(v === "" ? "" : Number(v))}
                placeholder="например, 10"
              />
            </div>
            <p className="mt-1 text-[11px]" style={подпись}>
              Турист с Premium показывает экран скидки на кассе или ресепшене. Договоритесь о скидке с
              заведением заранее.
            </p>
          </>
        )}
        {вид === "place" && (
          <div className="mt-2">
            <Поле
              label="АВТОРЫ ФОТО И ЛИЦЕНЗИЯ (ПОДПИСЬ ПОД ГАЛЕРЕЕЙ)"
              value={авторы}
              onChange={setАвторы}
              placeholder="Фото: Имя Автора — Wikimedia Commons, CC BY-SA 4.0"
            />
          </div>
        )}

        {вид === "hotel" && (
          <>
            <Заголовок>О гостинице</Заголовок>
            <div className="grid gap-2 sm:grid-cols-3">
              <Поле
                label="МЕТКА НА ФОТО"
                value={метка}
                onChange={setМетка}
                placeholder="Лучшая цена, Популярный…"
              />
              <Поле
                label="УДОБСТВА ЧЕРЕЗ ЗАПЯТУЮ"
                value={удобства}
                onChange={setУдобства}
                className="sm:col-span-2"
                placeholder="Wi-Fi, Бассейн, Парковка, Завтрак…"
              />
            </div>
            <Заголовок>Категории номеров</Заголовок>
            <div className="flex flex-col gap-3">
              {номера.map((н, i) => {
                const правка = (изм: Partial<RoomType>) =>
                  setНомера((все) => все.map((x, j) => (j === i ? { ...x, ...изм } : x)));
                return (
                  <div
                    key={н.id}
                    className="rounded-lg p-3"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <label className="text-[10px]" style={подпись}>
                        КАТЕГОРИЯ
                        <select
                          value={н.category}
                          onChange={(e) => правка({ category: e.target.value as RoomCategory })}
                          className="mt-0.5 w-full rounded px-2 py-1.5 text-xs outline-none"
                          style={поле}
                        >
                          {КАТЕГОРИИ.map((к) => (
                            <option key={к} value={к}>
                              {НАЗВАНИЕ_КАТЕГОРИИ[к]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Поле
                        label="СВОЁ НАЗВАНИЕ"
                        value={н.name ?? ""}
                        onChange={(v) => правка({ name: v || undefined })}
                        placeholder="необязательно"
                      />
                      <Поле
                        label="ЦЕНА $ / НОЧЬ"
                        type="number"
                        value={н.price}
                        onChange={(v) => правка({ price: Number(v) || 0 })}
                      />
                      <Поле
                        label="ГОСТЕЙ"
                        type="number"
                        value={н.guests}
                        onChange={(v) => правка({ guests: Math.max(1, Number(v) || 1) })}
                      />
                      <Поле
                        label="КРОВАТИ"
                        value={н.beds}
                        onChange={(v) => правка({ beds: v })}
                        className="col-span-2"
                      />
                      <Поле
                        label="ПЛОЩАДЬ, М²"
                        type="number"
                        value={н.area ?? ""}
                        onChange={(v) => правка({ area: Number(v) || undefined })}
                      />
                      <div className="col-span-2 sm:col-span-4">
                        <ГалереяФото
                          label="ФОТО НОМЕРА: СПАЛЬНЯ, ВАННАЯ, ВИД ИЗ ОКНА…"
                          values={н.imgs ?? (н.img ? [н.img] : [])}
                          onChange={(imgs) => правка({ imgs, img: imgs[0] })}
                        />
                      </div>
                      <Поле
                        label="УДОБСТВА ЧЕРЕЗ ЗАПЯТУЮ"
                        value={н.amenities.join(", ")}
                        onChange={(v) =>
                          правка({
                            amenities: v
                              .split(",")
                              .map((a) => a.trim())
                              .filter(Boolean),
                          })
                        }
                        className="col-span-2 sm:col-span-4"
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <Btn
                        small
                        variant="danger"
                        onClick={() => setНомера((все) => все.filter((_, j) => j !== i))}
                      >
                        Убрать номер
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn
                small
                variant="ghost"
                onClick={() =>
                  setНомера((все) => [
                    ...все,
                    {
                      id: новыйId("rt"),
                      category: "standard",
                      price: запись.priceFrom ?? 50,
                      guests: 2,
                      beds: "1 двуспальная",
                      amenities: ["Wi-Fi"],
                    },
                  ])
                }
              >
                + Номер
              </Btn>
              <Btn
                small
                variant="ghost"
                onClick={() => {
                  if (
                    номера.length &&
                    !confirm("Заменить текущие номера типовыми? Их нужно будет поправить под настоящие.")
                  )
                    return;
                  setНомера(типовыеНомера(запись.id, запись.priceFrom ?? 50, запись.kind === "hostel"));
                }}
              >
                Заполнить типовыми
              </Btn>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
              Типовые — заготовка от цены «от». Поправьте цены, кровати и удобства под настоящие номера.
            </p>
          </>
        )}

        {вид === "restaurant" && (
          <>
            <РедакторМеню меню={меню} setМеню={setМеню} заготовка={() => типовоеМеню(какРесторан())} />
            <Заголовок>Залы и места</Заголовок>
            <div className="flex flex-col gap-2">
              {залы.map((з, i) => (
                <div key={з.id} className="flex items-end gap-2">
                  <Поле
                    label="ЗАЛ"
                    value={з.name}
                    onChange={(v) => setЗалы((все) => все.map((x, j) => (j === i ? { ...x, name: v } : x)))}
                    className="flex-1"
                    placeholder="Основной зал, терраса, VIP…"
                  />
                  <Поле
                    label="МЕСТ"
                    type="number"
                    value={з.seats}
                    onChange={(v) =>
                      setЗалы((все) =>
                        все.map((x, j) => (j === i ? { ...x, seats: Math.max(0, Number(v) || 0) } : x)),
                      )
                    }
                    className="w-24"
                  />
                  <Btn small variant="danger" onClick={() => setЗалы((все) => все.filter((_, j) => j !== i))}>
                    ×
                  </Btn>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Btn
                small
                variant="ghost"
                onClick={() => setЗалы((все) => [...все, { id: новыйId("z"), name: "", seats: 20 }])}
              >
                + Зал
              </Btn>
            </div>
            <Заголовок>Столы по числу мест</Заголовок>
            <p className="mb-2 text-[11px]" style={подпись}>
              Сколько столов на двоих, на четверых, на компанию — турист видит это в карточке.
            </p>
            <div className="flex flex-col gap-2">
              {столы.map((с, i) => (
                <div key={с.id} className="flex items-end gap-2">
                  <Поле
                    label="МЕСТ ЗА СТОЛОМ"
                    type="number"
                    value={с.seats}
                    onChange={(v) =>
                      setСтолы((все) =>
                        все.map((x, j) => (j === i ? { ...x, seats: Math.max(0, Number(v) || 0) } : x)),
                      )
                    }
                    className="w-32"
                  />
                  <Поле
                    label="СТОЛОВ"
                    type="number"
                    value={с.count}
                    onChange={(v) =>
                      setСтолы((все) =>
                        все.map((x, j) => (j === i ? { ...x, count: Math.max(0, Number(v) || 0) } : x)),
                      )
                    }
                    className="w-28"
                  />
                  <Btn
                    small
                    variant="danger"
                    onClick={() => setСтолы((все) => все.filter((_, j) => j !== i))}
                  >
                    ×
                  </Btn>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn
                small
                variant="ghost"
                onClick={() => setСтолы((все) => [...все, { id: новыйId("tb"), seats: 4, count: 1 }])}
              >
                + Стол
              </Btn>
              {столы.length === 0 && (
                <Btn small variant="ghost" onClick={() => setСтолы(типовыеСтолы(какРесторан()))}>
                  Заполнить: на 2, 4, 6 и 10
                </Btn>
              )}
            </div>
            <div className="mt-3 grid max-w-md gap-2 sm:grid-cols-2">
              <Поле
                label="СРЕДНИЙ ЧЕК НА ЧЕЛОВЕКА"
                value={чек}
                onChange={setЧек}
                placeholder="$10–15 или 80 000 сум"
              />
              <Поле label="ЦЕНЫ В ШАПКЕ КАРТОЧКИ" value={цены} onChange={setЦены} placeholder="$5–15" />
            </div>
          </>
        )}

        {вид === "place" && (
          <>
            <Заголовок>Виды билетов</Заголовок>
            <div className="flex flex-col gap-2">
              {билеты.map((б, i) => (
                <div key={б.id} className="flex items-end gap-2">
                  <Поле
                    label="БИЛЕТ"
                    value={б.name}
                    onChange={(v) => setБилеты((все) => все.map((x, j) => (j === i ? { ...x, name: v } : x)))}
                    className="flex-1"
                    placeholder="Взрослый, детский, для граждан Узбекистана…"
                  />
                  <Поле
                    label="ЦЕНА"
                    value={б.price}
                    onChange={(v) =>
                      setБилеты((все) => все.map((x, j) => (j === i ? { ...x, price: v } : x)))
                    }
                    className="w-36"
                    placeholder="$5 или 20 000 сум"
                  />
                  <Btn
                    small
                    variant="danger"
                    onClick={() => setБилеты((все) => все.filter((_, j) => j !== i))}
                  >
                    ×
                  </Btn>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Btn
                small
                variant="ghost"
                onClick={() => setБилеты((все) => [...все, { id: новыйId("t"), name: "", price: "" }])}
              >
                + Билет
              </Btn>{" "}
              {билеты.length === 0 && (
                <Btn
                  small
                  variant="ghost"
                  onClick={() => setБилеты(типовыеБилеты({ ...запись, entry: запись.entry ?? "" } as Place))}
                >
                  Заполнить: взрослый, детский, льготный…
                </Btn>
              )}
            </div>
          </>
        )}

        <Заголовок>Полезно знать</Заголовок>
        <p className="mb-2 text-[11px]" style={подпись}>
          Короткие строки для туриста: заезд и выезд, дресс-код, оплата, халяль, лучшее время…
        </p>
        <div className="flex flex-col gap-2">
          {факты.map((ф, i) => (
            <div key={ф.id} className="flex items-end gap-2">
              <Поле
                label="ЧТО"
                value={ф.label}
                onChange={(v) => setФакты((все) => все.map((x, j) => (j === i ? { ...x, label: v } : x)))}
                className="w-40"
                placeholder="Дресс-код"
              />
              <Поле
                label="КАК"
                value={ф.value}
                onChange={(v) => setФакты((все) => все.map((x, j) => (j === i ? { ...x, value: v } : x)))}
                className="flex-1"
                placeholder="Плечи и колени закрыты"
              />
              <Btn small variant="danger" onClick={() => setФакты((все) => все.filter((_, j) => j !== i))}>
                ×
              </Btn>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn
            small
            variant="ghost"
            onClick={() => setФакты((все) => [...все, { id: новыйId("f"), label: "", value: "" }])}
          >
            + Строка
          </Btn>
          {факты.length === 0 && (
            <Btn small variant="ghost" onClick={() => setФакты(заготовкаФактов())}>
              Заполнить примером
            </Btn>
          )}
        </div>

        {естьНаличие && (
          <НаличиеМест
            вид={вид as "hotel" | "restaurant"}
            id={запись.id}
            связь={связь}
            setСвязь={setСвязь}
            номера={номера}
          />
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Отмена
          </Btn>
          <Btn onClick={сохранить}>Сохранить</Btn>
        </div>
      </div>
    </div>
  );
}

/** Откуда приложение знает о свободных местах — и ключ системы заведения. */
function НаличиеМест({
  вид,
  id,
  связь,
  setСвязь,
  номера,
}: {
  вид: "hotel" | "restaurant";
  id: string;
  связь: Connection;
  setСвязь: (с: Connection) => void;
  номера: RoomType[];
}) {
  const [адрес, setАдрес] = useState("");
  const [ключ, setКлюч] = useState("");
  const [сохранённый, setСохранённый] = useState<string | null>(null);
  const [итог, setИтог] = useState<string | null>(null);

  // Что уже настроено: адрес и хвост ключа. Сам ключ панель не видит.
  useEffect(() => {
    if (связь.kind !== "partner") return;
    fetch("/api/admin/partners")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { подключения?: { вид: string; id: string; baseUrl: string; ключ: string }[] } | null) => {
        const п = d?.подключения?.find((x) => x.вид === вид && x.id === id);
        if (п) {
          setАдрес(п.baseUrl);
          setСохранённый(п.ключ);
        }
      })
      .catch(() => {});
  }, [связь.kind, вид, id]);

  async function сохранитьКлюч() {
    setИтог(null);
    const res = await fetch("/api/admin/partners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: вид, id, baseUrl: адрес.trim(), key: ключ.trim() }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setИтог("Адрес и ключ сохранены.");
      if (ключ.trim()) setСохранённый(`••••${ключ.trim().slice(-4)}`);
      setКлюч("");
    } else {
      const причины: Record<string, string> = {
        url_invalid: "Адрес должен начинаться с https://",
        key_required: "Введите ключ доступа.",
        key_invalid: "Ключ слишком длинный.",
      };
      setИтог(причины[(d as { error?: string }).error ?? ""] ?? "Не удалось сохранить.");
    }
  }

  async function проверить() {
    setИтог("Проверяем…");
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: вид, id }),
    }).catch(() => null);
    const d = (res ? await res.json().catch(() => null) : null) as {
      ok?: boolean;
      причина?: string;
      наличие?: unknown;
    } | null;
    setИтог(
      d?.ok
        ? `Связь есть. Ответ системы: ${JSON.stringify(d.наличие)}`
        : d?.причина ?? "Проверка не удалась. Сохраните окно и попробуйте снова.",
    );
  }

  const ручные = связь.manual ?? {};
  const категории = [...new Set(номера.map((н) => н.category))];

  return (
    <>
      <Заголовок>Свободные места</Заголовок>
      <div className="flex flex-col gap-1.5">
        {(Object.keys(РЕЖИМ) as ConnectionKind[]).map((к) => (
          <label
            key={к}
            className="flex cursor-pointer items-center gap-2 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            <input type="radio" checked={связь.kind === к} onChange={() => setСвязь({ ...связь, kind: к })} />
            {РЕЖИМ[к]}
          </label>
        ))}
      </div>

      {связь.kind === "manual" && (
        <div className="mt-3 rounded-lg p-3" style={{ border: "1px solid var(--color-border)" }}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {вид === "restaurant" ? (
              <Поле
                label="СВОБОДНО СТОЛОВ"
                type="number"
                value={ручные.tables ?? ""}
                onChange={(v) =>
                  setСвязь({
                    ...связь,
                    manual: { ...ручные, tables: v === "" ? undefined : Math.max(0, Number(v) || 0) },
                  })
                }
              />
            ) : категории.length ? (
              категории.map((к) => (
                <Поле
                  key={к}
                  label={`СВОБОДНО: ${НАЗВАНИЕ_КАТЕГОРИИ[к].toUpperCase()}`}
                  type="number"
                  value={ручные[к] ?? ""}
                  onChange={(v) =>
                    setСвязь({
                      ...связь,
                      manual: { ...ручные, [к]: v === "" ? undefined : Math.max(0, Number(v) || 0) },
                    })
                  }
                />
              ))
            ) : (
              <p className="col-span-4 text-xs" style={{ color: "var(--color-muted)" }}>
                Сначала добавьте категории номеров выше.
              </p>
            )}
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
            Туристы видят эти цифры сутки после сохранения — потом бейдж пропадает, чтобы не показывать
            устаревшее.
          </p>
        </div>
      )}

      {связь.kind === "push" && <ПриёмОтСистемы вид={вид} id={id} />}

      {связь.kind === "partner" && (
        <div className="mt-3 rounded-lg p-3" style={{ border: "1px solid var(--color-border)" }}>
          <div className="grid gap-2 sm:grid-cols-2">
            <Поле
              label="ID ЗАВЕДЕНИЯ В СИСТЕМЕ"
              value={связь.externalId ?? ""}
              onChange={(v) => setСвязь({ ...связь, externalId: v.trim() || undefined })}
            />
            <Поле
              label="АДРЕС API"
              value={адрес}
              onChange={setАдрес}
              placeholder="https://api.oshboard.uz/hellouz"
            />
            <Поле
              label={сохранённый ? `КЛЮЧ (СОХРАНЁН ${сохранённый})` : "КЛЮЧ ДОСТУПА"}
              type="password"
              value={ключ}
              onChange={setКлюч}
              placeholder={сохранённый ? "оставьте пустым, чтобы не менять" : ""}
              className="sm:col-span-2"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Btn small variant="ghost" onClick={сохранитьКлюч}>
              Сохранить адрес и ключ
            </Btn>
            <Btn small variant="ghost" onClick={проверить}>
              Проверить связь
            </Btn>
          </div>
          {итог && (
            <p className="mt-2 break-all text-xs" style={{ color: "var(--color-muted)" }}>
              {итог}
            </p>
          )}
          <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
            Проверка читает сохранённый режим и ID — сначала нажмите «Сохранить» внизу окна. Стандарт для
            разработчиков системы — docs/partner-api.md.
          </p>
        </div>
      )}
    </>
  );
}

/**
 * Режим «система присылает сама»: ключ приёма и подсказка разработчику
 * системы — куда и что слать. Ключ виден один раз, сразу после выдачи.
 */
function ПриёмОтСистемы({ вид, id }: { вид: "hotel" | "restaurant"; id: string }) {
  const [состояние, setСостояние] = useState<{
    ключВыдан: string | null;
    последнееОбновление: string | null;
  }>();
  const [новыйКлюч, setНовыйКлюч] = useState<string | null>(null);
  const адрес = typeof window === "undefined" ? "" : window.location.origin;

  const загрузить = () =>
    fetch(`/api/admin/partners?kind=${вид}&id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.приём && setСостояние(d.приём))
      .catch(() => {});
  useEffect(() => {
    void загрузить();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [вид, id]);

  async function выдать() {
    if (состояние?.ключВыдан && !confirm("Выдать новый ключ? Старый сразу перестанет работать.")) return;
    const res = await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: вид, id, action: "issue" }),
    }).catch(() => null);
    const d = res?.ok ? await res.json().catch(() => null) : null;
    if (d?.ключ) {
      setНовыйКлюч(d.ключ);
      void загрузить();
    }
  }

  async function отозвать() {
    if (!confirm("Отозвать ключ? Система заведения перестанет присылать данные.")) return;
    await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: вид, id, action: "revoke" }),
    }).catch(() => null);
    setНовыйКлюч(null);
    void загрузить();
  }

  const когда = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString("ru-RU") : "—");
  const пример =
    вид === "hotel"
      ? `{"rooms":[{"category":"standard","free":3,"price":85}]}`
      : `{"free_tables":4,"next_free_time":"19:30"}`;

  return (
    <div className="mt-3 rounded-lg p-3 text-xs" style={{ border: "1px solid var(--color-border)" }}>
      <p style={{ color: "var(--color-text)" }}>
        Ключ выдан: <b>{когда(состояние?.ключВыдан)}</b> · Последние данные от системы:{" "}
        <b>{когда(состояние?.последнееОбновление)}</b>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn small variant="ghost" onClick={выдать}>
          {состояние?.ключВыдан ? "Выдать новый ключ" : "Выдать ключ приёма"}
        </Btn>
        {состояние?.ключВыдан && (
          <Btn small variant="danger" onClick={отозвать}>
            Отозвать
          </Btn>
        )}
      </div>
      {новыйКлюч && (
        <div className="mt-2 rounded p-2" style={{ background: "var(--color-dim)" }}>
          <p style={{ color: "var(--color-rose)" }}>Скопируйте ключ сейчас — больше он показан не будет:</p>
          <code className="mt-1 block select-all break-all" style={{ color: "var(--color-text)" }}>
            {новыйКлюч}
          </code>
        </div>
      )}
      <div className="mt-3 space-y-1" style={{ color: "var(--color-muted)" }}>
        <p>Передайте разработчику системы заведения:</p>
        <code className="block break-all">
          POST {адрес}/api/partner/v1/availability — свободные места, пример: {пример}
        </code>
        <code className="block break-all">
          GET {адрес}/api/partner/v1/reservations — новые брони туристов
        </code>
        <code className="block break-all">
          POST {адрес}/api/partner/v1/reservations/&lt;id&gt; — {`{"status":"confirmed"}`} или rejected
        </code>
        <p>Заголовок каждого запроса: Authorization: Bearer &lt;ключ&gt;. Подробно — docs/partner-api.md.</p>
        <p>Цифры старше 6 часов туристам не показываются — система должна присылать их хотя бы раз в час.</p>
      </div>
    </div>
  );
}

/**
 * Меню ресторана: блюда по разделам, с ценой и описанием. Разделы —
 * свободный текст с подсказками: у чайханы и у ресторана они разные.
 *
 * Фото блюд нет намеренно: меню в приложении оформлено как бумажное,
 * с рисунками посуды, а снимок блюда обещал бы то, чего могут не подать.
 */
function РедакторМеню({
  меню,
  setМеню,
  заготовка,
}: {
  меню: MenuItem[];
  setМеню: (m: MenuItem[]) => void;
  заготовка: () => MenuItem[];
}) {
  const разделы = [
    ...new Set([
      "Салаты",
      "Супы",
      "Горячее",
      "Плов",
      "Выпечка",
      "Десерты",
      "Напитки",
      ...меню.map((б) => б.section),
    ]),
  ];
  const правка = (i: number, изм: Partial<MenuItem>) =>
    setМеню(меню.map((б, j) => (j === i ? { ...б, ...изм } : б)));
  return (
    <>
      <Заголовок>Меню</Заголовок>
      <datalist id="разделы-меню">
        {разделы.map((р) => (
          <option key={р} value={р} />
        ))}
      </datalist>
      <div className="flex flex-col gap-3">
        {меню.map((б, i) => (
          <div key={б.id} className="rounded-lg p-3" style={{ border: "1px solid var(--color-border)" }}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <label className="text-[10px]" style={подпись}>
                РАЗДЕЛ
                <input
                  list="разделы-меню"
                  value={б.section}
                  onChange={(e) => правка(i, { section: e.target.value })}
                  className="mt-0.5 w-full rounded px-2 py-1.5 text-xs outline-none"
                  style={поле}
                />
              </label>
              <Поле
                label="БЛЮДО"
                value={б.name}
                onChange={(v) => правка(i, { name: v })}
                className="sm:col-span-2"
              />
              <Поле
                label="ЦЕНА"
                value={б.price}
                onChange={(v) => правка(i, { price: v })}
                placeholder="$6 или 45 000 сум"
              />
              <Поле
                label="ОПИСАНИЕ"
                value={б.desc ?? ""}
                onChange={(v) => правка(i, { desc: v || undefined })}
                className="col-span-2 sm:col-span-4"
                placeholder="состав, порция, острота…"
              />
            </div>
            <div className="mt-2 text-right">
              <Btn small variant="danger" onClick={() => setМеню(меню.filter((_, j) => j !== i))}>
                Убрать блюдо
              </Btn>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Btn
          small
          variant="ghost"
          onClick={() =>
            setМеню([
              ...меню,
              { id: новыйId("m"), section: меню[меню.length - 1]?.section ?? "Горячее", name: "", price: "" },
            ])
          }
        >
          + Блюдо
        </Btn>{" "}
        {меню.length === 0 && (
          <Btn small variant="ghost" onClick={() => setМеню(заготовка())}>
            Заполнить примером по кухне
          </Btn>
        )}
      </div>
    </>
  );
}
