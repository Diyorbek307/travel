import { useEffect, useMemo, useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedAudio } from "@/lib/types";

/**
 * Аудиогиды.
 *
 * Раздел добавлен потому, что экран «Аудио» в приложении показывал три
 * выдуманные записи с выдуманной длительностью, и нажатие на них ничего
 * не воспроизводило. Теперь список берётся отсюда, и если он пуст —
 * приложение так и говорит, вместо трёх несуществующих экскурсий.
 *
 * Файл не загружаем, а ссылаемся на него. Звук весит мегабайты, а
 * постоянного диска у приложения нет: положить запись в базу рядом с
 * учётными записями значит раздуть её до неподъёмного за десяток
 * экскурсий. Ссылка работает уже сегодня; загрузка появится вместе с
 * файловым хранилищем.
 *
 * QR-код печатается на табличке у объекта. Человек наводит камеру и
 * попадает сразу на нужную запись, не разыскивая её в списке.
 */

const ЯЗЫКИ = ["Русский", "English", "Oʻzbek", "中文", "한국어", "Deutsch"];

function времяИзСекунд(с: number): string {
  if (!с) return "—";
  const м = Math.floor(с / 60);
  return `${м}:${String(с % 60).padStart(2, "0")}`;
}

export default function AudioGuides() {
  const [гиды, setГиды] = useEntity("audio");
  const [места] = useEntity("places");
  const [форма, setФорма] = useState(false);
  const [языкФильтр, setЯзыкФильтр] = useState("all");
  const [код, setКод] = useState<ManagedAudio | null>(null);

  const [новый, setНовый] = useState({ placeId: "", lang: "Русский", title: "", url: "", seconds: "" });

  const видимые = useMemo(
    () => (языкФильтр === "all" ? гиды : гиды.filter((г) => г.lang === языкФильтр)),
    [гиды, языкФильтр],
  );

  const добавить = () => {
    const место = места.find((м) => м.id === новый.placeId);
    if (!место || !новый.url.trim()) return;

    setГиды((prev) => [
      {
        id: `audio-${Date.now()}`,
        placeId: место.id,
        placeName: место.name,
        city: место.city,
        lang: новый.lang,
        title: новый.title.trim() || `${место.name} — аудиогид`,
        url: новый.url.trim(),
        seconds: Number(новый.seconds) || 0,
        active: true,
      },
      ...prev,
    ]);
    setНовый({ placeId: "", lang: "Русский", title: "", url: "", seconds: "" });
    setФорма(false);
  };

  const удалить = (id: string) => {
    // Спрашиваем прямо: запись пропадёт у всех, кто сейчас в приложении.
    if (!confirm("Удалить аудиогид? Он сразу исчезнет у туристов.")) return;
    setГиды((prev) => prev.filter((г) => г.id !== id));
  };

  const переключить = (id: string) => {
    setГиды((prev) => prev.map((г) => (г.id === id ? { ...г, active: !г.active } : г)));
  };

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Аудиогиды"
        subtitle={`${гиды.length} записей · ${гиды.filter((г) => г.active).length} доступно туристам`}
        action={<Btn onClick={() => setФорма((в) => !в)}>{форма ? "Отмена" : "Добавить запись"}</Btn>}
      />

      {форма && (
        <Card className="mb-6 p-5">
          <SectionTitle>Новая запись</SectionTitle>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))" }}>
            <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
              Место
              <select
                value={новый.placeId}
                onChange={(e) => setНовый((п) => ({ ...п, placeId: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-dim)" }}
              >
                <option value="">— выберите —</option>
                {места.map((м) => (
                  <option key={м.id} value={м.id}>
                    {м.name} · {м.city}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
              Язык
              <select
                value={новый.lang}
                onChange={(e) => setНовый((п) => ({ ...п, lang: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-dim)" }}
              >
                {ЯЗЫКИ.map((я) => (
                  <option key={я}>{я}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
              Название
              <input
                value={новый.title}
                onChange={(e) => setНовый((п) => ({ ...п, title: e.target.value }))}
                placeholder="Регистан: три медресе"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-dim)" }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
              Длительность, секунд
              <input
                value={новый.seconds}
                onChange={(e) => setНовый((п) => ({ ...п, seconds: e.target.value.replace(/\D/g, "") }))}
                placeholder="522"
                inputMode="numeric"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-dim)" }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs sm:col-span-2" style={{ color: "var(--color-muted)" }}>
              Ссылка на файл (mp3 или m4a)
              <input
                value={новый.url}
                onChange={(e) => setНовый((п) => ({ ...п, url: e.target.value }))}
                placeholder="https://…/registan-ru.mp3"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-dim)" }}
              />
            </label>
          </div>

          <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Файл должен лежать на сервере, отдающем его по https и разрешающем
            воспроизведение со стороннего сайта. Без места и ссылки запись не сохранится.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Btn onClick={добавить}>Сохранить</Btn>
            <Btn variant="ghost" onClick={() => setФорма(false)}>
              Отмена
            </Btn>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {["all", ...ЯЗЫКИ].map((я) => (
          <Btn key={я} small variant={языкФильтр === я ? "primary" : "ghost"} onClick={() => setЯзыкФильтр(я)}>
            {я === "all" ? "Все языки" : я}
          </Btn>
        ))}
      </div>

      {гиды.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Записей пока нет. Пока раздел пуст, экран «Аудио» в приложении так и
            пишет туристу, что аудиогидов ещё нет — вместо трёх выдуманных
            экскурсий, которые там были раньше.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {видимые.map((г) => (
            <Card key={г.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {г.title}
                    </span>
                    <Badge label={г.lang} color="teal" />
                    {!г.active && <Badge label="скрыт" color="dim" />}
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {г.placeName} · {г.city} · {времяИзСекунд(г.seconds)}
                  </p>
                  <p className="mt-1 truncate text-[11px]" style={{ color: "var(--color-dim)" }}>
                    {г.url}
                  </p>

                  {/* Слушаем прямо здесь: иначе неверную ссылку заметит турист, а не редактор. */}
                  <audio controls preload="none" src={г.url} className="mt-2 w-full max-w-md" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Btn small variant="ghost" onClick={() => setКод(г)}>
                    QR-код
                  </Btn>
                  <Btn small variant="ghost" onClick={() => переключить(г.id)}>
                    {г.active ? "Скрыть" : "Показать"}
                  </Btn>
                  <Btn small variant="ghost" onClick={() => удалить(г.id)}>
                    Удалить
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {код && <ОкноКода гид={код} onClose={() => setКод(null)} />}
    </div>
  );
}

/**
 * Табличка с кодом.
 *
 * Код ведёт не на файл, а на страницу приложения с этим гидом: иначе
 * телефон открыл бы голый звук в браузере, без названия, языка и
 * остального города вокруг.
 */
function ОкноКода({ гид, onClose }: { гид: ManagedAudio; onClose: () => void }) {
  const [картинка, setКартинка] = useState<string | null>(null);
  const [ошибка, setОшибка] = useState(false);

  const адрес =
    typeof window === "undefined" ? "" : `${window.location.origin}/?audio=${encodeURIComponent(гид.id)}`;

  useEffect(() => {
    let живо = true;
    // Библиотеку тянем по требованию: она нужна одному окну из тридцати.
    import("qrcode")
      .then((QR) => QR.toDataURL(адрес, { width: 640, margin: 2, errorCorrectionLevel: "M" }))
      .then((д) => живо && setКартинка(д))
      .catch(() => живо && setОшибка(true));
    return () => {
      живо = false;
    };
  }, [адрес]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "var(--color-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {гид.title}
        </p>
        <p className="mb-4 text-xs" style={{ color: "var(--color-muted)" }}>
          {гид.placeName} · {гид.lang}
        </p>

        {ошибка ? (
          <p className="text-sm" style={{ color: "var(--color-rose)" }}>
            Не удалось построить код.
          </p>
        ) : картинка ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={картинка} alt="QR-код аудиогида" className="w-full rounded-xl bg-white" />
            <p className="mt-3 break-all text-[11px]" style={{ color: "var(--color-dim)" }}>
              {адрес}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Строим код…
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {картинка && (
            <a
              href={картинка}
              download={`qr-${гид.id}.png`}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: "var(--color-amber)", color: "#1a1a1a" }}
            >
              Скачать для печати
            </a>
          )}
          <Btn small variant="ghost" onClick={onClose}>
            Закрыть
          </Btn>
        </div>
      </div>
    </div>
  );
}
