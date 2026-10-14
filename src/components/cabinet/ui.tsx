"use client";

import { useState, type ReactNode } from "react";

/**
 * Кирпичики кабинета партнёра: поле, чипы, загрузка фото. Цвета — те же
 * переменные темы, что у приложения (globals.css), чтобы кабинет выглядел
 * частью HelloUZ, а не отдельным сайтом.
 */

export const цвет = {
  фон: "var(--cream)",
  карточка: "var(--surface)",
  рамка: "var(--border)",
  текст: "var(--text)",
  тихий: "var(--muted)",
  акцент: "var(--accent)",
  заливка: "var(--accent-fill)",
  мягкий: "var(--accent-soft)",
  золото: "#E9C46A",
  наЗолоте: "#1c1606",
  ошибка: "#c0392b",
};

export function Карточка({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`mb-3 rounded-3xl border p-4 shadow-sm sm:p-5 ${className}`}
      style={{ background: цвет.карточка, borderColor: цвет.рамка }}
    >
      {children}
    </section>
  );
}

export function Заголовок({ children, справа }: { children: ReactNode; справа?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[15px] font-bold" style={{ color: цвет.текст, fontFamily: "var(--font-heading)" }}>
        {children}
      </h2>
      {справа}
    </div>
  );
}

const полеКласс =
  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]";
const полеСтиль = { borderColor: цвет.рамка, color: цвет.текст, background: цвет.карточка };

export function Поле({
  подпись,
  children,
  className = "",
}: {
  подпись: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold" style={{ color: цвет.тихий }}>
        {подпись}
      </span>
      {children}
    </label>
  );
}

export function Ввод(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${полеКласс} ${props.className ?? ""}`}
      style={{ ...полеСтиль, ...props.style }}
    />
  );
}

export function Текст(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${полеКласс} resize-y ${props.className ?? ""}`}
      style={{ ...полеСтиль, ...props.style }}
    />
  );
}

export function Кнопка({
  children,
  вид = "главная",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { вид?: "главная" | "золото" | "тихая" | "опасная" }) {
  const стиль =
    вид === "главная"
      ? { background: цвет.заливка, color: "#fff" }
      : вид === "золото"
      ? { background: цвет.золото, color: цвет.наЗолоте }
      : вид === "опасная"
      ? { background: "transparent", color: цвет.ошибка, border: `1px solid ${цвет.ошибка}` }
      : { background: цвет.карточка, color: цвет.текст, border: `1px solid ${цвет.рамка}` };
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-transform active:scale-[0.97] disabled:opacity-50 ${className}`}
      style={{ ...стиль, ...props.style }}
    >
      {children}
    </button>
  );
}

/** Чипы-переключатели: языки, класс машины. */
export function Чипы<T extends string>({
  варианты,
  выбрано,
  onChange,
  несколько = true,
}: {
  варианты: { значение: T; подпись: string }[];
  выбрано: T[];
  onChange: (v: T[]) => void;
  несколько?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {варианты.map((в) => {
        const да = выбрано.includes(в.значение);
        return (
          <button
            type="button"
            key={в.значение}
            onClick={() =>
              onChange(
                несколько
                  ? да
                    ? выбрано.filter((x) => x !== в.значение)
                    : [...выбрано, в.значение]
                  : [в.значение],
              )
            }
            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              да
                ? { background: цвет.заливка, color: "#fff", borderColor: "transparent" }
                : { background: цвет.карточка, color: цвет.текст, borderColor: цвет.рамка }
            }
          >
            {да && несколько ? "✓ " : ""}
            {в.подпись}
          </button>
        );
      })}
    </div>
  );
}

/** Список строк с быстрыми пресетами и своим вводом: «что входит», темы. */
export function Теги({
  значения,
  onChange,
  пресеты = [],
  placeholder,
  максимум = 12,
}: {
  значения: string[];
  onChange: (v: string[]) => void;
  пресеты?: string[];
  placeholder: string;
  максимум?: number;
}) {
  const [ввод, setВвод] = useState("");
  const добавить = (с: string) => {
    const x = с.trim();
    if (!x || значения.includes(x) || значения.length >= максимум) return;
    onChange([...значения, x]);
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {значения.map((з) => (
          <span
            key={з}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: цвет.мягкий, color: цвет.акцент }}
          >
            {з}
            <button
              type="button"
              aria-label="×"
              onClick={() => onChange(значения.filter((x) => x !== з))}
              className="text-sm leading-none"
            >
              ×
            </button>
          </span>
        ))}
        {пресеты
          .filter((п) => !значения.includes(п))
          .map((п) => (
            <button
              type="button"
              key={п}
              onClick={() => добавить(п)}
              className="rounded-full border border-dashed px-2.5 py-1 text-xs"
              style={{ borderColor: цвет.рамка, color: цвет.тихий }}
            >
              + {п}
            </button>
          ))}
      </div>
      <Ввод
        value={ввод}
        placeholder={placeholder}
        onChange={(e) => setВвод(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            добавить(ввод);
            setВвод("");
          }
        }}
        onBlur={() => {
          добавить(ввод);
          setВвод("");
        }}
      />
    </div>
  );
}

/** Сжать снимок перед отправкой: до 1600 px по длинной стороне, WebP. */
export async function сжать(файл: File): Promise<string> {
  const url = URL.createObjectURL(файл);
  try {
    const img = await new Promise<HTMLImageElement>((ok, нет) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = нет;
      i.src = url;
    });
    const к = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * к);
    c.height = Math.round(img.height * к);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const webp = c.toDataURL("image/webp", 0.82);
    return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function загрузить(файл: File): Promise<string | null> {
  try {
    const dataUrl = await сжать(файл);
    const r = await fetch("/api/cabinet/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const d = (await r.json()) as { url?: string };
    return r.ok && d.url ? d.url : null;
  } catch {
    return null;
  }
}

/** Набор фото: добавить несколько сразу, удалить, сделать обложкой. */
export function Фотографии({
  фото,
  onChange,
  подсказка,
  кнопка,
  ошибка,
  максимум = 12,
}: {
  фото: string[];
  onChange: (v: string[]) => void;
  подсказка: string;
  кнопка: string;
  ошибка: string;
  максимум?: number;
}) {
  const [идёт, setИдёт] = useState(false);
  const [сбой, setСбой] = useState(false);
  async function выбрать(e: React.ChangeEvent<HTMLInputElement>) {
    const файлы = Array.from(e.target.files ?? []).slice(0, максимум - фото.length);
    e.target.value = "";
    if (!файлы.length) return;
    setИдёт(true);
    setСбой(false);
    const новые: string[] = [];
    for (const ф of файлы) {
      const url = await загрузить(ф);
      if (url) новые.push(url);
      else setСбой(true);
    }
    onChange([...фото, ...новые]);
    setИдёт(false);
  }
  return (
    <div>
      <p className="mb-2 text-xs leading-snug" style={{ color: цвет.тихий }}>
        {подсказка}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {фото.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl"
            style={{ background: цвет.мягкий }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span
                className="absolute left-1 top-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                style={{ background: цвет.золото, color: цвет.наЗолоте }}
              >
                ★
              </span>
            )}
            <div className="absolute right-1 top-1 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  aria-label="★"
                  onClick={() => onChange([src, ...фото.filter((x) => x !== src)])}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-xs"
                  style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                >
                  ★
                </button>
              )}
              <button
                type="button"
                aria-label="×"
                onClick={() => onChange(фото.filter((x) => x !== src))}
                className="flex h-6 w-6 items-center justify-center rounded-md text-sm"
                style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {фото.length < максимум && (
          <label
            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-xs font-semibold"
            style={{ borderColor: цвет.рамка, color: цвет.акцент }}
          >
            <span className="text-2xl">{идёт ? "…" : "＋"}</span>
            {кнопка}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={выбрать}
              disabled={идёт}
            />
          </label>
        )}
      </div>
      {сбой && (
        <p className="mt-2 text-xs" style={{ color: цвет.ошибка }}>
          {ошибка}
        </p>
      )}
    </div>
  );
}

/** Одно фото: аватар партнёра. */
export function Аватар({
  src,
  onChange,
  подпись,
}: {
  src: string;
  onChange: (v: string) => void;
  подпись: string;
}) {
  const [идёт, setИдёт] = useState(false);
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span
        className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-2xl"
        style={{ borderColor: цвет.золото, background: цвет.мягкий }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : идёт ? "…" : "📷"}
      </span>
      <span className="text-sm font-semibold" style={{ color: цвет.акцент }}>
        {подпись}
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const ф = e.target.files?.[0];
          e.target.value = "";
          if (!ф) return;
          setИдёт(true);
          const url = await загрузить(ф);
          setИдёт(false);
          if (url) onChange(url);
        }}
      />
    </label>
  );
}
