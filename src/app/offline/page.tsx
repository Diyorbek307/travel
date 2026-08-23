import Header from "@/components/header";
import OfflineButton from "@/components/offline-button";
import { listCities, listPois } from "@/lib/db";
import { t } from "@/lib/i18n";
import { currentLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/** Управление офлайн-пакетами городов (п. 11 ТЗ). */
export default async function OfflinePage() {
  const lang = await currentLang();
  const cities = listCities(lang);

  return (
    <>
      <Header lang={lang} title={t(lang, "offline")} back="/profile" />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <p className="mb-4 text-sm soft">
          Скачайте город перед поездкой — карта, маршруты, описания и аудиогиды
          останутся доступны без интернета. Это особенно важно за пределами
          крупных городов и при роуминге.
        </p>

        <ul className="grid gap-3">
          {cities.map((city) => {
            const count = listPois({ city: city.slug, lang }).length;
            return (
              <li key={city.slug} className="flex items-center gap-3 rounded-xl p-3 surface">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{city.name}</p>
                  <p className="text-xs soft">
                    {count} {t(lang, "objects")}
                  </p>
                </div>
                <div className="w-32 shrink-0">
                  <OfflineButton citySlug={city.slug} cityName={city.name} lang={lang} />
                </div>
              </li>
            );
          })}
        </ul>

        <section className="mt-5 rounded-xl p-4 text-sm leading-relaxed surface">
          <h2 className="mb-2 font-semibold">Что попадает в офлайн</h2>
          <ul className="grid gap-1 soft">
            <li>• Список объектов с описаниями и историями на выбранном языке</li>
            <li>• Готовые маршруты города</li>
            <li>• Просмотренные участки карты</li>
            <li>• Загруженные аудиогиды и фотографии</li>
          </ul>
          <p className="mt-3 text-xs">
            Тайлы карты кэшируются по мере просмотра: пролистайте карту города
            перед выездом, чтобы она открылась офлайн целиком. Офлайн-режим
            работает в собранной версии приложения — в режиме разработки
            Service Worker намеренно отключён.
          </p>
        </section>
      </main>
    </>
  );
}
