"use client";

import { useState } from "react";
import { BORDER, CREAM, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { FLIGHTS, INTERCITY, TRAINS, UZ_CITIES } from "@/data/content";
import { EmptyRoute } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import { AdBanner } from "@/components/widgets";


export function CityPicker({ value, onChange, label, icon }:{ value:string; onChange:(c:string)=>void; label:string; icon:string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="flex-1 flex flex-col gap-0.5 px-3 py-2.5 rounded-2xl text-left" style={{background:"rgba(255,255,255,0.18)"}}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{color:"rgba(255,255,255,0.55)"}}>{label}</span>
        <span className="font-bold text-sm text-white truncate">{icon} {value||"Выбрать"}</span>
      </button>
      {open&&(
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}>
          <div className="rounded-t-3xl overflow-hidden animate-slide-up" style={{background:WHITE,maxHeight:"65%"}}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{borderColor:BORDER}}>
              <p className="font-bold text-base" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{label}</p>
              <button onClick={()=>setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:CREAM}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto" style={{maxHeight:"calc(65vh - 60px)"}}>
              {UZ_CITIES.map(city=>(
                <button key={city} onClick={()=>{onChange(city);setOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3.5 border-b text-left active:opacity-60" style={{borderColor:BORDER,background:value===city?GREEN+"08":WHITE}}>
                  <span className="text-lg">📍</span>
                  <span className="flex-1 font-semibold text-sm" style={{color:value===city?GREEN:TEXT}}>{city}</span>
                  {value===city&&<span style={{color:GREEN}}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TaxiWidget() {
  const [from, setFrom] = useState("Регистан");
  const [to, setTo]   = useState("");
  const [booked, setBooked] = useState(false);
  const QUICK = ["Аэропорт","Ж/Д вокзал","Отель","Базар Сиаб","Шахи-Зинда"];
  return (
    <div className="px-4 pt-5">
      <p className="font-bold text-base mb-3" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>🚖 Такси по городу</p>
      {!booked?(
        <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}>
          <div className="space-y-2.5 mb-3">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{background:"#F0F8F4"}}><div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:GREEN}}/><input value={from} onChange={e=>setFrom(e.target.value)} placeholder="Откуда" className="flex-1 text-sm bg-transparent outline-none font-medium" style={{color:TEXT}}/></div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border" style={{background:WHITE,borderColor:BORDER}}><div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-400"/><input value={to} onChange={e=>setTo(e.target.value)} placeholder="Куда едем?" className="flex-1 text-sm bg-transparent outline-none" style={{color:TEXT}}/></div>
          </div>
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scroll">
            {QUICK.map(d=><button key={d} onClick={()=>setTo(d)} className="flex-shrink-0 px-2.5 py-1.5 rounded-full border text-[10px] font-medium" style={to===d?{background:GREEN,color:WHITE,borderColor:GREEN}:{background:CREAM,color:TEXT,borderColor:BORDER}}>{d}</button>)}
          </div>
          <button onClick={()=>to&&setBooked(true)} className="w-full py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40" style={{background:GREEN}} disabled={!to}>
            Яндекс.Такси — ~$2
          </button>
        </div>
      ):(
        <div className="bg-white rounded-2xl p-4 shadow-sm border animate-slide-up" style={{borderColor:GREEN}}>
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:GREEN+"15"}}>🚖</div><div className="flex-1"><p className="font-bold text-sm" style={{color:TEXT}}>Такси найдено!</p><p className="text-xs" style={{color:MUTED}}>{from} → {to} · 3 мин · $2.40</p></div><button onClick={()=>{setBooked(false);setTo("");}} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{background:CREAM,color:MUTED}}>Отмена</button></div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{background:BORDER}}><div className="h-full rounded-full animate-pulse" style={{background:GREEN,width:"65%"}}/></div>
          <p className="text-[10px] mt-1.5 text-center" style={{color:GREEN}}>Водитель Бахтиёр · Nexia 3 · К622АА · ⭐ 4.9</p>
        </div>
      )}
    </div>
  );
}

// ── Transport Screen ───────────────────────────────────────────────────────────

export function TransportScreen({ onBack, isPremium }:{ onBack:()=>void; isPremium:boolean }) {
  const [mode, setMode] = useState<"trains"|"flights"|"taxi">("trains");
  const [booked, setBooked] = useState<string|null>(null);
  const [fromCity, setFromCity] = useState("");
  const [toCity,   setToCity]   = useState("");
  const TABS:[typeof mode,string,string][] = [["trains","🚄","Поезда"],["flights","✈️","Рейсы"],["taxi","🚌","Такси"]];

  const TicketCard = ({ children, id, price, onBook }:{ children:React.ReactNode; id:string; price:string; onBook:()=>void }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{borderColor:BORDER}}>
      {children}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div><p className="text-[9px] uppercase font-bold tracking-widest" style={{color:MUTED}}>Цена / чел.</p><p className="font-bold text-lg" style={{color:GREEN,fontFamily:"'Fraunces',serif"}}>{price}</p></div>
        {booked===id
          ? <div className="px-4 py-2.5 rounded-xl text-xs font-bold" style={{background:"#EDF7F2",color:GREEN}}>✓ Забронировано</div>
          : <button onClick={onBook} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white" style={{background:GREEN}}>Купить</button>
        }
      </div>
    </div>
  );

  const modeIcon = mode==="trains"?"🚄":mode==="flights"?"✈️":"🚌";
  const trains  = TRAINS.filter(t=>(!fromCity||t.from===fromCity)&&(!toCity||t.to===toCity));
  const flights = FLIGHTS.filter(f=>(!fromCity||f.from===fromCity)&&(!toCity||f.to===toCity));
  const taxis   = INTERCITY.filter(i=>(!fromCity||i.from===fromCity)&&(!toCity||i.to===toCity));

  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative overflow-hidden px-4 pt-14 pb-4" style={{background:GREEN}}>
        <div className="absolute inset-0 opacity-20 pointer-events-none"><AnimatedBg/></div>
        <div className="relative z-10">
          <button onClick={onBack} className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.2)"}}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">ТРАНСПОРТ</p>
          <h1 className="text-white text-xl font-bold mb-3" style={{fontFamily:"'Fraunces',serif"}}>Перевозки по Узбекистану</h1>
          {/* City pickers */}
          <div className="relative flex items-center gap-2 mb-3">
            <CityPicker value={fromCity} onChange={setFromCity} label="Откуда" icon="🛫"/>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.2)"}}>
              <button onClick={()=>{const t=fromCity;setFromCity(toCity);setToCity(t);}} title="Поменять местами">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
              </button>
            </div>
            <CityPicker value={toCity}   onChange={setToCity}   label="Куда"   icon="🛬"/>
          </div>
          <div className="flex gap-2">
            {TABS.map(([v,e,l])=>(
              <button key={v} onClick={()=>setMode(v)} className="flex-1 py-2.5 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-0.5"
                style={mode===v?{background:WHITE,color:GREEN}:{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.85)"}}>
                <span className="text-base">{e}</span><span>{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-3">
        <AdBanner isPremium={isPremium}/>

        {mode==="trains"&&trains.length===0&&<EmptyRoute icon="🚄"/>}
        {mode==="trains"&&trains.map(t=>(
          <TicketCard key={t.id} id={t.id} price={t.price} onBook={()=>setBooked(t.id)}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:t.type==="Скоростной"?GREEN+"18":CREAM,color:t.type==="Скоростной"?GREEN:MUTED}}>{t.type}</span>
                <span className="text-[9px] font-semibold" style={{color:MUTED}}>{t.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{t.dep}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{t.from}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <p className="text-[9px]" style={{color:MUTED}}>{t.dur}</p>
                  <div className="flex items-center gap-1"><div className="w-10 h-px" style={{background:BORDER}}/><span className="text-base">🚄</span><div className="w-10 h-px" style={{background:BORDER}}/></div>
                  <p className="text-[9px]" style={{color:GREEN}}>{t.seats} мест</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{t.arr}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{t.to}</p>
                </div>
              </div>
            </div>
          </TicketCard>
        ))}

        {mode==="flights"&&flights.length===0&&<EmptyRoute icon="✈️"/>}
        {mode==="flights"&&flights.map(f=>(
          <TicketCard key={f.id} id={f.id} price={f.price} onBook={()=>setBooked(f.id)}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:"#1B9E8A18",color:"#1B9E8A"}}>{f.airline}</span>
                <span className="font-mono text-[9px] font-bold" style={{color:MUTED}}>{f.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{f.dep}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{f.from}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1"><div className="w-8 h-px" style={{background:BORDER}}/><span className="text-lg">✈️</span><div className="w-8 h-px" style={{background:BORDER}}/></div>
                  <p className="text-[9px]" style={{color:GREEN}}>{f.seats} мест</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{f.arr}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{f.to}</p>
                </div>
              </div>
            </div>
          </TicketCard>
        ))}

        {mode==="taxi"&&taxis.length===0&&<EmptyRoute icon="🚌"/>}
        {mode==="taxi"&&taxis.map(ic=>(
          <div key={ic.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{borderColor:BORDER}}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-base" style={{color:TEXT}}>{ic.from}</p>
                  <p className="text-[9px] mt-0.5" style={{color:MUTED}}>Отправление</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <p className="text-[9px]" style={{color:MUTED}}>{ic.dur}</p>
                  <div className="flex items-center gap-1"><div className="w-8 h-px" style={{background:BORDER}}/><span className="text-lg">🚌</span><div className="w-8 h-px" style={{background:BORDER}}/></div>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-base" style={{color:TEXT}}>{ic.to}</p>
                  <p className="text-[9px] mt-0.5" style={{color:MUTED}}>Прибытие</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{borderColor:BORDER}}>
                <div><p className="text-[9px]" style={{color:MUTED}}>{ic.departs}</p><p className="text-xs font-medium mt-0.5" style={{color:TEXT}}>{ic.note}</p></div>
                <div className="text-right"><p className="font-bold text-base" style={{color:GREEN,fontFamily:"'Fraunces',serif"}}>{ic.price}</p><button className="mt-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{background:GREEN}}>Заказать</button></div>
              </div>
            </div>
          </div>
        ))}

        <div className="pb-4"/>
      </div>
    </div>
  );
}

// ── Login Modal ────────────────────────────────────────────────────────────────

export default TransportScreen;
