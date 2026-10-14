"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Вход через Google и Apple — сторона приложения.
 *
 * На сайте это обычный переход на /start. В приложении так нельзя: Google
 * не пускает вход внутри WebView. Поэтому открываем системный браузер
 * (Custom Tabs / Safari), а обратно сервер зовёт приложение ссылкой
 * hellouz://auth?ticket=… — её ловит слушатель ниже и меняет билет на
 * сессию уже в WebView.
 */

export type Провайдер = "google" | "apple";

export async function начатьВход(п: Провайдер): Promise<void> {
  const путь = `/api/auth/oauth/${п}/start?next=/`;
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: `${window.location.origin}${путь}&app=1`, presentationStyle: "popover" });
    return;
  }
  window.location.href = путь;
}

/** Ловить возврат из браузера. Возвращает функцию отписки. */
export function слушатьВозвратВхода(): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  let снять: (() => void) | null = null;
  let отменено = false;
  void import("@capacitor/app").then(async ({ App }) => {
    const h = await App.addListener("appUrlOpen", async ({ url }) => {
      if (!url.startsWith("hellouz://auth")) return;
      const п = new URLSearchParams(url.split("?")[1] ?? "");
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.close();
      } catch {}
      const билет = п.get("ticket");
      const дальше = п.get("next") ?? "/";
      window.location.href = билет
        ? `/api/auth/oauth/redeem?${new URLSearchParams({ ticket: билет, next: дальше })}`
        : `/?auth=login&oauth_error=${encodeURIComponent(п.get("error") ?? "provider")}`;
    });
    if (отменено) void h.remove();
    else снять = () => void h.remove();
  });
  return () => {
    отменено = true;
    снять?.();
  };
}
