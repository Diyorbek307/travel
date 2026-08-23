"use client";

import { useActionState } from "react";
import { login, type ActionResult } from "@/app/admin/actions";

/** Вход в админ-панель. */
export default function AdminLogin() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(login, null);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form action={formAction} className="w-full max-w-sm rounded-xl p-6 surface">
        <h1 className="mb-1 text-lg font-semibold">Админ-панель</h1>
        <p className="mb-4 text-sm soft">Единая туристическая платформа Узбекистана</p>

        <label className="mb-1 block text-sm" htmlFor="password">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mb-3 w-full rounded-lg px-3 py-2"
          style={{ background: "var(--bg-soft)", color: "var(--text)", border: "1px solid var(--border)" }}
        />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg px-4 py-2.5 font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {pending ? "Проверяю…" : "Войти"}
        </button>

        {state && !state.ok && <p className="mt-3 text-sm text-red-500">{state.message}</p>}

        <p className="mt-4 text-xs leading-relaxed soft">
          Пароль по умолчанию — <code>admin</code>. Он задаётся переменной{" "}
          <code>ADMIN_PASSWORD</code>. Для продакшена этого недостаточно: нужны
          отдельные учётные записи редакторов, роли и журнал изменений.
        </p>
      </form>
    </div>
  );
}
