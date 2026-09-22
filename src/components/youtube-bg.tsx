"use client";

import { useEffect, useRef, useState } from "react";

/* Минимальные типы YouTube IFrame API — только то, что используем, чтобы
   не тянуть отдельный пакет типов. */
type ЮTПлеер = {
  getIframe(): HTMLIFrameElement;
  mute(): void;
  playVideo(): void;
  destroy(): void;
};
type ЮTApi = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady?: (e: { target: ЮTПлеер }) => void;
        onStateChange?: (e: { data: number }) => void;
      };
    },
  ) => ЮTПлеер;
};
declare global {
  interface Window {
    YT?: ЮTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Фоновое видео с YouTube.
 *
 * Обычный iframe с autoplay=1 на iPhone не запускается сам: Safari
 * показывает большую красную кнопку и ждёт нажатия. Поэтому играем не
 * через голый iframe, а через YouTube IFrame Player API и сами зовём
 * mute()+playVideo() в onReady — так ролик заводится без кнопки на
 * гораздо большем числе устройств. Гарантии на iOS всё равно нет: там
 * автозапуск видео жёстко ограничен, и надёжный автозапуск даёт только
 * свой mp4-файл. Кадр-постер прикрывает чёрный экран, пока плеер грузится.
 *
 * Плеер монтируем, только когда блок виден: десяток одновременных
 * плееров тормозил бы страницу.
 */

/* Один общий загрузчик API на всю страницу. */
let апиГотов: Promise<ЮTApi> | null = null;
function загрузитьApi(): Promise<ЮTApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (апиГотов) return апиГотов;
  апиГотов = new Promise((resolve) => {
    const прежний = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      прежний?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
  return апиГотов;
}

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
  const хостRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!виден || !хостRef.current) return;
    let player: ЮTПлеер | undefined;
    let снят = false;

    загрузитьApi()
      .then((YT) => {
        if (снят || !хостRef.current) return;
        player = new YT.Player(хостRef.current, {
          videoId: id,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            loop: 1,
            playlist: id,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
          },
          events: {
            onReady: (e: { target: ЮTПлеер }) => {
              // Растягиваем плеер как cover: у ролика 16:9, а экран узкий.
              const f = e.target.getIframe();
              Object.assign(f.style, {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "max(100%, 177.78vh)",
                height: "max(100%, 56.25vw)",
                minWidth: "300%",
                minHeight: "300%",
                transform: "translate(-50%,-50%)",
                border: "0",
                pointerEvents: "none",
              });
              try {
                e.target.mute();
                e.target.playVideo();
              } catch {
                /* заблокировано платформой — покажем постер */
              }
              setГотово(true);
            },
            onStateChange: (e: { data: number }) => {
              // 1 = playing. Убираем постер, только когда реально пошло.
              if (e.data === 1) setГотово(true);
            },
          },
        });
      })
      .catch(() => undefined);

    return () => {
      снят = true;
      try {
        player?.destroy();
      } catch {
        /* уже снят */
      }
    };
  }, [виден, id]);

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
      {виден && <div ref={хостRef} className="pointer-events-none absolute left-1/2 top-1/2" />}
    </div>
  );
}
