import { мягко } from "@/lib/theme";
import { useCallback, useEffect, useState } from "react";
import { PageHeader, Badge, Btn, SectionTitle } from "./shared";
import { ROLE_META, ВСЕ_РОЛИ, type AdminRole } from "@/lib/admin-roles";

/**
 * Учётные записи сотрудников панели — настоящие, не образец.
 *
 * Читаются и пишутся через /api/admin/staff (домен «staff», доступен
 * только владельцу). Владелец заводит редакторов и поддержку, меняет их
 * роль, блокирует и удаляет; вход владельца по общему паролю из
 * переменной ADMIN_PASSWORD отдельной записи не имеет — о нём сказано
 * в подсказке ниже.
 */

interface Аккаунт {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  disabled: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

const ОШИБКИ: Record<string, string> = {
  username_taken: "Такой логин уже занят",
  username_reserved: "Логин admin закреплён за владельцем",
  bad_username: "Логин: латиница, цифры, точка/дефис, 3–32 знака",
  weak_password: "Пароль не короче 6 знаков",
  bad_role: "Неизвестная роль",
  not_found: "Запись не найдена",
};

function когда(iso: string | null): string {
  if (!iso) return "ещё не входил";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) +
    ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function инициалы(имя: string): string {
  const части = имя.trim().split(/\s+/).filter(Boolean);
  return (части.slice(0, 2).map((w) => w[0]).join("") || имя.slice(0, 2)).toUpperCase();
}

const РОЛЬ_ЦВЕТ: Record<AdminRole, "amber" | "teal" | "dim"> = {
  owner: "amber",
  editor: "teal",
  support: "dim",
};

export default function Staff() {
  const [список, setСписок] = useState<Аккаунт[]>([]);
  const [загрузка, setЗагрузка] = useState(true);
  const [выбран, setВыбран] = useState<string | null>(null);
  const [ошибка, setОшибка] = useState("");

  // Форма создания.
  const [нов, setНов] = useState({ username: "", name: "", password: "", role: "editor" as AdminRole });
  // Смена пароля выбранному.
  const [новыйПароль, setНовыйПароль] = useState("");

  const обновить = useCallback(async () => {
    setЗагрузка(true);
    try {
      const r = await fetch("/api/admin/staff");
      if (r.ok) {
        const d = (await r.json()) as { admins: Аккаунт[] };
        setСписок(d.admins);
      }
    } catch {
      /* сеть отвалилась — покажем пустой список, не роняем экран */
    } finally {
      setЗагрузка(false);
    }
  }, []);

  useEffect(() => {
    обновить();
  }, [обновить]);

  const выбранный = список.find((a) => a.id === выбран) ?? null;

  async function послать(body: Record<string, unknown>): Promise<boolean> {
    setОшибка("");
    try {
      const r = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setОшибка(ОШИБКИ[d.error ?? ""] ?? "Не получилось. Попробуйте ещё раз.");
        return false;
      }
      await обновить();
      return true;
    } catch {
      setОшибка("Нет связи с сервером.");
      return false;
    }
  }

  async function создать() {
    if (!нов.username.trim() || нов.password.length < 6) {
      setОшибка("Заполните логин и пароль (от 6 знаков).");
      return;
    }
    const ok = await послать({ action: "create", ...нов });
    if (ok) setНов({ username: "", name: "", password: "", role: "editor" });
  }

  async function сменитьРоль(id: string, role: AdminRole) {
    await послать({ action: "update", id, role });
  }

  async function переключитьБлок(a: Аккаунт) {
    await послать({ action: "update", id: a.id, disabled: !a.disabled });
  }

  async function задатьПароль(id: string) {
    if (новыйПароль.length < 6) {
      setОшибка("Пароль не короче 6 знаков.");
      return;
    }
    const ok = await послать({ action: "password", id, password: новыйПароль });
    if (ok) setНовыйПароль("");
  }

  async function удалить(id: string) {
    setОшибка("");
    try {
      const r = await fetch(`/api/admin/staff?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (r.ok) {
        setВыбран(null);
        await обновить();
      }
    } catch {
      setОшибка("Нет связи с сервером.");
    }
  }

  const поле = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    fontFamily: "var(--font-body)",
  } as const;

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Сотрудники"
        subtitle={загрузка ? "Загрузка…" : `${список.length} ${список.length === 1 ? "запись" : "записей"} · вход по логину и паролю`}
      />

      {/* Пояснение про владельца */}
      <div
        className="mb-6 flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
        style={{
          background: "color-mix(in srgb, var(--color-teal) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-teal) 30%, transparent)",
          color: "var(--color-text)",
        }}
      >
        <span className="text-base leading-none">◈</span>
        <span>
          <b>Владелец</b> входит без логина по общему паролю из переменной <code>ADMIN_PASSWORD</code> —
          это аварийный ключ, отдельной записи у него здесь нет. Ниже — именные учётные записи
          редакторов и поддержки: их роль решает, какие разделы им доступны.
        </span>
      </div>

      {ошибка && (
        <div
          className="mb-5 rounded-lg px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--color-rose) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-rose) 35%, transparent)",
            color: "var(--color-rose)",
          }}
        >
          {ошибка}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Список */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {список.length === 0 && !загрузка && (
            <div
              className="rounded-xl p-6 text-center text-sm"
              style={{ border: "1px dashed var(--color-border)", color: "var(--color-faint)" }}
            >
              Пока ни одной записи. Заведите первую справа.
            </div>
          )}
          {список.map((a) => (
            <div
              key={a.id}
              onClick={() => { setВыбран(a.id); setНовыйПароль(""); setОшибка(""); }}
              className="rounded-xl p-4 flex flex-wrap items-center gap-3 cursor-pointer transition-all"
              style={{
                background: выбран === a.id ? "var(--color-panel)" : "transparent",
                border: `1px solid ${выбран === a.id ? "var(--color-amber)" : "var(--color-border)"}`,
                opacity: a.disabled ? 0.55 : 1,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: мягко(ROLE_META[a.role].color, 20), color: ROLE_META[a.role].color }}
              >
                {инициалы(a.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{a.name}</span>
                  <Badge label={ROLE_META[a.role].label} color={РОЛЬ_ЦВЕТ[a.role]} />
                  {a.disabled && <Badge label="заблокирован" color="rose" />}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>@{a.username}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs" style={{ color: "var(--color-faint)" }}>{когда(a.lastSeenAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка: создание или карточка выбранного */}
        <div className="w-full shrink-0 lg:w-80">
          {выбранный ? (
            <div className="rounded-2xl p-5" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                  style={{ background: мягко(ROLE_META[выбранный.role].color, 20), color: ROLE_META[выбранный.role].color }}
                >
                  {инициалы(выбранный.name)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{выбранный.name}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>@{выбранный.username}</div>
                </div>
              </div>

              <SectionTitle>Роль</SectionTitle>
              <div className="flex flex-col gap-1.5 mb-5">
                {ВСЕ_РОЛИ.map((r) => {
                  const on = выбранный.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => !on && сменитьРоль(выбранный.id, r)}
                      className="text-left rounded-lg px-3 py-2 text-sm transition-all cursor-pointer"
                      style={{
                        background: on ? "color-mix(in srgb, " + ROLE_META[r].color + " 15%, transparent)" : "var(--color-surface)",
                        border: `1px solid ${on ? ROLE_META[r].color : "var(--color-border)"}`,
                      }}
                    >
                      <div className="font-medium" style={{ color: on ? ROLE_META[r].color : "var(--color-text)" }}>{ROLE_META[r].label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{ROLE_META[r].desc}</div>
                    </button>
                  );
                })}
              </div>

              <SectionTitle>Новый пароль</SectionTitle>
              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={новыйПароль}
                  onChange={(e) => setНовыйПароль(e.target.value)}
                  placeholder="от 6 знаков"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={поле}
                />
                <Btn small onClick={() => задатьПароль(выбранный.id)}>Задать</Btn>
              </div>

              <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                <Btn variant={выбранный.disabled ? "primary" : "ghost"} small onClick={() => переключитьБлок(выбранный)}>
                  {выбранный.disabled ? "Разблокировать" : "Заблокировать"}
                </Btn>
                <Btn variant="danger" small onClick={() => удалить(выбранный.id)}>Удалить</Btn>
                <Btn variant="ghost" small onClick={() => setВыбран(null)}>Закрыть</Btn>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-5" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
              <SectionTitle>Новый сотрудник</SectionTitle>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ИМЯ</label>
                  <input type="text" value={нов.name} onChange={(e) => setНов((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Камола Ташкентова" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={поле} />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ЛОГИН</label>
                  <input type="text" value={нов.username} autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    onChange={(e) => setНов((p) => ({ ...p, username: e.target.value }))}
                    placeholder="kamola" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={поле} />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ПАРОЛЬ</label>
                  <input type="text" value={нов.password} onChange={(e) => setНов((p) => ({ ...p, password: e.target.value }))}
                    placeholder="от 6 знаков" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={поле} />
                </div>
                <div>
                  <label className="text-xs block mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>РОЛЬ</label>
                  <div className="flex flex-col gap-1.5">
                    {ВСЕ_РОЛИ.map((r) => {
                      const on = нов.role === r;
                      return (
                        <button key={r} onClick={() => setНов((p) => ({ ...p, role: r }))}
                          className="text-left rounded-lg px-3 py-2 text-sm transition-all cursor-pointer"
                          style={{
                            background: on ? "color-mix(in srgb, " + ROLE_META[r].color + " 15%, transparent)" : "var(--color-surface)",
                            border: `1px solid ${on ? ROLE_META[r].color : "var(--color-border)"}`,
                          }}
                        >
                          <div className="font-medium" style={{ color: on ? ROLE_META[r].color : "var(--color-text)" }}>{ROLE_META[r].label}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{ROLE_META[r].desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Btn onClick={создать}>Завести запись</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
