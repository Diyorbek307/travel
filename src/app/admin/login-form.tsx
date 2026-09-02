"use client";

import { useActionState } from "react";
import { login } from "./actions";

/**
 * Экран входа.
 *
 * Оформлен в цветах панели, но нарочно скупо: это не часть макета, а
 * барьер перед ним.
 */
export default function LoginForm({ defaultPassword }: { defaultPassword: boolean }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <div
      className="admin-root flex items-center justify-center px-4"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <form action={action} className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{ background: "var(--color-amber)", color: "#0d0c0a" }}
          >
            UZ
          </span>
          <span>
            <span
              className="block text-base font-semibold leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Узбекистан
            </span>
            <span className="mt-1 block text-xs" style={{ color: "var(--color-muted)" }}>
              Админ-панель
            </span>
          </span>
        </div>

        <label
          htmlFor="password"
          className="mb-2 block text-xs uppercase tracking-widest"
          style={{ color: "var(--color-dim)" }}
        >
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="mb-3 w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />

        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-amber)", color: "#0d0c0a" }}
        >
          {pending ? "Проверяем…" : "Войти"}
        </button>

        {state && !state.ok && (
          <p className="mt-3 text-sm" style={{ color: "var(--color-rose)" }}>
            {state.message}
          </p>
        )}

        {defaultPassword && (
          <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Пароль по умолчанию — <code style={{ color: "var(--color-amber)" }}>admin</code>. Он
            задаётся переменной <code>ADMIN_PASSWORD</code>. Для продакшена этого мало: нужны
            отдельные учётные записи редакторов, роли и журнал изменений.
          </p>
        )}
      </form>
    </div>
  );
}
