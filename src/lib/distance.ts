"use client";

import { useSettings } from "@/lib/settings";
import { useT } from "@/components/lang-provider";

/**
 * Расстояния в тех единицах, что человек выбрал в настройках.
 *
 * Переключатель «км / миль» раньше только сохранялся: на карточках всё
 * равно стояли километры, и настройка выглядела сломанной. Формат живёт
 * в одном месте, чтобы такое не расползалось снова.
 */

const МИЛЯ_В_КМ = 1.609344;

export function useДистанция() {
  const { units } = useSettings();
  const { t } = useT();
  const мили = units === "imperial";
  const подпись = мили ? t("unit_mi") : t("unit_km");

  /** Число километров → подпись для показа. */
  function формат(км: number): string {
    const значение = мили ? км / МИЛЯ_В_КМ : км;
    const число = значение < 10 ? значение.toFixed(1) : String(Math.round(значение));
    return `${число} ${подпись}`;
  }

  /**
   * Готовая строка из данных вида «1.2 км».
   *
   * Ноль означает «это и есть центр» — «0 км» на карточке читалось как
   * сбой, поэтому там пишем словами. Всё остальное пересчитываем, если
   * человек выбрал мили.
   */
  function изДанных(строка: string): string {
    const m = /^\s*([\d.,]+)\s*км/i.exec(строка);
    if (!m) return строка;
    const км = parseFloat(m[1].replace(",", "."));
    if (!Number.isFinite(км)) return строка;
    if (км === 0) return t("dist_center");
    return формат(км);
  }

  return { формат, изДанных, подпись };
}
