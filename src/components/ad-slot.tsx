import Icon from "./icon";
import { t } from "@/lib/i18n";
import { pickAdBanner } from "@/lib/db";
import type { AdSlot as Slot, Lang } from "@/lib/types";

/**
 * Рекламный блок.
 *
 * Приложение бесплатное и живёт за счёт рекламы, поэтому блок стоит в
 * потоке списка, а не в углу — иначе его не увидят. Но он намеренно ниже
 * ростом, чем карточка объекта, и в тёплом терракотовом тоне: заметен,
 * но не притворяется содержимым платформы.
 *
 * Пометка «Реклама» обязательна — здесь это чужой бренд, а не наше
 * заведение. (Платное поднятие ресторана в списке — другой случай, там
 * место реальное и проверено, и помечается мягким «Рекомендуем».)
 *
 * Серверный компонент: показ засчитывается при отрисовке в pickAdBanner,
 * а не запросом с клиента, который срезал бы любой блокировщик рекламы.
 */
export default async function AdBannerSlot({
  slot,
  lang,
  className = "",
}: {
  slot: Slot;
  lang: Lang;
  className?: string;
}) {
  const ad = pickAdBanner(slot, lang);
  if (!ad) return null;

  return (
    <aside
      className={`flex items-center gap-3 p-3 card ${className}`}
      style={{ background: "var(--surface-alt)" }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
        style={{ background: "var(--ad-tint)", color: "var(--ad-text)" }}
      >
        <Icon name="sparkle" size={20} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="block text-[0.6rem] uppercase tracking-[0.14em]"
          style={{ color: "var(--ad-text)" }}
        >
          {t(lang, "ad_label")}
        </span>
        <span className="block truncate font-medium">{ad.title}</span>
        {ad.subtitle && (
          <span className="block truncate text-xs soft">{ad.subtitle}</span>
        )}
      </span>

      {/* Переход считается на нашей стороне и только потом ведёт наружу:
          прямая ссылка не дала бы рекламодателю отчёта по кликам. */}
      <a
        href={`/api/ads/${ad.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="pressable shrink-0 rounded-[var(--radius-full)] px-3.5 py-2 text-xs font-medium"
        style={{ background: "var(--ad-strong)", color: "#ffffff" }}
      >
        {ad.cta_label || t(lang, "see_all")}
      </a>
    </aside>
  );
}
