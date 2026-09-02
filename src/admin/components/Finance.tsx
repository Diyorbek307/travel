import { useState } from "react";
import { PageHeader, Badge, Card, SectionTitle, Btn } from "./shared";

const TRANSACTIONS = [
  { id: "TXN-8841", date: "1 сен 2026", customer: "Ahmed Khalil", type: "Бронирование тура", amount: 5670, fee: 284, net: 5386, method: "Visa", status: "settled" },
  { id: "TXN-8840", date: "1 сен 2026", customer: "Alisher Nazarov", type: "Бронирование тура", amount: 3780, fee: 189, net: 3591, method: "Mastercard", status: "settled" },
  { id: "TXN-8839", date: "1 сен 2026", customer: "Plov Centre", type: "Промо платёж", amount: 250, fee: 0, net: 250, method: "Перевод", status: "settled" },
  { id: "TXN-8838", date: "1 сен 2026", customer: "Samarkand Coffee", type: "Промо платёж", amount: 180, fee: 0, net: 180, method: "Перевод", status: "settled" },
  { id: "TXN-8837", date: "1 сен 2026", customer: "Maria Chen", type: "Частичная оплата", amount: 315, fee: 16, net: 299, method: "Visa", status: "settled" },
  { id: "TXN-8836", date: "31 авг 2026", customer: "Uzbekistan Airways", type: "Рекламная кампания", amount: 450, fee: 0, net: 450, method: "Перевод", status: "settled" },
  { id: "TXN-8835", date: "31 авг 2026", customer: "James Walker", type: "Бронирование тура", amount: 3120, fee: 156, net: 2964, method: "PayPal", status: "settled" },
  { id: "TXN-8834", date: "31 авг 2026", customer: "Гид: Bobur T.", type: "Выплата", amount: -2400, fee: 0, net: -2400, method: "Банковский перевод", status: "paid" },
  { id: "TXN-8833", date: "30 авг 2026", customer: "Гид: Malika Y.", type: "Выплата", amount: -1800, fee: 0, net: -1800, method: "Банковский перевод", status: "paid" },
  { id: "TXN-8832", date: "30 авг 2026", customer: "Dmitri Volkov", type: "Возврат", amount: -320, fee: -16, net: -304, method: "Visa", status: "refunded" },
  { id: "TXN-8831", date: "30 авг 2026", customer: "Yuki Tanaka", type: "Бронирование тура", amount: 1860, fee: 93, net: 1767, method: "Amex", status: "settled" },
  { id: "TXN-8830", date: "29 авг 2026", customer: "Sophie Bernhard", type: "Бронирование тура", amount: 3780, fee: 189, net: 3591, method: "Mastercard", status: "settled" },
];

const MONTHLY_BREAKDOWN = [
  { category: "Туры", revenue: 68400, pct: 75 },
  { category: "Комиссии отелей", revenue: 8200, pct: 9 },
  { category: "Реклама", revenue: 5840, pct: 6.4 },
  { category: "Промо", revenue: 4800, pct: 5.3 },
  { category: "Транспорт", revenue: 2400, pct: 2.6 },
  { category: "Прочее", revenue: 1600, pct: 1.7 },
];

const PAYOUTS_INIT = [
  { guide: "Bobur Tashkentov", tours: 8, amount: 2400, status: "paid", date: "31 авг" },
  { guide: "Malika Yusupova", tours: 6, amount: 1800, status: "paid", date: "31 авг" },
  { guide: "Jasur Karimov", tours: 5, amount: 1500, status: "pending", date: "7 сен" },
  { guide: "Sherzod Nazarov", tours: 4, amount: 1200, status: "pending", date: "7 сен" },
  { guide: "Dilnoza Ergasheva", tours: 5, amount: 1500, status: "pending", date: "7 сен" },
  { guide: "Amir Akhmedov", tours: 2, amount: 800, status: "processing", date: "3 сен" },
];

const INVOICES_INIT = [
  { id: "INV-2609", client: "Samarkand Tours LLC", items: "Рекламная кампания × 1", amount: 800, date: "1 сен 2026", due: "15 сен 2026", status: "unpaid" },
  { id: "INV-2608", client: "Uzbekistan Airways", items: "Баннерная реклама × 1 (2 мес.)", amount: 2000, date: "1 сен 2026", due: "10 сен 2026", status: "paid" },
  { id: "INV-2607", client: "Plov Centre Toshkent", items: "Продвижение листинга × 1 мес.", amount: 250, date: "1 сен 2026", due: "5 сен 2026", status: "paid" },
  { id: "INV-2606", client: "Samarkand Coffee House", items: "Продвижение листинга × 1 мес.", amount: 180, date: "1 сен 2026", due: "5 сен 2026", status: "paid" },
  { id: "INV-2605", client: "Orient Star Khiva Hotel", items: "Баннерная реклама × 1", amount: 500, date: "1 авг 2026", due: "15 авг 2026", status: "paid" },
  { id: "INV-2604", client: "Fergana Silk Factory", items: "Топ листинг × 1 мес.", amount: 400, date: "1 авг 2026", due: "15 авг 2026", status: "overdue" },
];

export default function Finance() {
  const [tab, setTab] = useState<"overview" | "transactions" | "payouts" | "invoices">("overview");
  const [txFilter, setTxFilter] = useState("all");
  const [payouts, setPayouts] = useState(PAYOUTS_INIT);
  const [invoices, setInvoices] = useState(INVOICES_INIT);

  const payPayout = (idx: number) => setPayouts(p => p.map((x, i) => i === idx ? { ...x, status: "paid" } : x));
  const payAllPending = () => setPayouts(p => p.map(x => x.status === "pending" ? { ...x, status: "paid" } : x));
  const markInvoicePaid = (id: string) => setInvoices(p => p.map(x => x.id === id ? { ...x, status: "paid" } : x));

  const totalRevenue = 91240;
  const totalFees = TRANSACTIONS.filter(t => t.amount > 0).reduce((s, t) => s + t.fee, 0);
  const totalPayouts = Math.abs(TRANSACTIONS.filter(t => t.amount < 0 && t.type === "Payout").reduce((s, t) => s + t.amount, 0));
  const netProfit = totalRevenue - totalPayouts - totalFees;

  const filteredTx = txFilter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(t => {
    if (txFilter === "income") return t.amount > 0;
    if (txFilter === "payout") return t.type === "Выплата";
    if (txFilter === "refund") return t.type === "Возврат";
    return true;
  });

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Финансовые отчёты"
        subtitle="Выручка, выплаты, транзакции и счета"
        action={<Btn variant="ghost">Экспорт CSV</Btn>}
      />

      <div className="flex gap-1 mb-7">
        {([["overview", "Обзор"], ["transactions", "Транзакции"], ["payouts", "Выплаты гидам"], ["invoices", "Счета"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-all"
            style={{ background: tab === id ? "var(--color-amber)" : "var(--color-panel)", color: tab === id ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}
          >{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {[
              { label: "ВАЛОВАЯ ВЫРУЧКА", val: `$${totalRevenue.toLocaleString()}`, color: "var(--color-teal)", change: "+8.1%" },
              { label: "ВЫПЛАТЫ ГИДАМ", val: `$${totalPayouts.toLocaleString()}`, color: "var(--color-rose)", change: "+12%" },
              { label: "КОМИССИИ", val: `$${totalFees.toLocaleString()}`, color: "var(--color-muted)", change: "~5%" },
              { label: "ЧИСТАЯ ПРИБЫЛЬ", val: `$${netProfit.toLocaleString()}`, color: "var(--color-amber)", change: "+7.4%" },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
                <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
                <div className="text-xs mt-1" style={{ color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>↑ {s.change} vs пред. месяц</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Revenue breakdown */}
            <Card className="p-5">
              <SectionTitle>Структура выручки — Сен 2026</SectionTitle>
              <div className="flex flex-col gap-3">
                {MONTHLY_BREAKDOWN.map(b => (
                  <div key={b.category}>
                    <div className="flex justify-between gap-2 text-xs mb-1">
                      <span style={{ color: "var(--color-muted)" }}>{b.category}</span>
                      <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
                        ${b.revenue.toLocaleString()} <span style={{ color: "var(--color-muted)" }}>({b.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                      <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: "var(--color-amber)", opacity: 0.4 + b.pct * 0.008 }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between gap-2 text-sm font-semibold pt-2" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text)" }}>
                  <span>Итого</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-amber)" }}>$91,240</span>
                </div>
              </div>
            </Card>

            {/* Payment methods */}
            <Card className="p-5">
              <SectionTitle>Способы оплаты</SectionTitle>
              <div className="flex flex-col gap-3">
                {[
                  { method: "Visa", pct: 42, amount: "$38,320" },
                  { method: "Mastercard", pct: 28, amount: "$25,547" },
                  { method: "Банк. перевод", pct: 18, amount: "$16,423" },
                  { method: "PayPal", pct: 8, amount: "$7,299" },
                  { method: "Amex", pct: 4, amount: "$3,650" },
                ].map((m, i) => (
                  <div key={m.method} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      {m.method.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between gap-2 text-xs mb-1">
                        <span style={{ color: "var(--color-muted)" }}>{m.method}</span>
                        <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{m.amount}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                        <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: ["var(--color-amber)", "var(--color-teal)", "#7a8fff", "var(--color-rose)", "var(--color-muted)"][i] }} />
                      </div>
                    </div>
                    <span className="text-xs w-8 text-right shrink-0" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{m.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div>
          <div className="flex gap-1.5 mb-5">
            {([["all", "Все"], ["income", "Доходы"], ["payout", "Выплаты"], ["refund", "Возвраты"]] as [string, string][]).map(([f, label]) => (
              <button key={f} onClick={() => setTxFilter(f)}
                className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
                style={{ background: txFilter === f ? "var(--color-amber)" : "var(--color-panel)", color: txFilter === f ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
              >{label}</button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-panel)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ID", "ДАТА", "КЛИЕНТ / ОРГАНИЗАЦИЯ", "ТИП", "СУММА", "КОМИССИЯ", "ИТОГО", "МЕТОД", "СТАТУС"].map(c => (
                    <th key={c} className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: i < filteredTx.length - 1 ? "1px solid var(--color-border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-panel)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-2.5" style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.id}</td>
                    <td className="px-4 py-2.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.date}</td>
                    <td className="px-4 py-2.5" style={{ color: "var(--color-text)" }}>{t.customer}</td>
                    <td className="px-4 py-2.5" style={{ color: "var(--color-muted)", fontSize: "12px" }}>{t.type}</td>
                    <td className="px-4 py-2.5" style={{ color: t.amount < 0 ? "var(--color-rose)" : "var(--color-teal)", fontFamily: "var(--font-mono)" }}>
                      {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {t.fee !== 0 ? `$${Math.abs(t.fee)}` : "—"}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
                      {t.net < 0 ? "-" : "+"}${Math.abs(t.net).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "var(--color-muted)", fontSize: "12px" }}>{t.method}</td>
                    <td className="px-4 py-2.5">
                      <Badge
                        label={t.status === "settled" ? "проведён" : t.status === "paid" ? "оплачен" : t.status === "refunded" ? "возврат" : t.status}
                        color={t.status === "settled" ? "teal" : t.status === "paid" ? "teal" : t.status === "refunded" ? "rose" : "amber"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "payouts" && (
        <div>
          <div
            className="rounded-lg px-4 py-3 mb-5 text-sm"
            style={{ background: "rgba(42,141,122,0.08)", border: "1px solid rgba(42,141,122,0.2)", color: "var(--color-teal)" }}
          >
            ✓ Следующий цикл выплат: 7 сен 2026 — {payouts.filter(p => p.status === "pending").length} гидов ожидают
          </div>

          <div className="flex flex-col gap-3">
            {payouts.map((p, i) => (
              <div key={i} className="rounded-xl p-4 flex items-center gap-4" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                >
                  {p.guide[0]}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{p.guide}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{p.tours} туров в этом цикле</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>${p.amount.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>Выплата {p.date}</div>
                </div>
                <Badge
                  label={p.status === "paid" ? "оплачен" : p.status === "processing" ? "обработка" : "ожидание"}
                  color={p.status === "paid" ? "teal" : p.status === "processing" ? "amber" : "dim"}
                />
                {p.status === "pending" && <Btn small onClick={() => payPayout(i)}>Оплатить</Btn>}
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <Btn onClick={payAllPending}>Провести все выплаты</Btn>
            <Btn variant="ghost">Экспорт отчёта</Btn>
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div>
          <div className="grid gap-3">
            {invoices.map(inv => (
              <div key={inv.id} className="rounded-xl p-4 flex items-center gap-4" style={{ background: "var(--color-panel)", border: `1px solid ${inv.status === "overdue" ? "rgba(196,90,66,0.3)" : "var(--color-border)"}` }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{inv.id}</span>
                    <span style={{ color: "var(--color-muted)", fontSize: "12px" }}>→</span>
                    <span style={{ color: "var(--color-text)", fontSize: "13px" }}>{inv.client}</span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{inv.items}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>${inv.amount.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>До {inv.due}</div>
                </div>
                <Badge
                  label={inv.status === "paid" ? "оплачен" : inv.status === "overdue" ? "просрочен" : "не оплачен"}
                  color={inv.status === "paid" ? "teal" : inv.status === "overdue" ? "rose" : "amber"}
                />
                <div className="flex gap-2">
                  <Btn variant="ghost" small>Просмотр</Btn>
                  {inv.status !== "paid" && <Btn small onClick={() => markInvoicePaid(inv.id)}>Отметить оплаченным</Btn>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
