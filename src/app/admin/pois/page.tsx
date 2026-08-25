import Link from "next/link";
import { Table, Td, Tr } from "@/components/admin/fields";
import { listCitiesAdmin, listPoisAdmin } from "@/lib/admin-db";
import Icon from "@/components/icon";
import type { Category } from "@/lib/types";
import { removePoi, togglePoi } from "../actions";

export const dynamic = "force-dynamic";

/** Список объектов с быстрым доступом к правке (п. 16 ТЗ). */
export default async function AdminPoisPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const cities = listCitiesAdmin();
  const pois = listPoisAdmin(city);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Объекты · {pois.length}</h1>
        <Link
          href="/admin/pois/edit"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          + Добавить объект
        </Link>
      </div>

      <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <Chip href="/admin/pois" active={!city}>
          Все города
        </Chip>
        {cities.map((c) => (
          <Chip key={String(c.slug)} href={`/admin/pois?city=${c.slug}`} active={city === c.slug}>
            {String(c.name)}
          </Chip>
        ))}
      </nav>

      <Table
        head={["Название", "Город", "Категория", "Цена", "Осмотр", "Языки", "Аудио", "QR", "Статус", ""]}
      >
        {pois.map((p) => (
          <Tr key={String(p.slug)}>
            <Td>
              <Link href={`/admin/pois/edit?slug=${p.slug}`} style={{ color: "var(--accent)" }}>
                {String(p.name)}
              </Link>
              <span className="block font-mono text-xs soft">{String(p.slug)}</span>
            </Td>
            <Td className="text-xs">{String(p.city_slug)}</Td>
            <Td>
              <Icon name={String(p.category) as Category} size={16} className="inline" />{" "}
              <span className="text-xs soft">{String(p.category)}</span>
            </Td>
            <Td className="whitespace-nowrap text-xs">
              {Number(p.price_uzs) === 0
                ? "бесплатно"
                : `${Number(p.price_uzs).toLocaleString("ru-RU")}`}
            </Td>
            <Td className="text-xs">{Number(p.avg_visit_min)} мин</Td>
            <Td className="text-xs">{Number(p.lang_count)}</Td>
            <Td className="text-xs">
              {Number(p.audio_count) === 0 ? (
                <span className="soft">—</span>
              ) : (
                Number(p.audio_count)
              )}
            </Td>
            <Td className="font-mono text-xs">
              {p.qr_code ? String(p.qr_code) : <span className="soft">—</span>}
            </Td>
            <Td>
              <form action={togglePoi}>
                <input type="hidden" name="slug" value={String(p.slug)} />
                <input type="hidden" name="active" value={Number(p.is_active) ? "0" : "1"} />
                <button className="text-xs underline" style={{ color: "var(--text-soft)" }}>
                  {Number(p.is_active) ? "активен" : "скрыт"}
                </button>
              </form>
            </Td>
            <Td>
              <form action={removePoi}>
                <input type="hidden" name="slug" value={String(p.slug)} />
                <button className="text-xs text-red-500" title="Удалить объект">
                  Удалить
                </button>
              </form>
            </Td>
          </Tr>
        ))}
      </Table>

      {pois.length === 0 && <p className="py-8 text-center soft">Объектов пока нет.</p>}

      <p className="mt-4 text-xs soft">
        Скрытый объект не показывается туристам и не попадает в маршруты, но
        сохраняется вместе с переводами и аудио — так снимают с публикации
        закрытые на реставрацию памятники.
      </p>
    </>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm"
      style={{
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </Link>
  );
}
