"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * SOS и помощь туристу (п. 15 ТЗ).
 *
 * Номера экстренных служб намеренно захардкожены и работают офлайн: страница
 * должна открываться, даже когда нет ни сети, ни загруженного города.
 * Контакты посольств, наоборот, заполняются через админ-панель — их слишком
 * много, они меняются, и придумывать их нельзя.
 */

const EMERGENCY = [
  { number: "112", label: "Единая служба спасения", icon: "🆘", note: "Работает без SIM-карты" },
  { number: "102", label: "Полиция", icon: "🚔" },
  { number: "103", label: "Скорая помощь", icon: "🚑" },
  { number: "101", label: "Пожарная служба", icon: "🔥" },
  { number: "104", label: "Аварийная газовая служба", icon: "⚠️" },
];

export default function SosScreen({ lang }: { lang: Lang }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function shareLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("Геолокация недоступна на этом устройстве.");
      return;
    }
    setStatus("Определяю местоположение…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setStatus(null);

        const text = `Моё местоположение: ${lat.toFixed(6)}, ${lon.toFixed(6)}\nhttps://www.google.com/maps?q=${lat},${lon}`;
        // Системное меню «Поделиться» — самый короткий путь отправить координаты
        // тому, кто уже есть в контактах телефона.
        if (navigator.share) {
          try {
            await navigator.share({ title: "Моё местоположение", text });
            return;
          } catch {
            // Пользователь закрыл окно — переходим к копированию.
          }
        }
        try {
          await navigator.clipboard.writeText(text);
          setStatus("Координаты скопированы в буфер обмена.");
        } catch {
          setStatus("Скопируйте координаты вручную.");
        }
      },
      () => setStatus("Не удалось определить местоположение. Разрешите доступ к геолокации."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <section className="mb-5 grid gap-2">
        {EMERGENCY.map((e) => (
          <a
            key={e.number}
            href={`tel:${e.number}`}
            className="flex items-center gap-3 rounded-xl p-4 transition-colors surface hover:bg-soft"
          >
            <span className="text-2xl">{e.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{e.label}</span>
              {e.note && <span className="block text-xs soft">{e.note}</span>}
            </span>
            <span className="shrink-0 text-2xl font-bold" style={{ color: "var(--accent)" }}>
              {e.number}
            </span>
          </a>
        ))}
      </section>

      <section className="mb-5">
        <button
          onClick={shareLocation}
          className="w-full rounded-xl px-4 py-4 font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          📍 Передать своё местоположение
        </button>
        {status && <p className="mt-2 text-sm soft">{status}</p>}
        {coords && (
          <p className="mt-2 rounded-lg p-3 font-mono text-sm surface">
            {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
          </p>
        )}
      </section>

      <section className="mb-5 rounded-xl p-4 surface">
        <h2 className="mb-2 font-semibold">🏛 Посольства</h2>
        <p className="text-sm soft">
          Список посольств в Ташкенте пока не заполнен. Контакты дипломатических
          представительств меняются, поэтому они вносятся через админ-панель из
          официальных источников МИД, а не заполняются приблизительно.
        </p>
        <a
          href="https://mfa.uz/ru/pages/diplomatic-missions"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm"
          style={{ color: "var(--accent)" }}
        >
          Справочник МИД Узбекистана →
        </a>
      </section>

      <section className="rounded-xl p-4 text-sm leading-relaxed surface">
        <h2 className="mb-2 font-semibold">Полезно знать</h2>
        <ul className="grid gap-2 soft">
          <li>
            <strong style={{ color: "var(--text)" }}>Регистрация.</strong> При проживании
            в гостинице она оформляется автоматически — сохраняйте талоны регистрации
            до выезда из страны.
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>Документы.</strong> Носите с собой
            копию паспорта, а оригинал оставляйте в сейфе гостиницы.
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>Деньги.</strong> Обмен валюты — только
            в банках и официальных обменных пунктах, с чеком.
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>Такси.</strong> Пользуйтесь приложениями
            вместо уличных машин: цена фиксируется заранее, поездка отслеживается.
          </li>
        </ul>
        <p className="mt-3 text-xs">
          Перед публичным запуском все номера и рекомендации должны быть сверены
          с официальными источниками и согласованы с профильными ведомствами.
        </p>
      </section>

      <p className="mt-4 text-center text-xs soft">{t(lang, "sos")}</p>
    </main>
  );
}
