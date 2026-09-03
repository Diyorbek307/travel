"use client";

import { useMemo, useState } from "react";
import { BORDER, CREAM, GREEN, MUTED, TEXT } from "@/lib/theme";
import { useCurrency, СИМВОЛЫ, ГЛАВНЫЕ } from "@/components/currency-provider";
import { useT } from "@/components/lang-provider";

export function CurrencyConverter() {
  const { rates, loading, updated } = useCurrency();
  const { t, lang } = useT();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("UZS");

  // Список валют: сперва частые у гостей, затем все прочие по алфавиту —
  // «все валюты» значит все, что отдаёт служба курсов.
  const валюты = useMemo(() => {
    const коды = Object.keys(rates);
    if (!коды.length) return ГЛАВНЫЕ;
    const прочие = коды.filter((к) => !ГЛАВНЫЕ.includes(к)).sort();
    return [...ГЛАВНЫЕ.filter((к) => коды.includes(к)), ...прочие];
  }, [rates]);

  // Курс любой пары через доллар: rates[к] — сколько валюты за $1.
  const есть = rates[from] && rates[to];
  const результат = есть
    ? (parseFloat(amount || "0") * rates[to]) / rates[from]
    : null;

  const выбор = (значение: string, менять: (v: string) => void) => (
    <select
      value={значение}
      onChange={(e) => менять(e.target.value)}
      className="rounded-xl border bg-transparent px-2 py-2.5 text-sm font-bold outline-none"
      style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
    >
      {валюты.map((к) => (
        <option key={к} value={к}>
          {СИМВОЛЫ[к] ? `${к} ${СИМВОЛЫ[к]}` : к}
        </option>
      ))}
    </select>
  );

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="mb-3 text-sm font-bold" style={{ color: TEXT }}>
        💱 {t("cur_title")}
      </p>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            {t("cur_amount")}
          </p>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            className="w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none"
            style={{ borderColor: BORDER, color: TEXT, background: CREAM }}
          />
        </div>
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            {t("cur_from")}
          </p>
          {выбор(from, setFrom)}
        </div>
        <button
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label="↔"
          className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{ borderColor: BORDER, color: GREEN }}
        >
          ⇄
        </button>
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            {t("cur_to")}
          </p>
          {выбор(to, setTo)}
        </div>
      </div>

      <div className="rounded-xl p-3 text-center" style={{ background: "#EDF7F2" }}>
        {результат !== null ? (
          <p className="text-lg font-bold" style={{ color: GREEN, fontFamily: "'Fraunces',serif" }}>
            {результат.toLocaleString(lang, { maximumFractionDigits: 2 })} {СИМВОЛЫ[to] ?? to}
          </p>
        ) : (
          <p className="text-xs" style={{ color: MUTED }}>
            {loading ? t("common_loading") : t("cur_unavailable")}
          </p>
        )}
      </div>

      {updated && результат !== null && (
        <p className="mt-2 text-center text-[10px]" style={{ color: MUTED }}>
          {t("cur_updated")}: {updated.toLocaleDateString(lang)}
        </p>
      )}
    </div>
  );
}

// ── Practical Info Screen ──────────────────────────────────────────────────────

export function PracticalScreen({ onBack }:{ onBack:()=>void }) {
  const { t, трК } = useT();
  const SECTIONS = [
    { title:"Валюта и деньги", tk:"pr_money" as const,  icon:"💱",color:"#C17B2F",items:["Курс смотрите в конвертере выше — он живой","Обменивайте в банках или обменниках","Карты принимают в крупных отелях","Наличные нужны для рынков и кафе"] },
    { title:"Транспорт", tk:"pr_transport" as const,        icon:"🚌",color:GREEN,        items:["Яндекс.Такси — самый удобный","Афросиаб: Ташкент–Самарканд 2 ч $12","Самарканд–Бухара 1.5 ч $9","Метро есть только в Ташкенте","Аренда авто от $30/день"] },
    { title:"Климат", tk:"pr_climate" as const,           icon:"🌡️",color:"#E74C3C",items:["Апрель–июнь: +20–28°C — идеально","Сентябрь–октябрь: +22–30°C","Июль–август: +35–42°C — зной","Берите головной убор и крем"] },
    { title:"Связь и интернет", tk:"pr_internet" as const, icon:"📱",color:"#8E44AD",items:["Ucell и Beeline — лучшее покрытие","SIM-карта: ~$5, нужен паспорт","Безлимитный интернет от $3/мес","Wi-Fi бесплатно в отелях"] },
    { title:"Этикет и культура", tk:"pr_etiquette" as const,icon:"🕌",color:"#1B9E8A",items:["В мечетях — скромная одежда","Снимайте обувь перед входом","Спрашивайте перед фото людей","Левая рука считается нечистой","Чаевые 5–10% — не обязательны"] },
    { title:"Здоровье", tk:"pr_health" as const,         icon:"🏥",color:"#E74C3C",items:["Пейте бутилированную воду","Скорая: 103, Полиция: 102","Туристический инфолайн: 1322","Страховка для путешественников"] },
    { title:"Кухня", tk:"pr_cuisine" as const,            icon:"🍽️",color:"#C1603A",items:["Плов — главное блюдо, до полудня","Самса, лагман, шашлык, нон","Базары: Чорсу (Ташкент), Сиаб (Самарканд)","Вегетарианцам: мастава, дамлама"] },
    { title:"Розетки", tk:"pr_sockets" as const,          icon:"⚡",color:MUTED,    items:["Тип C и F, 220В, 50Гц","Адаптер нужен гостям из США/UK","Качество электричества стабильное"] },
  ];
  const [open, setOpen] = useState<number|null>(0);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="bg-white px-4 pt-14 pb-4 border-b" style={{borderColor:BORDER}}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:CREAM}}><svg width="16" height="16" fill="none" stroke={TEXT} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
          <div><p className="text-xs font-medium" style={{color:GREEN,letterSpacing:"0.1em"}}>{t("pr_kicker")}</p><h1 className="text-xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{t("pr_title")}</h1></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-2.5">
        <CurrencyConverter/>
        {SECTIONS.map((s,i)=>(
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{borderColor:BORDER}}>
            <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center gap-3 p-4 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:s.color+"15"}}>{s.icon}</div>
              <div className="flex-1"><p className="font-bold text-sm" style={{color:TEXT}}>{t(s.tk)}</p></div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" className="flex-shrink-0" style={{transform:open===i?"rotate(90deg)":"none",transition:"transform 0.2s"}}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            {open===i&&<div className="px-4 pb-4 border-t" style={{borderColor:BORDER}}><ul className="space-y-2 mt-3">{s.items.map((item,j)=><li key={j} className="flex items-start gap-2.5"><div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{background:s.color}}/><p className="text-xs leading-relaxed" style={{color:MUTED}}>{трК(item)}</p></li>)}</ul></div>}
          </div>
        ))}
        <div className="pb-4"/>
      </div>
    </div>
  );
}

// ── Animated Uzbek Background ─────────────────────────────────────────────────

export default PracticalScreen;
