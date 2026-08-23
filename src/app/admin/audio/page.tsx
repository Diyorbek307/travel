import AudioUpload from "@/components/admin/audio-upload";
import { Table, Td, Tr } from "@/components/admin/fields";
import { audioCoverage, listPoisAdmin } from "@/lib/admin-db";
import { getDb } from "@/lib/db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS, type Lang } from "@/lib/types";
import { removeAudio } from "../actions";

export const dynamic = "force-dynamic";

/** Загрузка и учёт профессиональной озвучки (п. 6, 16 ТЗ). */
export default function AdminAudioPage() {
  const pois = listPoisAdmin().map((p) => ({
    id: Number(p.id),
    slug: String(p.slug),
    name: String(p.name),
    city: String(p.city_slug),
  }));

  const coverage = audioCoverage();
  const audioByLang = new Map(coverage.byLang.map((r) => [String(r.lang), Number(r.n)]));

  const tracks = getDb()
    .prepare(
      `SELECT a.poi_id, a.lang, a.url, a.duration_sec, a.narrator,
              COALESCE(t.name, p.slug) AS name, c.slug AS city
         FROM poi_audio a
         JOIN pois p   ON p.id = a.poi_id
         JOIN cities c ON c.id = p.city_id
         LEFT JOIN poi_translations t ON t.poi_id = p.id AND t.lang = 'ru'
        ORDER BY c.slug, name, a.lang`,
    )
    .all() as Record<string, unknown>[];

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Аудиогиды</h1>

      <section className="mb-6 grid grid-cols-3 gap-3 sm:max-w-md">
        {MVP_LANGS.map((lang) => (
          <div key={lang} className="rounded-xl p-3 surface">
            <div className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
              {audioByLang.get(lang) ?? 0}
            </div>
            <div className="text-xs soft">
              {LANG_FLAG[lang]} из {coverage.total}
            </div>
          </div>
        ))}
      </section>

      <div className="mb-6">
        <AudioUpload pois={pois} />
      </div>

      <h2 className="mb-3 font-semibold">Загруженные записи · {tracks.length}</h2>

      {tracks.length === 0 ? (
        <p className="rounded-xl p-4 text-sm surface soft">
          Записей пока нет. До их появления приложение читает тексты синтезом речи
          и помечает это в интерфейсе — так заказчик и турист видят реальный
          статус контента, а не имитацию готовности.
        </p>
      ) : (
        <Table head={["Объект", "Город", "Язык", "Файл", "Длительность", "Диктор", ""]}>
          {tracks.map((track) => (
            <Tr key={`${track.poi_id}-${track.lang}`}>
              <Td>{String(track.name)}</Td>
              <Td className="text-xs">{String(track.city)}</Td>
              <Td>
                {LANG_FLAG[String(track.lang) as Lang]} {LANG_LABEL[String(track.lang) as Lang]}
              </Td>
              <Td className="font-mono text-xs">
                <a href={String(track.url)} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                  {String(track.url)}
                </a>
              </Td>
              <Td className="text-xs">
                {Math.floor(Number(track.duration_sec) / 60)}:
                {String(Number(track.duration_sec) % 60).padStart(2, "0")}
              </Td>
              <Td className="text-xs">{track.narrator ? String(track.narrator) : "—"}</Td>
              <Td>
                <form action={removeAudio}>
                  <input type="hidden" name="poi_id" value={Number(track.poi_id)} />
                  <input type="hidden" name="lang" value={String(track.lang)} />
                  <button className="text-xs text-red-500">Открепить</button>
                </form>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <p className="mt-4 max-w-3xl text-xs leading-relaxed soft">
        Оценка объёма работ по ТЗ: 300 объектов × 3 минуты × 10 языков ≈ 150 часов
        студийной записи. На старте достаточно трёх языков и ста приоритетных
        объектов — около 15 часов. «Открепить» удаляет только связь в базе,
        сам файл остаётся на диске.
      </p>
    </>
  );
}
