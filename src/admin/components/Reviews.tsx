import { useState } from "react";
import { PageHeader, Badge, Btn } from "./shared";

type Review = {
  id: number;
  author: string;
  country: string;
  flag: string;
  tour: string;
  destination: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  status: "published" | "pending" | "flagged" | "rejected";
  helpful: number;
};

const REVIEWS: Review[] = [
  { id: 1, author: "James Walker", country: "UK", flag: "🇬🇧", tour: "Silk Road Classic", destination: "Samarkand", rating: 5, title: "Absolutely life-changing journey", body: "The Registan at sunrise with no crowds — Bobur arranged it perfectly. The tilework makes every photo look surreal. Do not miss the Shah-i-Zinda necropolis at dusk. Ten days felt too short.", date: "Aug 31, 2026", status: "published", helpful: 47 },
  { id: 2, author: "Sophie Bernhard", country: "Germany", flag: "🇩🇪", tour: "Silk Road Classic", destination: "Bukhara", rating: 5, title: "Medieval magic, unexpectedly vibrant", body: "Bukhara's old city feels genuinely lived-in. We had tea with a carpet weaver who explained every symbol. The Ark palace tour was three hours well spent. Very well organised.", date: "Aug 30, 2026", status: "published", helpful: 31 },
  { id: 3, author: "Maria Chen", country: "China", flag: "🇨🇳", tour: "Registan Sunrise Experience", destination: "Samarkand", rating: 4, title: "Beautiful but crowded by 8am", body: "Getting there at 6am was the right call — by 8am tour buses had arrived. The mosaics and tilework are breathtaking. Guide very knowledgeable about Timurid history. Hotel was a bit basic for the price.", date: "Sep 1, 2026", status: "pending", helpful: 0 },
  { id: 4, author: "Tariq Hassan", country: "Egypt", flag: "🇪🇬", tour: "Aral Sea Expedition", destination: "Aral Sea", rating: 5, title: "Haunting, necessary, unforgettable", body: "The ship graveyard is one of the most sobering places I have ever visited. The expedition felt properly adventurous — rough roads, wild camping. Amir is a brilliant guide. Not for everyone, but essential for the curious.", date: "Aug 29, 2026", status: "published", helpful: 62 },
  { id: 5, author: "Dmitri Volkov", country: "Russia", flag: "🇷🇺", tour: "Khiva Night Tour", destination: "Khiva", rating: 2, title: "Tour cancelled with no refund", body: "My tour was cancelled due to 'operational reasons' and I am still waiting for a refund 3 weeks later. The itinerary itself looked great but I never got to do it. Disappointing customer service.", date: "Aug 28, 2026", status: "flagged", helpful: 4 },
  { id: 6, author: "Yuki Tanaka", country: "Japan", flag: "🇯🇵", tour: "Nurata Trek & Yurt Stay", destination: "Nurata Mountains", rating: 5, title: "Stars like I have never seen", body: "The yurt hosts were extraordinary — three generations all at dinner together, the grandmother taught us to make lagman. Trekking is moderate but the scenery rewards every step. Pack warm clothes.", date: "Aug 27, 2026", status: "published", helpful: 38 },
  { id: 7, author: "Unknown Guest", country: "—", flag: "🌐", tour: "Tashkent Modern & Ancient", destination: "Tashkent", rating: 1, title: "FAKE REVIEWS — THIS IS A SCAM", body: "All these 5 star reviews are paid for. My personal information was sold to a third party and I received spam emails for months after booking.", date: "Aug 26, 2026", status: "flagged", helpful: 0 },
  { id: 8, author: "Ahmed Khalil", country: "Egypt", flag: "🇪🇬", tour: "Fergana Artisan Trail", destination: "Fergana Valley", rating: 5, title: "The silk workshop alone is worth the trip", body: "Watching master weavers work the 100-year-old looms was meditative. We helped dye silk with pomegranate rind. Jasur connected us with a local family for plov dinner — unmissable.", date: "Aug 25, 2026", status: "published", helpful: 29 },
];

const STARS = [5, 4, 3, 2, 1];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Review | null>(null);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const statusColor = (s: string) => {
    if (s === "published") return "teal";
    if (s === "pending") return "amber";
    if (s === "flagged") return "rose";
    return "dim";
  };

  const setStatus = (id: number, status: Review["status"]) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected(null);
  };

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const distrib = STARS.map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Отзывы"
        subtitle={`${reviews.length} отзывов · средн. ${avgRating} ★`}
      />

      {/* Rating distribution + summary */}
      <div className="grid gap-6 mb-7" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
        {/* Distribution */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
        >
          <div className="text-center mb-4">
            <div
              className="text-5xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-amber)" }}
            >
              {avgRating}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              {"★".repeat(Math.round(parseFloat(avgRating)))} средн.
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              {reviews.length} отзывов
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {distrib.map((d) => (
              <div key={d.star} className="flex flex-wrap items-center gap-2 text-xs">
                <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", width: "14px", textAlign: "right" }}>{d.star}</span>
                <span style={{ color: "var(--color-amber)", fontSize: "10px" }}>★</span>
                <div className="min-w-0 flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-dim)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.count / reviews.length) * 100}%`,
                      background: d.star >= 4 ? "var(--color-teal)" : d.star === 3 ? "var(--color-amber)" : "var(--color-rose)",
                    }}
                  />
                </div>
                <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", width: "14px" }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "ОПУБЛИКОВАНЫ", val: reviews.filter(r => r.status === "published").length, color: "var(--color-teal)" },
            { label: "НА МОДЕРАЦИИ", val: reviews.filter(r => r.status === "pending").length, color: "var(--color-amber)" },
            { label: "ОТМЕЧЕНЫ", val: reviews.filter(r => r.status === "flagged").length, color: "var(--color-rose)" },
            { label: "ОТКЛОНЕНЫ", val: reviews.filter(r => r.status === "rejected").length, color: "var(--color-muted)" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg px-4 py-4 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
              onClick={() => setFilter(s.label.toLowerCase().split(" ")[0])}
            >
              <div className="text-xs mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</div>
              <div className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(["all", "published", "pending", "flagged", "rejected"] as const).map((f) => {
          const filterLabel: Record<string, string> = { all: "Все", published: "Опубликованы", pending: "На модерации", flagged: "Отмечены", rejected: "Отклонены" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer"
              style={{
                background: filter === f ? "var(--color-amber)" : "var(--color-panel)",
                color: filter === f ? "#0d0c0a" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {filterLabel[f]}
            </button>
          );
        })}
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-lg p-5 cursor-pointer transition-colors"
            style={{
              background: "var(--color-panel)",
              border: `1px solid ${r.status === "flagged" ? "rgba(196,90,66,0.4)" : "var(--color-border)"}`,
            }}
            onClick={() => setSelected(r)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "var(--color-panel)";
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-wrap items-start gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
                  style={{ background: "var(--color-dim)", color: "var(--color-amber)" }}
                >
                  {r.author[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{r.author}</span>
                    <span style={{ color: "var(--color-muted)", fontSize: "12px" }}>{r.flag} {r.country}</span>
                    <span style={{ color: "var(--color-amber)", fontSize: "12px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <div className="text-xs mt-0.5 flex flex-wrap gap-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>{r.tour}</span>
                    <span>·</span>
                    <span>{r.destination}</span>
                    <span>·</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge label={r.status} color={statusColor(r.status) as any} />
              </div>
            </div>

            <div className="mt-3 ml-11">
              <div className="font-medium text-sm mb-1" style={{ color: "var(--color-text)" }}>{r.title}</div>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--color-muted)" }}>{r.body}</p>
            </div>

            {r.status === "flagged" && (
              <div
                className="mt-3 mx-0 rounded px-3 py-2 text-xs flex flex-wrap gap-4"
                style={{ background: "rgba(196,90,66,0.08)", border: "1px solid rgba(196,90,66,0.2)", color: "var(--color-rose)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <span>⚑ Отмечен для модерации</span>
                <button className="ml-auto cursor-pointer underline" onClick={(e) => { e.stopPropagation(); setStatus(r.id, "published"); }}>Одобрить</button>
                <button className="cursor-pointer underline" onClick={(e) => { e.stopPropagation(); setStatus(r.id, "rejected"); }}>Отклонить</button>
              </div>
            )}

            {r.status === "pending" && (
              <div
                className="mt-3 flex flex-wrap gap-2 ml-11"
                onClick={(e) => e.stopPropagation()}
              >
                <Btn variant="ghost" small onClick={() => setStatus(r.id, "published")}>Опубликовать</Btn>
                <Btn variant="danger" small onClick={() => setStatus(r.id, "rejected")}>Отклонить</Btn>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-xl w-full max-w-lg p-6"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-base" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>{selected.author}</span>
                  <span style={{ color: "var(--color-muted)", fontSize: "13px" }}>{selected.flag}</span>
                  <Badge label={selected.status} color={statusColor(selected.status) as any} />
                </div>
                <div className="text-xs" style={{ color: "var(--color-amber)" }}>
                  {"★".repeat(selected.rating)}{"☆".repeat(5 - selected.rating)} {selected.rating}/5
                </div>
              </div>
              <button
                className="text-xl opacity-50 hover:opacity-100 cursor-pointer"
                style={{ color: "var(--color-text)" }}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div className="text-xs mb-4 flex flex-wrap gap-3" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              <span>{selected.tour}</span>
              <span>·</span>
              <span>{selected.destination}</span>
              <span>·</span>
              <span>{selected.date}</span>
            </div>

            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
              {selected.title}
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
              {selected.body}
            </p>

            <div className="flex gap-3 flex-wrap">
              {selected.status !== "published" && (
                <Btn onClick={() => setStatus(selected.id, "published")}>Опубликовать</Btn>
              )}
              {selected.status !== "flagged" && (
                <Btn variant="danger" onClick={() => setStatus(selected.id, "flagged")}>Отметить</Btn>
              )}
              {selected.status !== "rejected" && (
                <Btn variant="danger" onClick={() => setStatus(selected.id, "rejected")}>Отклонить</Btn>
              )}
              <Btn variant="ghost" onClick={() => setSelected(null)}>Закрыть</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
