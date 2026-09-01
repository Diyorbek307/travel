import ActionForm from "@/components/admin/action-form";
import { Checkbox, Fieldset, Input, Select, Table, Td, TextArea, Tr } from "@/components/admin/fields";
import { listCitiesAdmin, listFestivalsAdmin } from "@/lib/admin-db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS } from "@/lib/types";
import { removeFestival, saveFestival } from "../actions";

export const dynamic = "force-dynamic";

const MONTHS = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

/** Праздники и фестивали (раздел «События» на главной). */
export default async function AdminFestivalsPage() {
  const festivals = listFestivalsAdmin();
  const cities = listCitiesAdmin();

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">События · {festivals.length}</h1>

      <Table head={["Название", "Когда", "Город", "Длит.", "Порядок", "Статус", ""]}>
        {festivals.map((f) => (
          <Tr key={String(f.slug)}>
            <Td>
              <span className="block">{String(f.name)}</span>
              <span className="block font-mono text-xs soft">{String(f.slug)}</span>
            </Td>
            <Td className="whitespace-nowrap text-xs">
              {f.day ? `${Number(f.day)} ` : ""}
              {MONTHS[Number(f.month) - 1]}
              {f.year ? ` ${Number(f.year)}` : ""}
            </Td>
            <Td className="text-xs">{f.city_slug ? String(f.city_slug) : "вся страна"}</Td>
            <Td className="text-xs">{Number(f.days)} дн.</Td>
            <Td className="text-xs">{Number(f.sort)}</Td>
            <Td className="text-xs">{Number(f.is_active) ? "показывается" : "скрыто"}</Td>
            <Td>
              <form action={removeFestival}>
                <input type="hidden" name="slug" value={String(f.slug)} />
                <button className="text-xs text-red-500">Удалить</button>
              </form>
            </Td>
          </Tr>
        ))}
      </Table>

      {festivals.length === 0 && <p className="py-6 text-center soft">Событий пока нет.</p>}

      <h2 className="mb-3 mt-8 font-semibold">Новое событие</h2>
      <ActionForm action={saveFestival} submitLabel="Сохранить событие" className="max-w-3xl">
        <Fieldset legend="Когда и где">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              name="slug"
              label="Идентификатор"
              required
              pattern="[a-z0-9-]{2,60}"
              placeholder="navruz"
            />
            <Select
              name="city"
              label="Город"
              defaultValue=""
              options={[
                { value: "", label: "Вся страна" },
                ...cities.map((c) => ({ value: String(c.slug), label: String(c.name) })),
              ]}
            />
            <Input name="sort" label="Порядок" type="number" defaultValue="0" />
            <Select
              name="month"
              label="Месяц"
              options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
            />
            <Input
              name="day"
              label="День"
              type="number"
              min={1}
              max={31}
              hint="Пусто — дата плавающая, покажем только месяц"
            />
            <Input
              name="year"
              label="Год"
              type="number"
              min={2024}
              max={2100}
              hint="Пусто — праздник ежегодный"
            />
            <Input name="days" label="Сколько длится, дней" type="number" min={1} defaultValue="1" />
            <div className="self-end">
              <Checkbox name="is_active" label="Показывать туристам" defaultChecked />
            </div>
          </div>
        </Fieldset>

        {MVP_LANGS.map((lang) => (
          <Fieldset key={lang} legend={`${LANG_FLAG[lang]} ${LANG_LABEL[lang]}`}>
            <div className="grid gap-3">
              <Input name={`name_${lang}`} label="Название" />
              <TextArea name={`desc_${lang}`} label="Описание" rows={2} />
            </div>
          </Fieldset>
        ))}
      </ActionForm>

      <p className="mt-4 max-w-3xl text-xs soft">
        Дата хранится месяцем и днём отдельно от года: у Навруза он всегда
        21 марта, и записывать ему год значило бы каждый январь править
        руками все ежегодные праздники. Год заполняется только у событий с
        плавающей датой — например, у фестиваля, который в этом году идёт
        в августе, а в следующем перенесён.
      </p>
    </>
  );
}
