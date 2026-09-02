
export function AnimatedBg() {
  const STAR = "M12,2 L14.2,8.8 L21.5,8.8 L15.9,13.1 L18.1,19.9 L12,15.7 L5.9,19.9 L8.1,13.1 L2.5,8.8 L9.8,8.8 Z";
  const shapes = [
    { cls:"uz-float-1", x:18, y:22,  size:28, opacity:0.18, delay:0 },
    { cls:"uz-float-2", x:72, y:8,   size:20, opacity:0.13, delay:1.2 },
    { cls:"uz-float-3", x:55, y:55,  size:36, opacity:0.1,  delay:2.4 },
    { cls:"uz-drift",   x:88, y:38,  size:22, opacity:0.14, delay:0.8 },
    { cls:"uz-float-1", x:8,  y:70,  size:16, opacity:0.1,  delay:3.1 },
    { cls:"uz-float-2", x:40, y:82,  size:24, opacity:0.12, delay:1.7 },
    { cls:"uz-float-3", x:82, y:75,  size:18, opacity:0.09, delay:4.2 },
    { cls:"uz-drift",   x:28, y:42,  size:12, opacity:0.08, delay:2.0 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Silk Road path */}
      <path d="M 0,60 Q 15,45 30,50 Q 50,55 65,42 Q 80,30 100,38" fill="none" stroke="rgba(233,196,106,0.25)" strokeWidth="0.4" className="silk-road-path"/>
      <path d="M 0,72 Q 20,58 45,65 Q 70,72 100,55" fill="none" stroke="rgba(46,125,90,0.2)" strokeWidth="0.3" className="silk-road-path" style={{animationDelay:"2s"}}/>
      {/* Floating stars */}
      {shapes.map((s,i)=>(
        <g key={"star"+i} className={s.cls} style={{animationDelay:`${s.delay}s`,transformOrigin:`${s.x}% ${s.y}%`}}>
          <path d={STAR} fill={i%2===0?"rgba(233,196,106,1)":"rgba(255,255,255,1)"} opacity={s.opacity}
            transform={`translate(${s.x-s.size/2*0.24},${s.y-s.size/2*0.24}) scale(${s.size*0.02})`}/>
        </g>
      ))}
      {/* Geometric diamonds */}
      {[[15,35],[62,18],[45,68],[90,55],[32,85]].map(([x,y],i)=>(
        <rect key={"d"+i} x={x-3} y={y-3} width="6" height="6"
          transform={`rotate(45,${x},${y})`}
          fill="rgba(233,196,106,0.15)" className="uz-float-2"
          style={{animationDelay:`${i*1.3}s`,transformOrigin:`${x}% ${y}%`}}/>
      ))}
      {/* Dot constellation */}
      {[[20,50],[35,30],[58,42],[75,25],[90,48]].map(([x,y],i)=>(
        <circle key={"c"+i} cx={x} cy={y} r="0.6" fill="rgba(255,255,255,0.25)"
          className="star-twinkle" style={{animationDelay:`${i*0.6}s`}}/>
      ))}
    </svg>
  );
}

// ── Card Deck (image-23 style) ────────────────────────────────────────────────
