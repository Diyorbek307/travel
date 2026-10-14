"use client";

import { useMemo, useState } from "react";
import { Ввод, Заголовок, Карточка, Кнопка, Поле, Теги, Текст, Фотографии, Чипы, цвет } from "./ui";
import type { КлючКабинета, ЯзыкКабинета } from "./texts";
import { ЯЗЫКИ_ПАРТНЁРОВ, type ТурПартнёра, type ДеньТура } from "@/lib/provider-rules";

/** Туры гида: список и редактор с программой по дням (1–14 дней). */

export function ТурыГида({
  providerId,
  туры,
  город,
  язык,
  t,
  onChange,
}: {
  providerId: string;
  туры: ТурПартнёра[];
  город: string;
  язык: ЯзыкКабинета;
  t: (к: КлючКабинета) => string;
  onChange: () => void;
}) {
  const [открыт, setОткрыт] = useState<ТурПартнёра | "новый" | null>(null);

  if (открыт)
    return (
      <РедакторТура
        providerId={providerId}
        тур={открыт === "новый" ? null : открыт}
        город={город}
        язык={язык}
        t={t}
        onDone={() => {
          setОткрыт(null);
          onChange();
        }}
      />
    );

  return (
    <div>
      <Кнопка вид="золото" className="mb-3 w-full" onClick={() => setОткрыт("новый")}>
        ＋ {t("tour_add")}
      </Кнопка>
      {!туры.length && (
        <Карточка>
          <p className="text-sm" style={{ color: цвет.тихий }}>
            {t("tours_empty")}
          </p>
        </Карточка>
      )}
      {туры.map((т) => (
        <button key={т.id} onClick={() => setОткрыт(т)} className="mb-3 block w-full text-left">
          <Карточка className="!mb-0">
            <div className="flex gap-3">
              <div
                className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl"
                style={{ background: цвет.мягкий }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {т.photos[0] ? <img src={т.photos[0]} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold" style={{ color: цвет.текст }}>
                  {т.title}
                </p>
                <p className="text-xs" style={{ color: цвет.тихий }}>
                  {t("tour_days")}: {т.days} · ${т.pricePerPerson} · {т.city}
                </p>
                {т.status === "hidden" && (
                  <span
                    className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: цвет.рамка, color: цвет.тихий }}
                  >
                    {t("hidden")}
                  </span>
                )}
              </div>
              <span style={{ color: цвет.акцент }}>›</span>
            </div>
          </Карточка>
        </button>
      ))}
    </div>
  );
}

function РедакторТура({
  providerId,
  тур,
  город,
  язык,
  t,
  onDone,
}: {
  providerId: string;
  тур: ТурПартнёра | null;
  город: string;
  язык: ЯзыкКабинета;
  t: (к: КлючКабинета) => string;
  onDone: () => void;
}) {
  const [ф, setФ] = useState({
    title: тур?.title ?? "",
    city: тур?.city ?? город,
    days: String(тур?.days ?? 1),
    pricePerPerson: тур ? String(тур.pricePerPerson) : "",
    priceGroup: тур?.priceGroup ? String(тур.priceGroup) : "",
    maxGroup: String(тур?.maxGroup ?? 8),
    languages: тур?.languages ?? ["ru", "en"],
    summary: тур?.summary ?? "",
    program: (тур?.program ?? [{ title: "", text: "" }]) as ДеньТура[],
    includes: тур?.includes ?? [],
    excludes: тур?.excludes ?? [],
    photos: тур?.photos ?? [],
    meetingPoint: тур?.meetingPoint ?? "",
    hidden: тур?.status === "hidden",
  });
  const [ошибка, setОшибка] = useState("");
  const [идёт, setИдёт] = useState(false);
  const дней = Math.max(1, Math.min(14, Number(ф.days) || 1));
  // Программа всегда на столько дней, сколько длится тур.
  const программа = Array.from({ length: дней }, (_, i) => ф.program[i] ?? { title: "", text: "" });
  const день = (i: number, поле: keyof ДеньТура, v: string) =>
    setФ((x) => ({ ...x, program: программа.map((д, j) => (j === i ? { ...д, [поле]: v } : д)) }));

  const языки = useMemo(() => {
    let имена: Intl.DisplayNames | null = null;
    try {
      имена = new Intl.DisplayNames([язык], { type: "language" });
    } catch {}
    return ЯЗЫКИ_ПАРТНЁРОВ.map((к) => ({ значение: к as string, подпись: имена?.of(к) ?? к }));
  }, [язык]);

  async function запрос(метод: "POST" | "PATCH" | "DELETE", тело: Record<string, unknown>) {
    setИдёт(true);
    setОшибка("");
    try {
      const r = await fetch("/api/cabinet/tours", {
        method: метод,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, ...тело }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setОшибка(t(`e_${d.error}` as КлючКабинета) || t("e_generic"));
        return;
      }
      onDone();
    } catch {
      setОшибка(t("e_generic"));
    } finally {
      setИдёт(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void запрос(тур ? "PATCH" : "POST", {
          ...(тур ? { id: тур.id } : {}),
          ...ф,
          days: дней,
          pricePerPerson: Number(ф.pricePerPerson),
          priceGroup: ф.priceGroup ? Number(ф.priceGroup) : undefined,
          maxGroup: Number(ф.maxGroup),
          program: программа,
          status: ф.hidden ? "hidden" : "active",
        });
      }}
    >
      <Карточка>
        <Заголовок
          справа={
            <button type="button" onClick={onDone} className="text-sm" style={{ color: цвет.тихий }}>
              ✕
            </button>
          }
        >
          🗺️ {тур ? t("tour_edit") : t("tour_add")}
        </Заголовок>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Поле подпись={t("tour_title")} className="col-span-2 sm:col-span-4">
            <Ввод
              required
              maxLength={100}
              value={ф.title}
              onChange={(e) => setФ({ ...ф, title: e.target.value })}
            />
          </Поле>
          <Поле подпись={t("tour_city")}>
            <Ввод value={ф.city} maxLength={60} onChange={(e) => setФ({ ...ф, city: e.target.value })} />
          </Поле>
          <Поле подпись={t("tour_days")}>
            <Ввод
              type="number"
              min={1}
              max={14}
              required
              value={ф.days}
              onChange={(e) => setФ({ ...ф, days: e.target.value })}
            />
          </Поле>
          <Поле подпись={t("tour_price_pp")}>
            <Ввод
              type="number"
              min={1}
              required
              value={ф.pricePerPerson}
              onChange={(e) => setФ({ ...ф, pricePerPerson: e.target.value })}
            />
          </Поле>
          <Поле подпись={t("tour_max")}>
            <Ввод
              type="number"
              min={1}
              max={60}
              required
              value={ф.maxGroup}
              onChange={(e) => setФ({ ...ф, maxGroup: e.target.value })}
            />
          </Поле>
          <Поле подпись={t("tour_price_group")} className="col-span-2">
            <Ввод
              type="number"
              min={1}
              value={ф.priceGroup}
              onChange={(e) => setФ({ ...ф, priceGroup: e.target.value })}
            />
          </Поле>
          <Поле подпись={t("tour_meeting")} className="col-span-2">
            <Ввод
              maxLength={160}
              value={ф.meetingPoint}
              onChange={(e) => setФ({ ...ф, meetingPoint: e.target.value })}
            />
          </Поле>
          <Поле подпись={t("languages")} className="col-span-2 sm:col-span-4">
            <Чипы варианты={языки} выбрано={ф.languages} onChange={(v) => setФ({ ...ф, languages: v })} />
          </Поле>
          <Поле подпись={t("tour_summary")} className="col-span-2 sm:col-span-4">
            <Текст
              rows={3}
              maxLength={600}
              value={ф.summary}
              onChange={(e) => setФ({ ...ф, summary: e.target.value })}
            />
          </Поле>
        </div>
      </Карточка>

      <Карточка>
        <Заголовок>🗓 {t("tour_program")}</Заголовок>
        <ol className="space-y-3">
          {программа.map((д, i) => (
            <li key={i} className="rounded-2xl border p-3" style={{ borderColor: цвет.рамка }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: цвет.акцент }}>
                {t("tour_day").replace("{n}", String(i + 1))}
              </p>
              <Ввод
                required
                placeholder={t("tour_day_title")}
                maxLength={100}
                value={д.title}
                onChange={(e) => день(i, "title", e.target.value)}
              />
              <Текст
                className="mt-2"
                rows={2}
                maxLength={1500}
                placeholder={t("tour_day_text")}
                value={д.text}
                onChange={(e) => день(i, "text", e.target.value)}
              />
            </li>
          ))}
        </ol>
      </Карточка>

      <Карточка>
        <div className="grid gap-3 sm:grid-cols-2">
          <Поле подпись={`✓ ${t("tour_includes")}`}>
            <Теги
              значения={ф.includes}
              onChange={(v) => setФ({ ...ф, includes: v })}
              placeholder={t("includes_ph")}
              максимум={15}
            />
          </Поле>
          <Поле подпись={`✕ ${t("tour_excludes")}`}>
            <Теги
              значения={ф.excludes}
              onChange={(v) => setФ({ ...ф, excludes: v })}
              placeholder={t("includes_ph")}
              максимум={15}
            />
          </Поле>
        </div>
      </Карточка>

      <Карточка>
        <Заголовок>📷 {t("sec_photos")}</Заголовок>
        <Фотографии
          фото={ф.photos}
          onChange={(v) => setФ({ ...ф, photos: v })}
          подсказка={t("photos_hint_guide")}
          кнопка={t("photo_add")}
          ошибка={t("e_photo")}
        />
        <label className="mt-3 flex items-center gap-2 text-sm" style={{ color: цвет.текст }}>
          <input
            type="checkbox"
            checked={ф.hidden}
            onChange={(e) => setФ({ ...ф, hidden: e.target.checked })}
            className="h-4 w-4"
          />
          {t("tour_hidden")}
        </label>
      </Карточка>

      {ошибка && (
        <p
          className="mb-3 rounded-xl px-3 py-2 text-sm"
          style={{ background: "rgba(192,57,43,0.08)", color: цвет.ошибка }}
        >
          {ошибка}
        </p>
      )}
      <div className="sticky bottom-3 z-10 flex gap-2">
        {тур && (
          <Кнопка
            type="button"
            вид="опасная"
            disabled={идёт}
            onClick={() => {
              if (confirm(t("tour_delete_q"))) void запрос("DELETE", { id: тур.id });
            }}
          >
            🗑
          </Кнопка>
        )}
        <Кнопка type="submit" вид="золото" disabled={идёт} className="flex-1 shadow-lg">
          {идёт ? "…" : t("save")}
        </Кнопка>
      </div>
    </form>
  );
}
