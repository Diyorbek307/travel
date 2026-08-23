import QRCode from "qrcode";
import ActionForm from "@/components/admin/action-form";
import { Input, Select, Table, Td, Tr } from "@/components/admin/fields";
import { listPoisAdmin } from "@/lib/admin-db";
import { getDb, listQrCodes } from "@/lib/db";
import { saveQr, removeQr } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Генерация и учёт QR-кодов (п. 5, 16 ТЗ).
 *
 * Код ведёт на /s/<код>, а не прямо на объект: так табличку можно
 * перепривязать к другому объекту без перепечатки, и каждое сканирование
 * попадает в статистику.
 */
export default async function AdminQrPage({
  searchParams,
}: {
  searchParams: Promise<{ base?: string }>;
}) {
  const { base } = await searchParams;
  // Домен нужен, чтобы QR вёл на рабочий адрес.
  //
  // Читается на сервере при каждом запросе, а не через NEXT_PUBLIC_*: такие
  // переменные Next подставляет в код на этапе сборки, а адрес сервиса на
  // хостинге известен только после первого деплоя. RENDER_EXTERNAL_URL
  // подставляет сам Render.
  const baseUrl =
    base ||
    process.env.APP_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000";

  const codes = listQrCodes();
  const pois = listPoisAdmin();

  const exhibits = getDb()
    .prepare(
      `SELECT e.id, e.number, COALESCE(t.name, e.number) AS name,
              COALESCE(pt.name, p.slug) AS museum
         FROM exhibits e
         JOIN museums m ON m.id = e.museum_id
         JOIN pois p    ON p.id = m.poi_id
         LEFT JOIN exhibit_translations t ON t.exhibit_id = e.id AND t.lang = 'ru'
         LEFT JOIN poi_translations pt    ON pt.poi_id = p.id AND pt.lang = 'ru'
        ORDER BY museum, e.sort`,
    )
    .all() as Record<string, unknown>[];

  // Картинки генерируем на сервере в data:URI — страницу можно сразу печатать,
  // не обращаясь ни к какому внешнему сервису.
  const images = await Promise.all(
    codes.map(async (c) => ({
      code: String(c.code),
      name: String(c.target_name),
      type: String(c.target_type),
      scans: Number(c.scans),
      url: `${baseUrl}/s/${c.code}`,
      dataUrl: await QRCode.toDataURL(`${baseUrl}/s/${c.code}`, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: "M",
      }),
    })),
  );

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">QR-коды · {codes.length}</h1>
      <p className="mb-5 max-w-3xl text-sm soft">
        Коды ведут на <code>{baseUrl}/s/КОД</code>. Ссылка открывается и без
        установленного приложения — в обычном браузере телефона. Под символом
        печатается сам код, чтобы турист мог ввести его вручную, если камера
        не срабатывает.
      </p>

      <section className="no-print mb-6">
        <h2 className="mb-3 font-semibold">Привязать код</h2>
        <ActionForm action={saveQr} submitLabel="Привязать" className="max-w-3xl rounded-xl p-4 surface">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              name="code"
              label="Код"
              placeholder="SMR-09"
              required
              pattern="[A-Za-z0-9-]{3,32}"
              hint="Печатается на табличке"
            />
            <Select
              name="target_type"
              label="Тип"
              options={[
                { value: "poi", label: "Объект" },
                { value: "exhibit", label: "Экспонат музея" },
              ]}
            />
            <Select
              name="target_id"
              label="Куда ведёт"
              options={[
                ...pois.map((p) => ({
                  value: String(p.id),
                  label: `Объект: ${p.city_slug} — ${p.name}`,
                })),
                ...exhibits.map((e) => ({
                  value: String(e.id),
                  label: `Экспонат №${e.number}: ${e.name} (${e.museum})`,
                })),
              ]}
              hint="Выберите запись, соответствующую типу выше"
            />
          </div>
        </ActionForm>
      </section>

      <div className="no-print mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Готовые к печати</h2>
        <p className="text-xs soft">
          Печать страницы (Ctrl+P) даёт готовый лист табличек — служебные элементы
          в печать не попадают.
        </p>
      </div>

      <ul className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <li key={img.code} className="rounded-xl p-3 text-center surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.dataUrl}
              alt={`QR-код ${img.code}`}
              width={300}
              height={300}
              className="mx-auto h-auto w-full max-w-[160px] rounded bg-white p-1"
            />
            <p className="mt-2 font-mono text-sm font-semibold">{img.code}</p>
            <p className="truncate text-xs soft" title={img.name}>
              {img.name}
            </p>
            <p className="no-print mt-1 text-[0.65rem] soft">
              {img.type === "poi" ? "объект" : "экспонат"} · сканирований: {img.scans}
            </p>
            <form action={removeQr} className="no-print mt-1">
              <input type="hidden" name="code" value={img.code} />
              <button className="text-[0.65rem] text-red-500">Удалить код</button>
            </form>
          </li>
        ))}
      </ul>

      <section className="no-print">
        <h2 className="mb-3 font-semibold">Статистика сканирований</h2>
        <Table head={["Код", "Тип", "Объект", "Сканирований", "Ссылка"]}>
          {images
            .slice()
            .sort((a, b) => b.scans - a.scans)
            .map((img) => (
              <Tr key={img.code}>
                <Td className="font-mono">{img.code}</Td>
                <Td className="text-xs">{img.type === "poi" ? "объект" : "экспонат"}</Td>
                <Td>{img.name}</Td>
                <Td>{img.scans}</Td>
                <Td className="text-xs">
                  <a href={`/s/${img.code}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                    проверить ↗
                  </a>
                </Td>
              </Tr>
            ))}
        </Table>
      </section>

      <p className="no-print mt-4 max-w-3xl text-xs leading-relaxed soft">
        Перед печатью задайте домен платформы: переменная{" "}
        <code>APP_BASE_URL</code> или параметр адреса{" "}
        <code>?base=https://ваш-домен</code>. Коды, напечатанные с адресом
        localhost, работать на объектах не будут.
      </p>
    </>
  );
}
