"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Скролл-история: перелёт по Шёлковому пути.
 *
 * Секция закрепляется на экране, а прокрутка внутри неё переключает города.
 * Приём даёт ощущение управляемого фильма вместо простыни текста — и это
 * то, за что обычно платят агентствам.
 *
 * Цифры взяты из работающей платформы, а не придуманы: их видно в базе.
 */

const CITIES = [
  {
    slug: "tashkent",
    name: "Ташкент",
    lead: "Точка прилёта",
    text:
      "Международный аэропорт, вокзал скоростных поездов и метро с самыми " +
      "красивыми станциями региона. Отсюда начинается маршрут большинства туристов.",
    stat: "12 объектов",
    accent: "#35c2c2",
  },
  {
    slug: "samarkand",
    name: "Самарканд",
    lead: "Сердце Шёлкового пути",
    text:
      "Регистан, Гур-Эмир, Шахи-Зинда, обсерватория Улугбека. Платформа " +
      "собирает маршрут по ним с учётом часов работы и вашего бюджета времени.",
    stat: "14 объектов",
    accent: "#71dcd9",
  },
  {
    slug: "bukhara",
    name: "Бухара",
    lead: "Город-музей",
    text:
      "Более 140 памятников на компактной территории. Пои-Калян, крепость Арк, " +
      "торговые купола — весь исторический центр обходится пешком за день.",
    stat: "12 объектов",
    accent: "#cd9a60",
  },
  {
    slug: "khiva",
    name: "Хива",
    lead: "Крепость в песках",
    text:
      "Ичан-Кала целиком внесена в список ЮНЕСКО — первый объект Всемирного " +
      "наследия в Узбекистане. Средневековый город сохранился как единое целое.",
    stat: "10 объектов",
    accent: "#dcbb8e",
  },
];

export default function SilkRoad() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = section.current;
    const trackEl = track.current;
    if (!sectionEl || !trackEl) return;

    // Без анимации секция остаётся обычным вертикальным списком —
    // содержимое доступно целиком, ничего не теряется.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const panels = gsap.utils.toArray<HTMLElement>(".silk-panel", trackEl);

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          // Длина прокрутки: по экрану на город.
          //
          // Считаем в пикселях от высоты окна, а не в процентах: процент
          // ScrollTrigger берёт от высоты самого элемента, а закрепление
          // добавляет элементу распорку — элемент растёт, конец уезжает,
          // распорка растёт снова. Получается петля на десятки тысяч пикселей.
          end: () => `+=${panels.length * window.innerHeight}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      panels.forEach((panel, index) => {
        if (index === 0) {
          gsap.set(panel, { autoAlpha: 1, yPercent: 0 });
        } else {
          gsap.set(panel, { autoAlpha: 0, yPercent: 12 });
          timeline.to(
            panel,
            { autoAlpha: 1, yPercent: 0, ease: "none" },
            index - 0.5,
          );
        }
        // Предыдущая панель уходит одновременно с приходом следующей.
        if (index < panels.length - 1) {
          timeline.to(
            panel,
            { autoAlpha: 0, yPercent: -12, ease: "none" },
            index + 0.5,
          );
        }
      });

      // Полоса прогресса маршрута снизу.
      timeline.fromTo(
        ".silk-progress",
        { scaleX: 0 },
        { scaleX: 1, ease: "none" },
        0,
      );
    }, sectionEl);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      className="relative flex min-h-screen items-center overflow-hidden"
      aria-label="Города платформы"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="eyebrow mb-8">Великий шёлковый путь</p>

        <div ref={track} className="relative min-h-[22rem]">
          {CITIES.map((city, index) => (
            <article
              key={city.slug}
              className="silk-panel inset-0 md:absolute"
              style={{ position: index === 0 ? "relative" : undefined }}
            >
              <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
                <div>
                  <p
                    className="mb-3 text-sm font-medium"
                    style={{ color: city.accent }}
                  >
                    {city.lead}
                  </p>
                  <h3 className="display-sm mb-4">{city.name}</h3>
                  <p className="max-w-xl text-lg leading-relaxed soft">{city.text}</p>
                </div>

                <div className="md:text-right">
                  <p
                    className="text-5xl font-semibold tabular-nums md:text-6xl"
                    style={{ color: city.accent }}
                  >
                    {city.stat.split(" ")[0]}
                  </p>
                  <p className="eyebrow mt-2">{city.stat.split(" ")[1]}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <div className="hairline" />
          <div
            className="silk-progress mt-[-1px] h-[2px] origin-left"
            style={{ background: "linear-gradient(90deg,#35c2c2,#cd9a60)" }}
          />
          <div className="mt-4 flex justify-between text-xs soft">
            {CITIES.map((c) => (
              <span key={c.slug}>{c.name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
