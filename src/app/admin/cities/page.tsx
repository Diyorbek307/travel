import Link from "next/link";
import ActionForm from "@/components/admin/action-form";
import { Checkbox, Fieldset, Input, Table, Td, TextArea, Tr } from "@/components/admin/fields";
import { listCitiesAdmin } from "@/lib/admin-db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS } from "@/lib/types";
import { saveCity } from "../actions";

export const dynamic = "force-dynamic";

/** Добавление городов и регионов (п. 16 ТЗ). */
export default function AdminCitiesPage() {
  const cities = listCitiesAdmin();

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Города</h1>

      <div className="mb-6">
        <Table head={["Название", "Идентификатор", "Координаты", "Объектов", "Маршрутов", "Статус"]}>
          {cities.map((c) => (
            <Tr key={String(c.slug)}>
              <Td>
                <Link href={`/admin/pois?city=${c.slug}`} style={{ color: "var(--accent)" }}>
                  {String(c.name)}
                </Link>
              </Td>
              <Td className="font-mono text-xs">{String(c.slug)}</Td>
              <Td className="font-mono text-xs">
                {Number(c.lat).toFixed(4)}, {Number(c.lon).toFixed(4)}
              </Td>
              <Td>{Number(c.poi_count)}</Td>
              <Td>{Number(c.tour_count)}</Td>
              <Td>{Number(c.is_active) ? "активен" : "скрыт"}</Td>
            </Tr>
          ))}
        </Table>
      </div>

      <h2 className="mb-3 font-semibold">Добавить или обновить город</h2>
      <p className="mb-4 max-w-2xl text-sm soft">
        Заполнение формы существующим идентификатором обновит город. Так добавляются
        остальные регионы Узбекистана из п. 2.1 ТЗ — Шахрисабз, Фергана, Нукус
        и другие: платформа изначально рассчитана на всю страну, MVP просто
        начинает с четырёх городов.
      </p>

      <ActionForm action={saveCity} submitLabel="Сохранить город" className="max-w-3xl">
        <Fieldset legend="Основное">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              name="slug"
              label="Идентификатор"
              placeholder="shakhrisabz"
              required
              pattern="[a-z0-9-]{2,40}"
              hint="Латиница, цифры и дефис. Используется в адресах страниц."
            />
            <Input name="zoom" label="Масштаб карты" type="number" defaultValue={13} min={5} max={18} />
            <Input
              name="lat"
              label="Широта"
              type="number"
              step="0.000001"
              placeholder="39.0522"
              required
            />
            <Input
              name="lon"
              label="Долгота"
              type="number"
              step="0.000001"
              placeholder="66.8339"
              required
            />
          </div>
          <div className="mt-3">
            <Checkbox name="is_active" label="Показывать туристам" defaultChecked />
          </div>
        </Fieldset>

        {MVP_LANGS.map((lang) => (
          <Fieldset key={lang} legend={`${LANG_FLAG[lang]} ${LANG_LABEL[lang]}`}>
            <div className="grid gap-3">
              <Input name={`name_${lang}`} label="Название" placeholder="Шахрисабз" />
              <TextArea name={`desc_${lang}`} label="Описание" rows={3} />
            </div>
          </Fieldset>
        ))}

        <p className="text-xs soft">
          Языки сверх трёх языков MVP добавляются здесь же — форма читает весь
          список из <code>LANGS</code>, достаточно расширить набор в{" "}
          <code>src/lib/types.ts</code>.
        </p>
      </ActionForm>
    </>
  );
}
