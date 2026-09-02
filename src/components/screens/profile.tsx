"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { PremiumModal } from "@/components/modals";
import SupportChat from "@/components/support-chat";
import MyBookings from "@/components/my-bookings";
import { BORDER, CREAM, GOLD, GREEN, GREEN_LIGHT, MUTED, TEXT, WHITE } from "@/lib/theme";
import { ACHIEVEMENTS, AI_REPLIES, LANGS, STAMPS } from "@/data/content";
import { Badge } from "../ui";
import { CurrencyConverter } from "@/components/screens/practical";
import { AdBanner } from "@/components/widgets";


export function SettingsView({ isPremium, onUpgrade, onLogout }:{ isPremium:boolean; onUpgrade:()=>void; onLogout:()=>void }) {
  const [lang, setLang] = useState("🇷🇺 Русский");
  const [notifNew,   setNotifNew]   = useState(true);
  const [notifNear,  setNotifNear]  = useState(true);
  const [notifDeals, setNotifDeals] = useState(false);
  const [notifNews,  setNotifNews]  = useState(true);
  const [offline,    setOffline]    = useState(true);
  const [gps,        setGps]        = useState(true);
  const [darkMode,   setDarkMode]   = useState(false);
  const [autoPlay,   setAutoPlay]   = useState(false);
  const [units,      setUnits]      = useState<"metric"|"imperial">("metric");
  const [mapStyle,   setMapStyle]   = useState<"diorama"|"sat">("diorama");
  const [currency,   setCurrency]   = useState("USD");

  const Toggle=({on,set}:{on:boolean;set:(v:boolean)=>void})=>(
    <button onClick={()=>set(!on)} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0" style={{background:on?GREEN:BORDER}}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{left:on?"22px":"2px"}}/>
    </button>
  );
  const Row=({icon,label,sub,right}:{icon:string;label:string;sub?:string;right:React.ReactNode})=>(
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{borderColor:"#F0EBE1"}}>
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0"><p className="text-sm font-medium" style={{color:TEXT}}>{label}</p>{sub&&<p className="text-[10px]" style={{color:MUTED}}>{sub}</p>}</div>
      {right}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto hide-scroll p-4 animate-fade-in space-y-3">

      {/* Premium banner if not subscribed */}
      {!isPremium&&(
        <button onClick={onUpgrade} className="w-full rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all" style={{background:`linear-gradient(135deg,#1A1A2E,#0F3460)`}}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:GOLD}}>👑</div>
          <div className="flex-1"><p className="text-white font-bold text-sm">UzUp Premium</p><p className="text-white/60 text-xs">Без рекламы · Все функции · Офлайн</p></div>
          <div className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{background:GOLD,color:TEXT}}>$4.99</div>
        </button>
      )}
      {isPremium&&(
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{background:`linear-gradient(135deg,#1A1A2E,#0F3460)`}}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{background:GOLD}}>👑</div>
          <div><p className="text-white font-bold text-sm">UzUp Premium активен</p><p className="text-white/50 text-xs">Действует до 30 авг 2027</p></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" className="ml-auto"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}

      {/* Language */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-2 uppercase tracking-widest" style={{color:MUTED}}>Язык</p>
        <div className="grid grid-cols-2 gap-2 pb-3">
          {LANGS.map(l=>(
            <button key={l} onClick={()=>setLang(l)} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-left" style={lang===l?{background:GREEN+"12",borderColor:GREEN}:{background:CREAM,borderColor:"transparent"}}>
              <span className="text-base leading-none">{l.split(" ")[0]}</span>
              <span className="text-xs font-medium truncate" style={{color:lang===l?GREEN:TEXT}}>{l.split(" ").slice(1).join(" ")}</span>
              {lang===l&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" className="ml-auto flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>Уведомления</p>
        <Row icon="📍" label="Рядом с достопримечательностью" sub="GPS-триггер при приближении" right={<Toggle on={notifNear} set={setNotifNear}/>}/>
        <Row icon="🎫" label="События и скидки" sub="Акции партнёров и фестивали" right={<Toggle on={notifDeals} set={setNotifDeals}/>}/>
        <Row icon="🆕" label="Новые маршруты и гиды" right={<Toggle on={notifNew} set={setNotifNew}/>}/>
        <Row icon="📰" label="Новости Узбекистана" right={<Toggle on={notifNews} set={setNotifNews}/>}/>
      </div>

      {/* Карта и навигация */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>Карта и навигация</p>
        <Row icon="🗺️" label="Стиль карты" right={
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:BORDER}}>
            {(["diorama","sat"] as const).map(s=><button key={s} onClick={()=>setMapStyle(s)} className="px-2.5 py-1 text-[10px] font-bold" style={mapStyle===s?{background:GREEN,color:WHITE}:{background:CREAM,color:MUTED}}>{s==="diorama"?"3D":"Спутник"}</button>)}
          </div>
        }/>
        <Row icon="📡" label="GPS-аудиогид" sub="Автозапуск при приближении" right={<Toggle on={gps} set={setGps}/>}/>
        <Row icon="⬇️" label="Офлайн-карты" sub="Скачать для работы без сети" right={<Toggle on={offline} set={setOffline}/>}/>
        <Row icon="📏" label="Единицы" right={
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:BORDER}}>
            {(["metric","imperial"] as const).map(u=><button key={u} onClick={()=>setUnits(u)} className="px-2.5 py-1 text-[10px] font-bold" style={units===u?{background:GREEN,color:WHITE}:{background:CREAM,color:MUTED}}>{u==="metric"?"км":"миль"}</button>)}
          </div>
        }/>
      </div>

      {/* Внешний вид */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>Внешний вид</p>
        <Row icon="🌙" label="Тёмная тема" sub="Бережёт батарею ночью" right={<Toggle on={darkMode} set={setDarkMode}/>}/>
        <Row icon="🎵" label="Автовоспроизведение аудио" sub="При открытии места" right={<Toggle on={autoPlay} set={setAutoPlay}/>}/>
        <Row icon="💱" label="Валюта по умолчанию" right={
          <select value={currency} onChange={e=>setCurrency(e.target.value)} className="text-xs font-bold px-2 py-1 rounded-lg outline-none border" style={{color:GREEN,borderColor:BORDER,background:CREAM}}>
            {["USD","EUR","RUB","GBP","KRW","CNY","JPY"].map(c=><option key={c}>{c}</option>)}
          </select>
        }/>
      </div>

      {/* Аккаунт */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>Аккаунт</p>
        {[{e:"👤",l:"Редактировать профиль"},{e:"🔐",l:"Безопасность и пароль"},{e:"🔗",l:"Связанные аккаунты"},{e:"📊",l:"Мои данные и конфиденциальность"},{e:"🗑️",l:"Удалить аккаунт"}].map((item,i)=>(
          <Row key={i} icon={item.e} label={item.l} right={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}/>
        ))}
      </div>

      {/* Поддержка */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>Поддержка</p>
        {[{e:"❓",l:"Помощь и FAQ"},{e:"💬",l:"Написать в поддержку"},{e:"⭐",l:"Оценить приложение"},{e:"📢",l:"Поделиться UzUp"},{e:"📄",l:"Условия использования"},{e:"🔒",l:"Политика конфиденциальности"}].map((item,i)=>(
          <Row key={i} icon={item.e} label={item.l} right={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}/>
        ))}
      </div>

      {/* О приложении */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>О приложении</p>
        <Row icon="📱" label="Версия приложения" right={<span className="text-xs font-mono" style={{color:MUTED}}>2.4.1</span>}/>
        <Row icon="🔄" label="Проверить обновления" right={<span className="text-xs font-bold" style={{color:GREEN}}>Обновлено</span>}/>
        <Row icon="🌍" label="UzUp — Made in Uzbekistan" right={<span className="text-base">🇺🇿</span>}/>
      </div>

      <button onClick={onLogout} className="w-full py-3.5 rounded-2xl text-sm font-bold border mb-1 active:scale-[0.98] transition-all" style={{color:"#E74C3C",borderColor:"#FCDADA",background:"#FFF5F5"}}>
        🚪 Выйти из аккаунта
      </button>
      <div className="pb-6"/>
    </div>
  );
}

export function ProfileScreen({ onLogout }:{ onLogout:()=>void }) {
  const [view, setView] = useState<"passport"|"bookings"|"support"|"chat"|"stats"|"settings">("passport");
  const [isPremium, setIsPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{role:"ai",text:"Assalomu alaykum! 👋 Я ваш AI-гид. Спрашивайте всё — история, маршруты, рестораны, транспорт, валюта!",time:"09:41"}]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const QUICK=["Что рядом?","История Регистана","Лучшие рестораны?","Что бесплатно?","Как добраться до Бухары?","Где переночевать?","Курс валюты?","Транспорт в Самарканде?"];
  const sendMsg=useCallback((t:string)=>{
    const now=new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
    setMessages(p=>[...p,{role:"user",text:t,time:now}]);
    setInput("");setTyping(true);
    setTimeout(()=>{const r=AI_REPLIES[t]??"Отличный вопрос! Рекомендую посещать рано утром — свет, тишина, минимум туристов.";setMessages(p=>[...p,{role:"ai",text:r,time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})}]);setTyping(false);},1400);
  },[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,typing]);

  const TABS:[string,string,string][] = [["passport","🪪","Паспорт"],["bookings","🎫","Заявки"],["support","💬","Поддержка"],["chat","🤖","AI-гид"],["stats","📊","Стат."],["settings","⚙️","Настройки"]];

  return (
    <div className="flex flex-col h-full" style={{background:CREAM}}>
      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)} onActivate={()=>{setIsPremium(true);setShowPremium(false);}}/>}

      <div className="px-4 pt-14 pb-3 bg-white border-b" style={{borderColor:BORDER}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:`linear-gradient(135deg,${GREEN},#66B38E)`}}>👤</div>
            {isPremium&&<div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{background:GOLD}}>👑</div>}
          </div>
          <div className="flex-1">
            <p className="font-bold text-base" style={{color:TEXT,fontFamily:"'Fraunces',serif"}}>Алекс Джонсон</p>
            <p className="text-xs" style={{color:MUTED}}>🌍 Турист из Нью-Йорка · Уровень 3</p>
            <div className="flex gap-1.5 mt-1">
              <Badge text="EXPLORER" color={GREEN}/>
              <Badge text="3 штампа" color={GOLD}/>
              {isPremium&&<Badge text="PREMIUM" color="#1A1A2E"/>}
            </div>
          </div>
          {!isPremium&&<button onClick={()=>setShowPremium(true)} className="px-3 py-1.5 rounded-xl text-[10px] font-bold" style={{background:`linear-gradient(135deg,#1A1A2E,#0F3460)`,color:GOLD}}>👑 Pro</button>}
        </div>
        <div className="flex gap-1.5">
          {TABS.map(([v,e,l])=><button key={v} onClick={()=>setView(v as typeof view)} className="flex-1 py-2 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5" style={view===v?{background:GREEN,color:WHITE}:{background:CREAM,color:MUTED}}><span>{e}</span><span>{l}</span></button>)}
        </div>
      </div>

      {view==="passport"&&(
        <div className="flex-1 overflow-y-auto hide-scroll animate-fade-in">
          <AdBanner isPremium={isPremium}/>
          <div className="px-4">
            <div className="rounded-3xl overflow-hidden mb-4 shadow-lg" style={{background:`linear-gradient(135deg,#1A5C3A 0%,${GREEN} 55%,${GREEN_LIGHT} 100%)`}}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4"><div><p className="text-[9px] font-bold tracking-widest uppercase" style={{color:GOLD}}>UzUp · Uzbekistan Travel</p><p className="text-white text-xl mt-0.5" style={{fontFamily:"'Fraunces',serif",fontWeight:600}}>Цифровой Паспорт</p></div><div className="text-right"><p className="text-white/40 text-[9px]">ПАСПОРТ №</p><p className="text-[10px] font-mono font-bold" style={{color:GOLD}}>UZT-2026-0841</p></div></div>
                <div className="flex items-center gap-3 rounded-2xl p-3" style={{background:"rgba(255,255,255,0.12)"}}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:"rgba(255,255,255,0.15)"}}>👤</div>
                  <div><p className="text-white font-semibold text-sm">Алекс Джонсон</p><p className="text-white/60 text-xs">3 штампа · 3 осталось</p></div>
                  <div className="ml-auto flex-shrink-0"><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={GOLD} strokeWidth="2" strokeDasharray="56.5 56.5" strokeDashoffset="28.3" transform="rotate(-90 20 20)"/><text x="20" y="25" textAnchor="middle" fill={GOLD} fontSize="11" fontWeight="bold">50%</text></svg></div>
                </div>
              </div>
              <div className="h-6 flex border-t" style={{borderColor:"rgba(255,255,255,0.1)"}}>{Array.from({length:20}).map((_,i)=><div key={i} className="flex-1 flex items-center justify-center" style={{opacity:0.22}}><div className="w-1.5 h-1.5 rotate-45" style={{background:GOLD}}/></div>)}</div>
            </div>
            <p className="font-bold text-sm mb-3" style={{color:TEXT}}>Коллекция штампов</p>
            <div className="grid grid-cols-3 gap-2.5 mb-4">{STAMPS.map((s,i)=><div key={i} className="rounded-2xl p-3 aspect-square flex flex-col items-center justify-center text-center shadow-sm" style={s.earned?{background:GREEN}:{background:WHITE,border:`2px dashed ${BORDER}`}}><span className="text-2xl mb-1">{s.icon}</span><p className="font-bold text-[9px] leading-tight" style={{color:s.earned?WHITE:MUTED}}>{s.name}</p><p className="text-[8px] mt-0.5" style={{color:s.earned?GOLD:"#C0B0A0"}}>{s.earned?s.date:"Не посещено"}</p></div>)}</div>
            <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}><div className="flex items-center justify-between mb-2"><p className="font-semibold text-sm" style={{color:TEXT}}>Прогресс</p><p className="text-sm font-bold" style={{color:GREEN}}>3/6</p></div><div className="rounded-full h-2" style={{background:CREAM}}><div className="h-2 rounded-full" style={{background:GREEN,width:"50%"}}/></div><p className="text-xs mt-2" style={{color:MUTED}}>Ещё 2 штампа → скидка 15% у партнёров</p></div>
            <div className="rounded-2xl p-4 mb-4" style={{background:`linear-gradient(135deg,${GOLD},#C17B2F)`}}><p className="font-bold text-sm" style={{color:TEXT}}>🎁 5 штампов = скидка 15%</p><p className="text-xs mt-1" style={{color:TEXT+"99"}}>У партнёров: отели, рестораны, музеи</p></div>
            <p className="font-bold text-sm mb-3" style={{color:TEXT}}>Достижения</p>
            <div className="grid grid-cols-3 gap-2.5 pb-4">{ACHIEVEMENTS.map((a,i)=><div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border" style={{borderColor:BORDER,opacity:a.earned?1:0.55}}><div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1.5 mx-auto" style={{background:a.color+"18"}}>{a.emoji}</div><p className="text-[9px] font-semibold leading-tight" style={{color:TEXT}}>{a.title}</p><p className="text-[8px] mt-0.5" style={{color:a.earned?GREEN:MUTED}}>{a.earned?"✓ Получено":"В процессе"}</p></div>)}</div>
          </div>
        </div>
      )}
      {view==="chat"&&(
        <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
          <div className="flex-1 overflow-y-auto hide-scroll px-4 py-3 space-y-3">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                {m.role==="ai"&&<div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-white text-[10px] font-bold" style={{background:GREEN}}>AI</div>}
                <div className="max-w-[78%] rounded-2xl px-4 py-3 shadow-sm" style={m.role==="user"?{background:GREEN,color:WHITE,borderTopRightRadius:4}:{background:WHITE,color:TEXT,border:`1px solid ${BORDER}`,borderTopLeftRadius:4}}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
                  <p className="text-[10px] mt-1.5" style={{color:m.role==="user"?"rgba(255,255,255,0.5)":MUTED}}>{m.time}</p>
                </div>
              </div>
            ))}
            {typing&&<div className="flex"><div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 text-white text-[10px] font-bold" style={{background:GREEN}}>AI</div><div className="bg-white rounded-2xl rounded-tl px-4 py-3 shadow-sm border" style={{borderColor:BORDER,borderTopLeftRadius:4}}><div className="flex gap-1.5 items-center h-4">{[0,150,300].map(d=><span key={d} className="w-2 h-2 rounded-full bounce-dot" style={{background:GREEN,animationDelay:`${d}ms`}}/>)}</div></div></div>}
            <div ref={bottomRef}/>
          </div>
          <div className="px-4 pb-2"><div className="flex gap-2 overflow-x-auto hide-scroll">{QUICK.map((q,i)=><button key={i} onClick={()=>sendMsg(q)} className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium bg-white border" style={{color:TEXT,borderColor:BORDER}}>{q}</button>)}</div></div>
          <div className="px-4 pb-5 pt-2"><div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border" style={{borderColor:BORDER}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&input.trim()&&sendMsg(input.trim())} placeholder="Спросите что угодно…" className="flex-1 text-sm bg-transparent outline-none" style={{color:TEXT}}/><button onClick={()=>input.trim()&&sendMsg(input.trim())} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:GREEN}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div></div>
        </div>
      )}
      {view==="stats"&&(
        <div className="flex-1 overflow-y-auto hide-scroll animate-fade-in">
          <AdBanner isPremium={isPremium}/>
          <div className="px-4 space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3">{[{e:"🏙️",v:"3",l:"Города"},{e:"📍",v:"12",l:"Мест"},{e:"🛣️",v:"847 км",l:"Пройдено"},{e:"🎧",v:"24",l:"Аудиогидов"}].map(s=><div key={s.l} className="bg-white rounded-2xl p-4 shadow-sm border text-center" style={{borderColor:BORDER}}><p className="text-3xl mb-1">{s.e}</p><p className="text-2xl font-bold" style={{color:GREEN,fontFamily:"'Fraunces',serif"}}>{s.v}</p><p className="text-xs mt-0.5" style={{color:MUTED}}>{s.l}</p></div>)}</div>
            <CurrencyConverter/>
            <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-3" style={{color:TEXT}}>Активность</p>{[{e:"🕌",a:"Посетил",p:"Площадь Регистан",t:"Сегодня, 09:30"},{e:"🎧",a:"Слушал",p:"Гид Шахи-Зинда",t:"Сегодня, 11:15"},{e:"✅",a:"Завершил",p:"Самарканд за 1 день",t:"12 авг"}].map((a,i)=><div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{borderColor:"#F0EBE1"}}><span className="text-lg">{a.e}</span><div className="flex-1"><p className="text-sm" style={{color:TEXT}}><span style={{color:MUTED}}>{a.a}</span> {a.p}</p><p className="text-xs" style={{color:"#B0A090"}}>{a.t}</p></div></div>)}</div>
            <div className="rounded-2xl p-4" style={{background:"#1A1410"}}><p className="font-bold text-sm mb-3" style={{color:GOLD}}>🆘 Экстренная помощь</p><div className="grid grid-cols-2 gap-2">{[{l:"Полиция",n:"102",e:"👮"},{l:"Скорая",n:"103",e:"🚑"},{l:"Пожарная",n:"101",e:"🚒"},{l:"Туристам",n:"1322",e:"ℹ️"}].map(s=><button key={s.l} className="rounded-xl p-3 text-left" style={{background:"rgba(255,255,255,0.08)"}}><span className="text-xl">{s.e}</span><p className="text-white text-xs font-semibold mt-1">{s.l}</p><p className="text-sm font-bold font-mono" style={{color:GOLD}}>{s.n}</p></button>)}</div><button className="mt-3 w-full py-3 rounded-xl text-sm font-bold bg-red-600 text-white flex items-center justify-center gap-2"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Отправить геолокацию</button></div>
          </div>
        </div>
      )}
      {view==="bookings"&&<MyBookings/>}
      {view==="support"&&<SupportChat onBack={()=>setView("passport")}/>}
      {view==="settings"&&<SettingsView isPremium={isPremium} onUpgrade={()=>setShowPremium(true)} onLogout={onLogout}/>}
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────

export default ProfileScreen;
