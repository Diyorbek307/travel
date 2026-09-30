"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Btn, Card, PageHeader, SectionTitle, StatCard } from "./shared";
import VenueExtras, { type Подробности } from "./VenueExtras";

/**
 * Кабинет заведения — то, что видит сам отель или ресторан.
 *
 * Раньше всё о заведении правил только редактор платформы: новое меню
 * или часы работы шли к нему письмом. Теперь заведение само держит свою
 * карточку в порядке, подтверждает брони и отвечает туристам на отзывы.
 * Чужого оно не видит: сервер отдаёт только его запись (lib/venue-access).
 */

type Вид = "hotel" | "restaurant";

interface Бронь {
  id: string;
  date: string;
  guests: number;
  nights?: number;
  time?: string;
  roomCategory?: string;
  note: string;
  status: "new" | "confirmed" | "cancelled";
  createdAt: string;
  гость: string;
  email: string;
  телефон: string;
}

interface Отзыв {
  id: string;
  userName?: string;
  rating: number;
  text: string;
  createdAt: string;
  reply?: { text: string; at: string };
}

type Запись = Подробности & {
  id: string;
  name: string;
  city: string;
  desc?: string;
  phone?: string;
  open?: string;
  cuisine?: string;
  price?: string;
  tag?: string;
  kind?: string;
};

interface Ответ {
  вид: Вид;
  запись: Запись;
  брони: Бронь[];
  отзывы: Отзыв[];
}

const поле: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
};
const подпись: React.CSSProperties = { color: "var(--color-muted)", fontFamily: "var(--font-mono)" };

const СТАТУС: Record<Бронь["status"], { текст: string; цвет: "amber" | "teal" | "rose" }> = {
  new: { текст: "Новая", цвет: "amber" },
  confirmed: { текст: "Подтверждена", цвет: "teal" },
  cancelled: { текст: "Отклонена", цвет: "rose" },
};

const дата = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

export default function MyVenue() {
  const [данные, setДанные] = useState<Ответ | null>(null);
  const [ошибка, setОшибка] = useState("");
  const [сообщение, setСообщение] = useState("");
  const [вкладка, setВкладка] = useState<"card" | "bookings" | "reviews">("card");
  const [подробно, setПодробно] = useState(false);

  const загрузить = useCallback(async () => {
    try {
      const r = await fetch("/api/venue", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setДанные(await r.json());
      setОшибка("");
    } catch {
      setОшибка("Не удалось открыть кабинет. Обновите страницу или обратитесь к администратору HelloUZ.");
    }
  }, []);
  useEffect(() => {
    void загрузить();
  }, [загрузить]);

  const сохранить = async (правки: Record<string, unknown>) => {
    setСообщение("");
    const r = await fetch("/api/venue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(правки),
    });
    if (!r.ok) {
      setОшибка("Не сохранилось. Попробуйте ещё раз.");
      return;
    }
    setСообщение("Сохранено — туристы уже видят изменения.");
    await загрузить();
  };

  if (ошибка && !данные)
    return (
      <div className="p-4 sm:p-7">
        <p style={{ color: "var(--color-rose)" }}>{ошибка}</p>
      </div>
    );
  if (!данные)
    return (
      <div className="p-4 sm:p-7" style={{ color: "var(--color-muted)" }}>
        Загрузка…
      </div>
    );

  const { вид, запись, брони, отзывы } = данные;
  const новые = брони.filter((б) => б.status === "new").length;
  const безОтвета = отзывы.filter((о) => !о.reply).length;
  const средняя = отзывы.length ? (отзывы.reduce((s, о) => s + о.rating, 0) / отзывы.length).toFixed(1) : "—";

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title={запись.name}
        subtitle={`${вид === "hotel" ? "Гостиница" : "Ресторан"} · ${запись.city}`}
        action={
          <a
            href={`/${вид}/${encodeURIComponent(запись.id)}?lang=ru`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded px-4 py-2 text-sm font-medium"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Как видят туристы ↗
          </a>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Новые брони" value={String(новые)} />
        <StatCard label="Всего броней" value={String(брони.length)} />
        <StatCard
          label="Отзывы"
          value={String(отзывы.length)}
          sub={безОтвета ? `${безОтвета} без ответа` : undefined}
        />
        <StatCard label="Средняя оценка" value={средняя} />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["card", "Карточка"],
            ["bookings", `Брони${новые ? ` (${новые})` : ""}`],
            ["reviews", `Отзывы${безОтвета ? ` (${безОтвета})` : ""}`],
          ] as const
        ).map(([к, текст]) => (
          <button
            key={к}
            onClick={() => setВкладка(к)}
            className="rounded px-4 py-2 text-sm font-medium"
            style={
              вкладка === к
                ? { background: "var(--color-amber)", color: "var(--color-on-accent)" }
                : { border: "1px solid var(--color-border)", color: "var(--color-muted)" }
            }
          >
            {текст}
          </button>
        ))}
      </div>

      {сообщение && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-teal)" }}>
          {сообщение}
        </p>
      )}
      {ошибка && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-rose)" }}>
          {ошибка}
        </p>
      )}

      {вкладка === "card" && (
        <Карточка
          key={JSON.stringify(запись).length}
          вид={вид}
          запись={запись}
          onSave={сохранить}
          onПодробно={() => setПодробно(true)}
        />
      )}
      {вкладка === "bookings" && <Брони брони={брони} onDone={загрузить} />}
      {вкладка === "reviews" && <Отзывы отзывы={отзывы} onDone={загрузить} />}

      {подробно && (
        <VenueExtras
          кабинет
          вид={вид}
          запись={запись}
          onSave={(изменения) => void сохранить(изменения as Record<string, unknown>)}
          onClose={() => setПодробно(false)}
        />
      )}
    </div>
  );
}

function Карточка({
  вид,
  запись,
  onSave,
  onПодробно,
}: {
  вид: Вид;
  запись: Запись;
  onSave: (правки: Record<string, unknown>) => Promise<void>;
  onПодробно: () => void;
}) {
  const [форма, setФорма] = useState({
    desc: запись.desc ?? "",
    phone: запись.phone ?? "",
    price: запись.price ?? "",
    open: запись.open ?? "",
    cuisine: запись.cuisine ?? "",
    tag: запись.tag ?? "",
  });
  const поменять =
    (к: keyof typeof форма) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setФорма((ф) => ({ ...ф, [к]: e.target.value }));

  const строка = (к: keyof typeof форма, текст: string, пример: string) => (
    <label className="text-[11px]" style={подпись}>
      {текст}
      <input
        value={форма[к]}
        onChange={поменять(к)}
        placeholder={пример}
        className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
        style={поле}
      />
    </label>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="p-5">
        <SectionTitle>Основное</SectionTitle>
        <label className="text-[11px]" style={подпись}>
          ОПИСАНИЕ — ЕГО ВИДЯТ ТУРИСТЫ (ПЕРЕВОДИТСЯ НА 9 ЯЗЫКОВ)
          <textarea
            value={форма.desc}
            onChange={поменять("desc")}
            rows={5}
            className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
            style={поле}
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {строка("phone", "ТЕЛЕФОН", "+998 90 123 45 67")}
          {строка(
            "price",
            вид === "hotel" ? "ЦЕНА ЗА НОЧЬ «ОТ»" : "ДИАПАЗОН ЦЕН",
            вид === "hotel" ? "$60" : "$5–15",
          )}
          {вид === "restaurant" && строка("open", "ЧАСЫ РАБОТЫ", "09:00–23:00")}
          {вид === "restaurant" && строка("cuisine", "КУХНЯ", "Узбекская")}
          {вид === "hotel" && строка("tag", "МЕТКА НА ФОТО", "Вид на Регистан")}
        </div>
        <div className="mt-4">
          <Btn
            onClick={() =>
              onSave(
                Object.fromEntries(
                  Object.entries(форма).filter(([к]) =>
                    вид === "hotel" ? !["open", "cuisine"].includes(к) : к !== "tag",
                  ),
                ),
              )
            }
          >
            Сохранить
          </Btn>
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle>Фото и подробности</SectionTitle>
        <p className="mb-4 text-sm" style={{ color: "var(--color-muted)" }}>
          {вид === "hotel"
            ? "Галерея, номера и цены, «Полезно знать», свободные номера и подключение вашей системы бронирования (PMS)."
            : "Галерея, меню, залы и столы, «Полезно знать», свободные столы и подключение вашей кассы."}
        </p>
        <Btn variant="ghost" onClick={onПодробно}>
          Открыть редактор
        </Btn>
      </Card>
    </div>
  );
}

function Брони({ брони, onDone }: { брони: Бронь[]; onDone: () => Promise<void> }) {
  const [идёт, setИдёт] = useState<string | null>(null);
  const отметить = async (id: string, status: "confirmed" | "cancelled") => {
    setИдёт(id);
    await fetch(`/api/venue/bookings/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => undefined);
    await onDone();
    setИдёт(null);
  };
  if (!брони.length)
    return (
      <p style={{ color: "var(--color-muted)" }}>
        Броней пока нет — они появятся здесь, как только туристы их оставят.
      </p>
    );
  const порядок = [...брони].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="flex flex-col gap-3">
      {порядок.map((б) => (
        <Card key={б.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                {б.date}
                {б.time ? ` · ${б.time}` : ""} · {б.guests} гост.
                {б.nights ? ` · ${б.nights} ноч.` : ""}
                {б.roomCategory ? ` · ${б.roomCategory}` : ""}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                {б.гость || "Гость"}
                {б.телефон ? ` · ${б.телефон}` : ""}
                {б.email ? ` · ${б.email}` : ""}
              </p>
              {б.note && (
                <p className="mt-1 text-sm" style={{ color: "var(--color-text)" }}>
                  «{б.note}»
                </p>
              )}
              <p className="mt-1 text-xs" style={подпись}>
                заявка от {дата(б.createdAt)}
              </p>
            </div>
            <Badge label={СТАТУС[б.status].текст} color={СТАТУС[б.status].цвет} />
          </div>
          {б.status === "new" && (
            <div className="mt-3 flex gap-2">
              <Btn small onClick={() => отметить(б.id, "confirmed")}>
                {идёт === б.id ? "…" : "Подтвердить"}
              </Btn>
              <Btn small variant="danger" onClick={() => отметить(б.id, "cancelled")}>
                Отклонить
              </Btn>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Отзывы({ отзывы, onDone }: { отзывы: Отзыв[]; onDone: () => Promise<void> }) {
  if (!отзывы.length)
    return (
      <p style={{ color: "var(--color-muted)" }}>
        Отзывов пока нет. Ответы на отзывы видят все туристы — это лучшая реклама.
      </p>
    );
  return (
    <div className="flex flex-col gap-3">
      {отзывы.map((о) => (
        <ОтзывСОтветом key={о.id} отзыв={о} onDone={onDone} />
      ))}
    </div>
  );
}

function ОтзывСОтветом({ отзыв, onDone }: { отзыв: Отзыв; onDone: () => Promise<void> }) {
  const [текст, setТекст] = useState(отзыв.reply?.text ?? "");
  const [сохранено, setСохранено] = useState(false);
  const ответить = async () => {
    const r = await fetch(`/api/venue/reviews/${encodeURIComponent(отзыв.id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: текст }),
    }).catch(() => null);
    if (r?.ok) {
      setСохранено(true);
      setTimeout(() => setСохранено(false), 1500);
      await onDone();
    }
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold" style={{ color: "var(--color-text)" }}>
          {"★".repeat(отзыв.rating)}
          <span style={{ color: "var(--color-muted)" }}>{"★".repeat(5 - отзыв.rating)}</span> ·{" "}
          {отзыв.userName || "Турист"}
        </p>
        <span className="text-xs" style={подпись}>
          {дата(отзыв.createdAt)}
        </span>
      </div>
      {отзыв.text && (
        <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>
          {отзыв.text}
        </p>
      )}
      <label className="mt-3 block text-[11px]" style={подпись}>
        ОТВЕТ ЗАВЕДЕНИЯ — ВИДЕН ВСЕМ ТУРИСТАМ
        <textarea
          value={текст}
          onChange={(e) => setТекст(e.target.value)}
          rows={2}
          placeholder="Спасибо, что пришли к нам!"
          className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
          style={поле}
        />
      </label>
      <div className="mt-2 flex items-center gap-3">
        <Btn small onClick={ответить}>
          {отзыв.reply ? "Обновить ответ" : "Ответить"}
        </Btn>
        {сохранено && (
          <span className="text-xs" style={{ color: "var(--color-teal)" }}>
            Сохранено
          </span>
        )}
      </div>
    </Card>
  );
}
