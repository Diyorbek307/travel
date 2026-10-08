import { useCallback, useEffect, useRef, useState } from "react";
import { названиеСтраны } from "@/lib/countries";
import { PageHeader, Badge, Btn, склонение } from "./shared";
import { useNarrow } from "../context/useNarrow";

/**
 * Поддержка.
 *
 * Ветки настоящие: их пишут из приложения, из вкладки «Поддержка» в
 * профиле. Первыми отвечают ИИ-помощники — у туриста они подписаны
 * именем и пометкой «ИИ». Оператор видит всё, может взять переписку на
 * себя (тогда ИИ замолкает) и вернуть её помощнику. Удачный ответ можно
 * одной кнопкой положить в базу знаний — помощники будут отвечать так же.
 *
 * Обновляется опросом раз в несколько секунд — постоянное соединение
 * здесь избыточно, а опрос переживает обрыв связи без всякой логики
 * переподключения.
 *
 * На узком экране список и переписка не помещаются рядом, поэтому
 * показывается что-то одно.
 */

interface Message {
  id: string;
  author: "user" | "staff" | "ai";
  text: string;
  createdAt: string;
  name?: string;
  /** Ответ ИИ, который турист увидит в эту минуту (до неё — «печатает…»). */
  showAt?: string;
}

interface Thread {
  userId: string;
  name: string;
  email: string;
  photoUrl: string | null;
  country: string;
  messages: Message[];
  updatedAt: string;
  unreadForStaff: number;
  mode: "ai" | "human";
  needsHuman: boolean;
  agent: string;
  typing: boolean;
}

const ОПРОС_МС = 5000;

function время(iso: string): string {
  return new Date(iso).toLocaleString("ru", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ПОЛЕ: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
};

const ПАНЕЛЬ: React.CSSProperties = {
  background: "var(--color-panel)",
  border: "1px solid var(--color-border)",
};

export default function Chat() {
  const [вкладка, setВкладка] = useState<"threads" | "bugs" | "kb">("threads");
  const вкладки = [
    ["threads", "Переписки"],
    ["bugs", "Ошибки"],
    ["kb", "База знаний"],
  ] as const;
  return (
    <div className="flex h-full flex-col p-4 sm:p-7">
      <PageHeader
        title="Поддержка"
        subtitle="Первыми отвечают ИИ-помощники (у туриста — с пометкой «ИИ»). Оператор может взять переписку на себя."
        action={вкладки.map(([к, подпись]) => (
          <Btn key={к} small variant={вкладка === к ? "primary" : "ghost"} onClick={() => setВкладка(к)}>
            {подпись}
          </Btn>
        ))}
      />
      {вкладка === "threads" && <Переписки />}
      {вкладка === "bugs" && <Ошибки />}
      {вкладка === "kb" && <БазаЗнаний />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Переписки() {
  const [ветки, setВетки] = useState<Thread[]>([]);
  const [активный, setАктивный] = useState<string | null>(null);
  const [текст, setТекст] = useState("");
  const [загрузка, setЗагрузка] = useState(true);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const narrow = useNarrow();
  const [показатьПереписку, setПоказатьПереписку] = useState(false);
  const низ = useRef<HTMLDivElement>(null);
  /** Черновик записи в базу знаний из удачного ответа. */
  const [вБазу, setВБазу] = useState<{ question: string; answer: string } | null>(null);
  const [сохранено, setСохранено] = useState(false);

  const подтянуть = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support");
      if (!res.ok) throw new Error();
      const d = (await res.json()) as { threads: Thread[] };
      setВетки(d.threads);
      setОшибка(null);
    } catch {
      setОшибка("Не удалось загрузить переписки");
    }
  }, []);

  useEffect(() => {
    подтянуть().finally(() => setЗагрузка(false));
    const t = setInterval(подтянуть, ОПРОС_МС);
    return () => clearInterval(t);
  }, [подтянуть]);

  const ветка = ветки.find((t) => t.userId === активный) ?? null;

  // Турист написал, пока оператор смотрит в его переписку, — это уже
  // прочитано, незачем держать счётчик «новых».
  const новыхВОткрытой = ветка && показатьПереписку ? ветка.unreadForStaff : 0;
  useEffect(() => {
    if (!активный || новыхВОткрытой === 0) return;
    fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: активный, markRead: true }),
    }).catch(() => {});
  }, [активный, новыхВОткрытой]);

  useEffect(() => {
    низ.current?.scrollIntoView({ block: "end" });
  }, [ветка?.messages.length]);

  async function открыть(userId: string) {
    setАктивный(userId);
    setПоказатьПереписку(true);
    setВБазу(null);
    // Отмечаем прочитанным сразу: оператор открыл ветку, значит увидел.
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, markRead: true }),
    }).catch(() => {});
    подтянуть();
  }

  async function ответить(e: React.FormEvent) {
    e.preventDefault();
    const значение = текст.trim();
    if (!значение || !активный) return;
    setТекст("");
    const res = await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: активный, text: значение }),
    }).catch(() => null);
    // Не ушло — возвращаем текст, чтобы оператор не набирал заново.
    if (!res?.ok) {
      setТекст(значение);
      setОшибка("Ответ не отправлен — попробуйте ещё раз");
    }
    подтянуть();
  }

  async function режим(mode: "ai" | "human") {
    if (!активный) return;
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: активный, mode }),
    }).catch(() => {});
    подтянуть();
  }

  async function сохранитьВБазу() {
    if (!вБазу) return;
    const res = await fetch("/api/admin/support/kb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(вБазу),
    }).catch(() => null);
    if (res?.ok) {
      setВБазу(null);
      setСохранено(true);
      setTimeout(() => setСохранено(false), 2500);
    } else setОшибка("Не сохранилось в базу знаний");
  }

  const всегоНепрочитанных = ветки.reduce((s, t) => s + t.unreadForStaff, 0);
  const ждутЧеловека = ветки.filter((t) => t.needsHuman).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mb-4 text-sm" style={{ color: "var(--color-muted)" }}>
        {загрузка
          ? "Загружаем…"
          : склонение(ветки.length, ["переписка", "переписки", "переписок"]) +
            (всегоНепрочитанных ? ` · новых: ${всегоНепрочитанных}` : "") +
            (ждутЧеловека ? ` · ждут оператора: ${ждутЧеловека}` : "")}
        {сохранено && " · сохранено в базу знаний ✓"}
      </p>

      {ошибка && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-rose)" }}>
          {ошибка}
        </p>
      )}

      {!загрузка && ветки.length === 0 && (
        <div
          className="rounded-lg p-8 text-center text-sm leading-relaxed"
          style={{ background: "var(--color-panel)", color: "var(--color-muted)" }}
        >
          Обращений пока нет. Они появятся здесь, когда турист напишет из приложения — вкладка «Поддержка» в
          профиле.
        </div>
      )}

      {ветки.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          {/* Список переписок */}
          <div
            className="min-h-0 shrink-0 overflow-y-auto rounded-lg lg:w-72"
            style={{ ...ПАНЕЛЬ, display: narrow && показатьПереписку ? "none" : undefined }}
          >
            {ветки.map((t) => {
              const последнее = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.userId}
                  onClick={() => открыть(t.userId)}
                  className="w-full cursor-pointer border-b px-4 py-3 text-left"
                  style={{
                    borderColor: "var(--color-border)",
                    background: t.userId === активный ? "var(--color-bg)" : "transparent",
                  }}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-medium"
                      style={{ color: "var(--color-text)" }}
                    >
                      {t.name}
                    </span>
                    {t.needsHuman && <Badge label="Нужен оператор" color="rose" />}
                    {t.mode === "ai" && !t.needsHuman && <Badge label={`ИИ · ${t.agent}`} color="teal" />}
                    {t.unreadForStaff > 0 && <Badge label={String(t.unreadForStaff)} color="amber" />}
                  </div>
                  <p className="truncate text-xs" style={{ color: "var(--color-muted)" }}>
                    {последнее ? последнее.text : "—"}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Переписка */}
          <div
            className="flex min-h-0 flex-1 flex-col rounded-lg"
            style={{ ...ПАНЕЛЬ, display: narrow && !показатьПереписку ? "none" : undefined }}
          >
            {!ветка ? (
              <p className="p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
                Выберите переписку слева.
              </p>
            ) : (
              <>
                <div
                  className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {narrow && (
                    <button
                      onClick={() => setПоказатьПереписку(false)}
                      style={{ color: "var(--color-muted)" }}
                    >
                      ‹
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
                      {ветка.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--color-muted)" }}>
                      {ветка.email}
                      {ветка.country ? ` · ${названиеСтраны(ветка.country, "ru")}` : ""}
                      {ветка.mode === "ai" ? ` · отвечает ИИ (${ветка.agent})` : " · ведёт оператор"}
                    </p>
                  </div>
                  {ветка.mode === "ai" ? (
                    <Btn small variant="ghost" onClick={() => режим("human")}>
                      Взять на себя
                    </Btn>
                  ) : (
                    <Btn small variant="ghost" onClick={() => режим("ai")}>
                      Вернуть ИИ-помощнику
                    </Btn>
                  )}
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                  {ветка.messages.map((m, i) => {
                    const оператор = m.author === "staff";
                    const ии = m.author === "ai";
                    const ещёНеВидно = Boolean(m.showAt && Date.parse(m.showAt) > Date.now());
                    // Вопрос к ответу — последнее сообщение туриста перед ним.
                    const вопрос = ветка.messages
                      .slice(0, i)
                      .reverse()
                      .find((x) => x.author === "user");
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${оператор || ии ? "items-end" : "items-start"}`}
                      >
                        {(оператор || ии) && (
                          <p className="mb-0.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
                            {ии ? `🤖 ${m.name ?? ""} (ИИ)` : `👤 ${m.name ?? "Оператор"}`}
                            {ещёНеВидно ? " · турист увидит через несколько секунд" : ""}
                          </p>
                        )}
                        <div
                          className="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                          style={{
                            background: оператор
                              ? "var(--color-amber)"
                              : ии
                                ? "color-mix(in srgb, var(--color-teal) 18%, var(--color-bg))"
                                : "var(--color-bg)",
                            color: оператор ? "var(--color-on-accent)" : "var(--color-text)",
                            opacity: ещёНеВидно ? 0.6 : 1,
                          }}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          <p className="mt-1 text-[10px] opacity-70">{время(m.createdAt)}</p>
                        </div>
                        {(оператор || ии) && вопрос && (
                          <button
                            onClick={() => setВБазу({ question: вопрос.text, answer: m.text })}
                            className="mt-0.5 cursor-pointer text-[11px] underline"
                            style={{ color: "var(--color-muted)" }}
                          >
                            В базу знаний
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {ветка.typing && ветка.mode === "ai" && (
                    <p className="text-right text-[11px]" style={{ color: "var(--color-muted)" }}>
                      🤖 {ветка.agent} печатает…
                    </p>
                  )}
                  <div ref={низ} />
                </div>

                {вБазу && (
                  <div className="shrink-0 space-y-2 border-t p-3" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text)" }}>
                      В базу знаний: помощники будут отвечать так же. Сделайте вопрос и ответ общими — без имён и
                      личных данных туриста.
                    </p>
                    <textarea
                      value={вБазу.question}
                      onChange={(e) => setВБазу({ ...вБазу, question: e.target.value })}
                      rows={2}
                      className="w-full rounded px-3 py-2 text-sm outline-none"
                      style={ПОЛЕ}
                      aria-label="Вопрос"
                    />
                    <textarea
                      value={вБазу.answer}
                      onChange={(e) => setВБазу({ ...вБазу, answer: e.target.value })}
                      rows={3}
                      className="w-full rounded px-3 py-2 text-sm outline-none"
                      style={ПОЛЕ}
                      aria-label="Ответ"
                    />
                    <div className="flex gap-2">
                      <Btn small onClick={сохранитьВБазу}>
                        Сохранить
                      </Btn>
                      <Btn small variant="ghost" onClick={() => setВБазу(null)}>
                        Отмена
                      </Btn>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={ответить}
                  className="flex shrink-0 flex-wrap items-center gap-2 border-t p-3"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <input
                    value={текст}
                    onChange={(e) => setТекст(e.target.value)}
                    placeholder="Ответ туристу — подпишется вашим именем"
                    maxLength={2000}
                    className="min-w-0 flex-1 rounded px-3 py-2 text-sm outline-none"
                    style={ПОЛЕ}
                  />
                  <Btn small type="submit">
                    Отправить
                  </Btn>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface Заявка {
  id: string;
  userId: string;
  name: string;
  title: string;
  details: string;
  device: string;
  lang: string;
  status: "new" | "in_progress" | "fixed" | "rejected";
  createdAt: string;
}

const СТАТУСЫ: { value: Заявка["status"]; label: string; color: "rose" | "amber" | "teal" | "dim" }[] = [
  { value: "new", label: "Новая", color: "rose" },
  { value: "in_progress", label: "В работе", color: "amber" },
  { value: "fixed", label: "Исправлено", color: "teal" },
  { value: "rejected", label: "Не ошибка", color: "dim" },
];

/** Заявки об ошибках: их собирают ИИ-помощники из переписок, чинят люди. */
function Ошибки() {
  const [заявки, setЗаявки] = useState<Заявка[] | null>(null);
  const [ошибка, setОшибка] = useState(false);

  const подтянуть = useCallback(async () => {
    const res = await fetch("/api/admin/support/bugs").catch(() => null);
    if (!res?.ok) return setОшибка(true);
    setЗаявки(((await res.json()) as { items: Заявка[] }).items);
  }, []);

  useEffect(() => {
    void подтянуть();
  }, [подтянуть]);

  async function статус(id: string, status: Заявка["status"]) {
    await fetch("/api/admin/support/bugs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
    void подтянуть();
  }

  if (ошибка)
    return (
      <p className="text-sm" style={{ color: "var(--color-rose)" }}>
        Не удалось загрузить заявки
      </p>
    );
  if (!заявки)
    return (
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        Загружаем…
      </p>
    );
  if (!заявки.length)
    return (
      <div className="rounded-lg p-8 text-center text-sm leading-relaxed" style={{ ...ПАНЕЛЬ, color: "var(--color-muted)" }}>
        Заявок пока нет. Когда турист опишет сбой, ИИ-помощник уточнит подробности и положит заявку сюда.
      </div>
    );

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      {заявки.map((з) => {
        const с = СТАТУСЫ.find((x) => x.value === з.status) ?? СТАТУСЫ[0];
        return (
          <div key={з.id} className="rounded-lg p-4" style={ПАНЕЛЬ}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge label={с.label} color={с.color} />
              <p className="min-w-0 flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {з.title}
              </p>
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {время(з.createdAt)}
              </span>
            </div>
            <p className="mb-2 whitespace-pre-wrap text-sm" style={{ color: "var(--color-text)" }}>
              {з.details}
            </p>
            <p className="mb-3 text-xs break-words" style={{ color: "var(--color-muted)" }}>
              {з.name} · язык {з.lang} · {з.device || "устройство неизвестно"}
            </p>
            <div className="flex flex-wrap gap-2">
              {СТАТУСЫ.filter((x) => x.value !== з.status).map((x) => (
                <Btn key={x.value} small variant="ghost" onClick={() => статус(з.id, x.value)}>
                  {x.label}
                </Btn>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface Знание {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  by: string;
}

/** База знаний: из неё ИИ-помощники берут ответы. Пополняют её только люди. */
function БазаЗнаний() {
  const [записи, setЗаписи] = useState<Знание[] | null>(null);
  const [вопрос, setВопрос] = useState("");
  const [ответ, setОтвет] = useState("");
  const [ошибка, setОшибка] = useState<string | null>(null);

  const подтянуть = useCallback(async () => {
    const res = await fetch("/api/admin/support/kb").catch(() => null);
    if (!res?.ok) return setОшибка("Не удалось загрузить базу знаний");
    setЗаписи(((await res.json()) as { items: Знание[] }).items);
  }, []);

  useEffect(() => {
    void подтянуть();
  }, [подтянуть]);

  async function добавить(e: React.FormEvent) {
    e.preventDefault();
    if (!вопрос.trim() || !ответ.trim()) return;
    const res = await fetch("/api/admin/support/kb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: вопрос, answer: ответ }),
    }).catch(() => null);
    if (!res?.ok) return setОшибка("Не сохранилось");
    setВопрос("");
    setОтвет("");
    setОшибка(null);
    void подтянуть();
  }

  async function удалить(id: string) {
    if (!confirm("Удалить запись из базы знаний?")) return;
    await fetch(`/api/admin/support/kb?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    void подтянуть();
  }

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
      <form onSubmit={добавить} className="space-y-2 rounded-lg p-4" style={ПАНЕЛЬ}>
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Новая запись
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Помощники доверяют базе больше всего: пишите только то, что точно верно. Отвечать они будут на языке
          туриста, писать запись можно по-русски.
        </p>
        <input
          value={вопрос}
          onChange={(e) => setВопрос(e.target.value)}
          placeholder="Вопрос — например: как поменять язык?"
          maxLength={1000}
          className="w-full rounded px-3 py-2 text-sm outline-none"
          style={ПОЛЕ}
        />
        <textarea
          value={ответ}
          onChange={(e) => setОтвет(e.target.value)}
          placeholder="Ответ"
          maxLength={3000}
          rows={3}
          className="w-full rounded px-3 py-2 text-sm outline-none"
          style={ПОЛЕ}
        />
        <Btn small type="submit">
          Добавить
        </Btn>
        {ошибка && (
          <p className="text-sm" style={{ color: "var(--color-rose)" }}>
            {ошибка}
          </p>
        )}
      </form>

      {записи?.map((з) => (
        <div key={з.id} className="rounded-lg p-4" style={ПАНЕЛЬ}>
          <p className="mb-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {з.question}
          </p>
          <p className="mb-2 whitespace-pre-wrap text-sm" style={{ color: "var(--color-text)" }}>
            {з.answer}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {з.by} · {время(з.createdAt)}
            </span>
            <Btn small variant="danger" onClick={() => удалить(з.id)}>
              Удалить
            </Btn>
          </div>
        </div>
      ))}
      {записи && !записи.length && (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Записей пока нет. Добавьте вручную или нажмите «В базу знаний» под удачным ответом в переписке.
        </p>
      )}
    </div>
  );
}
