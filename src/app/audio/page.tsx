import Link from "next/link";
import AdBannerSlot from "@/components/ad-slot";
import Header from "@/components/header";
import Icon from "@/components/icon";
import { listPois } from "@/lib/db";
import { objectsCount, t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/**
 * Экран аудиогидов из макета.
 *
 * Собирает в одном месте то, что было разбросано: сканирование таблички,
 * список озвученных объектов и офлайн-пакеты. Раньше турист, пришедший
 * послушать историю, должен был сам догадаться открыть объект и пролистать
 * его до плеера.
 *
 * Выбора языка озвучки здесь нет, хотя в макете он был отдельным рядом
 * флагов: аудиогид звучит на языке интерфейса, и второй переключатель
 * рядом с тем, что уже стоит в шапке, только запутал бы.
 */
export default async function AudioPage() {
  const lang = await currentLang();

  // Озвучены те объекты, у которых написана история: плеер читает её
  // синтезом, пока не загружена запись диктора.
  const voiced = listPois({ lang }).filter((p) => p.full_story);

  return (
    <>
      <Header
        lang={lang}
        title={t(lang, "audio_title")}
        subtitle={objectsCount(lang, voiced.length)}
        back="/"
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <Link
          href="/scan"
          className="pressable mb-4 flex items-center gap-3 p-4 card hover:shadow-[var(--shadow-2)]"
        >
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-sm)]"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            <Icon name="qr" size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{t(lang, "scan_qr_title")}</span>
            <span className="block text-sm soft">{t(lang, "scan_qr_lead")}</span>
          </span>
          <Icon name="chevron-right" size={18} />
        </Link>

        <AdBannerSlot slot="audio" lang={lang} className="mb-4" />

        <h2 className="mb-2 font-semibold">{t(lang, "audio_available")}</h2>
        <ul className="mb-5 grid gap-2">
          {voiced.slice(0, 40).map((poi) => (
            <li key={poi.id}>
              <Link
                href={`/poi/${poi.slug}`}
                className="pressable flex items-center gap-3 p-3 card hover:shadow-[var(--shadow-2)]"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                  style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
                >
                  <Icon name="headphones" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{poi.name}</span>
                  <span className="block truncate text-xs faint">{poi.city_slug}</span>
                </span>
                <Icon name="play" size={18} filled />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/offline"
          className="pressable flex items-center gap-3 p-4 card hover:shadow-[var(--shadow-2)]"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
            style={{ background: "var(--primary-tint)", color: "var(--primary-text)" }}
          >
            <Icon name="download" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{t(lang, "offline")}</span>
            <span className="block text-sm soft">{t(lang, "offline_lead")}</span>
          </span>
          <Icon name="chevron-right" size={18} />
        </Link>

        <p className="mt-4 text-xs leading-relaxed soft">{t(lang, "audio_notice")}</p>
      </main>
    </>
  );
}
