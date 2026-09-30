/**
 * Что заведение может менять в своей карточке из кабинета.
 *
 * Только своё и только содержательное: описание, часы, цены, фото,
 * номера, меню, «Полезно знать», наличие. Название, город, статус
 * публикации и скидку Premium не трогает — это решает платформа
 * (скидка — договорённость, а не галочка).
 *
 * Вложенные списки (номера, меню, залы) проверяем обобщённо: только
 * строки, числа и флаги, с потолком на длину и размер. Сломать так можно
 * разве что собственную карточку, а не чужую и не сервер.
 */

export type ВидЗаведения = "hotel" | "restaurant";

const ОБЩИЕ = ["desc", "phone", "img", "imgs", "facts", "connection"] as const;
const ПОЛЯ: Record<ВидЗаведения, readonly string[]> = {
  hotel: [...ОБЩИЕ, "price", "tag", "facilities", "roomTypes"],
  restaurant: [...ОБЩИЕ, "price", "open", "cuisine", "menu", "zones", "tables", "avgCheck"],
};

/** Короткие строки и их потолки; остальные строки — до 2000 знаков. */
const КОРОТКИЕ: Record<string, number> = {
  phone: 40,
  price: 40,
  open: 40,
  tag: 40,
  cuisine: 60,
  avgCheck: 40,
  img: 500,
};

const ВИДЫ_СВЯЗИ = ["none", "manual", "partner", "push"];

/** Ссылка на фото: своё хранилище или https. */
const ссылкаФото = (x: unknown): x is string =>
  typeof x === "string" && x.length <= 500 && (/^\/api\/media\/[\w-]+$/.test(x) || /^https:\/\//.test(x));

/** Обобщённая очистка вложенных данных: без функций, без бесконечной глубины. */
function чисто(x: unknown, глубина = 0): unknown {
  if (глубина > 4) return undefined;
  if (typeof x === "string") return x.trim().slice(0, 1000);
  if (typeof x === "number") return Number.isFinite(x) ? x : undefined;
  if (typeof x === "boolean") return x;
  if (Array.isArray(x))
    return x
      .slice(0, 60)
      .map((y) => чисто(y, глубина + 1))
      .filter((y) => y !== undefined);
  if (x && typeof x === "object") {
    const итог: Record<string, unknown> = {};
    for (const [к, v] of Object.entries(x).slice(0, 30)) {
      if (!/^[\wЀ-ӿ]{1,40}$/.test(к)) continue;
      const ч = чисто(v, глубина + 1);
      if (ч !== undefined) итог[к] = ч;
    }
    return итог;
  }
  return undefined;
}

/**
 * Правки из кабинета → только разрешённые и очищенные поля.
 * null — ничего годного не пришло.
 */
export function чистыеПравки(вид: ВидЗаведения, тело: unknown): Record<string, unknown> | null {
  if (!тело || typeof тело !== "object" || Array.isArray(тело)) return null;
  const итог: Record<string, unknown> = {};
  for (const поле of ПОЛЯ[вид]) {
    if (!(поле in тело)) continue;
    const v = (тело as Record<string, unknown>)[поле];
    switch (поле) {
      case "img":
        if (ссылкаФото(v)) итог.img = v;
        break;
      case "imgs":
        if (Array.isArray(v)) итог.imgs = v.filter(ссылкаФото).slice(0, 20);
        break;
      case "facilities":
        if (Array.isArray(v))
          итог.facilities = v
            .filter((x): x is string => typeof x === "string" && x.trim() !== "")
            .map((x) => x.trim().slice(0, 40))
            .slice(0, 30);
        break;
      case "facts":
        if (Array.isArray(v))
          итог.facts = v
            .flatMap((ф) => {
              const f = ф as Record<string, unknown>;
              if (typeof f?.label !== "string" || typeof f?.value !== "string") return [];
              const label = f.label.trim().slice(0, 60);
              const value = f.value.trim().slice(0, 200);
              if (!label || !value) return [];
              const id = typeof f.id === "string" && f.id ? f.id.slice(0, 40) : `f-${label}`;
              return [{ id, label, value }];
            })
            .slice(0, 30);
        break;
      case "connection": {
        const c = чисто(v) as Record<string, unknown> | undefined;
        if (c && typeof c.kind === "string" && ВИДЫ_СВЯЗИ.includes(c.kind)) итог.connection = c;
        break;
      }
      case "roomTypes":
      case "menu":
      case "zones":
      case "tables":
        if (Array.isArray(v)) итог[поле] = чисто(v);
        break;
      default:
        if (typeof v === "string") итог[поле] = v.trim().slice(0, КОРОТКИЕ[поле] ?? 2000);
    }
  }
  return Object.keys(итог).length ? итог : null;
}
