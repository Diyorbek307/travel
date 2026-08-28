import Link from "next/link";
import ActionForm from "@/components/admin/action-form";
import { Checkbox, Fieldset, Input, Select, TextArea } from "@/components/admin/fields";
import { getPoiForEdit, listCitiesAdmin } from "@/lib/admin-db";
import { getMuseumByPoi } from "@/lib/db";
import { categoryLabel, LANG_FLAG, LANG_LABEL, themeLabel } from "@/lib/i18n";
import {
  CATEGORIES,
  MVP_LANGS,
  THEMES,
  type Lang,
  type OpeningHours,
  type Theme,
} from "@/lib/types";
import { savePoi } from "../../actions";

export const dynamic = "force-dynamic";

const WEEKDAYS = [
  { value: "1", label: "Пн" },
  { value: "2", label: "Вт" },
  { value: "3", label: "Ср" },
  { value: "4", label: "Чт" },
  { value: "5", label: "Пт" },
  { value: "6", label: "Сб" },
  { value: "0", label: "Вс" },
];

/** Создание и правка объекта со всеми переводами (п. 16 ТЗ). */
export default async function AdminPoiEditPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const cities = listCitiesAdmin();
  const existing = slug ? getPoiForEdit(slug) : null;

  const poi = existing?.poi;
  const translations = new Map(
    (existing?.translations ?? []).map((t) => [String(t.lang), t]),
  );
  const themes: Theme[] = poi?.themes ? safeParse<Theme[]>(String(poi.themes), []) : [];
  const hours = poi?.opening_hours
    ? safeParse<OpeningHours | null>(String(poi.opening_hours), null)
    : null;

  // Форма редактирует одну общую пару «открытие — закрытие»: берём её из
  // первого рабочего дня, а выходные отмечаем галочками.
  const firstOpen = hours ? Object.values(hours).find((v) => v !== null) : null;
  const closedDays = hours
    ? Object.entries(hours).filter(([, v]) => v === null).map(([d]) => d)
    : [];

  const isMuseum = poi ? getMuseumByPoi(Number(poi.id)) !== null : false;

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/pois" className="text-sm" style={{ color: "var(--accent)" }}>
          ← К списку
        </Link>
        <h1 className="text-xl font-semibold">
          {poi ? `Объект: ${translations.get("ru")?.name ?? slug}` : "Новый объект"}
        </h1>
        {poi && (
          <Link href={`/poi/${slug}`} className="text-sm soft" target="_blank">
            открыть в приложении ↗
          </Link>
        )}
      </div>

      <ActionForm action={savePoi} submitLabel="Сохранить объект" className="max-w-4xl">
        <Fieldset legend="Расположение и тип">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              name="slug"
              label="Идентификатор"
              required
              pattern="[a-z0-9-]{2,60}"
              defaultValue={poi ? String(poi.slug) : ""}
              readOnly={Boolean(poi)}
              hint={poi ? "У существующего объекта не меняется" : "Например: chor-minor"}
            />
            <Select
              name="city"
              label="Город"
              defaultValue={poi ? String(poi.city_slug) : cities[0] && String(cities[0].slug)}
              options={cities.map((c) => ({ value: String(c.slug), label: String(c.name) }))}
            />
            <Input
              name="lat"
              label="Широта"
              type="number"
              step="0.000001"
              required
              defaultValue={poi ? String(poi.lat) : ""}
            />
            <Input
              name="lon"
              label="Долгота"
              type="number"
              step="0.000001"
              required
              defaultValue={poi ? String(poi.lon) : ""}
            />
            <Select
              name="category"
              label="Категория"
              defaultValue={poi ? String(poi.category) : "landmark"}
              options={CATEGORIES.map((c) => ({
                value: c,
                label: categoryLabel("ru" as Lang, c),
              }))}
              hint="Определяет слой карты и фильтр"
            />
            <Input
              name="qr_code"
              label="QR-код"
              placeholder="SMR-09"
              defaultValue=""
              hint="Код для печати на табличке. Оставьте пустым, если не нужен."
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Темы для фильтров</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {THEMES.map((th) => (
                <Checkbox
                  key={th}
                  name="themes"
                  value={th}
                  label={themeLabel("ru" as Lang, th)}
                  defaultChecked={themes.includes(th)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <Checkbox
              name="is_active"
              label="Показывать туристам"
              defaultChecked={poi ? Boolean(Number(poi.is_active)) : true}
            />
            <Checkbox name="is_museum" label="Это музей (можно добавлять экспонаты)" defaultChecked={isMuseum} />
          </div>
        </Fieldset>

        <Fieldset legend="Посещение">
          <div className="grid gap-3 sm:grid-cols-4">
            <Input
              name="price"
              label="Цена входа, сум"
              type="number"
              min={0}
              step={1000}
              defaultValue={poi ? String(poi.price_uzs) : "0"}
              hint="0 — вход свободный"
            />
            <Input
              name="visit"
              label="Время осмотра, мин"
              type="number"
              min={5}
              max={480}
              defaultValue={poi ? String(poi.avg_visit_min) : "30"}
            />
            <Input
              name="rating"
              label="Рейтинг"
              type="number"
              min={0}
              max={5}
              step={0.1}
              defaultValue={poi ? String(poi.rating) : "4.5"}
            />
            <Input
              name="popularity"
              label="Значимость"
              type="number"
              min={0}
              max={1}
              step={0.05}
              defaultValue={poi ? String(poi.popularity) : "0.5"}
              hint="От 0,85 объект считается обязательным и ставится в маршрут первым"
            />
            <Input
              name="sponsored_priority"
              label="Приоритет в топе"
              type="number"
              min={0}
              step={1}
              defaultValue={poi?.sponsored_priority ? String(poi.sponsored_priority) : "0"}
              hint="Только рестораны/кафе/зоны отдыха — чем выше, тем раньше в списке"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Input
              name="open"
              label="Открытие"
              type="time"
              defaultValue={firstOpen ? firstOpen.open : "09:00"}
            />
            <Input
              name="close"
              label="Закрытие"
              type="time"
              defaultValue={firstOpen ? firstOpen.close : "18:00"}
            />
            <div className="self-end">
              <Checkbox name="always_open" label="Круглосуточно" defaultChecked={hours === null && Boolean(poi)} />
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-2 text-sm font-medium">Выходные дни</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {WEEKDAYS.map((d) => (
                <Checkbox
                  key={d.value}
                  name="closed_days"
                  value={d.value}
                  label={d.label}
                  defaultChecked={closedDays.includes(d.value)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input name="phone" label="Телефон" defaultValue={poi?.phone ? String(poi.phone) : ""} />
            <Input name="website" label="Сайт" type="url" defaultValue={poi?.website ? String(poi.website) : ""} />
          </div>
        </Fieldset>

        {MVP_LANGS.map((lang) => {
          const tr = translations.get(lang);
          return (
            <Fieldset
              key={lang}
              legend={`${LANG_FLAG[lang]} ${LANG_LABEL[lang]}`}
              hint={
                lang === "ru"
                  ? "Историю пишем абзацами. Подзаголовки выделяются двумя звёздочками: **Медресе Улугбека**"
                  : undefined
              }
            >
              <div className="grid gap-3">
                <Input
                  name={`name_${lang}`}
                  label="Название"
                  defaultValue={tr ? String(tr.name) : ""}
                />
                <TextArea
                  name={`short_${lang}`}
                  label="Краткое описание"
                  rows={2}
                  defaultValue={tr?.short_desc ? String(tr.short_desc) : ""}
                  hint="Одна фраза для списков и карточек"
                />
                <TextArea
                  name={`story_${lang}`}
                  label="Полная история"
                  rows={10}
                  defaultValue={tr?.full_story ? String(tr.full_story) : ""}
                  hint="Этот текст читает аудиогид. Перед публикацией его должен вычитать историк."
                />
              </div>
            </Fieldset>
          );
        })}
      </ActionForm>

      {existing && existing.audio.length > 0 && (
        <section className="mt-6 max-w-4xl rounded-xl p-4 surface">
          <h2 className="mb-2 font-semibold">Загруженные аудиогиды</h2>
          <ul className="grid gap-1 text-sm">
            {existing.audio.map((a) => (
              <li key={String(a.lang)} className="flex justify-between gap-2">
                <span>
                  {LANG_FLAG[String(a.lang) as Lang]} {String(a.url)}
                </span>
                <span className="soft">{Number(a.duration_sec)} с</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
