import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, Badge, Btn, Card, StatCard } from "./shared";
import { useМеня } from "../context/MeContext";
import {
  действует,
  виденВКаталоге,
  КЛАССЫ_МАШИН,
  type Партнёр,
  type ТурПартнёра,
  type Тарифы,
  type КлассМашины,
} from "@/lib/provider-rules";
import type { Booking } from "@/lib/community";

/**
 * Водители и гиды в панели — для менеджера партнёров и владельца.
 *
 * Анкеты приходят из кабинета (/cabinet) со статусом «на проверке».
 * Менеджер смотрит документы, звонит, одобряет — анкета получает
 * «Проверен» и пробный период, а после оплаты остаётся в каталоге.
 * Здесь же: продление вручную (наличные), «Рекомендуем», заметки, тарифы.
 */

type Данные = {
  providers: Партнёр[];
  tours: ТурПартнёра[];
  orders: {
    id: string;
    providerId: string;
    providerName: string;
    покупка: string;
    дней: number;
    продвижение: boolean;
    сумма: number;
    статус: string;
    createdAt: string;
    оплачен?: { система: string; когда: string };
  }[];
  bookings: Booking[];
  tariffs: Тарифы;
  emails: Record<string, string>;
};

type Фильтр = "pending" | "live" | "unpaid" | "promoted" | "blocked" | "all";

const КЛАСС: Record<КлассМашины, string> = {
  economy: "Эконом",
  comfort: "Комфорт",
  business: "Бизнес",
  minivan: "Минивэн",
  bus: "Микроавтобус",
};

const дата = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" }) : "—";
const сумма = (n: number) => `${n.toLocaleString("ru")} сум`;

async function действие(тело: Record<string, unknown>, метод: "PATCH" | "POST" | "DELETE" = "PATCH") {
  const r = await fetch("/api/admin/providers", {
    method: метод,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(тело),
  });
  const d = (await r.json().catch(() => ({}))) as { error?: string };
  if (!r.ok) throw new Error(d.error ?? "error");
  return d;
}

function статусМетка(п: Партнёр): { label: string; color: "amber" | "teal" | "rose" | "dim" } {
  if (п.status === "pending") return { label: "на проверке", color: "amber" };
  if (п.status === "rejected") return { label: "на доработке", color: "rose" };
  if (п.status === "suspended") return { label: "приостановлен", color: "rose" };
  if (виденВКаталоге(п)) return { label: "в каталоге", color: "teal" };
  return { label: "не оплачен", color: "dim" };
}

export default function Partners({ вид }: { вид: "driver" | "guide" | "pay" }) {
  const [данные, setДанные] = useState<Данные | null>(null);
  const [ошибка, setОшибка] = useState("");
  const загрузить = useCallback(async () => {
    const r = await fetch("/api/admin/providers", { cache: "no-store" });
    if (!r.ok) return setОшибка(r.status === 403 ? "Нет доступа к партнёрам" : "Не удалось загрузить");
    setДанные(await r.json());
  }, []);
  useEffect(() => {
    void загрузить();
  }, [загрузить]);

  if (ошибка)
    return (
      <div className="p-7 text-sm" style={{ color: "var(--color-rose)" }}>
        {ошибка}
      </div>
    );
  if (!данные)
    return (
      <div className="p-7 text-sm" style={{ color: "var(--color-muted)" }}>
        Загружаем…
      </div>
    );
  if (вид === "pay") return <Оплаты данные={данные} обновить={загрузить} />;
  return <СписокПартнёров вид={вид} данные={данные} обновить={загрузить} />;
}

function СписокПартнёров({
  вид,
  данные,
  обновить,
}: {
  вид: "driver" | "guide";
  данные: Данные;
  обновить: () => Promise<void>;
}) {
  const свои = данные.providers.filter((п) => п.kind === вид);
  const ждут = свои.filter((п) => п.status === "pending").length;
  const [фильтр, setФильтр] = useState<Фильтр>(ждут ? "pending" : "all");
  const [поиск, setПоиск] = useState("");
  const [открыт, setОткрыт] = useState<string | null>(null);
  const [новый, setНовый] = useState(false);

  const подходит = (п: Партнёр) => {
    switch (фильтр) {
      case "pending":
        return п.status === "pending";
      case "live":
        return виденВКаталоге(п);
      case "unpaid":
        return п.status === "active" && !виденВКаталоге(п);
      case "promoted":
        return действует(п.promotedUntil);
      case "blocked":
        return п.status === "rejected" || п.status === "suspended";
      default:
        return true;
    }
  };
  const н = поиск.trim().toLowerCase();
  const список = свои
    .filter(подходит)
    .filter(
      (п) =>
        !н ||
        `${п.name} ${п.phone} ${п.city} ${п.car?.plate ?? ""} ${данные.emails[п.userId ?? ""] ?? ""}`
          .toLowerCase()
          .includes(н),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const выбранный = свои.find((п) => п.id === открыт) ?? null;

  const фильтры: [Фильтр, string, number][] = [
    ["pending", "На проверке", ждут],
    ["live", "В каталоге", свои.filter((п) => виденВКаталоге(п)).length],
    ["unpaid", "Не оплачены", свои.filter((п) => п.status === "active" && !виденВКаталоге(п)).length],
    ["promoted", "Рекомендуем", свои.filter((п) => действует(п.promotedUntil)).length],
    [
      "blocked",
      "Отклонены / стоп",
      свои.filter((п) => п.status === "rejected" || п.status === "suspended").length,
    ],
    ["all", "Все", свои.length],
  ];

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title={вид === "driver" ? "Водители" : "Гиды и туры"}
        subtitle={
          вид === "driver"
            ? "Машина с водителем: проверка анкет, размещение, «Рекомендуем»"
            : "Гиды и их авторские туры: проверка, размещение, «Рекомендуем»"
        }
        action={
          <Btn onClick={() => setНовый(true)}>
            + {вид === "driver" ? "Добавить водителя" : "Добавить гида"}
          </Btn>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ЖДУТ ПРОВЕРКИ" value={String(ждут)} />
        <StatCard label="В КАТАЛОГЕ" value={String(фильтры[1][2])} />
        <StatCard label="РЕКОМЕНДУЕМ" value={String(фильтры[3][2])} />
        <StatCard
          label="ЗАЯВОК ТУРИСТОВ"
          value={String(данные.bookings.filter((b) => свои.some((п) => п.id === b.providerId)).length)}
        />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {фильтры.map(([ф, подпись, n]) => (
          <button
            key={ф}
            onClick={() => setФильтр(ф)}
            className="cursor-pointer rounded px-3 py-1.5 text-xs font-medium"
            style={{
              background: фильтр === ф ? "var(--color-amber)" : "var(--color-panel)",
              color: фильтр === ф ? "var(--color-on-accent)" : "var(--color-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            {подпись} · {n}
          </button>
        ))}
        <span className="flex-1" />
        <input
          value={поиск}
          onChange={(e) => setПоиск(e.target.value)}
          placeholder="Имя, телефон, госномер, почта"
          className="w-full rounded px-3 py-1.5 text-sm outline-none sm:w-64"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </div>

      {!список.length && (
        <Card className="p-6 text-sm" style={{ color: "var(--color-muted)" }}>
          {фильтр === "pending" ? "Новых анкет нет." : "Ничего не найдено."}
        </Card>
      )}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))" }}
      >
        {список.map((п) => {
          const м = статусМетка(п);
          return (
            <button key={п.id} onClick={() => setОткрыт(п.id)} className="cursor-pointer text-left">
              <Card className="p-4 transition-colors hover:border-[var(--color-amber)]">
                <div className="flex gap-3">
                  <div
                    className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full"
                    style={{ background: "var(--color-dim)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {п.photo ? <img src={п.photo} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate font-semibold" style={{ color: "var(--color-text)" }}>
                        {п.name}
                      </span>
                      <Badge label={м.label} color={м.color} />
                      {действует(п.promotedUntil) && <Badge label="★ рекомендуем" color="amber" />}
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                      {п.city} · {п.phone} · ${п.priceDay}/день
                    </p>
                    {п.car && (
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        🚗 {п.car.make} {п.car.model} {п.car.year} · {КЛАСС[п.car.class]} · {п.car.seats} мест
                        {п.car.plate ? ` · ${п.car.plate}` : ""}
                      </p>
                    )}
                    {вид === "guide" && (
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        🗺️ туров: {данные.tours.filter((т) => т.providerId === п.id).length}
                      </p>
                    )}
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: "var(--color-faint)", fontFamily: "var(--font-mono)" }}
                    >
                      оплачено до {дата(п.paidUntil)} · 👁 {п.views} · ✉ {п.requests}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {выбранный && (
        <Анкета
          п={выбранный}
          почта={данные.emails[выбранный.userId ?? ""] ?? ""}
          туры={данные.tours.filter((т) => т.providerId === выбранный.id)}
          заявки={данные.bookings.filter((b) => b.providerId === выбранный.id)}
          onClose={() => setОткрыт(null)}
          обновить={обновить}
        />
      )}
      {новый && <НовыйПартнёр вид={вид} onClose={() => setНовый(false)} обновить={обновить} />}
    </div>
  );
}

function Окно({
  children,
  onClose,
  ширина = "max-w-2xl",
}: {
  children: React.ReactNode;
  onClose: () => void;
  ширина?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className={`h-full w-full ${ширина} overflow-y-auto p-5 sm:p-7`}
        style={{ background: "var(--color-panel)", borderLeft: "1px solid var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const поле = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
};

function Строка({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 text-sm" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <span className="w-36 flex-shrink-0" style={{ color: "var(--color-muted)" }}>
        {k}
      </span>
      <span className="min-w-0 break-words" style={{ color: "var(--color-text)" }}>
        {v}
      </span>
    </div>
  );
}

function Анкета({
  п,
  почта,
  туры,
  заявки,
  onClose,
  обновить,
}: {
  п: Партнёр;
  почта: string;
  туры: ТурПартнёра[];
  заявки: Booking[];
  onClose: () => void;
  обновить: () => Promise<void>;
}) {
  const [заметка, setЗаметка] = useState(п.adminNote ?? "");
  const [причина, setПричина] = useState("");
  const [приоритет, setПриоритет] = useState(String(п.promoPriority || 1));
  const [почтаНовая, setПочтаНовая] = useState(почта);
  const [идёт, setИдёт] = useState(false);
  const [сообщение, setСообщение] = useState("");
  const м = статусМетка(п);

  async function сделать(тело: Record<string, unknown>, метод: "PATCH" | "DELETE" = "PATCH") {
    setИдёт(true);
    setСообщение("");
    try {
      await действие({ id: п.id, ...тело }, метод);
      await обновить();
      setСообщение("Готово");
      if (метод === "DELETE") onClose();
    } catch (e) {
      setСообщение(
        e instanceof Error && e.message === "user_not_found"
          ? "Аккаунт с такой почтой не найден"
          : "Не получилось",
      );
    } finally {
      setИдёт(false);
    }
  }

  return (
    <Окно onClose={onClose}>
      <div className="mb-5 flex items-start gap-4">
        <div
          className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full"
          style={{ background: "var(--color-dim)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {п.photo ? <img src={п.photo} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {п.name}
          </h2>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge label={п.kind === "driver" ? "водитель" : "гид"} color="dim" />
            <Badge label={м.label} color={м.color} />
            {п.verified && <Badge label="✓ проверен" color="teal" />}
            {действует(п.promotedUntil) && <Badge label={`★ до ${дата(п.promotedUntil)}`} color="amber" />}
          </div>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer text-2xl opacity-60 hover:opacity-100"
          style={{ color: "var(--color-text)" }}
        >
          ×
        </button>
      </div>

      {/* Решение по анкете */}
      <Card className="mb-4 p-4">
        <p
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          Решение
        </p>
        <div className="mb-2 flex flex-wrap gap-2">
          {п.status !== "active" || !п.verified ? (
            <Btn onClick={() => сделать({ action: "approve" })}>✓ Одобрить и опубликовать</Btn>
          ) : (
            <Btn variant="ghost" onClick={() => сделать({ action: "suspend", note: причина })}>
              ⏸ Приостановить
            </Btn>
          )}
          {п.status === "suspended" && (
            <Btn variant="ghost" onClick={() => сделать({ action: "activate" })}>
              ▶ Вернуть
            </Btn>
          )}
          {п.status !== "rejected" && (
            <Btn variant="danger" onClick={() => сделать({ action: "reject", note: причина })}>
              ↩ Вернуть на доработку
            </Btn>
          )}
        </div>
        <input
          value={причина}
          onChange={(e) => setПричина(e.target.value)}
          placeholder="Причина для партнёра (увидит в кабинете): например, «загрузите фото салона»"
          className="w-full rounded px-3 py-2 text-sm outline-none"
          style={поле}
        />
        {п.statusNote && (
          <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
            Сейчас партнёр видит: «{п.statusNote}»
          </p>
        )}
      </Card>

      {/* Размещение и продвижение */}
      <Card className="mb-4 p-4">
        <p
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          Размещение и «Рекомендуем»
        </p>
        <p className="mb-2 text-sm" style={{ color: "var(--color-text)" }}>
          Оплачено до: <b>{дата(п.paidUntil)}</b>
          {!действует(п.paidUntil) && (
            <span style={{ color: "var(--color-rose)" }}>
              {" "}
              — {п.paidUntil ? "истекло" : "не оплачено"}, в каталоге не видна
            </span>
          )}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {[30, 90, 180].map((д) => (
            <Btn key={д} small variant="ghost" onClick={() => сделать({ action: "extend", days: д })}>
              +{д} дней
            </Btn>
          ))}
          <Btn small variant="danger" onClick={() => сделать({ action: "setPaidUntil", date: "" })}>
            Снять оплату
          </Btn>
        </div>
        <p className="mb-2 text-sm" style={{ color: "var(--color-text)" }}>
          «Рекомендуем» до: <b>{дата(п.promotedUntil)}</b>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>
            приоритет
            <input
              type="number"
              min={0}
              max={100}
              value={приоритет}
              onChange={(e) => setПриоритет(e.target.value)}
              className="ml-1 w-16 rounded px-2 py-1 text-sm"
              style={поле}
            />
          </label>
          {[7, 30].map((д) => (
            <Btn
              key={д}
              small
              onClick={() => сделать({ action: "promote", days: д, priority: Number(приоритет) })}
            >
              ★ +{д} дней
            </Btn>
          ))}
          {действует(п.promotedUntil) && (
            <Btn small variant="ghost" onClick={() => сделать({ action: "unpromote" })}>
              Снять
            </Btn>
          )}
        </div>
      </Card>

      {сообщение && (
        <p
          className="mb-3 text-sm"
          style={{ color: сообщение === "Готово" ? "var(--color-teal)" : "var(--color-rose)" }}
        >
          {идёт ? "…" : сообщение}
        </p>
      )}

      {/* Анкета целиком */}
      <Card className="mb-4 p-4">
        <Строка
          k="Телефон"
          v={
            <a href={`tel:${п.phone}`} style={{ color: "var(--color-amber)" }}>
              {п.phone}
            </a>
          }
        />
        {п.telegram && <Строка k="Telegram" v={п.telegram} />}
        {п.whatsapp && <Строка k="WhatsApp" v={п.whatsapp} />}
        <Строка k="Аккаунт" v={почта || "не привязан"} />
        <Строка k="Город" v={[п.city, ...п.cities].join(", ")} />
        <Строка k="Языки" v={п.languages.join(", ")} />
        <Строка k="Опыт" v={`${п.experienceYears} лет`} />
        <Строка
          k="Цена"
          v={`$${п.priceDay}/день${п.priceHour ? ` · $${п.priceHour}/час` : ""} · ${п.hoursPerDay} ч`}
        />
        {п.includes.length > 0 && <Строка k="Входит" v={п.includes.join(", ")} />}
        {п.car && (
          <Строка
            k="Машина"
            v={`${п.car.make} ${п.car.model} ${п.car.year}, ${п.car.color || "—"}, ${КЛАСС[п.car.class]}, ${
              п.car.seats
            } мест${п.car.ac ? ", кондиционер" : ""}, госномер ${п.car.plate || "не указан"}`}
          />
        )}
        {п.specialties && п.specialties.length > 0 && <Строка k="Темы" v={п.specialties.join(", ")} />}
        {п.kind === "guide" && <Строка k="Лицензия" v={п.licensed ? "есть (сверить документ)" : "нет"} />}
        <Строка k="О себе" v={<span className="whitespace-pre-line">{п.bio || "—"}</span>} />
        <Строка k="Подана" v={дата(п.createdAt)} />
        <Строка k="Статистика" v={`просмотры ${п.views} · заявки ${п.requests}`} />
      </Card>

      {п.photos.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {п.photos.map((ф) => (
            <a key={ф} href={ф} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ф} alt="" className="aspect-[4/3] w-full rounded object-cover" />
            </a>
          ))}
        </div>
      )}

      {туры.length > 0 && (
        <Card className="mb-4 p-4">
          <p
            className="mb-2 text-xs font-semibold uppercase"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
          >
            Туры ({туры.length})
          </p>
          {туры.map((т) => (
            <Строка
              key={т.id}
              k={`${т.days} дн. · $${т.pricePerPerson}`}
              v={
                <>
                  {т.title} {т.status === "hidden" && <Badge label="скрыт" color="dim" />}
                  <br />
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {т.program.map((д, i) => `${i + 1}. ${д.title}`).join(" · ")}
                  </span>
                </>
              }
            />
          ))}
        </Card>
      )}

      {заявки.length > 0 && (
        <Card className="mb-4 p-4">
          <p
            className="mb-2 text-xs font-semibold uppercase"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
          >
            Заявки туристов ({заявки.length})
          </p>
          {заявки.slice(0, 20).map((b) => (
            <Строка
              key={b.id}
              k={дата(b.date)}
              v={`${b.itemName} · ${b.days ?? 1} дн. · ${b.guests} чел. · ${b.contactPhone ?? ""} · ${
                b.status
              }`}
            />
          ))}
        </Card>
      )}

      <Card className="mb-4 p-4">
        <p
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          Заметка менеджера (партнёр не видит)
        </p>
        <textarea
          value={заметка}
          onChange={(e) => setЗаметка(e.target.value)}
          rows={3}
          className="mb-2 w-full rounded px-3 py-2 text-sm outline-none"
          style={поле}
        />
        <Btn small variant="ghost" onClick={() => сделать({ action: "note", note: заметка })}>
          Сохранить заметку
        </Btn>
      </Card>

      <Card className="mb-4 p-4">
        <p
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          Привязать к аккаунту HelloUZ
        </p>
        <div className="flex gap-2">
          <input
            value={почтаНовая}
            onChange={(e) => setПочтаНовая(e.target.value)}
            placeholder="почта аккаунта"
            className="flex-1 rounded px-3 py-2 text-sm outline-none"
            style={поле}
          />
          <Btn small variant="ghost" onClick={() => сделать({ action: "link", email: почтаНовая })}>
            Привязать
          </Btn>
        </div>
      </Card>

      <Btn
        variant="danger"
        onClick={() => {
          if (confirm(`Удалить анкету «${п.name}» вместе с турами? Это нельзя отменить.`))
            void сделать({}, "DELETE");
        }}
      >
        Удалить анкету
      </Btn>
    </Окно>
  );
}

function НовыйПартнёр({
  вид,
  onClose,
  обновить,
}: {
  вид: "driver" | "guide";
  onClose: () => void;
  обновить: () => Promise<void>;
}) {
  const [ф, setФ] = useState({
    name: "",
    phone: "+998 ",
    city: "Самарканд",
    languages: "uz, ru",
    priceDay: "",
    email: "",
    make: "",
    model: "",
    year: "",
    seats: "4",
    class: "comfort" as КлассМашины,
    plate: "",
    approve: true,
  });
  const [ошибка, setОшибка] = useState("");
  const к = (поле: keyof typeof ф) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setФ({ ...ф, [поле]: e.target.value });

  async function создать(e: React.FormEvent) {
    e.preventDefault();
    setОшибка("");
    try {
      await действие(
        {
          kind: вид,
          name: ф.name,
          phone: ф.phone,
          city: ф.city,
          languages: ф.languages
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          priceDay: Number(ф.priceDay),
          email: ф.email || undefined,
          approve: ф.approve,
          car:
            вид === "driver"
              ? {
                  make: ф.make,
                  model: ф.model,
                  year: Number(ф.year),
                  seats: Number(ф.seats),
                  class: ф.class,
                  plate: ф.plate,
                  ac: true,
                }
              : undefined,
        },
        "POST",
      );
      await обновить();
      onClose();
    } catch (e) {
      const коды: Record<string, string> = {
        user_not_found:
          "Аккаунт с такой почтой не найден — оставьте поле пустым или попросите зарегистрироваться",
        phone_invalid: "Проверьте телефон",
        price_invalid: "Цена за день — от 5 до 5000 $",
        car_required: "Укажите марку и модель",
        car_invalid: "Проверьте год и число мест",
        languages_required: "Укажите языки через запятую: uz, ru, en",
      };
      setОшибка(коды[(e as Error).message] ?? "Не получилось");
    }
  }

  const ввод = "w-full rounded px-3 py-2 text-sm outline-none";
  const подпись = "mb-1 block text-xs";
  return (
    <Окно onClose={onClose} ширина="max-w-lg">
      <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-text)" }}>
        {вид === "driver" ? "Новый водитель" : "Новый гид"}
      </h2>
      <form onSubmit={создать} className="grid grid-cols-2 gap-3">
        {(
          [
            ["name", "Имя и фамилия", "col-span-2"],
            ["phone", "Телефон", ""],
            ["city", "Город", ""],
            ["languages", "Языки (uz, ru, en…)", ""],
            ["priceDay", "Цена за день, $", ""],
            ["email", "Почта аккаунта (необязательно)", "col-span-2"],
          ] as const
        ).map(([поле, текст, cls]) => (
          <label key={поле} className={cls}>
            <span className={подпись} style={{ color: "var(--color-muted)" }}>
              {текст}
            </span>
            <input value={ф[поле] as string} onChange={к(поле)} className={ввод} style={поле_стиль} />
          </label>
        ))}
        {вид === "driver" && (
          <>
            {(
              [
                ["make", "Марка"],
                ["model", "Модель"],
                ["year", "Год"],
                ["seats", "Мест"],
                ["plate", "Госномер"],
              ] as const
            ).map(([поле, текст]) => (
              <label key={поле}>
                <span className={подпись} style={{ color: "var(--color-muted)" }}>
                  {текст}
                </span>
                <input value={ф[поле]} onChange={к(поле)} className={ввод} style={поле_стиль} />
              </label>
            ))}
            <label>
              <span className={подпись} style={{ color: "var(--color-muted)" }}>
                Класс
              </span>
              <select value={ф.class} onChange={к("class")} className={ввод} style={поле_стиль}>
                {КЛАССЫ_МАШИН.map((к) => (
                  <option key={к} value={к}>
                    {КЛАСС[к]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <label className="col-span-2 flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
          <input
            type="checkbox"
            checked={ф.approve}
            onChange={(e) => setФ({ ...ф, approve: e.target.checked })}
          />
          Документы проверены — сразу одобрить (пробный период)
        </label>
        {ошибка && (
          <p className="col-span-2 text-sm" style={{ color: "var(--color-rose)" }}>
            {ошибка}
          </p>
        )}
        <div className="col-span-2 flex gap-2">
          <Btn type="submit">Создать</Btn>
          <Btn variant="ghost" onClick={onClose}>
            Отмена
          </Btn>
        </div>
        <p className="col-span-2 text-xs" style={{ color: "var(--color-muted)" }}>
          Фото, описание и туры партнёр добавит сам в кабинете /cabinet, войдя в аккаунт с этой почтой.
        </p>
      </form>
    </Окно>
  );
}

const поле_стиль = поле;

function Оплаты({ данные, обновить }: { данные: Данные; обновить: () => Promise<void> }) {
  const я = useМеня();
  const владелец = я?.role === "owner";
  const [т, setТ] = useState<Тарифы>(данные.tariffs);
  const [сообщение, setСообщение] = useState("");
  const [поиск, setПоиск] = useState("");
  const заказы = useMemo(
    () => данные.orders.filter((з) => !поиск || з.providerName.toLowerCase().includes(поиск.toLowerCase())),
    [данные.orders, поиск],
  );
  const оплачено = данные.orders.filter((з) => з.статус === "оплачен");
  const месяц = оплачено.filter(
    (з) => з.оплачен && Date.now() - new Date(з.оплачен.когда).getTime() < 30 * 86_400_000,
  );

  async function сохранитьТарифы() {
    setСообщение("");
    try {
      await действие({ action: "tariffs", tariffs: т });
      await обновить();
      setСообщение("Тарифы сохранены");
    } catch {
      setСообщение("Не получилось сохранить");
    }
  }

  const ПОЛЯ: [keyof Тарифы, string][] = [
    ["driverMonth", "Водитель — месяц, сум"],
    ["guideMonth", "Гид — месяц, сум"],
    ["promoWeek", "«Рекомендуем» — неделя, сум"],
    ["promoMonth", "«Рекомендуем» — месяц, сум"],
    ["trialDays", "Бесплатных дней после одобрения"],
  ];

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Оплаты и тарифы"
        subtitle="Подписки водителей и гидов: Payme, Click и ручные отметки"
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ОПЛАЧЕНО ЗА 30 ДНЕЙ" value={сумма(месяц.reduce((s, з) => s + з.сумма, 0))} />
        <StatCard label="ПЛАТЕЖЕЙ ЗА 30 ДНЕЙ" value={String(месяц.length)} />
        <StatCard
          label="ЖДУТ ОПЛАТЫ"
          value={String(данные.orders.filter((з) => з.статус === "ждёт_оплаты").length)}
        />
        <StatCard label="ВСЕГО ОПЛАЧЕНО" value={сумма(оплачено.reduce((s, з) => s + з.сумма, 0))} />
      </div>

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Тарифы {владелец ? "" : "(меняет только владелец)"}
        </p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ПОЛЯ.map(([к, подпись]) => (
            <label key={к} className="text-xs" style={{ color: "var(--color-muted)" }}>
              {подпись}
              <input
                type="number"
                disabled={!владелец}
                value={т[к]}
                onChange={(e) => setТ({ ...т, [к]: Number(e.target.value) })}
                className="mt-1 w-full rounded px-3 py-2 text-sm outline-none disabled:opacity-60"
                style={поле}
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
          3 месяца — скидка 10 %, 6 месяцев — 20 % (считается автоматически).
        </p>
        {владелец && (
          <div className="mt-3 flex items-center gap-3">
            <Btn onClick={сохранитьТарифы}>Сохранить тарифы</Btn>
            {сообщение && (
              <span className="text-sm" style={{ color: "var(--color-teal)" }}>
                {сообщение}
              </span>
            )}
          </div>
        )}
      </Card>

      <div className="mb-3 flex items-center gap-2">
        <p className="flex-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Заказы
        </p>
        <input
          value={поиск}
          onChange={(e) => setПоиск(e.target.value)}
          placeholder="Поиск по имени"
          className="w-48 rounded px-3 py-1.5 text-sm outline-none"
          style={поле}
        />
      </div>
      {!заказы.length && (
        <Card className="p-6 text-sm" style={{ color: "var(--color-muted)" }}>
          Заказов пока нет.
        </Card>
      )}
      <div className="grid gap-2">
        {заказы.map((з) => (
          <Card key={з.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <span className="min-w-0 flex-1" style={{ color: "var(--color-text)" }}>
              <b>{з.providerName}</b> · {з.продвижение ? "★ Рекомендуем" : "Размещение"} {з.дней} дн.
              <br />
              <span
                className="text-xs"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                {з.id} · {дата(з.createdAt)}
                {з.оплачен && ` · ${з.оплачен.система}`}
              </span>
            </span>
            <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
              {сумма(з.сумма)}
            </span>
            <Badge
              label={з.статус.replace("_", " ")}
              color={з.статус === "оплачен" ? "teal" : з.статус === "отменён" ? "rose" : "amber"}
            />
            {з.статус === "ждёт_оплаты" && (
              <Btn
                small
                variant="ghost"
                onClick={async () => {
                  if (
                    !confirm(
                      `Отметить оплату ${сумма(з.сумма)} от «${
                        з.providerName
                      }» вручную? Срок продлится сразу.`,
                    )
                  )
                    return;
                  await действие({ action: "markPaid", id: з.id });
                  await обновить();
                }}
              >
                Отметить оплату
              </Btn>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
