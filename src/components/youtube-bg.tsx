"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Фоновое видео с YouTube.
 *
 * Сырой mp4 у YouTube не взять, а скачивать нельзя — поэтому играем через
 * штатный плеер-iframe: без звука, зациклено, без кнопок и подсказок,
 * насколько YouTube это позволяет. Клики по видео перехватываем (ниже
 * лежит слой pointer-events:none), чтобы фон не открывал YouTube.
 *
 * Iframe монтируем только когда блок виден на экране: десяток
 * одновременно играющих плееров ощутимо тормозил бы страницу и жёг
 * батарею. За кадром плеер снимается.
 *
 * Кадр-постер (первая фотография) показываем, пока плеер грузится, —
 * чтобы не мигало чёрным.
 */
export default function YouTubeBg({
  id,
  poster,
  className,
}: {
  id: string;
  poster?: string;
  className?: string;
}) {
  const боксRef = useRef<HTMLDivElement | null>(null);
  const [виден, setВиден] = useState(false);
  const [готово, setГотово] = useState(false);

  useEffect(() => {
    const узел = боксRef.current;
    if (!узел || typeof IntersectionObserver === "undefined") {
      setВиден(true);
      return;
    }
    const наб = new IntersectionObserver(([e]) => setВиден(e.isIntersecting), { threshold: 0.3 });
    наб.observe(узел);
    return () => наб.disconnect();
  }, []);

  // Параметры плеера для фонового показа.
  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}` +
    `&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`;

  return (
    <div ref={боксRef} className={className ?? "absolute inset-0 overflow-hidden"}>
      {poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: готово ? 0 : 1, transition: "opacity 1s ease" }}
        />
      )}
      {виден && (
        <iframe
          src={src}
          title=""
          allow="autoplay; encrypted-media"
          onLoad={() => setГотово(true)}
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{
            // Перекрываем экран с запасом: у видео 16:9, а телефон узкий —
            // растягиваем так, чтобы кадр закрывал всю площадь без полей.
            width: "max(100%, 177.78vh)",
            height: "max(100%, 56.25vw)",
            minWidth: "300%",
            minHeight: "300%",
            transform: "translate(-50%,-50%)",
            border: 0,
          }}
        />
      )}
    </div>
  );
}
