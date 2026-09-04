"use client";

import { useEffect, useRef, useState } from "react";
import { BORDER, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";

/**
 * Сканер QR-кода.
 *
 * До этого на экране «Аудио» была кнопка «Сканировать код», которая
 * включала пульсирующую рамку и больше ничего не делала. Турист у
 * таблички наводил телефон и ждал.
 *
 * Здесь работает камера. Библиотека html5-qrcode давно лежала в
 * зависимостях проекта, но не была подключена ни в одном файле.
 *
 * Камера — это разрешение, которое спрашивают один раз в жизни
 * приложения. Поэтому просим её только когда человек сам нажал
 * «Сканировать», и честно показываем, что делать при отказе: в системных
 * настройках его придётся возвращать руками.
 */

export default function QrScanner({
  onКод,
  onClose,
}: {
  /** Что нашли в коде. Разбор адреса — забота вызывающего экрана. */
  onКод: (текст: string) => void;
  onClose: () => void;
}) {
  const узел = useRef<HTMLDivElement>(null);
  const { t } = useT();
  const [состояние, setСостояние] = useState<"пуск" | "идёт" | "отказ" | "нет-камеры">("пуск");

  useEffect(() => {
    let живо = true;
    // Тип библиотеки нужен только внутри — она грузится по требованию.
    let сканер: { stop: () => Promise<void>; clear: () => void } | null = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!живо || !узел.current) return;

        const камеры = await Html5Qrcode.getCameras().catch(() => []);
        if (!живо) return;
        if (!камеры.length) {
          setСостояние("нет-камеры");
          return;
        }

        const с = new Html5Qrcode(узел.current.id);
        сканер = с as unknown as { stop: () => Promise<void>; clear: () => void };

        await с.start(
          // Задняя камера: табличку снимают ею, а не селфи-камерой.
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (текст) => {
            if (!живо) return;
            живо = false;
            onКод(текст);
          },
          () => {
            // Кадр без кода — обычное дело, молчим.
          },
        );

        if (живо) setСостояние("идёт");
      } catch {
        if (живо) setСостояние("отказ");
      }
    })();

    return () => {
      живо = false;
      сканер?.stop().then(() => сканер?.clear()).catch(() => undefined);
    };
  }, [onКод]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="flex items-center justify-between px-4 pt-14 pb-3">
        <p className="text-sm font-bold text-white">{t("qr_aim")}</p>
        <button
          onClick={onClose}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.15)", color: WHITE }}
        >
          Закрыть
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div id="qr-области-камеры" ref={узел} className="w-full overflow-hidden rounded-2xl" />

          {состояние === "пуск" && (
            <p className="mt-4 text-center text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              Включаем камеру…
            </p>
          )}

          {состояние === "нет-камеры" && (
            <p className="mt-4 text-center text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Камеру на этом устройстве найти не удалось. Аудиогид можно выбрать
              из списка на экране.
            </p>
          )}

          {состояние === "отказ" && (
            <p className="mt-4 text-center text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Доступ к камере закрыт. Разрешение спрашивают один раз, поэтому
              вернуть его можно только в настройках браузера, в разделе прав
              этого сайта.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Рамка сканера в списке — та же кнопка, что была, но теперь рабочая. */
export function КнопкаСканера({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl"
      style={{ border: `2px dashed ${BORDER}`, background: WHITE }}
    >
      <div className="flex items-center gap-4 p-4">
        <div
          className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: GREEN + "12", border: `2px solid ${GREEN}30` }}
        >
          <div className="grid grid-cols-3 gap-0.5">
            {[1, 1, 0, 1, 0, 1, 0, 1, 1].map((v, i) => (
              <div key={i} className="h-3 w-3 rounded-sm" style={{ background: v ? GREEN : "transparent" }} />
            ))}
          </div>
        </div>
        <div className="min-w-0 text-left">
          <p className="text-sm font-bold" style={{ color: TEXT }}>
            Сканировать код
          </p>
          <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
            Наведите камеру на табличку — включится нужный аудиогид
          </p>
        </div>
      </div>
    </button>
  );
}
