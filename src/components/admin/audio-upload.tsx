"use client";

import { useActionState, useState } from "react";
import { uploadAudio, type ActionResult } from "@/app/admin/actions";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS } from "@/lib/types";

/**
 * Загрузка профессиональной озвучки (п. 16 ТЗ).
 *
 * Длительность читаем в браузере перед отправкой: серверу для этого
 * понадобился бы ffprobe, а вносить внешнюю зависимость ради одного числа
 * не стоит. Значение уходит скрытым полем вместе с файлом.
 */
export default function AudioUpload({
  pois,
}: {
  pois: { id: number; slug: string; name: string; city: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    uploadAudio,
    null,
  );
  const [duration, setDuration] = useState(0);
  const [poiId, setPoiId] = useState(String(pois[0]?.id ?? ""));

  const selected = pois.find((p) => String(p.id) === poiId);

  function readDuration(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(Math.round(audio.duration) || 0);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => URL.revokeObjectURL(url));
  }

  const inputStyle = {
    background: "var(--bg-soft)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };

  return (
    <form action={formAction} className="max-w-2xl rounded-xl p-4 surface">
      <h2 className="mb-3 font-semibold">Загрузить аудиогид</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Объект</span>
          <select
            name="poi_id"
            value={poiId}
            onChange={(e) => setPoiId(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
          >
            {pois.map((p) => (
              <option key={p.id} value={p.id}>
                {p.city} — {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Язык</span>
          <select name="lang" className="w-full rounded-lg px-3 py-2 text-sm" style={inputStyle}>
            {MVP_LANGS.map((lang) => (
              <option key={lang} value={lang}>
                {LANG_FLAG[lang]} {LANG_LABEL[lang]}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Файл</span>
          <input
            type="file"
            name="file"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,.mp3,.m4a,.wav"
            required
            onChange={(e) => readDuration(e.target.files?.[0])}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
          />
          <span className="mt-1 block text-xs soft">
            mp3, m4a или wav, до 25 МБ.
            {duration > 0 && ` Длительность: ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`}
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Диктор</span>
          <input
            name="narrator"
            placeholder="Имя диктора или студия"
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
          />
        </label>
      </div>

      <input type="hidden" name="duration" value={duration} />
      <input type="hidden" name="poi_slug" value={selected?.slug ?? ""} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {pending ? "Загружаю…" : "Загрузить"}
        </button>
        {state && (
          <span className="text-sm" style={{ color: state.ok ? "var(--accent)" : "#e11d48" }}>
            {state.ok ? "✓ " : "✕ "}
            {state.message}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed soft">
        После загрузки приложение перестаёт озвучивать этот объект синтезом речи
        и начинает играть запись. Файлы складываются в{" "}
        <code>public/media/audio</code>; в продакшене их место — объектное
        хранилище с CDN.
      </p>
    </form>
  );
}
