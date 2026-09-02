import { useState } from "react";
import { PageHeader, Badge, Btn } from "./shared";
import { useEntity } from "../context/useEntity";
import type { ManagedCity as City } from "@/lib/types";



export default function Cities() {
  const [cities, setCities] = useEntity("cities");
  const [selected, setSelected] = useState<City | null>(null);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newCity, setNewCity] = useState({ name: "", region: "", population: "", tourists: "", description: "" });

  const filtered = filter === "all" ? cities : filter === "featured" ? cities.filter(c => c.featured) : cities.filter(c => c.status === filter);

  const toggleFeatured = (id: string) => {
    setCities(prev => prev.map(c => c.id === id ? { ...c, featured: !c.featured } : c));
  };

  return (
    <div className="p-7">
      <PageHeader
        title="Города"
        subtitle={`${cities.length} городов · ${cities.filter(c => c.featured).length} на главной`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Добавить город</Btn>}
      />

      <div className="flex gap-1.5 mb-6">
        {[["all", "все"], ["featured", "на главной"], ["active", "активные"], ["draft", "черновик"]].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
            style={{ background: filter === f ? "var(--color-amber)" : "var(--color-panel)", color: filter === f ? "#0d0c0a" : "var(--color-muted)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
          >{label}</button>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
        {filtered.map(city => (
          <div key={city.id}
            className="rounded-xl overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px]"
            style={{ background: "var(--color-panel)", border: `1px solid ${city.featured ? "rgba(212,135,42,0.5)" : "var(--color-border)"}` }}
            onClick={() => setSelected(city)}
          >
            <div className="relative h-44 overflow-hidden" style={{ background: "var(--color-dim)" }}>
              <img src={city.img} alt={city.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,12,10,0.9) 0%, transparent 60%)" }} />
              <div className="absolute top-3 right-3 flex gap-1.5">
                {city.featured && <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "var(--color-amber)", color: "#0d0c0a", fontFamily: "var(--font-mono)" }}>★ На главной</span>}
                <Badge label={city.status} color={city.status === "active" ? "teal" : "dim"} />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{city.name}</div>
                <div className="text-xs text-white opacity-60 mt-0.5">{city.region} Регион</div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--color-muted)" }}>{city.description}</p>
              <div className="flex gap-4 text-xs mb-3" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                <span>{city.population.toLocaleString()} жит.</span>
                <span style={{ color: "var(--color-teal)" }}>{city.tourists.toLocaleString()} туристов/год</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {city.highlights.slice(0, 3).map(h => (
                  <span key={h} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--color-dim)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{h}</span>
                ))}
                {city.highlights.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--color-dim)", color: "var(--color-dim)", fontFamily: "var(--font-mono)" }}>+{city.highlights.length - 3}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Btn variant={city.featured ? "danger" : "ghost"} small onClick={e => { e.stopPropagation(); toggleFeatured(city.id); }}>
                  {city.featured ? "Убрать с главной" : "На главную ★"}
                </Btn>
                <Btn variant="ghost" small onClick={e => { e.stopPropagation(); setSelected(city); }}>Изменить</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить город</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {([["name","Название","text"],["region","Регион","text"],["population","Население","number"],["tourists","Туристов в год","number"]] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newCity as any)[k]} onChange={e => setNewCity(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ОПИСАНИЕ</label>
                <textarea rows={3} value={newCity.description} onChange={e => setNewCity(p => ({ ...p, description: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newCity.name) return;
                setCities(prev => [...prev, {
                  id: `new-${Date.now()}`, name: newCity.name, region: newCity.region || "—",
                  population: Number(newCity.population) || 0, tourists: Number(newCity.tourists) || 0,
                  highlights: [], description: newCity.description || "",
                  status: "draft" as const, featured: false,
                  sub: newCity.region || "Узбекистан", rating: 0,
                  img: "https://images.unsplash.com/photo-1728565721798-cf65c7bf1efe?w=600&h=300&fit=crop&auto=format",
                }]);
                setShowAdd(false);
                setNewCity({ name: "", region: "", population: "", tourists: "", description: "" });
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setSelected(null)}>
          <div className="rounded-xl w-full max-w-lg overflow-hidden" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
            <div className="relative h-44" style={{ background: "var(--color-dim)" }}>
              <img src={selected.img} alt={selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,12,10,0.85) 0%, transparent 60%)" }} />
              <div className="absolute bottom-4 left-5">
                <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{selected.name}</h2>
                <div className="text-sm text-white opacity-60 mt-0.5">{selected.region} Регион</div>
              </div>
              <button className="absolute top-4 right-4 text-white text-xl opacity-60 hover:opacity-100 cursor-pointer" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Население", val: selected.population.toLocaleString() },
                  { label: "Туристов в год", val: selected.tourists.toLocaleString() },
                  { label: "Регион", val: selected.region },
                  { label: "Статус", val: selected.status },
                ].map(s => (
                  <div key={s.label} className="rounded p-2" style={{ background: "var(--color-surface)" }}>
                    <div className="text-xs mb-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                    <div className="text-sm" style={{ color: "var(--color-text)" }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ДОСТОПРИМЕЧАТЕЛЬНОСТИ</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.highlights.map(h => (
                    <span key={h} className="text-xs px-2 py-1 rounded" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{h}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Btn variant={selected.featured ? "danger" : "ghost"} onClick={() => { toggleFeatured(selected.id); setSelected(null); }}>
                  {selected.featured ? "Убрать с главной" : "На главную ★"}
                </Btn>
                <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
