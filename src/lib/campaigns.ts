import { randomBytes } from "node:crypto";
import path from "node:path";
import { создатьХранилище } from "./storage";
import {
  идётСегодня,
  подходит,
  сегодняВТашкенте,
  type Зритель,
  type Кампания,
  type КампанияСоСчётом,
} from "./campaign-rules";

/**
 * Кампании уведомлений, которые пишет редактор в панели.
 *
 * Прочтения лежат отдельно от самих кампаний: кампанию правят редко, а
 * прочтения прибывают с каждым открытием колокольчика. В одном документе
 * каждая отметка переписывала бы и тексты всех кампаний, и две правки
 * разом мешали бы друг другу.
 *
 * Прочтение считается по аккаунту, а не по нажатию: один человек,
 * открывший колокольчик пять раз, — одно прочтение.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const кампании = создатьХранилище<Кампания[]>(path.join(DATA_DIR, "campaigns.json"), () => []);
/** id кампании → id аккаунтов, которые её прочитали. */
const прочтения = создатьХранилище<Record<string, string[]>>(
  path.join(DATA_DIR, "campaign-reads.json"),
  () => ({}),
);

export async function listCampaigns(): Promise<КампанияСоСчётом[]> {
  const [все, счёт] = await Promise.all([кампании.read(), прочтения.read()]);
  return [...все]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((к) => ({ ...к, reads: счёт[к.id]?.length ?? 0 }));
}

export async function getCampaign(id: string): Promise<Кампания | null> {
  return (await кампании.read()).find((к) => к.id === id) ?? null;
}

/** Поля, которые задаёт редактор; остальное хранилище ставит само. */
export type ПоляКампании = Pick<
  Кампания,
  "title" | "body" | "emoji" | "link" | "audience" | "from" | "to" | "active"
>;

export async function createCampaign(поля: ПоляКампании): Promise<Кампания> {
  const сейчас = new Date().toISOString();
  const новая: Кампания = {
    ...поля,
    id: `cmp-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`,
    createdAt: сейчас,
    updatedAt: сейчас,
  };
  await кампании.update((все) => [[...все, новая], undefined]);
  return новая;
}

export async function updateCampaign(id: string, поля: Partial<ПоляКампании>): Promise<Кампания | null> {
  return кампании.update((все) => {
    const i = все.findIndex((к) => к.id === id);
    if (i < 0) return [все, null];
    const обновлённая: Кампания = { ...все[i], ...поля, id, updatedAt: new Date().toISOString() };
    const копия = [...все];
    копия[i] = обновлённая;
    return [копия, обновлённая];
  });
}

/** Отметить рассылку push: когда и скольким ушло. */
export async function markPushed(id: string, отправлено: number): Promise<void> {
  await кампании.update((все) => [
    все.map((к) => (к.id === id ? { ...к, pushedAt: new Date().toISOString(), pushSent: отправлено } : к)),
    undefined,
  ]);
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const было = await кампании.update((все) => [все.filter((к) => к.id !== id), все.some((к) => к.id === id)]);
  // Прочтения удалённой кампании больше ни к чему не относятся.
  await прочтения.update((счёт) => {
    const { [id]: _удалено, ...остальное } = счёт;
    return [остальное, undefined];
  });
  return было;
}

/** Кампании, которые идут сегодня и подходят этому человеку. */
export async function campaignsFor(кто: Зритель): Promise<Кампания[]> {
  const сегодня = сегодняВТашкенте();
  return (await кампании.read())
    .filter((к) => идётСегодня(к, сегодня) && подходит(к, кто))
    .sort((a, b) => b.from.localeCompare(a.from) || b.createdAt.localeCompare(a.createdAt));
}

/** Отметить прочтение. Повторное прочтение тем же аккаунтом не считается. */
export async function markRead(campaignIds: string[], userId: string): Promise<void> {
  const известные = new Set((await кампании.read()).map((к) => к.id));
  const ids = campaignIds.filter((id) => известные.has(id));
  if (ids.length === 0) return;
  await прочтения.update((счёт) => {
    const новое = { ...счёт };
    for (const id of ids) {
      const кто = новое[id] ?? [];
      if (!кто.includes(userId)) новое[id] = [...кто, userId];
    }
    return [новое, undefined];
  });
}
