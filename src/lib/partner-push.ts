import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { создатьХранилище } from "./storage";
import type { Наличие } from "./availability";
import type { ВидЗаведения } from "./partners";

/**
 * Режим «Система присылает сама» (push).
 *
 * Не у каждой кассы или системы гостиницы есть свой API, который мы могли
 * бы опрашивать. Зато отправить HTTP-запрос умеет любая. Поэтому второй
 * путь подключения обратный: заведение получает в панели ключ приёма, а
 * его система сама присылает нам свободные номера и столы и забирает
 * новые брони туристов (docs/partner-api.md, раздел «Присылает сама»).
 *
 * Ключ показывается один раз; храним только его хеш — утечка файла не
 * даст чужому присылать цифры от имени заведения.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

type Заведение = { вид: ВидЗаведения; id: string; выдан: string };

/** Хеш ключа → заведение. */
const ключи = создатьХранилище<Record<string, Заведение>>(
  path.join(DATA_DIR, "partner-keys.json"),
  () => ({}),
);
/** «вид:id» → последнее присланное наличие. */
const присланное = создатьХранилище<Record<string, Наличие>>(
  path.join(DATA_DIR, "partner-pushed.json"),
  () => ({}),
);

const хеш = (ключ: string) => createHash("sha256").update(ключ).digest("hex");
const имя = (вид: ВидЗаведения, id: string) => `${вид}:${id}`;

/** Выдать новый ключ приёма. Прежний ключ этого заведения перестаёт работать. */
export async function выдатьКлючПриёма(вид: ВидЗаведения, id: string): Promise<string> {
  const ключ = `hz_${randomBytes(24).toString("base64url")}`;
  await ключи.update((все) => {
    const без = Object.fromEntries(Object.entries(все).filter(([, з]) => !(з.вид === вид && з.id === id)));
    return [{ ...без, [хеш(ключ)]: { вид, id, выдан: new Date().toISOString() } }, undefined];
  });
  return ключ;
}

/** Отозвать ключ приёма заведения. */
export async function отозватьКлючПриёма(вид: ВидЗаведения, id: string): Promise<void> {
  await ключи.update((все) => [
    Object.fromEntries(Object.entries(все).filter(([, з]) => !(з.вид === вид && з.id === id))),
    undefined,
  ]);
}

/** Чей это ключ. Сравниваем хеши — сам ключ нигде не лежит. */
export async function заведениеПоКлючу(ключ: string): Promise<Заведение | null> {
  if (!/^hz_[A-Za-z0-9_-]{20,}$/.test(ключ)) return null;
  return (await ключи.read())[хеш(ключ)] ?? null;
}

/** Для панели: выдан ли ключ и когда система последний раз присылала цифры. */
export async function состояниеПриёма(
  вид: ВидЗаведения,
  id: string,
): Promise<{ ключВыдан: string | null; последнееОбновление: string | null }> {
  const [все, наличия] = await Promise.all([ключи.read(), присланное.read()]);
  const з = Object.values(все).find((x) => x.вид === вид && x.id === id);
  return { ключВыдан: з?.выдан ?? null, последнееОбновление: наличия[имя(вид, id)]?.обновлено ?? null };
}

export async function сохранитьПрисланное(вид: ВидЗаведения, id: string, н: Наличие): Promise<void> {
  await присланное.update((все) => [{ ...все, [имя(вид, id)]: н }, undefined]);
}

/*
 * Присланное старше шести часов не показываем: система могла упасть, а
 * «свободно 3 номера» с утра к вечеру — уже неправда, и турист поверит.
 */
const СВЕЖЕСТЬ_МС = 6 * 60 * 60 * 1000;

export async function присланноеНаличие(
  вид: ВидЗаведения,
  id: string,
  сейчас = Date.now(),
): Promise<Наличие | null> {
  const н = (await присланное.read())[имя(вид, id)];
  if (!н) return null;
  const когда = Date.parse(н.обновлено);
  return Number.isFinite(когда) && сейчас - когда <= СВЕЖЕСТЬ_МС ? н : null;
}
