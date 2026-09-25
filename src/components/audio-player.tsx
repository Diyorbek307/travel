"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ManagedAudio } from "@/lib/types";
import { отметитьПрослушанное } from "@/lib/visits";

/**
 * Один проигрыватель аудиогидов на всё приложение.
 *
 * Раньше их было три, и два из них — нарисованные: в карточке места
 * полоска бежала по таймеру с вписанными «8:42», а мини-плеер внизу
 * ставил на паузу анимацию, но не звук. Настоящий звук играл только на
 * вкладке «Аудио» и замолкал, стоило с неё уйти, — при этом мини-плеер
 * продолжал «играть».
 *
 * Теперь звук один, а вкладка, карточка и мини-плеер — просто пульты к
 * нему. Поэтому рассказ продолжается при переходах между экранами, а
 * пауза в любом месте ставит на паузу именно его.
 */

export type Запись = Pick<ManagedAudio, "id" | "title" | "url" | "placeId" | "placeName" | "lang" | "seconds">;

/**
 * «tap» — браузер не дал включить звук без касания (так бывает, когда
 * рассказ запускается сам по коду с таблички): это подсказка, а не сбой.
 */
export type ОшибкаЗвука = "failed" | "blocked" | "tap";

interface Проигрыватель {
  запись: Запись | null;
  играет: boolean;
  /** Сколько секунд уже прозвучало. */
  позиция: number;
  /** Длительность файла; пока браузер её не узнал — из записи. */
  длительность: number;
  ошибка: ОшибкаЗвука | null;
  /** Включить запись. Та же, что играет, — пауза и обратно. */
  включить: (з: Запись, самоНачало?: boolean) => void;
  стоп: () => void;
  /** Перемотка на долю от 0 до 1. */
  перемотать: (доля: number) => void;
}

const Контекст = createContext<Проигрыватель | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const звук = useRef<HTMLAudioElement | null>(null);
  const [запись, setЗапись] = useState<Запись | null>(null);
  const [играет, setИграет] = useState(false);
  const [позиция, setПозиция] = useState(0);
  const [длительность, setДлительность] = useState(0);
  const [ошибка, setОшибка] = useState<ОшибкаЗвука | null>(null);

  // Элемент один на всё время жизни приложения; слушатели вешаем сразу.
  const элемент = useCallback((): HTMLAudioElement => {
    if (звук.current) return звук.current;
    const а = new Audio();
    а.preload = "metadata";
    а.addEventListener("play", () => setИграет(true));
    а.addEventListener("pause", () => setИграет(false));
    а.addEventListener("timeupdate", () => setПозиция(а.currentTime));
    а.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(а.duration)) setДлительность(а.duration);
    });
    а.addEventListener("ended", () => {
      setИграет(false);
      setПозиция(0);
    });
    а.addEventListener("error", () => {
      setИграет(false);
      setОшибка("failed");
    });
    звук.current = а;
    return а;
  }, []);

  // Уходим из приложения — звук выключаем.
  useEffect(() => () => звук.current?.pause(), []);

  const включить = useCallback(
    (з: Запись, самоНачало = false) => {
      const а = элемент();
      setОшибка(null);

      if (запись?.id === з.id) {
        if (а.paused) а.play().catch(() => setОшибка("blocked"));
        else а.pause();
        return;
      }

      а.pause();
      а.src = з.url;
      а.currentTime = 0;
      setЗапись(з);
      setПозиция(0);
      setДлительность(з.seconds || 0);
      а.play()
        .then(() => отметитьПрослушанное(з.id))
        .catch((e: unknown) => {
          // NotAllowedError — автозапуск без жеста: нужно одно касание.
          // Всё прочее (файла нет, формат не тот) — сбой самой записи.
          const запрет = e instanceof DOMException && e.name === "NotAllowedError";
          setОшибка(запрет ? (самоНачало ? "tap" : "blocked") : "failed");
        });
    },
    [элемент, запись],
  );

  const стоп = useCallback(() => {
    звук.current?.pause();
    setЗапись(null);
    setПозиция(0);
    setОшибка(null);
  }, []);

  const перемотать = useCallback((доля: number) => {
    const а = звук.current;
    if (!а || !Number.isFinite(а.duration)) return;
    а.currentTime = Math.min(Math.max(доля, 0), 1) * а.duration;
  }, []);

  return (
    <Контекст.Provider value={{ запись, играет, позиция, длительность, ошибка, включить, стоп, перемотать }}>
      {children}
    </Контекст.Provider>
  );
}

export function useAudioPlayer(): Проигрыватель {
  const п = useContext(Контекст);
  if (!п) throw new Error("useAudioPlayer вне AudioPlayerProvider");
  return п;
}

/** «4:07» из секунд. Пусто, пока длительность неизвестна. */
export function времяЗвука(секунд: number): string {
  if (!секунд || !Number.isFinite(секунд)) return "";
  const с = Math.floor(секунд);
  return `${Math.floor(с / 60)}:${String(с % 60).padStart(2, "0")}`;
}
