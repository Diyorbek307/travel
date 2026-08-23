/**
 * Поля форм админ-панели.
 *
 * Обычные серверные компоненты без состояния: значения задаются через
 * defaultValue, а отправку берёт на себя серверное действие. Клиентский
 * JavaScript здесь не нужен, и формы работают даже до его загрузки.
 */

const inputStyle = {
  background: "var(--bg-soft)",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

export function Input({
  name,
  label,
  hint,
  ...rest
}: {
  name: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        name={name}
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={inputStyle}
        {...rest}
      />
      {hint && <span className="mt-1 block text-xs soft">{hint}</span>}
    </label>
  );
}

export function TextArea({
  name,
  label,
  hint,
  ...rest
}: {
  name: string;
  label: string;
  hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea
        name={name}
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={inputStyle}
        {...rest}
      />
      {hint && <span className="mt-1 block text-xs soft">{hint}</span>}
    </label>
  );
}

export function Select({
  name,
  label,
  options,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={inputStyle}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs soft">{hint}</span>}
    </label>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  value,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  value?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

export function Fieldset({
  legend,
  hint,
  children,
  className = "",
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={`mb-5 rounded-xl p-4 surface ${className}`}>
      <legend className="px-1 text-sm font-semibold">{legend}</legend>
      {hint && <p className="mb-3 text-xs soft">{hint}</p>}
      {children}
    </fieldset>
  );
}

export function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border)" }}>
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide soft"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      {children}
    </tr>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}
