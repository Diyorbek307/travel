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
    amber: { bg: "color-mix(in srgb, var(--color-amber) 15%, transparent)", text: "var(--color-amber)" },
    teal: { bg: "color-mix(in srgb, var(--color-teal) 15%, transparent)", text: "var(--color-teal)" },
    rose: { bg: "color-mix(in srgb, var(--color-rose) 15%, transparent)", text: "var(--color-rose)" },
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
      color: "var(--color-on-accent)",
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-muted)",
      border: "1px solid var(--color-border)",
    },
    danger: {
      background: "color-mix(in srgb, var(--color-rose) 15%, transparent)",
      color: "var(--color-rose)",
      border: "1px solid color-mix(in srgb, var(--color-rose) 30%, transparent)",
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

/**
 * Пометка раздела, который пока показывает придуманные строки.
 *
 * Цифры в таких разделах выглядят как настоящая выручка, настоящие
 * выплаты гидам и настоящие кампании — по ним можно принять решение и
 * ошибиться. Пока к разделу не подключён живой источник, об этом
 * сказано прямо на экране, а не в документации.
 */
export function ДемоРаздел({ что }: { что: string }) {
  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
      style={{
        background: "color-mix(in srgb, var(--color-rose) 12%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-rose) 35%, transparent)",
        color: "var(--color-text)",
      }}
    >
      <span className="text-base leading-none">⚠️</span>
      <span>
        <b>Данные примерные.</b> {что} Цифрам на этом экране верить нельзя — это образец
        того, как раздел будет выглядеть с настоящим источником.
      </span>
    </div>
  );
}
