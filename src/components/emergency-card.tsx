"use client";

import { useState } from "react";
import { BORDER, CREAM, SURFACE, TEXT } from "@/lib/theme";
import { useT } from "@/components/lang-provider";

/**
 * Экстренная помощь. Номера — прямые звонки (tel:). Кнопка «Отправить
 * геолокацию» шлёт координаты и данные туриста в админку (/api/sos), чтобы
 * оператор увидел, где человек и кто он. Работает и для гостя.
 * Цвета — из темы: карточка светлеет/темнеет вместе с приложением.
 */
export default function EmergencyCard() {
  const { t } = useT();
  const [состояние, setСостояние] = useState<"idle" | "sending" | "sent" | "fail">("idle");

  const номера = [
    { l: t("emg_police"), n: "102", e: "👮" },
    { l: t("emg_ambulance"), n: "103", e: "🚑" },
    { l: t("emg_fire"), n: "101", e: "🚒" },
    { l: t("prof_for_tourists"), n: "1322", e: "ℹ️" },
  ];

  const отправить = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setСостояние("fail");
      return;
    }
    setСостояние("sending");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const r = await fetch("/api/sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }),
          });
          setСостояние(r.ok ? "sent" : "fail");
        } catch {
          setСостояние("fail");
        }
      },
      () => setСостояние("fail"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="rounded-2xl p-4 border" style={{ background: SURFACE, borderColor: BORDER }}>
      <p className="mb-3 text-sm font-bold" style={{ color: TEXT }}>🆘 {t("prof_emergency")}</p>
      <div className="grid grid-cols-2 gap-2">
        {номера.map((s) => (
          <a key={s.l} href={`tel:${s.n}`} className="block rounded-xl p-3 text-left active:scale-[0.98]" style={{ background: CREAM }}>
            <span className="text-xl">{s.e}</span>
            <p className="mt-1 text-xs font-semibold" style={{ color: TEXT }}>{s.l}</p>
            <p className="font-mono text-sm font-bold" style={{ color: "var(--gold-ink)" }}>{s.n}</p>
          </a>
        ))}
      </div>
      <button
        onClick={отправить}
        disabled={состояние === "sending"}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-70"
        style={{ background: состояние === "sent" ? "#1a8f4a" : "#dc2626" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        {состояние === "sending" ? t("sos_sending") : состояние === "sent" ? t("sos_sent") : t("prof_send_location")}
      </button>
      {состояние === "fail" && (
        <p className="mt-2 text-xs" style={{ color: "#dc2626" }}>{t("sos_fail")}</p>
      )}
    </div>
  );
}
