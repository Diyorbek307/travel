"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";
import { NOTIFS, SEARCH_POPULAR } from "@/data/content";
import { useAppContent } from "./content-provider";
import { GeomPattern, LogoMark, StarRow } from "./ui";
import { AnimatedBg } from "@/components/animated-bg";


export function NotifsPanel({ onClose }:{ onClose:()=>void }) {
  const { PLACES, POPULAR_CITIES } = useAppContent();
  const [notifs, setNotifs] = useState(NOTIFS);
  const unread = notifs.filter(n=>n.unread).length;
  return (
    <div className="overlay-screen absolute inset-0 z-50 flex flex-col animate-slide-up" style={{background:CREAM}}>
      <div className="bg-white px-4 pt-14 pb-3 border-b" style={{borderColor:BORDER}}>
        <div className="flex items-center justify-between">
          <div><h2 className="font-bold text-xl" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>Уведомления</h2>{unread>0&&<p className="text-xs mt-0.5" style={{color:GREEN}}>{unread} непрочитанных</p>}</div>
          <div className="flex items-center gap-3">
            {unread>0&&<button onClick={()=>setNotifs(p=>p.map(n=>({...n,unread:false})))} className="text-xs font-semibold" style={{color:GREEN}}>Прочитать все</button>}
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:CREAM}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-2.5">
        {notifs.map((n,i)=>(
          <button key={i} onClick={()=>setNotifs(p=>p.map((x,j)=>j===i?{...x,unread:false}:x))} className="w-full bg-white rounded-2xl p-4 border text-left flex items-start gap-3 shadow-sm" style={{borderColor:n.unread?GREEN:BORDER,borderWidth:n.unread?"1.5px":"1px"}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:n.unread?GREEN+"15":CREAM}}>{n.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2"><p className="font-bold text-sm" style={{color:TEXT}}>{n.title}</p>{n.unread&&<div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:GREEN}}/>}</div>
              <p className="text-xs mt-0.5 leading-relaxed" style={{color:MUTED}}>{n.body}</p>
              <p className="text-[10px] mt-1.5" style={{color:n.unread?GREEN:"#B0A090"}}>{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchModal({ onClose, onPlace }:{ onClose:()=>void; onPlace:(p:Place)=>void }) {
  const { PLACES, POPULAR_CITIES } = useAppContent();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{inputRef.current?.focus();},[]);
  useEffect(()=>{
    if(!query.trim()){setResults([]);return;}
    setResults(PLACES.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.city.toLowerCase().includes(query.toLowerCase())||p.type.toLowerCase().includes(query.toLowerCase())));
  },[query]);
  return (
    <div className="overlay-screen absolute inset-0 z-50 flex flex-col animate-slide-up" style={{background:CREAM}}>
      <div className="bg-white px-4 pt-14 pb-3 border-b" style={{borderColor:BORDER}}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-3" style={{background:CREAM}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Куда вы хотите поехать?" className="flex-1 text-sm bg-transparent outline-none" style={{color:TEXT}}/>
            {query&&<button onClick={()=>setQuery("")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
          </div>
          <button onClick={onClose} className="text-sm font-semibold flex-shrink-0" style={{color:GREEN}}>Отмена</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scroll p-4">
        {!query?(
          <>
            <p className="font-bold text-sm mb-3" style={{color:TEXT}}>Направления</p>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {POPULAR_CITIES.map(c=>(
                <button key={c.name} onClick={()=>setQuery(c.name)} className="relative rounded-2xl overflow-hidden text-left" style={{height:90}}>
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 65%)"}}/>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5"><p className="text-white font-bold text-sm">{c.name}</p><StarRow rating={c.rating}/></div>
                </button>
              ))}
            </div>
            <p className="font-bold text-sm mb-2.5" style={{color:TEXT}}>Популярные запросы</p>
            <div className="flex flex-wrap gap-2">
              {SEARCH_POPULAR.map(s=><button key={s} onClick={()=>setQuery(s)} className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium" style={{background:WHITE,borderColor:BORDER,color:TEXT}}>{s}</button>)}
            </div>
          </>
        ):results.length>0?(
          <div className="space-y-2.5">
            {results.map(p=>(
              <button key={p.id} onClick={()=>{onPlace(p);onClose();}} className="w-full flex gap-3 bg-white rounded-2xl overflow-hidden shadow-sm text-left border" style={{borderColor:BORDER}}>
                <div className="w-20 flex-shrink-0 bg-gray-100"><img src={p.img} alt={p.name} className="w-full h-full object-cover" style={{height:80}}/></div>
                <div className="flex-1 py-2.5 pr-3 min-w-0"><p className="font-bold text-sm" style={{color:TEXT}}>{p.name}</p><p className="text-xs mt-0.5" style={{color:MUTED}}>{p.city} · {p.type}</p><div className="flex items-center gap-3 mt-1.5"><StarRow rating={p.rating}/><span className="text-xs font-semibold" style={{color:GREEN}}>{p.entry}</span></div></div>
              </button>
            ))}
          </div>
        ):<div className="flex flex-col items-center justify-center py-16 text-center"><span className="text-5xl mb-3">🔍</span><p className="font-semibold" style={{color:TEXT}}>Ничего не найдено</p><p className="text-sm mt-1" style={{color:MUTED}}>Попробуйте другой запрос</p></div>}
      </div>
    </div>
  );
}

// ── Mini Audio Player ──────────────────────────────────────────────────────────

export function LoginModal({ onClose, onLogin }:{ onClose:()=>void; onLogin:()=>void }) {
  const { PLACES, POPULAR_CITIES } = useAppContent();
  const PROVIDERS = [
    { e:"🌐", label:"Продолжить с Google",    color:"#4285F4" },
    { e:"🍎", label:"Продолжить с Apple",     color:TEXT      },
    { e:"📧", label:"Войти по email",          color:GREEN         },
  ];
  return (
    <div className="overlay-screen absolute inset-0 z-50 flex flex-col animate-slide-up" style={{background:CREAM}}>
      <div className="relative overflow-hidden flex-shrink-0" style={{height:240,background:`linear-gradient(135deg,#0F3460 0%,#16213E 60%,#1A1A2E 100%)`}}>
        <div className="absolute inset-0 flex items-center justify-center opacity-10"><GeomPattern opacity={1}/></div>
        <div className="absolute inset-0 opacity-25"><AnimatedBg/></div>
        <button onClick={onClose} className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center z-10" style={{background:"rgba(255,255,255,0.12)"}}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <LogoMark size={52}/>
          <p className="text-white text-2xl font-bold mt-3" style={{fontFamily:"'Fraunces',serif"}}>UzUp</p>
          <p className="text-white/60 text-sm mt-1">Войди в аккаунт</p>
        </div>
      </div>
      <div className="flex-1 px-6 pt-8">
        <p className="text-center text-xs font-semibold mb-5 uppercase tracking-widest" style={{color:MUTED}}>Выберите способ входа</p>
        <div className="space-y-3 mb-6">
          {PROVIDERS.map(p=>(
            <button key={p.label} onClick={onLogin} className="w-full flex items-center gap-3 py-4 rounded-2xl border font-semibold text-sm transition-all active:scale-[0.98]" style={{background:WHITE,borderColor:BORDER,color:TEXT}}>
              <span className="text-xl ml-4">{p.e}</span>
              <span className="flex-1 text-left">{p.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" className="mr-4"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{background:BORDER}}/>
          <span className="text-xs" style={{color:MUTED}}>или</span>
          <div className="flex-1 h-px" style={{background:BORDER}}/>
        </div>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-semibold border" style={{color:MUTED,borderColor:BORDER}}>
          Продолжить без аккаунта
        </button>
        <p className="text-center text-[10px] mt-4 leading-relaxed" style={{color:MUTED}}>Нажимая «Войти», вы соглашаетесь<br/>с Условиями использования и Политикой конфиденциальности</p>
      </div>
    </div>
  );
}

// ── Currency Converter ─────────────────────────────────────────────────────────

export function PremiumModal({ onClose, onActivate }:{ onClose:()=>void; onActivate:()=>void }) {
  const { PLACES, POPULAR_CITIES } = useAppContent();
  const [plan, setPlan] = useState<"month"|"year">("year");
  const [идёт, setИдёт] = useState(false);
  const [нетОплаты, setНетОплаты] = useState(false);

  // Цены в сумах: платёжные системы Узбекистана считают в сумах, и
  // показывать доллар, а списывать сумы — сбивать человека с толку.
  const ЦЕНА = { month: 39000, year: 349000 } as const;

  /*
   * Ведём человека на страницу оплаты. Premium при этом сам не
   * включается: подтвердить платёж без секретного ключа и адреса для
   * оповещений нельзя, а включать подписку по одному факту «нажал
   * оплатить» — раздавать её даром. До настройки проверки платёж
   * отмечает администратор.
   */
  async function оплатить() {
    setИдёт(true);
    setНетОплаты(false);
    try {
      const r = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: ЦЕНА[plan], plan }),
      });
      const d = await r.json();
      if (d.available && d.url) {
        window.location.href = d.url;
      } else {
        setНетОплаты(true);
      }
    } catch {
      setНетОплаты(true);
    } finally {
      setИдёт(false);
    }
  }
  // Пока не пригодилось, но подключение premium остаётся на будущее.
  void onActivate;
  const PERKS=[
    {e:"🚫",t:"Без рекламы",s:"Никаких баннеров и объявлений"},
    {e:"🎧",t:"Все аудиогиды",s:"500+ гидов без ограничений"},
    {e:"🗺️",t:"Офлайн-карты",s:"Все города без интернета"},
    {e:"🤖",t:"AI-гид Pro",s:"Расширенные маршруты и рекомендации"},
    {e:"⚡",t:"Приоритет поддержки",s:"Ответ за 1 час"},
    {e:"🏷️",t:"Скидки партнёров",s:"До 25% в отелях и ресторанах"},
  ];
  return (
    <div className="overlay-screen absolute inset-0 z-50 flex flex-col animate-slide-up" style={{background:CREAM}}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-14 pb-6" style={{background:`linear-gradient(135deg,#1A1A2E 0%,#16213E 50%,#0F3460 100%)`}}>
        <div className="absolute inset-0 flex items-center justify-end opacity-10 pr-2"><GeomPattern opacity={1}/></div>
        <button onClick={onClose} className="absolute top-12 right-4 w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.1)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{background:GOLD}}>👑</div>
            <div><p className="text-white text-xl font-bold" style={{fontFamily:"'Fraunces',serif"}}>UzUp Premium</p><p className="text-white/60 text-xs">Без рекламы · Всё включено</p></div>
          </div>
          {/* Plan toggle */}
          <div className="flex rounded-2xl overflow-hidden border" style={{borderColor:"rgba(255,255,255,0.15)"}}>
            {(["month","year"] as const).map(p=>(
              <button key={p} onClick={()=>setPlan(p)} className="flex-1 py-3 text-center relative" style={plan===p?{background:GOLD}:{background:"rgba(255,255,255,0.06)"}}>
                {p==="year"&&<span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{background:"#E74C3C",color:WHITE}}>-40%</span>}
                <p className="font-bold text-sm" style={{color:plan===p?TEXT:WHITE}}>{p==="month"?"Месяц":"Год"}</p>
                <p className="text-[10px] mt-0.5" style={{color:plan===p?TEXT+"99":"rgba(255,255,255,0.5)"}}>{p==="month"?"39 000 сум/мес":"349 000 сум/год"}</p>
              </button>
            ))}
          </div>
          {plan==="year"&&<p className="text-center text-[10px] mt-2" style={{color:"rgba(255,255,255,0.5)"}}>≈ 29 000 сум/мес · выгода 119 000 сум</p>}
        </div>
      </div>
      {/* Perks */}
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pt-4">
        <p className="font-bold text-sm mb-3" style={{color:TEXT}}>Что входит в Premium</p>
        <div className="space-y-2.5 mb-4">
          {PERKS.map((p,i)=>(
            <div key={i} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border" style={{borderColor:BORDER}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:GREEN+"15"}}>{p.e}</div>
              <div><p className="font-bold text-sm" style={{color:TEXT}}>{p.t}</p><p className="text-[10px] mt-0.5" style={{color:MUTED}}>{p.s}</p></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" className="ml-auto flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-4 mb-4 border" style={{background:"#FFF9EE",borderColor:GOLD+"44"}}>
          <p className="text-xs font-semibold text-center" style={{color:MUTED}}>🔒 Отмена в любой момент · Безопасная оплата · Возврат 7 дней</p>
        </div>
        <button onClick={оплатить} disabled={идёт} className="w-full py-4 rounded-2xl font-bold text-base mb-2 disabled:opacity-60" style={{background:GOLD,color:TEXT}}>
          {идёт ? "Открываем оплату…" : `💳 Оплатить · ${plan==="month"?"39 000":"349 000"} сум`}
        </button>
        {нетОплаты&&(
          <p className="text-center text-[11px] leading-relaxed mb-2" style={{color:MUTED}}>
            Онлайн-оплата пока не подключена. Как только продавец добавит ключ Payme или Click, кнопка откроет страницу оплаты.
          </p>
        )}
        <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm" style={{color:MUTED}}>Остаться на бесплатной версии</button>
        <div className="pb-6"/>
      </div>
    </div>
  );
}

// ── Settings View ──────────────────────────────────────────────────────────────
