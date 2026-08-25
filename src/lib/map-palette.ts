/**
 * Шкала карты: от песочного к зелёному по количеству объектов.
 *
 * Модуль намеренно не знает про three.js. Тем же цветом красятся карточки
 * регионов в списке — список должен читаться заодно с картой, — а тянуть
 * ради трёх цветов трёхмерную библиотеку в основной бандл нельзя.
 */

/**
 * Опорные точки шкалы: пусто → средне → много.
 *
 * Диапазон намеренно светлый. Насыщенная зелень спорила с тёмным торцом
 * выдавленной области и превращала карту в цветную заливку; в макете
 * плоскости кремовые, а объём держится на контрасте светлого верха
 * и почти чёрной стенки. Данные цвет по-прежнему несёт — просто тише.
 */
export const RAMP = ["#f2ecdc", "#cfdcc4", "#8aab8c"] as const;

/** Готовый градиент для легенды и полосок в интерфейсе. */
export const RAMP_CSS = `linear-gradient(90deg, ${RAMP.join(", ")})`;

function channels(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Цвет шкалы для доли от нуля до единицы. */
export function rampColor(ratio: number): string {
  const clamped = Math.min(1, Math.max(0, ratio));
  const [from, to, t] =
    clamped < 0.5
      ? [RAMP[0], RAMP[1], clamped * 2]
      : [RAMP[1], RAMP[2], (clamped - 0.5) * 2];

  const a = channels(from);
  const b = channels(to);
  const mixed = a.map((v, i) => Math.round(v + (b[i] - v) * (t as number)));

  return `rgb(${mixed[0]} ${mixed[1]} ${mixed[2]})`;
}
