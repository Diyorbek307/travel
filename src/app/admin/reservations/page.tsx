import { Table, Td, Tr } from "@/components/admin/fields";
import { listReservationsAdmin } from "@/lib/admin-db";
import { setReservationStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "новая",
  confirmed: "подтверждена",
  declined: "отклонена",
};

/** Заявки на столик — не подтверждённая бронь, администратор перезванивает сам. */
export default async function AdminReservationsPage() {
  const reservations = listReservationsAdmin();

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Заявки на столик · {reservations.length}</h1>

      <Table head={["Заведение", "Гость", "Телефон", "Когда", "Гостей", "Заметка", "Статус", "Заявка от"]}>
        {reservations.map((r) => (
          <Tr key={String(r.id)}>
            <Td>
              <span className="block">{String(r.poi_name)}</span>
              <span className="block font-mono text-xs soft">{String(r.city_slug)}</span>
            </Td>
            <Td>{String(r.name)}</Td>
            <Td className="whitespace-nowrap text-xs">{String(r.phone)}</Td>
            <Td className="whitespace-nowrap text-xs">{formatDate(String(r.requested_at))}</Td>
            <Td className="text-xs">{Number(r.party_size)}</Td>
            <Td className="max-w-[16rem] text-xs soft">
              {r.note ? String(r.note) : <span>—</span>}
            </Td>
            <Td>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs">{STATUS_LABEL[String(r.status)] ?? String(r.status)}</span>
                {/* Отдельная форма на каждое значение статуса, а не общая с
                    двумя submit-кнопками: у server actions значение
                    нажатой кнопки не попадает в FormData так, как в обычной
                    форме — тот же приём, что у togglePoi/removePoi. */}
                {String(r.status) !== "confirmed" && (
                  <form action={setReservationStatus}>
                    <input type="hidden" name="id" value={String(r.id)} />
                    <input type="hidden" name="status" value="confirmed" />
                    <button
                      type="submit"
                      className="text-xs underline"
                      style={{ color: "var(--primary-text)" }}
                    >
                      подтвердить
                    </button>
                  </form>
                )}
                {String(r.status) !== "declined" && (
                  <form action={setReservationStatus}>
                    <input type="hidden" name="id" value={String(r.id)} />
                    <input type="hidden" name="status" value="declined" />
                    <button type="submit" className="text-xs text-red-500 underline">
                      отклонить
                    </button>
                  </form>
                )}
              </div>
            </Td>
            <Td className="whitespace-nowrap text-xs soft">{formatDate(String(r.created_at))}</Td>
          </Tr>
        ))}
      </Table>

      {reservations.length === 0 && (
        <p className="py-8 text-center soft">Заявок пока нет.</p>
      )}

      <p className="mt-4 text-xs soft">
        Это заявки, а не подтверждённые брони: у заведений нет системы
        бронирования, с которой можно было бы интегрироваться. После
        подтверждения свяжитесь с гостем сами по указанному телефону.
      </p>
    </>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
