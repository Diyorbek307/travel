/** Бегущая строка приветствий на 10 языках приложения, между двумя полосами «изразца». */
const ПРИВЕТЫ = [
  "Salom",
  "Hello",
  "Привет",
  "你好",
  "안녕하세요",
  "Hallo",
  "Bonjour",
  "こんにちは",
  "Merhaba",
  "مرحبا",
];

function Изразец() {
  // Узор-«ёлочка» — отсылка к майолике Хивы, без картинок.
  return (
    <div
      aria-hidden
      className="h-3 w-full"
      style={{
        background:
          "repeating-linear-gradient(135deg, var(--accent) 0 8px, transparent 8px 16px), repeating-linear-gradient(45deg, var(--gold) 0 4px, transparent 4px 16px)",
        opacity: 0.55,
      }}
    />
  );
}

export default function Marquee() {
  const ряд = [...ПРИВЕТЫ, ...ПРИВЕТЫ];
  return (
    <div style={{ background: "var(--night)", color: "var(--paper)" }}>
      <Изразец />
      <div className="overflow-hidden py-6">
        <div className="marquee">
          {[...ряд, ...ряд].map((с, i) => (
            <span
              key={i}
              className="serif flex items-center gap-8 px-8 text-4xl font-semibold italic sm:text-5xl"
            >
              {с}
              <span className="text-2xl not-italic" style={{ color: "var(--accent-light)" }}>
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
      <Изразец />
    </div>
  );
}
