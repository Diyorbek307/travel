"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { BORDER, CREAM, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { PRACTICAL } from "@/data/content";
import { useAppContent } from "@/components/content-provider";
import { AdBanner, OfflinePacks } from "@/components/widgets";
import QrScanner, { КнопкаСканера } from "@/components/qr-scanner";

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

function времяИзСекунд(с: number): string {
  if (!с) return "";
  const м = Math.floor(с / 60);
  return `${м}:${String(с % 60).padStart(2, "0")}`;
}

export function AudioScreen({
  onPlay,
  isPremium,
  сразуИграть,
}: {
  onPlay: (p: Place) => void;
  isPremium: boolean;
  /** Номер записи из кода на табличке: её включаем не дожидаясь нажатия. */
  сразуИграть?: string | null;
}) {
  const { AUDIO, PLACES } = useAppContent();
  const [язык, setЯзык] = useState<string | null>(null);
  const [сканер, setСканер] = useState(false);
  const [играет, setИграет] = useState<string | null>(null);
  const [ошибка, setОшибка] = useState<string | null>(null);
  /*
   * Подсказка, а не ошибка. Браузеры повсеместно не дают включить звук
   * без нажатия, и после кода на табличке человек упирается именно в это.
   * Красная плашка тут пугает зря: ничего не сломалось, нужно одно
   * касание.
   */
  const [нужноНажать, setНужноНажать] = useState(false);
  const проигрыватель = useRef<HTMLAudioElement | null>(null);

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
    if (найдено) включить(найдено.id, найдено.url, найдено.placeId);
    else setОшибка("Этот код не относится ни к одному аудиогиду.");
  }

  function включить(id: string, url: string, placeId: string, самоНачало = false) {
    setОшибка(null);
    setНужноНажать(false);

    if (играет === id) {
      проигрыватель.current?.pause();
      setИграет(null);
      return;
    }

    проигрыватель.current?.pause();
    const звук = new Audio(url);
    звук.onerror = () => {
      setИграет(null);
      setОшибка("Запись не открылась. Возможно, ссылка устарела.");
    };
    звук.onended = () => setИграет(null);
    проигрыватель.current = звук;

    звук
      .play()
      .then(() => {
        setИграет(id);
        // Мини-проигрыватель внизу показывает место, о котором рассказ.
        const место = PLACES.find((п) => п.id === placeId);
        if (место) onPlay(место);
      })
      .catch(() => {
        if (самоНачало) setНужноНажать(true);
        else setОшибка("Браузер не дал включить звук. Нажмите ещё раз.");
      });
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
      if (AUDIO.length) setОшибка("Этот код не относится ни к одному аудиогиду.");
      return;
    }
    ужеВключили.current = сразуИграть;
    включить(запись.id, запись.url, запись.placeId, true);
    // Список приходит с сервера, поэтому ждём именно его.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [сразуИграть, AUDIO]);

  // Уходя с экрана, звук выключаем: иначе он продолжает играть из ниоткуда.
  useEffect(() => () => проигрыватель.current?.pause(), []);

  return (
    <div className="flex h-full flex-col" style={{ background: CREAM }}>
      <div className="border-b bg-white px-4 pt-14 pb-4" style={{ borderColor: BORDER }}>
        <p className="mb-0.5 text-xs font-medium" style={{ color: GREEN, letterSpacing: "0.1em" }}>
          АУДИОГИД
        </p>
        <h1 className="mb-3 text-xl font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          Слушай истории
        </h1>

        {языки.length > 1 && (
          <>
            <p className="mb-2 text-xs" style={{ color: MUTED }}>
              Язык аудиогида
            </p>
            <div className="hide-scroll flex gap-2 overflow-x-auto">
              <button
                onClick={() => setЯзык(null)}
                className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={язык === null ? { background: GREEN, color: WHITE } : { background: CREAM, color: MUTED }}
              >
                Все
              </button>
              {языки.map((я) => (
                <button
                  key={я}
                  onClick={() => setЯзык(я)}
                  className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={язык === я ? { background: GREEN, color: WHITE } : { background: CREAM, color: MUTED }}
                >
                  {я}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hide-scroll flex-1 space-y-4 overflow-y-auto p-4">
        <AdBanner isPremium={isPremium} />

        <КнопкаСканера onClick={() => setСканер(true)} />

        {ошибка && (
          <p className="rounded-xl px-3 py-2 text-xs" style={{ background: "#FDECEC", color: "#B3261E" }}>
            {ошибка}
          </p>
        )}

        {нужноНажать && (
          <p className="rounded-xl px-3 py-2 text-xs leading-relaxed" style={{ background: GREEN + "12", color: GREEN }}>
            Запись готова — нажмите на неё, чтобы начать. Браузер включает звук
            только по касанию.
          </p>
        )}

        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm font-bold" style={{ color: TEXT }}>
              {AUDIO.length ? "Доступные записи" : "Записи"}
            </p>
          </div>

          {видимые.length === 0 ? (
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                {AUDIO.length === 0
                  ? "Аудиогидов пока нет. Как только их запишут и добавят, они появятся здесь."
                  : "На этом языке записей пока нет."}
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
                        {а.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs" style={{ color: MUTED }}>
                        {а.placeName} · {а.lang}
                        {а.seconds ? ` · ${времяИзСекунд(а.seconds)}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => включить(а.id, а.url, а.placeId)}
                      aria-label={это ? "Пауза" : "Слушать"}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: это ? GREEN : GREEN + "15" }}
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
            💡 Практическое
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PRACTICAL.map((п, i) => (
              <div key={i} className="rounded-2xl border bg-white p-3" style={{ borderColor: BORDER }}>
                <p className="text-sm font-bold" style={{ color: TEXT }}>
                  {п.icon} {п.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
                  {п.body}
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
