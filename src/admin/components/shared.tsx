export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1
          className="text-2xl font-semibold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  positive,
  sub,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  sub?: string;
}) {
  return (
    <div
      className="min-w-0 rounded-lg px-4 py-4 sm:px-5"
      style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
    >
      {/* Подписи вроде «ЗАРЕГИСТРИРОВАННЫХ» — одно длинное слово: без
          переноса по буквам оно просто обрезается на узкой карточке. */}
      <div
        className="mb-2 break-words text-xs leading-tight"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div
        className="break-words text-xl font-semibold sm:text-2xl"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
      >
        {value}
      </div>
      {(change || sub) && (
        <div className="text-xs mt-1.5 flex flex-wrap items-center gap-1.5">
          {change && (
            <span style={{ color: positive ? "var(--color-teal)" : "var(--color-rose)" }}>
              {positive ? "↑" : "↓"} {change}
            </span>
          )}
          {sub && <span style={{ color: "var(--color-muted)" }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export function Badge({ label, color }: { label: string; color?: "amber" | "teal" | "rose" | "dim" }) {
  const colors = {
    amber: { bg: "rgba(212,135,42,0.15)", text: "var(--color-amber)" },
    teal: { bg: "rgba(42,141,122,0.15)", text: "var(--color-teal)" },
    rose: { bg: "rgba(196,90,66,0.15)", text: "var(--color-rose)" },
    dim: { bg: "rgba(74,66,55,0.4)", text: "var(--color-muted)" },
  };
  const c = colors[color ?? "dim"];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: c.bg, color: c.text, fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

export function Btn({
  children,
  variant = "primary",
  onClick,
  small,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  onClick?: (e: React.MouseEvent) => void;
  small?: boolean;
}) {
  const styles = {
    primary: {
      background: "var(--color-amber)",
      color: "#0d0c0a",
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-muted)",
      border: "1px solid var(--color-border)",
    },
    danger: {
      background: "rgba(196,90,66,0.15)",
      color: "var(--color-rose)",
      border: "1px solid rgba(196,90,66,0.3)",
    },
  };
  return (
    <button
      onClick={onClick}
      className={`rounded font-medium transition-opacity hover:opacity-80 cursor-pointer ${small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"}`}
      style={{ fontFamily: "var(--font-body)", ...styles[variant] }}
    >
      {children}
    </button>
  );
}

export function Table({
  cols,
  rows,
}: {
  cols: string[];
  rows: React.ReactNode[][];
}) {
  return (
    /*
     * Таблица прокручивается вбок, а не сжимается.
     *
     * Шесть-восемь колонок на телефоне дают по сорок пикселей на
     * ячейку, и содержимое просто пропадало под overflow-hidden.
     * Минимальная ширина держит колонки читаемыми, а лишнее уезжает
     * под палец.
     */
    <div
      className="overflow-x-auto rounded-lg"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <table className="w-full min-w-[46rem] text-sm">
        <thead>
          <tr style={{ background: "var(--color-panel)", borderBottom: "1px solid var(--color-border)" }}>
            {cols.map((c) => (
              <th
                key={c}
                className="text-left px-4 py-3 font-medium"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="transition-colors"
              style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = "var(--color-panel)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
              }}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3" style={{ color: "var(--color-text)" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg ${className ?? ""}`}
      style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", ...style }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-xs font-medium mb-4 tracking-widest uppercase"
      style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}
