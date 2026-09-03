"use client";

import { useState } from "react";
import { BORDER, CREAM, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { LANGS } from "@/data/content";
import { GeomPattern, LogoMark } from "./ui";
import { useT } from "@/components/lang-provider";

export function SplashScreen({ onStart, onLogin }:{ onStart:()=>void; onLogin:()=>void }) {
  const { t } = useT();
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <img src="https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=800&h=1000&fit=crop&auto=format" alt="Регистан" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0" style={{background:"linear-gradient(180deg,rgba(46,125,90,0.5) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.82) 100%)"}}/>
      <div className="relative z-10 flex items-center gap-3 px-6 pt-16"><LogoMark size={44}/><div><p className="text-white text-2xl font-bold leading-none" style={{fontFamily:"'Fraunces',serif"}}>UzUp</p><p className="text-white/70 text-xs mt-0.5">Открой Узбекистан</p></div></div>
      <div className="relative z-10 flex justify-end px-4 mt-2"><GeomPattern opacity={0.22}/></div>
      <div className="relative z-10 mt-auto px-6 pb-12">
        <h1 className="text-white font-bold leading-tight mb-3" style={{fontSize:36,fontFamily:"'Fraunces',serif"}}>{t("splash_tagline")}</h1>
        <p className="text-white/75 text-sm mb-8 leading-relaxed">{t("splash_sub")}</p>
        <button onClick={onStart} className="w-full py-4 rounded-2xl text-base font-bold mb-3 flex items-center justify-center gap-2" style={{background:GREEN}}>
          <span className="text-white">{t("splash_start")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button onClick={onLogin} className="w-full py-3 rounded-2xl text-sm font-semibold border" style={{color:"white",borderColor:"rgba(255,255,255,0.3)"}}>{t("splash_login")}</button>
        <div className="flex justify-center gap-8 mt-8">{[["500+",t("splash_places")],["10",t("splash_langs")],["4.9",t("splash_rating")]].map(([v,l])=><div key={l} className="text-center"><p className="text-white font-bold text-lg leading-none" style={{fontFamily:"'Fraunces',serif"}}>{v}</p><p className="text-white/60 text-[10px] mt-0.5">{l}</p></div>)}</div>
      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export function OnboardingLang({ onNext, defaultLang }:{ onNext:(l:string)=>void; defaultLang?:string }) {
  // Предвыбран язык системы телефона: приложение ставят и иностранцы.
  const [sel, setSel] = useState(defaultLang ?? "🇷🇺 Русский");
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="relative h-52 flex-shrink-0" style={{background:GREEN}}>
        <div className="absolute inset-0 flex items-center justify-center opacity-15"><GeomPattern opacity={1}/></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3"><LogoMark size={52}/><p className="text-white text-2xl font-bold" style={{fontFamily:"'Fraunces',serif"}}>Добро пожаловать!</p><p className="text-white/70 text-sm">Выберите язык интерфейса</p></div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-5 space-y-2.5">
        {LANGS.map(l=>(
          <button key={l} onClick={()=>setSel(l)} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border" style={sel===l?{background:GREEN+"10",borderColor:GREEN}:{background:WHITE,borderColor:BORDER}}>
            <span className="text-base font-medium" style={{color:TEXT}}>{l}</span>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={sel===l?{borderColor:GREEN,background:GREEN}:{borderColor:BORDER}}>
              {sel===l&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
          </button>
        ))}
      </div>
      <div className="px-4 pb-8 pt-3">
        <button onClick={()=>onNext(sel)} className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2" style={{background:GREEN}}>Продолжить <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
        <div className="flex items-center justify-center gap-2 mt-4"><div className="w-6 h-1.5 rounded-full" style={{background:GREEN}}/><div className="w-1.5 h-1.5 rounded-full" style={{background:BORDER}}/></div>
      </div>
    </div>
  );
}

export function OnboardingInterests({ lang:_lang, onDone }:{ lang:string; onDone:()=>void }) {
  const [sel, setSel] = useState<string[]>(["История"]);
  const toggle=(v:string)=>setSel(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const items=[{e:"🏛️",l:"История"},{e:"🕌",l:"Мечети"},{e:"🏺",l:"Музеи"},{e:"🌿",l:"Природа"},{e:"🍽️",l:"Кухня"},{e:"🛍️",l:"Базары"},{e:"🏨",l:"Отели"},{e:"🎵",l:"Культура"},{e:"🚗",l:"Трекинг"},{e:"📸",l:"Фото"},{e:"🤝",l:"Местная жизнь"},{e:"🏇",l:"Спорт"}];
  return (
    <div className="flex flex-col h-full animate-slide-up" style={{background:CREAM}}>
      <div className="px-5 pt-14 pb-5 bg-white border-b" style={{borderColor:BORDER}}>
        <p className="text-xs font-medium mb-0.5" style={{color:GREEN,letterSpacing:"0.1em"}}>ШАГ 2 ИЗ 2</p>
        <h2 className="text-2xl font-bold" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>Что вас интересует?</h2>
        <p className="text-sm mt-1" style={{color:MUTED}}>AI подберёт маршруты под ваши интересы</p>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          {items.map(({e,l})=>(
            <button key={l} onClick={()=>toggle(l)} className="flex flex-col items-center gap-2 p-4 rounded-2xl border" style={sel.includes(l)?{background:GREEN,borderColor:GREEN}:{background:WHITE,borderColor:BORDER}}>
              <span className="text-2xl">{e}</span>
              <span className="text-xs font-semibold" style={{color:sel.includes(l)?WHITE:TEXT}}>{l}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-8 pt-3">
        <button onClick={onDone} disabled={sel.length===0} className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{background:GREEN}}>Начать исследование 🚀</button>
        <div className="flex items-center justify-center gap-2 mt-4"><div className="w-1.5 h-1.5 rounded-full" style={{background:BORDER}}/><div className="w-6 h-1.5 rounded-full" style={{background:GREEN}}/></div>
      </div>
    </div>
  );
}

// ── Overlays ──────────────────────────────────────────────────────────────────
