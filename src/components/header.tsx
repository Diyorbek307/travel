import Link from "next/link";
import HeroPattern from "./hero-pattern";
import Icon from "./icon";
import LangSwitcher from "./lang-switcher";
import type { Lang } from "@/lib/types";

/**
 * Шапка страницы.
 *
 * Форма взята из макета: мелкая надпись капсом сверху, под ней заголовок
 * заголовочным шрифтом. Надпись нужна не для красоты — она называет
 * раздел, а заголовок говорит, что именно открыто, и эти две роли в
 * одной строке не умещались.
 *
 * Зелёный вариант с узором — для витринных экранов вроде «Исследовать»,
 * где шапка часть сцены, а не служебная полоса.
 */
export default function Header({
  lang,
  title,
  subtitle,
  eyebrow,
  back,
  tone = "plain",
}: {
  lang: Lang;
  title: string;
  subtitle?: string;
  /** Название раздела капсом над заголовком. */
  eyebrow?: string;
  back?: string;
  tone?: "plain" | "brand";
}) {
  const brand = tone === "brand";

  return (
    <header
      className={`no-print relative overflow-hidden border-b ${brand ? "" : "sticky top-0 z-30 backdrop-blur"}`}
      style={
        brand
          ? { borderColor: "transparent", background: "var(--primary)", color: "#ffffff" }
          : {
              borderColor: "var(--border)",
              background: "color-mix(in srgb, var(--bg) 88%, transparent)",
            }
      }
    >
      {brand && (
        <div className="absolute inset-0 opacity-20">
          <HeroPattern />
        </div>
      )}

      <div className="relative mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {back && (
          <Link
            href={back}
            aria-label={t_back(lang)}
            className="pressable grid h-9 w-9 shrink-0 place-items-center rounded-full"
            style={
              brand
                ? { background: "rgba(255,255,255,0.18)" }
                : { background: "var(--surface)", border: "1px solid var(--border)" }
            }
          >
            <span className="rotate-180">
              <Icon name="chevron-right" size={16} />
            </span>
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className="truncate text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ color: brand ? "rgba(255,255,255,0.6)" : "var(--text-faint)" }}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="display-font truncate text-lg font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p
              className="truncate text-xs"
              style={{ color: brand ? "rgba(255,255,255,0.7)" : "var(--text-soft)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <LangSwitcher current={lang} onDark={brand} />
      </div>
    </header>
  );
}

/** Подпись кнопки «назад» — единственная строка, нужная самой шапке. */
function t_back(lang: Lang): string {
  if (lang === "uz") return "Orqaga";
  if (lang === "en") return "Back";
  return "Назад";
}
