"use client";

import { useRef, useState } from "react";
import { Btn } from "./shared";

/**
 * Фото в панели: загрузить с компьютера или телефона — или вставить
 * ссылку. Загруженное ложится в наше хранилище (/api/media/…), так что
 * искать, где разместить снимок, редактору не нужно.
 *
 * Перед загрузкой снимок сжимается в браузере до 1600 пикселей по
 * длинной стороне: фото с телефона весит мегабайты, а в карточке нужно
 * несколько сотен килобайт. WebP держит и прозрачность, и качество.
 */

const СТОРОНА = 1600;

async function сжать(файл: File): Promise<string> {
  const картинка = await createImageBitmap(файл);
  const масштаб = Math.min(1, СТОРОНА / Math.max(картинка.width, картинка.height));
  const холст = document.createElement("canvas");
  холст.width = Math.round(картинка.width * масштаб);
  холст.height = Math.round(картинка.height * масштаб);
  холст.getContext("2d")?.drawImage(картинка, 0, 0, холст.width, холст.height);
  return холст.toDataURL("image/webp", 0.85);
}

/** Загрузить файл; вернуть ссылку или текст ошибки. */
export async function загрузитьФото(файл: File): Promise<{ url?: string; ошибка?: string }> {
  if (!файл.type.startsWith("image/") || файл.type === "image/svg+xml") return { ошибка: "Это не фото" };
  try {
    const dataUrl = await сжать(файл);
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && d.url) return { url: d.url };
    return {
      ошибка:
        d.error === "too_big"
          ? "Файл слишком большой"
          : res.status === 401 || res.status === 403
          ? "Нет прав"
          : "Не удалось загрузить",
    };
  } catch {
    return { ошибка: "Не удалось прочитать файл" };
  }
}

const поле: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
};
const подпись: React.CSSProperties = { color: "var(--color-muted)", fontFamily: "var(--font-mono)" };

function Миниатюра({ src, size = 56 }: { src?: string; size?: number }) {
  return src ? (
    <img
      src={src}
      alt=""
      className="shrink-0 rounded object-cover"
      style={{ width: size, height: size, background: "var(--color-dim)" }}
    />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded text-lg"
      style={{ width: size, height: size, background: "var(--color-dim)", color: "var(--color-muted)" }}
    >
      🖼
    </div>
  );
}

/** Одно фото: миниатюра, кнопка «Загрузить» и поле для ссылки. */
export function ПолеФото({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const выбор = useRef<HTMLInputElement>(null);
  const [идёт, setИдёт] = useState(false);
  const [ошибка, setОшибка] = useState<string | null>(null);

  async function файлВыбран(e: React.ChangeEvent<HTMLInputElement>) {
    const файл = e.target.files?.[0];
    e.target.value = "";
    if (!файл) return;
    setИдёт(true);
    setОшибка(null);
    const итог = await загрузитьФото(файл);
    setИдёт(false);
    if (итог.url) onChange(итог.url);
    else setОшибка(итог.ошибка ?? "Ошибка");
  }

  return (
    <div className="text-[10px]" style={подпись}>
      {label}
      <div className="mt-0.5 flex items-center gap-2">
        <Миниатюра src={value} />
        <div className="min-w-0 flex-1">
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value.trim() || undefined)}
            placeholder="ссылка на фото или загрузите →"
            className="w-full rounded px-2 py-1.5 text-xs outline-none"
            style={поле}
          />
          {ошибка && <p style={{ color: "var(--color-rose)" }}>{ошибка}</p>}
        </div>
        <input ref={выбор} type="file" accept="image/*" hidden onChange={файлВыбран} />
        <Btn small variant="ghost" onClick={() => выбор.current?.click()}>
          {идёт ? "…" : "Загрузить"}
        </Btn>
      </div>
    </div>
  );
}

/**
 * Галерея: несколько фото с порядком. Первое — обложка: его приложение
 * показывает в списках и первым в карточке.
 */
export function ГалереяФото({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const выбор = useRef<HTMLInputElement>(null);
  const [идёт, setИдёт] = useState(0);
  const [ошибка, setОшибка] = useState<string | null>(null);
  const [ссылка, setСсылка] = useState("");

  async function файлыВыбраны(e: React.ChangeEvent<HTMLInputElement>) {
    const файлы = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!файлы.length) return;
    setОшибка(null);
    setИдёт(файлы.length);
    const новые: string[] = [];
    for (const файл of файлы) {
      const итог = await загрузитьФото(файл);
      if (итог.url) новые.push(итог.url);
      else setОшибка(итог.ошибка ?? "Ошибка");
      setИдёт((n) => n - 1);
    }
    onChange([...values, ...новые]);
  }

  const сдвинуть = (i: number, на: number) => {
    const j = i + на;
    if (j < 0 || j >= values.length) return;
    const копия = [...values];
    [копия[i], копия[j]] = [копия[j], копия[i]];
    onChange(копия);
  };

  return (
    <div className="text-[10px]" style={подпись}>
      {label}
      <div className="mt-1 flex flex-wrap gap-2">
        {values.map((url, i) => (
          <div key={url + i} className="relative">
            <Миниатюра src={url} size={72} />
            {i === 0 && (
              <span
                className="absolute left-1 top-1 rounded px-1 text-[9px]"
                style={{ background: "var(--color-amber)", color: "var(--color-on-accent)" }}
              >
                обложка
              </span>
            )}
            <div className="mt-0.5 flex justify-between">
              <button type="button" onClick={() => сдвинуть(i, -1)} className="px-1" title="Левее">
                ←
              </button>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="px-1"
                title="Убрать"
                style={{ color: "var(--color-rose)" }}
              >
                ✕
              </button>
              <button type="button" onClick={() => сдвинуть(i, 1)} className="px-1" title="Правее">
                →
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => выбор.current?.click()}
          className="flex h-[72px] w-[72px] items-center justify-center rounded text-center"
          style={{ border: "1px dashed var(--color-border)", color: "var(--color-muted)" }}
        >
          {идёт ? `…${идёт}` : "+ фото"}
        </button>
      </div>
      <input ref={выбор} type="file" accept="image/*" multiple hidden onChange={файлыВыбраны} />
      <div className="mt-2 flex gap-2">
        <input
          value={ссылка}
          onChange={(e) => setСсылка(e.target.value)}
          placeholder="или ссылка на фото"
          className="min-w-0 flex-1 rounded px-2 py-1.5 text-xs outline-none"
          style={поле}
        />
        <Btn
          small
          variant="ghost"
          onClick={() => {
            if (!ссылка.trim()) return;
            onChange([...values, ссылка.trim()]);
            setСсылка("");
          }}
        >
          Добавить
        </Btn>
      </div>
      {ошибка && <p style={{ color: "var(--color-rose)" }}>{ошибка}</p>}
    </div>
  );
}
