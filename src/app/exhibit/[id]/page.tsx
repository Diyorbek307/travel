import { notFound } from "next/navigation";
import AudioGuide from "@/components/audio-guide";
import Header from "@/components/header";
import Icon from "@/components/icon";
import { getExhibitById, getMuseumPoi } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Страница экспоната музея — открывается по QR у витрины (п. 7 ТЗ). */
export default async function ExhibitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const lang = await currentLang();

  const exhibitId = Number(id);
  if (!Number.isInteger(exhibitId)) notFound();

  const exhibit = getExhibitById(exhibitId, lang);
  if (!exhibit) notFound();

  const museumPoi = getMuseumPoi(exhibit.museum_id, lang);

  return (
    <>
      <Header
        lang={lang}
        title={`${t(lang, "exhibit")} №${exhibit.number}`}
        subtitle={museumPoi?.name}
        back={museumPoi ? `/poi/${museumPoi.slug}` : "/"}
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {from === "qr" && (
          <p
            className="mb-4 rounded-lg px-3 py-2 text-sm"
            style={{ background: "var(--bg-soft)", color: "var(--primary-text)" }}
          >
            <Icon name="qr" size={16} className="mr-1 inline align-[-3px]" />Открыто по QR-коду {exhibit.qr_code ? `«${exhibit.qr_code}»` : ""}
          </p>
        )}

        <h2 className="text-xl font-semibold">{exhibit.name}</h2>
        {exhibit.short_desc && <p className="mt-1 text-sm soft">{exhibit.short_desc}</p>}

        <dl className="my-4 grid grid-cols-2 gap-2">
          {exhibit.period && (
            <div className="rounded-lg px-3 py-2 surface">
              <dt className="text-[0.65rem] uppercase tracking-wide soft">
                {t(lang, "period")}
              </dt>
              <dd className="text-sm font-medium">{exhibit.period}</dd>
            </div>
          )}
          {exhibit.origin && (
            <div className="rounded-lg px-3 py-2 surface">
              <dt className="text-[0.65rem] uppercase tracking-wide soft">
                {t(lang, "origin")}
              </dt>
              <dd className="text-sm font-medium">{exhibit.origin}</dd>
            </div>
          )}
        </dl>

        <div className="mb-4">
          <AudioGuide
            slug={`exhibit-${exhibit.id}`}
            name={exhibit.name}
            story={exhibit.full_story}
            audioUrl={exhibit.audio_url}
            durationSec={exhibit.audio_duration_sec}
            lang={lang}
            poiId={museumPoi?.id ?? 0}
            cityId={museumPoi?.city_id ?? 0}
          />
        </div>

        {exhibit.full_story && (
          <section className="rounded-xl p-4 surface">
            <h3 className="mb-3 font-semibold">{t(lang, "read")}</h3>
            <div className="story text-sm">
              {exhibit.full_story.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <p className="mt-3 border-t pt-3 text-xs soft" style={{ borderColor: "var(--border)" }}>
              {t(lang, "draft_notice")}
            </p>
          </section>
        )}
      </main>
    </>
  );
}
