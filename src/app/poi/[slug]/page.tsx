import Link from "next/link";
import { notFound } from "next/navigation";
import AudioGuide from "@/components/audio-guide";
import Header from "@/components/header";
import PoiActions from "@/components/poi-actions";
import PoiMap from "@/components/poi-map";
import PoiPhoto from "@/components/poi-photo";
import { getCity, getMuseumByPoi, getPoi, getPoiMedia, listExhibits } from "@/lib/db";
import { formatPrice, todayHours } from "@/lib/geo";
import { categoryLabel, t, themeLabel } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";
import Icon from "@/components/icon";

export const dynamic = "force-dynamic";

/** Карточка объекта — то, что открывается по сканированию QR (п. 5 ТЗ). */
export default async function PoiPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const lang = await currentLang();

  const poi = getPoi(slug, lang);
  if (!poi) notFound();

  const city = getCity(poi.city_slug ?? "", lang);
  const media = getPoiMedia(poi.id);
  const museum = getMuseumByPoi(poi.id);
  const exhibits = museum ? listExhibits(museum.id, lang) : [];

  const day = new Date().getDay();
  const hours = todayHours(poi.opening_hours, day);

  return (
    <>
      <Header
        lang={lang}
        title={poi.name}
        subtitle={city?.name}
        back={city ? `/city/${city.slug}` : "/"}
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* Снимок во весь кадр: объект должен быть виден раньше, чем прочитан.
            Подпись автора обязательна — фотография чужая, и указание автора
            и лицензии есть условие, на котором её разрешено показывать. */}
        {poi.cover && (
          <section className="relative -mx-4 mb-4 h-64 overflow-hidden sm:mx-0 sm:rounded-[var(--radius-lg)]">
            <PoiPhoto poi={poi} priority sizes="(max-width: 768px) 100vw, 768px" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(18,24,20,0.9) 0%, rgba(18,24,20,0.35) 48%, rgba(18,24,20,0) 100%)",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                {categoryLabel(lang, poi.category)}
              </p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight">{poi.name}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-sm opacity-90">
                <span className="inline-flex items-center gap-1">
                  <Icon name="star" size={14} filled />
                  {poi.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="clock" size={13} />
                  {poi.avg_visit_min} {t(lang, "minutes")}
                </span>
                <span>{formatPrice(poi.price_uzs, lang)}</span>
              </p>
            </div>

            {media[0]?.author && (
              <p
                className="absolute right-2 top-2 max-w-[62%] truncate rounded-full px-2 py-0.5 text-[10px] text-white"
                style={{ background: "rgba(18,24,20,0.45)", backdropFilter: "blur(4px)" }}
              >
                {t(lang, "photo_by")}: {media[0].author} · {media[0].license}
              </p>
            )}
          </section>
        )}

        {from === "qr" && (
          <p
            className="mb-4 rounded-lg px-3 py-2 text-sm"
            style={{ background: "var(--bg-soft)", color: "var(--primary-text)" }}
          >
            <Icon name="qr" size={16} className="mr-1 inline align-[-3px]" />Открыто по QR-коду {poi.qr_code ? `«${poi.qr_code}»` : ""}
          </p>
        )}

        <div className="mb-4 flex items-start gap-3">
          {!poi.cover && (
            <span style={{ color: "var(--primary)" }}>
              <Icon name={poi.category} size={40} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {poi.short_desc && <p className="text-sm">{poi.short_desc}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Tag>{categoryLabel(lang, poi.category)}</Tag>
              {poi.themes.map((th) => (
                <Tag key={th}>{themeLabel(lang, th)}</Tag>
              ))}
            </div>
          </div>
        </div>

        <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Fact label={t(lang, "price")}>
            {formatPrice(poi.price_uzs, lang)}
          </Fact>
          <Fact label={t(lang, "hours")}>{hours ?? "круглосуточно"}</Fact>
          <Fact label={t(lang, "duration")}>
            {poi.avg_visit_min} {t(lang, "minutes")}
          </Fact>
          <Fact label="Рейтинг">{poi.rating.toFixed(1)}</Fact>
        </dl>

        <div className="mb-4">
          <PoiActions
            slug={poi.slug}
            name={poi.name}
            citySlug={poi.city_slug ?? ""}
            poiId={poi.id}
            cityId={poi.city_id}
            lang={lang}
          />
        </div>

        <div className="mb-4">
          <AudioGuide
            slug={poi.slug}
            name={poi.name}
            story={poi.full_story}
            audioUrl={poi.audio_url}
            durationSec={poi.audio_duration_sec}
            lang={lang}
            poiId={poi.id}
            cityId={poi.city_id}
          />
        </div>

        <section className="mb-4 overflow-hidden rounded-xl surface">
          <PoiMap poi={poi} lang={lang} className="h-56 w-full" />
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <span className="soft">
              {poi.lat.toFixed(5)}, {poi.lon.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary-text)" }}
            >
              Проложить маршрут →
            </a>
          </div>
        </section>

        {poi.full_story && (
          <section className="mb-4 rounded-xl p-4 surface">
            <h2 className="mb-3 font-semibold">{t(lang, "read")}</h2>
            <div className="story text-sm">
              {poi.full_story.split(/\n{2,}/).map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: renderBold(para) }} />
              ))}
            </div>
            <p className="mt-3 border-t pt-3 text-xs soft" style={{ borderColor: "var(--border)" }}>
              {t(lang, "draft_notice")}
            </p>
          </section>
        )}

        {media.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-2 font-semibold">{t(lang, "photos")}</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {media.map((m) => (
                <li key={m.url} className="overflow-hidden rounded-lg surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.caption ?? poi.name} className="h-32 w-full object-cover" />
                  {(m.author || m.license) && (
                    <p className="px-2 py-1 text-[0.65rem] soft">
                      {m.author} {m.license && `· ${m.license}`}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {exhibits.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-2 font-semibold">
              {t(lang, "exhibits")} · {exhibits.length}
            </h2>
            <p className="mb-3 text-sm soft">
              У каждого экспоната своя QR-табличка — отсканируйте её в зале, чтобы
              услышать рассказ (п. 7 ТЗ).
            </p>
            <ul className="grid gap-2">
              {exhibits.map((ex) => (
                <li key={ex.id}>
                  <Link
                    href={`/exhibit/${ex.id}`}
                    className="flex gap-3 rounded-xl p-3 transition-colors surface hover:bg-soft"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-semibold bg-soft"
                      style={{ color: "var(--primary-text)" }}
                    >
                      №{ex.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{ex.name}</span>
                      {ex.short_desc && (
                        <span className="block truncate text-sm soft">{ex.short_desc}</span>
                      )}
                      {ex.qr_code && (
                        <span className="block text-xs soft"><Icon name="qr" size={12} className="mr-1 inline align-[-2px]" />{ex.qr_code}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-xs bg-soft soft">{children}</span>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-2 surface">
      <dt className="text-[0.65rem] uppercase tracking-wide soft">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/**
 * Тексты историй хранятся с минимальной разметкой — только **жирный**
 * для подзаголовков. Полноценный markdown-парсер здесь избыточен,
 * а экранирование обязательно: тексты приходят из админ-панели.
 */
function renderBold(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
