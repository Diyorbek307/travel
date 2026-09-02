import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { listBookings, listReviews, listThreads } from "@/lib/community";
import { listUsers } from "@/lib/users";
import { readContent } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Три месяца без входа — тот же срок, по которому истекает сессия. */
const НЕАКТИВЕН_МС = 90 * 24 * 60 * 60 * 1000;

const МЕСЯЦЫ = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

/**
 * Настоящие числа для дашборда и аналитики.
 *
 * Считаются из того, что есть: аккаунты, брони, отзывы, переписки,
 * содержимое. Ничего не выдумывается — раздел, по которому нечего
 * показать, честно отдаёт ноль. Правдоподобная цифра хуже нуля: по ней
 * принимают решения.
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [users, брони, отзывы, ветки, контент] = await Promise.all([
    listUsers(),
    listBookings(),
    listReviews(),
    listThreads(),
    readContent(),
  ]);

  const сейчас = Date.now();
  const активные = users.filter((u) => сейчас - new Date(u.lastSeenAt).getTime() < НЕАКТИВЕН_МС);

  // Регистрации по месяцам за последний год — накопительным итогом,
  // как это принято показывать на графике роста.
  const помесячно: { label: string; новых: number; всего: number }[] = [];
  let накопительно = 0;
  for (let назад = 11; назад >= 0; назад--) {
    const d = new Date();
    d.setMonth(d.getMonth() - назад, 1);
    d.setHours(0, 0, 0, 0);
    const следующий = new Date(d);
    следующий.setMonth(следующий.getMonth() + 1);

    const новых = users.filter((u) => {
      const t = new Date(u.createdAt).getTime();
      return t >= d.getTime() && t < следующий.getTime();
    }).length;

    накопительно += новых;
    помесячно.push({ label: МЕСЯЦЫ[d.getMonth()], новых, всего: накопительно });
  }

  // Страны: то, что люди указали сами. Не указавших не приписываем.
  const страны = new Map<string, number>();
  for (const u of users) {
    const c = u.country.trim();
    if (c) страны.set(c, (страны.get(c) ?? 0) + 1);
  }

  const средняяОценка =
    отзывы.length > 0
      ? Number((отзывы.reduce((s, r) => s + r.rating, 0) / отзывы.length).toFixed(1))
      : 0;

  return NextResponse.json(
    {
      пользователи: {
        всего: users.length,
        активные: активные.length,
        подтверждённые: users.filter((u) => u.emailVerified).length,
        сФотографией: users.filter((u) => u.hasPhoto).length,
      },
      брони: {
        всего: брони.length,
        новые: брони.filter((b) => b.status === "new").length,
        подтверждённые: брони.filter((b) => b.status === "confirmed").length,
        отменённые: брони.filter((b) => b.status === "cancelled").length,
        поВидам: {
          hotel: брони.filter((b) => b.kind === "hotel").length,
          restaurant: брони.filter((b) => b.kind === "restaurant").length,
          tour: брони.filter((b) => b.kind === "tour").length,
        },
      },
      отзывы: { всего: отзывы.length, средняяОценка, скрытые: отзывы.filter((r) => r.status === "hidden").length },
      поддержка: {
        веток: ветки.length,
        непрочитанных: ветки.reduce((s, t) => s + t.unreadForStaff, 0),
      },
      содержимое: {
        города: контент.cities.length,
        места: контент.places.length,
        отели: контент.hotels.length,
        рестораны: контент.restaurants.length,
        маршруты: контент.routes.length,
        события: контент.events.length,
        реклама: контент.ads.filter((a) => a.status === "active").length,
      },
      помесячно,
      страны: [...страны.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
