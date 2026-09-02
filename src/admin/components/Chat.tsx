import { useState, useRef, useEffect } from "react";
import { USERS, INITIAL_MESSAGES, Message } from "../data/mockData";

type Props = {
  messages: Record<number, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<number, Message[]>>>;
};

const chatUsers = USERS.filter((u) => INITIAL_MESSAGES[u.id] !== undefined || true);

export default function Chat({ messages, setMessages }: Props) {
  const [activeUserId, setActiveUserId] = useState<number>(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const activeUser = USERS.find((u) => u.id === activeUserId)!;
  const thread = messages[activeUserId] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, activeUserId]);

  const markRead = (uid: number) => {
    setMessages((prev) => ({
      ...prev,
      [uid]: (prev[uid] ?? []).map((m) => ({ ...m, read: true })),
    }));
  };

  const selectUser = (uid: number) => {
    setActiveUserId(uid);
    markRead(uid);
  };

  const send = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now(),
      userId: activeUserId,
      from: "admin",
      text: input.trim(),
      time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };
    setMessages((prev) => ({
      ...prev,
      [activeUserId]: [...(prev[activeUserId] ?? []), msg],
    }));
    setInput("");

    // Simulate reply after 2s for demo
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replies = [
          "Спасибо за быстрый ответ!",
          "Отлично, оформлю бронирование.",
          "Можете прислать подробный маршрут?",
          "Прекрасно, увидимся в день отправления!",
          "Ещё один вопрос — что взять с собой?",
        ];
        const reply: Message = {
          id: Date.now() + 1,
          userId: activeUserId,
          from: "user",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
          read: false,
        };
        setMessages((prev) => ({
          ...prev,
          [activeUserId]: [...(prev[activeUserId] ?? []), reply],
        }));
      }, 2000);
    }
  };

  const unreadFor = (uid: number) =>
    (messages[uid] ?? []).filter((m) => m.from === "user" && !m.read).length;

  const lastMsg = (uid: number) => {
    const msgs = messages[uid];
    if (!msgs || msgs.length === 0) return "Нет сообщений";
    return msgs[msgs.length - 1].text;
  };

  const filteredUsers = USERS.filter(
    (u) => search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full" style={{ height: "100%" }}>
      {/* User list */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: "280px",
          borderRight: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div className="p-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div
            className="text-base font-semibold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Чат поддержки
          </div>
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((u) => {
            const unread = unreadFor(u.id);
            const last = lastMsg(u.id);
            return (
              <button
                key={u.id}
                onClick={() => selectUser(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer"
                style={{
                  background: activeUserId === u.id ? "var(--color-panel)" : "transparent",
                  borderLeft: activeUserId === u.id ? "2px solid var(--color-amber)" : "2px solid transparent",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                  >
                    {u.avatar}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      background: u.status === "active" ? "var(--color-teal)" : u.status === "suspended" ? "var(--color-rose)" : "#888",
                      borderColor: "var(--color-surface)",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {u.name}
                    </span>
                    {unread > 0 && (
                      <span
                        className="text-xs rounded-full px-1.5 py-0.5 font-bold shrink-0 ml-1"
                        style={{ background: "var(--color-rose)", color: "#fff", fontSize: "10px" }}
                      >
                        {unread}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs truncate mt-0.5"
                    style={{ color: unread > 0 ? "var(--color-text)" : "var(--color-muted)" }}
                  >
                    {last}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>
                    {u.flag} {u.country} · {u.lastSeen}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex flex-col flex-1 min-w-0" style={{ background: "var(--color-bg)" }}>
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
            >
              {activeUser.avatar}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background: activeUser.status === "active" ? "var(--color-teal)" : "#888",
                borderColor: "var(--color-surface)",
              }}
            />
          </div>
          <div>
            <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{activeUser.name}</div>
            <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              {activeUser.flag} {activeUser.country} · {activeUser.email} · Последний раз {activeUser.lastSeen}
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            {[
              { label: `${activeUser.bookings} bookings`, color: "var(--color-teal)" },
              { label: activeUser.role, color: "var(--color-amber)" },
              { label: activeUser.status, color: activeUser.status === "active" ? "var(--color-teal)" : "var(--color-rose)" },
            ].map((b) => (
              <span
                key={b.label}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--color-border)",
                  color: b.color,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {thread.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center" style={{ color: "var(--color-muted)" }}>
                <div className="text-3xl mb-2">◈</div>
                <div className="text-sm">Нет сообщений. Начните переписку.</div>
              </div>
            </div>
          )}
          {thread.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-sm px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                style={{
                  background: msg.from === "admin"
                    ? "var(--color-amber)"
                    : "var(--color-panel)",
                  color: msg.from === "admin" ? "#0d0c0a" : "var(--color-text)",
                  border: msg.from === "user" ? "1px solid var(--color-border)" : "none",
                  borderRadius: msg.from === "admin" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                }}
              >
                {msg.text}
                <div
                  className="text-xs mt-1 opacity-60"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}
                >
                  {msg.time}
                  {msg.from === "admin" && (
                    <span className="ml-1">{msg.read ? "✓✓" : "✓"}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Quick replies */}
        <div className="px-5 py-2 flex gap-2 overflow-x-auto shrink-0" style={{ borderTop: "1px solid var(--color-border)" }}>
          {[
            "Здравствуйте! Чем могу помочь?",
            "Ваше бронирование подтверждено ✓",
            "Проверьте письмо на вашем email",
            "Переключу вас на специалиста",
          ].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
                fontFamily: "var(--font-body)",
                whiteSpace: "nowrap",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="px-5 py-3 flex gap-3 items-end shrink-0"
          style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Введите сообщение… (Enter для отправки)"
            rows={1}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm resize-none outline-none"
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={send}
            className="rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 shrink-0"
            style={{
              background: input.trim() ? "var(--color-amber)" : "var(--color-dim)",
              color: input.trim() ? "#0d0c0a" : "var(--color-muted)",
            }}
          >
            Отправить →
          </button>
        </div>
      </div>
    </div>
  );
}
