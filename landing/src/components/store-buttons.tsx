"use client";

import { useEffect, useState } from "react";
import { APP_URL, тр, useЯзык, type Многоязычно } from "@/lib/i18n";

/**
 * Ссылки на магазины. Пока приложения там нет — пустые строки, и значки
 * показываются с пометкой «скоро», а рядом работает веб-версия. Когда
 * приложение выйдет, достаточно вписать адреса сюда.
 */
export const APP_STORE_URL = "";
export const GOOGLE_PLAY_URL = "";
/** Пакет Android-приложения (capacitor.config.ts → appId). */
const ПАКЕТ = "uz.uzup.app";

/**
 * Кнопка Google Play на Android сначала пробует открыть уже установленное
 * приложение (схема hellouz:// объявлена в AndroidManifest.xml), а если
 * его нет — Chrome сам уходит по запасному адресу в магазин. На iPhone
 * страница App Store сама показывает «Открыть», если приложение стоит.
 */
function ссылкаGooglePlay(android: boolean) {
  if (!GOOGLE_PLAY_URL) return "";
  if (!android) return GOOGLE_PLAY_URL;
  return `intent://open#Intent;scheme=hellouz;package=${ПАКЕТ};S.browser_fallback_url=${encodeURIComponent(
    GOOGLE_PLAY_URL,
  )};end`;
}

const СКОРО: Многоязычно = {
  en: "Coming soon to",
  ru: "Скоро в",
  uz: "Tez orada",
  zh: "即将登陆",
  ko: "곧 출시",
  de: "Bald im",
  fr: "Bientôt sur",
  ja: "近日公開",
  tr: "Yakında",
  ar: "قريبًا على",
};
const СКАЧАТЬ: Многоязычно = {
  en: "Download on",
  ru: "Загрузите в",
  uz: "Yuklab oling",
  zh: "下载于",
  ko: "다운로드",
  de: "Laden im",
  fr: "Télécharger sur",
  ja: "ダウンロード",
  tr: "İndirin",
  ar: "حمّله من",
};
export const ВЕБ: Многоязычно = {
  en: "Open the web version",
  ru: "Открыть веб-версию",
  uz: "Veb-versiyani ochish",
  zh: "打开网页版",
  ko: "웹 버전 열기",
  de: "Web-Version öffnen",
  fr: "Ouvrir la version web",
  ja: "Web版を開く",
  tr: "Web sürümünü aç",
  ar: "افتح نسخة الويب",
};

function ЗнакApple() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M16.37 12.77c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.8-3.33.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.04 1.52-.71 2.85-.71s1.71.71 2.87.69c1.19-.02 1.94-1.08 2.66-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.32-3.55ZM14.2 6.29c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.56-1.23Z" />
    </svg>
  );
}

function ЗнакPlay() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M4.2 2.6 13.6 12l-9.4 9.4c-.3-.2-.5-.6-.5-1.1V3.7c0-.5.2-.9.5-1.1Z" fill="#34dccf" />
      <path d="m16.7 8.9-3.1 3.1-9.4-9.4c.3-.2.8-.2 1.2 0l11.3 6.3Z" fill="#f2ce6e" />
      <path d="M16.7 15.1 5 21.4c-.4.2-.9.2-1.2 0l9.8-9.4 3.1 3.1Z" fill="#e8f1ef" />
      <path d="m20.1 13.2-3.4 1.9-3.1-3.1 3.1-3.1 3.4 1.9c1 .6 1 2 0 2.4Z" fill="#0fb3ac" />
    </svg>
  );
}

/**
 * Пара значков App Store и Google Play (+ по желанию кнопка веб-версии).
 * тёмный — на тёмном фоне значки светлые, на светлом — тёмные.
 */
export default function StoreButtons({
  тёмный = false,
  веб = true,
  className = "",
}: {
  тёмный?: boolean;
  веб?: boolean;
  className?: string;
}) {
  const { язык } = useЯзык();
  const [android, setAndroid] = useState(false);
  useEffect(() => setAndroid(/android/i.test(navigator.userAgent)), []);

  const значки = [
    { имя: "App Store", знак: <ЗнакApple />, ссылка: APP_STORE_URL },
    { имя: "Google Play", знак: <ЗнакPlay />, ссылка: ссылкаGooglePlay(android) },
  ];
  const рамка = тёмный
    ? "border-white/25 bg-white/[0.07] text-white"
    : "border-[var(--line)] bg-[var(--ink)] text-white";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {значки.map((з) => {
        const есть = Boolean(з.ссылка);
        const внутри = (
          <>
            {з.знак}
            <span className="flex flex-col text-start leading-none">
              <span className="text-[10px] font-medium opacity-75">{тр(есть ? СКАЧАТЬ : СКОРО, язык)}</span>
              <span className="mt-1 text-[16px] font-semibold tracking-[-0.01em]">{з.имя}</span>
            </span>
          </>
        );
        const класс = `inline-flex h-[52px] items-center gap-2.5 rounded-[14px] border px-4 transition-transform ${рамка}`;
        return есть ? (
          <a
            key={з.имя}
            href={з.ссылка}
            target="_blank"
            rel="noreferrer"
            className={`${класс} hover:scale-[1.03]`}
          >
            {внутри}
          </a>
        ) : (
          <span
            key={з.имя}
            className={`${класс} cursor-default`}
            aria-disabled
            title={тр(СКОРО, язык) + " " + з.имя}
          >
            {внутри}
          </span>
        );
      })}
      {веб && (
        <a
          href={APP_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex h-[52px] items-center gap-2.5 rounded-[14px] px-5 text-[14px] font-semibold text-white transition-transform hover:scale-[1.03]"
          style={{ background: "var(--accent-fill)" }}
        >
          {тр(ВЕБ, язык)}
          <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
        </a>
      )}
    </div>
  );
}
