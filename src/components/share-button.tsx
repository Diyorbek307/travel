"use client";

import { useState } from "react";
import { useT } from "@/components/lang-provider";

/**
 * «Поделиться» местом, отелем или рестораном.
 *
 * Ссылка ведёт на «/?place=<id>» — у получателя приложение открывается
 * сразу на этой карточке, без регистрации (см. гостевой режим в
 * page.tsx). На телефоне — системное окно «Поделиться» (мессенджеры,
 * почта), где его нет — копируем ссылку и показываем галочку.
 */
export function КнопкаПоделиться({
  вид,
  id,
  название,
  className,
  style,
}: {
  вид: "place" | "hotel" | "restaurant";
  id: string;
  название: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { t } = useT();
  const [скопировано, setСкопировано] = useState(false);

  const поделиться = async () => {
    const url = `${window.location.origin}/?${вид}=${encodeURIComponent(id)}`;
    const данные = { title: `${название} — HelloUZ`, text: название, url };
    try {
      if (navigator.share) {
        await navigator.share(данные);
        return;
      }
    } catch (e) {
      // Человек закрыл окно «Поделиться» — это не ошибка.
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setСкопировано(true);
      setTimeout(() => setСкопировано(false), 1800);
    } catch {
      // Буфер обмена недоступен (старый браузер) — показываем ссылку.
      window.prompt(t("share_copy"), url);
    }
  };

  return (
    <button onClick={поделиться} aria-label={t("share")} className={className} style={style}>
      {скопировано ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}
