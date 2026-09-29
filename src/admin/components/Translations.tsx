"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LOCALE_META, LOCALES, type Locale } from "@/lib/i18n";
import { Btn, Card, PageHeader, StatCard, склонение } from "./shared";

/**
 * Переводы содержимого: всё, что добавили в панели, на девяти языках.
 *
 * Словарь приложения знает только стартовые записи — новое место или
 * ресторан туристы видели по-русски. Здесь видно, чего не хватает, можно
 * запустить автоперевод (Claude) и поправить любой перевод руками. Ручной
 * перевод главнее: автоперевод его больше не трогает.
 */

type Источник = "словарь" | "ии" | "вручную" | null;
type Строка = { ru: string; языки: Record<string, { текст: string; источник: Источник }> };
type Авто = { идёт: boolean; переведено: number; осталось: number; ошибка?: string; закончен?: string };
type Ответ = { включён: boolean; строки: Строка[]; авто: Авто };

const ЦЕЛИ = LOCALES.filter((l) => l !== "ru");
const НА_СТРАНИЦЕ = 40;

const МЕТКА: Record<Exclude<Источник, null>, { текст: string; цвет: string }> = {
  словарь: { текст: "словарь", цвет: "var(--color-muted)" },
  ии: { текст: "ИИ", цвет: "var(--color-teal)" },
  вручную: { текст: "вручную", цвет: "var(--color-amber)" },
};

export default function Translations() {
  const [данные, setДанные] = useState<Ответ | null>(null);
  const [ошибка, setОшибка] = useState("");
  const [язык, setЯзык] = useState<Locale>("en");
  const [фильтр, setФильтр] = useState<"нет" | "все" | "ии" | "вручную">("нет");
  const [поиск, setПоиск] = useState("");
  const [сколько, setСколько] = useState(НА_СТРАНИЦЕ);

  const загрузить = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/translations", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setДанные(await r.json());
      setОшибка("");
    } catch {
      setОшибка("Не удалось загрузить переводы");
    }
  }, []);
  useEffect(() => {
    void загрузить();
  }, [загрузить]);

  // Пока идёт автоперевод — обновляем каждые 4 секунды.
  const идёт = данные?.авто.идёт ?? false;
  useEffect(() => {
    if (!идёт) return;
    const id = setInterval(загрузить, 4000);
    return () => clearInterval(id);
  }, [идёт, загрузить]);

  const запустить = async () => {
    const r = await fetch("/api/admin/translations", { method: "POST" });
    if (r.status === 503) setОшибка("Автоперевод выключен: нет ключа ANTHROPIC_API_KEY");
    await загрузить();
  };

  const безПеревода = useMemo(
    () => (данные?.строки ?? []).filter((с) => ЦЕЛИ.some((l) => !с.языки[l]?.источник)).length,
    [данные],
  );

  const видимые = useMemo(() => {
    const q = поиск.trim().toLowerCase();
    return (данные?.строки ?? []).filter((с) => {
      const я = с.языки[язык];
      if (фильтр === "нет" && я?.источник) return false;
      if (фильтр === "ии" && я?.источник !== "ии") return false;
      if (фильтр === "вручную" && я?.источник !== "вручную") return false;
      if (q && !с.ru.toLowerCase().includes(q) && !я?.текст.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [данные, язык, фильтр, поиск]);

  const сохранить = async (ru: string, текст: string) => {
    const r = await fetch("/api/admin/translations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ru, locale: язык, text: текст }),
    });
    if (!r.ok) return setОшибка("Не сохранилось — обновите страницу");
    // Меняем на месте, без перезагрузки списка: строка не прыгает.
    setДанные(
      (д) =>
        д && {
          ...д,
          строки: д.строки.map((с) =>
            с.ru === ru
              ? {
                  ...с,
                  языки: {
                    ...с.языки,
                    [язык]: { текст: текст.trim(), источник: текст.trim() ? "вручную" : null },
                  },
                }
              : с,
          ),
        },
    );
  };

  const авто = данные?.авто;
  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Переводы"
        subtitle="Тексты мест, гостиниц, ресторанов и событий на языках туристов"
        action={<Btn onClick={запустить}>{идёт ? "Переводим…" : "✨ Перевести недостающее"}</Btn>}
      />

      {данные && !данные.включён && (
        <Card className="mb-5 p-4">
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            Автоперевод включится, когда в Render добавят переменную <b>ANTHROPIC_API_KEY</b>. Пока переводы
            можно вписывать вручную — туристы увидят их сразу.
          </p>
        </Card>
      )}
      {авто && (авто.идёт || авто.закончен || (авто.ошибка && авто.ошибка !== "off")) && (
        <Card className="mb-5 p-4">
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            {авто.идёт
              ? `Переводим: готово ${авто.переведено}, осталось ${авто.осталось}…`
              : авто.ошибка
              ? "Автоперевод прервался: Claude не ответил. Попробуйте ещё раз позже."
              : `Готово: переведено ${склонение(авто.переведено, ["строка", "строки", "строк"])}.${
                  авто.осталось ? ` Осталось ${авто.осталось} — нажмите ещё раз.` : ""
                }`}
          </p>
        </Card>
      )}
      {ошибка && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-rose)" }}>
          {ошибка}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Строк в содержимом" value={String(данные?.строки.length ?? "…")} />
        <StatCard label="Не хватает перевода" value={String(данные ? безПеревода : "…")} />
        <StatCard label="Языков" value={String(ЦЕЛИ.length)} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {ЦЕЛИ.map((l) => (
          <button
            key={l}
            onClick={() => {
              setЯзык(l);
              setСколько(НА_СТРАНИЦЕ);
            }}
            className="rounded px-2.5 py-1 text-xs font-medium"
            style={
              язык === l
                ? { background: "var(--color-amber)", color: "var(--color-on-accent)" }
                : { border: "1px solid var(--color-border)", color: "var(--color-muted)" }
            }
          >
            {LOCALE_META[l].label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["нет", "Без перевода"],
            ["все", "Все"],
            ["ии", "От ИИ"],
            ["вручную", "Вручную"],
          ] as const
        ).map(([к, подпись]) => (
          <button
            key={к}
            onClick={() => {
              setФильтр(к);
              setСколько(НА_СТРАНИЦЕ);
            }}
            className="rounded-full px-3 py-1 text-xs"
            style={
              фильтр === к
                ? { background: "var(--color-text)", color: "var(--color-bg)" }
                : { border: "1px solid var(--color-border)", color: "var(--color-muted)" }
            }
          >
            {подпись}
          </button>
        ))}
        <input
          value={поиск}
          onChange={(e) => setПоиск(e.target.value)}
          placeholder="Поиск по тексту"
          className="ml-auto w-full rounded px-3 py-1.5 text-sm outline-none sm:w-64"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </div>

      {данные && видимые.length === 0 && (
        <p className="py-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
          {фильтр === "нет" ? "Всё переведено на этот язык 🎉" : "Ничего не нашлось"}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {видимые.slice(0, сколько).map((с) => (
          <СтрокаПеревода
            key={`${язык}:${с.ru}`}
            ru={с.ru}
            значение={с.языки[язык]}
            rtl={LOCALE_META[язык].dir === "rtl"}
            onSave={(т) => сохранить(с.ru, т)}
          />
        ))}
      </div>
      {видимые.length > сколько && (
        <div className="mt-4 text-center">
          <Btn variant="ghost" onClick={() => setСколько(сколько + НА_СТРАНИЦЕ)}>
            Показать ещё ({видимые.length - сколько})
          </Btn>
        </div>
      )}
    </div>
  );
}

function СтрокаПеревода({
  ru,
  значение,
  rtl,
  onSave,
}: {
  ru: string;
  значение?: { текст: string; источник: Источник };
  rtl: boolean;
  onSave: (текст: string) => Promise<void>;
}) {
  const [текст, setТекст] = useState(значение?.текст ?? "");
  const [сохранено, setСохранено] = useState(false);
  const длинный = ru.length > 80;
  const метка = значение?.источник ? МЕТКА[значение.источник] : null;

  const сохранить = async () => {
    if (текст.trim() === (значение?.текст ?? "").trim()) return;
    await onSave(текст);
    setСохранено(true);
    setTimeout(() => setСохранено(false), 1500);
  };

  return (
    <Card className="grid gap-2 p-3 sm:grid-cols-2">
      <p className="text-sm leading-snug" style={{ color: "var(--color-text)" }}>
        {ru}
      </p>
      <div>
        <textarea
          value={текст}
          onChange={(e) => setТекст(e.target.value)}
          onBlur={сохранить}
          dir={rtl ? "rtl" : "ltr"}
          rows={длинный ? 3 : 1}
          placeholder="Нет перевода — туристы видят русский текст"
          className="w-full resize-y rounded px-2.5 py-1.5 text-sm outline-none"
          style={{
            background: "var(--color-bg)",
            border: `1px solid ${метка ? "var(--color-border)" : "var(--color-rose)"}`,
            color: "var(--color-text)",
          }}
        />
        <div className="mt-1 flex items-center gap-2 text-[11px]">
          {метка && <span style={{ color: метка.цвет }}>● {метка.текст}</span>}
          {сохранено && <span style={{ color: "var(--color-teal)" }}>Сохранено</span>}
        </div>
      </div>
    </Card>
  );
}
