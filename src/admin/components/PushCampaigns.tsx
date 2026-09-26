import { useCallback, useEffect, useState } from "react";
import { PageHeader, Badge, Btn, Table, склонение } from "./shared";
import { useEntity } from "../context/useEntity";
import {
  картинкаКампании,
  ошибкаКампании,
  разобратьСсылку,
  сегодняВТашкенте,
  type Аудитория,
  type КампанияСоСчётом,
} from "@/lib/campaign-rules";

/**
 * Уведомления для туристов.
 *
 * Раньше раздел был макетом с вымышленными рассылками и процентами
 * открытий. Теперь кампании настоящие: лежат на сервере
 * (/api/admin/campaigns), попадают туристу в колокольчик в свой срок и,
 * если настроены ключи VAPID, приходят push-уведомлением на телефон.
 *
 * Счётчик «прочитали» — по аккаунтам: один человек, открывший
 * колокольчик пять раз, — одно прочтение.
 */

type Черновик = {
  id: string;
  title: string;
  body: string;
  emoji: string;
  link: string;
  image: string;
  audience: Аудитория;
  from: string;
  to: string;
  active: boolean;
  sendPush: boolean;
};

function черновикНовый(): Черновик {
  const сегодня = сегодняВТашкенте();
  const через = new Date(Date.now() + 7 * 86_400_000);
  return {
    id: "",
    title: "",
    body: "",
    emoji: "🔔",
    link: "explore",
    image: "",
    audience: { kind: "all" },
    from: сегодня,
    to: сегодняВТашкенте(через),
    active: true,
    sendPush: false,
  };
}

/**
 * Шаблоны — чтобы не начинать с пустого листа. Короткий заголовок с
 * эмодзи по смыслу и конкретика в тексте: на экране блокировки iPhone
 * видно строки две, и «ПРИВЕТ» там теряется.
 */
const ШАБЛОНЫ: { имя: string; emoji: string; title: string; body: string; link: string }[] = [
  {
    имя: "Скидка",
    emoji: "🏷️",
    title: "Хостелы в Бухаре −20%",
    body: "Только до воскресенья. Выберите хостел у Ляби-Хауза →",
    link: "explore:hotels",
  },
  {
    имя: "Новое место",
    emoji: "📍",
    title: "Новое в Самарканде",
    body: "Бумажная фабрика «Мейрос»: сделайте шёлковую бумагу своими руками →",
    link: "explore:places",
  },
  {
    имя: "Событие",
    emoji: "🎉",
    title: "Праздник Навруз в эти выходные",
    body: "Сумаляк, концерты и ярмарка ремёсел. Где и когда — внутри →",
    link: "explore",
  },
  {
    имя: "Где поесть",
    emoji: "🍽️",
    title: "Лучший плов рядом с вами",
    body: "Подборка чайхан, где плов готовят с утра в казане →",
    link: "explore:restaurants",
  },
  {
    имя: "Экскурсия",
    emoji: "🧭",
    title: "Ичан-Кала пешком за 5 часов",
    body: "Маршрут с гидом: от Ота-Дарвозы до минарета Ислам-Ходжа →",
    link: "explore:excursions",
  },
  {
    имя: "ИИ-гид",
    emoji: "🤖",
    title: "Спросите ИИ-гида",
    body: "Куда пойти вечером, как доехать, что попробовать — ответит за секунду →",
    link: "explore:ai",
  },
];

/** Куда ведёт уведомление — выбор в форме. Вид и, если нужно, что именно. */
const ВИДЫ_ССЫЛОК: { значение: string; подпись: string }[] = [
  { значение: "", подпись: "Никуда — только текст" },
  { значение: "explore", подпись: "HelloUZ — все разделы" },
  { значение: "explore:hotels", подпись: "HelloUZ → Гостиницы" },
  { значение: "explore:restaurants", подпись: "HelloUZ → Рестораны" },
  { значение: "explore:bars", подпись: "HelloUZ → Бары и клубы" },
  { значение: "explore:museums", подпись: "HelloUZ → Музеи" },
  { значение: "explore:places", подпись: "HelloUZ → Достопримечательности" },
  { значение: "explore:excursions", подпись: "HelloUZ → Экскурсии" },
  { значение: "explore:cities", подпись: "HelloUZ → Города" },
  { значение: "explore:ai", подпись: "HelloUZ → ИИ-гид" },
  { значение: "map", подпись: "Карта" },
  { значение: "profile", подпись: "Профиль" },
  { значение: "place", подпись: "Конкретное место…" },
  { значение: "hotel", подпись: "Конкретная гостиница…" },
  { значение: "restaurant", подпись: "Конкретный ресторан или бар…" },
];

const полеСтиль = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
} as const;
const подписьСтиль = { color: "var(--color-muted)", fontFamily: "var(--font-mono)" } as const;

function датаКоротко(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/** Состояние кампании на сегодня — для бейджа в таблице. */
function статус(
  к: КампанияСоСчётом,
  сегодня: string,
): { label: string; color: "teal" | "amber" | "dim" | "rose" } {
  if (!к.active) return { label: "выключена", color: "rose" };
  if (сегодня < к.from) return { label: "запланирована", color: "amber" };
  if (сегодня > к.to) return { label: "завершена", color: "dim" };
  return { label: "идёт", color: "teal" };
}

function аудиторияСловами(а: Аудитория): string {
  return а.kind === "all" ? "Все" : а.kind === "premium" ? "Premium" : `Город: ${а.city}`;
}

export default function PushCampaigns() {
  const [кампании, setКампании] = useState<КампанияСоСчётом[]>([]);
  const [pushReady, setPushReady] = useState(false);
  const [подписчиков, setПодписчиков] = useState(0);
  const [загрузка, setЗагрузка] = useState(true);
  const [ошибкаЗагрузки, setОшибкаЗагрузки] = useState("");
  const [черновик, setЧерновик] = useState<Черновик | null>(null);
  const [ошибкаФормы, setОшибкаФормы] = useState("");
  const [сохраняю, setСохраняю] = useState(false);
  const [сообщение, setСообщение] = useState("");

  const [cities] = useEntity("cities");
  const [places] = useEntity("places");
  const [hotels] = useEntity("hotels");
  const [restaurants] = useEntity("restaurants");

  const загрузить = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/campaigns", { cache: "no-store" });
      if (!r.ok) throw new Error(r.status === 403 ? "Нет прав на этот раздел" : `Ошибка ${r.status}`);
      const d = (await r.json()) as {
        campaigns: КампанияСоСчётом[];
        pushReady: boolean;
        subscribers: number;
      };
      setКампании(d.campaigns);
      setPushReady(d.pushReady);
      setПодписчиков(d.subscribers);
      setОшибкаЗагрузки("");
    } catch (e) {
      setОшибкаЗагрузки(e instanceof Error ? e.message : "Не удалось загрузить");
    } finally {
      setЗагрузка(false);
    }
  }, []);

  useEffect(() => {
    загрузить();
  }, [загрузить]);

  const открыть = (к?: КампанияСоСчётом) => {
    setОшибкаФормы("");
    setЧерновик(
      к
        ? {
            id: к.id,
            title: к.title,
            body: к.body,
            emoji: к.emoji,
            link: к.link,
            image: к.image ?? "",
            audience: к.audience,
            from: к.from,
            to: к.to,
            active: к.active,
            sendPush: false,
          }
        : черновикНовый(),
    );
  };

  const сохранить = async () => {
    // Повторное нажатие, пока идёт запрос, создало бы кампанию дважды.
    if (!черновик || сохраняю) return;
    const ошибка = ошибкаКампании(черновик);
    if (ошибка) return setОшибкаФормы(ошибка);
    setСохраняю(true);
    try {
      const r = await fetch("/api/admin/campaigns", {
        method: черновик.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(черновик),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string; pushed?: number | null };
      if (!r.ok) return setОшибкаФормы(d.error ?? `Ошибка ${r.status}`);
      setСообщение(
        черновик.sendPush
          ? d.pushed == null
            ? "Сохранено. Push не ушёл: кампания выключена или сегодня вне её срока."
            : `Сохранено. Push ушёл: ${склонение(d.pushed, ["устройство", "устройства", "устройств"])}.`
          : "Сохранено.",
      );
      setЧерновик(null);
      await загрузить();
    } finally {
      setСохраняю(false);
    }
  };

  const переключить = async (к: КампанияСоСчётом) => {
    await fetch("/api/admin/campaigns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: к.id, active: !к.active }),
    });
    await загрузить();
  };

  // Удаление необратимо: кампания пропадёт у туристов вместе со счётчиком.
  const удалить = async (к: КампанияСоСчётом) => {
    if (!confirm(`Удалить «${к.title}»? Уведомление исчезнет у туристов, счётчик прочтений тоже.`)) return;
    await fetch(`/api/admin/campaigns?id=${encodeURIComponent(к.id)}`, { method: "DELETE" });
    setЧерновик(null);
    await загрузить();
  };

  const сегодня = сегодняВТашкенте();
  const идут = кампании.filter((к) => статус(к, сегодня).label === "идёт").length;
  const прочтений = кампании.reduce((s, к) => s + к.reads, 0);

  // Ссылка на конкретную запись: вид берём до двоеточия, id — после.
  const вид = (ссылка: string) => {
    const п = разобратьСсылку(ссылка);
    if (!п) return "";
    if (п.kind === "place" || п.kind === "hotel" || п.kind === "restaurant") return п.kind;
    return ссылка;
  };
  const записиДля = (в: string) =>
    в === "place"
      ? places.map((x) => ({ id: x.id, name: `${x.name} · ${x.city}` }))
      : в === "hotel"
      ? hotels.map((x) => ({ id: x.id, name: `${x.name} · ${x.city}` }))
      : в === "restaurant"
      ? restaurants.map((x) => ({ id: x.id, name: `${x.name} · ${x.city}` }))
      : [];

  const ссылкаСловами = (ссылка: string) => {
    const п = разобратьСсылку(ссылка);
    if (!п) return "—";
    if (п.kind === "place") return places.find((x) => x.id === п.id)?.name ?? "место удалено";
    if (п.kind === "hotel") return hotels.find((x) => x.id === п.id)?.name ?? "гостиница удалена";
    if (п.kind === "restaurant") return restaurants.find((x) => x.id === п.id)?.name ?? "заведение удалено";
    return ВИДЫ_ССЫЛОК.find((в) => в.значение === ссылка)?.подпись ?? ссылка;
  };

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Уведомления"
        subtitle="Сообщения туристам в колокольчике и push на телефон"
        action={<Btn onClick={() => открыть()}>+ Новое уведомление</Btn>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "ВСЕГО", val: String(кампании.length) },
          { label: "ИДУТ СЕГОДНЯ", val: String(идут) },
          { label: "ПРОЧТЕНИЙ", val: String(прочтений) },
          { label: "PUSH-ПОДПИСЧИКОВ", val: pushReady ? String(подписчиков) : "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
          >
            <div className="text-xs mb-1.5" style={подписьСтиль}>
              {s.label}
            </div>
            <div
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}
            >
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {!pushReady && !загрузка && (
        <div
          className="mb-5 rounded-lg px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--color-amber) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-amber) 30%, transparent)",
            color: "var(--color-text)",
          }}
        >
          Push на телефон выключен: на сервере не заданы ключи VAPID (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
          VAPID_SUBJECT). Уведомления всё равно приходят туристам в колокольчик в приложении.
        </div>
      )}
      {сообщение && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-teal)" }}>
          {сообщение}
        </p>
      )}
      {ошибкаЗагрузки && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-rose)" }}>
          {ошибкаЗагрузки}
        </p>
      )}

      {загрузка ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Загружаю…
        </p>
      ) : кампании.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Уведомлений пока нет. Создайте первое — оно появится у туристов в колокольчике в указанный срок.
        </p>
      ) : (
        <Table
          cols={["УВЕДОМЛЕНИЕ", "КОМУ", "СРОК", "КУДА ВЕДЁТ", "ПРОЧЛИ", "PUSH", "СТАТУС", ""]}
          rows={кампании.map((к) => {
            const ст = статус(к, сегодня);
            return [
              <div key="t" className="min-w-[200px]">
                <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                  {к.emoji} {к.title}
                </div>
                <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-muted)" }}>
                  {к.body}
                </div>
              </div>,
              <span key="a" style={{ color: "var(--color-muted)", fontSize: 12 }}>
                {аудиторияСловами(к.audience)}
              </span>,
              <span key="d" style={{ ...подписьСтиль, fontSize: 12 }}>
                {датаКоротко(к.from)} — {датаКоротко(к.to)}
              </span>,
              <span key="l" style={{ color: "var(--color-muted)", fontSize: 12 }}>
                {ссылкаСловами(к.link)}
              </span>,
              <span key="r" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>
                {к.reads}
              </span>,
              <span key="p" style={{ ...подписьСтиль, fontSize: 12 }}>
                {к.pushedAt ? `${к.pushSent ?? 0} · ${датаКоротко(к.pushedAt.slice(0, 10))}` : "—"}
              </span>,
              <Badge key="s" label={ст.label} color={ст.color} />,
              <div key="b" className="flex flex-wrap gap-2">
                <Btn variant="ghost" small onClick={() => открыть(к)}>
                  Изменить
                </Btn>
                <Btn variant="ghost" small onClick={() => переключить(к)}>
                  {к.active ? "Выключить" : "Включить"}
                </Btn>
                <Btn variant="danger" small onClick={() => удалить(к)}>
                  Удалить
                </Btn>
              </div>,
            ];
          })}
        />
      )}

      {черновик && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setЧерновик(null)}
        >
          <div
            className="rounded-2xl w-full max-w-xl p-6 max-h-[90dvh] overflow-y-auto"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                {черновик.id ? "Изменить уведомление" : "Новое уведомление"}
              </h3>
              <button
                onClick={() => setЧерновик(null)}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xl"
                style={{ color: "var(--color-text)" }}
              >
                ×
              </button>
            </div>

            {!черновик.id && (
              <div className="mb-4">
                <div className="text-xs mb-1.5" style={подписьСтиль}>
                  НАЧАТЬ С ШАБЛОНА
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ШАБЛОНЫ.map((ш) => (
                    <button
                      key={ш.имя}
                      onClick={() =>
                        setЧерновик(
                          (d) =>
                            d && {
                              ...d,
                              emoji: ш.emoji,
                              title: ш.title,
                              body: ш.body,
                              link: ш.link,
                              image: "",
                            },
                        )
                      }
                      className="rounded-full px-3 py-1 text-xs cursor-pointer transition-colors"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                      }}
                    >
                      {ш.emoji} {ш.имя}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-3 mb-3">
              <label className="text-xs" style={подписьСтиль}>
                ЭМОДЗИ
                <input
                  value={черновик.emoji}
                  maxLength={4}
                  onChange={(e) => setЧерновик((d) => d && { ...d, emoji: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-center text-lg outline-none"
                  style={полеСтиль}
                />
              </label>
              <label className="text-xs" style={подписьСтиль}>
                ЗАГОЛОВОК ({черновик.title.length}/80)
                <input
                  value={черновик.title}
                  maxLength={80}
                  onChange={(e) => setЧерновик((d) => d && { ...d, title: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
            </div>
            <label className="text-xs block mb-3" style={подписьСтиль}>
              ТЕКСТ ({черновик.body.length}/300)
              <textarea
                rows={3}
                value={черновик.body}
                maxLength={300}
                onChange={(e) => setЧерновик((d) => d && { ...d, body: e.target.value })}
                className="mt-1 w-full rounded px-3 py-2 text-sm outline-none resize-none"
                style={полеСтиль}
              />
            </label>
            <label className="text-xs block mb-3" style={подписьСтиль}>
              КАРТИНКА — ССЫЛКА (НЕОБЯЗАТЕЛЬНО)
              <input
                value={черновик.image}
                placeholder="https://… — пусто: фото записи из ссылки"
                onChange={(e) => setЧерновик((d) => d && { ...d, image: e.target.value })}
                className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                style={полеСтиль}
              />
              <span className="mt-1 block normal-case" style={{ fontFamily: "var(--font-body)" }}>
                Видна в колокольчике приложения и крупно в push на Android. iPhone картинки в push сайтов не
                показывает.
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <label className="text-xs" style={подписьСтиль}>
                КУДА ВЕДЁТ
                <select
                  value={вид(черновик.link)}
                  onChange={(e) => {
                    const в = e.target.value;
                    // Для конкретной записи сразу подставляем первую из списка.
                    const первая = записиДля(в)[0]?.id;
                    setЧерновик((d) => d && { ...d, link: первая ? `${в}:${первая}` : в });
                  }}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  {ВИДЫ_ССЫЛОК.map((в) => (
                    <option key={в.значение} value={в.значение}>
                      {в.подпись}
                    </option>
                  ))}
                </select>
              </label>
              {записиДля(вид(черновик.link)).length > 0 ? (
                <label className="text-xs" style={подписьСтиль}>
                  ЧТО ИМЕННО
                  <select
                    value={черновик.link.split(":")[1] ?? ""}
                    onChange={(e) =>
                      setЧерновик((d) => d && { ...d, link: `${вид(d.link)}:${e.target.value}` })
                    }
                    className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                    style={полеСтиль}
                  >
                    {записиДля(вид(черновик.link)).map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div />
              )}

              <label className="text-xs" style={подписьСтиль}>
                КОМУ
                <select
                  value={черновик.audience.kind}
                  onChange={(e) => {
                    const kind = e.target.value;
                    const audience: Аудитория =
                      kind === "city"
                        ? { kind: "city", city: cities[0]?.name ?? "" }
                        : { kind: kind === "premium" ? "premium" : "all" };
                    setЧерновик((d) => d && { ...d, audience });
                  }}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                >
                  <option value="all">Всем</option>
                  <option value="premium">Только Premium</option>
                  <option value="city">Тем, кто в городе…</option>
                </select>
              </label>
              {черновик.audience.kind === "city" ? (
                <label className="text-xs" style={подписьСтиль}>
                  ГОРОД
                  <select
                    value={черновик.audience.city}
                    onChange={(e) =>
                      setЧерновик((d) => d && { ...d, audience: { kind: "city", city: e.target.value } })
                    }
                    className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                    style={полеСтиль}
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div />
              )}

              <label className="text-xs" style={подписьСтиль}>
                ПОКАЗЫВАТЬ С
                <input
                  type="date"
                  value={черновик.from}
                  onChange={(e) => setЧерновик((d) => d && { ...d, from: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
              <label className="text-xs" style={подписьСтиль}>
                ПО (ВКЛЮЧИТЕЛЬНО)
                <input
                  type="date"
                  value={черновик.to}
                  onChange={(e) => setЧерновик((d) => d && { ...d, to: e.target.value })}
                  className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                  style={полеСтиль}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm mb-2" style={{ color: "var(--color-text)" }}>
              <input
                type="checkbox"
                checked={черновик.active}
                onChange={(e) => setЧерновик((d) => d && { ...d, active: e.target.checked })}
              />
              Включено — показывать туристам в срок
            </label>
            <label
              className="flex items-start gap-2 text-sm mb-1"
              style={{ color: pushReady ? "var(--color-text)" : "var(--color-muted)" }}
            >
              <input
                type="checkbox"
                className="mt-1"
                disabled={!pushReady}
                checked={черновик.sendPush}
                onChange={(e) => setЧерновик((d) => d && { ...d, sendPush: e.target.checked })}
              />
              <span>
                Отправить push при сохранении
                <span className="block text-xs" style={{ color: "var(--color-muted)" }}>
                  {pushReady
                    ? `Уйдёт подходящим подписчикам (всего подписано ${подписчиков}), если кампания включена и сегодня в её сроке. Каждое сохранение с галочкой — новая рассылка.`
                    : "Недоступно: не заданы ключи VAPID на сервере."}
                </span>
              </span>
            </label>

            <ПредпросмотрPush
              emoji={черновик.emoji}
              title={черновик.title}
              body={черновик.body}
              картинка={картинкаКампании(черновик, { places, hotels, restaurants })}
              ссылка={Boolean(черновик.link)}
            />

            {ошибкаФормы && (
              <p className="mb-3 text-sm" style={{ color: "var(--color-rose)" }}>
                {ошибкаФормы}
              </p>
            )}
            <div className="flex flex-wrap gap-3 justify-end">
              {черновик.id && (
                <Btn
                  variant="danger"
                  onClick={() => {
                    const к = кампании.find((x) => x.id === черновик.id);
                    if (к) удалить(к);
                  }}
                >
                  Удалить
                </Btn>
              )}
              <Btn variant="ghost" onClick={() => setЧерновик(null)}>
                Отмена
              </Btn>
              <Btn onClick={сохранить}>{сохраняю ? "Сохраняю…" : черновик.id ? "Сохранить" : "Создать"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Предпросмотр — как уведомление увидит турист: на экране блокировки
 * iPhone, в шторке Android и в колокольчике приложения. Рисуем по
 * образцу систем, а не своим стилем: редактору важно понять, сколько
 * текста влезет и где будет фото, а не как выглядит наша панель.
 */
function ПредпросмотрPush({
  emoji,
  title,
  body,
  картинка,
  ссылка,
}: {
  emoji: string;
  title: string;
  body: string;
  картинка?: string;
  ссылка: boolean;
}) {
  const [вид, setВид] = useState<"iphone" | "android" | "app">("iphone");
  const заголовок = `${emoji || "🔔"} ${title || "Заголовок"}`.trim();
  const текст = body || "Текст уведомления";
  const иконка = "/icons/icon-192.png";

  return (
    <div className="mt-4 mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs" style={подписьСтиль}>
          ПРЕДПРОСМОТР
        </span>
        <div
          className="flex rounded-full p-0.5 text-xs"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {(
            [
              ["iphone", "iPhone"],
              ["android", "Android"],
              ["app", "В приложении"],
            ] as const
          ).map(([к, подпись]) => (
            <button
              key={к}
              onClick={() => setВид(к)}
              className="rounded-full px-2.5 py-1 cursor-pointer"
              style={
                вид === к
                  ? { background: "var(--color-amber)", color: "var(--color-on-accent)" }
                  : { color: "var(--color-muted)" }
              }
            >
              {подпись}
            </button>
          ))}
        </div>
      </div>

      {/* Фон «экрана телефона» — одинаковый во всех темах панели: так
          предпросмотр показывает телефон, а не нашу тему. */}
      <div
        className="rounded-2xl p-4"
        style={{
          background:
            вид === "android"
              ? "linear-gradient(160deg,#1f2a30,#0d1418)"
              : вид === "app"
              ? "#f3f6f5"
              : "linear-gradient(160deg,#3b4a54,#15202a 70%)",
        }}
      >
        {вид === "iphone" && (
          <>
            <div className="text-center text-4xl font-semibold text-white/85 mb-3 tracking-tight">12:47</div>
            <div
              className="flex items-start gap-2.5 rounded-2xl p-3"
              style={{ background: "rgba(40,40,45,0.62)", backdropFilter: "blur(12px)" }}
            >
              <img src={иконка} alt="" className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-white">{заголовок}</span>
                  <span className="flex-shrink-0 text-[11px] text-white/50">сейчас</span>
                </div>
                <div className="text-[12px] text-white/60">from HelloUZ</div>
                <div className="line-clamp-4 text-[13px] leading-snug text-white">{текст}</div>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-white/45">
              iPhone не показывает картинку и кнопки — только заголовок и текст.
            </p>
          </>
        )}

        {вид === "android" && (
          <div className="overflow-hidden rounded-2xl" style={{ background: "#f7f9f9" }}>
            <div className="flex items-start gap-2.5 p-3">
              <img src={иконка} alt="" className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px]" style={{ color: "#5f6b70" }}>
                  Chrome · uzbekistan-travel.onrender.com · сейчас
                </div>
                <div className="truncate text-[14px] font-semibold" style={{ color: "#1b1f21" }}>
                  {заголовок}
                </div>
                <div className="line-clamp-2 text-[13px] leading-snug" style={{ color: "#3c4447" }}>
                  {текст}
                </div>
              </div>
            </div>
            {картинка ? (
              <img src={картинка} alt="" className="h-36 w-full object-cover" />
            ) : (
              <div className="px-3 pb-2 text-[11px]" style={{ color: "#8a9599" }}>
                Без картинки. Задайте ссылку на фото или выберите запись в «Куда ведёт».
              </div>
            )}
            {ссылка && (
              <div className="px-3 py-2.5 text-[13px] font-semibold" style={{ color: "#0e7a72" }}>
                Открыть
              </div>
            )}
          </div>
        )}

        {вид === "app" && (
          <div
            className="flex items-start gap-3 rounded-2xl bg-white p-3.5"
            style={{ border: "1.5px solid #0fb3ac", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: "#e3f6f4" }}
            >
              {emoji || "🔔"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold" style={{ color: "#13201f" }}>
                {title || "Заголовок"}
              </div>
              <div className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "#5d6b6a" }}>
                {текст}
              </div>
              {картинка && (
                <img src={картинка} alt="" className="mt-2.5 h-32 w-full rounded-xl object-cover" />
              )}
              <div className="mt-1.5 text-[10px]" style={{ color: "#0e8f88" }}>
                только что
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
