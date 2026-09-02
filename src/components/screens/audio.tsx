"use client";

import { useState } from "react";
import type { Place } from "@/lib/types";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { LANGS, PRACTICAL } from "@/data/content";
import { useAppContent } from "@/components/content-provider";
import { AdBanner, OfflinePacks } from "@/components/widgets";


export function AudioScreen({ onPlay, isPremium }:{ onPlay:(p:Place)=>void; isPremium:boolean }) {
  const { PLACES } = useAppContent();
  const [lang, setLang] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [playing, setPlaying] = useState<number|null>(null);
  const NEARBY=[{name:"Площадь Регистан",dist:"0.3 км",dur:"8:42",img:"https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=200&h=150&fit=crop"},{name:"Мечеть Биби-Ханым",dist:"0.8 км",dur:"6:15",img:"https://images.unsplash.com/photo-1728029062560-4b0e2b958885?w=200&h=150&fit=crop"},{name:"Базар Сиаб",dist:"1.1 км",dur:"4:30",img:"https://images.unsplash.com/photo-1728281711729-a3b3424e6c1e?w=200&h=150&fit=crop"},{name:"Обс. Улугбека",dist:"2.2 км",dur:"5:10",img:"https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=200&h=150&fit=crop"}];
  return (
    <div className="flex flex-col h-full" style={{background:CREAM}}>
      <div className="px-4 pt-14 pb-4 bg-white border-b" style={{borderColor:BORDER}}>
        <p className="text-xs font-medium mb-0.5" style={{color:GREEN,letterSpacing:"0.1em"}}>АУДИОГИД</p>
        <h1 className="text-xl font-bold mb-3" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>Слушай истории</h1>
        <p className="text-xs mb-2" style={{color:MUTED}}>Язык аудиогида</p>
        <div className="flex gap-2 overflow-x-auto hide-scroll">
          {LANGS.map((l,i)=><button key={i} onClick={()=>setLang(i)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold" style={lang===i?{background:GREEN,color:WHITE}:{background:CREAM,color:MUTED}}>{l}</button>)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-4">
        <AdBanner isPremium={isPremium}/>
        <button onClick={()=>setScanning(!scanning)} className="w-full rounded-2xl overflow-hidden" style={{border:scanning?`2px solid ${GREEN}`:`2px solid ${BORDER}`,background:WHITE}}>
          <div className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative flex-shrink-0" style={{background:GREEN+"12",border:`2px solid ${GREEN}`}}>
              <div className="grid grid-cols-3 gap-0.5">{[1,1,0,1,0,1,0,1,1].map((v,i)=><div key={i} className="w-3 h-3 rounded-sm" style={{background:v?GREEN:"transparent"}}/>)}</div>
              {scanning&&<><div className="absolute inset-0 rounded-xl animate-pulse" style={{background:GREEN+"30"}}/><div className="absolute left-0 right-0 h-0.5" style={{background:GOLD,top:"50%",boxShadow:`0 0 6px ${GOLD}`}}/></>}
            </div>
            <div className="text-left"><p className="font-bold text-sm" style={{color:TEXT}}>{scanning?"🟢 Сканер активен":"Сканировать QR-код"}</p><p className="text-xs mt-0.5" style={{color:MUTED}}>{scanning?"Наведите камеру на QR у памятника":"У любого памятника или экспоната"}</p></div>
          </div>
        </button>
        <div>
          <div className="flex items-center gap-2 mb-2.5"><div className="w-2 h-2 rounded-full bg-green-500"/><p className="font-bold text-sm" style={{color:TEXT}}>Рядом с вами — GPS</p></div>
          <div className="space-y-2.5">
            {NEARBY.map((a,i)=>(
              <div key={i} className="bg-white rounded-2xl flex items-center gap-3 p-3 shadow-sm border" style={{borderColor:BORDER}}>
                <div className="w-16 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"><img src={a.img} alt={a.name} className="w-full h-full object-cover"/></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate" style={{color:TEXT}}>{a.name}</p><p className="text-xs mt-0.5" style={{color:MUTED}}>{a.dist} · 🎵 {a.dur}</p>{playing===i&&<div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{background:BORDER}}><div className="h-full rounded-full animate-pulse" style={{background:GREEN,width:"42%"}}/></div>}</div>
                <button onClick={()=>{setPlaying(playing===i?null:i);if(playing!==i)onPlay(PLACES[0]);}} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:playing===i?GREEN:CREAM}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={playing===i?WHITE:GREEN}>{playing===i?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<polygon points="5 3 19 12 5 21 5 3"/>}</svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div><p className="font-bold text-sm mb-2.5" style={{color:TEXT}}>💡 Практические советы</p><div className="grid grid-cols-2 gap-2.5">{PRACTICAL.map((p,i)=><div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm border" style={{borderColor:BORDER}}><p className="text-xl mb-1">{p.icon}</p><p className="font-bold text-xs" style={{color:TEXT}}>{p.title}</p><p className="text-[10px] mt-1 leading-relaxed" style={{color:MUTED}}>{p.body}</p></div>)}</div></div>
        <OfflinePacks/>
      </div>
    </div>
  );
}

// ── Profile Screen ─────────────────────────────────────────────────────────────
// ── Ad Banner (native, subtle) ─────────────────────────────────────────────────

export default AudioScreen;
