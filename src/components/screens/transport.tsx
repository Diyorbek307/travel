"use client";

import { useState } from "react";
import { ГОРОДА } from "@/data/geo";
import { useДеньги } from "@/lib/money";
import { ссылкаНаЗаказ } from "@/lib/taxi";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import TaxiOrder from "@/components/taxi-order";
import { ACCENT_FILL, BORDER, CREAM, GREEN, MUTED, TEXT, WHITE, SURFACE, ACCENT_SOFT } from "@/lib/theme";
import { FLIGHTS, INTERCITY, TRAINS, UZ_CITIES } from "@/data/content";
import { EmptyRoute } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import { AdInline } from "@/components/ads";
import { ВИДЕО, ФОН_ВИДЕО } from "@/data/city-reels";


export function CityPicker({ value, onChange, label, icon }:{ value:string; onChange:(c:string)=>void; label:string; icon:string }) {
  const { t, трК } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="flex-1 flex flex-col gap-0.5 px-3 py-2.5 rounded-2xl text-left" style={{background:"rgba(255,255,255,0.18)"}}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{color:"rgba(255,255,255,0.55)"}}>{label}</span>
        <span className="font-bold text-sm text-white truncate">{icon} {value?трК(value):t("tr_choose")}</span>
      </button>
      {open&&(
        // fixed, а не absolute: пикер лежит внутри двух relative-контейнеров
        // (зелёная шапка + строка полей), и absolute сжимал лист в шапку.
        // fixed раскрывает его на весь экран.
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}>
          <div className="rounded-t-3xl overflow-hidden animate-slide-up" style={{background:SURFACE,maxHeight:"65%"}}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{borderColor:BORDER}}>
              <p className="font-bold text-base" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{label}</p>
              <button onClick={()=>setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:CREAM}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto" style={{maxHeight:"calc(65vh - 60px)"}}>
              {UZ_CITIES.map(city=>(
                <button key={city} onClick={()=>{onChange(city);setOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3.5 border-b text-left active:opacity-60" style={{borderColor:BORDER,background:value===city?ACCENT_SOFT:WHITE}}>
                  <span className="text-lg">📍</span>
                  <span className="flex-1 font-semibold text-sm" style={{color:value===city?GREEN:TEXT}}>{трК(city)}</span>
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


// ── Transport Screen ───────────────────────────────────────────────────────────

export function TransportScreen({ onBack, isPremium }:{ onBack:()=>void; isPremium:boolean }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const [mode, setMode] = useState<"trains"|"flights"|"taxi">("trains");
  /*
   * Билеты продаёт перевозчик. Раньше «Купить» просто переключало
   * надпись на «✓ Забронировано» — человек уходил уверенный, что место
   * за ним, хотя не происходило ничего. Теперь кнопка честно уводит на
   * сайт продавца.
   */
  const САЙТЫ = { trains: "https://eticket.railway.uz/", flights: "https://www.uzairways.com/" } as const;
  /*
   * Межгород на такси: кнопка «Заказать» раньше не делала ничего —
   * обработчика у неё не было вовсе. Ведём в Яндекс Go с уже
   * подставленными точками; оформляет поездку он, не мы.
   */
  function заказатьТакси(откуда: string, куда: string) {
    const a = ГОРОДА[откуда];
    const b = ГОРОДА[куда];
    if (!b) return;
    window.open(ссылкаНаЗаказ(a ?? null, b, куда), "_blank", "noopener,noreferrer");
  }
  const купить = (куда: keyof typeof САЙТЫ) => window.open(САЙТЫ[куда], "_blank", "noopener,noreferrer");
  const [fromCity, setFromCity] = useState("");
  const [toCity,   setToCity]   = useState("");
  // Ролик города для шапки: свой у города «откуда», иначе общий об
  // Узбекистане. Пока не заиграл (или автозапуск закрыт) — держим чистый
  // бирюзовый фон, без чужой кнопки «play».
  const видеоШапки = ВИДЕО[fromCity] ?? ФОН_ВИДЕО;
  const [видеоOk, setВидеоOk] = useState(false);
  const TABS:[typeof mode,string,TKey][] = [["trains","🚄","tr_trains"],["flights","✈️","tr_flights"],["taxi","🚌","tr_taxi"]];

  const TicketCard = ({ children, price, onBook }:{ children:React.ReactNode; price:string; onBook:()=>void }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{borderColor:BORDER}}>
      {children}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div><p className="text-[9px] uppercase font-bold tracking-widest" style={{color:MUTED}}>{t("tr_price_pp")}</p><p className="font-bold text-lg" style={{color:GREEN,fontFamily:"var(--font-heading)"}}>{дг.цена(price)}</p></div>
        <button onClick={onBook} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95" style={{background:ACCENT_FILL}}>{t("tr_buy_ext")} <span className="rtl-flip inline-block">↗</span></button>
      </div>
    </div>
  );

  const modeIcon = mode==="trains"?"🚄":mode==="flights"?"✈️":"🚌";
  const trains  = TRAINS.filter(п=>(!fromCity||п.from===fromCity)&&(!toCity||п.to===toCity));
  const flights = FLIGHTS.filter(f=>(!fromCity||f.from===fromCity)&&(!toCity||f.to===toCity));
  const taxis   = INTERCITY.filter(i=>(!fromCity||i.from===fromCity)&&(!toCity||i.to===toCity));

  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative overflow-hidden px-4 pt-14 pb-4" style={{background:ACCENT_FILL}}>
        {/* Живой фон города. Зелёная плёнка поверх держит фирменный цвет и
            читаемость белого текста в любой теме. */}
        <video
          key={видеоШапки}
          src={видеоШапки}
          autoPlay muted loop playsInline preload="auto"
          controls={false}
          disablePictureInPicture
          onLoadStart={()=>setВидеоOk(false)}
          onPlaying={()=>setВидеоOk(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{opacity: видеоOk?0.9:0, transition:"opacity 1s ease"}}
        />
        <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.5) 100%)"}}/>
        <div className="absolute inset-0 opacity-20 pointer-events-none"><AnimatedBg/></div>
        <div className="relative z-10">
          <button onClick={onBack} className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.2)"}}>
            <svg className="rtl-flip" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t("tr_kicker")}</p>
          <h1 className="text-white text-xl font-bold mb-3" style={{fontFamily:"var(--font-heading)"}}>{t("tr_subtitle")}</h1>
          {/* City pickers */}
          <div className="relative flex items-center gap-2 mb-3">
            <CityPicker value={fromCity} onChange={setFromCity} label={t("tr_from")} icon="🛫"/>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.2)"}}>
              <button onClick={()=>{const t=fromCity;setFromCity(toCity);setToCity(t);}} title={t("tr_swap")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
              </button>
            </div>
            <CityPicker value={toCity}   onChange={setToCity}   label={t("tr_to")}   icon="🛬"/>
          </div>
          <div className="flex gap-2">
            {TABS.map(([v,e,l])=>(
              <button key={v} onClick={()=>setMode(v)} className="flex-1 py-2.5 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-0.5"
                style={mode===v?{background:SURFACE,color:GREEN}:{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.85)"}}>
                <span className="text-base">{e}</span><span>{t(l)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-3">
        {/* Реклама городов маршрута: куда турист едет — того города и реклама. */}
        <AdInline isPremium={isPremium} cities={[fromCity,toCity].filter(Boolean)}/>

        {/* Кто на самом деле продаёт билет — сказано сразу, а не после нажатия. */}
        {mode!=="taxi"&&<p className="px-1 text-[10px] leading-relaxed" style={{color:MUTED}}>{t("tr_seller_note")}</p>}

        {mode==="trains"&&trains.length===0&&<EmptyRoute icon="🚄"/>}
        {mode==="trains"&&trains.map(п=>(
          <TicketCard key={п.id} price={п.price} onBook={()=>купить("trains")}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:п.type==="Скоростной"?ACCENT_SOFT:CREAM,color:п.type==="Скоростной"?GREEN:MUTED}}>{трК(п.type)}</span>
                <span className="text-[9px] font-semibold" style={{color:MUTED}}>{трК(п.name)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{п.dep}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{трК(п.from)}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <p className="text-[9px]" style={{color:MUTED}}>{трК(п.dur)}</p>
                  <div className="flex items-center gap-1"><div className="w-10 h-px" style={{background:BORDER}}/><span className="text-base">🚄</span><div className="w-10 h-px" style={{background:BORDER}}/></div>
                  <p className="text-[9px]" style={{color:GREEN}}>{п.seats} {t("tr_seats")}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{п.arr}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{трК(п.to)}</p>
                </div>
              </div>
            </div>
          </TicketCard>
        ))}

        {mode==="flights"&&flights.length===0&&<EmptyRoute icon="✈️"/>}
        {mode==="flights"&&flights.map(f=>(
          <TicketCard key={f.id} price={f.price} onBook={()=>купить("flights")}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:"#1B9E8A18",color:"#1B9E8A"}}>{f.airline}</span>
                <span className="font-mono text-[9px] font-bold" style={{color:MUTED}}>{f.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{f.dep}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{трК(f.from)}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1"><div className="w-8 h-px" style={{background:BORDER}}/><span className="text-lg">✈️</span><div className="w-8 h-px" style={{background:BORDER}}/></div>
                  <p className="text-[9px]" style={{color:GREEN}}>{f.seats} мест</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-2xl font-bold" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{f.arr}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:MUTED}}>{трК(f.to)}</p>
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
                  <p className="font-bold text-base" style={{color:TEXT}}>{трК(ic.from)}</p>
                  <p className="text-[9px] mt-0.5" style={{color:MUTED}}>{t("tr_departure")}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <p className="text-[9px]" style={{color:MUTED}}>{трК(ic.dur)}</p>
                  <div className="flex items-center gap-1"><div className="w-8 h-px" style={{background:BORDER}}/><span className="text-lg">🚌</span><div className="w-8 h-px" style={{background:BORDER}}/></div>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-base" style={{color:TEXT}}>{трК(ic.to)}</p>
                  <p className="text-[9px] mt-0.5" style={{color:MUTED}}>{t("tr_arrival")}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{borderColor:BORDER}}>
                <div><p className="text-[9px]" style={{color:MUTED}}>{трК(ic.departs)}</p><p className="text-xs font-medium mt-0.5" style={{color:TEXT}}>{трК(ic.note)}</p></div>
                <div className="text-right"><p className="font-bold text-base" style={{color:GREEN,fontFamily:"var(--font-heading)"}}>{дг.цена(ic.price)}</p><button onClick={()=>заказатьТакси(ic.from, ic.to)} className="mt-1 transition-all active:scale-95 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{background:ACCENT_FILL}}>{t("tr_book")}</button></div>
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
