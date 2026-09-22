"use client";

import { useEffect, useRef, useState } from "react";
import YouTubeBg from "./youtube-bg";

/**
 * Короткий «ролик» о городе: 3–4 кадра с медленным наездом и плавным
 * перетеканием — примерно 7 секунд на круг.
 *
 * Почему кадры, а не видео: своего отснятого материала у проекта нет, а
 * чужие ролики нельзя брать без лицензии. Кадры — те же фотографии,
 * которые уже лежат в содержимом города, поэтому ничего не ломается и
 * ничего не весит лишнего. Если появится настоящий ролик — он кладётся
 * в /videos и передаётся в `видео`: тогда играет он, а кадры остаются
 * постером на время загрузки.
 *
 * Крутится только пока карточка на экране: за кадром это впустую жгло
 * бы батарею.
 */

/** Сколько кадр держится на экране, мс. 3 кадра ≈ 7 секунд на круг. */
const ДЕРЖАТЬ = 2400;

export default function CityReel({
  кадры,
  видео,
  alt,
  className,
}: {
  кадры: string[];
  видео?: string;
  alt: string;
  className?: string;
}) {
  const [кадр, setКадр] = useState(0);
  const [виден, setВиден] = useState(false);
  // Реально ли ролик играет. Если автозапуск заблокирован (энергосбережение
  // на iPhone, к примеру), браузер рисует поверх видео свою кнопку «play»,
  // и она застревает уродливым пятном. Тогда прячем видео и показываем
  // кадр — красиво и без чужих контролов.
  const [играет, setИграет] = useState(false);
  const боксRef = useRef<HTMLDivElement | null>(null);
  const видеоRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const узел = боксRef.current;
    if (!узел || typeof IntersectionObserver === "undefined") {
      setВиден(true);
      return;
    }
    const наб = new IntersectionObserver(
      ([e]) => setВиден(e.isIntersecting),
      { threshold: 0.35 },
    );
    наб.observe(узел);
    return () => наб.disconnect();
  }, []);

  // Свой ролик заводим и глушим вручную по видимости. Атрибута autoPlay
  // мало: при монтировании блок ещё за экраном (виден=false), а когда он
  // появляется, autoPlay уже не срабатывает — видео так и стоит на первом
  // кадре. Поэтому play/pause зовём сами.
  useEffect(() => {
    const v = видеоRef.current;
    if (!v) return;
    if (виден) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => setИграет(false));
    } else {
      v.pause();
    }
  }, [виден, видео]);

  useEffect(() => {
    if (!виден || кадры.length < 2 || видео) return;
    // Человек мог попросить систему не анимировать — уважаем.
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setКадр((k) => (k + 1) % кадры.length), ДЕРЖАТЬ);
    return () => clearInterval(id);
  }, [виден, кадры.length, видео]);

  return (
    <div ref={боксRef} className={className ?? "absolute inset-0 overflow-hidden"}>
      {видео && /^[A-Za-z0-9_-]{11}$/.test(видео) ? (
        // Короткий id (11 символов) — ролик на YouTube: играем плеером.
        <YouTubeBg id={видео} poster={кадры[0]} className="absolute inset-0 overflow-hidden" />
      ) : видео ? (
        <>
          <video
            ref={видеоRef}
            src={видео}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            controls={false}
            disablePictureInPicture
            onPlaying={() => setИграет(true)}
            onPause={() => setИграет(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Кадр поверх видео, пока оно не заиграло: заодно закрывает
              нативную кнопку «play», которую iOS рисует на паузе. */}
          <img
            src={кадры[0]}
            alt={alt}
            aria-hidden={играет}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: играет ? 0 : 1,
              transform: `scale(${играет ? 1 : 1.05})`,
              transition: "opacity 0.8s ease",
              pointerEvents: "none",
            }}
          />
        </>
      ) : (
        кадры.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            loading={i === 0 ? undefined : "lazy"}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: i === кадр ? 1 : 0,
              // Наезд только на текущем кадре: остальные ждут в исходном
              // масштабе, иначе перетекание выглядит рывком.
              transform: `scale(${виден && i === кадр ? 1.13 : 1})`,
              transition: `opacity 1s ease, transform ${ДЕРЖАТЬ + 1200}ms linear`,
            }}
          />
        ))
      )}
    </div>
  );
}
