import { NextResponse } from "next/server";
import { отказЕсли, разрешено } from "@/lib/admin-auth";
import { findByEmail, findById } from "@/lib/users";
import { всеЗаказыПодписки, отметитьОплатуПодписки } from "@/lib/provider-orders";
import {
  всеДанные,
  создатьПартнёра,
  изменитьПартнёра,
  удалитьПартнёра,
  одобрить,
  сохранитьТарифы,
} from "@/lib/providers";
import { listBookings } from "@/lib/community";
import {
  разобратьАнкету,
  продлить,
  ТАРИФЫ_ПО_УМОЛЧАНИЮ,
  type Тарифы,
  type ВидПартнёра,
} from "@/lib/provider-rules";

export const dynamic = "force-dynamic";

/**
 * Водители и гиды в панели: менеджер партнёров и владелец.
 *
 * GET — все анкеты (с телефонами, госномерами и заметками), туры, заказы
 * оплаты, тарифы. POST — завести анкету вручную. PATCH — действие над
 * анкетой или заказом. DELETE — удалить анкету вместе с её турами.
 */

export async function GET() {
  const нет = await отказЕсли("partners");
  if (нет) return нет;
  const { партнёры, туры, тарифы } = await всеДанные();
  const брони = (await listBookings()).filter((b) => b.providerId);
  // Почта владельца анкеты — менеджеру видно, чей это аккаунт.
  const почты: Record<string, string> = {};
  for (const п of партнёры)
    if (п.userId && !почты[п.userId]) почты[п.userId] = (await findById(п.userId))?.email ?? "";
  return NextResponse.json(
    {
      providers: партнёры,
      tours: туры,
      orders: (await всеЗаказыПодписки()).map(({ payme: _p, click: _c, ...з }) => з),
      bookings: брони,
      tariffs: тарифы,
      emails: почты,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const нет = await отказЕсли("partners");
  if (нет) return нет;
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const вид = тело.kind as ВидПартнёра;
  if (вид !== "driver" && вид !== "guide")
    return NextResponse.json({ error: "kind_invalid" }, { status: 400 });
  const разбор = разобратьАнкету(вид, тело);
  if (!разбор.ok) return NextResponse.json({ error: разбор.ошибка }, { status: 400 });
  // Привязать к аккаунту по почте — тогда человек сам увидит кабинет.
  const почта = typeof тело.email === "string" ? тело.email.trim().toLowerCase() : "";
  const user = почта ? await findByEmail(почта) : null;
  if (почта && !user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  const п = await создатьПартнёра(вид, разбор.поля, { userId: user?.id ?? null });
  // Менеджер заводит анкету человека, которого видел сам, — сразу одобряем.
  const итог = тело.approve === true ? await одобрить(п.id) : п;
  return NextResponse.json({ ok: true, provider: итог });
}

type Действие =
  | "approve"
  | "reject"
  | "suspend"
  | "activate"
  | "edit"
  | "extend"
  | "setPaidUntil"
  | "promote"
  | "unpromote"
  | "note"
  | "link"
  | "markPaid"
  | "tariffs";

export async function PATCH(request: Request) {
  const админ = await разрешено("partners");
  if (!админ) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const тело = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const действие = тело.action as Действие;
  const id = typeof тело.id === "string" ? тело.id : "";
  const заметка = typeof тело.note === "string" ? тело.note.trim().slice(0, 500) : "";
  const дней = Math.round(Number(тело.days));

  // Тарифы меняет только владелец — менеджер их видит, но не трогает.
  if (действие === "tariffs") {
    if (админ.role !== "owner") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const т = (тело.tariffs ?? {}) as Partial<Тарифы>;
    const число = (x: unknown, по: number, макс: number) => {
      const n = Math.round(Number(x));
      return Number.isFinite(n) && n >= 0 && n <= макс ? n : по;
    };
    const новые: Тарифы = {
      driverMonth: число(т.driverMonth, ТАРИФЫ_ПО_УМОЛЧАНИЮ.driverMonth, 50_000_000),
      guideMonth: число(т.guideMonth, ТАРИФЫ_ПО_УМОЛЧАНИЮ.guideMonth, 50_000_000),
      promoWeek: число(т.promoWeek, ТАРИФЫ_ПО_УМОЛЧАНИЮ.promoWeek, 50_000_000),
      promoMonth: число(т.promoMonth, ТАРИФЫ_ПО_УМОЛЧАНИЮ.promoMonth, 50_000_000),
      trialDays: число(т.trialDays, ТАРИФЫ_ПО_УМОЛЧАНИЮ.trialDays, 365),
    };
    await сохранитьТарифы(новые);
    return NextResponse.json({ ok: true, tariffs: новые });
  }

  // Оплата наличными или переводом — менеджер отмечает заказ сам.
  if (действие === "markPaid") {
    const ok = await отметитьОплатуПодписки(id, "вручную");
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }

  let итог;
  switch (действие) {
    case "approve":
      итог = await одобрить(id);
      break;
    case "reject":
      итог = await изменитьПартнёра(id, (п) => ({
        ...п,
        status: "rejected",
        statusNote: заметка || undefined,
      }));
      break;
    case "suspend":
      итог = await изменитьПартнёра(id, (п) => ({
        ...п,
        status: "suspended",
        statusNote: заметка || undefined,
      }));
      break;
    case "activate":
      итог = await изменитьПартнёра(id, (п) => ({ ...п, status: "active", statusNote: undefined }));
      break;
    case "edit": {
      const п = (await всеДанные()).партнёры.find((x) => x.id === id);
      if (!п) break;
      const разбор = разобратьАнкету(п.kind, тело);
      if (!разбор.ok) return NextResponse.json({ error: разбор.ошибка }, { status: 400 });
      итог = await изменитьПартнёра(id, (x) => ({ ...x, ...разбор.поля }));
      break;
    }
    case "extend":
      if (!(дней >= 1 && дней <= 3650)) return NextResponse.json({ error: "days_invalid" }, { status: 400 });
      итог = await изменитьПартнёра(id, (п) => ({ ...п, paidUntil: продлить(п.paidUntil, дней) }));
      break;
    case "setPaidUntil": {
      const дата = typeof тело.date === "string" && тело.date ? new Date(тело.date) : null;
      if (дата && Number.isNaN(дата.getTime()))
        return NextResponse.json({ error: "date_invalid" }, { status: 400 });
      итог = await изменитьПартнёра(id, (п) => ({ ...п, paidUntil: дата ? дата.toISOString() : null }));
      break;
    }
    case "promote": {
      if (!(дней >= 1 && дней <= 365)) return NextResponse.json({ error: "days_invalid" }, { status: 400 });
      const приоритет = Math.max(0, Math.min(100, Math.round(Number(тело.priority) || 0)));
      итог = await изменитьПартнёра(id, (п) => ({
        ...п,
        promotedUntil: продлить(п.promotedUntil, дней),
        promoPriority: приоритет,
      }));
      break;
    }
    case "unpromote":
      итог = await изменитьПартнёра(id, (п) => ({ ...п, promotedUntil: null }));
      break;
    case "note":
      итог = await изменитьПартнёра(id, (п) => ({ ...п, adminNote: заметка || undefined }));
      break;
    case "link": {
      const почта = typeof тело.email === "string" ? тело.email.trim().toLowerCase() : "";
      const user = почта ? await findByEmail(почта) : null;
      if (почта && !user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
      итог = await изменитьПартнёра(id, (п) => ({ ...п, userId: user?.id ?? null }));
      break;
    }
    default:
      return NextResponse.json({ error: "action_invalid" }, { status: 400 });
  }
  if (!итог) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, provider: итог });
}

export async function DELETE(request: Request) {
  const нет = await отказЕсли("partners");
  if (нет) return нет;
  const тело = ((await request.json().catch(() => null)) ?? {}) as { id?: unknown };
  const ok = await удалитьПартнёра(String(тело.id ?? ""));
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
