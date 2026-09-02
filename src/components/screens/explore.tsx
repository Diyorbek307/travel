"use client";

import { useState } from "react";
import type { Hotel, Place, Restaurant } from "@/lib/types";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { FILTER_TABS, HOTELS, PLACES, RESTAURANTS, WEATHER } from "@/data/content";
import { Badge, StarRow } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import { AdBanner } from "@/components/widgets";


export function ExploreScreen({ onPlace, onHotel, onRestaurant, isPremium }:{ onPlace:(p:Place)=>void; onHotel:(h:Hotel)=>void; onRestaurant:(r:Restaurant)=>void; isPremium:boolean }) {
  const [filter, setFilter] = useState("Всё");
  const showHotels = filter==="Отели";
  const showRests  = filter==="Рестораны";
  const filtered = PLACES.filter(p=>{
    if(filter==="Всё") return true;
    if(filter==="Базары") return p.type==="Базары";
    return p.type.toLowerCase().includes(filter.slice(0,4).toLowerCase());
  });
  return (
    <div className="flex flex-col h-full" style={{background:CREAM}}>
      <div className="relative pt-14 pb-3 overflow-hidden border-b" style={{borderColor:BORDER,background:GREEN}}>
        <div className="absolute inset-0 opacity-20"><AnimatedBg/></div>
        <div className="relative z-10 px-4">
        <p className="text-[9px] font-bold mb-0.5 uppercase tracking-widest" style={{color:"rgba(255,255,255,0.6)"}}>ИССЛЕДОВАТЬ</p>
        <h1 className="text-xl font-bold mb-3 text-white" style={{fontFamily:"'Fraunces',serif"}}>Открой Узбекистан</h1>
        <div className="flex gap-2 overflow-x-auto hide-scroll">
          {FILTER_TABS.map(f=><button key={f} onClick={()=>setFilter(f)} className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold" style={filter===f?{background:WHITE,color:GREEN}:{background:"rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.75)"}}>{f}</button>)}
        </div>
      </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-3">
        <AdBanner isPremium={isPremium}/>
        {showHotels&&HOTELS.map(h=>(
          <button key={h.id} onClick={()=>onHotel(h)} className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border text-left active:scale-[0.98] transition-all" style={{borderColor:BORDER}}>
            <div className="relative h-40"><img src={h.img} alt={h.name} className="w-full h-full object-cover"/><div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)"}}/><div className="absolute top-3 left-3"><span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:GOLD,color:TEXT}}>{h.tag}</span></div><div className="absolute bottom-0 left-0 right-0 p-3"><p className="text-white font-bold text-sm" style={{fontFamily:"'Fraunces',serif"}}>{h.name}</p><div className="flex items-center gap-2 mt-0.5"><StarRow rating={h.rating}/><span className="text-white/70 text-xs">{h.city}</span></div></div></div>
            <div className="px-3 py-2.5 flex items-center justify-between"><div className="flex gap-1.5 flex-wrap">{h.facilities.slice(0,3).map(f=><span key={f} className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{background:CREAM,color:MUTED}}>{f}</span>)}</div><div className="text-right flex-shrink-0"><p className="font-bold text-base" style={{color:GREEN}}>{h.price}</p><p className="text-[9px]" style={{color:MUTED}}>за ночь</p></div></div>
          </button>
        ))}
        {showRests&&RESTAURANTS.map(r=>(
          <button key={r.id} onClick={()=>onRestaurant(r)} className="w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]" style={{borderColor:BORDER}}>
            <div className="w-24 flex-shrink-0 bg-gray-100"><img src={r.img} alt={r.name} className="w-full h-full object-cover" style={{height:96}}/></div>
            <div className="flex-1 py-3 pr-3 min-w-0"><Badge text={r.cuisine} color={"#C1603A"}/><p className="font-bold text-sm leading-tight mt-1" style={{color:TEXT}}>{r.name}</p><p className="text-[10px] mt-0.5" style={{color:MUTED}}>{r.city} · {r.open}</p><div className="flex items-center justify-between mt-2"><StarRow rating={r.rating}/><span className="text-xs font-bold" style={{color:"#C1603A"}}>{r.price}</span></div></div>
          </button>
        ))}
        {!showHotels&&!showRests&&(
          <>
            {filter==="Всё"&&(
              <button onClick={()=>onPlace(PLACES[0])} className="w-full relative rounded-2xl overflow-hidden shadow-sm text-left active:scale-[0.98]" style={{height:180}}>
                <img src={PLACES[0].img} alt={PLACES[0].name} className="w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)"}}/>
                <div className="absolute top-3 left-3"><span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:GOLD,color:TEXT}}>⭐ FEATURED</span></div>
                <div className="absolute bottom-0 left-0 right-0 p-4"><p className="text-white font-bold text-base" style={{fontFamily:"'Fraunces',serif"}}>{PLACES[0].name}</p><div className="flex items-center gap-3 mt-1"><StarRow rating={PLACES[0].rating}/><span className="text-white/70 text-xs">{PLACES[0].city}</span><span className="text-white/70 text-xs">{PLACES[0].entry}</span>{PLACES[0].audio&&<span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{background:GREEN,color:WHITE}}>🎧</span>}{WEATHER[PLACES[0].city]&&<span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(255,255,255,0.18)",backdropFilter:"blur(8px)",color:WHITE}}>{WEATHER[PLACES[0].city].icon} {WEATHER[PLACES[0].city].temp}°C</span>}</div></div>
              </button>
            )}
            {(filter==="Всё"?PLACES.slice(1):filtered).map(p=>(
              <button key={p.id} onClick={()=>onPlace(p)} className="w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border active:scale-[0.98]" style={{borderColor:BORDER}}>
                <div className="w-24 flex-shrink-0 bg-gray-100"><img src={p.img} alt={p.name} className="w-full h-full object-cover" style={{height:96}}/></div>
                <div className="flex-1 py-3 pr-3 min-w-0"><div className="flex items-center gap-1.5 mb-1"><Badge text={p.type} color={GREEN}/>{p.audio&&<Badge text="🎧" color={MUTED}/>}</div><p className="font-bold text-sm leading-tight" style={{color:TEXT}}>{p.name}</p><p className="text-[10px] mt-0.5" style={{color:MUTED}}>{p.city} · {p.distance}</p><div className="flex items-center justify-between mt-2"><StarRow rating={p.rating}/><div className="flex items-center gap-2"><span className="text-xs font-bold" style={{color:GREEN}}>{p.entry}</span>{WEATHER[p.city]&&<span className="text-[9px] font-semibold" style={{color:MUTED}}>{WEATHER[p.city].icon}{WEATHER[p.city].temp}°</span>}</div></div></div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Map Screen ─────────────────────────────────────────────────────────────────

export default ExploreScreen;
