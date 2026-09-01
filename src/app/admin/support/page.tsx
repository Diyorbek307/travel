import { Table, Td, Tr } from "@/components/admin/fields";
import { listSupportAdmin } from "@/lib/admin-db";
import { setSupportStatus } from "../actions";

export const dynamic = "force-dynamic";

/** Обращения в поддержку. */
export default async function AdminSupportPage() {
  const tickets = listSupportAdmin();
  const open = tickets.filter((x) => String(x.status) === "new").length;

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">
        Поддержка · {tickets.length}
        {open > 0 && <span className="ml-2 text-sm soft">новых: {open}</span>}
      </h1>

      <Table head={["Тема", "Сообщение", "Контакт", "Язык", "Когда", "Статус"]}>
        {tickets.map((x) => (
          <Tr key={String(x.id)}>
            <Td className="whitespace-nowrap text-xs">{String(x.topic)}</Td>
            <Td className="max-w-[26rem] text-xs">{String(x.message)}</Td>
            <Td className="whitespace-nowrap text-xs">
              {x.contact ? String(x.contact) : <span className="soft">—</span>}
            </Td>
            <Td className="text-xs">{x.lang ? String(x.lang) : "—"}</Td>
            <Td className="whitespace-nowrap text-xs soft">
              {String(x.created_at).slice(0, 16)}
            </Td>
            <Td>
              {String(x.status) === "new" ? (
                <form action={setSupportStatus}>
                  <input type="hidden" name="id" value={String(x.id)} />
                  <input type="hidden" name="status" value="done" />
                  <button className="text-xs underline" style={{ color: "var(--primary-text)" }}>
                    отметить решённым
                  </button>
                </form>
              ) : (
                <span className="text-xs soft">решено</span>
              )}
            </Td>
          </Tr>
        ))}
      </Table>

      {tickets.length === 0 && <p className="py-8 text-center soft">Обращений пока нет.</p>}

      <p className="mt-4 max-w-3xl text-xs soft">
        Контакт необязателен: человек может просто сообщить об ошибке в данных.
        Если контакт оставлен — ответьте по нему, других способов связи у нас нет.
      </p>
    </>
  );
}
