import HeroCanvas from "@/components/hero-canvas";
import Logo from "@/components/logo";
import Reveal from "@/components/reveal";
import SilkRoad from "@/components/silk-road";

const APP_URL = "https://uzbekistan-travel.onrender.com";

/**
 * Цифры — фактическое наполнение приложения (то, что видно туристу).
 * Панель пополняет данные, поэтому при заметных изменениях их стоит
 * сверить с /api/content.
 */
const NUMBERS = [
  { value: "13", label: "городов" },
  { value: "20", label: "мест" },
  { value: "15", label: "ресторанов" },
  { value: "10", label: "языков" },
];

const FEATURES = [
  {
    icon: "🧭",
    title: "План дня под ваше время",
    text:
      "«У меня 6 часов в Самарканде, люблю историю» — приложение расставит места " +
      "по порядку, посчитает дорогу и цены входа и вставит обед по пути.",
  },
  {
    icon: "🏨",
    title: "Отели и рестораны",
    text:
      "Номера, кухни, цены и отзывы. Заявка на бронь уходит команде, и статус " +
      "меняется прямо в приложении — без звонков и переписки.",
  },
  {
    icon: "💬",
    title: "AI-гид на вашем языке",
    text:
      "Спросите что угодно: где поесть плов, чем заняться вечером. Гид советует " +
      "то, что есть в приложении, а не выдуманные адреса.",
  },
  {
    icon: "⬇️",
    title: "Работает офлайн",
    text:
      "Город скачивается перед поездкой: описания и фотографии остаются под рукой " +
      "без интернета и роуминга.",
  },
  {
    icon: "🛂",
    title: "Цифровой паспорт",
    text:
      "За каждое открытое место — штамп, за серии — достижения. Приятно собрать " +
      "весь Самарканд до конца поездки.",
  },
  {
    icon: "🆘",
    title: "SOS и живая поддержка",
    text:
      "Кнопка SOS отправляет команде вашу геолокацию, а в чате поддержки отвечает " +
      "человек, а не автоответчик.",
  },
];

export default function Home() {
  return (
    <main>
      {/* ---------------- Первый экран ---------------- */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroCanvas />
        </div>

        {/* Затемнение снизу: текст должен читаться поверх сцены */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 30%, #04080b 78%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <div className="mb-10 flex items-center gap-3">
            <Logo size={44} />
            <span className="text-2xl font-semibold tracking-tight">
              Hello<span className="shine">UZ</span>
            </span>
          </div>
          <p className="eyebrow mb-6">Путеводитель по Узбекистану</p>
          <h1 className="display mb-6 max-w-4xl">
            Узбекистан <span className="shine">без гида</span>
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed soft">
            План дня под ваше время, отели и рестораны, AI-гид на вашем языке
            и офлайн-режим. Всё, что нужно в поездке, — в одном приложении.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-7 py-3.5 font-medium text-[#04080b] transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(100deg,#34dccf,#8ae9e0)" }}
            >
              Открыть платформу
            </a>
            <a
              href="#how"
              className="glass rounded-full px-7 py-3.5 font-medium transition-colors hover:border-[#34dccf]"
            >
              Как это работает
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs soft">
          листайте вниз
        </div>
      </section>

      {/* ---------------- Цифры ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="hairline mb-16" />
        <ul className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <li key={n.label}>
              <Reveal delay={i * 0.08}>
                <p className="text-5xl font-semibold tabular-nums md:text-6xl">
                  {n.value}
                </p>
                <p className="eyebrow mt-2">{n.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-sm soft">
          Это не макет: приложение развёрнуто и работает. Цифры — фактическое
          наполнение на сегодня, а не план.
        </p>
      </section>

      {/* ---------------- Шёлковый путь ---------------- */}
      <SilkRoad />

      {/* ---------------- Возможности ---------------- */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="eyebrow mb-4">Что умеет</p>
          <h2 className="display-sm mb-16 max-w-2xl">
            От планирования поездки до возвращения домой
          </h2>
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-2xl md:grid-cols-2 lg:grid-cols-3"
             style={{ background: "var(--line)" }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <article
                className="h-full p-8"
                style={{ background: "var(--bg)" }}
              >
                <div className="mb-5 text-3xl">{f.icon}</div>
                <h3 className="mb-3 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed soft">{f.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Живое демо ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="eyebrow mb-4">Живое демо</p>
          <h2 className="display-sm mb-6 max-w-2xl">
            Платформа работает прямо здесь
          </h2>
          <p className="mb-14 max-w-xl leading-relaxed soft">
            Это не видеозапись и не макет, а настоящее приложение внутри страницы.
            Выберите город, постройте маршрут, откройте объект.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex justify-center">
            {/* Рамка телефона: демо читается как продукт, а не как вставка */}
            <div
              className="w-full max-w-[380px] rounded-[2.5rem] p-3"
              style={{ background: "var(--bg-soft)", border: "1px solid var(--line)" }}
            >
              <iframe
                src={APP_URL}
                title="HelloUZ — живое демо"
                loading="lazy"
                className="h-[720px] w-full rounded-[2rem]"
                style={{ border: "none", background: "#fff" }}
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Призыв ---------------- */}
      <section className="mx-auto max-w-6xl px-6 pb-32">
        <Reveal>
          <div className="glass rounded-3xl px-8 py-16 text-center md:px-16">
            <h2 className="display-sm mb-6">Посмотреть платформу целиком</h2>
            <p className="mx-auto mb-10 max-w-lg leading-relaxed soft">
              Открывается в браузере телефона, ставится на домашний экран
              и работает офлайн. Установка из магазина не нужна.
            </p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full px-8 py-4 font-medium text-[#04080b] transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(100deg,#34dccf,#8ae9e0)" }}
            >
              Открыть платформу
            </a>
          </div>
        </Reveal>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed soft">
          Тексты о местах составлены по общедоступным сведениям и проходят
          проверку. Аудиогиды появятся по мере записи — до тех пор раздел честно
          пуст, а не заполнен синтезом.
        </p>
      </section>
    </main>
  );
}
