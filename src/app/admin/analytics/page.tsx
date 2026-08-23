import { Table, Td, Tr } from "@/components/admin/fields";
import { analytics } from "@/lib/db";
import { LANG_FLAG, LANG_LABEL } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  city_open: "Открытие города",
  poi_open: "Открытие объекта",
  qr_scan: "Сканирование QR",
  audio_start: "Запуск аудиогида",
  audio_complete: "Аудиогид дослушан",
  route_generated: "Построен маршрут",
  tour_open: "Открыт готовый маршрут",
  favorite_add: "Добавлено в избранное",
  gps_nearby_shown: "Подсказка «вы рядом»",
  offline_download: "Загрузка города офлайн",
};

/** Обезличенная туристическая статистика (п. 17 ТЗ). */
export default function AdminAnalyticsPage() {
  const stats = analytics();
  const totalEvents = Number(stats.totals.events);

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Аналитика</h1>
      <p className="mb-5 max-w-3xl text-sm soft">
        Собираются только обезличенные события: тип, объект, язык и случайный
        идентификатор сессии, живущий до закрытия вкладки. Ни личности, ни
        траектории перемещения туриста в базе нет — это заложено в схему,
        а не настраивается.
      </p>

      {totalEvents === 0 ? (
        <p className="rounded-xl p-4 text-sm surface soft">
          Событий пока нет. Походите по приложению — откройте город, объект,
          отсканируйте код, постройте маршрут — и статистика появится здесь.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title={`Действия · ${totalEvents}`}>
            <Table head={["Событие", "Количество", "Доля"]}>
              {stats.byType.map((row) => (
                <Tr key={String(row.type)}>
                  <Td>{EVENT_LABEL[String(row.type)] ?? String(row.type)}</Td>
                  <Td>{Number(row.n)}</Td>
                  <Td>
                    <Bar value={Number(row.n) / totalEvents} />
                  </Td>
                </Tr>
              ))}
            </Table>
          </Section>

          <Section title="Языки">
            <Table head={["Язык", "Событий", "Доля"]}>
              {stats.byLang.map((row) => (
                <Tr key={String(row.lang)}>
                  <Td>
                    {LANG_FLAG[String(row.lang) as Lang]}{" "}
                    {LANG_LABEL[String(row.lang) as Lang] ?? String(row.lang)}
                  </Td>
                  <Td>{Number(row.n)}</Td>
                  <Td>
                    <Bar value={Number(row.n) / totalEvents} />
                  </Td>
                </Tr>
              ))}
            </Table>
          </Section>

          <Section title="Популярные города">
            {stats.topCities.length === 0 ? (
              <Empty />
            ) : (
              <Table head={["Город", "Обращений"]}>
                {stats.topCities.map((row) => (
                  <Tr key={String(row.slug)}>
                    <Td>{String(row.name)}</Td>
                    <Td>{Number(row.n)}</Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Section>

          <Section title="Популярные объекты">
            {stats.topPois.length === 0 ? (
              <Empty />
            ) : (
              <Table head={["Объект", "Обращений"]}>
                {stats.topPois.map((row) => (
                  <Tr key={String(row.slug)}>
                    <Td>{String(row.name)}</Td>
                    <Td>{Number(row.n)}</Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Section>

          <Section title="Сканирования QR">
            {stats.topQr.length === 0 ? (
              <Empty />
            ) : (
              <Table head={["Код", "Сканирований"]}>
                {stats.topQr.map((row) => (
                  <Tr key={String(row.code)}>
                    <Td className="font-mono">{String(row.code)}</Td>
                    <Td>{Number(row.scans)}</Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Section>
        </div>
      )}

      <section className="mt-6 max-w-3xl rounded-xl p-4 text-sm leading-relaxed surface">
        <h2 className="mb-2 font-semibold">Что даёт эта статистика</h2>
        <ul className="grid gap-1.5 soft">
          <li>• Какие города и объекты реально посещают, а какие остаются в стороне</li>
          <li>• На каких языках нужен контент в первую очередь</li>
          <li>• Работают ли размещённые QR-таблички и где их не хватает</li>
          <li>• Дослушивают ли аудиогиды до конца — показатель качества текста</li>
          <li>• Сколько времени туристы закладывают на маршрут</li>
        </ul>
        <p className="mt-3 text-xs">
          При росте нагрузки события стоит переносить в аналитическое хранилище
          (например, ClickHouse): SQLite не рассчитан на миллионы записей
          с постоянной агрегацией.
        </p>
      </section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-soft">
      <div
        className="h-full"
        style={{ width: `${Math.round(value * 100)}%`, background: "var(--accent)" }}
      />
    </div>
  );
}

function Empty() {
  return <p className="rounded-xl p-3 text-sm surface soft">Пока нет данных.</p>;
}
