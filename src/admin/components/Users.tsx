import { useEffect, useState } from "react";
import { PageHeader, Badge, Btn, Table, StatCard } from "./shared";
import { useМеня } from "../context/MeContext";
import { можетДомен } from "@/lib/admin-roles";

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
  photoUrl: string | null;
  emailVerified?: boolean;
  premiumUntil?: string | null;
  createdAt: string;
  lastSeenAt: string;
};

/** Сигнал SOS: единственный источник координат туриста — по своей воле. */
type Sos = { id: string; userId: string | null; lat: number; lon: number; createdAt: string };

/** Три месяца без входа — по этому же сроку истекает сессия. */
const НЕАКТИВЕН_МС = 90 * 24 * 60 * 60 * 1000;

function дата(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" });
}

function датаВремя(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Reset = { token: string; email: string; expiresAt: string };
type Verify = { email: string; code: string; expiresAt: string };

function активен(u: User): boolean {
  return Date.now() - new Date(u.lastSeenAt).getTime() < НЕАКТИВЕН_МС;
}

function premium(u: User): boolean {
  return Boolean(u.premiumUntil && new Date(u.premiumUntil).getTime() > Date.now());
}

export default function Users() {
  const меня = useМеня();
  // Premium — выдача оплаченной услуги, её кнопки видит только владелец.
  const можноДеньги = меня ? можетДомен(меня.role, "money") : false;
  const [users, setUsers] = useState<User[]>([]);
  const [загрузка, setЗагрузка] = useState(true);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const [поиск, setПоиск] = useState("");
  const [фильтр, setФильтр] = useState<"all" | "active" | "dormant">("all");
  const [открыт, setОткрыт] = useState<User | null>(null);
  // Удаление необратимо, поэтому в два нажатия.
  const [точноУдалить, setТочноУдалить] = useState(false);
  const [premiumИдёт, setPremiumИдёт] = useState(false);
  const [заявки, setЗаявки] = useState<Reset[]>([]);
  const [скопирован, setСкопирован] = useState<string | null>(null);
  const [коды, setКоды] = useState<Verify[]>([]);
  const [почтаНастроена, setПочтаНастроена] = useState(true);
  const [почта, setПочта] = useState<{
    ok: boolean;
    detail: string;
    настройки?: { host: string; port: number; user: string; from: string };
  } | null>(null);
  const [проверяю, setПроверяю] = useState(false);
  const [кудаПробное, setКудаПробное] = useState("");
  const [пробноеИтог, setПробноеИтог] = useState<string | null>(null);
  const [сигналы, setСигналы] = useState<Sos[]>([]);

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

    // Сигналы SOS — единственные координаты туристов: приложение не следит
    // за ними в фоне, позицию присылает только сам человек.
    fetch("/api/sos")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: { alerts: Sos[] }) => setСигналы(d.alerts ?? []))
      .catch(() => setСигналы([]));
  }, []);

  /** Последний известный сигнал этого туриста — по нему его местоположение. */
  function последнееМесто(u: User): Sos | null {
    return сигналы.find((s) => s.userId === u.id) ?? null;
  }

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
    setПробноеИтог(d.ok ? "Письмо отправлено — проверьте ящик и папку «Спам»" : "Отправить не удалось");
  }

  function открыть(u: User | null) {
    setОткрыт(u);
    setТочноУдалить(false);
  }

  async function удалить(id: string) {
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return;
    setUsers((p) => p.filter((u) => u.id !== id));
    открыть(null);
  }

  /** Продлить Premium на месяцев (1 или 12) либо снять (0). */
  async function изменитьPremium(id: string, months: number) {
    setPremiumИдёт(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, months }),
      });
      if (!res.ok) return;
      const d = (await res.json()) as { user: User };
      setUsers((p) => p.map((u) => (u.id === id ? d.user : u)));
      setОткрыт(d.user);
    } finally {
      setPremiumИдёт(false);
    }
  }

  let список = users;
  if (фильтр === "active") список = список.filter(активен);
  if (фильтр === "dormant") список = список.filter((u) => !активен(u));
  if (поиск) {
    const q = поиск.toLowerCase();
    список = список.filter(
      (u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
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
        <StatCard label="С ФОТОГРАФИЕЙ" value={String(users.filter((u) => u.photoUrl).length)} />
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
          <>
            <p
              className="mb-2 text-sm leading-relaxed"
              style={{ color: почта.ok ? "var(--color-teal)" : "var(--color-rose)" }}
            >
              {почта.ok ? "✓ " : "✕ "}
              {почта.detail}
            </p>

            {/* Что задано на сервере прямо сейчас. Пароль не показываем. */}
            {почта.настройки && (
              <dl className="mb-3 grid gap-1 text-xs">
                {[
                  ["SMTP_HOST", почта.настройки.host],
                  ["SMTP_PORT", String(почта.настройки.port)],
                  ["SMTP_USER", почта.настройки.user],
                  ["MAIL_FROM", почта.настройки.from],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap justify-between gap-2">
                    <dt style={{ color: "var(--color-faint)", fontFamily: "var(--font-mono)" }}>{k}</dt>
                    <dd className="min-w-0 truncate" style={{ color: "var(--color-muted)" }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
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
            Письма не уходят. Задайте SMTP_HOST, SMTP_USER и SMTP_PASSWORD — и коды со ссылками начнут
            приходить сами. Пока их передаёт оператор.
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
            Почтовый сервис не подключён — передайте ссылку человеку сами. Она действует час и гаснет после
            первого применения.
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
          Пока никто не зарегистрировался. Записи появятся здесь, как только турист создаст аккаунт в
          приложении.
        </div>
      )}

      {список.length > 0 && (
        <Table
          cols={["ТУРИСТ", "ПОЧТА", "СТРАНА", "РЕГИСТРАЦИЯ", "БЫЛ В СЕТИ", ""]}
          rows={список.map((u) => [
            <span key="n" className="flex items-center gap-2.5">
              {u.photoUrl ? (
                <img src={u.photoUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
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
              {premium(u) && <Badge label="premium" color="amber" />}
            </span>,
            u.email,
            u.country || "—",
            дата(u.createdAt),
            <span key="s" className="flex items-center gap-2">
              {дата(u.lastSeenAt)}
              <Badge label={активен(u) ? "активен" : "спит"} color={активен(u) ? "teal" : "dim"} />
            </span>,
            <span key="a" className="flex gap-2">
              <Btn variant="ghost" small onClick={() => открыть(u)}>
                Открыть
              </Btn>
            </span>,
          ])}
        />
      )}

      {открыт && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="mb-4 flex items-center gap-3">
              {открыт.photoUrl ? (
                <img src={открыт.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
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
                ["Имя", `${открыт.firstName} ${открыт.lastName}`.trim() || "—"],
                ["Почта", открыт.email],
                ["Подтверждение", открыт.emailVerified ? "почта подтверждена ✓" : "не подтверждена"],
                ["Страна", открыт.country || "не указана"],
                ["Телефон", открыт.phone || "не указан"],
                ["Регистрация", дата(открыт.createdAt)],
                ["Был в сети", дата(открыт.lastSeenAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-2">
                  <dt style={{ color: "var(--color-muted)" }}>{k}</dt>
                  <dd className="min-w-0 text-right" style={{ color: "var(--color-text)" }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Местоположение. Честно: приложение не следит за туристами в
                фоне, координаты приходят только из сигнала SOS. */}
            {(() => {
              const м = последнееМесто(открыт);
              return (
                <div className="mb-4">
                  <p
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    Местоположение
                  </p>
                  {м ? (
                    <>
                      <p className="mb-2 text-xs" style={{ color: "var(--color-text)" }}>
                        Последний сигнал SOS · {датаВремя(м.createdAt)}
                        <br />
                        <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                          {м.lat.toFixed(5)}, {м.lon.toFixed(5)}
                        </span>
                      </p>
                      <div
                        className="overflow-hidden rounded-lg"
                        style={{ border: "1px solid var(--color-border)" }}
                      >
                        <iframe
                          title="Местоположение"
                          width="100%"
                          height="180"
                          style={{ border: 0, display: "block" }}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${м.lon - 0.02}%2C${
                            м.lat - 0.015
                          }%2C${м.lon + 0.02}%2C${м.lat + 0.015}&layer=mapnik&marker=${м.lat}%2C${м.lon}`}
                        />
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${м.lat}&mlon=${м.lon}#map=15/${м.lat}/${м.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-block text-xs"
                        style={{ color: "var(--color-amber)" }}
                      >
                        Открыть на карте →
                      </a>
                    </>
                  ) : (
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-faint)" }}>
                      Турист не передавал координаты. Приложение не отслеживает людей в фоне — местоположение
                      приходит только когда человек сам отправляет сигнал SOS.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Premium. Оплата проверяется глазами: владелец видит поступление
                в кабинете Payme/Click и продлевает срок здесь. */}
            <div className="mb-4">
              <p
                className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                Premium
              </p>
              <p
                className="mb-2 text-sm"
                style={{ color: premium(открыт) ? "var(--color-amber)" : "var(--color-muted)" }}
              >
                {premium(открыт) ? `Оплачен до ${дата(открыт.premiumUntil ?? "")}` : "Не оплачен"}
              </p>
              {можноДеньги ? (
                <div className="flex flex-wrap gap-2">
                  <Btn variant="ghost" small onClick={() => изменитьPremium(открыт.id, 1)}>
                    {premiumИдёт ? "…" : "+1 месяц"}
                  </Btn>
                  <Btn variant="ghost" small onClick={() => изменитьPremium(открыт.id, 12)}>
                    {premiumИдёт ? "…" : "+1 год"}
                  </Btn>
                  {premium(открыт) && (
                    <Btn variant="danger" small onClick={() => изменитьPremium(открыт.id, 0)}>
                      Снять
                    </Btn>
                  )}
                </div>
              ) : (
                <p className="text-xs" style={{ color: "var(--color-faint)" }}>
                  Выдаёт владелец, когда видит оплату.
                </p>
              )}
            </div>

            <p className="mb-4 text-xs" style={{ color: "var(--color-faint)" }}>
              Паспортные данные не собираются.
            </p>

            <div className="flex flex-wrap gap-2">
              <Btn variant="ghost" onClick={() => открыть(null)}>
                Закрыть
              </Btn>
              {точноУдалить ? (
                <Btn variant="danger" onClick={() => удалить(открыт.id)}>
                  Да, удалить навсегда
                </Btn>
              ) : (
                <Btn variant="danger" onClick={() => setТочноУдалить(true)}>
                  Удалить аккаунт
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
