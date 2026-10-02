"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/lang-provider";

/**
 * Полоска «нет сети». Без неё пропажа связи выглядела как поломка:
 * картинки серые, кнопки молчат. С ней понятно, что приложение работает
 * на сохранённом — и что стоит скачать город заранее.
 */
export default function OfflineBanner() {
  const { t } = useT();
  const [нетСети, setНетСети] = useState(false);
  useEffect(() => {
    const обновить = () => setНетСети(!navigator.onLine);
    обновить();
    window.addEventListener("online", обновить);
    window.addEventListener("offline", обновить);
    return () => {
      window.removeEventListener("online", обновить);
      window.removeEventListener("offline", обновить);
    };
  }, []);
  if (!нетСети) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 px-3 py-1.5 text-center text-[11px] font-semibold"
      style={{ background: "var(--accent-2)", color: "#1c1606" }}
    >
      <span aria-hidden>📴</span>
      {t("offline_banner")}
    </div>
  );
}
