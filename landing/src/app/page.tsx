import HeroCanvas from "@/components/hero-canvas";
import Reveal from "@/components/reveal";
import SilkRoad from "@/components/silk-road";

const APP_URL = "https://uzbekistan-travel.onrender.com";

/** Цифры берутся из работающей платформы — их видно в базе, они не выдуманы. */
const NUMBERS = [
  { value: "4", label: "города" },
  { value: "48", label: "объектов" },
  { value: "11", label: "маршрутов" },
  { value: "3", label: "языка" },
];

const FEATURES = [
  {
    icon: "🧭",
    title: "Маршрут под ваше время",
    text:
      "«У меня 6 часов в Самарканде» — платформа собирает маршрут с учётом часов " +
      "работы, цен и способа передвижения. Главные объекты города ставятся первыми.",
  },
  {
    icon: "📷",
    title: "QR-аудиогид",
    text:
      "Табличка на объекте, сканирование — и открывается рассказ. Работает и без " +
      "установленного приложения, в обычном браузере телефона.",
  },
  {
    icon: "🏛",
    title: "Музеи по экспонатам",
    text:
      "У каждой витрины свой код. Турист проходит зал сам, слушая рассказ именно " +
      "о том предмете, перед которым стоит.",
  },
  {
    icon: "💬",
    title: "Помощник на своём языке",
    text:
      "«Что рядом?», «Расскажи историю Регистана», «Где поесть?» — понимает " +
      "естественную речь. Маршруты и цены берёт из базы, а не выдумывает.",
  },
  {
    icon: "⬇️",
    title: "Работает офлайн",
    text:
      "Город скачивается перед поездкой: карта, маршруты, описания и аудиогиды " +
      "остаются доступны без интернета и роуминга.",
  },
  {
    icon: "🛂",
    title: "Туристический паспорт",
    text:
      "За посещение объектов турист собирает штампы и достижения. Простая механика, " +
      "которая заметно поднимает возвращаемость.",
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
          <p className="eyebrow mb-6">Цифровая туристическая платформа</p>
          <h1 className="display mb-6 max-w-4xl">
            Узбекистан <span className="shine">без гида</span>
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed soft">
            Маршруты под ваше время, аудиогиды по QR прямо на объектах, музеи
            по экспонатам и офлайн-режим. Ваш персональный гид всегда с вами.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-7 py-3.5 font-medium text-[#04080b] transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(100deg,#35c2c2,#71dcd9)" }}
            >
              Открыть платформу
            </a>
            <a
              href="#how"
              className="glass rounded-full px-7 py-3.5 font-medium transition-colors hover:border-[#35c2c2]"
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
          Это не макет: платформа развёрнута и работает. Цифры — фактическое
          наполнение базы на сегодня, а не план.
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
                title="Демонстрация платформы"
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
              style={{ background: "linear-gradient(100deg,#35c2c2,#71dcd9)" }}
            >
              Открыть платформу
            </a>
          </div>
        </Reveal>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed soft">
          Демонстрационная версия. Тексты об объектах — черновые, составлены
          по общедоступным сведениям и требуют проверки историком. Профессиональная
          озвучка не записана: до её появления приложение читает тексты синтезом речи
          и прямо сообщает об этом в интерфейсе.
        </p>
      </section>
    </main>
  );
}
