"use client";

import { useState } from "react";
import { GOLD, GREEN, TEXT, WHITE } from "@/lib/theme";

/**
 * Смена пароля по одноразовой ссылке.
 *
 * Токен живёт час и гаснет после первого применения. Старая ссылка
 * перестаёт работать, как только запрошена новая.
 */
export default function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [повтор, setПовтор] = useState("");
  const [готово, setГотово] = useState(false);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const [идёт, setИдёт] = useState(false);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setОшибка(null);

    if (password !== повтор) {
      setОшибка("Пароли не совпадают");
      return;
    }

    setИдёт(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setОшибка(
          data.error === "password_short"
            ? "Пароль короче восьми символов"
            : "Ссылка недействительна или уже использована",
        );
        return;
      }
      setГотово(true);
    } catch {
      setОшибка("Нет связи с сервером");
    } finally {
      setИдёт(false);
    }
  }

  const поле: React.CSSProperties = {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: WHITE,
  };

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: `linear-gradient(160deg, ${GREEN} 0%, #14402c 100%)` }}
    >
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-white" style={{ fontFamily: "'Fraunces',serif" }}>
          Новый пароль
        </h1>

        {готово ? (
          <>
            <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              Пароль изменён. Войдите с ним в приложении.
            </p>
            <a
              href="/"
              className="block rounded-2xl py-4 text-center text-base font-bold"
              style={{ background: GOLD, color: TEXT }}
            >
              Открыть приложение
            </a>
          </>
        ) : (
          <>
            <p className="mb-7 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Придумайте пароль не короче восьми символов
            </p>
            <form onSubmit={отправить} className="flex flex-col gap-3">
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={поле}
              />
              <input
                required
                type="password"
                autoComplete="new-password"
                placeholder="Ещё раз"
                value={повтор}
                onChange={(e) => setПовтор(e.target.value)}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={поле}
              />

              {ошибка && (
                <p className="text-sm" style={{ color: "#ffb4a2" }}>
                  {ошибка}
                </p>
              )}

              <button
                type="submit"
                disabled={идёт || !token}
                className="mt-2 rounded-2xl py-4 text-base font-bold disabled:opacity-60"
                style={{ background: GOLD, color: TEXT }}
              >
                {идёт ? "Меняем…" : "Сменить пароль"}
              </button>

              {!token && (
                <p className="text-sm" style={{ color: "#ffb4a2" }}>
                  Ссылка неполная — откройте её целиком из письма поддержки.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </main>
  );
}
