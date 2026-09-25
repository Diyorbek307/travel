"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENT_FILL, BORDER, CREAM, GREEN, MUTED, TEXT, WHITE, ACCENT_SOFT } from "@/lib/theme";
import { PRACTICAL } from "@/data/content";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useCurrency } from "@/components/currency-provider";
import { OfflinePacks } from "@/components/widgets";
import { AdInline } from "@/components/ads";
import QrScanner, { КнопкаСканера } from "@/components/qr-scanner";
import { useAudioPlayer, времяЗвука } from "@/components/audio-player";

/**
 * Аудиогиды.
 *
 * Здесь стоял список из трёх выдуманных записей с выдуманной
 * длительностью, и нажатие на них включало анимацию, но не звук. Турист у
 * Регистана нажимал «слушать» и слушал тишину.
 *
 * Теперь список приходит из панели, а играет настоящий файл настоящим
 * проигрывателем браузера. Если записей нет, экран так и говорит — это
 * честнее, чем три экскурсии, которых не существует.
 *
 * Языки берутся из самих записей: показывать «한국어» в переключателе,
 * когда корейских записей нет ни одной, значит обещать несуществующее.
 */

export function AudioScreen({
  isPremium,
  сразуИграть,
}: {
  isPremium: boolean;
  /** Номер записи из кода на табличке: её включаем не дожидаясь нажатия. */
  сразуИграть?: string | null;
}) {
  const { AUDIO } = useAppContent();
  const плеер = useAudioPlayer();
  const { t, трК, lang } = useT();
  // Живой курс для карточки «Валюта»: вписанный в данные уже устарел.
  const { rates } = useCurrency();
  const курсUZS = rates["UZS"];
  const [язык, setЯзык] = useState<string | null>(null);
  const [сканер, setСканер] = useState(false);
  const [плохойКод, setПлохойКод] = useState(false);
  const играет = плеер.играет ? плеер.запись?.id ?? null : null;
  /*
   * «tap» — подсказка, а не ошибка. Браузеры повсеместно не дают включить
   * звук без нажатия, и после кода на табличке человек упирается именно в
   * это. Красная плашка тут пугает зря: ничего не сломалось, нужно одно
   * касание.
   */
  const нужноНажать = плеер.ошибка === "tap";
  const ошибка = плохойКод
    ? t("audio_bad_code")
    : плеер.ошибка === "blocked"
      ? t("audio_blocked")
      : плеер.ошибка === "failed"
        ? t("audio_failed")
        : null;

  // Языки только те, на которых записи действительно есть.
  const языки = useMemo(() => Array.from(new Set(AUDIO.map((а) => а.lang))), [AUDIO]);

  useEffect(() => {
    if (язык && !языки.includes(язык)) setЯзык(null);
  }, [языки, язык]);

  const видимые = useMemo(
    () => (язык ? AUDIO.filter((а) => а.lang === язык) : AUDIO),
    [AUDIO, язык],
  );

  /**
   * Код с таблички ведёт на адрес приложения с номером записи. Разбираем
   * его сами: открывать ссылку значило бы перезагрузить приложение и
   * потерять всё, что человек уже открыл.
   */
  function прочитанныйКод(текст: string) {
    setСканер(false);
    let id: string | null = null;
    try {
      id = new URL(текст).searchParams.get("audio");
    } catch {
      // В коде может лежать и просто номер записи.
      id = текст.trim();
    }
    const найдено = AUDIO.find((а) => а.id === id);
    setПлохойКод(!найдено);
    if (найдено) плеер.включить(найдено);
  }

  /*
   * Код с таблички, снятый обычной камерой телефона, открывает приложение
   * по ссылке. Человек ждёт, что рассказ начнётся сам — он же навёл
   * камеру именно на этот код, а не листал список.
   */
  const ужеВключили = useRef<string | null>(null);
  useEffect(() => {
    if (!сразуИграть || ужеВключили.current === сразуИграть) return;
    const запись = AUDIO.find((а) => а.id === сразуИграть);
    if (!запись) {
      if (AUDIO.length) setПлохойКод(true);
      return;
    }
    ужеВключили.current = сразуИграть;
    плеер.включить(запись, true);
    // Список приходит с сервера, поэтому ждём именно его.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [сразуИграть, AUDIO]);

  return (
    <div className="flex h-full flex-col" style={{ background: CREAM }}>
      <div className="border-b bg-white px-4 pt-14 pb-4" style={{ borderColor: BORDER }}>
        <p className="mb-0.5 text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>
          {t("audio_kicker")}
        </p>
        <h1 className="mb-3 text-xl font-bold" style={{ color: TEXT, fontFamily:"var(--font-heading)" }}>
          {t("audio_listen")}
        </h1>

        {языки.length > 1 && (
          <>
            <p className="mb-2 text-xs" style={{ color: MUTED }}>
              {t("audio_lang")}
            </p>
            <div className="hide-scroll flex gap-2 overflow-x-auto">
              <button
                onClick={() => setЯзык(null)}
                className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={язык === null ? { background: ACCENT_FILL, color: WHITE } : { background: CREAM, color: MUTED }}
              >
                {t("audio_all")}
              </button>
              {языки.map((я) => (
                <button
                  key={я}
                  onClick={() => setЯзык(я)}
                  className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={язык === я ? { background: ACCENT_FILL, color: WHITE } : { background: CREAM, color: MUTED }}
                >
                  {трК(я)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hide-scroll flex-1 space-y-4 overflow-y-auto p-4">
        <AdInline isPremium={isPremium} />

        <КнопкаСканера onClick={() => setСканер(true)} />

        {ошибка && (
          <p className="rounded-xl px-3 py-2 text-xs" style={{ background: "#FDECEC", color: "#B3261E" }}>
            {ошибка}
          </p>
        )}

        {нужноНажать && (
          <p className="rounded-xl px-3 py-2 text-xs leading-relaxed" style={{ background: ACCENT_SOFT, color: GREEN }}>
            {t("audio_ready")}
          </p>
        )}

        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm font-bold" style={{ color: TEXT }}>
              {AUDIO.length ? t("audio_available") : t("audio_records")}
            </p>
          </div>

          {видимые.length === 0 ? (
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                {AUDIO.length === 0
                  ? t("audio_empty_none")
                  : t("audio_empty_lang")}
              </p>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {видимые.map((а) => {
                const это = играет === а.id;
                return (
                  <div
                    key={а.id}
                    className="flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm"
                    style={{ borderColor: это ? GREEN : BORDER }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold" style={{ color: TEXT }}>
                        {трК(а.title)}
                      </p>
                      <p className="mt-0.5 truncate text-xs" style={{ color: MUTED }}>
                        {трК(а.placeName)} · {трК(а.lang)}
                        {а.seconds ? ` · ${времяЗвука(а.seconds)}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setПлохойКод(false);
                        плеер.включить(а);
                      }}
                      aria-label={это ? t("d_pause") : t("d_listen")}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: это ? GREEN : ACCENT_SOFT }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={это ? WHITE : GREEN}>
                        {это ? (
                          <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                        ) : (
                          <path d="M8 5v14l11-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2.5 text-sm font-bold" style={{ color: TEXT }}>
            💡 {t("audio_practical")}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PRACTICAL.map((п, i) => (
              <div key={i} className="rounded-2xl border bg-white p-3" style={{ borderColor: BORDER }}>
                <p className="text-sm font-bold" style={{ color: TEXT }}>
                  {п.icon} {трК(п.title)}
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
                  {/* Курс в данных вписан навсегда («$1 = 12 740 сум») и уже
                      разошёлся с живым курсом в конвертере. Показываем живой,
                      а к вписанному не возвращаемся. */}
                  {п.title === "Валюта" && курсUZS
                    ? `$1 ≈ ${курсUZS.toLocaleString(lang, { maximumFractionDigits: 0 })} UZS. ${t("cur_live_hint")}`
                    : трК(п.body)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <OfflinePacks />
      </div>

      {сканер && <QrScanner onКод={прочитанныйКод} onClose={() => setСканер(false)} />}
    </div>
  );
}

export default AudioScreen;
