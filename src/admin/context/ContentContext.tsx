"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SEED } from "@/data/seed";
import type { Content, ContentKey } from "@/lib/types";

/**
 * Содержимое платформы в панели.
 *
 * Раньше каждый экран держал свой `useState(СЕМЕНА)`: правки жили до
 * ухода с экрана и никуда не уезжали. Теперь список один на всю панель,
 * и он же лежит на сервере — приложение читает ровно эти записи.
 *
 * Сохранение отложенное: редактор правит поля подряд, и слать запрос на
 * каждое нажатие незачем. Полсекунды тишины — и уходит одна запись.
 */

const SAVE_DELAY_MS = 600;

type SaveState = "idle" | "saving" | "saved" | "error";

interface ContentContextType {
  content: Content;
  /** Заменить раздел целиком — так же, как это делал setState экрана. */
  update: <K extends ContentKey>(key: K, items: Content[K]) => void;
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
  // Пока не загрузились, сохранять нечего: иначе первый же рендер
  // затёр бы серверные данные семенами.
  const ready = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data: Content) => {
        if (cancelled) return;
        setContent(data);
      })
      .catch(() => {
        // Сеть отвалилась — работаем на семенах, но не сохраняем:
        // иначе перезаписали бы то, чего не видели.
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        ready.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((next: Content) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, SAVE_DELAY_MS);
  }, []);

  const update = useCallback<ContentContextType["update"]>(
    (key, items) => {
      setContent((prev) => {
        const next = { ...prev, [key]: items };
        if (ready.current) save(next);
        return next;
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
