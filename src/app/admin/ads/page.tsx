import ActionForm from "@/components/admin/action-form";
import { Checkbox, Fieldset, Input, Select, Table, Td, Tr } from "@/components/admin/fields";
import { listAdBannersAdmin } from "@/lib/admin-db";
import { LANG_LABEL } from "@/lib/i18n";
import { AD_SLOTS, MVP_LANGS } from "@/lib/types";
import { removeAd, saveAd, toggleAd } from "../actions";

export const dynamic = "force-dynamic";

const SLOT_LABEL: Record<string, string> = {
  city: "Страница города",
  explore: "Исследовать",
  audio: "Аудиогид",
  profile: "Профиль",
};

/** Рекламные блоки: приложение бесплатное и живёт за счёт них. */
export default async function AdminAdsPage() {
  const ads = listAdBannersAdmin();

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Реклама · {ads.length}</h1>

      <Table
        head={["Заголовок", "Место", "Язык", "Период", "Вес", "Показы", "Клики", "CTR", "Статус", ""]}
      >
        {ads.map((a) => {
          const shows = Number(a.impressions);
          const clicks = Number(a.clicks);
          return (
            <Tr key={String(a.id)}>
              <Td>
                <span className="block">{String(a.title)}</span>
                <span className="block max-w-[18rem] truncate text-xs soft">{String(a.url)}</span>
              </Td>
              <Td className="text-xs">{SLOT_LABEL[String(a.slot)] ?? String(a.slot)}</Td>
              <Td className="text-xs">{a.lang ? String(a.lang) : "все"}</Td>
              <Td className="whitespace-nowrap text-xs soft">
                {a.starts_at || a.ends_at
                  ? `${a.starts_at ? String(a.starts_at).slice(0, 10) : "…"} — ${a.ends_at ? String(a.ends_at).slice(0, 10) : "…"}`
                  : "бессрочно"}
              </Td>
              <Td className="text-xs">{Number(a.weight)}</Td>
              <Td className="text-xs">{shows}</Td>
              <Td className="text-xs">{clicks}</Td>
              <Td className="text-xs">
                {shows > 0 ? `${((clicks / shows) * 100).toFixed(1)}%` : "—"}
              </Td>
              <Td>
                <form action={toggleAd}>
                  <input type="hidden" name="id" value={String(a.id)} />
                  <input type="hidden" name="active" value={Number(a.is_active) ? "0" : "1"} />
                  <button className="text-xs underline" style={{ color: "var(--text-soft)" }}>
                    {Number(a.is_active) ? "крутится" : "остановлено"}
                  </button>
                </form>
              </Td>
              <Td>
                <form action={removeAd}>
                  <input type="hidden" name="id" value={String(a.id)} />
                  <button className="text-xs text-red-500">Удалить</button>
                </form>
              </Td>
            </Tr>
          );
        })}
      </Table>

      {ads.length === 0 && <p className="py-6 text-center soft">Объявлений пока нет.</p>}

      <h2 className="mb-3 mt-8 font-semibold">Новое объявление</h2>
      <ActionForm action={saveAd} submitLabel="Сохранить объявление" className="max-w-3xl">
        <Fieldset legend="Что показываем">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="title" label="Заголовок" required placeholder="Uzbekistan Airways" />
            <Input name="subtitle" label="Подзаголовок" placeholder="Прямые рейсы из Самарканда" />
            <Input
              name="url"
              label="Ссылка"
              type="url"
              required
              placeholder="https://example.uz"
              hint="Полный адрес вместе с https://"
            />
            <Input name="cta_label" label="Текст кнопки" placeholder="Купить билет" />
          </div>
        </Fieldset>

        <Fieldset legend="Где и когда">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              name="slot"
              label="Место показа"
              options={AD_SLOTS.map((s) => ({ value: s, label: SLOT_LABEL[s] }))}
            />
            <Select
              name="lang"
              label="Язык"
              defaultValue=""
              options={[
                { value: "", label: "Все языки" },
                ...MVP_LANGS.map((l) => ({ value: l, label: LANG_LABEL[l] })),
              ]}
              hint="Креатив не переводится — показываем на языке рекламодателя"
            />
            <Input
              name="starts_at"
              label="Начало размещения"
              type="date"
              hint="Пусто — начать сразу"
            />
            <Input name="ends_at" label="Конец размещения" type="date" hint="Пусто — бессрочно" />
            <Input
              name="weight"
              label="Вес"
              type="number"
              min={0}
              defaultValue="0"
              hint="На одно место — один баннер: побеждает больший вес"
            />
            <div className="self-end">
              <Checkbox name="is_active" label="Крутить сейчас" defaultChecked />
            </div>
          </div>
        </Fieldset>
      </ActionForm>

      <p className="mt-4 max-w-3xl text-xs soft">
        Блок помечается словом «Реклама» — это чужой бренд, а не объект
        платформы. Платное поднятие ресторана в списке — другое: там место
        реальное и проверено, и помечается мягким «Рекомендуем» (задаётся
        полем «Приоритет в топе» в карточке объекта).
      </p>
    </>
  );
}
