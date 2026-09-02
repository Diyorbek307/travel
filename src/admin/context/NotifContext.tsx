"use client";

import React, { createContext, useContext, useState } from "react";

export type Notif = {
  id: number;
  type: "booking" | "review" | "chat" | "transport" | "system" | "payment";
  title: string;
  body: string;
  time: string;
  read: boolean;
  action?: string; // panel id to navigate to
};

const SEED: Notif[] = [
  { id: 1, type: "booking", title: "New booking confirmed", body: "Ahmed Khalil booked 6 seats on Silk Road Classic — $11,340", time: "2 min ago", read: false, action: "bookings" },
  { id: 2, type: "chat", title: "New message", body: "Yuki Tanaka: 'Can I book the same experience for December?'", time: "2 hr ago", read: false, action: "chat" },
  { id: 3, type: "review", title: "Review flagged", body: "A review on Khiva Night Tour was flagged for moderation", time: "3 hr ago", read: false, action: "reviews" },
  { id: 4, type: "transport", title: "Flight delayed", body: "QX-88 Tashkent → Fergana delayed by 45 minutes", time: "4 hr ago", read: false, action: "transport" },
  { id: 5, type: "payment", title: "Promotion payment received", body: "Samarkand Coffee House — $180 monthly fee collected", time: "5 hr ago", read: true, action: "ads" },
  { id: 6, type: "system", title: "Backup completed", body: "Daily database backup completed successfully — 2.4 GB", time: "6 hr ago", read: true },
  { id: 7, type: "booking", title: "Booking cancellation", body: "Dmitri Volkov cancelled BK-2636 — no refund issued", time: "8 hr ago", read: true, action: "bookings" },
  { id: 8, type: "chat", title: "New message", body: "Maria Chen: 'Can I pay in installments?'", time: "Yesterday", read: true, action: "chat" },
  { id: 9, type: "review", title: "New 5-star review", body: "Tariq Hassan gave 5 stars to Aral Sea Expedition", time: "Yesterday", read: true, action: "reviews" },
  { id: 10, type: "system", title: "Hotel capacity warning", body: "Malika Classic Hotel at 92% capacity for October", time: "2 days ago", read: true },
];

type NotifContextType = {
  notifs: Notif[];
  markRead: (id: number) => void;
  markAllRead: () => void;
  unreadCount: number;
};

const NotifContext = createContext<NotifContextType>({
  notifs: [],
  markRead: () => {},
  markAllRead: () => {},
  unreadCount: 0,
});

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notif[]>(SEED);

  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <NotifContext.Provider value={{ notifs, markRead, markAllRead, unreadCount }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotifs = () => useContext(NotifContext);
