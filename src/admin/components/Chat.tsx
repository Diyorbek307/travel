import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader, Badge, Btn } from "./shared";
import { useNarrow } from "../context/useNarrow";

/**
 * Переписка с туристами.
 *
 * Ветки настоящие: их пишут из приложения, из вкладки «Поддержка» в
 * профиле. Обновляются опросом раз в несколько секунд — постоянное
 * соединение здесь избыточно, а опрос переживает обрыв связи без всякой
 * логики переподключения.
 *
 * На узком экране список и переписка не помещаются рядом, поэтому
 * показывается что-то одно.
 */

interface Message {
  id: string;
  author: "user" | "staff";
  text: string;
  createdAt: string;
}

interface Thread {
  userId: string;
  name: string;
  email: string;
  photo: string | null;
  country: string;
  messages: Message[];
  updatedAt: string;
  unreadForStaff: number;
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

export default function Chat() {
  const [ветки, setВетки] = useState<Thread[]>([]);
  const [активный, setАктивный] = useState<string | null>(null);
  const [текст, setТекст] = useState("");
  const [загрузка, setЗагрузка] = useState(true);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const narrow = useNarrow();
  const [показатьПереписку, setПоказатьПереписку] = useState(false);
  const низ = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    низ.current?.scrollIntoView({ block: "end" });
  }, [ветка?.messages.length]);

  async function открыть(userId: string) {
    setАктивный(userId);
    setПоказатьПереписку(true);
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
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: активный, text: значение }),
    }).catch(() => setТекст(значение));
    подтянуть();
  }

  const всегоНепрочитанных = ветки.reduce((s, t) => s + t.unreadForStaff, 0);

  return (
    <div className="flex h-full flex-col p-4 sm:p-7">
      <PageHeader
        title="Чат поддержки"
        subtitle={
          загрузка
            ? "Загружаем…"
            : `${ветки.length} ${ветки.length === 1 ? "переписка" : "переписок"}` +
              (всегоНепрочитанных ? ` · ${всегоНепрочитанных} новых` : "")
        }
      />

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
          Обращений пока нет. Они появятся здесь, когда турист напишет из приложения — вкладка
          «Поддержка» в профиле.
        </div>
      )}

      {ветки.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          {/* Список переписок */}
          <div
            className="min-h-0 shrink-0 overflow-y-auto rounded-lg lg:w-72"
            style={{
              display: narrow && показатьПереписку ? "none" : undefined,
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
            }}
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
                    <span className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
                      {t.name}
                    </span>
                    {t.unreadForStaff > 0 && <Badge label={String(t.unreadForStaff)} color="rose" />}
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
            style={{
              display: narrow && !показатьПереписку ? "none" : undefined,
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
            }}
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
                    <button onClick={() => setПоказатьПереписку(false)} style={{ color: "var(--color-muted)" }}>
                      ‹
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
                      {ветка.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--color-muted)" }}>
                      {ветка.email}
                      {ветка.country ? ` · ${ветка.country}` : ""}
                    </p>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                  {ветка.messages.map((m) => {
                    const оператор = m.author === "staff";
                    return (
                      <div key={m.id} className={`flex ${оператор ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                          style={{
                            background: оператор ? "var(--color-amber)" : "var(--color-bg)",
                            color: оператор ? "#0d0c0a" : "var(--color-text)",
                          }}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          <p className="mt-1 text-[10px] opacity-70">{время(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={низ} />
                </div>

                <form
                  onSubmit={ответить}
                  className="flex shrink-0 flex-wrap items-center gap-2 border-t p-3"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <input
                    value={текст}
                    onChange={(e) => setТекст(e.target.value)}
                    placeholder="Ответ туристу"
                    maxLength={2000}
                    className="min-w-0 flex-1 rounded px-3 py-2 text-sm outline-none"
                    style={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <Btn small>Отправить</Btn>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
