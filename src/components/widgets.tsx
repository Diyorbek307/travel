"use client";

import { useEffect, useRef, useState } from "react";
import type { Hotel, Place } from "@/lib/types";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";

export function MiniPlayer({ place, onClose }:{ place:Place; onClose:()=>void }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(18);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(playing) timerRef.current = setInterval(()=>setProgress(p=>p>=100?100:p+0.3),200);
    else if(timerRef.current) clearInterval(timerRef.current);
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); };
  },[playing]);
  return (
    <div className="absolute bottom-16 left-0 right-0 z-20 px-3 pb-1">
      <div className="rounded-2xl overflow-hidden shadow-lg border" style={{background:GREEN,borderColor:GREEN+"44"}}>
        <div className="h-0.5 w-full" style={{background:"rgba(255,255,255,0.2)"}}><div className="h-0.5" style={{background:GOLD,width:`${progress}%`,transition:"width 0.2s linear"}}/></div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"><img src={place.img} alt={place.name} className="w-full h-full object-cover"/></div>
          <div className="flex-1 min-w-0"><p className="text-white font-semibold text-xs truncate">{place.name}</p><p className="text-white/60 text-[10px]">Аудиогид · {Math.floor(progress*8.42/100/60)}:{String(Math.floor(progress*8.42/100%60)).padStart(2,"0")} / 8:42</p></div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setPlaying(!playing)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:GOLD}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={TEXT}>{playing?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<polygon points="5 3 19 12 5 21 5 3"/>}</svg>
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.15)"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Place Detail ───────────────────────────────────────────────────────────────

export function OfflinePacks() {
  type Pack = { name:string; count:number; size:string; done:boolean };
  const [packs, setPacks] = useState<Pack[]>([
    { name:"Самарканд", count:127, size:"2.4 ГБ", done:true  },
    { name:"Бухара",    count:98,  size:"1.8 ГБ", done:false },
    { name:"Хива",      count:63,  size:"1.1 ГБ", done:false },
  ]);
  const [progress, setProgress] = useState<Record<string,number>>({});
  const startDownload = (name:string) => {
    if (progress[name] !== undefined) return;
    setProgress(p=>({...p,[name]:0}));
    const iv = setInterval(()=>{
      setProgress(p=>{
        const cur = (p[name]??0)+Math.random()*14+4;
        if (cur>=100) {
          clearInterval(iv);
          setPacks(prev=>prev.map(pk=>pk.name===name?{...pk,done:true}:pk));
          return {...p,[name]:100};
        }
        return {...p,[name]:cur};
      });
    },200);
  };
  return (
    <div>
      <p className="font-bold text-sm mb-2.5" style={{color:TEXT}}>⬇️ Офлайн-пакеты</p>
      <div className="space-y-2.5">
        {packs.map(pack=>{
          const pct = progress[pack.name];
          const downloading = pct !== undefined && !pack.done;
          return (
            <div key={pack.name} className="bg-white rounded-2xl p-3.5 shadow-sm border" style={{borderColor:BORDER}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:pack.done?GREEN+"18":CREAM}}>
                  <span style={{color:pack.done?GREEN:MUTED}}>{pack.done?"✓":"⬇"}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{color:TEXT}}>{pack.name}</p>
                  <p className="text-xs" style={{color:MUTED}}>{pack.count} гидов · {pack.size}</p>
                </div>
                {!pack.done&&!downloading&&<button onClick={()=>startDownload(pack.name)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background:GREEN,color:WHITE}}>Скачать</button>}
                {pack.done&&<span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{background:GREEN+"18",color:GREEN}}>Готово</span>}
              </div>
              {downloading&&(
                <div className="mt-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{color:MUTED}}>Загрузка…</span>
                    <span className="text-xs font-semibold" style={{color:GREEN}}>{Math.round(pct??0)}%</span>
                  </div>
                  <div className="rounded-full h-1.5 overflow-hidden" style={{background:BORDER}}>
                    <div className="h-full rounded-full transition-all duration-200" style={{width:`${pct??0}%`,background:`linear-gradient(90deg,${GREEN},#5BB88A)`}}/>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ADS = [
  { id:"a1", emoji:"🏨", label:"РЕКЛАМА", title:"Registan Plaza Hotel",     sub:"Скидка 20% при бронировании через UzUp",  cta:"Забронировать", color:"#1B6B8A" },
  { id:"a2", emoji:"🍽️", label:"РЕКЛАМА", title:"Плов-центр Ташкента",      sub:"Лучший плов с 1978 года. Откройте для себя!", cta:"Смотреть меню", color:"#C1603A" },
  { id:"a3", emoji:"✈️", label:"РЕКЛАМА", title:"Uzbekistan Airways",        sub:"Прямые рейсы из Самарканда. От $149",         cta:"Купить билет",  color:"#1A5C3A" },
  { id:"a4", emoji:"🛍️", label:"РЕКЛАМА", title:"Silk & Spice Bazaar",       sub:"Аутентичные сувениры прямо от мастеров",      cta:"Перейти",       color:"#7B4F9E" },
  { id:"a5", emoji:"🚌", label:"РЕКЛАМА", title:"Samarkand Tour Transfers",  sub:"Трансфер аэропорт–город от $8",               cta:"Заказать",      color:"#2E7D5A" },
];

export function AdBanner({ isPremium }:{ isPremium:boolean }) {
  const [idx, setIdx] = useState(()=>Math.floor(Math.random()*ADS.length));
  const [dismissed, setDismissed] = useState(false);
  if(isPremium || dismissed) return null;
  const ad = ADS[idx];
  return (
    <div className="mx-4 mb-3">
      <div className="rounded-2xl overflow-hidden border" style={{background:WHITE,borderColor:BORDER}}>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:ad.color+"18"}}>{ad.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded" style={{background:"#F0EBE1",color:MUTED}}>{ad.label}</span>
            </div>
            <p className="font-bold text-xs leading-tight" style={{color:TEXT}}>{ad.title}</p>
            <p className="text-[10px] mt-0.5 truncate" style={{color:MUTED}}>{ad.sub}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <button onClick={()=>setDismissed(true)} className="text-[10px] font-medium px-1" style={{color:MUTED}}>✕</button>
            <button onClick={()=>setIdx(i=>(i+1)%ADS.length)} className="text-[9px] font-bold px-2.5 py-1 rounded-lg text-white" style={{background:ad.color}}>{ad.cta}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Premium Modal ──────────────────────────────────────────────────────────────

export function Toast({ msg, onDone }:{ msg:string; onDone:()=>void }) {
  useEffect(()=>{ const t=setTimeout(onDone,2400); return ()=>clearTimeout(t); },[onDone]);
  return (
    <div className="absolute bottom-20 left-4 right-4 z-50 pointer-events-none" style={{animation:"slide-up 0.3s cubic-bezier(.22,1,.36,1) forwards"}}>
      <div className="rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl" style={{background:"rgba(15,26,20,0.92)",backdropFilter:"blur(12px)"}}>
        <span className="text-lg flex-shrink-0">✅</span>
        <p className="text-white text-sm font-medium">{msg}</p>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
