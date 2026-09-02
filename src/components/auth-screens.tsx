"use client";

import { useRef, useState } from "react";
import { CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import type { PublicUser } from "@/lib/types";

/**
 * Регистрация и вход.
 *
 * Паспортных данных здесь нет намеренно: приложение ими не пользуется, а
 * собирать документы — значит взять на себя обязательства по их
 * хранению, которых можно избежать, просто не спрашивая.
 *
 * Пароль уходит на сервер и там превращается в хеш; на устройстве он не
 * остаётся. Ошибка входа одна на все случаи — иначе форма подсказывала
 * бы, какие адреса у нас зарегистрированы.
 */

/** Ошибки сервера на понятном языке. */
const ОШИБКИ: Record<string, string> = {
  email_invalid: "Проверьте адрес почты",
  password_short: "Пароль короче восьми символов",
  first_name_required: "Введите имя",
  last_name_required: "Введите фамилию",
  email_taken: "На этот адрес уже есть аккаунт",
  photo_too_large: "Фотография слишком большая — выберите другую",
  invalid_credentials: "Неверная почта или пароль",
};

function поле(): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: WHITE,
  };
}

function Обёртка({
  заголовок,
  подпись,
  onBack,
  children,
}: {
  заголовок: string;
  подпись: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-12"
      style={{ background: `linear-gradient(160deg, ${GREEN} 0%, #14402c 100%)` }}
    >
      <button
        onClick={onBack}
        className="mb-6 self-start text-sm"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        ← Назад
      </button>

      <h1
        className="mb-1 text-2xl font-bold text-white"
        style={{ fontFamily: "'Fraunces',serif" }}
      >
        {заголовок}
      </h1>
      <p className="mb-7 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
        {подпись}
      </p>

      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Регистрация                                                        */
/* ------------------------------------------------------------------ */

export function RegisterScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (user: PublicUser) => void;
}) {
  const [форма, setФорма] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phone: "",
  });
  const [фото, setФото] = useState<string | null>(null);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const [идёт, setИдёт] = useState(false);
  const файл = useRef<HTMLInputElement>(null);

  const менять = (k: keyof typeof форма) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setФорма((p) => ({ ...p, [k]: e.target.value }));

  /** Уменьшаем снимок до 320 пикселей: запись хранится в JSON. */
  function выбратьФото(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const сторона = 320;
        const c = document.createElement("canvas");
        c.width = c.height = сторона;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, сторона, сторона);
        setФото(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  }

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setОшибка(null);
    setИдёт(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...форма, photo: фото }),
      });
      const data = await res.json();
      if (!res.ok) {
        setОшибка(ОШИБКИ[data.error] ?? "Не получилось зарегистрироваться");
        return;
      }
      onDone(data.user);
    } catch {
      setОшибка("Нет связи с сервером");
    } finally {
      setИдёт(false);
    }
  }

  return (
    <Обёртка заголовок="Создать аккаунт" подпись="Чтобы сохранять маршруты и избранное" onBack={onBack}>
      <form onSubmit={отправить} className="flex flex-col gap-3">
        {/* Фотография */}
        <button
          type="button"
          onClick={() => файл.current?.click()}
          className="mx-auto mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px dashed rgba(255,255,255,0.4)" }}
        >
          {фото ? (
            <img src={фото} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
              Фото
            </span>
          )}
        </button>
        <input ref={файл} type="file" accept="image/*" hidden onChange={выбратьФото} />

        <div className="flex flex-wrap gap-3">
          <input
            required
            placeholder="Имя"
            value={форма.firstName}
            onChange={менять("firstName")}
            className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={поле()}
          />
          <input
            required
            placeholder="Фамилия"
            value={форма.lastName}
            onChange={менять("lastName")}
            className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={поле()}
          />
        </div>

        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Почта"
          value={форма.email}
          onChange={менять("email")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Пароль — не короче восьми символов"
          value={форма.password}
          onChange={менять("password")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          placeholder="Страна (необязательно)"
          value={форма.country}
          onChange={менять("country")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          placeholder="Телефон (необязательно)"
          value={форма.phone}
          onChange={менять("phone")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />

        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          Паспортные данные не запрашиваются и не хранятся.
        </p>

        {ошибка && (
          <p className="text-sm" style={{ color: "#ffb4a2" }}>
            {ошибка}
          </p>
        )}

        <button
          type="submit"
          disabled={идёт}
          className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? "Создаём…" : "Создать аккаунт"}
        </button>
      </form>
    </Обёртка>
  );
}

/* ------------------------------------------------------------------ */
/* Вход                                                               */
/* ------------------------------------------------------------------ */

export function LoginScreen({
  onBack,
  onDone,
  onRegister,
}: {
  onBack: () => void;
  onDone: (user: PublicUser) => void;
  onRegister: () => void;
}) {
  const [забыл, setЗабыл] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ошибка, setОшибка] = useState<string | null>(null);
  const [идёт, setИдёт] = useState(false);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setОшибка(null);
    setИдёт(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setОшибка(ОШИБКИ[data.error] ?? "Не получилось войти");
        return;
      }
      onDone(data.user);
    } catch {
      setОшибка("Нет связи с сервером");
    } finally {
      setИдёт(false);
    }
  }

  if (забыл) {
    return <ForgotScreen onBack={() => setЗабыл(false)} email={email} />;
  }

  return (
    <Обёртка заголовок="Вход" подпись="Аккаунт уже есть — введите почту и пароль" onBack={onBack}>
      <form onSubmit={отправить} className="flex flex-col gap-3">
        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          required
          type="password"
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />

        {ошибка && (
          <p className="text-sm" style={{ color: "#ffb4a2" }}>
            {ошибка}
          </p>
        )}

        <button
          type="submit"
          disabled={идёт}
          className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? "Входим…" : "Войти"}
        </button>

        <button
          type="button"
          onClick={() => setЗабыл(true)}
          className="py-1 text-sm"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Забыли пароль?
        </button>

        <button
          type="button"
          onClick={onRegister}
          className="py-1 text-sm"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Нет аккаунта? Создать
        </button>
      </form>
    </Обёртка>
  );
}

/* ------------------------------------------------------------------ */
/* Забытый пароль                                                     */
/* ------------------------------------------------------------------ */

/**
 * Заявка на смену пароля.
 *
 * Ответ один на любой адрес — и на существующий, и на нет. Иначе форму
 * используют как справочник: перебирают почты и смотрят, где ответ
 * другой.
 */
function ForgotScreen({ onBack, email: начальный }: { onBack: () => void; email: string }) {
  const [email, setEmail] = useState(начальный);
  const [отправлено, setОтправлено] = useState(false);
  const [идёт, setИдёт] = useState(false);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setИдёт(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Молчим намеренно: подтверждение одно на все исходы.
    } finally {
      setИдёт(false);
      setОтправлено(true);
    }
  }

  if (отправлено) {
    return (
      <Обёртка заголовок="Заявка принята" подпись="" onBack={onBack}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          Если на этот адрес есть аккаунт, поддержка вышлет ссылку для смены пароля. Ссылка
          действует один час.
        </p>
      </Обёртка>
    );
  }

  return (
    <Обёртка
      заголовок="Забыли пароль?"
      подпись="Укажите почту — вышлем ссылку для смены"
      onBack={onBack}
    >
      <form onSubmit={отправить} className="flex flex-col gap-3">
        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <button
          type="submit"
          disabled={идёт}
          className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? "Отправляем…" : "Отправить заявку"}
        </button>
      </form>
    </Обёртка>
  );
}

/** Пока проверяем сессию, показываем спокойный фон, а не мигание экранов. */
export function AuthSplash() {
  return <div className="h-full w-full" style={{ background: CREAM }} aria-hidden />;
}

export const AUTH_MUTED = MUTED;
