import type { Hotel, Place, Restaurant, Tab } from "@/lib/types";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { ГОРОДА } from "@/data/geo";
import { useAppContent } from "@/components/content-provider";
import { useT } from "@/components/lang-provider";
import { useWeather } from "@/components/weather-provider";
import { GeomPattern, LogoMark } from "../ui";
import { AnimatedBg } from "@/components/animated-bg";
import { CardDeck, CityDeck } from "@/components/card-deck";

import { AdBanner } from "@/components/widgets";
import { glass, glassLight } from "@/lib/theme";
import TaxiOrder from "@/components/taxi-order";


export function HomeScreen({ onPlace, onSearch, onHotel, onNotifs, onPractical, onRestaurant, onMenu, onTab, onTransport, isPremium }:{ onPlace:(p:Place)=>void; onSearch:()=>void; onHotel:(h:Hotel)=>void; onNotifs:()=>void; onPractical:()=>void; onRestaurant:(r:Restaurant)=>void; onMenu:()=>void; onTab:(t:Tab)=>void; onTransport:()=>void; isPremium:boolean; }) {
  const { EVENTS, HOTELS, PLACES, RESTAURANTS } = useAppContent();
  const { t, lang, трК } = useT();
  const погода = useWeather();
  const самарканд = погода.get("Самарканд");
  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scroll" style={{background:CREAM}}>

      {/* ── Glassmorphism Hero ── */}
      <div className="relative h-[400px] flex-shrink-0 lg:h-[480px]">
        <img src="https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=900&h=900&fit=crop&auto=format" alt="Самарканд" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,rgba(0,0,0,0.32) 0%,rgba(0,0,0,0.04) 38%,rgba(0,0,0,0.75) 100%)"}}/>
        {/* Animated Uzbek overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatedBg/>
        </div>

        {/* Floating header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 z-10">
          <button onClick={onMenu} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{...glass}}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect width="18" height="2" rx="1" fill="white"/><rect y="6" width="12" height="2" rx="1" fill="white"/><rect y="12" width="8" height="2" rx="1" fill="white"/></svg>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{...glass}}>
            <LogoMark size={22}/>
            <span className="text-white text-sm font-bold" style={{fontFamily:"'Fraunces',serif"}}>UzUp</span>
          </div>
          <button onClick={onNotifs} className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{...glass}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"/>
          </button>
        </div>

        {/* Weather card top-right */}
        <div className="absolute top-16 right-4 rounded-2xl p-3 z-10" style={{...glassLight, minWidth:118}}>
          <p className="text-[9px] font-bold mb-1.5 uppercase tracking-wider" style={{color:MUTED}}>{трК("Самарканд")}</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{самарканд?.icon ?? "🌡️"}</span>
            <div>
              <p className="text-2xl font-bold leading-none" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{самарканд ? `${самарканд.temp}°C` : "—"}</p>
              <p className="text-[9px] mt-0.5" style={{color:MUTED}}>{самарканд ? t(самарканд.condKey) : ""}</p>
              <p className="text-[9px]" style={{color:MUTED}}>{самарканд ? `💨 ${самарканд.windKmh} ${t("w_wind")}` : ""}</p>
            </div>
          </div>
        </div>

        {/* Bottom hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            <p className="text-white/65 text-xs">{t("home_welcome")} · {new Date().toLocaleDateString(lang,{day:"numeric",month:"long"})}</p>
          </div>
          <h1 className="text-white font-bold leading-tight mb-1" style={{fontSize:34,fontFamily:"'Fraunces',serif"}}>{трК("Самарканд")}</h1>
          <p className="text-white/65 text-xs mb-3">{t("home_city_tagline")}</p>
          {/* Glassmorphism search bar */}
          <button onClick={onSearch} className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{background:"rgba(255,255,255,0.2)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.38)"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="flex-1 text-left text-sm" style={{color:"rgba(255,255,255,0.72)"}}>{t("home_search_ph")}</span>
            <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{background:GOLD,color:TEXT}}>{t("common_search")}</div>
          </button>
        </div>
      </div>

      {/* ── Quick action grid ── */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2.5 mb-2.5">
          {([
            {e:"🏛️",l:t("home_places"),    sub:"500+",   tab:"explore" as Tab, action:undefined},
            {e:"🗺️",l:t("home_routes"), sub:t("map_tab_ai"),  tab:"map"    as Tab, action:undefined},
            {e:"🏨",l:t("home_hotels"),    sub:"50+",     tab:"explore" as Tab, action:undefined},
            {e:"🍽️",l:t("home_restaurants"),sub:"200+",    tab:"explore" as Tab, action:undefined},
          ]).map(c=>(
            <button key={c.l} onClick={()=>onTab(c.tab)} className="flex flex-col items-center gap-1.5 rounded-2xl border bg-white py-3 text-center shadow-sm transition-all active:scale-95 lg:gap-2 lg:py-6" style={{borderColor:BORDER}}>
              <span className="text-2xl lg:text-3xl">{c.e}</span>
              <p className="text-[10px] font-bold lg:text-sm" style={{color:TEXT}}>{c.l}</p>
              <p className="text-[9px] lg:text-xs" style={{color:MUTED}}>{c.sub}</p>
            </button>
          ))}
        </div>
        {/* Transport wide button */}
        <button onClick={onTransport} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-all" style={{background:`linear-gradient(135deg,#1A5C3A,${GREEN})`,boxShadow:"0 4px 16px rgba(46,125,90,0.35)"}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(255,255,255,0.18)"}}>🚇</div>
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm">{t("home_transport")}</p>
            <p className="text-white/65 text-[10px]">{t("home_transport_sub")}</p>
          </div>
          <div className="flex gap-1.5 mr-2">
            <span className="text-base">✈️</span><span className="text-base">🚄</span><span className="text-base">🚌</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* ── Weather horizontal scroll ── */}
      <div className="pt-5">
        <p className="font-bold text-base mb-3 px-4" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>🌤️ {t("home_weather")}</p>
        <div className="flex gap-3 overflow-x-auto hide-scroll px-4 pb-1">
          {Object.keys(ГОРОДА).map((city)=>{
            const w = погода.get(city);
            return (
              <div key={city} className="flex-shrink-0 bg-white rounded-2xl p-3 shadow-sm border text-center" style={{borderColor:BORDER,minWidth:96}}>
                <p className="text-[10px] font-bold mb-1 truncate" style={{color:TEXT}}>{трК(city)}</p>
                <div className="flex items-center justify-center gap-1">
                  <p className="font-bold" style={{color:TEXT,fontSize:28,fontFamily:"'Fraunces',serif",lineHeight:1}}>{w ? `${w.temp}°` : "—"}</p>
                  <span style={{fontSize:30,lineHeight:1}}>{w?.icon ?? "🌡️"}</span>
                </div>
                <p className="text-[9px] leading-tight mt-1" style={{color:MUTED}}>{w ? t(w.condKey) : ""}</p>
                <p className="text-[9px] mt-0.5" style={{color:MUTED}}>{w ? `💨 ${w.windKmh} ${t("w_wind")}` : ""}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── City Deck — image-23 style ── */}
      <CityDeck onSearch={onSearch}/>

      {/* ── Place Card Deck — image-23 style ── */}
      <CardDeck places={PLACES} onPlace={onPlace}/>

      {/* ── Events ── */}
      <div className="pt-5">
        <div className="flex items-center justify-between mb-3 px-4">
          <p className="font-bold text-base" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>🎉 {t("home_events")}</p>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scroll px-4 pb-1">
          {EVENTS.map(ev=>(
            <div key={ev.name} className="flex-shrink-0 rounded-2xl overflow-hidden shadow-sm" style={{width:200,background:ev.color,position:"relative"}}>
              <div className="absolute inset-0 flex items-center justify-end pr-2 opacity-10"><GeomPattern opacity={1}/></div>
              <div className="relative z-10 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5" style={{background:"rgba(255,255,255,0.22)"}}>{ev.emoji}</div>
                <p className="font-bold text-sm text-white leading-tight">{трК(ev.name)}</p>
                <p className="text-[9px] mt-1 font-semibold" style={{color:"rgba(255,255,255,0.75)"}}>{ev.date} · {трК(ev.city)}</p>
                <p className="text-[9px] mt-2 leading-relaxed" style={{color:"rgba(255,255,255,0.7)"}}>{трК(ev.desc)}</p>
                <button className="mt-3 px-3 py-1.5 rounded-xl text-[9px] font-bold" style={{background:"rgba(255,255,255,0.22)",color:"white"}}>📅 {t("home_remind")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Taxi ── */}
      <TaxiOrder/>

      {/* ── Ad ── */}
      <div className="pt-3"><AdBanner isPremium={isPremium}/></div>

      {/* ── Flash Deals Hotels — dark image-23 cards ── */}
      <div className="pt-5">
        <div className="flex items-center justify-between mb-3 px-4">
          <p className="font-bold text-base" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{t("home_flash_hotels")}</p>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><span className="text-xs font-bold text-red-500">LIVE</span></div>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scroll px-4 pb-1">
          {HOTELS.map(h=>(
            <button key={h.id} onClick={()=>onHotel(h)} className="flex-shrink-0 relative rounded-3xl overflow-hidden text-left active:scale-95 transition-all" style={{width:188,height:270,background:"#111",flexShrink:0}}>
              <img src={h.img} alt={h.name} className="absolute inset-0 w-full h-full object-cover"/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.2) 50%,transparent 100%)"}}/>
              {/* Tag */}
              <div className="absolute top-3 left-3"><span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(233,196,106,0.92)",color:TEXT}}>{h.tag}</span></div>
              {/* Weather */}
              {(()=>{const w=погода.get(h.city);return w?<div className="absolute top-3 right-3"><span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(6px)",color:"white"}}>{w.icon}{w.temp}°</span></div>:null;})()}
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[8px] mb-0.5" style={{color:"rgba(255,255,255,0.45)"}}>📍 {трК(h.city)}</p>
                <p className="text-white font-bold leading-tight mb-1.5" style={{fontSize:13,fontFamily:"'Fraunces',serif"}}>{h.name}</p>
                <div className="flex gap-3 pb-2 mb-2 border-b" style={{borderColor:"rgba(255,255,255,0.1)"}}>
                  <div><p className="text-white font-bold text-[10px]">{h.rating}★</p><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("card_rating")}</p></div>
                  <div><p className="text-white font-bold text-[10px]">{h.reviews}</p><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("d_reviews_word")}</p></div>
                  <div><p className="text-white font-bold text-[10px]">{h.facilities.length}</p><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("home_services")}</p></div>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("home_per_night")}</p><p className="text-white font-bold text-sm">{h.price}</p></div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:GOLD}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Restaurants — dark image-23 cards ── */}
      <div className="pt-5">
        <div className="flex items-center justify-between mb-3 px-4">
          <p className="font-bold text-base" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{t("home_best_rest")}</p>
          <button onClick={()=>onTab("explore")} className="text-xs font-medium" style={{color:GREEN}}>{t("home_all")}</button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scroll px-4 pb-1">
          {RESTAURANTS.slice(0,8).map(r=>(
            <button key={r.id} onClick={()=>onRestaurant(r)} className="flex-shrink-0 relative rounded-3xl overflow-hidden text-left active:scale-95 transition-all" style={{width:172,height:248}}>
              <img src={r.img} alt={r.name} className="absolute inset-0 w-full h-full object-cover"/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.15) 55%,transparent 100%)"}}/>
              <div className="absolute top-3 left-3"><span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(193,96,58,0.92)",color:WHITE}}>{r.cuisine}</span></div>
              {(()=>{const w=погода.get(r.city);return w?<div className="absolute top-3 right-3"><span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(6px)",color:"white"}}>{w.icon}{w.temp}°</span></div>:null;})()}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[8px] mb-0.5" style={{color:"rgba(255,255,255,0.45)"}}>📍 {трК(r.city)}</p>
                <p className="text-white font-bold leading-tight mb-1.5" style={{fontSize:12,fontFamily:"'Fraunces',serif"}}>{r.name}</p>
                <div className="flex gap-3 pb-1.5 mb-1.5 border-b" style={{borderColor:"rgba(255,255,255,0.1)"}}>
                  <div><p className="text-white font-bold text-[10px]">{r.rating}★</p><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("card_rating")}</p></div>
                  <div><p className="text-white font-bold text-[10px]">{r.open.split("–")[0]}</p><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("home_open_word")}</p></div>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-[7px]" style={{color:"rgba(255,255,255,0.4)"}}>{t("d_price")}</p><p className="text-white font-bold text-xs">{r.price}</p></div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:"#C1603A"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Practical info teaser ── */}
      <div className="px-4 pt-4">
        <button onClick={onPractical} className="w-full rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all" style={{background:"#EDF7F2"}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{background:GREEN}}>💡</div>
          <div className="flex-1"><p className="text-sm font-bold" style={{color:TEXT}}>{t("pr_title")}</p><p className="text-[10px]" style={{color:MUTED}}>{t("home_practical_sub")}</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* ── Why UzUp ── */}
      <div className="px-4 pt-5 pb-8">
        <p className="font-bold text-base mb-4" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{t("home_why")}</p>
        <div className="grid grid-cols-4 gap-2">
          {[{icon:"✅",label:t("why_reliable"),sub:t("why_reliable_sub")},{icon:"🗺️",label:t("why_handy"),sub:t("why_handy_sub")},{icon:"🎧",label:"24/7",sub:t("why_support_sub")},{icon:"🇺🇿",label:t("why_made"),sub:t("why_made_sub")}].map(f=>(
            <div key={f.label} className="flex flex-col items-center text-center"><div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg mb-1.5 bg-white shadow-sm border" style={{borderColor:BORDER}}>{f.icon}</div><p className="font-semibold leading-tight" style={{color:TEXT,fontSize:9}}>{f.label}</p><p className="mt-0.5 leading-tight" style={{color:MUTED,fontSize:8}}>{f.sub}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Explore Screen ─────────────────────────────────────────────────────────────

export default HomeScreen;
