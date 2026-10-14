"use client";

import { useCallback, useEffect, useState } from "react";
import { ТЕКСТЫ, выбратьЯзык, type КлючКабинета, type ЯзыкКабинета } from "./texts";
import { Заголовок, Карточка, Кнопка, цвет } from "./ui";
import { ФормаАнкеты } from "./profile-form";
import { ТурыГида } from "./tours";
import {
  ПОКУПКИ,
  действует,
  виденВКаталоге,
  ценаПокупки,
  type Партнёр,
  type ТурПартнёра,
  type Тарифы,
  type Покупка,
  type ВидПартнёра,
} from "@/lib/provider-rules";
import type { Booking } from "@/lib/community";

/**
 * Кабинет водителя и гида — /cabinet.
 *
 * Работает под обычным аккаунтом HelloUZ. Нет входа — объясняем, зачем
 * кабинет, и ведём на вход (вернём сюда же). Нет анкеты — выбор «водитель
 * или гид» и анкета. Есть — обзор, анкета, туры (у гида), заявки, оплата.
 */

type Данные = {
  user: { firstName: string; lastName: string; email: string; phone: string };
  providers: Партнёр[];
  tours: ТурПартнёра[];
  bookings: Booking[];
  orders: {
    id: string;
    providerId: string;
    покупка: Покупка;
    сумма: number;
    статус: string;
    createdAt: string;
  }[];
  tariffs: Тарифы;
  paySystems: ("payme" | "click")[];
};

type Вкладка = "overview" | "profile" | "tours" | "requests" | "billing";

export default function КабинетПартнёра() {
  const [язык, setЯзык] = useState<ЯзыкКабинета>("ru");
  const [данные, setДанные] = useState<Данные | null | "гость">(null);
  const [выбран, setВыбран] = useState<string | null>(null);
  const [новая, setНовая] = useState<ВидПартнёра | null>(null);
  const [вкладка, setВкладка] = useState<Вкладка>("overview");

  useEffect(() => setЯзык(выбратьЯзык()), []);
  const t = useCallback(
    (к: КлючКабинета) => (ТЕКСТЫ[к] as Record<ЯзыкКабинета, string> | undefined)?.[язык] ?? "",
    [язык],
  );

  const загрузить = useCallback(async () => {
    const r = await fetch("/api/cabinet", { cache: "no-store" });
    if (r.status === 401) return setДанные("гость");
    const d = (await r.json()) as Данные;
    setДанные(d);
    setВыбран((было) => (было && d.providers.some((п) => п.id === было) ? было : d.providers[0]?.id ?? null));
  }, []);
  useEffect(() => {
    void загрузить();
  }, [загрузить]);

  const сменитьЯзык = (я: ЯзыкКабинета) => {
    setЯзык(я);
    try {
      localStorage.setItem("uzup.lang", я);
    } catch {}
  };

  const анкета = данные && данные !== "гость" ? данные.providers.find((п) => п.id === выбран) ?? null : null;

  return (
    <main className="min-h-[100dvh] overflow-y-auto" style={{ background: цвет.фон, height: "100dvh" }}>
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{ borderColor: цвет.рамка, background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-xl" />
            <span className="leading-tight">
              <span
                className="block text-sm font-bold"
                style={{ color: цвет.текст, fontFamily: "var(--font-heading)" }}
              >
                HelloUZ
              </span>
              <span
                className="block text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: цвет.золото }}
              >
                {t("title")}
              </span>
            </span>
          </a>
          <span className="flex-1" />
          {(["ru", "uz", "en"] as const).map((я) => (
            <button
              key={я}
              onClick={() => сменитьЯзык(я)}
              className="rounded-lg px-2 py-1 text-xs font-bold uppercase"
              style={я === язык ? { background: цвет.мягкий, color: цвет.акцент } : { color: цвет.тихий }}
            >
              {я}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-4 pb-16">
        {данные === null && (
          <p className="py-20 text-center text-sm" style={{ color: цвет.тихий }}>
            {t("loading")}
          </p>
        )}
        {данные === "гость" && <Гость t={t} />}
        {данные && данные !== "гость" && (
          <>
            {новая ? (
              <>
                <h1
                  className="mb-3 text-xl font-bold"
                  style={{ color: цвет.текст, fontFamily: "var(--font-heading)" }}
                >
                  {t(новая === "driver" ? "form_driver" : "form_guide")}
                </h1>
                <ФормаАнкеты
                  вид={новая}
                  анкета={null}
                  имя={`${данные.user.firstName} ${данные.user.lastName}`.trim()}
                  телефон={данные.user.phone}
                  язык={язык}
                  t={t}
                  onCancel={() => setНовая(null)}
                  onSaved={async (п) => {
                    setНовая(null);
                    setВыбран(п.id);
                    setВкладка("overview");
                    await загрузить();
                  }}
                />
              </>
            ) : !анкета ? (
              <ВыборРоли t={t} trialDays={данные.tariffs.trialDays} onВыбор={setНовая} />
            ) : (
              <>
                <Переключатель
                  t={t}
                  анкеты={данные.providers}
                  выбрана={анкета.id}
                  onВыбор={(id) => {
                    setВыбран(id);
                    setВкладка("overview");
                  }}
                  onНовая={
                    данные.providers.length < 2
                      ? () => setНовая(данные.providers[0].kind === "driver" ? "guide" : "driver")
                      : undefined
                  }
                />
                <Вкладки
                  t={t}
                  гид={анкета.kind === "guide"}
                  вкладка={вкладка}
                  onВкладка={setВкладка}
                  новых={
                    данные.bookings.filter((b) => b.providerId === анкета.id && b.status === "new").length
                  }
                />
                {вкладка === "overview" && (
                  <Обзор
                    t={t}
                    язык={язык}
                    п={анкета}
                    туров={данные.tours.filter((т) => т.providerId === анкета.id).length}
                    onВкладка={setВкладка}
                  />
                )}
                {вкладка === "profile" && (
                  <ФормаАнкеты
                    key={анкета.id + анкета.updatedAt}
                    вид={анкета.kind}
                    анкета={анкета}
                    имя=""
                    телефон=""
                    язык={язык}
                    t={t}
                    onSaved={() => void загрузить()}
                  />
                )}
                {вкладка === "tours" && анкета.kind === "guide" && (
                  <ТурыГида
                    providerId={анкета.id}
                    туры={данные.tours.filter((т) => т.providerId === анкета.id)}
                    город={анкета.city}
                    язык={язык}
                    t={t}
                    onChange={() => void загрузить()}
                  />
                )}
                {вкладка === "requests" && (
                  <Заявки
                    t={t}
                    язык={язык}
                    заявки={данные.bookings.filter((b) => b.providerId === анкета.id)}
                    onChange={() => void загрузить()}
                  />
                )}
                {вкладка === "billing" && (
                  <Оплата
                    t={t}
                    язык={язык}
                    п={анкета}
                    тарифы={данные.tariffs}
                    системы={данные.paySystems}
                    заказы={данные.orders.filter((з) => з.providerId === анкета.id)}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

type T = (к: КлючКабинета) => string;

function Гость({ t }: { t: T }) {
  const куда = encodeURIComponent("/cabinet");
  return (
    <div className="py-4">
      <div
        className="mb-4 overflow-hidden rounded-3xl p-6 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--accent-deep), var(--accent-fill))" }}
      >
        <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: цвет.золото }}>
          {t("brand")}
        </p>
        <h1 className="mb-3 text-2xl font-bold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {t("guest_title")}
        </h1>
        <p className="mb-4 text-sm leading-relaxed text-white/85">{t("guest_text")}</p>
        <ul className="mb-5 space-y-2 text-sm">
          {(["guest_b1", "guest_b2", "guest_b3", "guest_b4"] as const).map((к) => (
            <li key={к} className="flex gap-2">
              <span style={{ color: цвет.золото }}>✓</span>
              {t(к)}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={`/?auth=login&next=${куда}`}
            className="flex-1 rounded-xl py-3 text-center text-sm font-bold"
            style={{ background: цвет.золото, color: цвет.наЗолоте }}
          >
            {t("login")}
          </a>
          <a
            href={`/?auth=register&next=${куда}`}
            className="flex-1 rounded-xl border py-3 text-center text-sm font-bold text-white"
            style={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            {t("register")}
          </a>
        </div>
        <p className="mt-3 text-center text-[11px] text-white/70">{t("login_hint")}</p>
      </div>
    </div>
  );
}

function ВыборРоли({
  t,
  trialDays,
  onВыбор,
}: {
  t: T;
  trialDays: number;
  onВыбор: (в: ВидПартнёра) => void;
}) {
  return (
    <div className="py-2">
      <h1 className="mb-1 text-xl font-bold" style={{ color: цвет.текст, fontFamily: "var(--font-heading)" }}>
        {t("who_title")}
      </h1>
      <p className="mb-4 text-sm" style={{ color: цвет.тихий }}>
        🎁 {t("trial").replace("{n}", String(trialDays))}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["driver", "🚗", "who_driver", "who_driver_sub"],
            ["guide", "🧭", "who_guide", "who_guide_sub"],
          ] as const
        ).map(([вид, иконка, заг, под]) => (
          <button
            key={вид}
            onClick={() => onВыбор(вид)}
            className="group rounded-3xl border p-5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            style={{ background: цвет.карточка, borderColor: цвет.рамка }}
          >
            <span
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
              style={{ background: цвет.мягкий }}
            >
              {иконка}
            </span>
            <span
              className="block text-lg font-bold"
              style={{ color: цвет.текст, fontFamily: "var(--font-heading)" }}
            >
              {t(заг)}
            </span>
            <span className="mt-1 block text-sm leading-snug" style={{ color: цвет.тихий }}>
              {t(под)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Переключатель({
  t,
  анкеты,
  выбрана,
  onВыбор,
  onНовая,
}: {
  t: T;
  анкеты: Партнёр[];
  выбрана: string;
  onВыбор: (id: string) => void;
  onНовая?: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {анкеты.map((п) => (
        <button
          key={п.id}
          onClick={() => onВыбор(п.id)}
          className="rounded-full border px-3 py-1.5 text-xs font-bold"
          style={
            п.id === выбрана
              ? { background: цвет.заливка, color: "#fff", borderColor: "transparent" }
              : { background: цвет.карточка, color: цвет.текст, borderColor: цвет.рамка }
          }
        >
          {п.kind === "driver" ? "🚗" : "🧭"} {п.name}
        </button>
      ))}
      {onНовая && (
        <button
          onClick={onНовая}
          className="rounded-full border border-dashed px-3 py-1.5 text-xs font-semibold"
          style={{ borderColor: цвет.рамка, color: цвет.тихий }}
        >
          ＋ {t("add_second")}
        </button>
      )}
    </div>
  );
}

function Вкладки({
  t,
  гид,
  вкладка,
  onВкладка,
  новых,
}: {
  t: T;
  гид: boolean;
  вкладка: Вкладка;
  onВкладка: (в: Вкладка) => void;
  новых: number;
}) {
  const список: [Вкладка, КлючКабинета][] = [
    ["overview", "tab_overview"],
    ["profile", "tab_profile"],
    ...(гид ? ([["tours", "tab_tours"]] as [Вкладка, КлючКабинета][]) : []),
    ["requests", "tab_requests"],
    ["billing", "tab_billing"],
  ];
  return (
    <nav className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 hide-scroll">
      {список.map(([в, к]) => (
        <button
          key={в}
          onClick={() => onВкладка(в)}
          className="relative flex-shrink-0 rounded-xl px-4 py-2 text-sm font-bold"
          style={вкладка === в ? { background: цвет.текст, color: цвет.фон } : { color: цвет.тихий }}
        >
          {t(к)}
          {в === "requests" && новых > 0 && (
            <span
              className="ml-1.5 rounded-full px-1.5 text-[10px]"
              style={{ background: цвет.золото, color: цвет.наЗолоте }}
            >
              {новых}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

const датой = (iso: string, язык: ЯзыкКабинета) =>
  new Date(iso).toLocaleDateString(язык === "uz" ? "uz-Latn" : язык, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const днейДо = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

function Обзор({
  t,
  язык,
  п,
  туров,
  onВкладка,
}: {
  t: T;
  язык: ЯзыкКабинета;
  п: Партнёр;
  туров: number;
  onВкладка: (в: Вкладка) => void;
}) {
  const виден = виденВКаталоге(п);
  const [иконка, заголовок, текст, тон] =
    п.status === "pending"
      ? ["⏳", t("st_pending"), t("st_pending_text"), цвет.золото]
      : п.status === "rejected"
      ? ["✍️", t("st_rejected"), t("st_rejected_text"), цвет.ошибка]
      : п.status === "suspended"
      ? ["⛔", t("st_suspended"), "", цвет.ошибка]
      : виден
      ? ["✅", t("st_active"), "", цвет.акцент]
      : ["💳", t("st_hidden_unpaid"), "", цвет.ошибка];
  return (
    <>
      <Карточка>
        <div className="flex gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: цвет.мягкий }}
          >
            {иконка}
          </span>
          <div className="min-w-0">
            <p className="text-base font-bold" style={{ color: тон }}>
              {заголовок}
            </p>
            {текст && (
              <p className="mt-0.5 text-sm leading-snug" style={{ color: цвет.тихий }}>
                {текст}
              </p>
            )}
            {п.statusNote && (
              <p
                className="mt-2 rounded-xl px-3 py-2 text-sm"
                style={{ background: "rgba(192,57,43,0.08)", color: цвет.текст }}
              >
                <b>{t("st_manager_note")}:</b> {п.statusNote}
              </p>
            )}
            {п.paidUntil && п.status === "active" && (
              <p className="mt-2 text-sm" style={{ color: цвет.текст }}>
                📅 {t("paid_until").replace("{d}", датой(п.paidUntil, язык))}
                {действует(п.paidUntil) && (
                  <span style={{ color: днейДо(п.paidUntil) <= 5 ? цвет.ошибка : цвет.тихий }}>
                    {" "}
                    · {t("days_left").replace("{n}", String(днейДо(п.paidUntil)))}
                  </span>
                )}
              </p>
            )}
            {действует(п.promotedUntil) && (
              <p className="mt-1 text-sm font-semibold" style={{ color: "#b8860b" }}>
                ★ {t("promoted_until").replace("{d}", датой(п.promotedUntil!, язык))}
              </p>
            )}
          </div>
        </div>
        {(!виден && п.status === "active") ||
        (п.paidUntil && днейДо(п.paidUntil) <= 5 && п.status === "active") ? (
          <Кнопка вид="золото" className="mt-3 w-full" onClick={() => onВкладка("billing")}>
            💳 {t("tab_billing")}
          </Кнопка>
        ) : null}
      </Карточка>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          [String(п.views), t("stat_views"), "👁"],
          [String(п.requests), t("stat_requests"), "✉️"],
          ...(п.kind === "guide"
            ? [[String(туров), t("stat_tours"), "🗺️"]]
            : [[`$${п.priceDay}`, t("price_day").replace(", $", ""), "💵"]]),
        ].map(([v, k, e]) => (
          <div
            key={k}
            className="rounded-2xl border p-3 text-center"
            style={{ background: цвет.карточка, borderColor: цвет.рамка }}
          >
            <p className="text-lg">{e}</p>
            <p className="text-lg font-bold" style={{ color: цвет.текст }}>
              {v}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: цвет.тихий }}>
              {k}
            </p>
          </div>
        ))}
      </div>
      {виден && (
        <a
          href={`/?open=${encodeURIComponent(`explore:${п.kind === "driver" ? "drivers" : "guides"}`)}`}
          className="block text-center text-sm font-semibold underline"
          style={{ color: цвет.акцент }}
        >
          {t("open_card")} →
        </a>
      )}
    </>
  );
}

function Заявки({
  t,
  язык,
  заявки,
  onChange,
}: {
  t: T;
  язык: ЯзыкКабинета;
  заявки: Booking[];
  onChange: () => void;
}) {
  const [идёт, setИдёт] = useState<string | null>(null);
  async function ответить(id: string, status: "confirmed" | "cancelled") {
    setИдёт(id);
    await fetch("/api/cabinet/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => undefined);
    setИдёт(null);
    onChange();
  }
  if (!заявки.length)
    return (
      <Карточка>
        <p className="text-sm" style={{ color: цвет.тихий }}>
          {t("req_empty")}
        </p>
      </Карточка>
    );
  const метка = {
    new: ["req_new", цвет.золото],
    confirmed: ["req_confirmed", цвет.акцент],
    cancelled: ["req_cancelled", цвет.тихий],
  } as const;
  return (
    <>
      {[...заявки]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((b) => {
          const [к, тон] = метка[b.status];
          const тел = (b.contactPhone ?? "").replace(/[^\d+]/g, "");
          return (
            <Карточка key={b.id}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-bold" style={{ color: цвет.текст }}>
                  {b.itemName}
                </p>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: тон, color: b.status === "new" ? цвет.наЗолоте : "#fff" }}
                >
                  {t(к)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: цвет.тихий }}>
                <p>
                  📅 {t("req_date")}
                  <br />
                  <b style={{ color: цвет.текст }}>{датой(b.date, язык)}</b>
                </p>
                <p>
                  🗓 {t("req_days")}
                  <br />
                  <b style={{ color: цвет.текст }}>{b.days ?? 1}</b>
                </p>
                <p>
                  👥 {t("req_people")}
                  <br />
                  <b style={{ color: цвет.текст }}>{b.guests}</b>
                </p>
              </div>
              {b.pickup && (
                <p className="mt-2 text-xs" style={{ color: цвет.текст }}>
                  📍 {t("req_pickup")}: {b.pickup}
                </p>
              )}
              {b.note && (
                <p
                  className="mt-2 rounded-xl px-3 py-2 text-sm"
                  style={{ background: цвет.мягкий, color: цвет.текст }}
                >
                  {b.note}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {тел && (
                  <>
                    <a
                      href={`tel:${тел}`}
                      className="rounded-xl px-3 py-2 text-xs font-bold text-white"
                      style={{ background: цвет.заливка }}
                    >
                      📞 {b.contactPhone}
                    </a>
                    <a
                      href={`https://wa.me/${тел.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl px-3 py-2 text-xs font-bold text-white"
                      style={{ background: "#25D366" }}
                    >
                      WhatsApp
                    </a>
                  </>
                )}
                {b.status === "new" && (
                  <>
                    <span className="flex-1" />
                    <Кнопка
                      вид="тихая"
                      disabled={идёт === b.id}
                      onClick={() => ответить(b.id, "cancelled")}
                      className="!py-2 text-xs"
                    >
                      {t("req_decline")}
                    </Кнопка>
                    <Кнопка
                      вид="главная"
                      disabled={идёт === b.id}
                      onClick={() => ответить(b.id, "confirmed")}
                      className="!py-2 text-xs"
                    >
                      ✓ {t("req_confirm")}
                    </Кнопка>
                  </>
                )}
              </div>
            </Карточка>
          );
        })}
    </>
  );
}

function Оплата({
  t,
  язык,
  п,
  тарифы,
  системы,
  заказы,
}: {
  t: T;
  язык: ЯзыкКабинета;
  п: Партнёр;
  тарифы: Тарифы;
  системы: ("payme" | "click")[];
  заказы: Данные["orders"];
}) {
  const [выбрано, setВыбрано] = useState<Покупка>("month1");
  const [идёт, setИдёт] = useState(false);
  const [ошибка, setОшибка] = useState("");
  const ждём = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("paid");
  const сумма = (n: number) => `${n.toLocaleString(язык === "en" ? "en" : "ru")} ${t("sum")}`;
  const месяц = п.kind === "driver" ? тарифы.driverMonth : тарифы.guideMonth;
  const продвигать = п.verified && п.status === "active";

  async function оплатить(система: "payme" | "click") {
    setИдёт(true);
    setОшибка("");
    try {
      const r = await fetch("/api/cabinet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: п.id, item: выбрано, system: система }),
      });
      const d = (await r.json()) as { url?: string };
      if (r.ok && d.url) window.location.href = d.url;
      else setОшибка(t("e_generic"));
    } catch {
      setОшибка(t("e_generic"));
    } finally {
      setИдёт(false);
    }
  }

  const План = ({ к }: { к: Покупка }) => {
    const ц = ценаПокупки(к, п.kind, тарифы);
    const выгода = ц.продвижение ? 0 : Math.round((1 - ц.сумма / (месяц * (ц.дней / 30))) * 100);
    const активен = выбрано === к;
    const нельзя = ц.продвижение && !продвигать;
    return (
      <button
        type="button"
        disabled={нельзя}
        onClick={() => setВыбрано(к)}
        className="relative rounded-2xl border-2 p-3 text-left transition-colors disabled:opacity-40"
        style={{
          borderColor: активен ? (ц.продвижение ? цвет.золото : цвет.заливка) : цвет.рамка,
          background: цвет.карточка,
        }}
      >
        {выгода > 0 && (
          <span
            className="absolute -top-2 right-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
            style={{ background: цвет.золото, color: цвет.наЗолоте }}
          >
            {t("plan_save").replace("{p}", String(выгода))}
          </span>
        )}
        <p className="text-xs font-semibold" style={{ color: цвет.тихий }}>
          {t(`plan_${к}` as КлючКабинета)}
        </p>
        <p className="text-base font-bold" style={{ color: цвет.текст }}>
          {сумма(ц.сумма)}
        </p>
      </button>
    );
  };

  return (
    <>
      {ждём && (
        <Карточка>
          <p className="text-sm" style={{ color: цвет.акцент }}>
            ⏳ {t("pay_wait")}
          </p>
        </Карточка>
      )}
      <Карточка>
        <Заголовок>📋 {t("bill_title")}</Заголовок>
        <p className="mb-3 text-sm leading-snug" style={{ color: цвет.тихий }}>
          {t("bill_text")} {месяц.toLocaleString("ru")} {t("per_month")}.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ПОКУПКИ
            .filter((к) => к.startsWith("month"))
            .map((к) => (
              <План key={к} к={к} />
            ))}
        </div>
      </Карточка>
      <Карточка>
        <Заголовок>★ {t("promo_title")}</Заголовок>
        <p className="mb-3 text-sm leading-snug" style={{ color: цвет.тихий }}>
          {t("promo_text")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ПОКУПКИ
            .filter((к) => к.startsWith("promo"))
            .map((к) => (
              <План key={к} к={к} />
            ))}
        </div>
      </Карточка>
      <Карточка>
        {системы.length ? (
          <>
            <p className="mb-2 text-xs font-semibold" style={{ color: цвет.тихий }}>
              {t("pay_with")}
            </p>
            <div className="flex gap-2">
              {системы.map((с) => (
                <Кнопка
                  key={с}
                  disabled={идёт}
                  onClick={() => оплатить(с)}
                  className="flex-1"
                  style={{ background: с === "payme" ? "#33CCCC" : "#0063F7", color: "#fff" }}
                >
                  {с === "payme" ? "Payme" : "Click"}
                </Кнопка>
              ))}
            </div>
            {ошибка && (
              <p className="mt-2 text-xs" style={{ color: цвет.ошибка }}>
                {ошибка}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: цвет.тихий }}>
            ℹ️ {t("pay_off")}
          </p>
        )}
      </Карточка>
      {заказы.length > 0 && (
        <Карточка>
          <Заголовок>{t("history")}</Заголовок>
          <ul className="divide-y" style={{ borderColor: цвет.рамка }}>
            {заказы.map((з) => (
              <li key={з.id} className="flex items-center justify-between py-2 text-sm">
                <span style={{ color: цвет.текст }}>
                  {t(`plan_${з.покупка}` as КлючКабинета)} · {датой(з.createdAt, язык)}
                </span>
                <span
                  className="text-xs"
                  style={{ color: з.статус === "оплачен" ? цвет.акцент : цвет.тихий }}
                >
                  {сумма(з.сумма)} ·{" "}
                  {t(
                    з.статус === "оплачен"
                      ? "ord_paid"
                      : з.статус === "отменён"
                      ? "ord_cancelled"
                      : "ord_waiting",
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Карточка>
      )}
    </>
  );
}
