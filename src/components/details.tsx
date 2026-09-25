"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContent } from "./content-provider";
import { useAudioPlayer, времяЗвука } from "./audio-player";
import { useSettings } from "@/lib/settings";
import BookingForm from "./booking-form";
import ReviewForm from "./review-form";
import type { Hotel, Place, Restaurant, Route } from "@/lib/types";
import { ACCENT_FILL, BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE, SURFACE, ACCENT_SOFT, мягко, ON_GOLD } from "@/lib/theme";

import { Badge, GeomPattern, StarRow } from "./ui";
import { useT } from "@/components/lang-provider";
import { useДистанция } from "@/lib/distance";
import { useGeo } from "@/components/geo-provider";
import { useFavorites, переключитьИзбранное } from "@/lib/favorites";
import { useTrip, переключитьВМаршруте } from "@/lib/trip";
import { дистанцияКм, точкаИзвестна } from "@/data/geo";
import { useДеньги } from "@/lib/money";
import { glass } from "@/lib/theme";


/** Как язык интерфейса называется в записях аудиогида (их подписывает панель). */
const ЯЗЫК_ЗАПИСИ: Record<string, string> = {
  ru: "Русский", en: "English", uz: "Oʻzbek", zh: "中文", ko: "한국어", de: "Deutsch",
};

export function PlaceDetail({ place, onBack, onToast, onПуть }:{ place:Place; onBack:()=>void; onToast:(m:string)=>void; onПуть:(название:string,город:string)=>void }) {
  const { t, трК, lang } = useT();
  const { AUDIO } = useAppContent();
  const плеер = useAudioPlayer();
  const { autoplay } = useSettings();
  const { pos } = useGeo();
  const дг = useДеньги();
  const км = дистанцияКм(pos, place.nameRu ?? place.name, place.city); // «от вас»
  const дист = useДистанция();
  const избранное = useFavorites();
  const fav = избранное.some((f) => f.key === `place:${place.id}`);
  const маршрут = useTrip();
  const вМаршруте = маршрут.some((x) => x.id === place.id);
  /*
   * Аудиогид — настоящие записи этого места из панели. Здесь раньше был
   * нарисованный плеер: полоска бежала по таймеру, у всех мест одинаковые
   * «8:42», а звука не было вовсе. Записей нет — нет и плеера.
   *
   * Языки — только те, на которых записи есть. Начинаем с языка
   * интерфейса, если на нём записано; иначе с первой записи.
   */
  const записи = AUDIO.filter((а) => а.placeId === place.id);
  const [выбранная, setВыбранная] = useState(() =>
    записи.find((а) => а.lang === ЯЗЫК_ЗАПИСИ[lang])?.id ?? записи[0]?.id,
  );
  const запись = записи.find((а) => а.id === выбранная) ?? записи[0];
  const этаИграет = Boolean(запись && плеер.запись?.id === запись.id);
  const длительность = этаИграет && плеер.длительность ? плеер.длительность : запись?.seconds ?? 0;
  const позиция = этаИграет ? плеер.позиция : 0;

  // «Автозапуск аудиогида» из настроек: открыл место — рассказ начался.
  const автоЗапущено = useRef(false);
  useEffect(() => {
    if (!autoplay || !запись || автоЗапущено.current || плеер.запись?.id === запись.id) return;
    автоЗапущено.current = true;
    плеер.включить(запись, true);
  }, [autoplay, запись, плеер]);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative flex-shrink-0" style={{height:260}}>
        <img src={place.img} alt={place.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.1) 55%,transparent 100%)"}}/>
        <button onClick={onBack} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg className="rtl-flip" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={()=>переключитьИзбранное({id:place.id,kind:"place",name:place.name,city:трК(place.city),img:place.img,rating:place.rating})} className="absolute top-12 right-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" viewBox="0 0 24 24" fill={fav?GOLD:"none"} stroke={fav?GOLD:"white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1.5"><Badge text={place.type} color={GREEN}/>{записи.length>0&&<Badge text={"🎧 "+t("d_audioguide")} color={MUTED}/>}{place.qr&&<Badge text="QR" color={MUTED}/>}</div>
          <h2 className="text-white text-xl font-bold" style={{fontFamily:"var(--font-heading)"}}>{place.name}</h2>
          <p className="text-white/70 text-xs mt-0.5">{трК(place.city)} · ★ {place.rating} ({(place.reviews ?? 0).toLocaleString()} {t("d_reviews_word")})</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className={`grid ${запись?.seconds?"grid-cols-4":"grid-cols-3"} gap-2 mb-4`}>
          {[{e:"📍",v:км!=null?дист.формат(км):дист.изДанных(place.distance),k:"d_distance" as const},{e:"🎫",v:дг.цена(place.entry),k:"d_entry" as const},{e:"🕐",v:place.hours.length>8?t("d_always"):place.hours,k:"d_hours" as const},...(запись?.seconds?[{e:"⏱",v:времяЗвука(запись.seconds),k:"d_audio" as const}]:[])].map(s=>(
            <div key={s.k} className="bg-white rounded-2xl p-2.5 text-center shadow-sm border" style={{borderColor:BORDER}}><p className="text-base">{s.e}</p><p className="font-semibold text-[10px] mt-1 leading-tight" style={{color:TEXT}}>{s.v}</p><p className="text-[8px] mt-0.5" style={{color:MUTED}}>{t(s.k)}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-2" style={{color:TEXT}}>{t("d_description")}</p>
          <p className="text-sm leading-relaxed" style={{color:MUTED}}>{place.desc}</p>
        </div>
        {запись&&(
          <div className="rounded-2xl p-4 mb-3" style={{background:ACCENT_FILL}}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:GOLD}}><svg width="13" height="13" viewBox="0 0 24 24" fill={ON_GOLD}><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
              <div className="flex-1 min-w-0"><p className="text-white font-semibold text-sm truncate">{трК(запись.title)}</p><p className="text-white/60 text-xs">{трК(запись.lang)}</p></div>
              {длительность>0&&<span className="text-white/50 text-xs">{времяЗвука(позиция)||"0:00"} / {времяЗвука(длительность)}</span>}
            </div>
            {/* Полоска — настоящая позиция звука; нажатие перематывает. */}
            <div className="rounded-full h-1.5 mb-3 cursor-pointer" style={{background:"rgba(255,255,255,0.2)"}} onClick={e=>{if(!этаИграет)return;const r=e.currentTarget.getBoundingClientRect();плеер.перемотать((e.clientX-r.left)/r.width);}}>
              <div className="h-1.5 rounded-full" style={{background:GOLD,width:`${длительность?Math.min(100,позиция/длительность*100):0}%`,transition:"width 0.25s linear"}}/>
            </div>
            <button onClick={()=>плеер.включить(запись)} className="w-full py-2.5 rounded-xl text-sm font-bold mb-3" style={{background:GOLD,color:ON_GOLD}}>{этаИграет&&плеер.играет?"⏸ "+t("d_pause"):"▶ "+t("d_listen")}</button>
            {плеер.ошибка==="failed"&&этаИграет&&<p className="text-xs mb-2" style={{color:"#ffd9d4"}}>{t("audio_failed")}</p>}
            {записи.length>1&&(
              <div className="flex gap-1.5 overflow-x-auto hide-scroll">
                {записи.map((а)=>(
                  <button key={а.id} onClick={()=>setВыбранная(а.id)} className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={а.id===запись.id?{background:GOLD,color:ON_GOLD}:{background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)"}}>{трК(а.lang)}</button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex gap-3 mb-3">
          <button onClick={()=>onПуть(place.name, place.city)} className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all" style={{background:ACCENT_FILL}}>📍 {t("d_route")}</button>
          <button
            onClick={()=>{ const стало = переключитьВМаршруте({id:place.id,name:place.name,city:place.city,img:place.img}); onToast(стало?`✅ «${place.name}» — ${t("trip_added")}`:`✕ «${place.name}» — ${t("trip_removed")}`); }}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold border active:scale-[0.98] transition-all"
            style={{color:GREEN,borderColor:GREEN,background:вМаршруте?ACCENT_SOFT:SURFACE}}
          >{вМаршруте?`✓ ${t("trip_in")}`:`🗺️ ${t("d_add_route")}`}</button>
        </div>
        {/* Отзывы — внутри прокрутки, иначе на телефоне блок наезжал на
            аудиоплеер и обрезался. */}
        <ReviewForm placeId={place.id} placeName={place.name} />
        <div className="pb-6" />
      </div>
    </div>
  );
}

// ── Hotel Detail ───────────────────────────────────────────────────────────────

export function HotelDetail({ hotel, onBack }:{ hotel:Hotel; onBack:()=>void }) {
  const { t, трК } = useT();
  const [imgIdx, setImgIdx] = useState(0);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(2);
  const избранное = useFavorites();
  const fav = избранное.some((f) => f.key === `hotel:${hotel.id}`);
  // Цена в данных строкой вида «$89». Нет цифр — итог просто не считаем.
  const заНочь = parseInt(hotel.price.replace(/[^0-9.]/g,"")) || 0;
  const total = заНочь * nights;
  const дг = useДеньги();
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative flex-shrink-0" style={{height:250}}>
        <img src={hotel.imgs[imgIdx]||hotel.img} alt={hotel.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)"}}/>
        <button onClick={onBack} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg className="rtl-flip" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={()=>переключитьИзбранное({id:hotel.id,kind:"hotel",name:hotel.name,city:трК(hotel.city),img:(hotel.imgs[0]||hotel.img),rating:hotel.rating})} className="absolute top-12 right-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" viewBox="0 0 24 24" fill={fav?GOLD:"none"} stroke={fav?GOLD:"white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
          {hotel.imgs.map((_,i)=><button key={i} onClick={()=>setImgIdx(i)} className="rounded-full transition-all" style={{width:i===imgIdx?18:6,height:6,background:i===imgIdx?WHITE:"rgba(255,255,255,0.5)"}}/>)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1"><Badge text={hotel.tag} color={GOLD}/><Badge text={трК(hotel.city)} color={GREEN}/></div>
          <p className="text-white text-lg font-bold" style={{fontFamily:"var(--font-heading)"}}>{hotel.name}</p>
          <div className="flex items-center gap-3"><StarRow rating={hotel.rating} onPhoto/><span className="text-white/60 text-xs">{hotel.reviews} {t("d_reviews_word")}</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-2" style={{color:TEXT}}>{t("d_about_hotel")}</p><p className="text-sm leading-relaxed" style={{color:MUTED}}>{hotel.desc}</p></div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("d_facilities")}</p>
          <div className="flex flex-wrap gap-2">
            {hotel.facilities.map(f=><div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{background:CREAM,borderColor:BORDER}}><span className="text-sm">{f==="Wi-Fi"?"📶":f==="Бассейн"?"🏊":f==="Ресторан"?"🍽️":f==="Спа"?"💆":f==="Парковка"?"🅿️":f==="Трансфер"?"🚗":f==="Терраса"?"🌿":f==="Экскурсии"?"🗺️":f==="Завтрак"?"☕":f==="Бар"?"🍹":"🏨"}</span><span className="text-xs font-medium" style={{color:TEXT}}>{трК(f)}</span></div>)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}>
          <p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("d_booking")}</p>
          <div className="flex items-center justify-between mb-3">
            {[{l:t("d_nights"),v:nights,set:setNights,min:1},{l:t("d_guests"),v:guests,set:setGuests,min:1}].map(c=>(
              <div key={c.l}>
                <p className="text-[10px] font-semibold mb-1" style={{color:MUTED}}>{c.l}</p>
                <div className="flex items-center gap-3">
                  <button onClick={()=>c.set((n:number)=>Math.max(c.min,n-1))} className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{borderColor:BORDER}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                  <span className="font-bold text-base" style={{color:TEXT}}>{c.v}</span>
                  <button onClick={()=>c.set((n:number)=>n+1)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:ACCENT_FILL}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                </div>
              </div>
            ))}
            {total>0&&<div className="text-right"><p className="text-[10px] font-semibold" style={{color:MUTED}}>{t("d_total")}</p><p className="text-xl font-bold mt-1" style={{color:GREEN,fontFamily:"var(--font-heading)"}}>{дг.одна(total)}</p><p className="text-[9px]" style={{color:MUTED}}>{дг.цена(hotel.price)}{t("d_per_night")} × {nights}</p></div>}
          </div>
          {/* Ночи и гостей человек выбирает здесь, а заявку с датой
              отправляет форма ниже — она берёт их отсюда. */}
          <p className="text-center text-[10px]" style={{color:MUTED}}>{t("d_book_terms")}</p>
        </div>
        <BookingForm kind="hotel" itemId={hotel.id} itemName={hotel.name} ночей={nights} гостей={guests} />
        <ReviewForm placeId={hotel.id} placeName={hotel.name} />
        <div className="pb-6" />
      </div>
    </div>
  );
}

// ── Restaurant Detail ─────────────────────────────────────────────────────────

export function RestaurantDetail({ r, onBack, onПуть }:{ r:Restaurant; onBack:()=>void; onПуть:(название:string,город:string)=>void }) {
  const { t, трК } = useT();
  const дг = useДеньги();
  const избранное = useFavorites();
  const fav = избранное.some((f) => f.key === `restaurant:${r.id}`);
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative flex-shrink-0" style={{height:240}}>
        <img src={r.img} alt={r.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)"}}/>
        <button onClick={onBack} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg className="rtl-flip" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={()=>переключитьИзбранное({id:r.id,kind:"restaurant",name:r.name,city:трК(r.city),img:r.img,rating:r.rating})} className="absolute top-12 right-4 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{...glass}}><svg width="16" height="16" viewBox="0 0 24 24" fill={fav?GOLD:"none"} stroke={fav?GOLD:"white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1"><Badge text={r.cuisine} color={"#C1603A"}/><Badge text={трК(r.city)} color={GREEN}/></div>
          <p className="text-white text-xl font-bold" style={{fontFamily:"var(--font-heading)"}}>{r.name}</p>
          <div className="flex items-center gap-3 mt-0.5"><StarRow rating={r.rating} onPhoto/><span className="text-white/70 text-xs">{r.reviews} {t("d_reviews_word")}</span><span className="text-white/70 text-xs">{r.price}</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{e:"🕐",v:r.open,k:"d_mode" as const},{e:"💰",v:дг.цена(r.price),k:"d_price" as const},{e:"🍽️",v:r.cuisine,k:"i_cuisine" as const}].map(s=>(
            <div key={s.k} className="bg-white rounded-2xl p-3 text-center shadow-sm border" style={{borderColor:BORDER}}><p className="text-base">{s.e}</p><p className="font-semibold text-[10px] mt-1 leading-tight" style={{color:TEXT}}>{s.v}</p><p className="text-[8px] mt-0.5" style={{color:MUTED}}>{t(s.k)}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-2" style={{color:TEXT}}>{t("d_about_rest")}</p><p className="text-sm leading-relaxed" style={{color:MUTED}}>{r.desc}</p></div>
        {/*
          Здесь был список «фирменных блюд»: одни и те же пять узбекских
          названий у каждого ресторана, включая неузбекские, и цены,
          посчитанные из номера строки ($3+i*2) — нон выходил дороже
          плова. Меню в данных нет, а выдуманное меню хуже никакого.
          Вернуть блок можно, когда блюда появятся в панели.
        */}
        <div className="flex gap-3 mb-3">
          {/* Кнопка «Позвонить» показывала «звоним…» и ничего не набирала:
              телефона заведения в данных нет. Убрана до появления номера. */}
          <button onClick={()=>onПуть(r.name, r.city)} className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all" style={{background:"#C1603A"}}>📍 {t("d_route")}</button>
        </div>
        <BookingForm kind="restaurant" itemId={r.id} itemName={r.name} />
        <ReviewForm placeId={r.id} placeName={r.name} />
        <div className="pb-6" />
      </div>
    </div>
  );
}

// ── Route Detail ───────────────────────────────────────────────────────────────

export function RouteDetail({ route, onBack, onПуть, onToast }:{ route:Route; onBack:()=>void; onПуть:(название:string,город:string)=>void; onToast:(m:string)=>void }) {
  const { t, трК } = useT();
  const избранное = useFavorites();
  const сохранён = избранное.some((f) => f.key === `route:${route.id}`);
  /*
   * «Начать» ведёт к первой остановке, координаты которой мы знаем.
   * У многодневных маршрутов первая строка — «Ташкент → Самарканд», её
   * на карте не поставить, поэтому берём первую узнаваемую.
   */
  const перваяТочка = route.stops.find((s) => точкаИзвестна(s.name));
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative px-4 pt-12 pb-5" style={{background:route.color}}>
        <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-15"><GeomPattern opacity={1}/></div>
        <button onClick={onBack} className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center relative z-10" style={{background:"rgba(255,255,255,0.2)"}}><svg className="rtl-flip" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="relative z-10">
          <Badge text={трК(route.badge)} color="rgba(255,255,255,0.9)"/>
          <h2 className="text-white text-xl font-bold mt-1 leading-tight" style={{fontFamily:"var(--font-heading)"}}>{route.icon} {трК(route.title)}</h2>
          <p className="text-white/70 text-xs mt-1">{трК(route.sub)}</p>
          <div className="flex gap-4 mt-3">{[["⏱",route.duration],["📍",`${route.stops.length} ${t("d_stops_short")}`]].map(([e,v])=><div key={String(v)} className="flex items-center gap-1"><span className="text-sm">{e}</span><span className="text-white text-xs font-semibold">{v}</span></div>)}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4">
        <p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("d_route_stops")}</p>
        {route.stops.map((s,i)=>(
          <div key={i} className="flex gap-3 mb-2">
            <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:route.color}}>{i+1}</div>{i<route.stops.length-1&&<div className="w-0.5 flex-1 mt-1" style={{background:BORDER}}/>}</div>
            <div className="bg-white rounded-2xl p-3 flex-1 shadow-sm border mb-2" style={{borderColor:BORDER}}>
              <div className="flex items-start justify-between gap-2"><div><p className="font-bold text-sm" style={{color:TEXT}}>{трК(s.name)}</p><p className="text-[10px] mt-0.5" style={{color:MUTED}}>{s.dur&&`⏱ ${s.dur}`}{s.entry?` · 🎫 ${s.entry}`:""}</p></div><span className="text-[10px] font-semibold flex-shrink-0" style={{color:MUTED}}>{s.time}</span></div>
              {s.note&&<p className="text-xs mt-1.5 font-medium" style={{color:route.color}}>💡 {трК(s.note)}</p>}
            </div>
          </div>
        ))}
        <div className="flex gap-3 mb-3 mt-2">
          <button
            onClick={()=>{ if(перваяТочка) onПуть(перваяТочка.name, ""); }}
            disabled={!перваяТочка}
            className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            style={{background:route.color}}
          >▶ {t("d_start")}</button>
          <button
            onClick={()=>{ const стало = переключитьИзбранное({id:route.id,kind:"route",name:трК(route.title),city:трК(route.badge),img:"",rating:0}); onToast(стало?`💾 «${трК(route.title)}» — ${t("d_save")}`:`✕ «${трК(route.title)}»`); }}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold border transition-all active:scale-[0.98]"
            style={{color:route.color,borderColor:route.color,background:сохранён?мягко(route.color):SURFACE}}
          >{сохранён?"✓":"💾"} {t("d_save")}</button>
        </div>
        <BookingForm kind="tour" itemId={route.id} itemName={route.title} />
        <div className="pb-6" />
      </div>
    </div>
  );
}
