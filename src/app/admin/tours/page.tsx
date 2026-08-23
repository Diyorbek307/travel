import Link from "next/link";
import ActionForm from "@/components/admin/action-form";
import { Checkbox, Fieldset, Input, Select, Table, Td, TextArea, Tr } from "@/components/admin/fields";
import { listCitiesAdmin, listPoisAdmin, listToursAdmin } from "@/lib/admin-db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS } from "@/lib/types";
import { removeTour, saveTour } from "../actions";

export const dynamic = "force-dynamic";

const MODE_LABEL = { walk: "пешком", taxi: "такси", car: "машина" } as const;

/** Составление готовых маршрутов (п. 10, 16 ТЗ). */
export default function AdminToursPage() {
  const tours = listToursAdmin();
  const cities = listCitiesAdmin();
  const pois = listPoisAdmin();

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Маршруты · {tours.length}</h1>

      <div className="mb-6">
        <Table head={["Название", "Город", "Остановок", "Время", "Передвижение", "Статус", ""]}>
          {tours.map((tour) => (
            <Tr key={String(tour.slug)}>
              <Td>
                <Link href={`/routes/${tour.slug}`} target="_blank" style={{ color: "var(--accent)" }}>
                  {String(tour.title)}
                </Link>
                <span className="block font-mono text-xs soft">{String(tour.slug)}</span>
              </Td>
              <Td className="text-xs">{String(tour.city_slug)}</Td>
              <Td>{Number(tour.stop_count)}</Td>
              <Td className="text-xs">{Math.round(Number(tour.total_min) / 60)} ч</Td>
              <Td className="text-xs">
                {MODE_LABEL[String(tour.mode) as keyof typeof MODE_LABEL]}
              </Td>
              <Td className="text-xs">{Number(tour.is_active) ? "активен" : "скрыт"}</Td>
              <Td>
                <form action={removeTour}>
                  <input type="hidden" name="slug" value={String(tour.slug)} />
                  <button className="text-xs text-red-500">Удалить</button>
                </form>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>

      <h2 className="mb-3 font-semibold">Создать или обновить маршрут</h2>

      <ActionForm action={saveTour} submitLabel="Сохранить маршрут" className="max-w-4xl">
        <Fieldset legend="Параметры">
          <div className="grid gap-3 sm:grid-cols-4">
            <Input
              name="slug"
              label="Идентификатор"
              required
              pattern="[a-z0-9-]{2,60}"
              placeholder="samarkand-evening"
            />
            <Select
              name="city"
              label="Город"
              options={cities.map((c) => ({ value: String(c.slug), label: String(c.name) }))}
              hint="Для межгородских маршрутов — город старта"
            />
            <Select
              name="mode"
              label="Передвижение"
              options={[
                { value: "walk", label: "Пешком" },
                { value: "taxi", label: "Такси" },
                { value: "car", label: "Машина" },
              ]}
            />
            <Input name="sort" label="Порядок" type="number" defaultValue={0} />
          </div>
          <div className="mt-3">
            <Checkbox name="is_active" label="Показывать туристам" defaultChecked />
          </div>
        </Fieldset>

        <Fieldset
          legend="Остановки"
          hint="По одной в строке, в формате «идентификатор-объекта: минуты осмотра». Порядок строк = порядок маршрута."
        >
          <TextArea
            name="stops"
            label="Список остановок"
            rows={10}
            required
            placeholder={"registan: 90\nbibi-khanym: 40\nsiab-bazaar: 40\nshah-i-zinda: 60"}
            className="font-mono"
          />

          <details className="mt-3">
            <summary className="cursor-pointer text-sm">
              Показать доступные идентификаторы ({pois.length})
            </summary>
            <ul className="mt-2 grid gap-0.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {pois.map((p) => (
                <li key={String(p.slug)} className="truncate soft">
                  <code style={{ color: "var(--accent)" }}>{String(p.slug)}</code> —{" "}
                  {String(p.name)}
                </li>
              ))}
            </ul>
          </details>
        </Fieldset>

        {MVP_LANGS.map((lang) => (
          <Fieldset key={lang} legend={`${LANG_FLAG[lang]} ${LANG_LABEL[lang]}`}>
            <div className="grid gap-3">
              <Input name={`title_${lang}`} label="Название маршрута" />
              <TextArea name={`desc_${lang}`} label="Описание" rows={3} />
            </div>
          </Fieldset>
        ))}
      </ActionForm>

      <p className="mt-4 max-w-3xl text-xs leading-relaxed soft">
        Общее время маршрута считается как сумма времени осмотра остановок;
        время в пути приложение добавляет само, исходя из координат и способа
        передвижения. Маршрут с существующим идентификатором перезаписывается
        целиком, включая список остановок.
      </p>
    </>
  );
}
