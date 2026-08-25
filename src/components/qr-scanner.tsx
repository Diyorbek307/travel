"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./icon";

/**
 * Сканер QR-кодов (п. 5 ТЗ).
 *
 * Библиотека html5-qrcode работает с getUserMedia, поэтому требует HTTPS
 * (или localhost) и явного разрешения пользователя. Если камера недоступна,
 * оставляем ручной ввод кода — таблички подписаны человекочитаемым
 * идентификатором вида REG-01 именно для этого случая.
 */
export default function QrScanner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    return () => {
      // Камеру обязательно отпускаем при уходе со страницы.
      scannerRef.current?.stop().catch(() => undefined);
    };
  }, []);

  function handleResult(text: string) {
    scannerRef.current?.stop().catch(() => undefined);
    setScanning(false);

    // QR содержит полный URL вида https://домен/s/REG-01 — берём последний сегмент.
    const code = extractCode(text);
    if (!code) {
      setError("Это не код нашей платформы.");
      return;
    }
    router.push(`/s/${encodeURIComponent(code)}`);
  }

  async function start() {
    setError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!containerRef.current) return;

      const scanner = new Html5Qrcode(containerRef.current.id);
      scannerRef.current = scanner as unknown as typeof scannerRef.current;
      setScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleResult(decoded),
        () => {
          // Кадры без кода приходят постоянно — это не ошибка.
        },
      );
    } catch {
      setScanning(false);
      setError(
        "Не удалось включить камеру. Нужен доступ к камере и защищённое соединение (https). Введите код с таблички вручную.",
      );
    }
  }

  async function stop() {
    await scannerRef.current?.stop().catch(() => undefined);
    setScanning(false);
  }

  return (
    <div>
      <div
        id="qr-reader"
        ref={containerRef}
        className="mb-3 aspect-square w-full overflow-hidden rounded-xl bg-soft"
      />

      <button
        onClick={scanning ? stop : start}
        className="w-full rounded-lg px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--primary)" }}
      >
        {scanning ? "Остановить" : <><Icon name="qr" size={18} className="mr-1.5 inline align-[-3px]" />Включить камеру</>}
      </button>

      {error && <p className="mt-3 text-sm soft">{error}</p>}

      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          const code = manual.trim();
          if (code) router.push(`/s/${encodeURIComponent(code.toUpperCase())}`);
        }}
      >
        <label className="mb-1 block text-sm soft" htmlFor="manual-code">
          Или введите код, написанный под QR-символом:
        </label>
        <div className="flex gap-2">
          <input
            id="manual-code"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="SMR-01"
            className="flex-1 rounded-lg px-3 py-2 uppercase surface"
            style={{ color: "var(--text)" }}
            autoCapitalize="characters"
          />
          <button type="submit" className="rounded-lg px-4 py-2 font-medium surface">
            Открыть
          </button>
        </div>
      </form>
    </div>
  );
}

/** Достаёт код из полного URL или принимает уже готовый код. */
function extractCode(text: string): string | null {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/s\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]).toUpperCase() : null;
  } catch {
    // Не URL — возможно, в коде записан сам идентификатор.
    return /^[A-Za-z0-9-]{3,32}$/.test(trimmed) ? trimmed.toUpperCase() : null;
  }
}
