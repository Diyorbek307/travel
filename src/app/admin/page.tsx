import Link from "next/link";
import { analytics } from "@/lib/db";
import { audioCoverage, listCitiesAdmin } from "@/lib/admin-db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import { MVP_LANGS, type Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Сводка по состоянию платформы: что уже есть и чего не хватает для запуска. */
export default function AdminDashboard() {
  const stats = analytics();
  const totals = stats.totals;
  const coverage = audioCoverage();
  const cities = listCitiesAdmin();

  const textByLang = new Map(coverage.textByLang.map((r) => [String(r.lang), Number(r.n)]));
  const audioByLang = new Map(coverage.byLang.map((r) => [String(r.lang), Number(r.n)]));

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Сводка</h1>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Города" value={Number(totals.cities)} href="/admin/cities" />
        <Stat label="Объекты" value={Number(totals.pois)} href="/admin/pois" />
        <Stat label="Маршруты" value={Number(totals.tours)} href="/admin/tours" />
        <Stat label="Экспонаты" value={Number(totals.exhibits)} href="/admin/museums" />
        <Stat label="QR-коды" value={Number(totals.qr_codes)} href="/admin/qr" />
        <Stat label="Аудиофайлы" value={Number(totals.audio_tracks)} href="/admin/audio" />
        <Stat label="События" value={Number(totals.events)} href="/admin/analytics" />
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">Готовность контента</h2>
        <p className="mb-3 text-sm soft">
          Для запуска MVP нужно 300 объектов и озвучка на трёх языках (п. 19 ТЗ).
          Ниже — фактическое покрытие.
        </p>

        <div className="overflow-x-auto rounded-xl surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <Th>Язык</Th>
                <Th>Тексты историй</Th>
                <Th>Аудиогиды</Th>
                <Th>Готовность</Th>
              </tr>
            </thead>
            <tbody>
              {MVP_LANGS.map((lang) => {
                const texts = textByLang.get(lang) ?? 0;
                const audio = audioByLang.get(lang) ?? 0;
                const percent = coverage.total ? Math.round((texts / coverage.total) * 100) : 0;
                return (
                  <tr key={lang} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <Td>
                      {LANG_FLAG[lang as Lang]} {LANG_LABEL[lang as Lang]}
                    </Td>
                    <Td>
                      {texts} из {coverage.total}
                    </Td>
                    <Td>
                      {audio === 0 ? (
                        <span className="soft">нет записей</span>
                      ) : (
                        `${audio} из ${coverage.total}`
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-soft">
                          <div
                            className="h-full"
                            style={{ width: `${percent}%`, background: "var(--accent)" }}
                          />
                        </div>
                        <span className="soft">{percent}%</span>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Number(totals.audio_tracks) === 0 && (
          <p className="mt-3 rounded-lg p-3 text-sm surface">
            Профессиональная озвучка ещё не загружена. Пока её нет, приложение
            читает тексты синтезом речи и честно помечает это в интерфейсе.
            Загрузить записи: <Link href="/admin/audio" style={{ color: "var(--accent)" }}>Аудиогиды</Link>.
          </p>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">Города</h2>
        <div className="overflow-x-auto rounded-xl surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <Th>Город</Th>
                <Th>Идентификатор</Th>
                <Th>Объектов</Th>
                <Th>Маршрутов</Th>
                <Th>Статус</Th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={String(c.slug)} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <Td>
                    <Link href={`/admin/pois?city=${c.slug}`} style={{ color: "var(--accent)" }}>
                      {String(c.name)}
                    </Link>
                  </Td>
                  <Td className="font-mono">{String(c.slug)}</Td>
                  <Td>{Number(c.poi_count)}</Td>
                  <Td>{Number(c.tour_count)}</Td>
                  <Td>{Number(c.is_active) ? "активен" : "скрыт"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl p-4 text-sm leading-relaxed surface">
        <h2 className="mb-2 font-semibold">Что нужно сделать до публичного запуска</h2>
        <ul className="grid gap-1.5 soft">
          <li>• Вычитать все тексты историй у историка — сейчас они помечены как черновые</li>
          <li>• Подтвердить цены и часы работы у дирекций объектов</li>
          <li>• Записать профессиональную озвучку и загрузить её</li>
          <li>• Загрузить фотографии с указанием автора и лицензии</li>
          <li>• Напечатать и разместить QR-таблички по согласованию с ведомствами</li>
          <li>• Заменить пароль админ-панели на полноценные учётные записи с ролями</li>
          <li>• Перенести базу на PostgreSQL и медиа в объектное хранилище</li>
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl p-3 transition-colors surface hover:bg-soft">
      <div className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
      <div className="text-xs soft">{label}</div>
    </Link>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide soft">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
