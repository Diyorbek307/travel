import Header from "@/components/header";
import QrScanner from "@/components/qr-scanner";
import { listQrCodes } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Экран сканирования QR-кодов на объектах и в музеях (п. 5, 7 ТЗ). */
export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ unknown?: string; error?: string }>;
}) {
  const { unknown, error } = await searchParams;
  const lang = await currentLang();
  const codes = listQrCodes().slice(0, 8);

  return (
    <>
      <Header lang={lang} title={t(lang, "scan")} subtitle={t(lang, "scan_hint")} back="/" />

      <main className="mx-auto max-w-md px-4 py-4">
        {unknown && (
          <p className="mb-4 rounded-lg px-3 py-2 text-sm surface">
            Код «{unknown}» не найден в базе. Возможно, табличка старая или код ещё
            не привязан к объекту.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg px-3 py-2 text-sm surface">
            Код найден, но объект недоступен. Сообщите администрации объекта.
          </p>
        )}

        <QrScanner />

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold">Коды для проверки</h2>
          <p className="mb-2 text-xs soft">
            В демоверсии таблички ещё не напечатаны. Эти коды уже заведены в базе —
            их можно ввести вручную, чтобы посмотреть, как работает сценарий.
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {codes.map((c) => (
              <li key={String(c.code)}>
                <a
                  href={`/s/${c.code}`}
                  className="block truncate rounded-lg px-3 py-2 text-sm transition-colors surface hover:bg-soft"
                >
                  <span className="font-mono" style={{ color: "var(--accent)" }}>
                    {String(c.code)}
                  </span>
                  <span className="block truncate text-xs soft">{String(c.target_name)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
