"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SEED } from "@/data/seed";
import type { Content, ContentKey } from "@/lib/types";

/**
 * Содержимое платформы в панели.
 *
 * Список один на всю панель, и он же лежит на сервере — приложение
 * читает ровно эти записи.
 *
 * Сохранение отложенное: редактор правит поля подряд, и слать запрос на
 * каждое нажатие незачем. Полсекунды тишины — и уходит одна запись. На
 * сервер уходят только изменённые разделы: сервер сливает их с
 * остальным, поэтому два редактора, правящие разное, не затирают друг
 * друга.
 */

const SAVE_DELAY_MS = 600;

type SaveState = "idle" | "saving" | "saved" | "error";

type Обновление<K extends ContentKey> = Content[K] | ((prev: Content[K]) => Content[K]);

interface ContentContextType {
  content: Content;
  /** Заменить раздел целиком или обновить его функцией от текущего. */
  update: <K extends ContentKey>(key: K, next: Обновление<K>) => void;
  loading: boolean;
  saveState: SaveState;
}

const ContentContext = createContext<ContentContextType>({
  content: SEED,
  update: () => {},
  loading: true,
  saveState: "idle",
});

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content>(SEED);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Разделы, изменённые с последнего сохранения. */
  const ждут = useRef<Partial<Content>>({});
  // Сохранять можно, только увидев настоящие данные сервера. Не
  // загрузились — на экране семена, и запись поверх затёрла бы то,
  // чего редактор не видел.
  const ready = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data: Content) => {
        if (cancelled) return;
        setContent(data);
        ready.current = true;
      })
      .catch(() => {
        if (!cancelled) setSaveState("error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const разделы = ждут.current;
      ждут.current = {};
      setSaveState("saving");
      try {
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(разделы),
        });
        if (!res.ok) throw new Error(String(res.status));
        setSaveState("saved");
      } catch {
        // Не ушло — возвращаем разделы в очередь: следующая правка
        // отправит их вместе со своими.
        ждут.current = { ...разделы, ...ждут.current };
        setSaveState("error");
      }
    }, SAVE_DELAY_MS);
  }, []);

  const update = useCallback<ContentContextType["update"]>(
    (key, next) => {
      setContent((prev) => {
        const items = typeof next === "function" ? next(prev[key]) : next;
        if (ready.current) {
          ждут.current = { ...ждут.current, [key]: items };
          save();
        } else {
          setSaveState("error");
        }
        return { ...prev, [key]: items };
      });
    },
    [save],
  );

  return (
    <ContentContext.Provider value={{ content, update, loading, saveState }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
