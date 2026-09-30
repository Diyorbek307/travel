"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/lang-provider";
import { открытоСейчас } from "@/lib/open-now";

const ЗЕЛЁНЫЙ = "#1F9D55";
const КРАСНЫЙ = "#C0392B";

/** Текущее время, обновляется раз в минуту — чтобы «открыто» не застывало. */
function useМинута(): Date {
  const [сейчас, setСейчас] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setСейчас(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return сейчас;
}

/**
 * «● Открыто · до 18:00» / «● Закрыто · откроется в 09:00».
 * Часы не разобрали — ничего не рисуем: лучше промолчать, чем соврать.
 */
export function СтатусОткрыто({ часы, крупно = false }: { часы?: string; крупно?: boolean }) {
  const { t } = useT();
  const сейчас = useМинута();
  // До монтирования время неизвестно (сервер рисует страницу раньше), а
  // разное «открыто» на сервере и в браузере сломало бы гидратацию.
  const [готово, setГотово] = useState(false);
  useEffect(() => setГотово(true), []);
  const с = готово ? открытоСейчас(часы, сейчас) : null;
  if (!с) return null;

  const цвет = с.открыто ? ЗЕЛЁНЫЙ : КРАСНЫЙ;
  const текст = с.открыто
    ? "круглосуточно" in с && с.круглосуточно
      ? t("open_24h")
      : `${t("open_now")} · ${t("open_until").replace("{t}", "до" in с ? с.до : "")}`
    : `${t("closed_now")} · ${t("opens_at").replace("{t}", с.откроется)}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${крупно ? "text-xs" : "text-[10px]"}`}
      style={{ color: цвет }}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: цвет }} />
      {текст}
    </span>
  );
}
