import type { PublicUser, Tab } from "@/lib/types";
import { useT } from "@/components/lang-provider";
import type { TKey } from "@/lib/i18n";
import { GOLD, GREEN } from "@/lib/theme";
import { LogoMark } from "./ui";

export function SideMenu({ onClose, onTab, currentTab, isPremium, onPremium, onLogout, user }:{
  onClose:()=>void; onTab:(t:Tab)=>void; currentTab:Tab; isPremium:boolean; onPremium:()=>void; onLogout:()=>void; user:PublicUser|null;
}) {
  const { t } = useT();
  const NAV:[Tab,string,TKey][] = [
    ["home",   "🏠","nav_home"],
    ["explore","🔍","nav_explore"],
    ["map",    "🗺️","nav_map"],
    ["audio",  "🎧","nav_audio"],
    ["profile","👤","nav_profile"],
  ];
  // Счётчиков у пунктов больше нет: «12 избранных» при пустом списке —
  // выдумка, а раздел избранного ещё не ведётся.
  const EXTRAS:[string,TKey,Tab|null][] = [
    ["❤️","menu_favorites","explore"],
    ["📋","menu_my_routes","map"    ],
    ["⬇️","menu_downloads","audio"  ],
    ["💱","cur_title",     "profile"],
    ["🆘","menu_emergency","profile"],
  ];
  const имя = user ? `${user.firstName} ${user.lastName}`.trim() : "—";
  const откуда = user?.country || "";
  return (
    <>
      <div className="absolute inset-0 z-40" style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)"}} onClick={onClose}/>
      <div className="absolute top-0 left-0 bottom-0 z-50 flex flex-col slide-in-left" style={{width:290,background:"#0F1A14"}}>
        {/* Header */}
        <div className="px-5 pt-14 pb-5 border-b" style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <LogoMark size={36}/>
              <div>
                <p className="text-white font-bold text-lg" style={{fontFamily:"'Fraunces',serif"}}>UzUp</p>
                <p className="text-[10px]" style={{color:GOLD}}>{t("splash_tagline")}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.08)"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* User */}
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{background:"rgba(255,255,255,0.06)"}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:`linear-gradient(135deg,${GREEN},#66B38E)`}}>👤</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm truncate">{имя}</p>
              {откуда&&<p className="text-[10px] truncate" style={{color:"rgba(255,255,255,0.45)"}}>{откуда}</p>}
            </div>
            {isPremium&&<span className="text-sm">👑</span>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto hide-scroll py-3">
          {/* Main nav */}
          <p className="px-5 text-[9px] font-bold tracking-widest uppercase mb-2" style={{color:"rgba(255,255,255,0.3)"}}>{t("menu_nav")}</p>
          {NAV.map(([таб,e,k])=>(
            <button key={таб} onClick={()=>{onTab(таб);onClose();}} className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all" style={currentTab===таб?{background:`${GREEN}22`,borderRight:`3px solid ${GREEN}`}:{borderRight:"3px solid transparent"}}>
              <span className="text-lg w-6">{e}</span>
              <span className="font-semibold text-sm" style={{color:currentTab===таб?GREEN:"rgba(255,255,255,0.75)"}}>{t(k)}</span>
              {currentTab===таб&&<div className="ml-auto w-1.5 h-1.5 rounded-full" style={{background:GREEN}}/>}
            </button>
          ))}
          <div className="mx-5 my-3 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}/>
          <p className="px-5 text-[9px] font-bold tracking-widest uppercase mb-2" style={{color:"rgba(255,255,255,0.3)"}}>{t("menu_more")}</p>
          {EXTRAS.map(([e,k,target])=>(
            <button key={k} onClick={()=>{if(target){onTab(target);onClose();}}} className="w-full flex items-center gap-3 px-5 py-3 text-left active:opacity-70">
              <span className="text-lg w-6">{e}</span>
              <span className="flex-1 font-medium text-sm" style={{color:"rgba(255,255,255,0.65)"}}>{t(k)}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ))}
          <div className="mx-5 my-3 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}/>
          {/* Premium */}
          {!isPremium&&(
            <button onClick={()=>{onPremium();onClose();}} className="mx-4 w-[calc(100%-32px)] rounded-2xl p-4 flex items-center gap-3 glow-pulse" style={{background:`linear-gradient(135deg,#1A1A2E,#2C1810)`}}>
              <span className="text-2xl">👑</span>
              <div className="text-left flex-1">
                <p className="font-bold text-sm" style={{color:GOLD}}>UzUp Premium</p>
                <p className="text-[9px]" style={{color:"rgba(255,255,255,0.45)"}}>{t("pay_no_ads")} · $4.99/{t("pay_month")}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>
        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <div className="flex items-center justify-between">
            <p className="text-[10px]" style={{color:"rgba(255,255,255,0.25)"}}>UzUp v2.4.1 · 🇺🇿 {t("menu_made")}</p>
            <button onClick={()=>{onClose();onLogout();}} className="text-[10px] font-semibold" style={{color:"rgba(255,255,255,0.45)"}}>🚪 {t("prof_logout")}</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Home Screen ────────────────────────────────────────────────────────────────

export default SideMenu;
