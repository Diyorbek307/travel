import { useEffect, useState } from "react";
import { PageHeader, Badge, Btn, Table, StatCard } from "./shared";

/**
 * Туристы платформы.
 *
 * Список настоящий — читается из учётных записей, а не из выдуманного
 * массива. Поэтому здесь нет колонок «броней» и «потрачено»: этих данных
 * в записи нет, а рисовать правдоподобные числа в таблице, по которой
 * принимают решения, нельзя.
 *
 * Паспортных данных нет и не будет: приложение их не собирает.
 */

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone: string;
  photo: string | null;
  createdAt: string;
  lastSeenAt: string;
};

/** Три месяца без входа — по этому же сроку истекает сессия. */
const НЕАКТИВЕН_МС = 90 * 24 * 60 * 60 * 1000;

function дата(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" });
}

type Reset = { token: string; email: string; expiresAt: string };
type Verify = { email: string; code: string; expiresAt: string };

function активен(u: User): boolean {
  return Date.now() - new Date(u.lastSeenAt).getTime() < НЕАКТИВЕН_МС;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [загрузка, setЗагрузка] = useState(true);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const [поиск, setПоиск] = useState("");
  const [фильтр, setФильтр] = useState<"all" | "active" | "dormant">("all");
  const [открыт, setОткрыт] = useState<User | null>(null);
  const [заявки, setЗаявки] = useState<Reset[]>([]);
  const [скопирован, setСкопирован] = useState<string | null>(null);
  const [коды, setКоды] = useState<Verify[]>([]);
  const [почтаНастроена, setПочтаНастроена] = useState(true);
  const [почта, setПочта] = useState<{ ok: boolean; detail: string } | null>(null);
  const [проверяю, setПроверяю] = useState(false);
  const [кудаПробное, setКудаПробное] = useState("");
  const [пробноеИтог, setПробноеИтог] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Нет доступа"))))
      .then((d: { users: User[] }) => setUsers(d.users))
      .catch(() => setОшибка("Не удалось загрузить список"))
      .finally(() => setЗагрузка(false));

    // Заявки на смену пароля: почтового сервиса нет, ссылку передаёт
    // оператор.
    fetch("/api/admin/resets")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: { resets: Reset[]; verifications: Verify[]; mailConfigured: boolean }) => {
        setЗаявки(d.resets);
        setКоды(d.verifications);
        setПочтаНастроена(d.mailConfigured);
      })
      .catch(() => setЗаявки([]));
  }, []);

  async function проверитьПочту() {
    setПроверяю(true);
    setПробноеИтог(null);
    try {
      const res = await fetch("/api/admin/mail");
      setПочта(await res.json());
    } catch {
      setПочта({ ok: false, detail: "Сервер не ответил" });
    } finally {
      setПроверяю(false);
    }
  }

  async function отправитьПробное() {
    setПробноеИтог(null);
    const res = await fetch("/api/admin/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: кудаПробное }),
    });
    const d = await res.json();
    setПробноеИтог(
      d.ok ? "Письмо отправлено — проверьте ящик и папку «Спам»" : "Отправить не удалось",
    );
  }

  async function удалить(id: string) {
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return;
    setUsers((p) => p.filter((u) => u.id !== id));
    setОткрыт(null);
  }

  let список = users;
  if (фильтр === "active") список = список.filter(активен);
  if (фильтр === "dormant") список = список.filter((u) => !активен(u));
  if (поиск) {
    const q = поиск.toLowerCase();
    список = список.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }

  const ФИЛЬТРЫ: [typeof фильтр, string][] = [
    ["all", "Все"],
    ["active", "Активные"],
    ["dormant", "Давно не заходили"],
  ];

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Пользователи"
        subtitle={загрузка ? "Загружаем…" : `${users.length} зарегистрировано`}
      />

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ВСЕГО" value={String(users.length)} />
        <StatCard label="АКТИВНЫЕ" value={String(users.filter(активен).length)} sub="за 3 месяца" />
        <StatCard label="С ФОТОГРАФИЕЙ" value={String(users.filter((u) => u.photo).length)} />
        <StatCard label="СТРАН" value={String(new Set(users.map((u) => u.country).filter(Boolean)).size)} />
      </div>

      {/* Проверка почты: подключается и авторизуется, писем не шлёт. */}
      <div
        className="mb-4 rounded-lg p-4"
        style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <p className="min-w-0 flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Почтовый сервис
          </p>
          <Btn variant="ghost" small onClick={проверитьПочту}>
            {проверяю ? "Проверяем…" : "Проверить подключение"}
          </Btn>
        </div>

        {почта && (
          <p
            className="mb-3 text-sm leading-relaxed"
            style={{ color: почта.ok ? "var(--color-teal)" : "var(--color-rose)" }}
          >
            {почта.ok ? "✓ " : "✕ "}
            {почта.detail}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={кудаПробное}
            onChange={(e) => setКудаПробное(e.target.value)}
            placeholder="Куда отправить пробное письмо"
            className="min-w-0 flex-1 rounded px-3 py-1.5 text-sm outline-none"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          <Btn variant="ghost" small onClick={отправитьПробное}>
            Отправить пробное
          </Btn>
        </div>

        {пробноеИтог && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            {пробноеИтог}
          </p>
        )}
      </div>

      {!почтаНастроена && (коды.length > 0 || заявки.length > 0) && (
        <div
          className="mb-4 rounded-lg p-4"
          style={{ background: "var(--color-panel)", border: "1px solid var(--color-rose)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--color-rose)" }}>
            Почтовый сервис не подключён
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Письма не уходят. Задайте SMTP_HOST, SMTP_USER и SMTP_PASSWORD — и коды со ссылками
            начнут приходить сами. Пока их передаёт оператор.
          </p>
        </div>
      )}

      {коды.length > 0 && (
        <div
          className="mb-4 rounded-lg p-4"
          style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Коды подтверждения · {коды.length}
          </p>
          <ul className="grid gap-2">
            {коды.map((v) => (
              <li key={v.email} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate" style={{ color: "var(--color-muted)" }}>
                  {v.email}
                </span>
                <span
                  className="rounded px-2 py-0.5 font-mono text-base font-bold tracking-widest"
                  style={{ background: "var(--color-bg)", color: "var(--color-amber)" }}
                >
                  {v.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {заявки.length > 0 && (
        <div
          className="mb-6 rounded-lg p-4"
          style={{ background: "var(--color-panel)", border: "1px solid var(--color-amber)" }}
        >
          <p className="mb-1 text-sm font-medium" style={{ color: "var(--color-amber)" }}>
            Заявки на смену пароля · {заявки.length}
          </p>
          <p className="mb-3 text-xs" style={{ color: "var(--color-muted)" }}>
            Почтовый сервис не подключён — передайте ссылку человеку сами. Она действует час и
            гаснет после первого применения.
          </p>
          <ul className="grid gap-2">
            {заявки.map((r) => {
              const ссылка = `${location.origin}/reset?token=${r.token}`;
              return (
                <li key={r.token} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate" style={{ color: "var(--color-text)" }}>
                    {r.email}
                  </span>
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => {
                      navigator.clipboard?.writeText(ссылка);
                      setСкопирован(r.token);
                    }}
                  >
                    {скопирован === r.token ? "Скопировано" : "Копировать ссылку"}
                  </Btn>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {ФИЛЬТРЫ.map(([k, label]) => (
          <Btn key={k} variant={фильтр === k ? "primary" : "ghost"} small onClick={() => setФильтр(k)}>
            {label}
          </Btn>
        ))}
        <input
          value={поиск}
          onChange={(e) => setПоиск(e.target.value)}
          placeholder="Имя или почта"
          className="min-w-0 flex-1 rounded px-3 py-1.5 text-sm outline-none"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </div>

      {ошибка && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-rose)" }}>
          {ошибка}
        </p>
      )}

      {!загрузка && users.length === 0 && !ошибка && (
        <div
          className="rounded-lg p-8 text-center text-sm"
          style={{ background: "var(--color-panel)", color: "var(--color-muted)" }}
        >
          Пока никто не зарегистрировался. Записи появятся здесь, как только турист создаст аккаунт
          в приложении.
        </div>
      )}

      {список.length > 0 && (
        <Table
          cols={["ТУРИСТ", "ПОЧТА", "СТРАНА", "РЕГИСТРАЦИЯ", "БЫЛ В СЕТИ", ""]}
          rows={список.map((u) => [
            <span key="n" className="flex items-center gap-2.5">
              {u.photo ? (
                <img src={u.photo} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
              ) : (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                >
                  {u.firstName.slice(0, 1)}
                  {u.lastName.slice(0, 1)}
                </span>
              )}
              <span className="min-w-0 truncate">
                {u.firstName} {u.lastName}
              </span>
            </span>,
            u.email,
            u.country || "—",
            дата(u.createdAt),
            <span key="s" className="flex items-center gap-2">
              {дата(u.lastSeenAt)}
              <Badge label={активен(u) ? "активен" : "спит"} color={активен(u) ? "teal" : "dim"} />
            </span>,
            <span key="a" className="flex gap-2">
              <Btn variant="ghost" small onClick={() => setОткрыт(u)}>
                Открыть
              </Btn>
            </span>,
          ])}
        />
      )}

      {открыт && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="mb-4 flex items-center gap-3">
              {открыт.photo ? (
                <img src={открыт.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold"
                  style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                >
                  {открыт.firstName.slice(0, 1)}
                  {открыт.lastName.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium" style={{ color: "var(--color-text)" }}>
                  {открыт.firstName} {открыт.lastName}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--color-muted)" }}>
                  {открыт.email}
                </p>
              </div>
            </div>

            <dl className="mb-5 grid gap-2 text-sm">
              {[
                ["Страна", открыт.country || "не указана"],
                ["Телефон", открыт.phone || "не указан"],
                ["Регистрация", дата(открыт.createdAt)],
                ["Был в сети", дата(открыт.lastSeenAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-2">
                  <dt style={{ color: "var(--color-muted)" }}>{k}</dt>
                  <dd style={{ color: "var(--color-text)" }}>{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mb-4 text-xs" style={{ color: "var(--color-dim)" }}>
              Паспортные данные не собираются.
            </p>

            <div className="flex flex-wrap gap-2">
              <Btn variant="ghost" onClick={() => setОткрыт(null)}>
                Закрыть
              </Btn>
              <Btn variant="danger" onClick={() => удалить(открыт.id)}>
                Удалить аккаунт
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
