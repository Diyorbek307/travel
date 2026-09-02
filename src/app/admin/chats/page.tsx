import Link from "next/link";
import ActionForm from "@/components/admin/action-form";
import { Input } from "@/components/admin/fields";
import { listSupportChatMessages, listSupportChats } from "@/lib/admin-db";
import { replyToChat } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Чаты с туристами.
 *
 * Собеседник опознаётся по номеру паспорта: аккаунтов в приложении нет,
 * имя человек вписывает сам в профиле. Пока не вписал — виден только
 * номер, и это честнее подставленного «Гость №5».
 *
 * Координаты показываются, только пока не истёк срок, на который турист
 * включил трансляцию. Постоянного слежения нет: браузер не отдаёт
 * координаты закрытой вкладке, а бессрочная передача местоположения без
 * ведома человека — не безопасность, а слежка.
 */
export default async function AdminChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const chats = listSupportChats();
  const active = id ? chats.find((c) => String(c.traveller_id) === id) : null;
  const messages = active ? listSupportChatMessages(String(active.traveller_id)) : [];

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Чаты · {chats.length}</h1>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <ul className="grid max-h-[36rem] gap-2 overflow-y-auto">
          {chats.map((c) => {
            const sharing = c.last_lat != null && c.last_lon != null;
            return (
              <li key={String(c.traveller_id)}>
                <Link
                  href={`/admin/chats?id=${encodeURIComponent(String(c.traveller_id))}`}
                  className="block rounded-xl p-3 transition-colors surface hover:bg-soft"
                >
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {c.name ? String(c.name) : "Имя не указано"}
                    </span>
                    {sharing && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: "var(--danger)" }}
                      >
                        на карте
                      </span>
                    )}
                  </span>
                  <span className="block font-mono text-[11px] soft">
                    {String(c.traveller_id)}
                  </span>
                  {c.last_text ? (
                    <span className="mt-1 block truncate text-xs soft">
                      {String(c.last_text)}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div>
          {!active ? (
            <p className="py-10 text-center soft">
              {chats.length === 0 ? "Чатов пока нет." : "Выберите чат слева."}
            </p>
          ) : (
            <>
              <div className="mb-3 rounded-xl p-3 surface">
                <p className="font-medium">
                  {active.name ? String(active.name) : "Имя не указано"}
                </p>
                <p className="font-mono text-xs soft">{String(active.traveller_id)}</p>
                <p className="mt-1 text-xs soft">
                  Язык: {active.lang ? String(active.lang) : "—"} · был в сети:{" "}
                  {active.last_seen ? String(active.last_seen).slice(0, 16) : "—"}
                </p>

                {active.last_lat != null && active.last_lon != null ? (
                  <p className="mt-2 text-sm">
                    <a
                      href={`https://www.google.com/maps?q=${active.last_lat},${active.last_lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "var(--accent-strong)" }}
                    >
                      Показать на карте: {Number(active.last_lat).toFixed(5)},{" "}
                      {Number(active.last_lon).toFixed(5)}
                    </a>
                    <span className="block text-xs soft">
                      трансляция до {String(active.share_until).slice(11, 16)} UTC
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-xs soft">
                    Трансляция геопозиции выключена — координат нет.
                  </p>
                )}
              </div>

              <ul className="mb-3 grid max-h-[26rem] gap-2 overflow-y-auto rounded-xl p-3 surface">
                {messages.length === 0 && <li className="text-sm soft">Сообщений нет.</li>}
                {messages.map((m) => {
                  const staff = String(m.author) === "staff";
                  return (
                    <li
                      key={String(m.id)}
                      className="max-w-[85%] rounded-lg px-3 py-2 text-sm"
                      style={
                        staff
                          ? { marginLeft: "auto", background: "var(--primary-tint)" }
                          : { background: "var(--bg)" }
                      }
                    >
                      <p className="whitespace-pre-wrap break-words">{String(m.text)}</p>
                      {m.lat != null && m.lon != null && (
                        <a
                          href={`https://www.google.com/maps?q=${m.lat},${m.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs underline"
                        >
                          {Number(m.lat).toFixed(5)}, {Number(m.lon).toFixed(5)}
                        </a>
                      )}
                      <p className="mt-1 text-[10px] soft">
                        {staff ? "оператор" : "турист"} · {String(m.created_at).slice(11, 16)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <ActionForm action={replyToChat} submitLabel="Ответить">
                <input type="hidden" name="traveller_id" value={String(active.traveller_id)} />
                <Input name="text" label="Ответ туристу" required />
              </ActionForm>
            </>
          )}
        </div>
      </div>
    </>
  );
}
