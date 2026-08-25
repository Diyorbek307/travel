import { ICON_PATHS, type IconName } from "@/lib/icon-paths";

export type { IconName };

/**
 * Иконка приложения.
 *
 * Собственные SVG, а не эмодзи: эмодзи рисует шрифт системы, поэтому один
 * и тот же символ выглядит по-разному на Android, iOS и Windows, не
 * подчиняется цветовым токенам и не масштабируется вместе с текстом.
 *
 * Отдельную библиотеку не подключаем: нужных иконок полтора десятка,
 * а лишний пакет — это вес в офлайн-пакете города.
 */
export default function Icon({
  name,
  size = 24,
  filled = false,
  className = "",
  title,
}: {
  name: IconName;
  size?: number;
  /** Заливка вместо контура — для активного пункта навигации. */
  filled?: boolean;
  className?: string;
  /**
   * Словесное описание. Задавать только если иконка стоит без подписи:
   * рядом с текстом она декоративна, и диктор должен её пропустить.
   */
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      // Разметка берётся из собственной константы, пользовательских данных
      // здесь нет — подстановка безопасна.
      dangerouslySetInnerHTML={{
        __html: (title ? `<title>${title}</title>` : "") + ICON_PATHS[name],
      }}
    />
  );
}
