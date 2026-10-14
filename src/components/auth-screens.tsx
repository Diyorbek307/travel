"use client";

import { списокСтран } from "@/lib/countries";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { CREAM, WHITE } from "@/lib/theme";
import type { PublicUser } from "@/lib/types";
import { начатьВход, type Провайдер } from "@/lib/oauth-client";

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
  too_many: "e_too_many",
};

function поле(): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: WHITE,
  };
}

/** Главная кнопка экранов входа: золото перетекает в бирюзу, как крыло знака. */
const ГЛАВНАЯ_КНОПКА: React.CSSProperties = {
  background: "linear-gradient(120deg,var(--accent-2),var(--accent))",
  color: "#05100f",
  boxShadow: "0 8px 26px var(--accent-soft)",
};

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
      className="relative flex h-full flex-col overflow-y-auto px-6 pb-10 pt-12"
      // Тёмная сцена с бирюзовым отсветом, как на экране после
      // регистрации. Плоская заливка акцентом выглядела грязно: акцент
      // яркий, и во весь экран он давит.
      style={{ background: "linear-gradient(170deg,#0a1517 0%,#071011 55%,#050b0c 100%)" }}
    >
      {/* Отсвет вверху — чтобы экран не был глухой стеной. */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: "var(--accent)", filter: "blur(80px)", opacity: 0.42 }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-40 h-56 w-56 rounded-full"
        style={{ background: "var(--accent-2)", filter: "blur(100px)", opacity: 0.18 }}
      />
      {/*
        Колонка ограниченной ширины. Поле ввода во весь ноутбук выглядит
        не как форма, а как ошибка вёрстки: глаз не связывает подпись
        слева с полем, уехавшим на метр вправо.
      */}
      <div className="relative mx-auto flex w-full max-w-md flex-col">
        <button
          onClick={onBack}
          className="mb-6 self-start text-sm"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          ← {t("common_back")}
        </button>

        <h1 className="mb-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
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
/* Вход через Apple и Google                                          */
/* ------------------------------------------------------------------ */

const ОШИБКИ_ВХОДА: Record<string, TKey> = {
  cancelled: "oauth_err_cancelled",
  no_email: "oauth_err_no_email",
};

function ЗнакApple() {
  return (
    <svg viewBox="0 0 814 1000" width="17" height="20" aria-hidden fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

function ЗнакGoogle() {
  return (
    <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Кнопки «Продолжить с Apple / Google» — первыми на экране: это самый
 * быстрый путь, без пароля и без кода из письма. Ниже — разделитель
 * «или по почте» и обычная форма. Показываем только способы, для которых
 * на сервере заданы ключи.
 */
function ВходЧерез() {
  const { t } = useT();
  const [способы, setСпособы] = useState<{ google: boolean; apple: boolean } | null>(null);
  const [ошибка, setОшибка] = useState<TKey | null>(null);
  const [идёт, setИдёт] = useState<Провайдер | null>(null);

  useEffect(() => {
    fetch("/api/auth/oauth")
      .then((r) => r.json())
      .then(setСпособы)
      .catch(() => setСпособы({ google: false, apple: false }));
    const код = new URLSearchParams(window.location.search).get("oauth_error");
    if (код) setОшибка(ОШИБКИ_ВХОДА[код] ?? "oauth_err_generic");
  }, []);

  const нажать = (п: Провайдер) => {
    setИдёт(п);
    setОшибка(null);
    void начатьВход(п).finally(() => setTimeout(() => setИдёт(null), 1500));
  };
  const есть = способы && (способы.apple || способы.google);

  return (
    <>
      {ошибка && (
        <p
          className="mb-3 rounded-xl px-3 py-2 text-sm"
          style={{ background: "rgba(255,120,90,0.12)", color: "#ffb4a2" }}
        >
          {t(ошибка)}
        </p>
      )}
      {есть && (
        <div className="mb-5 flex flex-col gap-2.5">
          {способы.apple && (
            <button
              type="button"
              onClick={() => нажать("apple")}
              disabled={идёт !== null}
              className="relative flex h-[52px] items-center justify-center rounded-2xl text-[15px] font-semibold transition-transform active:scale-[0.98] disabled:opacity-70"
              style={{ background: "#fff", color: "#000", boxShadow: "0 6px 22px rgba(0,0,0,0.35)" }}
            >
              <span className="absolute left-5 flex items-center">
                <ЗнакApple />
              </span>
              {идёт === "apple" ? "…" : t("oauth_apple")}
            </button>
          )}
          {способы.google && (
            <button
              type="button"
              onClick={() => нажать("google")}
              disabled={идёт !== null}
              className="relative flex h-[52px] items-center justify-center rounded-2xl text-[15px] font-semibold transition-transform active:scale-[0.98] disabled:opacity-70"
              style={{ background: "#131314", color: "#e3e3e3", border: "1px solid #8e918f" }}
            >
              <span className="absolute left-5 flex items-center">
                <ЗнакGoogle />
              </span>
              {идёт === "google" ? "…" : t("oauth_google")}
            </button>
          )}
          <p className="mt-0.5 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            ⚡ {t("oauth_no_code")}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.14)" }} />
            {t("oauth_or")}
            <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.14)" }} />
          </div>
        </div>
      )}
    </>
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
  const { t, lang } = useT();
  const [ждётКод, setЖдётКод] = useState<{ email: string; почтаНастроена: boolean; пауза: number } | null>(
    null,
  );
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

  const менять = (k: keyof typeof форма) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
      // Почта не подключена: сервер уже подтвердил аккаунт и открыл
      // сессию, вернув самого пользователя. Показывать экран с кодом
      // тогда — тупик: письма нет, вводить нечего. Сразу входим.
      if (data.user) {
        onDone(data.user);
        return;
      }
      // Обычный путь: сессии ещё нет, ждём код из письма.
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
      <ВходЧерез />
      <form onSubmit={отправить} className="flex flex-col gap-3">
        {/* Фотография */}
        <button
          type="button"
          onClick={() => файл.current?.click()}
          className="mx-auto mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full"
          style={{ background: "var(--accent-soft)", border: "1px dashed var(--accent-border)" }}
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
        {/* Страна — из списка, кодом: ручной ввод давал «Germany» и
            «Deutschland» как две разные страны. */}
        <select
          value={форма.country}
          onChange={менять("country")}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={{ ...поле(), color: форма.country ? undefined : "var(--muted)" }}
        >
          <option value="">{t("reg_country_ph")}</option>
          {списокСтран(lang).map((с) => (
            <option key={с.код} value={с.код}>
              {с.имя}
            </option>
          ))}
        </select>
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
          style={ГЛАВНАЯ_КНОПКА}
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
    <Обёртка заголовок={t("verify_title")} подпись={`${t("verify_sent_to")} ${email}`} onBack={onBack}>
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
          style={ГЛАВНАЯ_КНОПКА}
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
          {осталось > 0 ? t("verify_resend_in").replace("{n}", String(осталось)) : t("verify_resend")}
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
      <ВходЧерез />
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
          style={ГЛАВНАЯ_КНОПКА}
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
    <Обёртка заголовок={t("forgot_title")} подпись={t("forgot_sub")} onBack={onBack}>
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
          style={ГЛАВНАЯ_КНОПКА}
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
