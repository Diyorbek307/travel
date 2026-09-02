"use client";

import { useRef, useState } from "react";
import { GOLD, GREEN, MUTED, TEXT, WHITE } from "@/lib/theme";

export function UzbekistanMap3D({ onCitySelect }:{ onCitySelect:(city:string)=>void }) {
  const [rotX, setRotX] = useState(30);
  const [rotY, setRotY] = useState(-8);
  const [zoom, setZoom] = useState(1);
  const [selCity, setSelCity] = useState<string|null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({x:0,y:0});

  const onPD = (e:React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = {x:e.clientX, y:e.clientY};
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPM = (e:React.PointerEvent) => {
    if(!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setRotY(r => Math.max(-40, Math.min(40, r + dx*0.35)));
    setRotX(r => Math.max(8, Math.min(68, r - dy*0.35)));
    lastPos.current = {x:e.clientX, y:e.clientY};
  };
  const onPU = () => { isDragging.current = false; };

  const MAIN = "M 32,112 L 78,48 L 152,22 L 232,16 L 312,24 L 362,44 L 386,72 L 392,98 L 376,118 L 356,132 L 326,150 L 296,170 L 260,184 L 224,194 L 186,197 L 152,192 L 118,182 L 88,167 L 64,150 L 48,128 Z";
  const FER  = "M 390,74 L 422,66 L 448,82 L 452,108 L 440,130 L 422,142 L 406,136 L 396,122 L 390,100 Z";
  const CITIES = [
    {name:"Ташкент",  x:370, y:78,  r:7, color:"#E9C46A"},
    {name:"Самарканд",x:250, y:177, r:5, color:GREEN},
    {name:"Бухара",   x:152, y:172, r:5, color:GREEN},
    {name:"Хива",     x:72,  y:155, r:4, color:GREEN},
    {name:"Нукус",    x:55,  y:128, r:4, color:"#5BB8D4"},
    {name:"Фергана",  x:430, y:102, r:4, color:GREEN},
    {name:"Наманган", x:406, y:80,  r:4, color:GREEN},
    {name:"Андижан",  x:442, y:102, r:3, color:GREEN},
    {name:"Термез",   x:270, y:192, r:3, color:"#C1603A"},
  ];
  const HIST_PINS = [
    {name:"Регистан", x:252, y:170, emoji:"🕌"},
    {name:"Арк",      x:150, y:165, emoji:"🏰"},
    {name:"Ичан-Кала",x:72,  y:148, emoji:"🏛️"},
  ];

  return (
    <div className="relative w-full select-none" style={{height:270}}>
      <div className="w-full h-full" style={{perspective:"1000px",perspectiveOrigin:"50% 30%"}}
        onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU}>
        <div style={{
          transform:`rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`,
          transition: isDragging.current ? "none" : "transform 0.45s cubic-bezier(.22,1,.36,1)",
          filter:"drop-shadow(0 18px 48px rgba(0,0,0,0.4))",
          width:"100%", height:"100%",
        }} className="cursor-grab active:cursor-grabbing">
          <svg viewBox="0 0 490 310" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mapTerrain" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E8D5A0"/>
                <stop offset="30%" stopColor="#CEBB7A"/>
                <stop offset="65%" stopColor="#90B868"/>
                <stop offset="100%" stopColor="#6DA44E"/>
              </linearGradient>
              <linearGradient id="mapFer" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#72AE4C"/>
                <stop offset="100%" stopColor="#4E9030"/>
              </linearGradient>
              <radialGradient id="mapMt" cx="78%" cy="22%" r="38%">
                <stop offset="0%" stopColor="#A08060" stopOpacity="0.65"/>
                <stop offset="100%" stopColor="#A08060" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="mapDesert" cx="30%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D4B882" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#D4B882" stopOpacity="0"/>
              </radialGradient>
              <filter id="mapBlur"><feGaussianBlur stdDeviation="3"/></filter>
            </defs>
            {/* Paper */}
            <rect x="3" y="3" width="484" height="304" rx="10" fill="#F2E4C4" stroke="#D4C090" strokeWidth="1.2"/>
            {[1,2,3,4].map(i=><line key={"h"+i} x1="3" y1={3+i*60} x2="487" y2={3+i*60} stroke="#DDD0AA" strokeWidth="0.4" opacity="0.6"/>)}
            {[1,2,3,4,5,6,7].map(i=><line key={"v"+i} x1={3+i*68} y1="3" x2={3+i*68} y2="307" stroke="#DDD0AA" strokeWidth="0.4" opacity="0.6"/>)}
            {/* Shadow */}
            <path d={MAIN} fill="rgba(0,0,0,0.14)" transform="translate(6,9)" filter="url(#mapBlur)"/>
            {/* Land */}
            <path d={MAIN} fill="url(#mapTerrain)" stroke="#8B7A55" strokeWidth="2.2"/>
            {/* Fergana */}
            <path d={FER}  fill="url(#mapFer)" stroke="#5F8A3A" strokeWidth="1.6"/>
            {/* Mountain tint */}
            <ellipse cx="382" cy="70" rx="55" ry="30" fill="url(#mapMt)"/>
            {/* Kyzylkum desert */}
            <ellipse cx="178" cy="128" rx="90" ry="42" fill="url(#mapDesert)"/>
            {/* Amu Darya */}
            <path d="M 70,154 Q 94,146 122,144 Q 152,141 172,150 Q 194,160 210,172" fill="none" stroke="#6BB8D4" strokeWidth="2.4" strokeLinecap="round" opacity="0.65"/>
            {/* Syr Darya */}
            <path d="M 348,92 Q 316,104 292,118 Q 268,132 254,148" fill="none" stroke="#6BB8D4" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
            {/* Aral Sea */}
            <ellipse cx="28" cy="92" rx="22" ry="14" fill="#A8D8E8" stroke="#7ABBD8" strokeWidth="1" opacity="0.72"/>
            <text x="28" y="96" textAnchor="middle" fill="#4A8AAA" fontSize="5.5" opacity="0.9">Арал</text>
            {/* Historical pins */}
            {HIST_PINS.map(p=>(
              <g key={p.name}>
                <circle cx={p.x} cy={p.y} r="10" fill={GREEN} opacity="0.18"/>
                <text x={p.x} y={p.y+4} textAnchor="middle" fontSize="10">{p.emoji}</text>
              </g>
            ))}
            {/* Cities */}
            {CITIES.map(c=>(
              <g key={c.name} onClick={()=>{setSelCity(c.name);onCitySelect(c.name);}} className="cursor-pointer">
                <circle cx={c.x} cy={c.y} r={c.r+5} fill={c.color} opacity="0.16"/>
                <circle cx={c.x} cy={c.y} r={c.r} fill={selCity===c.name?GOLD:c.color} stroke="white" strokeWidth="1.8"/>
                <text x={c.x} y={c.y-c.r-4} textAnchor="middle" fill={TEXT} fontSize={c.r>5?"8":"7"} fontWeight="700">{c.name}</text>
              </g>
            ))}
            {/* Label */}
            <text x="200" y="292" textAnchor="middle" fill="#8B7A55" fontSize="17" fontFamily="Georgia,serif" fontWeight="bold" opacity="0.42" letterSpacing="4">УЗБЕКИСТАН</text>
          </svg>
        </div>
      </div>
      {/* Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
        {[{l:"+",fn:()=>setZoom(z=>Math.min(2.2,+(z+0.25).toFixed(2))),bg:WHITE,c:GREEN},{l:"−",fn:()=>setZoom(z=>Math.max(0.5,+(z-0.25).toFixed(2))),bg:WHITE,c:GREEN},{l:"⟳",fn:()=>{setRotX(30);setRotY(-8);setZoom(1);},bg:GREEN,c:WHITE}].map(b=>(
          <button key={b.l} onClick={b.fn} className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md" style={{background:b.bg,color:b.c}}>{b.l}</button>
        ))}
      </div>
      <p className="absolute bottom-1 left-0 right-0 text-center text-[9px]" style={{color:MUTED,opacity:0.65}}>↕↔ тяните · ± масштаб · нажмите город</p>
    </div>
  );
}

// ── Splash ────────────────────────────────────────────────────────────────────
