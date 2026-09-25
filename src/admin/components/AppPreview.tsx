"use client";

import { useRef, useState } from "react";
import { PageHeader } from "./shared";

/**
 * Превью приложения.
 *
 * Раньше здесь был нарисованный от руки макет телефона: он остался от
 * первых эскизов, показывал старое название «Откройте Узбекистан», иные
 * категории и разделы, которых в приложении нет. Подпись при этом
 * обещала «живой предпросмотр» — то есть экран показывал не приложение,
 * а воспоминание о нём.
 *
 * Теперь в рамке телефона открыто само приложение. Это и правда живой
 * предпросмотр: правки в панели видны здесь ровно так, как их увидит
 * турист, и поддерживать отдельный макет больше не нужно.
 *
 * Рядом был блок «Статистика приложения» — загрузки, рейтинг в сторах,
 * доля сессий без сбоев. Ни одного из этих чисел взять неоткуда:
 * приложения в сторах нет, аналитики сбоев тоже. Блок убран.
 */

/** Ширина и высота экрана телефона в рамке, в пикселях. */
const ЭКРАН = { ш: 375, в: 760 };

export default function AppPreview() {
  const рамка = useRef<HTMLIFrameElement>(null);
  const [ключ, setКлюч] = useState(0);
  const [тема, setТема] = useState<"светлая" | "тёмная">("тёмная");

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Превью приложения"
        subtitle="Само приложение, открытое в рамке телефона: правки в панели видны здесь сразу"
        action={
          <>
            <button
              onClick={() => setТема((т) => (т === "тёмная" ? "светлая" : "тёмная"))}
              className="cursor-pointer rounded px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {тема === "тёмная" ? "☾ Тёмная" : "☀ Светлая"}
            </button>
            <button
              onClick={() => setКлюч((k) => k + 1)}
              className="cursor-pointer rounded px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--color-amber)", color: "var(--color-on-accent)" }}
            >
              ⟳ Обновить
            </button>
          </>
        }
      />

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div
          className="shrink-0 rounded-[36px] p-3"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
          }}
        >
          <iframe
            key={`${ключ}-${тема}`}
            ref={рамка}
            src={`/?preview=${тема === "тёмная" ? "dark" : "light"}`}
            title="Приложение HelloUZ"
            className="block rounded-[26px] border-0"
            style={{
              width: ЭКРАН.ш,
              height: ЭКРАН.в,
              maxWidth: "100%",
              // Тему внутри рамки задаёт сама страница по этому параметру:
              // достучаться до её оформления снаружи нельзя, это другой
              // документ.
              colorScheme: тема === "тёмная" ? "dark" : "light",
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div
            className="rounded-lg p-4"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
          >
            <div
              className="mb-3 text-xs font-medium uppercase tracking-widest"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
            >
              Что здесь видно
            </div>
            <ul className="flex flex-col gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
              <li>
                <span style={{ color: "var(--color-amber)" }}>◈</span> Города, места, отели,
                рестораны и реклама — те самые, что заведены в разделах панели.
              </li>
              <li>
                <span style={{ color: "var(--color-teal)" }}>↑</span> После правки нажмите
                «Обновить» — приложение перечитает содержимое.
              </li>
              <li>
                <span style={{ color: "var(--color-amber)" }}>☾</span> Переключатель темы
                показывает, как приложение выглядит у человека со светлой и с тёмной настройкой
                телефона.
              </li>
            </ul>
          </div>

          <div
            className="rounded-lg p-4 text-xs leading-relaxed"
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            Это настоящая страница приложения, а не картинка: по ней можно кликать. Вход и
            регистрация внутри рамки работают как обычно — превью открывает приложение от имени
            гостя.
          </div>
        </div>
      </div>
    </div>
  );
}
