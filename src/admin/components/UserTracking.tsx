import { useState } from "react";
import { USERS, User } from "../data/mockData";
import { Badge } from "./shared";

// Uzbekistan city coordinates mapped to SVG space (800x500)
const CITIES: Record<string, { x: number; y: number; label: string }> = {
  Tashkent:   { x: 620, y: 120, label: "Tashkent" },
  Samarkand:  { x: 440, y: 310, label: "Samarkand" },
  Bukhara:    { x: 250, y: 310, label: "Bukhara" },
  Khiva:      { x: 130, y: 220, label: "Khiva" },
  Fergana:    { x: 680, y: 260, label: "Fergana" },
  Nurata:     { x: 330, y: 200, label: "Nurata" },
  Nukus:      { x: 90, y: 130, label: "Nukus" },
  Termez:     { x: 400, y: 430, label: "Termez" },
  Jizzakh:    { x: 510, y: 220, label: "Jizzakh" },
};

// Uzbekistan rough border as SVG polygon points
const UZ_BORDER = "90,80 180,60 280,50 380,40 450,50 520,60 590,70 650,80 700,100 720,130 710,160 700,200 720,240 700,280 680,300 650,320 600,340 550,360 480,380 420,400 380,420 340,440 290,450 240,440 190,430 150,420 110,400 80,370 60,330 50,280 55,230 65,180 75,130 90,80";

function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  // Uzbekistan approx bounds: lat 37-42, lng 56-73
  const x = ((lng - 56) / (73 - 56)) * 680 + 60;
  const y = ((42 - lat) / (42 - 37)) * 400 + 50;
  return { x, y };
}

const USER_COLORS = [
  "#d4872a", "#2a8d7a", "#c45a42", "#7a5fd4", "#2a6d8d",
  "#8d2a5f", "#5fd47a", "#d4c42a", "#8d5f2a",
];

export default function UserTracking() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAll, setShowAll] = useState(true);
  const [hoverCity, setHoverCity] = useState<string | null>(null);

  const activeUsers = USERS.filter((u) => u.status === "active" || u.status === "unverified");

  const getUserColor = (id: number) => USER_COLORS[(id - 1) % USER_COLORS.length];

  const displayUsers = selectedUser ? [selectedUser] : (showAll ? activeUsers : []);

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Карта пользователей
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Позиции пользователей и история передвижений по Узбекистану в реальном времени
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAll(!showAll); setSelectedUser(null); }}
            className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
            style={{
              background: showAll && !selectedUser ? "var(--color-amber)" : "var(--color-panel)",
              color: showAll && !selectedUser ? "#0d0c0a" : "var(--color-muted)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Показать всех
          </button>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* Map */}
        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            minHeight: "520px",
          }}
        >
          <div className="absolute top-4 left-4 z-10 text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            🇺🇿 УЗБЕКИСТАН — КАРТА
          </div>

          <svg
            viewBox="0 0 800 500"
            className="w-full h-full"
            style={{ minHeight: "480px" }}
          >
            {/* Background */}
            <rect width="800" height="500" fill="var(--color-bg)" />

            {/* Grid lines */}
            {[100, 200, 300, 400, 500, 600, 700].map((x) => (
              <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="500" stroke="var(--color-border)" strokeWidth="0.5" />
            ))}
            {[100, 200, 300, 400].map((y) => (
              <line key={`hg${y}`} x1="0" y1={y} x2="800" y2={y} stroke="var(--color-border)" strokeWidth="0.5" />
            ))}

            {/* Uzbekistan border */}
            <polygon
              points={UZ_BORDER}
              fill="rgba(212,135,42,0.06)"
              stroke="var(--color-amber)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Cities */}
            {Object.entries(CITIES).map(([name, pos]) => (
              <g key={name}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={hoverCity === name ? 5 : 3.5}
                  fill="var(--color-dim)"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  style={{ transition: "r 0.15s" }}
                />
                <text
                  x={pos.x + 7}
                  y={pos.y + 4}
                  fontSize="10"
                  fill="var(--color-muted)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {pos.label}
                </text>
              </g>
            ))}

            {/* User paths */}
            {displayUsers.map((user) => {
              const color = getUserColor(user.id);
              const path = user.locationHistory.map((h) => {
                const pos = CITIES[h.city] ?? latLngToXY(h.lat, h.lng);
                return `${pos.x},${pos.y}`;
              });

              return (
                <g key={user.id}>
                  {/* Path line */}
                  {path.length > 1 && (
                    <polyline
                      points={path.join(" ")}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                      opacity="0.5"
                    />
                  )}
                  {/* History dots */}
                  {user.locationHistory.map((h, i) => {
                    const pos = CITIES[h.city] ?? latLngToXY(h.lat, h.lng);
                    return (
                      <circle
                        key={i}
                        cx={pos.x}
                        cy={pos.y}
                        r={3}
                        fill={color}
                        opacity={i === user.locationHistory.length - 1 ? 1 : 0.4}
                      />
                    );
                  })}
                  {/* Current position */}
                  {(() => {
                    const pos = CITIES[user.location.city] ?? latLngToXY(user.location.lat, user.location.lng);
                    return (
                      <g
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                      >
                        {/* Pulse ring */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="10"
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          opacity="0.3"
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="6"
                          fill={color}
                          stroke="#fff"
                          strokeWidth="1.5"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          fontSize="7"
                          fill="#0d0c0a"
                          fontWeight="bold"
                          style={{ fontFamily: "var(--font-body)", pointerEvents: "none" }}
                        >
                          {user.avatar}
                        </text>
                        {/* Name tooltip */}
                        {(selectedUser?.id === user.id) && (
                          <g>
                            <rect
                              x={pos.x - 30}
                              y={pos.y - 28}
                              width="60"
                              height="16"
                              rx="4"
                              fill={color}
                            />
                            <text
                              x={pos.x}
                              y={pos.y - 17}
                              textAnchor="middle"
                              fontSize="8"
                              fill="#0d0c0a"
                              fontWeight="bold"
                            >
                              {user.name.split(" ")[0]}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div
            className="absolute bottom-4 left-4 rounded-lg px-3 py-2 flex flex-wrap gap-2"
            style={{ background: "rgba(13,12,10,0.85)", border: "1px solid var(--color-border)" }}
          >
            {displayUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: getUserColor(u.id) }} />
                <span style={{ color: "var(--color-muted)" }}>{u.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — user list / detail */}
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
        >
          {selectedUser ? (
            /* User detail */
            <div className="p-4 flex-1 overflow-y-auto">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs mb-4 cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}
              >
                ← Назад
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  style={{ background: getUserColor(selectedUser.id), color: "#0d0c0a" }}
                >
                  {selectedUser.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{selectedUser.name}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{selectedUser.flag} {selectedUser.country}</div>
                </div>
              </div>

              <div className="mb-4 p-3 rounded-lg" style={{ background: "var(--color-surface)" }}>
                <div className="text-xs mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ТЕКУЩАЯ ЛОКАЦИЯ</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-teal)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{selectedUser.location.city}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  {selectedUser.location.lat.toFixed(4)}°N {selectedUser.location.lng.toFixed(4)}°E
                </div>
              </div>

              <div className="text-xs mb-2 font-medium tracking-widest uppercase" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                История передвижений
              </div>
              <div className="flex flex-col gap-0">
                {selectedUser.locationHistory.map((h, i) => (
                  <div key={i} className="flex gap-3 items-start pb-3 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                        style={{
                          background: i === selectedUser.locationHistory.length - 1 ? getUserColor(selectedUser.id) : "var(--color-dim)",
                          border: `2px solid ${i === selectedUser.locationHistory.length - 1 ? getUserColor(selectedUser.id) : "var(--color-border)"}`,
                        }}
                      />
                      {i < selectedUser.locationHistory.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: "var(--color-border)", minHeight: "20px" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{h.city}</div>
                      <div className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{h.time}</div>
                      <div className="text-xs" style={{ color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>
                        {h.lat.toFixed(3)}°N {h.lng.toFixed(3)}°E
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* User list */
            <>
              <div className="px-4 pt-4 pb-2">
                <div className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  Активные пользователи ({activeUsers.length})
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeUsers.map((u) => {
                  const color = getUserColor(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors hover:opacity-80"
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{u.name}</div>
                        <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-muted)" }}>
                          <span style={{ fontFamily: "var(--font-mono)" }}>📍</span>
                          <span>{u.location.city}</span>
                          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-dim)" }}>·</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>{u.lastSeen}</span>
                        </div>
                      </div>
                      <Badge
                        label={u.status}
                        color={u.status === "active" ? "teal" : u.status === "unverified" ? "amber" : "rose"}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
