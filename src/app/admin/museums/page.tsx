import Link from "next/link";
import ActionForm from "@/components/admin/action-form";
import { Fieldset, Input, Select, Table, Td, TextArea, Tr } from "@/components/admin/fields";
import { listMuseumsAdmin } from "@/lib/admin-db";
import { getDb } from "@/lib/db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS } from "@/lib/types";
import { removeExhibit, saveExhibit } from "../actions";

export const dynamic = "force-dynamic";

/** Музеи и их экспонаты с отдельными QR-табличками (п. 7, 16 ТЗ). */
export default function AdminMuseumsPage() {
  const museums = listMuseumsAdmin();

  const exhibits = getDb()
    .prepare(
      `SELECT e.id, e.museum_id, e.number, e.period, e.origin, e.sort,
              COALESCE(t.name, e.number) AS name,
              COALESCE(pt.name, p.slug)  AS museum_name,
              (SELECT q.code FROM qr_codes q
                WHERE q.target_type = 'exhibit' AND q.target_id = e.id LIMIT 1) AS qr_code,
              (SELECT COUNT(*) FROM exhibit_translations x WHERE x.exhibit_id = e.id) AS lang_count
         FROM exhibits e
         JOIN museums m ON m.id = e.museum_id
         JOIN pois p    ON p.id = m.poi_id
         LEFT JOIN exhibit_translations t ON t.exhibit_id = e.id AND t.lang = 'ru'
         LEFT JOIN poi_translations pt    ON pt.poi_id = p.id AND pt.lang = 'ru'
        ORDER BY museum_name, e.sort, e.id`,
    )
    .all() as Record<string, unknown>[];

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Музеи и экспонаты</h1>

      <section className="mb-6">
        <h2 className="mb-3 font-semibold">Музеи · {museums.length}</h2>
        {museums.length === 0 ? (
          <p className="rounded-xl p-4 text-sm surface soft">
            Ни один объект не отмечен как музей. Откройте объект в разделе
            «Объекты» и включите галочку «Это музей».
          </p>
        ) : (
          <Table head={["Музей", "Город", "Экспонатов", ""]}>
            {museums.map((m) => (
              <Tr key={String(m.id)}>
                <Td>{String(m.name)}</Td>
                <Td className="text-xs">{String(m.city_slug)}</Td>
                <Td>{Number(m.exhibit_count)}</Td>
                <Td className="text-xs">
                  <Link href={`/poi/${m.poi_slug}`} target="_blank" style={{ color: "var(--accent)" }}>
                    открыть ↗
                  </Link>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-semibold">Экспонаты · {exhibits.length}</h2>
        <Table head={["№", "Название", "Музей", "Период", "Языки", "QR", ""]}>
          {exhibits.map((e) => (
            <Tr key={String(e.id)}>
              <Td className="font-mono">{String(e.number)}</Td>
              <Td>
                <Link href={`/exhibit/${e.id}`} target="_blank" style={{ color: "var(--accent)" }}>
                  {String(e.name)}
                </Link>
              </Td>
              <Td className="text-xs">{String(e.museum_name)}</Td>
              <Td className="text-xs">{e.period ? String(e.period) : "—"}</Td>
              <Td className="text-xs">{Number(e.lang_count)}</Td>
              <Td className="font-mono text-xs">
                {e.qr_code ? String(e.qr_code) : <span className="soft">—</span>}
              </Td>
              <Td>
                <form action={removeExhibit}>
                  <input type="hidden" name="id" value={Number(e.id)} />
                  <button className="text-xs text-red-500">Удалить</button>
                </form>
              </Td>
            </Tr>
          ))}
        </Table>
      </section>

      {museums.length > 0 && (
        <>
          <h2 className="mb-3 font-semibold">Добавить или обновить экспонат</h2>
          <ActionForm action={saveExhibit} submitLabel="Сохранить экспонат" className="max-w-4xl">
            <Fieldset legend="Карточка экспоната">
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  name="museum_id"
                  label="Музей"
                  options={museums.map((m) => ({
                    value: String(m.id),
                    label: `${m.city_slug} — ${m.name}`,
                  }))}
                />
                <Input
                  name="number"
                  label="Номер экспоната"
                  required
                  placeholder="125"
                  hint="Тот самый номер, что напечатан на табличке в зале"
                />
                <Input name="period" label="Период создания" placeholder="1420-е годы" />
                <Input name="origin" label="Происхождение" placeholder="Обсерватория Улугбека, Самарканд" />
                <Input name="sort" label="Порядок в зале" type="number" defaultValue={0} />
                <Input
                  name="qr_code"
                  label="QR-код"
                  placeholder="SMR-05-E126"
                  hint="Отдельная табличка у витрины"
                />
              </div>
              <input type="hidden" name="id" value="" />
            </Fieldset>

            {MVP_LANGS.map((lang) => (
              <Fieldset key={lang} legend={`${LANG_FLAG[lang]} ${LANG_LABEL[lang]}`}>
                <div className="grid gap-3">
                  <Input name={`name_${lang}`} label="Название" />
                  <TextArea name={`short_${lang}`} label="Краткое описание" rows={2} />
                  <TextArea
                    name={`story_${lang}`}
                    label="Полная история"
                    rows={6}
                    hint="Этот текст читает аудиогид у витрины"
                  />
                </div>
              </Fieldset>
            ))}
          </ActionForm>

          <p className="mt-4 max-w-3xl text-xs leading-relaxed soft">
            Экспонат с уже существующим номером в том же музее будет обновлён,
            а не создан заново. Так турист проходит музей самостоятельно:
            сканирует табличку у витрины и слушает рассказ именно об этом предмете.
          </p>
        </>
      )}
    </>
  );
}
