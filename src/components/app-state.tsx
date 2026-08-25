"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Личный кабинет туриста (п. 12–13 ТЗ) без обязательной регистрации.
 *
 * Всё хранится в localStorage: приложение полностью работоспособно офлайн
 * и не собирает персональные данные. Когда появится аккаунт, этот же формат
 * синхронизируется с сервером — структура специально плоская.
 */

const KEY = "uz_travel_state_v1";

export interface VisitRecord {
  slug: string;
  city: string;
  name: string;
  ts: number;
  /** Метры, пройденные до этого объекта, если была геолокация. */
  meters?: number;
}

export interface ListenRecord {
  slug: string;
  name: string;
  ts: number;
  /** Дослушано ли до конца — для достижений и аналитики. */
  completed: boolean;
}

export interface AppState {
  favorites: string[];
  wantToVisit: string[];
  visits: VisitRecord[];
  listens: ListenRecord[];
  offlineCities: string[];
  lastCity: string | null;
}

const EMPTY: AppState = {
  favorites: [],
  wantToVisit: [],
  visits: [],
  listens: [],
  offlineCities: [],
  lastCity: null,
};

interface Ctx extends AppState {
  ready: boolean;
  toggleFavorite: (slug: string) => void;
  toggleWantToVisit: (slug: string) => void;
  addVisit: (r: Omit<VisitRecord, "ts">) => void;
  addListen: (r: Omit<ListenRecord, "ts">) => void;
  setOffline: (city: string, downloaded: boolean) => void;
  setLastCity: (city: string) => void;
  reset: () => void;
}

const AppStateContext = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return EMPTY;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [ready, setReady] = useState(false);

  // Читаем localStorage только после монтирования: иначе серверный и клиентский
  // HTML разойдутся и React выбросит ошибку гидратации.
  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Приватный режим Safari может запрещать запись — работаем в памяти.
    }
  }, [state, ready]);

  const toggleIn = useCallback((field: "favorites" | "wantToVisit", slug: string) => {
    setState((s) => {
      const list = s[field];
      return {
        ...s,
        [field]: list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug],
      };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      toggleFavorite: (slug) => toggleIn("favorites", slug),
      toggleWantToVisit: (slug) => toggleIn("wantToVisit", slug),
      addVisit: (r) =>
        setState((s) =>
          s.visits.some((v) => v.slug === r.slug)
            ? s
            : { ...s, visits: [...s.visits, { ...r, ts: Date.now() }] },
        ),
      addListen: (r) =>
        setState((s) => {
          const existing = s.listens.findIndex((l) => l.slug === r.slug);
          const record = { ...r, ts: Date.now() };
          if (existing === -1) return { ...s, listens: [...s.listens, record] };
          // Сохраняем «дослушано», если это уже было отмечено раньше.
          const listens = [...s.listens];
          listens[existing] = {
            ...record,
            completed: listens[existing].completed || r.completed,
          };
          return { ...s, listens };
        }),
      setOffline: (city, downloaded) =>
        setState((s) => ({
          ...s,
          offlineCities: downloaded
            ? [...new Set([...s.offlineCities, city])]
            : s.offlineCities.filter((c) => c !== city),
        })),
      setLastCity: (city) => setState((s) => (s.lastCity === city ? s : { ...s, lastCity: city })),
      reset: () => setState(EMPTY),
    }),
    [state, ready, toggleIn],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): Ctx {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState должен вызываться внутри <AppStateProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Достижения (п. 12 ТЗ)                                              */
/* ------------------------------------------------------------------ */

export interface Achievement {
  id: string;
  title: Record<string, string>;
  /** Сколько нужно и сколько уже есть. */
  progress: (s: AppState) => { have: number; need: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "samarkand-explorer",
    title: { ru: "Открыл Самарканд", uz: "Samarqandni kashf etdi", en: "Discovered Samarkand" },
    progress: (s) => ({
      have: s.visits.filter((v) => v.city === "samarkand").length,
      need: 5,
    }),
  },
  {
    id: "bukhara-explorer",
    title: { ru: "Исследователь Бухары", uz: "Buxoro tadqiqotchisi", en: "Explorer of Bukhara" },
    progress: (s) => ({
      have: s.visits.filter((v) => v.city === "bukhara").length,
      need: 5,
    }),
  },
  {
    id: "silk-road",
    title: { ru: "Шёлковый путь", uz: "Ipak yo'li", en: "The Silk Road" },
    progress: (s) => ({
      have: new Set(s.visits.map((v) => v.city)).size,
      need: 4,
    }),
  },
  {
    id: "ten-museums",
    title: { ru: "10 музеев Узбекистана", uz: "O'zbekistonning 10 muzeyi", en: "10 museums of Uzbekistan" },
    progress: (s) => ({ have: s.visits.length, need: 10 }),
  },
  {
    id: "listener",
    title: { ru: "Внимательный слушатель", uz: "Diqqatli tinglovchi", en: "Attentive listener" },
    progress: (s) => ({ have: s.listens.filter((l) => l.completed).length, need: 10 }),
  },
];
