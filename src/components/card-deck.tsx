"use client";

import { useRef, useState } from "react";
import type { DeckItem, Place } from "@/lib/types";
import { BORDER, GOLD, GREEN, TEXT, WHITE } from "@/lib/theme";
import { POPULAR_CITIES, WEATHER } from "@/data/content";

export function CardDeckBase({ items, title, onSelect }:{ items:DeckItem[]; title:string; onSelect:(i:number)=>void }) {
  const [cur, setCur] = useState(0);
  const drag = useRef(0);
  const n = items.length;
  const go = (d:number) => setCur(c=>(c+d+n)%n);

  const card = (offset:number) => {
    const idx = (cur+offset+n)%n;
    const it  = items[idx];
    const cx  = offset===0;
    const abs = Math.abs(offset);
    const scale= cx?1:abs===1?0.85:0.74;
    const tx   = offset*52;         // px, relative to center
    const ty   = abs*8;
    const zi   = 10-abs*3;
    const dim  = cx?1:abs===1?0.6:0.38;
    return (
      <button key={`slot${offset}`}
        onClick={()=>cx?onSelect(idx):go(offset>0?1:-1)}
        className="absolute rounded-3xl overflow-hidden text-left"
        style={{
          width:218, height:308,
          left:"50%", marginLeft:-109,
          transform:`translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
          zIndex:zi,
          transition:"all 0.42s cubic-bezier(.22,1,.36,1)",
          filter:`brightness(${dim})`,
          boxShadow: cx?"0 28px 64px rgba(0,0,0,0.6),0 8px 24px rgba(0,0,0,0.4)":"0 6px 20px rgba(0,0,0,0.35)",
        }}>
        <div className="absolute inset-0">
          <img src={it.img} alt={it.title} className="w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.94) 0%,rgba(0,0,0,0.25) 50%,rgba(0,0,0,0.04) 100%)"}}/>
        </div>
        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{background:it.badgeColor,color:TEXT}}>{it.badge}</span>
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="flex items-center gap-1 mb-1">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-[8px]" style={{color:"rgba(255,255,255,0.5)"}}>{it.sub}</span>
          </div>
          <p className="text-white font-bold leading-tight mb-1" style={{fontSize:15,fontFamily:"'Fraunces',serif"}}>{it.title}</p>
          <div className="flex gap-4 mb-2.5 border-t pt-2" style={{borderColor:"rgba(255,255,255,0.1)"}}>
            {([[it.stat1,it.stat1l],[it.stat2,it.stat2l],[it.stat3,it.stat3l]] as [string,string][]).map(([v,l],si)=>(
              <div key={si}>
                <p className="text-white font-bold text-[11px]">{v}</p>
                <p className="text-[8px]" style={{color:"rgba(255,255,255,0.4)"}}>{l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px]" style={{color:"rgba(255,255,255,0.4)"}}>{it.pricel}</p>
              <p className="text-white font-bold text-sm">{it.price}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:cx?GOLD:"rgba(255,255,255,0.15)"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cx?TEXT:"white"} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-base" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>{title}</p>
        <div className="flex items-center gap-2">
          <button onClick={()=>go(-1)} className="w-7 h-7 rounded-full flex items-center justify-center border" style={{borderColor:BORDER,background:WHITE}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button onClick={()=>go(1)}  className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:GREEN}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
      <div className="relative"
        style={{height:334}}
        onTouchStart={e=>{ drag.current=e.touches[0].clientX; }}
        onTouchEnd={e=>{ const dx=e.changedTouches[0].clientX-drag.current; if(Math.abs(dx)>38) go(dx<0?1:-1); }}>
        <div className="absolute inset-0">
          {[-2,-1,0,1,2].map(o=>card(o))}
        </div>
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20">
          {items.map((_,i)=>(
            <button key={i} onClick={()=>setCur(i)} className="rounded-full transition-all" style={{width:i===cur?14:4,height:4,background:i===cur?GOLD:"rgba(0,0,0,0.2)"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardDeck({ places, onPlace }:{ places:Place[]; onPlace:(p:Place)=>void }) {
  const items: DeckItem[] = places.map(p=>({
    img:      p.img,
    title:    p.name,
    sub:      `${p.city} · Узбекистан`,
    badge:    p.type,
    badgeColor:"rgba(233,196,106,0.92)",
    stat1:    p.distance,   stat1l:"Расст.",
    stat2:    WEATHER[p.city]?`${WEATHER[p.city].temp}°`:"—", stat2l:"Темп.",
    stat3:    `${p.rating}★`, stat3l:"Рейтинг",
    price:    p.entry,      pricel:"Вход",
  }));
  return <CardDeckBase items={items} title="Топ достопримечательности" onSelect={i=>onPlace(places[i])}/>;
}

export function CityDeck({ onSearch }:{ onSearch:()=>void }) {
  const CITY_ITEMS: DeckItem[] = POPULAR_CITIES.map(c=>({
    img:      c.img,
    title:    c.name,
    sub:      `${c.sub} · Узбекистан`,
    badge:    "🏙️ Город",
    badgeColor:"rgba(46,125,90,0.85)",
    stat1:    WEATHER[c.name]?`${WEATHER[c.name].temp}°`:"—", stat1l:"Сейчас",
    stat2:    WEATHER[c.name]?WEATHER[c.name].cond:"—", stat2l:"Погода",
    stat3:    `${c.rating}★`, stat3l:"Рейтинг",
    price:    "Открыть", pricel:"Направление",
  }));
  return <CardDeckBase items={CITY_ITEMS} title="Популярные города" onSelect={onSearch}/>;
}

// ── Side Menu ─────────────────────────────────────────────────────────────────
