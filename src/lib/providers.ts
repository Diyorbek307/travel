import path from "node:path";
import { randomBytes } from "node:crypto";
import { создатьХранилище } from "./storage";
import {
  ТАРИФЫ_ПО_УМОЛЧАНИЮ,
  продлить,
  порядокКаталога,
  публично,
  виденВКаталоге,
  type Партнёр,
  type ТурПартнёра,
  type Тарифы,
  type ВидПартнёра,
} from "./provider-rules";

/**
 * Водители и гиды: анкеты, туры гидов и тарифы.
 *
 * Отдельно от общего содержимого (content.json): в анкетах телефоны,
 * госномера и заметки менеджера, а содержимое целиком уходит в браузер.
 * Туристу отсюда отдаётся только публичная часть (см. публично()).
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

interface Данные {
  партнёры: Партнёр[];
  туры: ТурПартнёра[];
  тарифы: Тарифы;
}

const хранилище = создатьХранилище<Данные>(path.join(DATA_DIR, "providers.json"), () => ({
  партнёры: [],
  туры: [],
  тарифы: ТАРИФЫ_ПО_УМОЛЧАНИЮ,
}));

const новыйId = (префикс: string) => `${префикс}_${randomBytes(6).toString("hex")}`;

export async function всеДанные(): Promise<Данные> {
  const д = await хранилище.read();
  return {
    партнёры: д.партнёры ?? [],
    туры: д.туры ?? [],
    тарифы: { ...ТАРИФЫ_ПО_УМОЛЧАНИЮ, ...(д.тарифы ?? {}) },
  };
}

export async function тарифы(): Promise<Тарифы> {
  return (await всеДанные()).тарифы;
}

export async function сохранитьТарифы(т: Тарифы): Promise<void> {
  await хранилище.update((д) => [{ ...д, тарифы: т }, undefined]);
}

export async function партнёрПоId(id: string): Promise<Партнёр | null> {
  return (await всеДанные()).партнёры.find((п) => п.id === id) ?? null;
}

export async function партнёрыПользователя(userId: string): Promise<Партнёр[]> {
  return (await всеДанные()).партнёры.filter((п) => п.userId === userId);
}

/** Каталог для туристов: только видимые, «Рекомендуем» сверху. */
export async function каталог() {
  const { партнёры, туры } = await всеДанные();
  const сейчас = Date.now();
  const видимые = партнёры
    .filter((п) => виденВКаталоге(п, сейчас))
    .sort((a, b) => порядокКаталога(a, b, сейчас));
  const ids = new Set(видимые.map((п) => п.id));
  return {
    drivers: видимые.filter((п) => п.kind === "driver").map((п) => публично(п, сейчас)),
    guides: видимые.filter((п) => п.kind === "guide").map((п) => публично(п, сейчас)),
    tours: туры.filter((т) => т.status === "active" && ids.has(т.providerId)),
  };
}

/** Новая анкета: из кабинета — на проверку, от менеджера — сразу как скажет он. */
export async function создатьПартнёра(
  вид: ВидПартнёра,
  поля: Partial<Партнёр>,
  кто: { userId: string | null },
): Promise<Партнёр> {
  const сейчас = new Date().toISOString();
  const п: Партнёр = {
    id: новыйId(вид === "driver" ? "drv" : "gd"),
    kind: вид,
    userId: кто.userId,
    status: "pending",
    verified: false,
    name: "",
    photo: "",
    phone: "",
    city: "",
    cities: [],
    languages: [],
    bio: "",
    experienceYears: 0,
    priceDay: 0,
    hoursPerDay: 10,
    includes: [],
    photos: [],
    paidUntil: null,
    promotedUntil: null,
    promoPriority: 0,
    views: 0,
    requests: 0,
    createdAt: сейчас,
    updatedAt: сейчас,
    ...поля,
  };
  await хранилище.update((д) => [{ ...д, партнёры: [...(д.партнёры ?? []), п] }, undefined]);
  return п;
}

/** Правка анкеты внутри очереди. null — такой нет. */
export async function изменитьПартнёра(id: string, правка: (п: Партнёр) => Партнёр): Promise<Партнёр | null> {
  return хранилище.update((д) => {
    const все = д.партнёры ?? [];
    const i = все.findIndex((п) => п.id === id);
    if (i < 0) return [д, null];
    const новый = { ...правка(все[i]), id, updatedAt: new Date().toISOString() };
    const копия = [...все];
    копия[i] = новый;
    return [{ ...д, партнёры: копия }, новый];
  });
}

export async function удалитьПартнёра(id: string): Promise<boolean> {
  return хранилище.update((д) => {
    const было = (д.партнёры ?? []).length;
    const партнёры = (д.партнёры ?? []).filter((п) => п.id !== id);
    const туры = (д.туры ?? []).filter((т) => т.providerId !== id);
    return [{ ...д, партнёры, туры }, партнёры.length < было];
  });
}

/** Одобрить: проверен, активен и — если ещё не оплачено — пробный период. */
export async function одобрить(id: string): Promise<Партнёр | null> {
  const т = await тарифы();
  return изменитьПартнёра(id, (п) => ({
    ...п,
    status: "active",
    verified: true,
    statusNote: undefined,
    paidUntil:
      п.paidUntil && new Date(п.paidUntil).getTime() > Date.now() ? п.paidUntil : продлить(null, т.trialDays),
  }));
}

/** Оплата прошла — продлеваем размещение или продвижение. */
export async function зачестьОплату(id: string, дней: number, продвижение: boolean): Promise<void> {
  await изменитьПартнёра(id, (п) =>
    продвижение
      ? { ...п, promotedUntil: продлить(п.promotedUntil, дней) }
      : { ...п, paidUntil: продлить(п.paidUntil, дней) },
  );
}

/** Счётчики просмотров и заявок — для статистики в кабинете. */
export async function отметить(id: string, что: "views" | "requests"): Promise<void> {
  await изменитьПартнёра(id, (п) => ({ ...п, [что]: (п[что] ?? 0) + 1 }));
}

/* ── Туры гидов ──────────────────────────────────────────────────────── */

export async function турПоId(id: string): Promise<ТурПартнёра | null> {
  return (await всеДанные()).туры.find((т) => т.id === id) ?? null;
}

export async function сохранитьТур(
  providerId: string,
  поля: Omit<ТурПартнёра, "id" | "providerId" | "createdAt" | "updatedAt">,
  id?: string,
): Promise<ТурПартнёра | null> {
  const сейчас = new Date().toISOString();
  return хранилище.update((д) => {
    const туры = д.туры ?? [];
    if (id) {
      const i = туры.findIndex((т) => т.id === id && т.providerId === providerId);
      if (i < 0) return [д, null];
      const новый = { ...туры[i], ...поля, updatedAt: сейчас };
      const копия = [...туры];
      копия[i] = новый;
      return [{ ...д, туры: копия }, новый];
    }
    const тур: ТурПартнёра = { ...поля, id: новыйId("tr"), providerId, createdAt: сейчас, updatedAt: сейчас };
    return [{ ...д, туры: [...туры, тур] }, тур];
  });
}

export async function удалитьТур(providerId: string, id: string): Promise<boolean> {
  return хранилище.update((д) => {
    const туры = д.туры ?? [];
    const стало = туры.filter((т) => !(т.id === id && т.providerId === providerId));
    return [{ ...д, туры: стало }, стало.length < туры.length];
  });
}
