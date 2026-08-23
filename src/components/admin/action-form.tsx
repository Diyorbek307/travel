"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/admin/actions";

/**
 * Обёртка над формой с серверным действием: показывает результат и блокирует
 * повторную отправку. Вынесена отдельно, чтобы страницы админки оставались
 * серверными компонентами и напрямую читали базу.
 */
export default function ActionForm({
  action,
  submitLabel,
  children,
  className = "",
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} className={className}>
      {children}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {pending ? "Сохраняю…" : submitLabel}
        </button>

        {state && (
          <span
            className="text-sm"
            style={{ color: state.ok ? "var(--accent)" : "#e11d48" }}
            role="status"
          >
            {state.ok ? "✓ " : "✕ "}
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
