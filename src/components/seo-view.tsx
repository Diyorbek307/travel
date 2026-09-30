import { notFound } from "next/navigation";
import { LOCALE_META, LOCALES } from "@/lib/i18n";
import { МЕСТА } from "@/data/geo";
import { адресСтраницы, метаданные, разметка, страница, языкИз, ТЕКСТЫ, type ВидСтраницы } from "@/lib/seo";

/**
 * Серверная страница записи — то, что видят поисковик и превью ссылки
 * в мессенджере. Простая вёрстка без клиентского кода: быстро грузится
 * даже на слабой сети, а всё живое — в приложении по кнопке.
 */

export interface ПараметрыСтраницы {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function метаСтраницы(вид: ВидСтраницы, { params, searchParams }: ПараметрыСтраницы) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const с = await страница(вид, decodeURIComponent(id), языкИз(sp.lang));
  return с ? метаданные(с) : {};
}

export async function СтраницаЗаписи({
  вид,
  params,
  searchParams,
}: ПараметрыСтраницы & { вид: ВидСтраницы }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const язык = языкИз(sp.lang);
  const с = await страница(вид, decodeURIComponent(id), язык);
  if (!с) notFound();

  const гео = МЕСТА[с.имяRu] ?? null;
  const карта = гео
    ? `https://www.google.com/maps/search/?api=1&query=${гео.lat},${гео.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${с.имяRu}, ${с.город}, Uzbekistan`,
      )}`;
  const вПриложении = `/?${вид}=${encodeURIComponent(с.id)}`;
  const rtl = LOCALE_META[язык].dir === "rtl";

  return (
    <main
      lang={язык}
      dir={rtl ? "rtl" : "ltr"}
      className="mx-auto min-h-full max-w-2xl pb-16"
      style={{ background: "var(--cream)", color: "var(--text)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(разметка(с, гео)) }}
      />
      <div className="relative h-72 overflow-hidden sm:h-96">
        {с.фото[0] && <img src={с.фото[0]} alt={с.имя} className="h-full w-full object-cover" />}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%)" }}
        />
        <a
          href="/"
          className="absolute left-4 top-4 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-black"
        >
          HelloUZ · {ТЕКСТЫ.home[язык]}
        </a>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{с.город}</p>
          <h1
            className="mt-1 text-3xl font-bold leading-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {с.имя}
          </h1>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <a
            href={вПриложении}
            className="flex-1 rounded-2xl px-5 py-3.5 text-center text-sm font-bold text-white"
            style={{ background: "var(--accent-fill)" }}
          >
            {ТЕКСТЫ.open[язык]}
          </a>
          <a
            href={карта}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border px-5 py-3.5 text-center text-sm font-bold"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}
          >
            📍 {ТЕКСТЫ.map[язык]}
          </a>
        </div>

        {с.строки.length > 0 && (
          <dl
            className="grid grid-cols-2 gap-3 rounded-2xl border p-4 sm:grid-cols-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {с.строки.map((с2) => (
              <div key={с2.подпись}>
                <dt className="text-[11px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  {с2.подпись}
                </dt>
                <dd className="text-sm font-semibold">{с2.значение}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="text-base leading-relaxed">{с.описание}</p>

        {с.факты.length > 0 && (
          <ul
            className="space-y-2 rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {с.факты.map((ф) => (
              <li key={ф.id} className="text-sm">
                <b>{ф.label}:</b> {ф.value}
              </li>
            ))}
          </ul>
        )}

        {с.фото.length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            {с.фото.slice(1).map((ф) => (
              <img
                key={ф}
                src={ф}
                alt={с.имя}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        <p className="rounded-2xl p-4 text-sm" style={{ background: "var(--accent-soft)" }}>
          {ТЕКСТЫ.more[язык]}
        </p>

        <nav className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-xs" style={{ color: "var(--muted)" }}>
          {LOCALES.map((l) => (
            <a
              key={l}
              href={адресСтраницы(вид, с.id, l)}
              hrefLang={l}
              style={{ fontWeight: l === язык ? 700 : 400 }}
            >
              {LOCALE_META[l].label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
