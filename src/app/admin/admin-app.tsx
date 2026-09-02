"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/admin/shell";
import { NotifProvider } from "@/admin/context/NotifContext";
import { ThemeProvider } from "@/admin/context/ThemeContext";

/**
 * Панель целиком клиентская.
 *
 * Тема и режим читаются из localStorage прямо в инициализаторе
 * состояния. На сервере его нет, и первый клиентский рендер разошёлся бы
 * с серверным — React ругается и откатывает разметку. Поэтому ждём
 * монтирования: на сервере не рисуем ничего.
 */
export default function AdminApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="admin-root" />;

  return (
    <ThemeProvider>
      <NotifProvider>
        <div className="admin-root">
          <AdminShell />
        </div>
      </NotifProvider>
    </ThemeProvider>
  );
}
