"use client";

import { useCallback, useEffect, useState } from "react";
import { ACCENT_FILL, ACCENT_SOFT, BORDER, CREAM, GREEN, MUTED, SURFACE, TEXT, WHITE } from "@/lib/theme";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";

/**
 * Магазин eSIM в «Полезном» → «Связь».
 *
 * Появляется сам, когда на сервере подключены Airalo и приём оплаты
 * (Payme/Click с секретным ключом). До этого его просто нет — остаётся
 * ссылка на государственную заявку.
 *
 * Номера своих заказов храним на устройстве: по ним видно статус и QR,
 * даже без аккаунта. После оплаты Payme/Click возвращает на «/?esim=<id>».
 */

interface Пакет {
  id: string;
  title: string;
  data: string;
  day: number;
  unlimited: boolean;
  operator: string;
  сумма: number;
}

interface Заказ {
  id: string;
  статус: "ждёт_оплаты" | "оплачен" | "выдан" | "ошибка" | "отменён";
  сумма: number;
  пакет: { title: string; data: string; day: number; unlimited: boolean };
  esim: {
    qrcode: string;
    qrcodeUrl: string;
    appleUrl: string | null;
    iccid: string;
    apn: string | null;
  } | null;
}

const КЛЮЧ = "uzup.esim";

export function моиЗаказыEsim(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(КЛЮЧ) || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(-10) : [];
  } catch {
    return [];
  }
}

export function запомнитьЗаказEsim(id: string) {
  if (!/^es[0-9a-f]{24}$/.test(id)) return;
  try {
    const все = моиЗаказыEsim().filter((x) => x !== id);
    localStorage.setItem(КЛЮЧ, JSON.stringify([...все, id]));
  } catch {
    // приватный режим — номер останется в письме и в ссылке возврата
  }
}

const СТАТУС: Record<Заказ["статус"], TKey> = {
  ждёт_оплаты: "esim_waiting",
  оплачен: "esim_paid",
  выдан: "esim_ready",
  ошибка: "esim_error",
  отменён: "esim_cancelled",
};

export function МагазинEsim() {
  const { t, lang } = useT();
  const [пакеты, setПакеты] = useState<Пакет[] | null>(null);
  const [оплата, setОплата] = useState<string[]>([]);
  const [выбран, setВыбран] = useState<string | null>(null);
  const [почта, setПочта] = useState("");
  const [система, setСистема] = useState<string>("");
  const [идёт, setИдёт] = useState(false);
  const [ошибка, setОшибка] = useState("");
  const [мои, setМои] = useState<Заказ[]>([]);

  useEffect(() => {
    fetch("/api/esim")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { включён?: boolean; пакеты?: Пакет[]; оплата?: string[] } | null) => {
        setПакеты(d?.включён ? d.пакеты ?? [] : []);
        setОплата(d?.оплата ?? []);
        setСистема(d?.оплата?.[0] ?? "");
      })
      .catch(() => setПакеты([]));
  }, []);

  const обновитьМои = useCallback(async () => {
    const ids = моиЗаказыEsim();
    const заказы = await Promise.all(
      ids.map((id) =>
        fetch(`/api/esim/${id}`)
          .then((r) => (r.ok ? (r.json() as Promise<Заказ>) : null))
          .catch(() => null),
      ),
    );
    setМои(заказы.filter((з): з is Заказ => Boolean(з)).reverse());
  }, []);
  useEffect(() => {
    void обновитьМои();
  }, [обновитьМои]);
  // Оплачено, но eSIM ещё не пришла — проверяем раз в 5 секунд.
  const ждём = мои.some((з) => з.статус === "оплачен");
  useEffect(() => {
    if (!ждём) return;
    const id = setInterval(обновитьМои, 5000);
    return () => clearInterval(id);
  }, [ждём, обновитьМои]);

  const купить = async () => {
    if (!выбран) return;
    setИдёт(true);
    setОшибка("");
    try {
      const r = await fetch("/api/esim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: выбран, email: почта.trim() || undefined, system: система }),
      });
      const d = (await r.json().catch(() => null)) as {
        заказ?: { id: string };
        url?: string;
        error?: string;
      } | null;
      if (!r.ok || !d?.заказ || !d.url) {
        setОшибка(d?.error === "bad_email" ? t("esim_bad_email") : t("ph_error"));
        return;
      }
      запомнитьЗаказEsim(d.заказ.id);
      window.location.href = d.url;
    } finally {
      setИдёт(false);
    }
  };

  const сум = (n: number) => `${n.toLocaleString(lang)} ${t("cur_uzs_word")}`;

  return (
    <div className="mt-3 space-y-3">
      {мои.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold" style={{ color: TEXT }}>
            📶 {t("esim_mine")}
          </p>
          <div className="space-y-2">
            {мои.map((з) => (
              <МояEsim key={з.id} заказ={з} onCheck={обновитьМои} />
            ))}
          </div>
        </div>
      )}

      {/* Ключи Airalo ещё не заданы — магазин не молчит, а говорит, что
          скоро откроется: иначе раздел выглядел пустым и его не находили. */}
      {пакеты && пакеты.length === 0 && (
        <div className="rounded-xl p-3" style={{ background: ACCENT_SOFT }}>
          <p className="text-sm font-bold" style={{ color: TEXT }}>
            📲 {t("esim_title")}
          </p>
          <p className="mt-1 text-[11px] leading-snug" style={{ color: MUTED }}>
            {t("esim_soon")}
          </p>
        </div>
      )}

      {пакеты && пакеты.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: ACCENT_SOFT }}>
          <p className="text-sm font-bold" style={{ color: TEXT }}>
            📲 {t("esim_title")}
          </p>
          <p className="mb-2 text-[11px] leading-snug" style={{ color: MUTED }}>
            {t("esim_sub")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {пакеты.slice(0, 8).map((п) => (
              <button
                key={п.id}
                onClick={() => setВыбран(п.id)}
                className="rounded-xl border p-2.5 text-left transition-transform active:scale-[0.97]"
                style={{
                  background: SURFACE,
                  borderColor: выбран === п.id ? GREEN : BORDER,
                  boxShadow: выбран === п.id ? `0 0 0 2px ${GREEN}` : undefined,
                }}
              >
                <p className="text-sm font-extrabold" style={{ color: TEXT }}>
                  {п.unlimited ? t("esim_unlimited") : п.data}
                </p>
                <p className="text-[11px]" style={{ color: MUTED }}>
                  {t("esim_days").replace("{n}", String(п.day))}
                </p>
                <p className="mt-1 text-xs font-bold" style={{ color: GREEN }}>
                  {сум(п.сумма)}
                </p>
              </button>
            ))}
          </div>
          {выбран && (
            <div className="mt-3 space-y-2">
              <input
                type="email"
                value={почта}
                onChange={(e) => setПочта(e.target.value)}
                placeholder={t("esim_email")}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
              />
              {оплата.length > 1 && (
                <div className="flex gap-2">
                  {оплата.map((с) => (
                    <button
                      key={с}
                      onClick={() => setСистема(с)}
                      className="flex-1 rounded-lg border py-2 text-xs font-bold"
                      style={
                        система === с
                          ? { background: ACCENT_FILL, color: WHITE, borderColor: "transparent" }
                          : { borderColor: BORDER, color: TEXT, background: SURFACE }
                      }
                    >
                      {с === "payme" ? "Payme" : "Click"}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={купить}
                disabled={идёт}
                className="w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60"
                style={{ background: ACCENT_FILL, color: WHITE }}
              >
                {идёт ? "…" : `${t("esim_pay")} · ${сум(пакеты.find((п) => п.id === выбран)?.сумма ?? 0)}`}
              </button>
              {ошибка && (
                <p className="text-xs" style={{ color: "#C0392B" }}>
                  {ошибка}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function МояEsim({ заказ, onCheck }: { заказ: Заказ; onCheck: () => void }) {
  const { t } = useT();
  const [скопировано, setСкопировано] = useState(false);
  const готова = заказ.статус === "выдан" && заказ.esim;
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: BORDER, background: SURFACE }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: TEXT }}>
          {заказ.пакет.unlimited ? t("esim_unlimited") : заказ.пакет.data} ·{" "}
          {t("esim_days").replace("{n}", String(заказ.пакет.day))}
        </p>
        <span className="text-[11px] font-semibold" style={{ color: готова ? GREEN : MUTED }}>
          {t(СТАТУС[заказ.статус])}
        </span>
      </div>
      {заказ.статус === "ждёт_оплаты" && (
        <button onClick={onCheck} className="mt-2 text-xs font-bold" style={{ color: GREEN }}>
          ↻ {t("esim_check")}
        </button>
      )}
      {готова && заказ.esim && (
        <div className="mt-2 flex flex-col items-center gap-2 text-center">
          {заказ.esim.qrcodeUrl && (
            <img src={заказ.esim.qrcodeUrl} alt="eSIM QR" className="h-48 w-48 rounded-lg bg-white p-2" />
          )}
          <p className="text-[11px] leading-snug" style={{ color: MUTED }}>
            {t("esim_how")}
          </p>
          {заказ.esim.appleUrl && (
            <a
              href={заказ.esim.appleUrl}
              className="w-full rounded-xl py-2.5 text-sm font-bold"
              style={{ background: ACCENT_FILL, color: WHITE }}
            >
              {t("esim_install_ios")}
            </a>
          )}
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(заказ.esim!.qrcode);
                setСкопировано(true);
                setTimeout(() => setСкопировано(false), 1500);
              } catch {
                window.prompt(t("esim_code"), заказ.esim!.qrcode);
              }
            }}
            className="w-full rounded-xl border py-2 text-xs font-bold"
            style={{ borderColor: BORDER, color: TEXT }}
          >
            {скопировано ? `✓ ${t("esim_copied")}` : `${t("esim_code")} — ${t("esim_copy")}`}
          </button>
          <p className="text-[10px]" style={{ color: MUTED }}>
            ICCID {заказ.esim.iccid}
          </p>
        </div>
      )}
    </div>
  );
}
