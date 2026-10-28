"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/components/lang-provider";
import { useДеньги } from "@/lib/money";
import { ГалереяЗаведения } from "./venue-details";
import {
  ACCENT_FILL,
  ACCENT_SOFT,
  BORDER,
  CREAM,
  GOLD,
  GREEN,
  MUTED,
  ON_GOLD,
  SURFACE,
  TEXT,
  WHITE,
  glass,
} from "@/lib/theme";
import type { TKey } from "@/lib/i18n";
import type { КлассМашины, ПартнёрПубличный, ТурПартнёра } from "@/lib/provider-rules";

/**
 * Водители и гиды в приложении туриста: каталоги, карточки и заявка.
 *
 * Данные — из /api/providers: только проверенные партнёры с оплаченным
 * размещением, «Рекомендуем» сверху (порядок задаёт сервер). Карточку
 * открывает событие «hellouz:partner» — его слушает page.tsx и кладёт
 * карточку поверх вкладки так же, как карточку места.
 */

export type ДеталиПартнёра =
  | { kind: "driver"; value: ПартнёрПубличный }
  | { kind: "guide"; value: ПартнёрПубличный }
  | { kind: "guidetour"; value: ТурПартнёра };

export function открытьПартнёра(д: ДеталиПартнёра) {
  window.dispatchEvent(new CustomEvent<ДеталиПартнёра>("hellouz:partner", { detail: д }));
}

type Каталог = { drivers: ПартнёрПубличный[]; guides: ПартнёрПубличный[]; tours: ТурПартнёра[] };
const ПУСТО: Каталог = { drivers: [], guides: [], tours: [] };
let кеш: { данные: Каталог; когда: number } | null = null;

const ЛАТИНИЦА: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "oʻ", қ: "q", ғ: "gʻ", ҳ: "h",
};
/** По-узбекски латиница своя: х — x, ж — j. */
const ЛАТИНИЦА_UZ: Record<string, string> = { ...ЛАТИНИЦА, х: "x", ж: "j", ц: "s", щ: "sh" };

/**
 * Имя партнёра латиницей. Имя не переводят, но «Азиз К.» кириллицей
 * японец или турок не прочтёт — пишем теми же звуками латиницей.
 */
function латиницей(имя: string, lang: string): string {
  const буквы = lang === "uz" ? ЛАТИНИЦА_UZ : ЛАТИНИЦА;
  return имя.replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g, (ч) => {
    const м = ч.toLowerCase();
    const л = буквы[м] ?? ч;
    return ч === м ? л : л.charAt(0).toUpperCase() + л.slice(1);
  });
}

/**
 * Анкеты и туры на языке туриста: тексты — через словарь и переводы
 * панели (трК), имена — латиницей. Город не трогаем: по нему фильтруют
 * чипы городов, его переводят при показе.
 */
function перевестиКаталог(к: Каталог, lang: string, трК: (s: string) => string): Каталог {
  if (lang === "ru") return к;
  const п = (x: ПартнёрПубличный): ПартнёрПубличный => ({
    ...x,
    name: латиницей(трК(x.name), lang),
    bio: трК(x.bio),
    includes: x.includes.map(трК),
    specialties: x.specialties?.map(трК),
    car: x.car ? { ...x.car, color: трК(x.car.color) } : x.car,
  });
  return {
    drivers: к.drivers.map(п),
    guides: к.guides.map(п),
    tours: к.tours.map((т) => ({
      ...т,
      title: трК(т.title),
      summary: трК(т.summary),
      program: т.program.map((д) => ({ ...д, title: трК(д.title), text: д.text ? трК(д.text) : д.text })),
      includes: т.includes.map(трК),
      excludes: т.excludes.map(трК),
      meetingPoint: трК(т.meetingPoint),
    })),
  };
}

/** Каталог партнёров: один запрос на минуту на всё приложение. */
export function usePartners(): Каталог & { загружен: boolean } {
  const { lang, трК } = useT();
  const [данные, setДанные] = useState<Каталог | null>(кеш?.данные ?? null);
  useEffect(() => {
    if (кеш && Date.now() - кеш.когда < 60_000) return;
    let живо = true;
    fetch("/api/providers")
      .then((r) => (r.ok ? r.json() : ПУСТО))
      .then((d: Каталог) => {
        кеш = { данные: d, когда: Date.now() };
        if (живо) setДанные(d);
      })
      .catch(() => живо && setДанные(ПУСТО));
    return () => {
      живо = false;
    };
  }, []);
  const переведено = useMemo(() => перевестиКаталог(данные ?? ПУСТО, lang, трК), [данные, lang, трК]);
  return { ...переведено, загружен: данные !== null };
}

const КЛАСС_КЛЮЧ: Record<КлассМашины, TKey> = {
  economy: "pt_class_economy",
  comfort: "pt_class_comfort",
  business: "pt_class_business",
  minivan: "pt_class_minivan",
  bus: "pt_class_bus",
};

/** Название языка на языке интерфейса: «en» → «английский». */
function useЯзыки() {
  const { lang } = useT();
  return useMemo(() => {
    let имена: Intl.DisplayNames | null = null;
    try {
      имена = new Intl.DisplayNames([lang], { type: "language" });
    } catch {}
    return (коды: string[]) => коды.map((к) => имена?.of(к) ?? к).join(", ");
  }, [lang]);
}

const обложка = (п: ПартнёрПубличный) => п.photos[0] || п.photo || "";

/* ── Метки ────────────────────────────────────────────────────────────── */

function МеткаРекомендуем() {
  const { t } = useT();
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: GOLD, color: ON_GOLD }}
    >
      ★ {t("pt_recommended")}
    </span>
  );
}

function МеткаПроверен({ наФото = false }: { наФото?: boolean }) {
  const { t } = useT();
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={наФото ? { ...glass, color: WHITE } : { background: ACCENT_SOFT, color: GREEN }}
    >
      ✓ {t("pt_verified")}
    </span>
  );
}

/** Пример анкеты — не живой партнёр (data/provider-samples.ts). */
function МеткаПример({ наФото = false }: { наФото?: boolean }) {
  const { t } = useT();
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={наФото ? { ...glass, color: WHITE } : { background: "rgba(120,120,120,0.14)", color: MUTED }}
    >
      ◌ {t("pt_sample")}
    </span>
  );
}

const Метка = ({ п, наФото = false }: { п: { sample?: boolean }; наФото?: boolean }) =>
  п.sample ? <МеткаПример наФото={наФото} /> : <МеткаПроверен наФото={наФото} />;

/** Плашка в карточке примера: почему нельзя связаться. */
function ПлашкаПримера({ кредит }: { кредит?: string }) {
  const { t } = useT();
  return (
    <div
      className="mb-3 rounded-2xl border border-dashed p-3.5 text-xs leading-relaxed"
      style={{ borderColor: BORDER, background: SURFACE, color: MUTED }}
    >
      <p>◌ {t("pt_sample_note")}</p>
      {кредит && (
        <p className="mt-1.5 text-[10px] opacity-80">
          {t("pt_photo")}: {кредит}
        </p>
      )}
    </div>
  );
}

function Аватар({ src, имя, размер = 40 }: { src: string; имя: string; размер?: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={имя}
      className="rounded-full object-cover"
      style={{ width: размер, height: размер }}
    />
  ) : (
    <span
      className="flex items-center justify-center rounded-full font-bold"
      style={{ width: размер, height: размер, background: ACCENT_SOFT, color: GREEN, fontSize: размер / 2.6 }}
    >
      {имя.slice(0, 1).toUpperCase()}
    </span>
  );
}

/* ── Каталог водителей ────────────────────────────────────────────────── */

export function КаталогВодителей({ город }: { город: string | null }) {
  const { t } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  const { drivers, загружен } = usePartners();
  const [класс, setКласс] = useState<КлассМашины | null>(null);

  const список = drivers.filter(
    (п) => (!город || п.city === город || п.cities.includes(город)) && (!класс || п.car?.class === класс),
  );
  const классы = Array.from(new Set(drivers.map((п) => п.car?.class).filter(Boolean))) as КлассМашины[];

  return (
    <div>
      {классы.length > 1 && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 hide-scroll">
          {[null, ...классы].map((к) => (
            <button
              key={к ?? "*"}
              onClick={() => setКласс(к)}
              className="flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={
                класс === к
                  ? { background: ACCENT_FILL, color: WHITE, borderColor: "transparent" }
                  : { background: SURFACE, color: TEXT, borderColor: BORDER }
              }
            >
              {к ? t(КЛАСС_КЛЮЧ[к]) : t("pt_all")}
            </button>
          ))}
        </div>
      )}
      {загружен && !список.length && <Пусто />}
      <div className="grid gap-3 lg:grid-cols-2">
        {список.map((п, i) => (
          <КарточкаВодителя key={п.id} п={п} номер={i} />
        ))}
      </div>
      <Приглашение вид="driver" />
    </div>
  );
}

/**
 * Карточка в списке — как резюме на HeadHunter: главное крупно (машина и
 * цена), дальше строки фактов с иконками, теги «что входит» и кнопки
 * действия прямо в списке, без захода в карточку.
 */
function Резюме({
  рекомендуем,
  onOpen,
  номер,
  children,
}: {
  рекомендуем: boolean;
  onOpen: () => void;
  номер: number;
  children: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" ? onOpen() : undefined)}
      className="lazy-card cursor-pointer overflow-hidden rounded-3xl border text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      style={{
        background: SURFACE,
        borderColor: рекомендуем ? GOLD : BORDER,
        animationDelay: `${номер * 40}ms`,
      }}
    >
      {рекомендуем && (
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold"
          style={{ background: GOLD, color: ON_GOLD }}
        >
          ★ {t("pt_recommended")}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

function Факт({ иконка, children }: { иконка: string; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs leading-snug" style={{ color: MUTED }}>
      <span className="w-4 flex-shrink-0 text-center">{иконка}</span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function Теги({ слова }: { слова: string[] }) {
  if (!слова.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {слова.slice(0, 5).map((с) => (
        <span
          key={с}
          className="rounded-lg px-2 py-0.5 text-[11px] font-medium"
          style={{ background: ACCENT_SOFT, color: GREEN }}
        >
          {с}
        </span>
      ))}
    </div>
  );
}

/** Кнопки в карточке списка: заявка (открывает карточку) и звонок. */
function Действия({ телефон, onOpen, пример }: { телефон: string; onOpen: () => void; пример?: boolean }) {
  const { t } = useT();
  if (пример)
    return (
      <div className="mt-3.5" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onOpen}
          className="w-full rounded-xl border py-2.5 text-xs font-bold transition-transform active:scale-95"
          style={{ borderColor: BORDER, background: SURFACE, color: TEXT }}
        >
          {t("common_open")} →
        </button>
      </div>
    );
  return (
    <div className="mt-3.5 flex gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onOpen}
        className="flex-1 rounded-xl py-2.5 text-xs font-bold transition-transform active:scale-95"
        style={{ background: ACCENT_FILL, color: WHITE }}
      >
        {t("pt_request")}
      </button>
      <a
        href={`tel:${телефон.replace(/[^\d+]/g, "")}`}
        aria-label={t("pt_call")}
        className="flex w-12 items-center justify-center rounded-xl border text-base"
        style={{ borderColor: BORDER, background: SURFACE }}
      >
        📞
      </a>
    </div>
  );
}

function КарточкаВодителя({ п, номер }: { п: ПартнёрПубличный; номер: number }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  const открыть = () => открытьПартнёра({ kind: "driver", value: п });
  return (
    <Резюме рекомендуем={п.promoted} onOpen={открыть} номер={номер}>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[15px] font-bold leading-tight"
            style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
          >
            {п.car ? `${п.car.make} ${п.car.model}` : п.name}
            {п.car && (
              <span className="ml-1.5 text-xs font-semibold" style={{ color: GREEN }}>
                {t(КЛАСС_КЛЮЧ[п.car.class])}
              </span>
            )}
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: TEXT }}>
            {дг.цена(`$${п.priceDay}`)}{" "}
            <span className="text-xs font-medium" style={{ color: MUTED }}>
              {t("pt_per_day")} · {t("pt_hours").replace("{n}", String(п.hoursPerDay))}
            </span>
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold" style={{ color: TEXT }}>
              {п.name}
            </span>
            <Метка п={п} />
          </div>
        </div>
        <div
          className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl"
          style={{ background: ACCENT_SOFT }}
        >
          {обложка(п) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={обложка(п)} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-3xl">🚗</span>
          )}
        </div>
      </div>
      <div className="mt-2.5 space-y-1">
        <Факт иконка="📍">
          {трК(п.city)}
          {п.cities.length > 0 &&
            ` · ${п.cities
              .filter((c) => c !== п.city)
              .slice(0, 3)
              .map(трК)
              .join(", ")}`}
        </Факт>
        {п.car && (
          <Факт иконка="🚘">
            {п.car.year} · {t("pt_seats").replace("{n}", String(п.car.seats))}
            {п.car.ac && ` · ❄ ${t("pt_ac")}`}
          </Факт>
        )}
        <Факт иконка="🗣">{языки(п.languages)}</Факт>
        {п.experienceYears > 0 && (
          <Факт иконка="⭐">{t("pt_experience").replace("{n}", String(п.experienceYears))}</Факт>
        )}
      </div>
      <Теги слова={п.includes} />
      <Действия телефон={п.phone} onOpen={открыть} пример={п.sample} />
    </Резюме>
  );
}

/* ── Каталог гидов и туров ────────────────────────────────────────────── */

export function КаталогГидов({ город }: { город: string | null }) {
  const { t } = useT();
  const { guides, tours, загружен } = usePartners();
  const [вид, setВид] = useState<"tours" | "guides">("tours");
  const гиды = guides.filter((п) => !город || п.city === город || п.cities.includes(город));
  const туры = tours.filter((т) => !город || т.city === город);
  const активныйВид = туры.length ? вид : "guides";

  return (
    <div>
      <div className="mb-3 inline-flex rounded-full p-1" style={{ background: ACCENT_SOFT }}>
        {(["tours", "guides"] as const).map((в) => (
          <button
            key={в}
            onClick={() => setВид(в)}
            className="rounded-full px-4 py-1.5 text-xs font-bold transition-colors"
            style={активныйВид === в ? { background: ACCENT_FILL, color: WHITE } : { color: GREEN }}
          >
            {t(в === "tours" ? "pt_tours_tab" : "pt_guides_tab")} ·{" "}
            {в === "tours" ? туры.length : гиды.length}
          </button>
        ))}
      </div>
      {загружен && !(активныйВид === "tours" ? туры : гиды).length && <Пусто />}
      <div className="grid gap-3 lg:grid-cols-2">
        {активныйВид === "tours"
          ? туры.map((т, i) => (
              <КарточкаТура key={т.id} тур={т} гид={guides.find((g) => g.id === т.providerId)} номер={i} />
            ))
          : гиды.map((п, i) => (
              <КарточкаГида
                key={п.id}
                гид={п}
                туров={tours.filter((т) => т.providerId === п.id).length}
                номер={i}
              />
            ))}
      </div>
      <Приглашение вид="guide" />
    </div>
  );
}

function КарточкаГида({ гид, туров, номер }: { гид: ПартнёрПубличный; туров: number; номер: number }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  const открыть = () => открытьПартнёра({ kind: "guide", value: гид });
  return (
    <Резюме рекомендуем={гид.promoted} onOpen={открыть} номер={номер}>
      <div className="flex gap-3">
        <Аватар src={гид.photo} имя={гид.name} размер={64} />
        <div className="min-w-0 flex-1">
          <p
            className="text-[15px] font-bold leading-tight"
            style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
          >
            {гид.name}
          </p>
          <p className="mt-0.5 text-xs font-semibold" style={{ color: GREEN }}>
            {t("pt_guide_word")}
            {гид.licensed && ` · 🎓 ${t("pt_licensed")}`}
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: TEXT }}>
            {дг.цена(`$${гид.priceDay}`)}{" "}
            <span className="text-xs font-medium" style={{ color: MUTED }}>
              {t("pt_per_day")}
              {гид.priceHour ? ` · ${дг.цена(`$${гид.priceHour}`)} ${t("pt_per_hour")}` : ""}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <Метка п={гид} />
      </div>
      <div className="mt-2 space-y-1">
        <Факт иконка="📍">
          {трК(гид.city)}
          {гид.cities.length > 0 &&
            ` · ${гид.cities
              .filter((c) => c !== гид.city)
              .slice(0, 3)
              .map(трК)
              .join(", ")}`}
        </Факт>
        <Факт иконка="🗣">{языки(гид.languages)}</Факт>
        {гид.experienceYears > 0 && (
          <Факт иконка="⭐">{t("pt_experience").replace("{n}", String(гид.experienceYears))}</Факт>
        )}
        {туров > 0 && (
          <Факт иконка="🗺️">
            {t("pt_tours_tab")}: {туров}
          </Факт>
        )}
      </div>
      <Теги слова={гид.specialties ?? []} />
      <Действия телефон={гид.phone} onOpen={открыть} пример={гид.sample} />
    </Резюме>
  );
}

function КарточкаТура({ тур, гид, номер }: { тур: ТурПартнёра; гид?: ПартнёрПубличный; номер: number }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  const открыть = () => открытьПартнёра({ kind: "guidetour", value: тур });
  return (
    <Резюме рекомендуем={Boolean(гид?.promoted)} onOpen={открыть} номер={номер}>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: ACCENT_FILL, color: WHITE }}
          >
            {t("pt_days_n").replace("{n}", String(тур.days))}
          </span>
          <p
            className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-tight"
            style={{ color: TEXT, fontFamily: "var(--font-heading)" }}
          >
            {тур.title}
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: TEXT }}>
            {t("pt_from_pp").replace("{p}", дг.цена(`$${тур.pricePerPerson}`))}
          </p>
        </div>
        <div
          className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl"
          style={{ background: ACCENT_SOFT }}
        >
          {тур.photos[0] || гид?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={тур.photos[0] || гид?.photo}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-3xl">🗺️</span>
          )}
        </div>
      </div>
      <div className="mt-2.5 space-y-1">
        <Факт иконка="📍">{трК(тур.city)}</Факт>
        {гид && (
          <Факт иконка="👤">
            {t("pt_guide_word")}: {гид.name} {гид.sample ? `· ${t("pt_sample")}` : "✓"}
          </Факт>
        )}
        <Факт иконка="👥">{t("pt_group_max").replace("{n}", String(тур.maxGroup))}</Факт>
        {тур.languages.length > 0 && <Факт иконка="🗣">{языки(тур.languages)}</Факт>}
      </div>
      <Теги слова={тур.program.map((д) => д.title)} />
      {гид && <Действия телефон={гид.phone} onOpen={открыть} пример={гид.sample || тур.sample} />}
    </Резюме>
  );
}

/**
 * Приглашение для самих гидов и водителей. Анкеты и туры они заполняют
 * в кабинете (/cabinet), но путь туда был только из профиля — те, кому он
 * нужен, его не находили. Ставим прямо под каталогом, где они себя ищут.
 */
function Приглашение({ вид }: { вид: "guide" | "driver" }) {
  const { t } = useT();
  return (
    <a
      href="/cabinet"
      className="mt-4 flex items-center gap-3 rounded-3xl border p-4 transition-transform active:scale-[0.98]"
      style={{ borderColor: GOLD, background: "linear-gradient(135deg, rgba(233,196,106,0.18), transparent)" }}
    >
      <span
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ background: GOLD }}
      >
        {вид === "guide" ? "🧭" : "🚗"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold" style={{ color: TEXT }}>
          {t(вид === "guide" ? "pt_join_guide" : "pt_join_driver")}
        </span>
        <span className="mt-0.5 block text-xs leading-snug" style={{ color: MUTED }}>
          {t(вид === "guide" ? "pt_join_guide_sub" : "pt_join_driver_sub")}
        </span>
      </span>
      <span className="text-lg" style={{ color: GREEN }}>
        →
      </span>
    </a>
  );
}

function Пусто() {
  const { t } = useT();
  return (
    <p className="py-10 text-center text-sm" style={{ color: MUTED }}>
      {t("pt_empty")}
    </p>
  );
}

/* ── Карточки (подробно) ──────────────────────────────────────────────── */

function Шапка({ фото, onBack, children }: { фото: string; onBack: () => void; children: React.ReactNode }) {
  const { t } = useT();
  return (
    <div className="relative flex-shrink-0" style={{ height: 260, background: ACCENT_SOFT }}>
      {фото && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={фото} alt="" className="skel hero-in h-full w-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 55%,transparent 100%)",
        }}
      />
      <button
        aria-label={t("common_back")}
        onClick={onBack}
        className="absolute left-4 top-12 flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-sm"
        style={{ ...glass }}
      >
        <svg
          className="rtl-flip"
          width="16"
          height="16"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-4">{children}</div>
    </div>
  );
}

function Блок({ заголовок, children }: { заголовок?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      {заголовок && (
        <p className="mb-2 text-sm font-bold" style={{ color: TEXT }}>
          {заголовок}
        </p>
      )}
      {children}
    </div>
  );
}

function Список({ пункты, знак = "✓", цвет = GREEN }: { пункты: string[]; знак?: string; цвет?: string }) {
  return (
    <ul className="space-y-1.5">
      {пункты.map((п) => (
        <li key={п} className="flex gap-2 text-sm leading-snug" style={{ color: MUTED }}>
          <span style={{ color: цвет }}>{знак}</span>
          {п}
        </li>
      ))}
    </ul>
  );
}

/** Связь напрямую: звонок, Telegram, WhatsApp. */
function Связь({ п }: { п: ПартнёрПубличный }) {
  const { t } = useT();
  const цифры = (x: string) => x.replace(/[^\d+]/g, "");
  const кнопка = "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold";
  return (
    <div className="mb-3 flex gap-2">
      <a href={`tel:${цифры(п.phone)}`} className={кнопка} style={{ background: ACCENT_FILL, color: WHITE }}>
        📞 {t("pt_call")}
      </a>
      {п.whatsapp && (
        <a
          href={`https://wa.me/${цифры(п.whatsapp).replace("+", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={кнопка}
          style={{ background: "#25D366", color: WHITE }}
        >
          WhatsApp
        </a>
      )}
      {п.telegram && (
        <a
          href={`https://t.me/${п.telegram.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={кнопка}
          style={{ background: "#229ED9", color: WHITE }}
        >
          Telegram
        </a>
      )}
    </div>
  );
}

function useПросмотр(id: string) {
  useEffect(() => {
    void fetch("/api/providers/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
  }, [id]);
}

export function ДеталиВодителя({ п, onBack }: { п: ПартнёрПубличный; onBack: () => void }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  useПросмотр(п.id);
  const фото = [...п.photos, ...(п.photo ? [п.photo] : [])];
  return (
    <div className="flex h-full animate-slide-up flex-col" style={{ background: CREAM }}>
      <Шапка фото={обложка(п)} onBack={onBack}>
        <div className="mb-1.5 flex gap-1.5">
          {п.promoted && <МеткаРекомендуем />}
          <Метка п={п} наФото />
        </div>
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {п.car ? `${п.car.make} ${п.car.model}` : п.name}
        </h2>
        <p className="mt-0.5 text-xs text-white/75">
          {п.name} · {трК(п.city)}
        </p>
      </Шапка>
      <div className="hide-scroll flex-1 overflow-y-auto px-4 pt-4">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            ["💵", `${дг.цена(`$${п.priceDay}`)}`, t("pt_per_day").replace("/ ", "")],
            ["🕐", String(п.hoursPerDay), t("pt_hours").replace("{n}", "").trim()],
            ["💺", String(п.car?.seats ?? "—"), t("pt_seats").replace("{n}", "").replace(":", "").trim()],
          ].map(([e, v, k]) => (
            <div
              key={k}
              className="rounded-2xl border bg-white p-2.5 text-center shadow-sm"
              style={{ borderColor: BORDER }}
            >
              <p className="text-base">{e}</p>
              <p className="mt-1 text-[11px] font-semibold" style={{ color: TEXT }}>
                {v}
              </p>
              <p className="text-[9px]" style={{ color: MUTED }}>
                {k}
              </p>
            </div>
          ))}
        </div>
        {п.car && (
          <Блок заголовок={`🚗 ${t("pt_car")}`}>
            <p className="text-sm" style={{ color: TEXT }}>
              {п.car.make} {п.car.model} · {п.car.year}
              {п.car.color && ` · ${п.car.color}`}
            </p>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              {t(КЛАСС_КЛЮЧ[п.car.class])} · {t("pt_seats").replace("{n}", String(п.car.seats))}
              {п.car.ac && ` · ❄ ${t("pt_ac")}`}
            </p>
            {п.priceHour ? (
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                {дг.цена(`$${п.priceHour}`)} {t("pt_per_hour")}
              </p>
            ) : null}
          </Блок>
        )}
        <ГалереяЗаведения фото={фото} />
        {п.sample ? <ПлашкаПримера кредит={п.photoCredit} /> : <Связь п={п} />}
        {п.includes.length > 0 && (
          <Блок заголовок={t("pt_includes")}>
            <Список пункты={п.includes} />
          </Блок>
        )}
        <О_партнёре п={п} языки={языки(п.languages)} />
        {!п.sample && <ЗаявкаПартнёру kind="driver" itemId={п.id} дней={1} />}
        <div className="pb-6" />
      </div>
    </div>
  );
}

function О_партнёре({ п, языки }: { п: ПартнёрПубличный; языки: string }) {
  const { t, трК } = useT();
  return (
    <Блок заголовок={t("pt_about")}>
      <div className="mb-2 flex items-center gap-3">
        <Аватар src={п.photo} имя={п.name} размер={48} />
        <div>
          <p className="text-sm font-bold" style={{ color: TEXT }}>
            {п.name}
          </p>
          {п.experienceYears > 0 && (
            <p className="text-xs" style={{ color: MUTED }}>
              {t("pt_experience").replace("{n}", String(п.experienceYears))}
            </p>
          )}
        </div>
      </div>
      {п.bio && (
        <p className="mb-2 whitespace-pre-line text-sm leading-relaxed" style={{ color: MUTED }}>
          {п.bio}
        </p>
      )}
      <p className="text-xs" style={{ color: TEXT }}>
        🗣 <b>{t("pt_languages")}:</b> {языки}
      </p>
      {п.cities.length > 0 && (
        <p className="mt-1 text-xs" style={{ color: TEXT }}>
          📍 <b>{t("pt_cities")}:</b> {[п.city, ...п.cities.filter((c) => c !== п.city)].map(трК).join(", ")}
        </p>
      )}
    </Блок>
  );
}

export function ДеталиГида({ п, onBack }: { п: ПартнёрПубличный; onBack: () => void }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  const { tours } = usePartners();
  useПросмотр(п.id);
  const его = tours.filter((т) => т.providerId === п.id);
  return (
    <div className="flex h-full animate-slide-up flex-col" style={{ background: CREAM }}>
      <Шапка фото={п.photos[0] || п.photo} onBack={onBack}>
        <div className="mb-1.5 flex gap-1.5">
          {п.promoted && <МеткаРекомендуем />}
          <Метка п={п} наФото />
          {п.licensed && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ ...glass, color: WHITE }}
            >
              🎓 {t("pt_licensed")}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {п.name}
        </h2>
        <p className="mt-0.5 text-xs text-white/75">
          {t("pt_guide_word")} · {трК(п.city)} · {дг.цена(`$${п.priceDay}`)} {t("pt_per_day")}
        </p>
      </Шапка>
      <div className="hide-scroll flex-1 overflow-y-auto px-4 pt-4">
        {п.sample ? <ПлашкаПримера кредит={п.photoCredit} /> : <Связь п={п} />}
        <О_партнёре п={п} языки={языки(п.languages)} />
        {(п.specialties ?? []).length > 0 && (
          <Блок заголовок={t("pt_specialties")}>
            <div className="flex flex-wrap gap-1.5">
              {п.specialties!.map((с) => (
                <span
                  key={с}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: ACCENT_SOFT, color: GREEN }}
                >
                  {с}
                </span>
              ))}
            </div>
          </Блок>
        )}
        <ГалереяЗаведения фото={п.photos} />
        {его.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 px-1 text-sm font-bold" style={{ color: TEXT }}>
              🗺️ {t("pt_guide_tours")}
            </p>
            <div className="grid gap-3">
              {его.map((т, i) => (
                <КарточкаТура key={т.id} тур={т} гид={п} номер={i} />
              ))}
            </div>
          </div>
        )}
        {п.includes.length > 0 && (
          <Блок заголовок={t("pt_includes")}>
            <Список пункты={п.includes} />
          </Блок>
        )}
        {!п.sample && <ЗаявкаПартнёру kind="guide" itemId={п.id} дней={1} />}
        <div className="pb-6" />
      </div>
    </div>
  );
}

export function ДеталиТура({ тур, onBack }: { тур: ТурПартнёра; onBack: () => void }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const языки = useЯзыки();
  const { guides } = usePartners();
  const гид = guides.find((g) => g.id === тур.providerId);
  useПросмотр(тур.providerId);
  return (
    <div className="flex h-full animate-slide-up flex-col" style={{ background: CREAM }}>
      <Шапка фото={тур.photos[0] || гид?.photo || ""} onBack={onBack}>
        <span
          className="mb-1.5 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ background: ACCENT_FILL, color: WHITE }}
        >
          {t("pt_days_n").replace("{n}", String(тур.days))}
        </span>
        <h2
          className="text-xl font-bold leading-tight text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {тур.title}
        </h2>
        <p className="mt-0.5 text-xs text-white/75">
          {трК(тур.city)}
          {гид && ` · ${t("pt_guide_word")}: ${гид.name}`}
        </p>
      </Шапка>
      <div className="hide-scroll flex-1 overflow-y-auto px-4 pt-4">
        <Блок>
          <p className="text-lg font-bold" style={{ color: GREEN }}>
            {t("pt_from_pp").replace("{p}", дг.цена(`$${тур.pricePerPerson}`))}
          </p>
          {тур.priceGroup ? (
            <p className="text-xs" style={{ color: MUTED }}>
              {t("pt_group_price").replace("{p}", дг.цена(`$${тур.priceGroup}`))}
            </p>
          ) : null}
          <p className="mt-1.5 text-xs" style={{ color: TEXT }}>
            👥 {t("pt_group_max").replace("{n}", String(тур.maxGroup))}
            {тур.languages.length > 0 && ` · 🗣 ${языки(тур.languages)}`}
          </p>
          {тур.summary && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed" style={{ color: MUTED }}>
              {тур.summary}
            </p>
          )}
        </Блок>
        <ГалереяЗаведения фото={тур.photos} />
        <Блок заголовок={`🗓 ${t("pt_program")}`}>
          <ol className="relative ml-2 border-l-2 pl-4" style={{ borderColor: ACCENT_SOFT }}>
            {тур.program.map((д, i) => (
              <li key={i} className="relative mb-4 last:mb-0">
                <span
                  className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: ACCENT_FILL, color: WHITE }}
                >
                  {i + 1}
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: GREEN }}>
                  {t("pt_day_n").replace("{n}", String(i + 1))}
                </p>
                <p className="text-sm font-bold" style={{ color: TEXT }}>
                  {д.title}
                </p>
                {д.text && (
                  <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed" style={{ color: MUTED }}>
                    {д.text}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Блок>
        {тур.includes.length > 0 && (
          <Блок заголовок={t("pt_includes")}>
            <Список пункты={тур.includes} />
          </Блок>
        )}
        {тур.excludes.length > 0 && (
          <Блок заголовок={t("pt_excludes")}>
            <Список пункты={тур.excludes} знак="✕" цвет="#c0392b" />
          </Блок>
        )}
        {тур.meetingPoint && (
          <Блок заголовок={`📍 ${t("pt_meeting")}`}>
            <p className="text-sm" style={{ color: MUTED }}>
              {тур.meetingPoint}
            </p>
          </Блок>
        )}
        {гид && (
          <button
            className="mb-3 w-full text-left"
            onClick={() => открытьПартнёра({ kind: "guide", value: гид })}
          >
            <Блок>
              <div className="flex items-center gap-3">
                <Аватар src={гид.photo} имя={гид.name} размер={48} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold" style={{ color: TEXT }}>
                    {гид.name}
                  </p>
                  <p className="text-xs" style={{ color: MUTED }}>
                    {t("pt_guide_word")} · {языки(гид.languages)}
                  </p>
                </div>
                <span style={{ color: GREEN }}>›</span>
              </div>
            </Блок>
          </button>
        )}
        {тур.sample || гид?.sample ? (
          <ПлашкаПримера />
        ) : (
          <>
            {гид && <Связь п={гид} />}
            <ЗаявкаПартнёру kind="guidetour" itemId={тур.id} дней={тур.days} людей={2} />
          </>
        )}
        <div className="pb-6" />
      </div>
    </div>
  );
}

/* ── Заявка ───────────────────────────────────────────────────────────── */

function ЗаявкаПартнёру({
  kind,
  itemId,
  дней,
  людей = 2,
}: {
  kind: "driver" | "guide" | "guidetour";
  itemId: string;
  дней: number;
  людей?: number;
}) {
  const { t } = useT();
  const [date, setDate] = useState("");
  const [days, setDays] = useState(дней);
  const [guests, setGuests] = useState(людей);
  const [pickup, setPickup] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [итог, setИтог] = useState<"нет" | "ок" | "вход" | "ошибка">("нет");
  const [идёт, setИдёт] = useState(false);
  const завтра = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  async function отправить(e: React.FormEvent) {
    e.preventDefault();
    setИдёт(true);
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, date, days, guests, pickup, phone, note }),
      });
      setИтог(r.status === 401 ? "вход" : r.ok ? "ок" : "ошибка");
    } catch {
      setИтог("ошибка");
    } finally {
      setИдёт(false);
    }
  }

  if (итог === "ок")
    return (
      <div className="mb-3 rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${GREEN}` }}>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: GREEN }}>
          ✓ {t("pt_sent")}
        </p>
      </div>
    );

  const поле = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none";
  const стиль = { borderColor: BORDER, color: TEXT, background: SURFACE };
  const подпись = "mb-1 block text-[11px] font-semibold";
  return (
    <form
      onSubmit={отправить}
      className="mb-3 rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: BORDER }}
    >
      <p className="mb-3 text-sm font-bold" style={{ color: TEXT }}>
        ✉️ {t("pt_request_title")}
      </p>
      <div className="mb-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="col-span-2 sm:col-span-1">
          <span className={подпись} style={{ color: MUTED }}>
            {t("pt_date")}
          </span>
          <input
            type="date"
            required
            min={завтра}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={поле}
            style={стиль}
          />
        </label>
        <label>
          <span className={подпись} style={{ color: MUTED }}>
            {t("pt_days")}
          </span>
          <input
            type="number"
            min={1}
            max={30}
            required
            value={days}
            disabled={kind === "guidetour"}
            onChange={(e) => setDays(Number(e.target.value))}
            className={поле}
            style={стиль}
          />
        </label>
        <label>
          <span className={подпись} style={{ color: MUTED }}>
            {t("pt_people")}
          </span>
          <input
            type="number"
            min={1}
            max={30}
            required
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={поле}
            style={стиль}
          />
        </label>
      </div>
      <label className="mb-2.5 block">
        <span className={подпись} style={{ color: MUTED }}>
          {t("pt_pickup")}
        </span>
        <input
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder={t("pt_pickup_ph")}
          maxLength={160}
          className={поле}
          style={стиль}
        />
      </label>
      <label className="mb-2.5 block">
        <span className={подпись} style={{ color: MUTED }}>
          {t("pt_phone")}
        </span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          className={поле}
          style={стиль}
        />
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("pt_note_ph")}
        maxLength={500}
        rows={2}
        className={`${поле} mb-3 resize-none`}
        style={стиль}
      />
      {итог === "вход" && (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("hellouz:auth", { detail: "login" }))}
          className="mb-2 w-full text-xs font-semibold underline"
          style={{ color: GREEN }}
        >
          {t("pt_login_needed")}
        </button>
      )}
      {итог === "ошибка" && (
        <p className="mb-2 text-xs" style={{ color: "#c0392b" }}>
          {t("pt_err")}
        </p>
      )}
      <button
        type="submit"
        disabled={идёт}
        className="w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60"
        style={{ background: GOLD, color: ON_GOLD }}
      >
        {идёт ? "…" : t("pt_request")}
      </button>
    </form>
  );
}
