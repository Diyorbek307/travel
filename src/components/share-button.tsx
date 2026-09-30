"use client";

import { useState } from "react";
import { useT } from "@/components/lang-provider";
import { адресСтраницы } from "@/lib/seo-links";

/**
 * «Поделиться» местом, отелем или рестораном.
 *
 * Ссылка ведёт на страницу записи «/place/<id>» (см. lib/seo): у неё
 * настоящее превью в мессенджере — фото, название, описание — на языке
 * того, кто делится. Кнопка на странице открывает запись в приложении,
 * без регистрации. На телефоне — системное окно «Поделиться», где его
 * нет — копируем ссылку и показываем галочку.
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
  const { t, lang } = useT();
  const [скопировано, setСкопировано] = useState(false);

  const поделиться = async () => {
    const url = `${window.location.origin}${адресСтраницы(вид, id, lang)}`;
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
