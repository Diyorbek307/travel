"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, PublicUser } from "@/lib/types";
import { PremiumModal } from "@/components/modals";
import SupportChat from "@/components/support-chat";
import MyBookings from "@/components/my-bookings";
import { ACCENT_FILL, BORDER, CREAM, GOLD, GREEN, MUTED, TEXT, WHITE, SURFACE, ACCENT_SOFT, ACCENT_DEEP, ON_GOLD, мягко } from "@/lib/theme";
import { ACHIEVEMENTS, AI_REPLIES, STAMPS, type УсловиеДостижения } from "@/data/content";
import { useListened, useOpenedPlaces, useVisits } from "@/lib/visits";
import { useAppContent } from "@/components/content-provider";
import { useCurrency } from "@/components/currency-provider";
import { useFavorites } from "@/lib/favorites";
import { useTrip } from "@/lib/trip";
import { useSettings, задатьНастройку } from "@/lib/settings";
import EmergencyCard from "@/components/emergency-card";
import { useT } from "@/components/lang-provider";
import { LOCALE_META, LOCALES, type TKey, датаСловами } from "@/lib/i18n";
import { Badge } from "../ui";
import { CurrencyConverter } from "@/components/screens/practical";
import { AdInline } from "@/components/ads";
import { faqТексты, условияТекст, политикаТекст } from "@/data/legal";


/** Переключатель настройки. */
function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={()=>set(!on)} role="switch" aria-checked={on} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0" style={{background:on?ACCENT_FILL:BORDER}}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-all" style={{left:on?"22px":"2px",background:"#fff"}}/>
    </button>
  );
}

/** Строка настроек: значок, подпись и что-то справа. С onClick — кнопка. */
function Row({ icon, label, sub, right, onClick }: { icon: string; label: string; sub?: string; right: React.ReactNode; onClick?: () => void }) {
  const внутри=(<>
    <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
    <div className="flex-1 min-w-0 text-left"><p className="text-sm font-medium" style={{color:TEXT}}>{label}</p>{sub&&<p className="text-[10px]" style={{color:MUTED}}>{sub}</p>}</div>
    {right}
  </>);
  return onClick
    ? <button onClick={onClick} className="w-full flex items-center gap-3 py-3 border-b last:border-0 active:opacity-60 transition-opacity" style={{borderColor:BORDER}}>{внутри}</button>
    : <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{borderColor:BORDER}}>{внутри}</div>;
}

export function SettingsView({ isPremium, user, onUpgrade, onLogout, onSupport }:{ isPremium:boolean; user:PublicUser|null; onUpgrade:()=>void; onLogout:()=>void; onSupport:()=>void }) {
  const { t, lang, setLang } = useT();
  // Какая подробная панель открыта поверх настроек.
  type Панель = null | "faq" | "terms" | "privacy" | "edit" | "linked" | "delete" | "rate";
  const [панель, setПанель] = useState<Панель>(null);
  const [сообщение, setСообщение] = useState("");
  const [обновление, setОбновление] = useState<null | "checking" | "current" | "available">(null);
  const [форма, setФорма] = useState({ firstName: "", lastName: "", country: "", phone: "" });
  const [оценка, setОценка] = useState(0);
  // Новое фото профиля (data-URL) или null — значит не меняли.
  const [новоеФото, setНовоеФото] = useState<string | null>(null);
  const файлФото = useRef<HTMLInputElement>(null);

  // Сжимаем снимок в квадрат 320px — как при регистрации, чтобы не
  // грузить в базу мегабайты.
  const выбратьФото = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const сторона = 320;
        const c = document.createElement("canvas");
        c.width = c.height = сторона;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, сторона, сторона);
        setНовоеФото(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const тост = (m: string) => { setСообщение(m); setTimeout(() => setСообщение(""), 2400); };

  // Поделиться приложением: системное окно, если есть; иначе — копия ссылки.
  const поделиться = async () => {
    const url = typeof location !== "undefined" ? location.origin : "https://uzbekistan-travel.onrender.com";
    try {
      if (navigator.share) { await navigator.share({ title: "HelloUZ", url }); return; }
      await navigator.clipboard.writeText(url);
      тост(t("share_copied"));
    } catch { /* человек закрыл окно «Поделиться» — это не ошибка */ }
  };

  // Проверка обновлений: сравниваем сборку в приложении с той, что на
  // сервере. Разошлись — предлагаем перезагрузиться.
  const проверитьОбновления = async () => {
    setОбновление("checking");
    try {
      const h = await fetch("/api/health", { cache: "no-store" }).then(r => r.json());
      const текущая = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
      setОбновление(h?.build && h.build !== текущая ? "available" : "current");
    } catch {
      setОбновление("current");
    }
  };

  // Скачать свои данные: то, что о человеке знает приложение.
  const скачатьДанные = () => {
    const данные = {
      профиль: user,
      настройки: (() => { try { return JSON.parse(localStorage.getItem("uzup.settings") || "{}"); } catch { return {}; } })(),
      избранное: (() => { try { return JSON.parse(localStorage.getItem("uzup.favorites") || "[]"); } catch { return []; } })(),
      маршрут: (() => { try { return JSON.parse(localStorage.getItem("uzup.trip") || "[]"); } catch { return []; } })(),
      посещения: (() => { try { return JSON.parse(localStorage.getItem("uzup.visits") || "{}"); } catch { return {}; } })(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(данные, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "hellouz-my-data.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // Сохранить правку профиля на сервере.
  const сохранитьПрофиль = async () => {
    try {
      const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(новоеФото ? { ...форма, photo: новоеФото } : форма) });
      // «Сохранено» только если сервер и правда сохранил: раньше тост
      // выходил и тогда, когда он отказал (например, из-за фото).
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        тост(d.error === "photo_too_large" ? t("e_photo_large") : t("prof_save_failed"));
        return;
      }
      тост(t("prof_saved_ok"));
      setПанель(null);
      setНовоеФото(null);
      // Перечитываем профиль, чтобы имя и фото сразу обновились.
      setTimeout(() => location.reload(), 600);
    } catch { тост(t("err_network")); }
  };

  // Смена пароля: письмо со ссылкой на почту аккаунта.
  const сброситьПароль = async () => {
    if (!user?.email) return;
    try {
      await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email }) });
      тост(t("sec_reset_sent"));
    } catch { тост(t("err_network")); }
  };

  // Удаление аккаунта. Выходим, только когда сервер подтвердил: иначе
  // человек решил бы, что аккаунта больше нет, а он остался.
  const удалитьАккаунт = async () => {
    const res = await fetch("/api/auth/me", { method: "DELETE" }).catch(() => null);
    setПанель(null);
    if (res?.ok) onLogout();
    else тост(t("del_failed"));
  };

  const открытьПравку = () => {
    setФорма({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", country: user?.country ?? "", phone: user?.phone ?? "" });
    setНовоеФото(null);
    setПанель("edit");
  };

  const отправитьОценку = async (n: number) => {
    setОценка(n);
    try { await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `★ ${n}/5` }) }); } catch { /* не критично */ }
    setTimeout(() => { setПанель(null); setОценка(0); тост(t("rate_thanks")); }, 500);
  };
  // Все настройки — из общего хранилища (сохраняются на устройстве).
  const нст = useSettings();

  const шеврон=<svg className="rtl-flip" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;

  return (
    <div className="flex-1 overflow-y-auto hide-scroll p-4 animate-fade-in space-y-3">

      {/* Premium banner if not subscribed */}
      {!isPremium&&(
        <button onClick={onUpgrade} className="w-full rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all" style={{background:`linear-gradient(135deg,#0a1f20,#0e3b38)`}}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:GOLD}}>👑</div>
          <div className="flex-1"><p className="text-white font-bold text-sm">HelloUZ Premium</p><p className="text-white/60 text-xs">{t("pay_no_ads")} · HelloUZ Pro</p></div>
          <div className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{background:GOLD,color:ON_GOLD}}>39 000 {t("cur_uzs_word")}</div>
        </button>
      )}
      {isPremium&&(
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{background:`linear-gradient(135deg,#0a1f20,#0e3b38)`}}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{background:GOLD}}>👑</div>
          <div><p className="text-white font-bold text-sm">{t("prof_premium_active")}</p>{user?.premiumUntil&&<p className="text-white/50 text-xs">{t("prem_until")} {датаСловами(new Date(user.premiumUntil), lang, "long")}</p>}</div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" className="ml-auto"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}

      {/* Language */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-2 uppercase tracking-widest" style={{color:MUTED}}>{t("prof_language")}</p>
        <div className="grid grid-cols-2 gap-2 pb-3">
          {LOCALES.map(код=>{
            const [флаг,...имя]=LOCALE_META[код].label.split(" ");
            const выбран=lang===код;
            return (
              <button key={код} onClick={()=>setLang(код)} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-left" style={выбран?{background:ACCENT_SOFT,borderColor:GREEN}:{borderColor:BORDER}}>
                <span className="text-base leading-none">{флаг}</span>
                <span className="text-xs font-medium truncate" style={{color:выбран?GREEN:TEXT}}>{имя.join(" ")}</span>
                {выбран&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" className="ml-auto flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Карта и навигация. Здесь были переключатели уведомлений, GPS-гида,
          офлайн-карт и спутникового слоя — ни один ни на что не влиял.
          Офлайн теперь настоящий: города скачиваются во вкладке «Аудио». */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>{t("prof_map_nav")}</p>
        <Row icon="📏" label={t("s_units")} right={
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:BORDER}}>
            {(["metric","imperial"] as const).map(u=><button key={u} onClick={()=>задатьНастройку("units",u)} className="px-2.5 py-1 text-[10px] font-bold" style={нст.units===u?{background:ACCENT_FILL,color:WHITE}:{background:CREAM,color:MUTED}}>{u==="metric"?t("unit_km"):t("unit_mi")}</button>)}
          </div>
        }/>
      </div>

      {/* Внешний вид */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>{t("prof_appearance")}</p>
        <Row icon="🌙" label={t("s_theme")} sub={t("s_dark_sub")} right={
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:BORDER}}>
            {([["system",t("s_theme_system")],["light",t("s_theme_light")],["dark",t("s_theme_dark")]] as const).map(([v,ярлык])=>(
              <button key={v} onClick={()=>задатьНастройку("theme",v)} className="px-2 py-1 text-[10px] font-bold" style={нст.theme===v?{background:ACCENT_FILL,color:WHITE}:{background:CREAM,color:MUTED}}>{ярлык}</button>
            ))}
          </div>
        }/>
        <Row icon="🎵" label={t("s_autoplay")} sub={t("s_autoplay_sub")} right={<Toggle on={нст.autoplay} set={v=>задатьНастройку("autoplay",v)}/>}/>
        <Row icon="💱" label={t("s_currency")} right={
          <select value={нст.currency} onChange={e=>задатьНастройку("currency",e.target.value)} className="text-xs font-bold px-2 py-1 rounded-lg outline-none border" style={{color:GREEN,borderColor:BORDER,background:CREAM}}>
            {["USD","EUR","RUB","GBP","KRW","CNY","JPY","UZS"].map(c=><option key={c}>{c}</option>)}
          </select>
        }/>
      </div>

      {/* Аккаунт */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>{t("prof_account")}</p>
        <Row icon="👤" label={t("s_edit_profile")} right={шеврон} onClick={открытьПравку}/>
        <Row icon="🔐" label={t("s_security")} right={шеврон} onClick={сброситьПароль}/>
        <Row icon="🔗" label={t("s_linked")} right={шеврон} onClick={()=>setПанель("linked")}/>
        <Row icon="📊" label={t("s_privacy")} right={шеврон} onClick={скачатьДанные}/>
        <Row icon="🗑️" label={t("s_delete")} right={шеврон} onClick={()=>setПанель("delete")}/>
      </div>

      {/* Поддержка */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>{t("prof_support")}</p>
        <Row icon="❓" label={t("s_help")} right={шеврон} onClick={()=>setПанель("faq")}/>
        <Row icon="💬" label={t("s_write_support")} right={шеврон} onClick={onSupport}/>
        <Row icon="⭐" label={t("s_rate")} right={шеврон} onClick={()=>setПанель("rate")}/>
        <Row icon="📢" label={t("s_share")} right={шеврон} onClick={поделиться}/>
        <Row icon="📄" label={t("s_terms")} right={шеврон} onClick={()=>setПанель("terms")}/>
        <Row icon="🔒" label={t("s_privacy_policy")} right={шеврон} onClick={()=>setПанель("privacy")}/>
      </div>

      {/* О приложении */}
      <div className="bg-white rounded-2xl px-4 shadow-sm border" style={{borderColor:BORDER}}>
        <p className="font-bold text-xs pt-3 pb-1 uppercase tracking-widest" style={{color:MUTED}}>{t("prof_about")}</p>
        <Row icon="📱" label={t("s_version")} right={<span className="text-xs font-mono" style={{color:MUTED}}>2.4.1</span>}/>
        <Row icon="🔄" label={t("s_check_updates")} onClick={обновление==="available"?()=>location.reload():проверитьОбновления} right={
          <span className="text-xs font-bold" style={{color:обновление==="available"?GOLD:GREEN}}>
            {обновление==="checking"?t("upd_checking"):обновление==="available"?t("upd_reload"):обновление==="current"?t("upd_current"):t("prof_updated")}
          </span>
        }/>
        <Row icon="🌍" label="HelloUZ — Made in Uzbekistan" right={<span className="text-base">🇺🇿</span>}/>
      </div>

      <button onClick={onLogout} className="w-full py-3.5 rounded-2xl text-sm font-bold border mb-1 active:scale-[0.98] transition-all" style={{color:"#E7574C",borderColor:"color-mix(in srgb,#E7574C 35%,transparent)",background:"color-mix(in srgb,#E7574C 12%,transparent)"}}>
        🚪 {t("prof_logout")}
      </button>
      <div className="pb-6"/>

      {/* Тост подтверждений. */}
      {сообщение && (
        <div className="fixed left-1/2 bottom-24 z-[70] -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg" style={{background:TEXT,color:CREAM}}>
          {сообщение}
        </div>
      )}

      {/* Панель поверх настроек: справка, условия, политика, правка,
          привязки, оценка, удаление. Общая обёртка — лист снизу. */}
      {панель && (
        <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center" style={{background:"rgba(0,0,0,0.55)"}} onClick={()=>setПанель(null)}>
          <div className="w-full sm:max-w-md max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5" style={{background:SURFACE,border:`1px solid ${BORDER}`}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>
                {панель==="faq"?t("s_help"):панель==="terms"?t("s_terms"):панель==="privacy"?t("s_privacy_policy"):панель==="edit"?t("s_edit_profile"):панель==="linked"?t("s_linked"):панель==="rate"?t("rate_title"):t("del_title")}
              </h3>
              <button onClick={()=>setПанель(null)} className="text-xl opacity-50 active:opacity-100" style={{color:TEXT}}>×</button>
            </div>

            {панель==="faq" && (
              <div className="space-y-4">
                {faqТексты(lang).map((б,i)=>(
                  <div key={i}>
                    <p className="text-sm font-bold" style={{color:TEXT}}>{б.q}</p>
                    <p className="text-sm mt-1 leading-relaxed" style={{color:MUTED}}>{б.a}</p>
                  </div>
                ))}
              </div>
            )}

            {(панель==="terms"||панель==="privacy") && (
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{color:MUTED}}>
                {панель==="terms"?условияТекст(lang):политикаТекст(lang)}
              </p>
            )}

            {панель==="linked" && (
              <p className="text-sm leading-relaxed" style={{color:MUTED}}>{t("linked_none")}</p>
            )}

            {панель==="edit" && (
              <div className="space-y-3">
                {/* Аватар: показываем новый выбранный, иначе текущий с сервера. */}
                <div className="flex flex-col items-center gap-2 pb-1">
                  <button onClick={()=>файлФото.current?.click()} className="h-20 w-20 overflow-hidden rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{background:ACCENT_SOFT,border:`1px dashed ${GREEN}`}}>
                    {новоеФото
                      ? <img src={новоеФото} alt="" className="h-full w-full object-cover"/>
                      : user?.hasPhoto
                        ? <img src={`/api/photo/${user.id}`} alt="" className="h-full w-full object-cover"/>
                        : <span className="text-2xl">📷</span>}
                  </button>
                  <button onClick={()=>файлФото.current?.click()} className="text-xs font-semibold" style={{color:GREEN}}>{t("reg_photo")}</button>
                  <input ref={файлФото} type="file" accept="image/*" hidden onChange={выбратьФото}/>
                </div>
                {([["firstName",t("f_field_first")],["lastName",t("f_field_last")],["country",t("f_field_country")],["phone",t("f_field_phone")]] as const).map(([k,label])=>(
                  <div key={k}>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{color:MUTED}}>{label}</label>
                    <input value={(форма as Record<string,string>)[k]} onChange={e=>setФорма(f=>({...f,[k]:e.target.value}))} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border" style={{background:CREAM,borderColor:BORDER,color:TEXT}}/>
                  </div>
                ))}
                <button onClick={сохранитьПрофиль} className="w-full py-3 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all" style={{background:ACCENT_FILL}}>{t("prof_save")}</button>
              </div>
            )}

            {панель==="rate" && (
              <div className="text-center">
                <div className="flex justify-center gap-2 my-4">
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>отправитьОценку(n)} className="text-3xl transition-transform active:scale-125" style={{opacity:n<=оценка?1:0.4}}>⭐</button>
                  ))}
                </div>
              </div>
            )}

            {панель==="delete" && (
              <div>
                <p className="text-sm leading-relaxed mb-4" style={{color:MUTED}}>{t("del_body")}</p>
                <div className="flex gap-2">
                  <button onClick={удалитьАккаунт} className="flex-1 py-3 rounded-xl text-sm font-bold text-white active:scale-[0.98]" style={{background:"#E74C3C"}}>{t("del_yes")}</button>
                  <button onClick={()=>setПанель(null)} className="flex-1 py-3 rounded-xl text-sm font-bold border active:scale-[0.98]" style={{color:TEXT,borderColor:BORDER}}>{t("common_back")}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Снимок профиля, если человек его загрузил. */
function snimok(адрес: string | null) {
  if (!адрес) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={адрес} alt="" className="h-full w-full object-cover" />;
}

export function ProfileScreen({ onLogout, user, isPremium, startView }:{ onLogout:()=>void; user:PublicUser|null; isPremium:boolean; startView?:"passport"|"bookings"|"support"|"chat"|"stats"|"settings" }) {
  /*
   * Имя берём из учётной записи, а не из образца.
   *
   * Здесь стояло «Алекс Джонсон, турист из Нью-Йорка» — вёрстка из
   * макета, которую забыли заменить. Замечено при проверке: вход был
   * сделан китайским аккаунтом, а профиль показывал чужого человека.
   * Своё имя на своей странице — не украшение: по нему человек
   * понимает, что вошёл он, а не сосед.
   */
  const { t, трК, lang } = useT();
  const { PLACES } = useAppContent();

  // Паспорт и достижения — по тому, что человек правда открыл и
  // послушал (см. lib/visits), а не заготовка из макета.
  const { rates } = useCurrency();
  const курсUZS = rates["UZS"];
  const визиты = useVisits();
  const открытые = useOpenedPlaces();
  const прослушано = useListened();
  // Числа в статистике раньше были вписаны руками («3 города, 847 км»)
  // и не менялись ни от чего. Считаем по тому, что человек правда сделал.
  const избранноеСписок = useFavorites();
  const маршрутСписок = useTrip();
  const штампы = STAMPS.map((s) => {
    const место = PLACES.find((p) => (p.nameRu ?? p.name) === s.место);
    const iso = место ? открытые[место.id] : undefined;
    return { ...s, earned: !!iso, date: iso ? датаСловами(new Date(iso), lang, "short") : "—" };
  });
  const открытоМест = (подходит: (p: (typeof PLACES)[number]) => boolean) =>
    PLACES.filter((p) => открытые[p.id] && подходит(p)).length;
  const выполнено: Record<УсловиеДостижения, boolean> = {
    "самарканд": Boolean(визиты["Самарканд"]),
    "бухара": открытоМест((p) => p.city === "Бухара") >= 3,
    "шёлковый-путь": ["Самарканд", "Бухара", "Хива"].every((г) => визиты[г]),
    "музеи": открытоМест((p) => (p.typeRu ?? p.type) === "Музей") >= 2,
    "избранное": избранноеСписок.length >= 5,
    "аудио": Object.keys(прослушано).length > 0,
  };
  // Лента «Активность» — последние открытые места.
  const активность = Object.entries(открытые)
    .map(([id, iso]) => ({ место: PLACES.find((p) => p.id === id), iso }))
    .filter((a) => a.место)
    .sort((a, b) => b.iso.localeCompare(a.iso))
    .slice(0, 5);
  const заработано = штампы.filter((s) => s.earned).length;
  const всегоШтампов = штампы.length;
  const процентШтампов = всегоШтампов ? Math.round((заработано / всегоШтампов) * 100) : 0;
  const имя = user ? `${user.firstName} ${user.lastName}`.trim() : t("prof_traveler");
  const откуда = user?.country ? `🌍 ${user.country}` : `🌍 ${t("prof_traveler")}`;
  const снимок = user?.hasPhoto ? `/api/photo/${user.id}` : null;
  // Номер паспорта свой у каждого: год регистрации и хвост id аккаунта.
  const номерПаспорта = user
    ? `UZT-${new Date(user.createdAt).getFullYear()}-${user.id.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase()}`
    : "UZT-—";
  // Из бокового меню приходят прямо в нужный раздел: «Конвертер валют»
  // и «Экстренная помощь» живут внутри профиля, и открывать вместо них
  // паспорт — значит бросить человека искать самому.
  const [view, setView] = useState<"passport"|"bookings"|"support"|"chat"|"stats"|"settings">(startView ?? "passport");
  const [showPremium, setShowPremium] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(()=>[{role:"ai",text:трК("Assalomu alaykum! 👋 Я ваш AI-гид. Спрашивайте всё — история, маршруты, рестораны, транспорт, валюта!"),time:new Date().toLocaleTimeString(lang,{hour:"2-digit",minute:"2-digit"})}]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Быстрые вопросы хранятся по-русски: это ключ, по которому ищется ответ
  // в AI_REPLIES. На экране показываем перевод (трК), а по клику отправляем
  // русский ключ — так один и тот же ответ находится на любом языке.
  const QUICK=["Что рядом?","История Регистана","Лучшие рестораны?","Что бесплатно?","Как добраться до Бухары?","Где переночевать?","Курс валюты?","Транспорт в Самарканде?"];
  const sendMsg=useCallback((вопрос:string)=>{
    const now=new Date().toLocaleTimeString(lang,{hour:"2-digit",minute:"2-digit"});
    // Известный вопрос трК переведёт; свободный текст на любом языке вернётся
    // как есть — и в пузыре пользователь видит именно то, что спросил.
    setMessages(p=>[...p,{role:"user",text:трК(вопрос),time:now}]);
    setInput("");setTyping(true);
    setTimeout(()=>{
      const рус=AI_REPLIES[вопрос];
      // Курс в заготовленном ответе вписан навсегда и уже устарел.
      // Подставляем живой из того же источника, что и конвертер.
      // На незнакомый вопрос гид честно говорит, что умеет, — раньше он
      // на всё отвечал «рекомендую посещать рано утром».
      const текст = вопрос === "Курс валюты?" && курсUZS
        ? `💱 ${t("cur_title")}:

$1 ≈ ${курсUZS.toLocaleString(lang, { maximumFractionDigits: 0 })} UZS

${t("cur_live_hint")}`
        : рус ? трК(рус) : t("ai_unknown");
      setMessages(p=>[...p,{role:"ai",text:текст,time:new Date().toLocaleTimeString(lang,{hour:"2-digit",minute:"2-digit"})}]);
      setTyping(false);
    },1400);
  },[трК,lang,t,курсUZS]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,typing]);

  const TABS: [typeof view, string, TKey][] = [
    ["passport", "🪪", "prof_passport"],
    ["bookings", "🎫", "prof_bookings"],
    ["support", "💬", "prof_support"],
    ["chat", "🤖", "prof_ai"],
    ["stats", "📊", "prof_stats"],
    ["settings", "⚙️", "prof_settings"],
  ];

  return (
    // На широком экране профиль — это строки «подпись … переключатель» и
    // узкие карточки; во всю ширину они разъезжаются пустотой. Держим
    // читаемой колонкой по центру, на телефоне это по-прежнему вся ширина.
    <div className="flex flex-col h-full w-full max-w-xl mx-auto" style={{background:CREAM}}>
      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)}/>}

      <div className="px-4 pt-14 pb-3 bg-white border-b" style={{borderColor:BORDER}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden" style={{background:"linear-gradient(135deg,var(--accent-light),var(--accent-deep))"}}>
              {snimok(снимок) ?? "👤"}
            </div>
            {isPremium&&<div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{background:GOLD}}>👑</div>}
          </div>
          <div className="flex-1">
            <p className="font-bold text-base truncate" style={{color:TEXT,fontFamily:"var(--font-heading)"}}>{имя}</p>
            <p className="text-xs truncate" style={{color:MUTED}}>{откуда}</p>
            <div className="flex gap-1.5 mt-1">
              <Badge text={`🏅 ${заработано}/${всегоШтампов}`} color="var(--gold-ink)"/>
              {isPremium&&<Badge text="PREMIUM" color="var(--gold-ink)"/>}
            </div>
          </div>
          {!isPremium&&<button onClick={()=>setShowPremium(true)} className="px-3 py-1.5 rounded-xl text-[10px] font-bold" style={{background:`linear-gradient(135deg,#0a1f20,#0e3b38)`,color:GOLD}}>👑 Pro</button>}
        </div>
        <div className="flex gap-1.5">
          {TABS.map(([v,e,l])=><button key={v} onClick={()=>setView(v)} className="flex-1 py-2 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5" style={view===v?{background:ACCENT_FILL,color:WHITE}:{background:CREAM,color:MUTED}}><span>{e}</span><span>{t(l)}</span></button>)}
        </div>
      </div>

      {view==="passport"&&(
        <div className="flex-1 overflow-y-auto hide-scroll animate-fade-in">
          <AdInline isPremium={isPremium}/>
          <div className="px-4">
            <div className="rounded-3xl overflow-hidden mb-4 shadow-lg" style={{background:`linear-gradient(135deg,${ACCENT_DEEP} 0%,${ACCENT_FILL} 100%)`}}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4"><div><p className="text-[9px] font-bold tracking-widest uppercase" style={{color:GOLD}}>HelloUZ · Uzbekistan Travel</p><p className="text-white text-xl mt-0.5" style={{fontFamily:"var(--font-heading)",fontWeight:600}}>{t("prof_digital_passport")}</p></div><div className="text-right"><p className="text-white/40 text-[9px]">{t("prof_passport_no")}</p><p className="text-[10px] font-mono font-bold" style={{color:GOLD}}>{номерПаспорта}</p></div></div>
                <div className="flex items-center gap-3 rounded-2xl p-3" style={{background:"rgba(255,255,255,0.12)"}}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden" style={{background:"rgba(255,255,255,0.15)"}}>
                    {snimok(снимок) ?? "👤"}
                  </div>
                  <div className="min-w-0"><p className="text-white font-semibold text-sm truncate">{имя}</p><p className="text-white/60 text-xs">{заработано}/{всегоШтампов} · {t("prof_stamps")}</p></div>
                  <div className="ml-auto flex-shrink-0"><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.18)" strokeWidth="2"/><circle cx="20" cy="20" r="18" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - процентШтампов / 100)} transform="rotate(-90 20 20)"/><text x="20" y="25" textAnchor="middle" fill={GOLD} fontSize="11" fontWeight="bold">{процентШтампов}%</text></svg></div>
                </div>
              </div>
              <div className="h-6 flex border-t" style={{borderColor:"rgba(255,255,255,0.1)"}}>{Array.from({length:20}).map((_,i)=><div key={i} className="flex-1 flex items-center justify-center" style={{opacity:0.22}}><div className="w-1.5 h-1.5 rotate-45" style={{background:GOLD}}/></div>)}</div>
            </div>
            <p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("prof_stamps")}</p>
            <div className="grid grid-cols-3 gap-2.5 mb-4">{штампы.map((s,i)=><div key={i} className="rounded-2xl p-3 aspect-square flex flex-col items-center justify-center text-center shadow-sm" style={s.earned?{background:ACCENT_FILL}:{background:SURFACE,border:`2px dashed ${BORDER}`}}><span className="text-2xl mb-1">{s.icon}</span><p className="font-bold text-[9px] leading-tight" style={{color:s.earned?WHITE:MUTED}}>{трК(s.name)}</p><p className="text-[8px] mt-0.5" style={{color:s.earned?GOLD:"#C0B0A0"}}>{s.earned?s.date:трК("Не посещено")}</p></div>)}</div>
            <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border" style={{borderColor:BORDER}}><div className="flex items-center justify-between mb-2"><p className="font-semibold text-sm" style={{color:TEXT}}>{t("prof_progress")}</p><p className="text-sm font-bold" style={{color:GREEN}}>{заработано}/{всегоШтампов}</p></div><div className="rounded-full h-2" style={{background:CREAM}}><div className="h-2 rounded-full" style={{background:ACCENT_FILL,width:`${процентШтампов}%`,transition:"width 0.4s"}}/></div><p className="text-xs mt-2" style={{color:MUTED}}>{t("prof_stamps_hint")}</p></div>
            <p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("prof_achievements")}</p>
            <div className="grid grid-cols-3 gap-2.5 pb-4">{ACHIEVEMENTS.map((a)=>{const есть=выполнено[a.условие];return <div key={a.title} className="bg-white rounded-2xl p-3 text-center shadow-sm border" style={{borderColor:BORDER,opacity:есть?1:0.55}}><div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1.5 mx-auto" style={{background:мягко(a.color,10)}}>{a.emoji}</div><p className="text-[9px] font-semibold leading-tight" style={{color:TEXT}}>{трК(a.title)}</p><p className="text-[8px] mt-0.5" style={{color:есть?GREEN:MUTED}}>{есть?`✓ ${t("ach_earned")}`:t("ach_progress")}</p></div>;})}</div>
          </div>
        </div>
      )}
      {view==="chat"&&(
        <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
          <div className="flex-1 overflow-y-auto hide-scroll px-4 py-3 space-y-3">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                {m.role==="ai"&&<div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-white text-[10px] font-bold" style={{background:ACCENT_FILL}}>AI</div>}
                <div className="max-w-[78%] rounded-2xl px-4 py-3 shadow-sm" style={m.role==="user"?{background:ACCENT_FILL,color:WHITE,borderTopRightRadius:4}:{background:SURFACE,color:TEXT,border:`1px solid ${BORDER}`,borderTopLeftRadius:4}}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
                  <p className="text-[10px] mt-1.5" style={{color:m.role==="user"?"rgba(255,255,255,0.5)":MUTED}}>{m.time}</p>
                </div>
              </div>
            ))}
            {typing&&<div className="flex"><div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 text-white text-[10px] font-bold" style={{background:ACCENT_FILL}}>AI</div><div className="bg-white rounded-2xl rounded-tl px-4 py-3 shadow-sm border" style={{borderColor:BORDER,borderTopLeftRadius:4}}><div className="flex gap-1.5 items-center h-4">{[0,150,300].map(d=><span key={d} className="w-2 h-2 rounded-full bounce-dot" style={{background:ACCENT_FILL,animationDelay:`${d}ms`}}/>)}</div></div></div>}
            <div ref={bottomRef}/>
          </div>
          <div className="px-4 pb-2"><div className="flex gap-2 overflow-x-auto hide-scroll">{QUICK.map((q,i)=><button key={i} onClick={()=>sendMsg(q)} className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium bg-white border" style={{color:TEXT,borderColor:BORDER}}>{трК(q)}</button>)}</div></div>
          <div className="px-4 pb-5 pt-2"><div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border" style={{borderColor:BORDER}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&input.trim()&&sendMsg(input.trim())} placeholder={трК("Спросите что угодно…")} className="flex-1 text-sm bg-transparent outline-none" style={{color:TEXT}}/><button onClick={()=>input.trim()&&sendMsg(input.trim())} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:ACCENT_FILL}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div></div>
        </div>
      )}
      {view==="stats"&&(
        <div className="flex-1 overflow-y-auto hide-scroll animate-fade-in">
          <AdInline isPremium={isPremium}/>
          <div className="px-4 space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3">{[{e:"🏙️",v:String(Object.keys(визиты).length),l:t("prof_cnt_cities")},{e:"🏅",v:`${заработано}/${всегоШтампов}`,l:t("prof_cnt_stamps")},{e:"❤️",v:String(избранноеСписок.length),l:t("prof_cnt_fav")},{e:"📋",v:String(маршрутСписок.length),l:t("prof_cnt_trip")}].map(s=><div key={s.l} className="bg-white rounded-2xl p-4 shadow-sm border text-center" style={{borderColor:BORDER}}><p className="text-3xl mb-1">{s.e}</p><p className="text-2xl font-bold" style={{color:GREEN,fontFamily:"var(--font-heading)"}}>{s.v}</p><p className="text-xs mt-0.5" style={{color:MUTED}}>{s.l}</p></div>)}</div>
            <CurrencyConverter/>
            <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{borderColor:BORDER}}><p className="font-bold text-sm mb-3" style={{color:TEXT}}>{t("prof_activity")}</p>{активность.length===0?<p className="text-xs" style={{color:MUTED}}>{t("prof_act_empty")}</p>:активность.map(({место,iso})=><div key={место!.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{borderColor:BORDER}}><span className="text-lg">📍</span><div className="flex-1 min-w-0"><p className="text-sm truncate" style={{color:TEXT}}><span style={{color:MUTED}}>{t("prof_act_opened")}</span> {место!.name}</p><p className="text-xs" style={{color:MUTED}}>{трК(место!.city)} · {датаСловами(new Date(iso), lang, "short")}</p></div></div>)}</div>
            <EmergencyCard/>
          </div>
        </div>
      )}
      {view==="bookings"&&<MyBookings/>}
      {view==="support"&&<SupportChat onBack={()=>setView("passport")}/>}
      {view==="settings"&&<SettingsView isPremium={isPremium} user={user} onUpgrade={()=>setShowPremium(true)} onLogout={onLogout} onSupport={()=>setView("support")}/>}
    </div>
  );
}


export default ProfileScreen;
