"use client";

import { useState } from "react";
import type { Place, Route } from "@/lib/types";
import { ACCENT_FILL, BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE, SURFACE, ACCENT_SOFT, ACCENT_BORDER, мягко, ON_GOLD } from "@/lib/theme";

import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useWeather } from "@/components/weather-provider";
import { Badge } from "../ui";
import RealMap from "@/components/real-map";
import { ГОРОДА } from "@/data/geo";
import { планДня, type Интерес } from "@/lib/day-plan";


/** Сколько часов за выбором «3 ч»… «Весь день». */
const ЧАСОВ: Record<string, number> = { "3 ч": 3, "6 ч": 6, "8 ч": 8, "Весь день": 10 };

/** Интересы в данных — со строчной, а в заголовке первая буква заглавная. */
const сБольшой = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function MapScreen({ onRoute, onAudio, onPlace }:{ onRoute:(r:Route)=>void; onAudio:()=>void; onPlace:(p:Place)=>void }) {
  const { ROUTES, PLACES, RESTAURANTS } = useAppContent();
  const { t, трК, lang } = useT();
  const погода = useWeather();
  const [mode, setMode] = useState<"map"|"routes"|"ai">("map");
  const [city, setCity]   = useState("Самарканд");
  /*
   * Где человек. Разрешение спрашиваем по нажатию, а не при открытии
   * экрана: непрошеный запрос геолокации почти всегда получает отказ,
   * и второй раз система его уже не покажет.
   */
  const [где, setГде] = useState<{ lat:number; lon:number }|null>(null);
  const определитьГде = () => navigator.geolocation?.getCurrentPosition(
    p => setГде({ lat:p.coords.latitude, lon:p.coords.longitude }),
    () => setГде(null),
    { enableHighAccuracy:true, timeout:8000 },
  );
  const [hours, setHours] = useState("6 ч");
  const [ints, setInts]   = useState<Интерес[]>(["история"]);
  const [generated, setGenerated]   = useState(false);
  const toggleInt=(v:Интерес)=>setInts(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const план = generated ? планДня({ места: PLACES, рестораны: RESTAURANTS, город: city, часов: ЧАСОВ[hours] ?? 6, интересы: ints }) : null;
  const длительностьСтр = (ч: number) => ч >= 1 ? `${ч.toLocaleString(lang,{maximumFractionDigits:1})} ${t("common_h")}` : `${Math.round(ч*60)} ${t("common_min")}`;
  return (
    <div className="flex flex-col h-full" style={{background:CREAM}}>
      <div className="px-4 pt-14 pb-3 bg-white border-b" style={{borderColor:BORDER}}>
        <p className="text-xs font-medium mb-0.5" style={{color:GREEN,letterSpacing:"0.1em"}}>{t("map_kicker")}</p>
        <h1 className="text-xl font-bold mb-3" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{t("map_title")}</h1>
        <div className="flex gap-2">
          {(["map","routes","ai"] as const).map(m=><button key={m} onClick={()=>setMode(m)} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={mode===m?{background:ACCENT_FILL,color:WHITE}:{background:CREAM,color:MUTED}}>{m==="map"?`🗺️ ${t("map_tab_map")}`:m==="routes"?`📋 ${t("map_tab_routes")}`:`✨ ${t("map_tab_ai")}`}</button>)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll">
        {mode==="map"&&(
          <div className="p-4 space-y-4">
            {/* Instruction */}
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{background:ACCENT_SOFT,border:`1px solid ${ACCENT_BORDER}`}}>
              <span className="text-lg">🗺️</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold" style={{color:GREEN}}>{t("map_uz")}</p>
                <p className="text-[10px]" style={{color:MUTED}}>{t("map_where_you")}</p>
              </div>
              <button
                onClick={определитьГде}
                className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold"
                style={{background:ACCENT_FILL,color:WHITE}}
              >
                {где ? t("map_refresh") : t("map_where_am_i")}
              </button>
            </div>
            {/* 3D Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{borderColor:BORDER}}>
              <RealMap
                высота="clamp(300px, 46vh, 560px)"
                откуда={где}
                фокус={где}
                приблизить={false}
                точки={Object.entries(ГОРОДА).map(([название,geo])=>({
                  geo,
                  подпись: название,
                  главная: название===city,
                }))}
                onВыбор={(т)=>{ if(т.подпись) setCity(т.подпись); }}
              />
            </div>
            {/* Selected city info */}
            {city&&погода.get(city)&&(
              <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}>
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-base" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{трК(city)}</p><p className="text-xs" style={{color:MUTED}}>{t("map_selected_city")}</p></div>
                  <div className="text-right"><span className="text-2xl">{погода.get(city)!.icon}</span><p className="font-bold text-lg" style={{color:TEXT}}>{погода.get(city)!.temp}°C</p><p className="text-[9px]" style={{color:MUTED}}>{t(погода.get(city)!.condKey)}</p></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>setMode("routes")} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{background:ACCENT_FILL,color:WHITE}}>🗺️ {t("home_routes")}</button>
                  <button onClick={onAudio} className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95" style={{color:GREEN,borderColor:GREEN}}>🎧 {t("d_audioguide")}</button>
                </div>
              </div>
            )}
            {/* City chips */}
            <div className="flex gap-2 flex-wrap">
              {Object.keys(ГОРОДА).map(c=><button key={c} onClick={()=>setCity(c)} className="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm" style={city===c?{background:ACCENT_FILL,color:WHITE}:{background:SURFACE,color:TEXT,border:`1px solid ${BORDER}`}}>{трК(c)}</button>)}
            </div>
          </div>
        )}
        {mode==="routes"&&(
          <div className="p-4 space-y-3">
            {ROUTES.map(r=>(
              <button key={r.id} onClick={()=>onRoute(r)} className="w-full bg-white rounded-2xl p-4 shadow-sm border text-left active:scale-[0.98]" style={{borderColor:BORDER}}>
                <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:мягко(r.color)}}>{r.icon}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-bold text-sm" style={{color:TEXT}}>{трК(r.title)}</p><Badge text={трК(r.badge)} color={r.color}/></div><p className="text-[10px] mt-0.5" style={{color:MUTED}}>{трК(r.sub)}</p><p className="text-xs font-semibold mt-1" style={{color:r.color}}>⏱ {r.duration}</p></div><svg className="rtl-flip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
              </button>
            ))}
          </div>
        )}
        {mode==="ai"&&(
          <div className="p-4 space-y-3">
            {!generated?(
              <>
                <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("map_where")}</p><div className="grid grid-cols-2 gap-2">{["Самарканд","Бухара","Хива","Ташкент"].map(c=><button key={c} onClick={()=>setCity(c)} className="py-2.5 rounded-xl text-xs font-semibold" style={city===c?{background:ACCENT_FILL,color:WHITE}:{background:CREAM,color:TEXT}}>{трК(c)}</button>)}</div></div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("map_howlong")}</p><div className="flex gap-2">{["3 ч","6 ч","8 ч","Весь день"].map(h=><button key={h} onClick={()=>setHours(h)} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={hours===h?{background:GOLD,color:ON_GOLD}:{background:CREAM,color:TEXT}}>{трК(h)}</button>)}</div></div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("map_interests")}</p><div className="flex flex-wrap gap-2">{([["история","🏛️"],["мечети","🕌"],["еда","🍽️"],["природа","🌿"],["базары","🛍️"],["музеи","🏺"]] as [Интерес,string][]).map(([k,e])=><button key={k} onClick={()=>toggleInt(k)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium" style={ints.includes(k)?{background:ACCENT_FILL,color:WHITE}:{background:CREAM,color:TEXT}}>{e} {трК(k)}</button>)}</div></div>
                <button onClick={()=>setGenerated(true)} className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2" style={{background:ACCENT_FILL,color:WHITE}}>
                  ✨ {t("map_create")}
                </button>
              </>
            ):(
              <div className="animate-slide-up">
                <div className="rounded-2xl p-4 mb-4" style={{background:ACCENT_FILL}}>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t("map_ai_route")} · {трК(city)}</p>
                  <p className="text-white text-lg font-bold" style={{fontFamily:"var(--font-heading)"}}>{сБольшой(ints.length ? ints.map((и)=>трК(и)).join(" + ") : трК(hours))}</p>
                  {план&&план.остановки.length>0&&<p className="text-white/60 text-xs mt-1">{план.остановки.filter(о=>о.место).length} {t("d_stops_short")}{план.км!=null?` · ${план.км.toLocaleString()} ${t("unit_km")}`:""}{план.вход>0?` · ~$${план.вход}`:""}</p>}
                </div>
                {план&&план.остановки.length===0&&(
                  <p className="py-6 text-center text-sm" style={{color:MUTED}}>{t("map_no_places")}</p>
                )}
                {план?.остановки.map((о,i,все)=>(
                  <div key={i} className="flex gap-3 mb-2">
                    <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{background:о.обед?"#C1603A":ACCENT_FILL}}>{о.обед?"🍽":i+1-все.slice(0,i).filter(x=>x.обед).length}</div>{i<все.length-1&&<div className="w-0.5 flex-1 mt-1" style={{background:BORDER}}/>}</div>
                    <button onClick={()=>о.место&&onPlace(о.место)} disabled={!о.место} className="bg-white rounded-2xl p-3 flex-1 shadow-sm border mb-2 text-left" style={{borderColor:BORDER}}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm" style={{color:TEXT}}>{о.место?о.место.name:`${t("map_lunch")} · ${о.обед!.name}`}</p>
                          <p className="text-[10px] mt-0.5" style={{color:MUTED}}>⏱ {длительностьСтр(о.часов)}{о.место?` · ${о.место.type} · 🎫 ${о.место.entry}`:` · ${о.обед!.cuisine}`}</p>
                        </div>
                        <span className="text-[10px] font-semibold flex-shrink-0" style={{color:MUTED}}>{о.время}</span>
                      </div>
                    </button>
                  </div>
                ))}
                <button onClick={()=>setGenerated(false)} className="w-full py-3.5 rounded-2xl text-sm font-semibold border mt-1 mb-4" style={{color:GREEN,borderColor:GREEN,background:SURFACE}}>← {t("map_new_route")}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default MapScreen;
