import { useState } from "react";
import { PageHeader, Badge, Btn, Card, SectionTitle } from "./shared";

type Guide = {
  id: number;
  name: string;
  phone: string;
  email: string;
  languages: string[];
  specialties: string[];
  cities: string[];
  rating: number;
  totalTours: number;
  thisMonth: number;
  status: "available" | "on_tour" | "off_duty" | "suspended";
  joinedDate: string;
  bio: string;
  certifications: string[];
  nextTour: string;
  earnings: number;
};

const GUIDES: Guide[] = [
  {
    id: 1, name: "Bobur Tashkentov", phone: "+998 91 234 5678", email: "bobur.t@uztravel.uz",
    languages: ["Uzbek", "Russian", "English", "French"],
    specialties: ["Timurid Architecture", "Islamic History", "Photography Tours"],
    cities: ["Samarkand", "Tashkent"],
    rating: 4.9, totalTours: 312, thisMonth: 8, status: "on_tour",
    joinedDate: "Mar 1, 2023", bio: "Former history professor with 15 years of guiding experience across Central Asia. Expert in Timurid dynasty and Silk Road heritage.",
    certifications: ["Ministry of Tourism Guide", "First Aid", "UNESCO Heritage Specialist"],
    nextTour: "Sep 3 — Registan Sunrise",
    earnings: 18400,
  },
  {
    id: 2, name: "Malika Yusupova", phone: "+998 93 345 6789", email: "m.yusupova@uztravel.uz",
    languages: ["Uzbek", "English", "Japanese", "Korean"],
    specialties: ["Silk Weaving", "Craft Workshops", "Women's History"],
    cities: ["Samarkand", "Bukhara", "Fergana"],
    rating: 4.8, totalTours: 248, thisMonth: 6, status: "available",
    joinedDate: "Jun 15, 2022", bio: "Textile artist and cultural guide specialising in Uzbek craft traditions. Runs interactive silk-dyeing workshops for groups.",
    certifications: ["Ministry of Tourism Guide", "Craft Heritage Specialist"],
    nextTour: "Sep 5 — Fergana Artisan Trail",
    earnings: 14200,
  },
  {
    id: 3, name: "Jasur Karimov", phone: "+998 97 456 7890", email: "jasur.k@uztravel.uz",
    languages: ["Uzbek", "Russian", "German"],
    specialties: ["Gourmet Tours", "Bazaar Walking", "Local Life"],
    cities: ["Fergana", "Tashkent"],
    rating: 4.7, totalTours: 189, thisMonth: 5, status: "available",
    joinedDate: "Sep 1, 2022", bio: "Food enthusiast and bazaar expert. Specialises in culinary tours, street food walks and cooking class experiences.",
    certifications: ["Ministry of Tourism Guide", "Food Safety Certificate"],
    nextTour: "Sep 10 — Fergana Artisan Trail",
    earnings: 10800,
  },
  {
    id: 4, name: "Sherzod Nazarov", phone: "+998 90 567 8901", email: "sherzod.n@uztravel.uz",
    languages: ["Uzbek", "Russian", "English"],
    specialties: ["Trekking", "Yurt Stays", "Mountain Ecology"],
    cities: ["Nurata", "Tashkent"],
    rating: 4.8, totalTours: 156, thisMonth: 4, status: "on_tour",
    joinedDate: "Jan 12, 2023", bio: "Mountaineer and ecologist. Leads expeditions to Nurata mountains, Aral Sea and remote desert regions.",
    certifications: ["Mountain Guide License", "Wilderness First Responder", "Ecology Certificate"],
    nextTour: "Sep 12 — Nurata Trek",
    earnings: 9600,
  },
  {
    id: 5, name: "Dilnoza Ergasheva", phone: "+998 99 678 9012", email: "dilnoza.e@uztravel.uz",
    languages: ["Uzbek", "English", "Arabic"],
    specialties: ["Islamic Architecture", "Heritage Sites", "Night Tours"],
    cities: ["Khiva", "Bukhara"],
    rating: 4.6, totalTours: 134, thisMonth: 5, status: "available",
    joinedDate: "Apr 5, 2023", bio: "Specialist in Khorezm history and Khiva's ancient architecture. Runs acclaimed after-dark tours of Itchan Kala.",
    certifications: ["Ministry of Tourism Guide", "UNESCO Heritage Guide"],
    nextTour: "Sep 4 — Khiva Night Tour",
    earnings: 8200,
  },
  {
    id: 6, name: "Amir Akhmedov", phone: "+998 91 789 0123", email: "amir.a@uztravel.uz",
    languages: ["Uzbek", "Russian", "English", "Spanish"],
    specialties: ["Aral Sea Expedition", "Off-road", "4WD Desert Crossings"],
    cities: ["Nukus", "Tashkent"],
    rating: 4.9, totalTours: 88, thisMonth: 2, status: "available",
    joinedDate: "Aug 20, 2023", bio: "Former military officer turned expedition guide. One of only three licensed Aral Sea expedition leaders in Uzbekistan.",
    certifications: ["Expedition Guide", "Advanced First Aid", "4WD Instructor"],
    nextTour: "Oct 1 — Aral Sea Expedition",
    earnings: 12400,
  },
  {
    id: 7, name: "Nodira Abdullayeva", phone: "+998 93 890 1234", email: "nodira.a@uztravel.uz",
    languages: ["Uzbek", "Russian", "English", "Italian"],
    specialties: ["City Tours", "Architecture", "Tashkent History"],
    cities: ["Tashkent"],
    rating: 4.5, totalTours: 210, thisMonth: 7, status: "off_duty",
    joinedDate: "Feb 28, 2022", bio: "Urban historian and architecture enthusiast. Brings Tashkent's Soviet-era landmarks and ancient mosques to life.",
    certifications: ["Ministry of Tourism Guide"],
    nextTour: "Sep 5 — Tashkent Modern & Ancient",
    earnings: 11600,
  },
];

const STATUS_COLOR: Record<string, "teal" | "amber" | "dim" | "rose"> = {
  available: "teal", on_tour: "amber", off_duty: "dim", suspended: "rose",
};

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>(GUIDES);
  const [selected, setSelected] = useState<Guide | null>(null);
  const [filter, setFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newGuide, setNewGuide] = useState({ name: "", email: "", phone: "", cities: "", languages: "", specialties: "", bio: "" });

  const cities = ["all", ...Array.from(new Set(guides.flatMap(g => g.cities)))];

  let filtered = guides;
  if (filter !== "all") filtered = filtered.filter(g => g.status === filter);
  if (cityFilter !== "all") filtered = filtered.filter(g => g.cities.includes(cityFilter));
  if (search) filtered = filtered.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const totalEarnings = guides.reduce((s, g) => s + g.earnings, 0);
  const available = guides.filter(g => g.status === "available").length;
  const onTour = guides.filter(g => g.status === "on_tour").length;

  const toggleStatus = (id: number, status: Guide["status"]) => {
    setGuides(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  return (
    <div className="p-4 sm:p-4 sm:p-7">
      <PageHeader
        title="Гиды"
        subtitle={`${guides.length} гидов · ${onTour} в туре · ${available} доступно`}
        action={<Btn onClick={() => setShowAdd(true)}>+ Добавить гида</Btn>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "ВСЕГО ГИДОВ", val: String(guides.length), color: "var(--color-text)" },
          { label: "В ТУРЕ СЕЙЧАС", val: String(onTour), color: "var(--color-amber)" },
          { label: "ДОСТУПНО", val: String(available), color: "var(--color-teal)" },
          { label: "ВЫПЛАТЫ ЗА МЕСЯЦ", val: `$${totalEarnings.toLocaleString()}`, color: "var(--color-teal)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Поиск по имени или специализации…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded px-3 py-1.5 text-sm outline-none"
          style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-text)", width: "220px", fontFamily: "var(--font-body)" }}
        />
        <div className="flex gap-1.5">
          {["all", "available", "on_tour", "off_duty", "suspended"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer capitalize transition-all"
              style={{
                background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
                color: filter === f ? "#0d0c0a" : "var(--color-muted)",
                border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)",
              }}
            >{{ all: "все", available: "активен", on_tour: "в туре", off_duty: "не в туре", suspended: "отстранён" }[f]}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {cities.slice(0, 6).map(c => (
            <button key={c} onClick={() => setCityFilter(c)}
              className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
              style={{
                background: cityFilter === c ? "rgba(212,135,42,0.15)" : "transparent",
                color: cityFilter === c ? "var(--color-amber)" : "var(--color-muted)",
                border: `1px solid ${cityFilter === c ? "rgba(212,135,42,0.4)" : "var(--color-border)"}`,
                fontFamily: "var(--font-mono)",
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Guide cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
        {filtered.map(g => (
          <div
            key={g.id}
            className="rounded-xl p-5 cursor-pointer transition-all"
            style={{
              background: "var(--color-panel)",
              border: `1px solid ${g.status === "on_tour" ? "rgba(212,135,42,0.3)" : "var(--color-border)"}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-amber)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = g.status === "on_tour" ? "rgba(212,135,42,0.3)" : "var(--color-border)")}
            onClick={() => setSelected(g)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-base shrink-0"
                style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
              >
                {g.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>{g.name}</span>
                  <Badge label={g.status.replace("_", " ")} color={STATUS_COLOR[g.status]} />
                </div>
                <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
                  <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>★ {g.rating}</span>
                  <span>·</span>
                  <span>{g.totalTours} туров проведено</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold" style={{ color: "var(--color-teal)", fontFamily: "var(--font-mono)" }}>
                  ${g.earnings.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>заработок</div>
              </div>
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1 mb-2">
              {g.languages.map(l => (
                <span key={l} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  {l}
                </span>
              ))}
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              {g.specialties.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(212,135,42,0.08)", color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}>
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "10px" }}>
              <div style={{ color: "var(--color-muted)" }}>
                Следующий: <span style={{ color: "var(--color-text)" }}>{g.nextTour}</span>
              </div>
              <div style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                {g.cities.join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add guide modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={() => setShowAdd(false)}>
          <div className="rounded-2xl w-full max-w-lg p-6 overflow-y-auto" style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Добавить гида</h3>
              <button onClick={() => setShowAdd(false)} className="opacity-50 hover:opacity-100 cursor-pointer text-xl" style={{ color: "var(--color-text)" }}>×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {([
                ["name","Полное имя","text"],["email","Email","email"],["phone","Телефон","tel"],
                ["cities","Города (через запятую)","text"],["languages","Языки (через запятую)","text"],
                ["specialties","Специализации (через запятую)","text"],
              ] as [string,string,string][]).map(([k,label,type]) => (
                <div key={k} className={k === "specialties" || k === "cities" ? "col-span-2" : ""}>
                  <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</label>
                  <input type={type} value={(newGuide as any)[k]} onChange={e => setNewGuide(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs block mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>БИОГРАФИЯ</label>
                <textarea rows={3} value={newGuide.bio} onChange={e => setNewGuide(p => ({ ...p, bio: e.target.value }))}
                  className="w-full rounded px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
              <Btn onClick={() => {
                if (!newGuide.name || !newGuide.email) return;
                const g: Guide = {
                  id: guides.length + 1,
                  name: newGuide.name,
                  phone: newGuide.phone || "",
                  email: newGuide.email,
                  languages: newGuide.languages ? newGuide.languages.split(",").map(s => s.trim()) : ["Uzbek"],
                  specialties: newGuide.specialties ? newGuide.specialties.split(",").map(s => s.trim()) : [],
                  cities: newGuide.cities ? newGuide.cities.split(",").map(s => s.trim()) : ["Tashkent"],
                  rating: 0, totalTours: 0, thisMonth: 0, status: "available",
                  joinedDate: new Date().toLocaleDateString("ru"), bio: newGuide.bio || "",
                  certifications: [], nextTour: "Не назначен", earnings: 0,
                };
                setGuides(prev => [...prev, g]);
                setShowAdd(false);
                setNewGuide({ name: "", email: "", phone: "", cities: "", languages: "", specialties: "", bio: "" });
              }}>Добавить</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-2xl w-full max-w-lg overflow-hidden"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", maxHeight: "85vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-semibold"
                    style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                  >
                    {selected.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                      {selected.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge label={selected.status.replace("_", " ")} color={STATUS_COLOR[selected.status]} />
                      <span style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>★ {selected.rating}</span>
                      <span style={{ color: "var(--color-muted)", fontSize: "12px" }}>Вступил {selected.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <button className="text-xl opacity-50 hover:opacity-100 cursor-pointer" style={{ color: "var(--color-text)" }} onClick={() => setSelected(null)}>×</button>
              </div>
            </div>

            <div className="p-6">
              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Туров проведено", val: String(selected.totalTours) },
                  { label: "В этом месяце", val: String(selected.thisMonth) },
                  { label: "Заработок", val: `$${selected.earnings.toLocaleString()}` },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: "var(--color-surface)" }}>
                    <div className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}>{s.val}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>{selected.bio}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ЯЗЫКИ</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.languages.map(l => (
                      <span key={l} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ГОРОДА</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.cities.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(212,135,42,0.08)", color: "var(--color-amber)" }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>СЕРТИФИКАТЫ</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.certifications.map(c => (
                    <span key={c} className="text-xs px-2 py-1 rounded" style={{ background: "rgba(42,141,122,0.1)", border: "1px solid rgba(42,141,122,0.2)", color: "var(--color-teal)" }}>{c}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-sm mb-5 p-3 rounded-lg" style={{ background: "var(--color-surface)" }}>
                <span style={{ color: "var(--color-muted)" }}>Следующий тур:</span>
                <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{selected.nextTour}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selected.status !== "available" && (
                  <Btn variant="ghost" onClick={() => { toggleStatus(selected.id, "available"); setSelected(null); }}>Сделать доступным</Btn>
                )}
                {selected.status !== "off_duty" && (
                  <Btn variant="ghost" onClick={() => { toggleStatus(selected.id, "off_duty"); setSelected(null); }}>Снять с дежурства</Btn>
                )}
                {selected.status !== "suspended" && (
                  <Btn variant="danger" onClick={() => { toggleStatus(selected.id, "suspended"); setSelected(null); }}>Отстранить</Btn>
                )}
                <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
