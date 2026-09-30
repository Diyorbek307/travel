"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Btn, Card, PageHeader, SectionTitle, StatCard } from "./shared";

/**
 * Заказы eSIM и готовность магазина.
 *
 * Магазин включается сам, когда в Render заданы ключи Airalo и хотя бы
 * одной платёжной системы с приёмом оповещений. Здесь видно, чего не
 * хватает, и какие адреса указать в кабинетах Payme и Click.
 */

interface Заказ {
  id: string;
  email?: string;
  пакет: { title: string; retailUsd: number; netUsd: number };
  сумма: number;
  статус: "ждёт_оплаты" | "оплачен" | "выдан" | "ошибка" | "отменён";
  createdAt: string;
  оплачен?: { система: string; когда: string };
  esim?: { iccid: string };
  ошибка?: string;
}

interface Ответ {
  настроено: { airalo: boolean; payme: boolean; click: boolean };
  заказы: Заказ[];
}

const СТАТУС: Record<Заказ["статус"], { текст: string; цвет: "amber" | "teal" | "rose" | "dim" }> = {
  ждёт_оплаты: { текст: "Ждёт оплаты", цвет: "dim" },
  оплачен: { текст: "Оплачен, выдаём", цвет: "amber" },
  выдан: { текст: "eSIM выдана", цвет: "teal" },
  ошибка: { текст: "Сбой выдачи", цвет: "rose" },
  отменён: { текст: "Отменён", цвет: "dim" },
};

const подпись: React.CSSProperties = { color: "var(--color-muted)", fontFamily: "var(--font-mono)" };

export default function EsimOrders() {
  const [д, setД] = useState<Ответ | null>(null);
  const [сайт, setСайт] = useState("");
  const загрузить = useCallback(async () => {
    const r = await fetch("/api/admin/esim", { cache: "no-store" }).catch(() => null);
    if (r?.ok) setД(await r.json());
  }, []);
  useEffect(() => {
    setСайт(window.location.origin);
    void загрузить();
  }, [загрузить]);

  const действие = async (id: string, action: "paid" | "retry") => {
    if (
      action === "paid" &&
      !window.confirm("Точно видите эту оплату в кабинете Payme или Click? eSIM будет куплена у Airalo.")
    )
      return;
    await fetch("/api/admin/esim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).catch(() => undefined);
    setTimeout(загрузить, 1500);
  };

  if (!д)
    return (
      <div className="p-4 sm:p-7" style={{ color: "var(--color-muted)" }}>
        Загрузка…
      </div>
    );
  const { настроено, заказы } = д;
  const готов = настроено.airalo && (настроено.payme || настроено.click);
  const выдано = заказы.filter((з) => з.статус === "выдан");
  const выручка = выдано.reduce((s, з) => s + з.сумма, 0);

  const строка = (ок: boolean, что: string, как: React.ReactNode) => (
    <div className="flex gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <span>{ок ? "✅" : "⬜"}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {что}
        </p>
        <div className="text-xs" style={{ color: "var(--color-muted)" }}>
          {как}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="eSIM"
        subtitle={
          готов
            ? "Магазин включён — туристы видят его в «Полезное → Связь»"
            : "Магазин выключен — не хватает ключей"
        }
      />

      <Card className="mb-5 p-5">
        <SectionTitle>Подключение</SectionTitle>
        {строка(
          настроено.airalo,
          "Airalo — откуда берутся eSIM",
          <>
            В Render → Environment: <code>AIRALO_CLIENT_ID</code> и <code>AIRALO_CLIENT_SECRET</code> из
            партнёрского кабинета Airalo. Для проверки без денег — ещё <code>AIRALO_API_URL</code> песочницы.
            Наценка — <code>ESIM_MARKUP_PERCENT</code> (по умолчанию 10 % сверху к цене Airalo; 0 — ровно как
            у Airalo).
          </>,
        )}
        {строка(
          настроено.payme,
          "Payme — оплата с подтверждением",
          <>
            <code>PAYME_MERCHANT_ID</code> и <code>PAYME_KEY</code>. В кабинете Payme Business адрес для
            запросов: <code>{сайт}/api/payme</code>, поле счёта — <code>order</code>.
          </>,
        )}
        {строка(
          настроено.click,
          "Click — оплата с подтверждением",
          <>
            <code>CLICK_MERCHANT_ID</code>, <code>CLICK_SERVICE_ID</code>, <code>CLICK_SECRET</code>. В
            кабинете Click: Prepare — <code>{сайт}/api/click/prepare</code>, Complete —{" "}
            <code>{сайт}/api/click/complete</code>.
          </>,
        )}
        <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
          eSIM покупается у Airalo только после подтверждённой оплаты: Payme или Click сообщают о ней сами, по
          секретному ключу. Если оповещение не пришло, а оплата в кабинете видна — нажмите «Оплата пришла» у
          заказа.
        </p>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Заказов" value={String(заказы.length)} />
        <StatCard label="Выдано eSIM" value={String(выдано.length)} />
        <StatCard label="Выручка, сум" value={выручка.toLocaleString("ru-RU")} />
        <StatCard label="Сбоев" value={String(заказы.filter((з) => з.статус === "ошибка").length)} />
      </div>

      {заказы.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>Заказов пока нет.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {заказы.map((з) => (
            <Card key={з.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                    {з.пакет.title} · {з.сумма.toLocaleString("ru-RU")} сум
                  </p>
                  <p className="text-xs" style={подпись}>
                    {з.id} · {new Date(з.createdAt).toLocaleString("ru-RU")}
                    {з.email ? ` · ${з.email}` : ""}
                  </p>
                  <p className="text-xs" style={подпись}>
                    Airalo: ${з.пакет.netUsd} закупка / ${з.пакет.retailUsd} розница
                    {з.оплачен ? ` · оплата: ${з.оплачен.система}` : ""}
                    {з.esim ? ` · ICCID ${з.esim.iccid}` : ""}
                  </p>
                  {з.ошибка && (
                    <p className="mt-1 text-xs" style={{ color: "var(--color-rose)" }}>
                      {з.ошибка}
                    </p>
                  )}
                </div>
                <Badge label={СТАТУС[з.статус].текст} color={СТАТУС[з.статус].цвет} />
              </div>
              {(з.статус === "ждёт_оплаты" || з.статус === "ошибка") && (
                <div className="mt-3 flex gap-2">
                  {з.статус === "ждёт_оплаты" && (
                    <Btn small variant="ghost" onClick={() => действие(з.id, "paid")}>
                      Оплата пришла
                    </Btn>
                  )}
                  {з.статус === "ошибка" && (
                    <Btn small onClick={() => действие(з.id, "retry")}>
                      Повторить выдачу
                    </Btn>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
