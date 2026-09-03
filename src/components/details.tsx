"use client";

import { useEffect, useRef, useState } from "react";
import BookingForm from "./booking-form";
import ReviewForm from "./review-form";
import type { Hotel, Place, Restaurant, Route } from "@/lib/types";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { LANGS } from "@/data/content";
import { Badge, GeomPattern, StarRow } from "./ui";
import { useT } from "@/components/lang-provider";
import { glass } from "@/lib/theme";


export function PlaceDetail({ place, onBack, onPlay, onToast, onПуть }:{ place:Place; onBack:()=>void; onPlay:(p:Place)=>void; onToast:(m:string)=>void; onПуть:(название:string,город:string)=>void }) {
  const { t, трК } = useT();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fav, setFav] = useState(false);
  const [activeLang, setActiveLang] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(playing) timerRef.current = setInterval(()=>setProgress(p=>Math.min(p+0.5,100)),200);
    else if(timerRef.current) clearInterval(timerRef.current);
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); };
  },[playing]);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative flex-shrink-0" style={{height:260}}>
        <img src={place.img} alt={place.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.1) 55%,transparent 100%)"}}/>
        <button onClick={onBack} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={()=>setFav(!fav)} className="absolute top-12 right-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" viewBox="0 0 24 24" fill={fav?GOLD:"none"} stroke={fav?GOLD:"white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1.5"><Badge text={place.type} color={GREEN}/>{place.audio&&<Badge text="🎧 Аудиогид" color={MUTED}/>}{place.qr&&<Badge text="QR" color={MUTED}/>}</div>
          <h2 className="text-white text-xl font-bold" style={{fontFamily:"'Fraunces',serif"}}>{place.name}</h2>
          <p className="text-white/70 text-xs mt-0.5">{трК(place.city)} · ★ {place.rating} ({place.reviews.toLocaleString()} отзывов)</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{e:"📍",v:place.distance,k:"d_distance" as const},{e:"🎫",v:place.entry,k:"d_entry" as const},{e:"🕐",v:place.hours.length>8?t("d_always"):place.hours,k:"d_hours" as const},{e:"⏱",v:"8:42",k:"d_audio" as const}].map(s=>(
            <div key={s.k} className="bg-white rounded-2xl p-2.5 text-center shadow-sm border" style={{borderColor:BORDER}}><p className="text-base">{s.e}</p><p className="font-semibold text-[10px] mt-1 leading-tight" style={{color:TEXT}}>{s.v}</p><p className="text-[8px] mt-0.5" style={{color:MUTED}}>{t(s.k)}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-2" style={{color:TEXT}}>Описание</p>
          <p className="text-sm leading-relaxed" style={{color:MUTED}}>{place.desc}</p>
        </div>
        {place.audio&&(
          <div className="rounded-2xl p-4 mb-3" style={{background:GREEN}}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:GOLD}}><svg width="13" height="13" viewBox="0 0 24 24" fill={TEXT}><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
              <div className="flex-1"><p className="text-white font-semibold text-sm">{t("d_audioguide")}</p><p className="text-white/60 text-xs">{LANGS[activeLang]} · 8:42</p></div>
              <span className="text-white/50 text-xs">{Math.floor(progress*8.42/100/60)}:{String(Math.floor(progress*8.42/100%60)).padStart(2,"0")} / 8:42</span>
            </div>
            <div className="rounded-full h-1.5 mb-1 cursor-pointer" style={{background:"rgba(255,255,255,0.2)"}} onClick={e=>{const r=(e.target as HTMLElement).getBoundingClientRect();setProgress(((e.clientX-r.left)/r.width)*100);}}>
              <div className="h-1.5 rounded-full" style={{background:GOLD,width:`${progress}%`,transition:"width 0.2s linear"}}/>
            </div>
            <div className="flex justify-between text-white/40 text-[9px] mb-3"><span>0:00</span><span>8:42</span></div>
            <div className="flex gap-2 mb-3">
              <button onClick={()=>{setPlaying(!playing);if(!playing)onPlay(place);}} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{background:GOLD,color:TEXT}}>{playing?"⏸ Пауза":"▶ Слушать"}</button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.15)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto hide-scroll">
              {["🇷🇺 RU","🇬🇧 EN","🇺🇿 UZ","🇨🇳 ZH","🇰🇷 KR","🇩🇪 DE"].map((l,i)=>(
                <button key={l} onClick={()=>setActiveLang(i)} className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={activeLang===i?{background:GOLD,color:TEXT}:{background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)"}}>{l}</button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3 pb-6">
          <button onClick={()=>onПуть(place.name, place.city)} className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all" style={{background:GREEN}}>📍 {t("d_route")}</button>
          <button onClick={()=>onToast(`✅ «${place.name}» добавлено в маршрут!`)} className="flex-1 py-3.5 rounded-2xl text-sm font-bold border active:scale-[0.98] transition-all" style={{color:GREEN,borderColor:GREEN,background:WHITE}}>🗺️ {t("d_add_route")}</button>
        </div>
      </div>
        <ReviewForm placeId={place.id} placeName={place.name} />
    </div>
  );
}

// ── Hotel Detail ───────────────────────────────────────────────────────────────

export function HotelDetail({ hotel, onBack, onToast }:{ hotel:Hotel; onBack:()=>void; onToast:(m:string)=>void }) {
  const { t, трК } = useT();
  const [imgIdx, setImgIdx] = useState(0);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(2);
  const [fav, setFav] = useState(false);
  const [booked, setBooked] = useState(false);
  const total = parseInt(hotel.price.replace("$","")) * nights;
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative flex-shrink-0" style={{height:250}}>
        <img src={hotel.imgs[imgIdx]||hotel.img} alt={hotel.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)"}}/>
        <button onClick={onBack} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={()=>setFav(!fav)} className="absolute top-12 right-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" viewBox="0 0 24 24" fill={fav?GOLD:"none"} stroke={fav?GOLD:"white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
          {hotel.imgs.map((_,i)=><button key={i} onClick={()=>setImgIdx(i)} className="rounded-full transition-all" style={{width:i===imgIdx?18:6,height:6,background:i===imgIdx?WHITE:"rgba(255,255,255,0.5)"}}/>)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1"><Badge text={hotel.tag} color={GOLD}/><Badge text={трК(hotel.city)} color={GREEN}/></div>
          <p className="text-white text-lg font-bold" style={{fontFamily:"'Fraunces',serif"}}>{hotel.name}</p>
          <div className="flex items-center gap-3"><StarRow rating={hotel.rating}/><span className="text-white/60 text-xs">{hotel.reviews} отзывов</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-2" style={{color:TEXT}}>Об отеле</p><p className="text-sm leading-relaxed" style={{color:MUTED}}>{hotel.desc}</p></div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-3" style={{color:TEXT}}>Удобства</p>
          <div className="flex flex-wrap gap-2">
            {hotel.facilities.map(f=><div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{background:CREAM,borderColor:BORDER}}><span className="text-sm">{f==="Wi-Fi"?"📶":f==="Бассейн"?"🏊":f==="Ресторан"?"🍽️":f==="Спа"?"💆":f==="Парковка"?"🅿️":f==="Трансфер"?"🚗":f==="Терраса"?"🌿":f==="Экскурсии"?"🗺️":f==="Завтрак"?"☕":f==="Бар"?"🍹":"🏨"}</span><span className="text-xs font-medium" style={{color:TEXT}}>{f}</span></div>)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("d_booking")}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[{l:t("d_checkin"),v:"30 авг 2026"},{l:t("d_checkout"),v:`${1+nights} сент 2026`}].map(d=><div key={d.l} className="rounded-xl p-3 border" style={{background:CREAM,borderColor:BORDER}}><p className="text-[10px] font-semibold mb-0.5" style={{color:MUTED}}>{d.l}</p><p className="text-sm font-bold" style={{color:TEXT}}>{d.v}</p></div>)}
          </div>
          <div className="flex items-center justify-between mb-3">
            {[{l:t("d_nights"),v:nights,set:setNights,min:1},{l:t("d_guests"),v:guests,set:setGuests,min:1}].map(c=>(
              <div key={c.l}>
                <p className="text-[10px] font-semibold mb-1" style={{color:MUTED}}>{c.l}</p>
                <div className="flex items-center gap-3">
                  <button onClick={()=>c.set((n:number)=>Math.max(c.min,n-1))} className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{borderColor:BORDER}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                  <span className="font-bold text-base" style={{color:TEXT}}>{c.v}</span>
                  <button onClick={()=>c.set((n:number)=>n+1)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:GREEN}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                </div>
              </div>
            ))}
            <div className="text-right"><p className="text-[10px] font-semibold" style={{color:MUTED}}>{t("d_total")}</p><p className="text-xl font-bold mt-1" style={{color:GREEN,fontFamily:"'Fraunces',serif"}}>${total}</p><p className="text-[9px]" style={{color:MUTED}}>{hotel.price}/ночь × {nights}</p></div>
          </div>
          {booked?(
            <div className="rounded-2xl p-5 text-center" style={{background:"#EDF7F2",border:`1.5px solid ${GREEN}`}}>
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-base" style={{color:GREEN}}>Бронирование подтверждено!</p>
              <p className="text-xs mt-1.5" style={{color:MUTED}}>Детали отправлены на email</p>
              <p className="font-mono text-xs font-bold mt-2 px-3 py-1.5 rounded-xl inline-block" style={{background:GREEN,color:WHITE}}>№ UZH-2026-{hotel.id.toUpperCase()}{nights}{guests}</p>
            </div>
          ):(
            <>
              <button onClick={()=>{setBooked(true);onToast(t("d_booked"));}} className="w-full py-4 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all" style={{background:GREEN}}>Забронировать — ${total}</button>
              <p className="text-center text-[10px] mt-2" style={{color:MUTED}}>Бесплатная отмена до 24 ч · Скидка UzUp -10%</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border" style={{borderColor:BORDER}}>
          <div className="flex items-center justify-between mb-3"><p className="font-bold text-sm" style={{color:TEXT}}>Отзывы</p><StarRow rating={hotel.rating}/></div>
          {[{name:"Sophie M.",flag:"🇩🇪",text:"Потрясающий вид. Персонал отзывчивый.",stars:5},{name:"James T.",flag:"🇺🇸",text:"Exceeded all expectations. Unforgettable.",stars:4}].map((r,i)=>(
            <div key={i} className="py-3 border-b last:border-0" style={{borderColor:BORDER}}>
              <div className="flex items-center gap-2 mb-1"><span className="text-lg">{r.flag}</span><span className="text-sm font-semibold" style={{color:TEXT}}>{r.name}</span><span className="text-xs ml-auto" style={{color:GOLD}}>{"★".repeat(r.stars)}</span></div>
              <p className="text-xs leading-relaxed" style={{color:MUTED}}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
        <BookingForm kind="hotel" itemId={hotel.id} itemName={hotel.name} />
        <ReviewForm placeId={hotel.id} placeName={hotel.name} />
    </div>
  );
}

// ── Restaurant Detail ─────────────────────────────────────────────────────────

export function RestaurantDetail({ r, onBack, onToast, onПуть }:{ r:Restaurant; onBack:()=>void; onToast:(m:string)=>void; onПуть:(название:string,город:string)=>void }) {
  const { t, трК } = useT();
  const [fav, setFav] = useState(false);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative flex-shrink-0" style={{height:240}}>
        <img src={r.img} alt={r.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)"}}/>
        <button onClick={onBack} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={()=>setFav(!fav)} className="absolute top-12 right-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" viewBox="0 0 24 24" fill={fav?GOLD:"none"} stroke={fav?GOLD:"white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1"><Badge text={r.cuisine} color={"#C1603A"}/><Badge text={трК(r.city)} color={GREEN}/></div>
          <p className="text-white text-xl font-bold" style={{fontFamily:"'Fraunces',serif"}}>{r.name}</p>
          <div className="flex items-center gap-3 mt-0.5"><StarRow rating={r.rating}/><span className="text-white/70 text-xs">{r.reviews} отзывов</span><span className="text-white/70 text-xs">{r.price}</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{e:"🕐",v:r.open,k:"d_mode" as const},{e:"💰",v:r.price,k:"d_price" as const},{e:"🍽️",v:r.cuisine,k:"i_cuisine" as const}].map(s=>(
            <div key={s.k} className="bg-white rounded-2xl p-3 text-center shadow-sm border" style={{borderColor:BORDER}}><p className="text-base">{s.e}</p><p className="font-semibold text-[10px] mt-1 leading-tight" style={{color:TEXT}}>{s.v}</p><p className="text-[8px] mt-0.5" style={{color:MUTED}}>{t(s.k)}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-2" style={{color:TEXT}}>{t("d_about_rest")}</p><p className="text-sm leading-relaxed" style={{color:MUTED}}>{r.desc}</p></div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-2" style={{color:TEXT}}>Фирменные блюда</p>
          <div className="space-y-2">
            {["Плов", "Шашлык из баранины", "Самса тандырная", "Лагман", "Нон горячий"].map((dish,i)=>(
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{borderColor:BORDER}}>
                <span className="text-sm" style={{color:TEXT}}>{dish}</span>
                <span className="text-xs font-bold" style={{color:GREEN}}>${3+i*2}–${5+i*3}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pb-6">
          <button onClick={()=>onПуть(r.name, r.city)} className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all" style={{background:"#C1603A"}}>📍 {t("d_route")}</button>
          <button onClick={()=>onToast(`📞 Звонок в «${r.name}»...`)} className="flex-1 py-3.5 rounded-2xl text-sm font-bold border active:scale-[0.98] transition-all" style={{color:"#C1603A",borderColor:"#C1603A",background:WHITE}}>📞 {t("d_call")}</button>
        </div>
      </div>
        <BookingForm kind="restaurant" itemId={r.id} itemName={r.name} />
        <ReviewForm placeId={r.id} placeName={r.name} />
    </div>
  );
}

// ── Route Detail ───────────────────────────────────────────────────────────────

export function RouteDetail({ route, onBack }:{ route:Route; onBack:()=>void }) {
  const { t, трК } = useT();
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative px-4 pt-12 pb-5" style={{background:route.color}}>
        <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-15"><GeomPattern opacity={1}/></div>
        <button onClick={onBack} className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center relative z-10" style={{background:"rgba(255,255,255,0.2)"}}><svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="relative z-10">
          <Badge text={route.badge} color="rgba(255,255,255,0.9)"/>
          <h2 className="text-white text-xl font-bold mt-1 leading-tight" style={{fontFamily:"'Fraunces',serif"}}>{route.icon} {route.title}</h2>
          <p className="text-white/70 text-xs mt-1">{route.sub}</p>
          <div className="flex gap-4 mt-3">{[["⏱",route.duration],["📍",`${route.stops.length} ост.`]].map(([e,v])=><div key={String(v)} className="flex items-center gap-1"><span className="text-sm">{e}</span><span className="text-white text-xs font-semibold">{v}</span></div>)}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4">
        <p className="font-bold text-sm mb-3" style={{color:TEXT}}>Остановки маршрута</p>
        {route.stops.map((s,i)=>(
          <div key={i} className="flex gap-3 mb-2">
            <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:route.color}}>{i+1}</div>{i<route.stops.length-1&&<div className="w-0.5 flex-1 mt-1" style={{background:BORDER}}/>}</div>
            <div className="bg-white rounded-2xl p-3 flex-1 shadow-sm border mb-2" style={{borderColor:BORDER}}>
              <div className="flex items-start justify-between gap-2"><div><p className="font-bold text-sm" style={{color:TEXT}}>{s.name}</p><p className="text-[10px] mt-0.5" style={{color:MUTED}}>{s.dur&&`⏱ ${s.dur}`}{s.entry?` · 🎫 ${s.entry}`:""}</p></div><span className="text-[10px] font-semibold flex-shrink-0" style={{color:MUTED}}>{s.time}</span></div>
              {s.note&&<p className="text-xs mt-1.5 font-medium" style={{color:route.color}}>💡 {s.note}</p>}
            </div>
          </div>
        ))}
        <div className="flex gap-3 pb-6 mt-2">
          <button className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold" style={{background:route.color}}>▶ Начать</button>
          <button className="flex-1 py-3.5 rounded-2xl text-sm font-bold border" style={{color:route.color,borderColor:route.color,background:WHITE}}>💾 Сохранить</button>
        </div>
      </div>
        <BookingForm kind="tour" itemId={route.id} itemName={route.title} />
    </div>
  );
}

// ── Taxi Widget ────────────────────────────────────────────────────────────────
