import Link from "next/link";
import LangSwitcher from "./lang-switcher";
import type { Lang } from "@/lib/types";

/** Шапка страницы: заголовок, кнопка «назад» и переключатель языка. */
export default function Header({
  lang,
  title,
  subtitle,
  back,
}: {
  lang: Lang;
  title: string;
  subtitle?: string;
  back?: string;
}) {
  return (
    <header
      className="no-print sticky top-0 z-30 border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {back && (
          <Link
            href={back}
            aria-label="Назад"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full surface"
          >
            ←
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs soft">{subtitle}</p>}
        </div>
        <LangSwitcher current={lang} />
      </div>
    </header>
  );
}
