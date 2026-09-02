"use client";

import { useState } from "react";
import { BORDER, CREAM, GREEN, MUTED, TEXT } from "@/lib/theme";

export function CurrencyConverter() {
  const RATES: Record<string,number> = { USD:1, EUR:1.09, RUB:0.0108, GBP:1.27, KRW:0.00073, CNY:0.138, JPY:0.0065 };
  const SYMBOLS: Record<string,string> = { USD:"$", EUR:"€", RUB:"₽", GBP:"£", KRW:"₩", CNY:"¥", JPY:"¥" };
  const UZS = 12740;
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const uzs = Math.round(parseFloat(amount||"0") * (RATES[from]||1) * UZS).toLocaleString();
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}>
      <p className="font-bold text-sm mb-3" style={{color:TEXT}}>💱 Конвертер валют</p>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-xl px-3 py-2.5 border" style={{background:CREAM,borderColor:BORDER}}><p className="text-[9px] font-bold mb-0.5 uppercase tracking-wide" style={{color:MUTED}}>Сумма</p><input value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,""))} className="w-full text-base font-bold bg-transparent outline-none" style={{color:TEXT}}/></div>
        <div className="rounded-xl border overflow-hidden" style={{background:CREAM,borderColor:BORDER}}><p className="text-[9px] font-bold px-3 pt-2 uppercase tracking-wide" style={{color:MUTED}}>Валюта</p><select value={from} onChange={e=>setFrom(e.target.value)} className="bg-transparent text-sm font-bold px-3 pb-2 outline-none" style={{color:TEXT}}>{Object.keys(RATES).map(c=><option key={c} value={c}>{SYMBOLS[c]} {c}</option>)}</select></div>
      </div>
      <div className="rounded-xl p-3 text-center" style={{background:"#EDF7F2"}}><p className="text-[10px] uppercase font-bold tracking-wide mb-0.5" style={{color:GREEN}}>= узбекских сумов</p><p className="text-2xl font-bold" style={{color:GREEN,fontFamily:"'Fraunces',serif"}}>{uzs} UZS</p><p className="text-[10px] mt-1" style={{color:MUTED}}>Курс: 1 USD = {UZS.toLocaleString()} UZS</p></div>
    </div>
  );
}

// ── Practical Info Screen ──────────────────────────────────────────────────────

export function PracticalScreen({ onBack }:{ onBack:()=>void }) {
  const SECTIONS = [
    { title:"Валюта и деньги",  icon:"💱",color:"#C17B2F",items:["$1 = 12 740 UZS (август 2026)","€1 = 13 980 UZS · ₽1 = 138 UZS","Обменивайте в банках или обменниках","Карты принимают в крупных отелях","Наличные нужны для рынков и кафе"] },
    { title:"Транспорт",        icon:"🚌",color:GREEN,        items:["Яндекс.Такси — самый удобный","Афросиаб: Ташкент–Самарканд 2 ч $12","Самарканд–Бухара 1.5 ч $9","Метро есть только в Ташкенте","Аренда авто от $30/день"] },
    { title:"Климат",           icon:"🌡️",color:"#E74C3C",items:["Апрель–июнь: +20–28°C — идеально","Сентябрь–октябрь: +22–30°C","Июль–август: +35–42°C — зной","Берите головной убор и крем"] },
    { title:"Связь и интернет", icon:"📱",color:"#8E44AD",items:["Ucell и Beeline — лучшее покрытие","SIM-карта: ~$5, нужен паспорт","Безлимитный интернет от $3/мес","Wi-Fi бесплатно в отелях"] },
    { title:"Этикет и культура",icon:"🕌",color:"#1B9E8A",items:["В мечетях — скромная одежда","Снимайте обувь перед входом","Спрашивайте перед фото людей","Левая рука считается нечистой","Чаевые 5–10% — не обязательны"] },
    { title:"Здоровье",         icon:"🏥",color:"#E74C3C",items:["Пейте бутилированную воду","Скорая: 103, Полиция: 102","Туристический инфолайн: 1322","Страховка для путешественников"] },
    { title:"Кухня",            icon:"🍽️",color:"#C1603A",items:["Плов — главное блюдо, до полудня","Самса, лагман, шашлык, нон","Базары: Чорсу (Ташкент), Сиаб (Самарканд)","Вегетарианцам: мастава, дамлама"] },
    { title:"Розетки",          icon:"⚡",color:MUTED,    items:["Тип C и F, 220В, 50Гц","Адаптер нужен гостям из США/UK","Качество электричества стабильное"] },
  ];
  const [open, setOpen] = useState<number|null>(0);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="bg-white px-4 pt-14 pb-4 border-b" style={{borderColor:BORDER}}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:CREAM}}><svg width="16" height="16" fill="none" stroke={TEXT} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
          <div><p className="text-xs font-medium" style={{color:GREEN,letterSpacing:"0.1em"}}>ДЛЯ ТУРИСТА</p><h1 className="text-xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>Практическая информация</h1></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-2.5">
        <CurrencyConverter/>
        {SECTIONS.map((s,i)=>(
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{borderColor:BORDER}}>
            <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center gap-3 p-4 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:s.color+"15"}}>{s.icon}</div>
              <div className="flex-1"><p className="font-bold text-sm" style={{color:TEXT}}>{s.title}</p></div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" className="flex-shrink-0" style={{transform:open===i?"rotate(90deg)":"none",transition:"transform 0.2s"}}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            {open===i&&<div className="px-4 pb-4 border-t" style={{borderColor:BORDER}}><ul className="space-y-2 mt-3">{s.items.map((item,j)=><li key={j} className="flex items-start gap-2.5"><div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{background:s.color}}/><p className="text-xs leading-relaxed" style={{color:MUTED}}>{item}</p></li>)}</ul></div>}
          </div>
        ))}
        <div className="pb-4"/>
      </div>
    </div>
  );
}

// ── Animated Uzbek Background ─────────────────────────────────────────────────

export default PracticalScreen;
