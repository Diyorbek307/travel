"use client";

import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";

import { useEffect, useRef, useState } from "react";
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
const ОШИБКИ: Record<string, TKey> = {
  email_invalid: "e_email_invalid",
  password_short: "e_pw_short",
  first_name_required: "e_first_req",
  last_name_required: "e_last_req",
  email_taken: "e_email_taken",
  photo_too_large: "e_photo_large",
  invalid_credentials: "e_bad_creds",
  code_wrong: "e_code_wrong",
  code_expired: "e_code_expired",
  code_none: "e_code_none",
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
  const { t } = useT();
  return (
    <div
      className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-12"
      style={{ background: `linear-gradient(160deg, ${GREEN} 0%, #14402c 100%)` }}
    >
      {/*
        Колонка ограниченной ширины. Поле ввода во весь ноутбук выглядит
        не как форма, а как ошибка вёрстки: глаз не связывает подпись
        слева с полем, уехавшим на метр вправо.
      */}
      <div className="mx-auto flex w-full max-w-md flex-col">
      <button
        onClick={onBack}
        className="mb-6 self-start text-sm"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        ← {t("common_back")}
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
  const { t } = useT();
  const [ждётКод, setЖдётКод] = useState<{ email: string; почтаНастроена: boolean; пауза: number } | null>(null);
  const [форма, setФорма] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phone: "",
  });
  const [фото, setФото] = useState<string | null>(null);
  const [ошибка, setОшибка] = useState<TKey | null>(null);
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
        setОшибка(ОШИБКИ[data.error] ?? "err_reg_failed");
        return;
      }
      // Сессии ещё нет: сперва подтверждение почты кодом из письма.
      setЖдётКод({
        email: форма.email.trim().toLowerCase(),
        почтаНастроена: data.mailSent === true,
        пауза: Number(data.waitSeconds) || 30,
      });
    } catch {
      setОшибка("err_network");
    } finally {
      setИдёт(false);
    }
  }

  if (ждётКод) {
    return (
      <VerifyScreen
        email={ждётКод.email}
        письмоУшло={ждётКод.почтаНастроена}
        пауза={ждётКод.пауза}
        onBack={() => setЖдётКод(null)}
        onDone={onDone}
      />
    );
  }

  return (
    <Обёртка заголовок={t("reg_title")} подпись={t("reg_sub")} onBack={onBack}>
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
              {t("reg_photo")}
            </span>
          )}
        </button>
        <input ref={файл} type="file" accept="image/*" hidden onChange={выбратьФото} />

        <div className="flex flex-wrap gap-3">
          <input
            required
            placeholder={t("reg_first")}
            value={форма.firstName}
            onChange={менять("firstName")}
            className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={поле()}
          />
          <input
            required
            placeholder={t("reg_last")}
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
          placeholder={t("reg_email")}
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
          placeholder={t("reg_pw_ph")}
          value={форма.password}
          onChange={менять("password")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          placeholder={t("reg_country_ph")}
          value={форма.country}
          onChange={менять("country")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          placeholder={t("reg_phone_ph")}
          value={форма.phone}
          onChange={менять("phone")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />

        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          {t("reg_no_passport")}
        </p>

        {ошибка && (
          <p className="text-sm" style={{ color: "#ffb4a2" }}>
            {t(ошибка)}
          </p>
        )}

        <button
          type="submit"
          disabled={идёт}
          className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? t("reg_submitting") : t("reg_title")}
        </button>
      </form>
    </Обёртка>
  );
}

/* ------------------------------------------------------------------ */
/* Подтверждение почты                                                */
/* ------------------------------------------------------------------ */

/**
 * Шесть цифр из письма.
 *
 * Код, а не ссылка: приложение ставится как PWA, и ссылка открылась бы в
 * браузере по умолчанию — другая сессия, и человек вернулся бы не туда.
 * Цифры он вводит, не покидая приложение.
 */
export function VerifyScreen({
  email,
  письмоУшло,
  пауза = 30,
  onBack,
  onDone,
}: {
  email: string;
  письмоУшло: boolean;
  /** Сколько секунд до следующего письма — приходит с сервера. */
  пауза?: number;
  onBack: () => void;
  onDone: (user: PublicUser) => void;
}) {
  const { t } = useT();
  const [code, setCode] = useState("");
  const [ошибка, setОшибка] = useState<TKey | null>(null);
  const [идёт, setИдёт] = useState(false);
  const [осталось, setОсталось] = useState(пауза);

  // Обратный отсчёт до следующей отправки. Пауза растёт с каждым
  // запросом — сервер присылает новую вместе с ответом.
  useEffect(() => {
    if (осталось <= 0) return;
    const t = setInterval(() => setОсталось((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [осталось]);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setОшибка(null);
    setИдёт(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setОшибка(ОШИБКИ[data.error] ?? "err_verify_failed");
        return;
      }
      onDone(data.user);
    } catch {
      setОшибка("err_network");
    } finally {
      setИдёт(false);
    }
  }

  async function заново() {
    setОшибка(null);
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      // И при успехе, и при «рано» сервер говорит, сколько ещё ждать.
      setОсталось(Number(data.waitSeconds) || 30);
      if (!res.ok && data.error !== "too_soon") {
        setОшибка("err_send_failed");
      }
    } catch {
      setОшибка("err_network");
    }
  }

  return (
    <Обёртка
      заголовок={t("verify_title")}
      подпись={`${t("verify_sent_to")} ${email}`}
      onBack={onBack}
    >
      <form onSubmit={отправить} className="flex flex-col gap-3">
        <input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] outline-none"
          style={поле()}
        />

        {!письмоУшло && (
          <p className="text-xs leading-relaxed" style={{ color: "#ffd9a0" }}>
            {t("verify_no_mail")}
          </p>
        )}

        {ошибка && (
          <p className="text-sm" style={{ color: "#ffb4a2" }}>
            {t(ошибка)}
          </p>
        )}

        <button
          type="submit"
          disabled={идёт || code.length !== 6}
          className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? t("verify_checking") : t("verify_submit")}
        </button>

        <button
          type="button"
          onClick={заново}
          disabled={осталось > 0}
          className="py-2 text-sm disabled:opacity-50"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {осталось > 0
            ? t("verify_resend_in").replace("{n}", String(осталось))
            : t("verify_resend")}
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
  const { t } = useT();
  const [забыл, setЗабыл] = useState(false);
  const [ждётКод, setЖдётКод] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ошибка, setОшибка] = useState<TKey | null>(null);
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
        // Почта не подтверждена — сервер уже выслал новый код.
        if (data.error === "not_verified") {
          setЖдётКод(true);
          return;
        }
        setОшибка(ОШИБКИ[data.error] ?? "err_login_failed");
        return;
      }
      onDone(data.user);
    } catch {
      setОшибка("err_network");
    } finally {
      setИдёт(false);
    }
  }

  if (ждётКод) {
    return (
      <VerifyScreen
        email={email.trim().toLowerCase()}
        письмоУшло
        onBack={() => setЖдётКод(false)}
        onDone={onDone}
      />
    );
  }

  if (забыл) {
    return <ForgotScreen onBack={() => setЗабыл(false)} email={email} />;
  }

  return (
    <Обёртка заголовок={t("login_title")} подпись={t("login_sub")} onBack={onBack}>
      <form onSubmit={отправить} className="flex flex-col gap-3">
        <input
          required
          type="email"
          autoComplete="email"
          placeholder={t("reg_email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />
        <input
          required
          type="password"
          autoComplete="current-password"
          placeholder={t("reg_password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={поле()}
        />

        {ошибка && (
          <p className="text-sm" style={{ color: "#ffb4a2" }}>
            {t(ошибка)}
          </p>
        )}

        <button
          type="submit"
          disabled={идёт}
          className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
          style={{ background: GOLD, color: TEXT }}
        >
          {идёт ? t("login_submitting") : t("login_submit")}
        </button>

        <button
          type="button"
          onClick={() => setЗабыл(true)}
          className="py-1 text-sm"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {t("login_forgot")}
        </button>

        <button
          type="button"
          onClick={onRegister}
          className="py-1 text-sm"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {t("login_no_account")}
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
  const { t } = useT();
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
      <Обёртка заголовок={t("reset_sent_title")} подпись="" onBack={onBack}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          {t("reset_sent_body")}
        </p>
      </Обёртка>
    );
  }

  return (
    <Обёртка
      заголовок={t("forgot_title")}
      подпись={t("forgot_sub")}
      onBack={onBack}
    >
      <form onSubmit={отправить} className="flex flex-col gap-3">
        <input
          required
          type="email"
          autoComplete="email"
          placeholder={t("reg_email")}
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
          {идёт ? t("reset_submitting") : t("reset_submit")}
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
